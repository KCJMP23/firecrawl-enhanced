"""
Site mapping endpoints - Firecrawl v2 compatible
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.utils.auth import verify_api_key

router = APIRouter()

class MapRequest(BaseModel):
    """Request model for map endpoint"""
    url: HttpUrl
    search: Optional[str] = Field(default=None, description="Search term to filter URLs")
    limit: int = Field(default=5000, le=100000)
    ignoreSitemap: bool = Field(default=False)
    sitemapOnly: bool = Field(default=False)

@router.post("/map")
async def map_site(
    request: MapRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Map a website and return all discovered URLs
    Fast discovery without content extraction
    """
    api_key = verify_api_key(authorization, db)
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    # TODO: Implement actual site mapping
    # For now, return mock data
    
    mock_links = [
        str(request.url),
        f"{request.url}/docs",
        f"{request.url}/api",
        f"{request.url}/about"
    ]
    
    # Filter by search term if provided
    if request.search:
        mock_links = [link for link in mock_links if request.search.lower() in link.lower()]
    
    # Apply limit
    mock_links = mock_links[:request.limit]
    
    return {
        "success": True,
        "links": mock_links,
        "metadata": {
            "total": len(mock_links),
            "truncated": False,
            "sitemapFound": False
        }
    }