"""
Task manager for queuing and managing Celery tasks
"""

import logging
from typing import Dict, Any, List, Optional
from celery import Celery
import os

logger = logging.getLogger(__name__)

# Celery configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", f"{REDIS_URL}/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", f"{REDIS_URL}/1")

# Create Celery client
celery_app = Celery(
    "webharvest",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

class TaskManager:
    """Manage background tasks with Celery"""
    
    @staticmethod
    def queue_scrape(
        url: str,
        formats: List[str],
        **options
    ) -> str:
        """
        Queue a scrape task
        
        Args:
            url: URL to scrape
            formats: Output formats
            **options: Additional scraping options
            
        Returns:
            Task ID
        """
        task = celery_app.send_task(
            "scraping.scrape_url",
            args=[],
            kwargs={
                "url": url,
                "formats": formats,
                **options
            }
        )
        
        logger.info(f"Queued scrape task {task.id} for {url}")
        return task.id
    
    @staticmethod
    def queue_crawl(
        crawl_job_id: str,
        seed_url: str,
        **options
    ) -> str:
        """
        Queue a crawl task
        
        Args:
            crawl_job_id: Database job ID
            seed_url: Starting URL
            **options: Crawl options
            
        Returns:
            Task ID
        """
        task = celery_app.send_task(
            "scraping.crawl_website",
            args=[],
            kwargs={
                "crawl_job_id": crawl_job_id,
                "seed_url": seed_url,
                **options
            }
        )
        
        logger.info(f"Queued crawl task {task.id} for job {crawl_job_id}")
        return task.id
    
    @staticmethod
    def queue_batch_scrape(
        batch_job_id: str,
        urls: List[str],
        **options
    ) -> str:
        """
        Queue a batch scrape task
        
        Args:
            batch_job_id: Database job ID
            urls: List of URLs
            **options: Scrape options
            
        Returns:
            Task ID
        """
        task = celery_app.send_task(
            "scraping.batch_scrape",
            args=[],
            kwargs={
                "batch_job_id": batch_job_id,
                "urls": urls,
                **options
            }
        )
        
        logger.info(f"Queued batch scrape task {task.id} for job {batch_job_id}")
        return task.id
    
    @staticmethod
    def get_task_status(task_id: str) -> Dict[str, Any]:
        """
        Get status of a task
        
        Args:
            task_id: Celery task ID
            
        Returns:
            Task status dictionary
        """
        task = celery_app.AsyncResult(task_id)
        
        return {
            "task_id": task_id,
            "status": task.status,
            "result": task.result if task.ready() else None,
            "ready": task.ready(),
            "successful": task.successful() if task.ready() else None,
            "failed": task.failed() if task.ready() else None
        }
    
    @staticmethod
    def cancel_task(task_id: str) -> bool:
        """
        Cancel a task
        
        Args:
            task_id: Celery task ID
            
        Returns:
            True if cancelled
        """
        try:
            celery_app.control.revoke(task_id, terminate=True)
            logger.info(f"Cancelled task {task_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to cancel task {task_id}: {e}")
            return False
    
    @staticmethod
    def get_queue_stats() -> Dict[str, Any]:
        """
        Get queue statistics
        
        Returns:
            Queue stats dictionary
        """
        try:
            inspect = celery_app.control.inspect()
            
            # Get various stats
            active = inspect.active()
            reserved = inspect.reserved()
            stats = inspect.stats()
            
            # Count tasks
            active_count = sum(len(tasks) for tasks in (active or {}).values())
            reserved_count = sum(len(tasks) for tasks in (reserved or {}).values())
            
            return {
                "active_tasks": active_count,
                "reserved_tasks": reserved_count,
                "workers": len(active or {}),
                "stats": stats
            }
        except Exception as e:
            logger.error(f"Failed to get queue stats: {e}")
            return {
                "error": str(e)
            }