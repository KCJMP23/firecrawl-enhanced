"""
WebHarvest Worker - Celery Application
Handles background scraping and crawling tasks
"""

from celery import Celery
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", f"{REDIS_URL}/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", f"{REDIS_URL}/1")

# Create Celery app
app = Celery(
    "webharvest",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.scraping",
        "app.tasks.crawling",
        "app.tasks.batch",
        "app.tasks.mapping"
    ]
)

# Celery configuration
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
    result_expires=3600,  # 1 hour
    broker_connection_retry_on_startup=True,
)

# Task routing
app.conf.task_routes = {
    "app.tasks.scraping.*": {"queue": "scraping"},
    "app.tasks.crawling.*": {"queue": "crawling"},
    "app.tasks.batch.*": {"queue": "batch"},
    "app.tasks.mapping.*": {"queue": "mapping"},
}

# Beat schedule for periodic tasks
app.conf.beat_schedule = {
    "cleanup-expired-cache": {
        "task": "app.tasks.maintenance.cleanup_expired_cache",
        "schedule": 3600.0,  # Every hour
    },
    "process-scheduled-jobs": {
        "task": "app.tasks.maintenance.process_scheduled_jobs",
        "schedule": 60.0,  # Every minute
    },
}

if __name__ == "__main__":
    app.start()