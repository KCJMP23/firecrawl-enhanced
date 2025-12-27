"""
Browser management for web scraping with Playwright
"""

import asyncio
from typing import Optional, Dict, Any, List
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
import random
import os
import logging

logger = logging.getLogger(__name__)

class BrowserManager:
    """Manages browser instances and contexts for scraping"""
    
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
        ]
    
    async def __aenter__(self):
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.stop()
    
    async def start(self):
        """Start Playwright and browser"""
        self.playwright = await async_playwright().start()
        
        # Choose browser based on environment
        browser_type = os.getenv("BROWSER_TYPE", "chromium").lower()
        
        launch_options = {
            "headless": os.getenv("HEADLESS", "true").lower() == "true",
            "args": [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu"
            ]
        }
        
        if browser_type == "firefox":
            self.browser = await self.playwright.firefox.launch(**launch_options)
        elif browser_type == "webkit":
            self.browser = await self.playwright.webkit.launch(**launch_options)
        else:
            self.browser = await self.playwright.chromium.launch(**launch_options)
        
        logger.info(f"Browser started: {browser_type}")
    
    async def stop(self):
        """Stop browser and Playwright"""
        if self.browser:
            await self.browser.close()
            self.browser = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None
        logger.info("Browser stopped")
    
    async def create_context(
        self,
        mobile: bool = False,
        headers: Optional[Dict[str, str]] = None,
        cookies: Optional[List[Dict[str, Any]]] = None,
        proxy: Optional[Dict[str, str]] = None
    ) -> BrowserContext:
        """Create a new browser context with specified options"""
        
        if not self.browser:
            raise RuntimeError("Browser not started")
        
        # Context options
        context_options = {
            "user_agent": random.choice(self.user_agents),
            "viewport": {"width": 375, "height": 667} if mobile else {"width": 1920, "height": 1080},
            "device_scale_factor": 2 if mobile else 1,
            "is_mobile": mobile,
            "has_touch": mobile,
            "ignore_https_errors": True
        }
        
        # Add custom headers
        if headers:
            context_options["extra_http_headers"] = headers
        
        # Add proxy if specified
        if proxy:
            context_options["proxy"] = proxy
        
        # Create context
        context = await self.browser.new_context(**context_options)
        
        # Add cookies if provided
        if cookies:
            await context.add_cookies(cookies)
        
        # Set additional settings
        await context.set_extra_http_headers({
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        })
        
        return context
    
    async def create_page(
        self,
        context: BrowserContext,
        block_resources: Optional[List[str]] = None
    ) -> Page:
        """Create a new page with optional resource blocking"""
        
        page = await context.new_page()
        
        # Block specific resource types if requested
        if block_resources:
            async def block_route(route):
                if route.request.resource_type in block_resources:
                    await route.abort()
                else:
                    await route.continue_()
            
            await page.route("**/*", block_route)
        
        # Set default timeouts
        page.set_default_timeout(30000)  # 30 seconds
        page.set_default_navigation_timeout(30000)
        
        return page

    async def execute_actions(
        self,
        page: Page,
        actions: List[Dict[str, Any]],
        max_actions: int = 25,
        max_time: int = 30000
    ) -> None:
        """Execute a list of browser actions on a page"""
        
        if not actions:
            return
        
        # Limit number of actions
        actions = actions[:max_actions]
        
        start_time = asyncio.get_event_loop().time()
        
        for action in actions:
            # Check timeout
            if (asyncio.get_event_loop().time() - start_time) * 1000 > max_time:
                logger.warning(f"Action timeout reached after {len(actions)} actions")
                break
            
            action_type = action.get("type")
            
            try:
                if action_type == "wait":
                    milliseconds = action.get("milliseconds", 1000)
                    await asyncio.sleep(milliseconds / 1000)
                    
                elif action_type == "click":
                    selector = action.get("selector")
                    if selector:
                        await page.click(selector, timeout=5000)
                    
                elif action_type == "type":
                    selector = action.get("selector")
                    text = action.get("text", "")
                    if selector:
                        await page.type(selector, text, delay=100)
                    
                elif action_type == "scroll":
                    y = action.get("y", 0)
                    await page.evaluate(f"window.scrollTo(0, {y})")
                    
                elif action_type == "press":
                    key = action.get("key", "Enter")
                    await page.keyboard.press(key)
                    
                elif action_type == "screenshot":
                    full_page = action.get("fullPage", False)
                    path = f"/app/screenshots/{asyncio.get_event_loop().time()}.png"
                    await page.screenshot(path=path, full_page=full_page)
                    logger.info(f"Screenshot saved: {path}")
                    
                else:
                    logger.warning(f"Unknown action type: {action_type}")
                    
            except Exception as e:
                logger.error(f"Error executing action {action_type}: {e}")
                continue

class BrowserPool:
    """Pool of browser instances for concurrent scraping"""
    
    def __init__(self, size: int = 3):
        self.size = size
        self.browsers: List[BrowserManager] = []
        self.available: asyncio.Queue = asyncio.Queue()
        self.lock = asyncio.Lock()
        self._started = False
    
    async def start(self):
        """Initialize the browser pool"""
        async with self.lock:
            if self._started:
                return
            
            for i in range(self.size):
                browser = BrowserManager()
                await browser.start()
                self.browsers.append(browser)
                await self.available.put(browser)
            
            self._started = True
            logger.info(f"Browser pool started with {self.size} browsers")
    
    async def stop(self):
        """Stop all browsers in the pool"""
        async with self.lock:
            if not self._started:
                return
            
            for browser in self.browsers:
                await browser.stop()
            
            self.browsers.clear()
            # Clear the queue
            while not self.available.empty():
                await self.available.get()
            
            self._started = False
            logger.info("Browser pool stopped")
    
    async def acquire(self) -> BrowserManager:
        """Get an available browser from the pool"""
        if not self._started:
            await self.start()
        return await self.available.get()
    
    async def release(self, browser: BrowserManager):
        """Return a browser to the pool"""
        await self.available.put(browser)
    
    async def __aenter__(self):
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.stop()