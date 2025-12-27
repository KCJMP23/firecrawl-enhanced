"""
Batch scraping endpoints - Firecrawl v2 compatible
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from sqlalchemy.orm import Session

from app.models.database import get_db, BatchJob
from app.utils.auth import verify_api_key

router = APIRouter()

class BatchScrapeRequest(BaseModel):
    """Request model for batch scrape endpoint"""
    urls: List[str]
    ignoreInvalidURLs: bool = Field(default=False)
    maxConcurrency: int = Field(default=10)
    scrapeOptions: Optional[Dict[str, Any]] = Field(default=None)
    webhook: Optional[Dict[str, Any]] = Field(default=None)

@router.post("/batch/scrape")
async def start_batch_scrape(
    request: BatchScrapeRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Start a batch scrape job"""
    api_key = verify_api_key(authorization, db)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    # Validate URLs
    valid_urls = []
    invalid_urls = []
    
    for url in request.urls:
        # TODO: Proper URL validation
        if url.startswith("http://") or url.startswith("https://"):
            valid_urls.append(url)
        else:
            invalid_urls.append(url)
    
    if not valid_urls:
        raise HTTPException(status_code=400, detail="No valid URLs provided")
    
    # Create batch job
    batch_job = BatchJob(
        id=uuid.uuid4(),
        urls=valid_urls,
        request_json=request.dict(),
        status="queued",
        total_urls=len(valid_urls),
        created_by=api_key
    )
    db.add(batch_job)
    db.commit()
    
    # TODO: Queue batch task with Celery
    
    return {
        "success": True,
        "id": str(batch_job.id),
        "url": f"/v2/batch/scrape/{batch_job.id}",
        "invalidURLs": invalid_urls if invalid_urls else None
    }

@router.get("/batch/scrape/{batch_id}")
async def get_batch_status(
    batch_id: str,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get batch scrape job status and results"""
    api_key = verify_api_key(authorization, db)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    # Get batch job from database
    batch_job = db.query(BatchJob).filter(BatchJob.id == batch_id).first()
    if not batch_job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    
    return {
        "success": True,
        "status": batch_job.status,
        "total": batch_job.total_urls,
        "completed": batch_job.completed,
        "failed": batch_job.failed,
        "data": []  # TODO: Add actual results
    }