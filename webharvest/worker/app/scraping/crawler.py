"""
Web crawler module for discovering and crawling websites
"""

import asyncio
import re
import logging
from typing import Set, Dict, Any, List, Optional, AsyncIterator
from urllib.parse import urlparse, urljoin, urlunparse
from collections import deque
import xml.etree.ElementTree as ET
import httpx

from app.scraping.scraper import WebScraper, ScraperPool
from app.scraping.extractor import ContentExtractor

logger = logging.getLogger(__name__)

class URLNormalizer:
    """Normalize and validate URLs for crawling"""
    
    @staticmethod
    def normalize(url: str, ignore_query_params: bool = False) -> str:
        """
        Normalize URL for deduplication and caching
        
        Args:
            url: URL to normalize
            ignore_query_params: Whether to remove query parameters
            
        Returns:
            Normalized URL
        """
        parsed = urlparse(url)
        
        # Convert scheme and netloc to lowercase
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        
        # Remove default ports
        if ':' in netloc:
            host, port = netloc.rsplit(':', 1)
            if (scheme == 'http' and port == '80') or (scheme == 'https' and port == '443'):
                netloc = host
        
        # Clean path
        path = parsed.path
        if not path:
            path = '/'
        elif path != '/' and path.endswith('/'):
            path = path.rstrip('/')
        
        # Handle query parameters
        query = '' if ignore_query_params else parsed.query
        
        # Reconstruct URL without fragment
        normalized = urlunparse((
            scheme,
            netloc,
            path,
            parsed.params,
            query,
            ''  # Always remove fragment
        ))
        
        return normalized
    
    @staticmethod
    def is_valid_url(url: str) -> bool:
        """Check if URL is valid for crawling"""
        try:
            parsed = urlparse(url)
            return parsed.scheme in ('http', 'https') and bool(parsed.netloc)
        except:
            return False
    
    @staticmethod
    def get_domain(url: str) -> str:
        """Extract domain from URL"""
        parsed = urlparse(url)
        return parsed.netloc.lower()
    
    @staticmethod
    def is_same_domain(url1: str, url2: str, allow_subdomains: bool = False) -> bool:
        """Check if two URLs are from the same domain"""
        domain1 = URLNormalizer.get_domain(url1)
        domain2 = URLNormalizer.get_domain(url2)
        
        if domain1 == domain2:
            return True
        
        if allow_subdomains:
            # Check if one is a subdomain of the other
            if domain1.endswith('.' + domain2) or domain2.endswith('.' + domain1):
                return True
        
        return False


