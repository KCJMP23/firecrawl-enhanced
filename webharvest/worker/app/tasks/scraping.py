"""
Celery tasks for web scraping operations
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from celery import Task
from app.main import app
from app.scraping.scraper import WebScraper
from app.scraping.crawler import WebCrawler, URLNormalizer
from app.scraping.extractor import ContentExtractor
from app.utils.database import get_db_session, update_crawl_job, update_crawl_page, update_batch_job

logger = logging.getLogger(__name__)

class ScrapingTask(Task):
    """Base class for scraping tasks with shared resources"""
    _scraper = None
    
    @property
    def scraper(self):
        if self._scraper is None:
            self._scraper = WebScraper()
        return self._scraper


@app.task(base=ScrapingTask, bind=True, name='scraping.scrape_url')
def scrape_url_task(
    self,
    url: str,
    formats: List[str] = ["markdown"],
    only_main_content: bool = True,
    include_tags: Optional[List[str]] = None,
    exclude_tags: Optional[List[str]] = None,
    headers: Optional[Dict[str, str]] = None,
    wait_for: Optional[int] = None,
    mobile: bool = False,
    timeout: int = 30000,
    actions: Optional[List[Dict[str, Any]]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Scrape a single URL
    
    Args:
        url: URL to scrape
        formats: Output formats to generate
        only_main_content: Extract only main content
        include_tags: Tags to include
        exclude_tags: Tags to exclude
        headers: Custom headers
        wait_for: Wait time after page load
        mobile: Use mobile viewport
        timeout: Page load timeout
        actions: Browser actions to execute
        
    Returns:
        Scraping result dictionary
    """
    logger.info(f"Starting scrape task for {url}")
    
    # Run async scraper in sync context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(
            self.scraper.scrape(
                url=url,
                formats=formats,
                only_main_content=only_main_content,
                include_tags=include_tags,
                exclude_tags=exclude_tags,
                headers=headers,
                wait_for=wait_for,
                mobile=mobile,
                timeout=timeout,
                actions=actions
            )
        )
        
        logger.info(f"Scrape completed for {url}: success={result.get('success')}")
        return result
        
    except Exception as e:
        logger.error(f"Error in scrape task for {url}: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "url": url
        }
    finally:
        loop.close()


@app.task(bind=True, name='scraping.crawl_website')
def crawl_website_task(
    self,
    crawl_job_id: str,
    seed_url: str,
    max_depth: int = 3,
    max_pages: int = 100,
    include_paths: Optional[List[str]] = None,
    exclude_paths: Optional[List[str]] = None,
    allow_external_links: bool = False,
    allow_subdomains: bool = False,
    ignore_query_params: bool = False,
    scrape_options: Optional[Dict[str, Any]] = None,
    delay_ms: int = 250,
    max_concurrency: int = 5,
    **kwargs
) -> Dict[str, Any]:
    """
    Crawl a website and scrape all discovered pages
    
    Args:
        crawl_job_id: Database job ID
        seed_url: Starting URL
        max_depth: Maximum crawl depth
        max_pages: Maximum pages to crawl
        include_paths: Path patterns to include
        exclude_paths: Path patterns to exclude
        allow_external_links: Allow external domains
        allow_subdomains: Allow subdomains
        ignore_query_params: Ignore query parameters
        scrape_options: Options for each page scrape
        delay_ms: Delay between requests
        max_concurrency: Maximum concurrent requests
        
    Returns:
        Crawl result summary
    """
    logger.info(f"Starting crawl task for {seed_url} (job: {crawl_job_id})")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    crawler = WebCrawler(
        seed_url=seed_url,
        max_depth=max_depth,
        max_pages=max_pages,
        include_patterns=include_paths,
        exclude_patterns=exclude_paths,
        allow_external_links=allow_external_links,
        allow_subdomains=allow_subdomains,
        ignore_query_params=ignore_query_params
    )
    
    scraper = WebScraper()
    scrape_options = scrape_options or {"formats": ["markdown"]}
    
    # Update job status to scraping
    with get_db_session() as db:
        update_crawl_job(db, crawl_job_id, {
            "status": "scraping",
            "started_at": datetime.utcnow()
        })
    
    completed = 0
    failed = 0
    discovered = 0
    
    try:
        # Discover and scrape URLs
        async def crawl():
            nonlocal completed, failed, discovered
            
            async for url in crawler.discover_urls():
                discovered += 1
                
                # Update progress
                with get_db_session() as db:
                    update_crawl_job(db, crawl_job_id, {
                        "total_discovered": discovered
                    })
                
                # Scrape the URL
                try:
                    result = await scraper.scrape(url=url, **scrape_options)
                    
                    if result.get("success"):
                        completed += 1
                        
                        # Save page result
                        with get_db_session() as db:
                            update_crawl_page(db, {
                                "crawl_job_id": crawl_job_id,
                                "url": url,
                                "normalized_url": URLNormalizer.normalize(url),
                                "status_code": result["data"]["metadata"].get("statusCode", 0),
                                "markdown": result["data"].get("markdown"),
                                "html": result["data"].get("html"),
                                "metadata": result["data"].get("metadata", {}),
                                "content_hash": result["data"].get("contentHash")
                            })
                    else:
                        failed += 1
                        logger.error(f"Failed to scrape {url}: {result.get('error')}")
                    
                except Exception as e:
                    failed += 1
                    logger.error(f"Error scraping {url}: {e}", exc_info=True)
                
                # Update progress
                with get_db_session() as db:
                    update_crawl_job(db, crawl_job_id, {
                        "completed": completed,
                        "failed": failed
                    })
                
                # Add delay between requests
                await asyncio.sleep(delay_ms / 1000.0)
                
                # Extract links from scraped page for crawling
                if result.get("success") and result["data"].get("links"):
                    crawler.add_discovered_urls(
                        result["data"]["links"],
                        crawler.depth_map.get(url, 0)
                    )
        
        # Run the crawl
        loop.run_until_complete(crawl())
        
        # Update job as completed
        with get_db_session() as db:
            update_crawl_job(db, crawl_job_id, {
                "status": "completed",
                "finished_at": datetime.utcnow(),
                "total_discovered": discovered,
                "completed": completed,
                "failed": failed
            })
        
        logger.info(f"Crawl completed for {seed_url}: {completed} pages scraped, {failed} failed")
        
        return {
            "success": True,
            "crawl_job_id": crawl_job_id,
            "discovered": discovered,
            "completed": completed,
            "failed": failed
        }
        
    except Exception as e:
        logger.error(f"Error in crawl task: {e}", exc_info=True)
        
        # Update job as failed
        with get_db_session() as db:
            update_crawl_job(db, crawl_job_id, {
                "status": "failed",
                "finished_at": datetime.utcnow(),
                "error": str(e)
            })
        
        return {
            "success": False,
            "error": str(e),
            "crawl_job_id": crawl_job_id
        }
    
    finally:
        loop.close()


