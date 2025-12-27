"""
Scraping endpoints - Firecrawl v2 compatible
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import hashlib
import json
from sqlalchemy.orm import Session

from app.models.database import get_db, ScrapeCache
from app.services.scraper import ScrapeService
from app.utils.auth import verify_api_key

router = APIRouter()

class ScrapeRequest(BaseModel):
    """Request model for scraping endpoint"""
    url: HttpUrl
    formats: List[str] = Field(default=["markdown"], description="Output formats")
    onlyMainContent: bool = Field(default=True, description="Extract only main content")
    includeTags: Optional[List[str]] = Field(default=None, description="HTML tags to include")
    excludeTags: Optional[List[str]] = Field(default=None, description="HTML tags to exclude")
    headers: Optional[Dict[str, str]] = Field(default=None, description="Custom headers")
    waitFor: Optional[int] = Field(default=None, description="Wait time in milliseconds")
    mobile: bool = Field(default=False, description="Use mobile viewport")
    timeout: int = Field(default=30000, description="Timeout in milliseconds")
    maxAge: int = Field(default=172800000, description="Cache max age in milliseconds")
    actions: Optional[List[Dict[str, Any]]] = Field(default=None, description="Browser actions")

class ScrapeResponse(BaseModel):
    """Response model for scraping endpoint"""
    success: bool
    data: Dict[str, Any]
    warning: Optional[str] = None

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_url(
    request: ScrapeRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Scrape a single URL and return content in requested formats
    
    Formats supported:
    - markdown: Clean markdown content
    - html: Cleaned HTML
    - rawHtml: Original HTML
    - links: Extracted links
    - images: Extracted images
    - screenshot: Page screenshot
    """
    
    # Verify API key
    api_key = verify_api_key(authorization, db)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    try:
        # Generate cache key
        cache_key_data = {
            "url": str(request.url),
            "formats": sorted(request.formats),
            "onlyMainContent": request.onlyMainContent,
            "includeTags": request.includeTags,
            "excludeTags": request.excludeTags,
            "mobile": request.mobile
        }
        cache_key = hashlib.md5(json.dumps(cache_key_data, sort_keys=True).encode()).hexdigest()
        
        # Check cache if maxAge > 0
        if request.maxAge > 0:
            cached = db.query(ScrapeCache).filter(
                ScrapeCache.cache_key == cache_key,
                ScrapeCache.expires_at > datetime.utcnow()
            ).first()
            
            if cached:
                return ScrapeResponse(
                    success=True,
                    data=cached.response_json,
                    warning="Served from cache"
                )
        
        # Initialize scraper service
        scraper = ScrapeService(db)
        
        # Perform scraping
        result = await scraper.scrape_url(
            url=str(request.url),
            formats=request.formats,
            only_main_content=request.onlyMainContent,
            include_tags=request.includeTags,
            exclude_tags=request.excludeTags,
            headers=request.headers,
            wait_for=request.waitFor,
            mobile=request.mobile,
            timeout=request.timeout,
            actions=request.actions
        )
        
        # Cache the result if successful
        if result.get("success") and request.maxAge > 0:
            cache_entry = ScrapeCache(
                cache_key=cache_key,
                url=str(request.url),
                normalized_url=result["data"].get("metadata", {}).get("sourceURL", str(request.url)),
                request_hash=cache_key,
                response_json=result["data"],
                content_hash=hashlib.md5(
                    result["data"].get("markdown", "").encode()
                ).hexdigest(),
                expires_at=datetime.utcnow() + timedelta(milliseconds=request.maxAge)
            )
            db.add(cache_entry)
            db.commit()
        
        return ScrapeResponse(
            success=result.get("success", False),
            data=result.get("data", {}),
            warning=result.get("warning")
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Scraping failed",
                "message": str(e)
            }
        )