class RobotsTxtParser:
    """Parse and check robots.txt rules"""
    
    def __init__(self):
        self.rules_cache: Dict[str, Dict[str, Any]] = {}
    
    async def fetch_robots_txt(self, url: str) -> Optional[str]:
        """Fetch robots.txt for a domain"""
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        
        if robots_url in self.rules_cache:
            return self.rules_cache[robots_url]
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(robots_url, timeout=5.0)
                if response.status_code == 200:
                    return response.text
        except Exception as e:
            logger.debug(f"Failed to fetch robots.txt from {robots_url}: {e}")
        
        return None
    
    def parse_robots_txt(self, content: str, user_agent: str = "*") -> Dict[str, Any]:
        """Parse robots.txt content"""
        rules = {
            "disallow": [],
            "allow": [],
            "crawl_delay": 0,
            "sitemap": []
        }
        
        if not content:
            return rules
        
        current_agent = None
        applicable = False
        
        for line in content.split('\n'):
            line = line.strip()
            
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            
            # Parse directive
            if ':' in line:
                directive, value = line.split(':', 1)
                directive = directive.strip().lower()
                value = value.strip()
                
                if directive == 'user-agent':
                    current_agent = value.lower()
                    applicable = (current_agent == '*' or 
                                 current_agent == user_agent.lower())
                
                elif applicable:
                    if directive == 'disallow':
                        if value:
                            rules["disallow"].append(value)
                    elif directive == 'allow':
                        if value:
                            rules["allow"].append(value)
                    elif directive == 'crawl-delay':
                        try:
                            rules["crawl_delay"] = float(value)
                        except:
                            pass
                
                # Sitemap is global
                if directive == 'sitemap':
                    rules["sitemap"].append(value)
        
        return rules
    
    async def can_fetch(self, url: str, user_agent: str = "*", respect_robots: bool = True) -> bool:
        """Check if URL can be fetched according to robots.txt"""
        if not respect_robots:
            return True
        
        robots_content = await self.fetch_robots_txt(url)
        if not robots_content:
            return True  # No robots.txt means everything is allowed
        
        rules = self.parse_robots_txt(robots_content, user_agent)
        parsed = urlparse(url)
        path = parsed.path or '/'
        
        # Check allow rules first (they take precedence)
        for pattern in rules["allow"]:
            if self._matches_pattern(path, pattern):
                return True
        
        # Check disallow rules
        for pattern in rules["disallow"]:
            if self._matches_pattern(path, pattern):
                return False
        
        return True
    
    def _matches_pattern(self, path: str, pattern: str) -> bool:
        """Check if path matches robots.txt pattern"""
        # Convert robots.txt pattern to regex
        pattern = pattern.replace('*', '.*')
        pattern = '^' + pattern
        
        return bool(re.match(pattern, path))