@app.task(bind=True, name='scraping.batch_scrape')
def batch_scrape_task(
    self,
    batch_job_id: str,
    urls: List[str],
    scrape_options: Optional[Dict[str, Any]] = None,
    max_concurrency: int = 10,
    ignore_invalid_urls: bool = False,
    **kwargs
) -> Dict[str, Any]:
    """
    Scrape multiple URLs in batch
    
    Args:
        batch_job_id: Database job ID
        urls: List of URLs to scrape
        scrape_options: Options for each scrape
        max_concurrency: Maximum concurrent scrapes
        ignore_invalid_urls: Skip invalid URLs
        
    Returns:
        Batch result summary
    """
    logger.info(f"Starting batch scrape task for {len(urls)} URLs (job: {batch_job_id})")
    
    # Update job status
    with get_db_session() as db:
        update_batch_job(db, batch_job_id, {
            "status": "processing",
            "started_at": datetime.utcnow()
        })
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    scraper = WebScraper()
    scrape_options = scrape_options or {"formats": ["markdown"]}
    
    completed = 0
    failed = 0
    results = []
    
    try:
        async def batch_scrape():
            nonlocal completed, failed
            
            tasks = []
            for url in urls:
                # Validate URL
                if not URLNormalizer.is_valid_url(url):
                    if not ignore_invalid_urls:
                        failed += 1
                        results.append({
                            "url": url,
                            "success": False,
                            "error": "Invalid URL"
                        })
                    continue
                
                # Create scrape task
                task = scraper.scrape(url=url, **scrape_options)
                tasks.append((url, task))
            
            # Execute with controlled concurrency
            for i in range(0, len(tasks), max_concurrency):
                batch = tasks[i:i + max_concurrency]
                batch_results = await asyncio.gather(
                    *[task for _, task in batch],
                    return_exceptions=True
                )
                
                for j, (url, _) in enumerate(batch):
                    result = batch_results[j]
                    
                    if isinstance(result, Exception):
                        failed += 1
                        results.append({
                            "url": url,
                            "success": False,
                            "error": str(result)
                        })
                    elif result.get("success"):
                        completed += 1
                        results.append(result)
                    else:
                        failed += 1
                        results.append(result)
                    
                    # Update progress
                    with get_db_session() as db:
                        update_batch_job(db, batch_job_id, {
                            "completed": completed,
                            "failed": failed
                        })
        
        # Run batch scrape
        loop.run_until_complete(batch_scrape())
        
        # Update job as completed
        with get_db_session() as db:
            update_batch_job(db, batch_job_id, {
                "status": "completed",
                "finished_at": datetime.utcnow(),
                "completed": completed,
                "failed": failed
            })
        
        logger.info(f"Batch scrape completed: {completed} succeeded, {failed} failed")
        
        return {
            "success": True,
            "batch_job_id": batch_job_id,
            "total": len(urls),
            "completed": completed,
            "failed": failed,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error in batch scrape task: {e}", exc_info=True)
        
        # Update job as failed
        with get_db_session() as db:
            update_batch_job(db, batch_job_id, {
                "status": "failed",
                "finished_at": datetime.utcnow(),
                "error": str(e)
            })
        
        return {
            "success": False,
            "error": str(e),
            "batch_job_id": batch_job_id
        }
    
    finally:
        loop.close()