"""
Authentication utilities for API key validation
"""

import hashlib
import os
import secrets
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

def hash_api_key(api_key: str) -> str:
    """Hash an API key using SHA256 with salt"""
    salt = os.getenv("API_KEY_SALT", "default_salt_change_in_production")
    return hashlib.sha256((api_key + salt).encode()).hexdigest()

def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"wh_{secrets.token_urlsafe(32)}"

def validate_environment() -> bool:
    """Validate required environment variables"""
    required_vars = ["DATABASE_URL", "API_KEY_SALT"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        return False
    return True

def verify_api_key(authorization: Optional[str], db: Session) -> Optional[str]:
    """
    Verify API key from Authorization header against database
    Returns the API key if valid, None otherwise
    """
    if not authorization:
        logger.warning("No authorization header provided")
        return None
    
    # Validate environment first
    if not validate_environment():
        logger.error("Environment validation failed")
        return None
    
    # Check for Bearer token format
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid authorization format - must be Bearer token")
        return None
    
    api_key = authorization.replace("Bearer ", "").strip()
    
    if not api_key:
        logger.warning("Empty API key provided")
        return None
    
    # Validate API key format
    if not api_key.startswith("wh_"):
        logger.warning("Invalid API key format - must start with 'wh_'")
        return None
    
    try:
        # Import here to avoid circular imports
        from ..models.database import APIKey
        
        # Look up API key in database
        key_hash = hash_api_key(api_key)
        db_key = db.query(APIKey).filter(
            APIKey.key_hash == key_hash,
            APIKey.is_active == True
        ).first()
        
        if not db_key:
            logger.warning(f"Invalid or inactive API key attempted")
            return None
        
        # Update last used timestamp
        db_key.last_used_at = datetime.now(timezone.utc)
        db.commit()
        
        logger.info(f"API key validated successfully for key ID: {db_key.id}")
        return api_key
        
    except Exception as e:
        logger.error(f"Error validating API key: {e}")
        return None