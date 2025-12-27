"""
Rate limiting utilities using Redis
Implements per-domain rate limiting with exponential backoff
"""

import asyncio
import time
import logging
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import redis.asyncio as redis
import os

logger = logging.getLogger(__name__)

class RateLimitToken:
    """Token representing acquired rate limit permission"""
    
    def __init__(self, redis_client: redis.Redis, domain: str):
        self.redis_client = redis_client
        self.domain = domain
        self.acquired_at = time.time()
    
    async def release(self):
        """Release the rate limit token"""
        try:
            current_key = f"rate_limit:{self.domain}:current"
            await self.redis_client.decr(current_key)
        except Exception as e:
            logger.error(f"Error releasing rate limit token for {self.domain}: {e}")


class DomainRateLimiter:
    """
    Per-domain rate limiter with Redis backend
    Implements concurrent request limiting and exponential backoff
    """
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = None
        self.default_max_concurrent = int(os.getenv("DEFAULT_RATE_LIMIT_PER_DOMAIN", "2"))
        self.default_delay_ms = int(os.getenv("DEFAULT_DELAY_MS", "500"))
        self.backoff_multiplier = 2.0
        self.max_backoff_ms = 300000  # 5 minutes
        self.retry_after_cache: Dict[str, float] = {}
    
    async def connect(self):
        """Connect to Redis"""
        if not self.redis_client:
            self.redis_client = await redis.from_url(self.redis_url)
            logger.info("Connected to Redis for rate limiting")
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
            self.redis_client = None
    
    async def __aenter__(self):
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()
    
    def get_domain(self, url: str) -> str:
        """Extract domain from URL"""
        parsed = urlparse(url)
        return parsed.netloc.lower()
    
    async def acquire(
        self,
        url: str,
        max_concurrent: Optional[int] = None,
        delay_ms: Optional[int] = None,
        timeout: float = 60.0
    ) -> RateLimitToken:
        """
        Acquire rate limit token for a URL
        
        Args:
            url: URL to rate limit
            max_concurrent: Maximum concurrent requests for domain
            delay_ms: Delay between requests in milliseconds
            timeout: Maximum time to wait for token
            
        Returns:
            RateLimitToken that must be released after use
        """
        if not self.redis_client:
            await self.connect()
        
        domain = self.get_domain(url)
        max_concurrent = max_concurrent or self.default_max_concurrent
        delay_ms = delay_ms or self.default_delay_ms
        
        # Keys for rate limiting
        current_key = f"rate_limit:{domain}:current"
        last_request_key = f"rate_limit:{domain}:last_request"
        backoff_key = f"rate_limit:{domain}:backoff"
        
        start_time = time.time()
        
        while True:
            # Check timeout
            if time.time() - start_time > timeout:
                raise TimeoutError(f"Timeout waiting for rate limit token for {domain}")
            
            # Get current concurrent requests
            current = await self.redis_client.get(current_key)
            current_count = int(current) if current else 0
            
            # Check if we can acquire
            if current_count < max_concurrent:
                # Check delay requirement
                last_request = await self.redis_client.get(last_request_key)
                if last_request:
                    last_request_time = float(last_request)
                    time_since_last = (time.time() - last_request_time) * 1000  # Convert to ms
                    
                    # Add backoff delay if any
                    backoff = await self.redis_client.get(backoff_key)
                    total_delay = delay_ms + (int(backoff) if backoff else 0)
                    
                    if time_since_last < total_delay:
                        wait_time = (total_delay - time_since_last) / 1000.0
                        await asyncio.sleep(wait_time)
                
                # Acquire the token
                pipe = self.redis_client.pipeline()
                pipe.incr(current_key)
                pipe.expire(current_key, 60)  # Expire after 1 minute
                pipe.set(last_request_key, time.time())
                pipe.expire(last_request_key, 60)
                await pipe.execute()
                
                logger.debug(f"Acquired rate limit token for {domain} ({current_count + 1}/{max_concurrent})")
                return RateLimitToken(self.redis_client, domain)
            
            # Wait and retry
            await asyncio.sleep(0.1)
    
    async def handle_error(self, url: str, status_code: int, retry_after: Optional[int] = None):
        """
        Handle rate limiting errors with exponential backoff
        
        Args:
            url: URL that triggered the error
            status_code: HTTP status code
            retry_after: Retry-After header value in seconds
        """
        domain = self.get_domain(url)
        backoff_key = f"rate_limit:{domain}:backoff"
        
        # Check if this is a rate limit error
        if status_code in [429, 503]:
            # Use Retry-After if provided
            if retry_after:
                backoff_ms = retry_after * 1000
                logger.info(f"Rate limited on {domain}, Retry-After: {retry_after}s")
            else:
                # Calculate exponential backoff
                current_backoff = await self.redis_client.get(backoff_key)
                current_backoff_ms = int(current_backoff) if current_backoff else 0
                
                # Exponential backoff with jitter
                new_backoff_ms = min(
                    (current_backoff_ms + 1000) * self.backoff_multiplier,
                    self.max_backoff_ms
                )
                backoff_ms = new_backoff_ms
                logger.warning(f"Rate limited on {domain}, backoff: {backoff_ms}ms")
            
            # Set backoff
            await self.redis_client.setex(backoff_key, 3600, int(backoff_ms))
            
        elif status_code in [502, 504]:
            # Gateway errors - apply moderate backoff
            await self.redis_client.setex(backoff_key, 300, 5000)  # 5 second backoff
            logger.warning(f"Gateway error on {domain}, applying 5s backoff")
    
    async def reset_backoff(self, url: str):
        """Reset backoff for a domain after successful request"""
        domain = self.get_domain(url)
        backoff_key = f"rate_limit:{domain}:backoff"
        await self.redis_client.delete(backoff_key)
    
    async def get_stats(self, url: str) -> Dict[str, Any]:
        """
        Get rate limiting statistics for a domain
        
        Args:
            url: URL to check
            
        Returns:
            Dictionary with rate limit stats
        """
        domain = self.get_domain(url)
        
        current_key = f"rate_limit:{domain}:current"
        backoff_key = f"rate_limit:{domain}:backoff"
        last_request_key = f"rate_limit:{domain}:last_request"
        
        current = await self.redis_client.get(current_key)
        backoff = await self.redis_client.get(backoff_key)
        last_request = await self.redis_client.get(last_request_key)
        
        return {
            "domain": domain,
            "current_requests": int(current) if current else 0,
            "backoff_ms": int(backoff) if backoff else 0,
            "last_request_time": float(last_request) if last_request else None
        }