class SitemapParser:
    """Parse XML sitemaps"""
    
    @staticmethod
    async def fetch_sitemap(url: str) -> Optional[str]:
        """Fetch sitemap content"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                if response.status_code == 200:
                    return response.text
        except Exception as e:
            logger.error(f"Failed to fetch sitemap from {url}: {e}")
        return None
    
    @staticmethod
    def parse_sitemap(content: str) -> List[str]:
        """Parse sitemap XML and extract URLs"""
        urls = []
        
        try:
            # Remove namespace to simplify parsing
            content = re.sub(r'xmlns="[^"]+"', '', content)
            root = ET.fromstring(content)
            
            # Check if it's a sitemap index
            for sitemap in root.findall('.//sitemap'):
                loc = sitemap.find('loc')
                if loc is not None and loc.text:
                    # This is a sitemap index, would need to fetch sub-sitemaps
                    # For now, we'll just note them
                    logger.info(f"Found sub-sitemap: {loc.text}")
            
            # Extract URLs
            for url_elem in root.findall('.//url'):
                loc = url_elem.find('loc')
                if loc is not None and loc.text:
                    urls.append(loc.text)
        
        except Exception as e:
            logger.error(f"Failed to parse sitemap: {e}")
        
        return urls
    
    @staticmethod
    async def discover_sitemaps(base_url: str) -> List[str]:
        """Discover all sitemaps for a website"""
        sitemaps = []
        parsed = urlparse(base_url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        
        # Common sitemap locations
        common_paths = [
            '/sitemap.xml',
            '/sitemap_index.xml',
            '/sitemap1.xml',
            '/sitemaps/sitemap.xml',
            '/sitemap/sitemap.xml'
        ]
        
        for path in common_paths:
            sitemap_url = base + path
            content = await SitemapParser.fetch_sitemap(sitemap_url)
            if content:
                sitemaps.append(sitemap_url)
                logger.info(f"Found sitemap at {sitemap_url}")
        
        return sitemaps


class WebCrawler:
    """Main web crawler class"""
    
    def __init__(
        self,
        seed_url: str,
        max_depth: int = 3,
        max_pages: int = 100,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
        allow_external_links: bool = False,
        allow_subdomains: bool = False,
        ignore_query_params: bool = False,
        respect_robots_txt: bool = True,
        sitemap_mode: str = "include"  # include, ignore, only
    ):
        self.seed_url = URLNormalizer.normalize(seed_url)
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.include_patterns = include_patterns or []
        self.exclude_patterns = exclude_patterns or []
        self.allow_external_links = allow_external_links
        self.allow_subdomains = allow_subdomains
        self.ignore_query_params = ignore_query_params
        self.respect_robots_txt = respect_robots_txt
        self.sitemap_mode = sitemap_mode
        
        self.normalizer = URLNormalizer()
        self.robots_parser = RobotsTxtParser()
        self.visited: Set[str] = set()
        self.to_visit: deque = deque()
        self.depth_map: Dict[str, int] = {}
        self.discovered_count = 0
    
    async def discover_urls(self) -> AsyncIterator[str]:
        """
        Discover URLs to crawl
        
        Yields:
            Normalized URLs to crawl
        """
        # Start with seed URL
        self.to_visit.append(self.seed_url)
        self.depth_map[self.seed_url] = 0
        
        # Process sitemap if needed
        if self.sitemap_mode in ["include", "only"]:
            await self._process_sitemaps()
        
        if self.sitemap_mode == "only":
            # Only use sitemap URLs
            while self.to_visit and self.discovered_count < self.max_pages:
                url = self.to_visit.popleft()
                if await self._should_crawl(url):
                    self.visited.add(url)
                    self.discovered_count += 1
                    yield url
            return
        
        # Regular crawling with discovery
        while self.to_visit and self.discovered_count < self.max_pages:
            current_url = self.to_visit.popleft()
            current_depth = self.depth_map.get(current_url, 0)
            
            # Skip if already visited
            if current_url in self.visited:
                continue
            
            # Check if should crawl
            if not await self._should_crawl(current_url):
                continue
            
            # Mark as visited and yield
            self.visited.add(current_url)
            self.discovered_count += 1
            yield current_url
            
            # Discover new URLs if not at max depth
            if current_depth < self.max_depth:
                # This would normally extract links from the page
                # For now, we'll use a placeholder
                # In real implementation, this would scrape the page and extract links
                pass
    
    async def _process_sitemaps(self):
        """Process sitemaps and add URLs to queue"""
        sitemaps = await SitemapParser.discover_sitemaps(self.seed_url)
        
        for sitemap_url in sitemaps:
            content = await SitemapParser.fetch_sitemap(sitemap_url)
            if content:
                urls = SitemapParser.parse_sitemap(content)
                for url in urls:
                    normalized = self.normalizer.normalize(url, self.ignore_query_params)
                    if normalized not in self.visited and normalized not in self.depth_map:
                        self.to_visit.append(normalized)
                        self.depth_map[normalized] = 0  # Sitemap URLs start at depth 0
    
    async def _should_crawl(self, url: str) -> bool:
        """Check if URL should be crawled based on rules"""
        
        # Check if valid URL
        if not self.normalizer.is_valid_url(url):
            return False
        
        # Check domain restrictions
        if not self.allow_external_links:
            if not self.normalizer.is_same_domain(url, self.seed_url, self.allow_subdomains):
                return False
        
        # Check include patterns
        if self.include_patterns:
            path = urlparse(url).path
            if not any(re.match(pattern, path) for pattern in self.include_patterns):
                return False
        
        # Check exclude patterns
        if self.exclude_patterns:
            path = urlparse(url).path
            if any(re.match(pattern, path) for pattern in self.exclude_patterns):
                return False
        
        # Check robots.txt
        if not await self.robots_parser.can_fetch(url, respect_robots=self.respect_robots_txt):
            logger.info(f"Robots.txt disallows: {url}")
            return False
        
        return True
    
    def add_discovered_urls(self, urls: List[str], source_depth: int):
        """Add newly discovered URLs to the queue"""
        for url in urls:
            normalized = self.normalizer.normalize(url, self.ignore_query_params)
            
            # Skip if already seen
            if normalized in self.visited or normalized in self.depth_map:
                continue
            
            # Add to queue with incremented depth
            self.to_visit.append(normalized)
            self.depth_map[normalized] = source_depth + 1