"""
Health check endpoints for monitoring and readiness
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx
import redis
from datetime import datetime
import json
import os

from app.models.database import get_db

router = APIRouter()

def get_redis():
    """Get Redis connection"""
    return redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

@router.get("/healthz")
async def health_check():
    """Basic health check - fast response for load balancer"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/readyz")
async def readiness_check(
    db: Session = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis)
):
    """Comprehensive readiness check - validates all dependencies"""
    checks = {}
    all_healthy = True
    
    # Database connectivity
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
        all_healthy = False
    
    # Redis connectivity
    try:
        redis_client.ping()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {str(e)}"
        all_healthy = False
    
    # Qdrant connectivity (optional)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://qdrant:6333/health", timeout=2.0)
            if response.status_code == 200:
                checks["qdrant"] = "healthy"
            else:
                checks["qdrant"] = f"unhealthy: status {response.status_code}"
                all_healthy = False
    except Exception as e:
        checks["qdrant"] = f"unhealthy: {str(e)}"
        # Qdrant is optional, don't fail readiness
    
    # Worker queue health
    try:
        queue_size = redis_client.llen("celery")
        checks["worker_queue"] = f"healthy (queue_size: {queue_size})"
    except Exception as e:
        checks["worker_queue"] = f"unhealthy: {str(e)}"
        all_healthy = False
    
    # Check disk space
    try:
        import shutil
        total, used, free = shutil.disk_usage("/")
        free_gb = free // (2**30)
        if free_gb < 1:
            checks["disk_space"] = f"warning: only {free_gb}GB free"
        else:
            checks["disk_space"] = f"healthy ({free_gb}GB free)"
    except Exception as e:
        checks["disk_space"] = f"unknown: {str(e)}"
    
    status_code = 200 if all_healthy else 503
    
    return Response(
        content=json.dumps({
            "status": "ready" if all_healthy else "not_ready",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat()
        }),
        status_code=status_code,
        media_type="application/json"
    )

@router.get("/livez")
async def liveness_check():
    """Liveness probe for Kubernetes"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }