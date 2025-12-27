"""
WebHarvest API Service
Main FastAPI application entry point
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import os

from app.api import scrape, crawl, batch, map, health, mcp_enhanced
from app.models.database import init_db
from app.utils.logging import setup_logging

# Setup logging
logger = setup_logging()

# Prometheus metrics
request_count = Counter(
    'webharvest_requests_total',
    'Total number of requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'webharvest_request_duration_seconds',
    'Request duration in seconds',
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]
)

active_crawls = Gauge(
    'webharvest_active_crawls',
    'Number of active crawl jobs'
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info("Starting WebHarvest API service")
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down WebHarvest API service")

# Create FastAPI app
app = FastAPI(
    title="WebHarvest API",
    description="Self-hosted web scraping platform with AI integration",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for metrics collection
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Collect metrics for all requests"""
    if request.url.path == "/metrics":
        return await call_next(request)
    
    start_time = time.time()
    
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Record metrics
        request_count.labels(
            method=request.method,
            endpoint=request.url.path,
            status=f"{response.status_code//100}xx"
        ).inc()
        request_duration.observe(duration)
        
        # Add timing header
        response.headers["X-Response-Time"] = f"{duration:.3f}"
        return response
        
    except Exception as e:
        duration = time.time() - start_time
        request_count.labels(
            method=request.method,
            endpoint=request.url.path,
            status="5xx"
        ).inc()
        request_duration.observe(duration)
        
        logger.error(f"Request failed: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": str(e) if os.getenv("DEBUG") == "true" else "An error occurred"
            }
        )

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(scrape.router, prefix="/v2", tags=["Scraping"])
app.include_router(crawl.router, prefix="/v2", tags=["Crawling"])
app.include_router(map.router, prefix="/v2", tags=["Mapping"])
app.include_router(batch.router, prefix="/v2", tags=["Batch"])
app.include_router(mcp_enhanced.router, prefix="/mcp", tags=["MCP"])

# Metrics endpoint
@app.get("/metrics", include_in_schema=False)
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "WebHarvest API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "scrape": "/v2/scrape",
            "crawl": "/v2/crawl",
            "map": "/v2/map",
            "batch": "/v2/batch/scrape",
            "health": "/healthz",
            "metrics": "/metrics",
            "mcp": "/mcp"
        },
        "documentation": "/docs"
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": "Not found",
            "message": f"The requested endpoint {request.url.path} does not exist"
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,
        reload=os.getenv("RELOAD", "false").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )