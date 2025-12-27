"""
Database models and connection management
"""

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Text, JSON, ARRAY, Float
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
import os
import uuid
from typing import Optional
from contextlib import asynccontextmanager

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://webharvest:password@localhost:5432/webharvest")

# Create engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=20, max_overflow=40)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Database models

class Project(Base):
    """Project configuration and settings"""
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    openwebui_collection_id = Column(String(255))
    sync_mode = Column(String(50), default="bundle_zip")
    domain_allowlist = Column(ARRAY(String), default=[])
    domain_denylist = Column(ARRAY(String), default=[])
    max_pages_per_crawl = Column(Integer, default=10000)
    rate_limit_per_domain = Column(Integer, default=2)
    rate_limit_delay_ms = Column(Integer, default=500)

class CrawlJob(Base):
    """Crawl job tracking"""
    __tablename__ = "crawl_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True))
    seed_url = Column(Text, nullable=False)
    request_json = Column(JSON, nullable=False)
    status = Column(String(50), default="queued")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True))
    finished_at = Column(DateTime(timezone=True))
    total_discovered = Column(Integer, default=0)
    completed = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    canceled = Column(Boolean, default=False)
    error = Column(Text)
    webhook_url = Column(Text)
    created_by = Column(String(255))

class CrawlPage(Base):
    """Individual page results from crawls"""
    __tablename__ = "crawl_pages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crawl_job_id = Column(UUID(as_uuid=True), nullable=False)
    url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=False)
    status_code = Column(Integer)
    markdown = Column(Text)
    html = Column(Text)
    raw_html = Column(Text)
    links = Column(ARRAY(String), default=[])
    images = Column(ARRAY(String), default=[])
    metadata = Column(JSON, default={})
    content_hash = Column(String(255))
    error = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processing_time_ms = Column(Integer)

class ScrapeCache(Base):
    """Cache for scrape results"""
    __tablename__ = "scrape_cache"
    
    cache_key = Column(String(255), primary_key=True)
    url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=False)
    request_hash = Column(String(255), nullable=False)
    response_json = Column(JSON, nullable=False)
    content_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

class BatchJob(Base):
    """Batch scrape job tracking"""
    __tablename__ = "batch_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True))
    urls = Column(ARRAY(String), nullable=False)
    request_json = Column(JSON, nullable=False)
    status = Column(String(50), default="queued")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True))
    finished_at = Column(DateTime(timezone=True))
    total_urls = Column(Integer, nullable=False)
    completed = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    webhook_url = Column(Text)
    created_by = Column(String(255))

class BatchResult(Base):
    """Results from batch scrape jobs"""
    __tablename__ = "batch_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_job_id = Column(UUID(as_uuid=True), nullable=False)
    url = Column(Text, nullable=False)
    status_code = Column(Integer)
    markdown = Column(Text)
    html = Column(Text)
    metadata = Column(JSON, default={})
    content_hash = Column(String(255))
    error = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    """Audit logging for all operations"""
    __tablename__ = "audit_log"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    target = Column(Text, nullable=False)
    metadata = Column(JSON, default={})
    ip_address = Column(INET)
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScheduledJob(Base):
    """Scheduled crawl and batch jobs"""
    __tablename__ = "scheduled_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True))
    job_type = Column(String(50), nullable=False)
    cron_schedule = Column(String(255), nullable=False)
    job_config = Column(JSON, nullable=False)
    webhook_url = Column(Text)
    enabled = Column(Boolean, default=True)
    last_run_at = Column(DateTime(timezone=True))
    next_run_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(255))

class APIKey(Base):
    """API key management for authentication"""
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False)
    key_prefix = Column(String(20), nullable=False)  # First 8 chars for display
    permissions = Column(ARRAY(String), default=["read", "write"])
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    last_used_at = Column(DateTime(timezone=True))
    usage_count = Column(Integer, default=0)
    rate_limit_per_minute = Column(Integer, default=60)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(255))
    metadata = Column(JSON, default={})

# Database initialization
async def init_db():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        return True
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        return False

# Dependency for FastAPI
def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async context manager for database sessions
@asynccontextmanager
async def get_async_db():
    """Async database session context manager"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()