class GlobalRateLimiter:
    """
    Global rate limiter for overall system throughput
    """
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = None
        self.max_global_rps = int(os.getenv("MAX_GLOBAL_RPS", "100"))
    
    async def connect(self):
        """Connect to Redis"""
        if not self.redis_client:
            self.redis_client = await redis.from_url(self.redis_url)
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
            self.redis_client = None
    
    async def check_and_increment(self) -> bool:
        """
        Check if request can proceed and increment counter
        
        Returns:
            True if request can proceed, False otherwise
        """
        if not self.redis_client:
            await self.connect()
        
        # Use sliding window counter
        now = time.time()
        window_start = now - 1  # 1 second window
        key = "global_rate_limit:requests"
        
        # Remove old entries and count current
        pipe = self.redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, 2)
        results = await pipe.execute()
        
        current_count = results[1]
        
        if current_count <= self.max_global_rps:
            return True
        
        logger.warning(f"Global rate limit exceeded: {current_count}/{self.max_global_rps} RPS")
        return False


# Singleton instances
_domain_limiter = None
_global_limiter = None

def get_domain_rate_limiter() -> DomainRateLimiter:
    """Get singleton domain rate limiter"""
    global _domain_limiter
    if _domain_limiter is None:
        _domain_limiter = DomainRateLimiter()
    return _domain_limiter

def get_global_rate_limiter() -> GlobalRateLimiter:
    """Get singleton global rate limiter"""
    global _global_limiter
    if _global_limiter is None:
        _global_limiter = GlobalRateLimiter()
    return _global_limiter