"""
Database utilities for worker tasks
"""

import os
import uuid
from contextlib import contextmanager
from datetime import datetime
from typing import Dict, Any
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://webharvest:password@localhost:5432/webharvest")

# Create engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models (simplified for worker)
Base = declarative_base()

@contextmanager
def get_db_session():
    """Get database session context manager"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def update_crawl_job(db: Session, job_id: str, updates: Dict[str, Any]):
    """Update crawl job in database"""
    try:
        # Simple SQL update (avoiding ORM complexity in worker)
        set_clause = ", ".join([f"{k} = :{k}" for k in updates.keys()])
        query = f"UPDATE crawl_jobs SET {set_clause} WHERE id = :job_id"
        
        params = {"job_id": job_id}
        params.update(updates)
        
        db.execute(query, params)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

def update_crawl_page(db: Session, page_data: Dict[str, Any]):
    """Insert or update crawl page result"""
    try:
        # Generate ID if not provided
        if "id" not in page_data:
            page_data["id"] = str(uuid.uuid4())
        
        # Insert new page result
        columns = ", ".join(page_data.keys())
        values = ", ".join([f":{k}" for k in page_data.keys()])
        query = f"INSERT INTO crawl_pages ({columns}) VALUES ({values})"
        
        db.execute(query, page_data)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

def update_batch_job(db: Session, job_id: str, updates: Dict[str, Any]):
    """Update batch job in database"""
    try:
        set_clause = ", ".join([f"{k} = :{k}" for k in updates.keys()])
        query = f"UPDATE batch_jobs SET {set_clause} WHERE id = :job_id"
        
        params = {"job_id": job_id}
        params.update(updates)
        
        db.execute(query, params)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

def save_batch_result(db: Session, batch_job_id: str, url: str, result: Dict[str, Any]):
    """Save individual batch scrape result"""
    try:
        result_data = {
            "id": str(uuid.uuid4()),
            "batch_job_id": batch_job_id,
            "url": url,
            "status_code": result.get("data", {}).get("metadata", {}).get("statusCode", 0),
            "markdown": result.get("data", {}).get("markdown"),
            "html": result.get("data", {}).get("html"),
            "metadata": result.get("data", {}).get("metadata", {}),
            "content_hash": result.get("data", {}).get("contentHash"),
            "error": result.get("error"),
            "created_at": datetime.utcnow()
        }
        
        columns = ", ".join(result_data.keys())
        values = ", ".join([f":{k}" for k in result_data.keys()])
        query = f"INSERT INTO batch_results ({columns}) VALUES ({values})"
        
        db.execute(query, result_data)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e