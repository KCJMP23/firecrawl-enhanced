"""
Crawling endpoints - Firecrawl v2 compatible
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.database import get_db, CrawlJob
from app.utils.auth import verify_api_key
from app.services.task_manager import TaskManager

router = APIRouter()
task_manager = TaskManager()

class CrawlRequest(BaseModel):
    """Request model for crawl endpoint"""
    url: HttpUrl
    excludePaths: Optional[List[str]] = Field(default=None)
    includePaths: Optional[List[str]] = Field(default=None)
    maxDiscoveryDepth: int = Field(default=10)
    sitemap: str = Field(default="include")  # include, ignore, only
    ignoreQueryParameters: bool = Field(default=False)
    limit: int = Field(default=5000)
    crawlEntireDomain: bool = Field(default=False)
    allowExternalLinks: bool = Field(default=False)
    allowSubdomains: bool = Field(default=False)
    delay: int = Field(default=250)
    maxConcurrency: int = Field(default=5)
    webhook: Optional[Dict[str, Any]] = Field(default=None)
    scrapeOptions: Optional[Dict[str, Any]] = Field(default=None)

@router.post("/crawl")
async def start_crawl(
    request: CrawlRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Start a crawl job"""
    api_key = verify_api_key(authorization, db)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    # Create crawl job
    crawl_job = CrawlJob(
        id=uuid.uuid4(),
        seed_url=str(request.url),
        request_json=request.dict(),
        status="queued",
        created_by=api_key
    )
    db.add(crawl_job)
    db.commit()
    
    # Queue crawl task with Celery
    task_manager.queue_crawl(
        crawl_job_id=str(crawl_job.id),
        seed_url=str(request.url),
        max_depth=request.maxDiscoveryDepth,
        max_pages=request.limit,
        include_paths=request.includePaths,
        exclude_paths=request.excludePaths,
        allow_external_links=request.allowExternalLinks,
        allow_subdomains=request.allowSubdomains,
        ignore_query_params=request.ignoreQueryParameters,
        scrape_options=request.scrapeOptions,
        delay_ms=request.delay,
        max_concurrency=request.maxConcurrency
    )
    
    return {
        "success": True,
        "id": str(crawl_job.id),
        "url": f"/v2/crawl/{crawl_job.id}"
    }

@router.get("/crawl/{crawl_id}")
async def get_crawl_status(
    crawl_id: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get crawl job status and results"""
    api_key = verify_api_key(authorization, db)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    # Get crawl job from database
    crawl_job = db.query(CrawlJob).filter(CrawlJob.id == crawl_id).first()
    if not crawl_job:
        raise HTTPException(status_code=404, detail="Crawl job not found")
    
    return {
        "success": True,
        "status": crawl_job.status,
        "total": crawl_job.total_discovered,
        "completed": crawl_job.completed,
        "failed": crawl_job.failed,
        "data": []  # TODO: Add actual page results
    }

@router.delete("/crawl/{crawl_id}")
async def cancel_crawl(
    crawl_id: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Cancel a crawl job"""
    api_key = verify_api_key(authorization, db)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    # TODO: Implement cancellation
    
    return {
        "success": True,
        "message": "Crawl job canceled"
    }