"""
Main scraper module that orchestrates the scraping process
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import os

from playwright.async_api import TimeoutError as PlaywrightTimeout
from app.scraping.browser import BrowserManager, BrowserPool
from app.scraping.extractor import ContentExtractor

logger = logging.getLogger(__name__)

class WebScraper:
    """Main web scraper class"""
    
    def __init__(self, browser_pool: Optional[BrowserPool] = None):
        self.browser_pool = browser_pool
        self.extractor = ContentExtractor()
    
    async def scrape(
        self,
        url: str,
        formats: List[str] = ["markdown"],
        only_main_content: bool = True,
        include_tags: Optional[List[str]] = None,
        exclude_tags: Optional[List[str]] = None,
        headers: Optional[Dict[str, str]] = None,
        cookies: Optional[List[Dict[str, Any]]] = None,
        wait_for: Optional[int] = None,
        mobile: bool = False,
        timeout: int = 30000,
        actions: Optional[List[Dict[str, Any]]] = None,
        block_resources: Optional[List[str]] = None,
        proxy: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Scrape a web page and extract content in requested formats
        
        Args:
            url: URL to scrape
            formats: List of output formats (markdown, html, rawHtml, links, images, screenshot)
            only_main_content: Extract only main content using readability
            include_tags: HTML tags to include
            exclude_tags: HTML tags to exclude
            headers: Custom HTTP headers
            cookies: Browser cookies
            wait_for: Wait time in milliseconds after page load
            mobile: Use mobile viewport
            timeout: Page load timeout
            actions: List of browser actions to execute
            block_resources: Resource types to block (image, media, font, etc.)
            proxy: Proxy configuration
            
        Returns:
            Dictionary with scraped content and metadata
        """
        
        browser = None
        context = None
        page = None
        start_time = datetime.utcnow()
        
        try:
            # Get browser from pool or create new one
            if self.browser_pool:
                browser = await self.browser_pool.acquire()
            else:
                browser = BrowserManager()
                await browser.start()
            
            # Create browser context
            context = await browser.create_context(
                mobile=mobile,
                headers=headers,
                cookies=cookies,
                proxy=proxy
            )
            
            # Create page
            page = await browser.create_page(context, block_resources)
            
            # Navigate to URL
            logger.info(f"Scraping URL: {url}")
            response = await page.goto(
                url,
                wait_until="networkidle" if not actions else "domcontentloaded",
                timeout=timeout
            )
            
            # Get status code
            status_code = response.status if response else 0
            
            # Wait if specified
            if wait_for:
                await asyncio.sleep(wait_for / 1000)
            
            # Execute actions if provided
            if actions:
                await browser.execute_actions(
                    page,
                    actions,
                    max_actions=int(os.getenv("MAX_ACTIONS_PER_REQUEST", "25")),
                    max_time=int(os.getenv("MAX_ACTION_TIME", "30000"))
                )
            
            # Get page content
            raw_html = await page.content()
            
            # Initialize result
            result = {
                "success": True,
                "data": {
                    "metadata": {
                        "sourceURL": url,
                        "statusCode": status_code,
                        "error": None
                    }
                }
            }
            
            # Extract metadata
            metadata = self.extractor.extract_metadata(raw_html, url)
            result["data"]["metadata"].update(metadata)
            
            # Process requested formats
            processed_html = raw_html
            
            # Apply tag filters if specified
            if include_tags or exclude_tags:
                processed_html = self.extractor.filter_by_tags(
                    raw_html,
                    include_tags,
                    exclude_tags
                )
            
            # Extract main content if requested
            if only_main_content:
                processed_html = self.extractor.extract_main_content(processed_html, url)
            
            # Generate requested formats
            if "rawHtml" in formats:
                result["data"]["rawHtml"] = raw_html
            
            if "html" in formats:
                result["data"]["html"] = processed_html
            
            if "markdown" in formats:
                markdown = self.extractor.html_to_markdown(processed_html, url)
                result["data"]["markdown"] = markdown
                result["data"]["contentHash"] = self.extractor.calculate_content_hash(markdown)
            
            if "links" in formats:
                result["data"]["links"] = self.extractor.extract_links(raw_html, url)
            
            if "images" in formats:
                result["data"]["images"] = self.extractor.extract_images(raw_html, url)
            
            if "screenshot" in formats:
                screenshot_dir = "/app/screenshots"
                os.makedirs(screenshot_dir, exist_ok=True)
                screenshot_path = f"{screenshot_dir}/{datetime.utcnow().timestamp()}.png"
                await page.screenshot(path=screenshot_path, full_page=True)
                result["data"]["screenshot"] = screenshot_path
                logger.info(f"Screenshot saved: {screenshot_path}")
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            result["data"]["metadata"]["processingTime"] = f"{processing_time:.2f}s"
            
            logger.info(f"Successfully scraped {url} in {processing_time:.2f}s")
            return result
            
        except PlaywrightTimeout:
            logger.error(f"Timeout while scraping {url}")
            return {
                "success": False,
                "error": "Page load timeout",
                "data": {
                    "metadata": {
                        "sourceURL": url,
                        "statusCode": 0,
                        "error": "Timeout"
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "data": {
                    "metadata": {
                        "sourceURL": url,
                        "statusCode": 0,
                        "error": str(e)
                    }
                }
            }
            
        finally:
            # Cleanup
            if page:
                await page.close()
            if context:
                await context.close()
            
            # Return browser to pool or stop it
            if self.browser_pool and browser:
                await self.browser_pool.release(browser)
            elif browser and not self.browser_pool:
                await browser.stop()


class ScraperPool:
    """Pool of scrapers for concurrent operations"""
    
    def __init__(self, size: int = 5):
        self.browser_pool = BrowserPool(size=size)
        self.semaphore = asyncio.Semaphore(size)
    
    async def __aenter__(self):
        await self.browser_pool.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.browser_pool.stop()
    
    async def scrape(self, **kwargs) -> Dict[str, Any]:
        """Scrape with concurrency control"""
        async with self.semaphore:
            scraper = WebScraper(self.browser_pool)
            return await scraper.scrape(**kwargs)
    
    async def scrape_batch(
        self,
        urls: List[str],
        scrape_options: Dict[str, Any] = None,
        max_concurrency: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Scrape multiple URLs concurrently
        
        Args:
            urls: List of URLs to scrape
            scrape_options: Options to pass to each scrape
            max_concurrency: Maximum concurrent scrapes
            
        Returns:
            List of scrape results
        """
        scrape_options = scrape_options or {}
        
        # Create tasks
        tasks = []
        for url in urls:
            task = self.scrape(url=url, **scrape_options)
            tasks.append(task)
        
        # Execute with controlled concurrency
        results = []
        for i in range(0, len(tasks), max_concurrency):
            batch = tasks[i:i + max_concurrency]
            batch_results = await asyncio.gather(*batch, return_exceptions=True)
            
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    logger.error(f"Error scraping {urls[i + j]}: {result}")
                    results.append({
                        "success": False,
                        "error": str(result),
                        "url": urls[i + j]
                    })
                else:
                    results.append(result)
        
        return results