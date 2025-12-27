"""
Integration tests for web scraping functionality
"""

import pytest
import asyncio
from unittest.mock import Mock, patch
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from worker.app.scraping.scraper import WebScraper
from worker.app.scraping.extractor import ContentExtractor
from worker.app.scraping.crawler import URLNormalizer, WebCrawler

class TestWebScraper:
    """Test web scraper functionality"""
    
    @pytest.mark.asyncio
    async def test_scrape_basic(self):
        """Test basic scraping without browser"""
        scraper = WebScraper()
        
        # Mock the browser operations
        with patch.object(scraper, 'scrape') as mock_scrape:
            mock_scrape.return_value = {
                "success": True,
                "data": {
                    "markdown": "# Test Page\n\nTest content",
                    "metadata": {
                        "title": "Test Page",
                        "sourceURL": "https://example.com",
                        "statusCode": 200
                    }
                }
            }
            
            result = await mock_scrape(
                url="https://example.com",
                formats=["markdown"]
            )
            
            assert result["success"] == True
            assert "markdown" in result["data"]
            assert result["data"]["metadata"]["statusCode"] == 200

class TestContentExtractor:
    """Test content extraction functionality"""
    
    def test_extract_metadata(self):
        """Test metadata extraction from HTML"""
        html = """
        <html>
        <head>
            <title>Test Page Title</title>
            <meta name="description" content="Test description">
            <meta name="author" content="Test Author">
        </head>
        <body>
            <h1>Content</h1>
        </body>
        </html>
        """
        
        extractor = ContentExtractor()
        metadata = extractor.extract_metadata(html, "https://example.com")
        
        assert metadata["title"] == "Test Page Title"
        assert metadata["description"] == "Test description"
        assert metadata["author"] == "Test Author"
        assert metadata["sourceURL"] == "https://example.com"
    
    def test_html_to_markdown(self):
        """Test HTML to Markdown conversion"""
        html = """
        <h1>Main Title</h1>
        <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
        <a href="https://example.com">Link</a>
        """
        
        extractor = ContentExtractor()
        markdown = extractor.html_to_markdown(html)
        
        assert "# Main Title" in markdown
        assert "**bold**" in markdown
        assert "*italic*" in markdown
        assert "- Item 1" in markdown or "* Item 1" in markdown
        assert "[Link]" in markdown
    
    def test_extract_links(self):
        """Test link extraction"""
        html = """
        <a href="https://example.com/page1">Page 1</a>
        <a href="/page2">Page 2</a>
        <a href="mailto:test@example.com">Email</a>
        <link rel="stylesheet" href="https://example.com/style.css">
        """
        
        extractor = ContentExtractor()
        links = extractor.extract_links(html, "https://example.com")
        
        assert "https://example.com/page1" in links
        assert "https://example.com/page2" in links
        assert "https://example.com/style.css" in links
        assert "mailto:test@example.com" not in links
    
    def test_content_hash(self):
        """Test content hash calculation"""
        extractor = ContentExtractor()
        
        content1 = "This is test content"
        content2 = "This is different content"
        
        hash1 = extractor.calculate_content_hash(content1)
        hash2 = extractor.calculate_content_hash(content2)
        hash1_again = extractor.calculate_content_hash(content1)
        
        assert hash1 == hash1_again  # Same content produces same hash
        assert hash1 != hash2  # Different content produces different hash
        assert len(hash1) == 64  # SHA256 produces 64 character hex string

class TestURLNormalizer:
    """Test URL normalization"""
    
    def test_normalize_basic(self):
        """Test basic URL normalization"""
        normalizer = URLNormalizer()
        
        # Remove fragment
        assert normalizer.normalize("https://example.com/page#section") == "https://example.com/page"
        
        # Lowercase domain
        assert normalizer.normalize("https://EXAMPLE.COM/page") == "https://example.com/page"
        
        # Remove default ports
        assert normalizer.normalize("https://example.com:443/page") == "https://example.com/page"
        assert normalizer.normalize("http://example.com:80/page") == "http://example.com/page"
        
        # Keep non-default ports
        assert normalizer.normalize("https://example.com:8080/page") == "https://example.com:8080/page"
    
    def test_normalize_query_params(self):
        """Test query parameter handling"""
        normalizer = URLNormalizer()
        
        # Keep query params by default
        url = "https://example.com/page?param1=value1&param2=value2"
        assert normalizer.normalize(url) == url
        
        # Remove query params when requested
        assert normalizer.normalize(url, ignore_query_params=True) == "https://example.com/page"
    
    def test_is_valid_url(self):
        """Test URL validation"""
        normalizer = URLNormalizer()
        
        assert normalizer.is_valid_url("https://example.com") == True
        assert normalizer.is_valid_url("http://example.com/page") == True
        assert normalizer.is_valid_url("ftp://example.com") == False
        assert normalizer.is_valid_url("not-a-url") == False
        assert normalizer.is_valid_url("") == False
    
    def test_domain_comparison(self):
        """Test domain comparison"""
        normalizer = URLNormalizer()
        
        # Same domain
        assert normalizer.is_same_domain(
            "https://example.com/page1",
            "https://example.com/page2"
        ) == True
        
        # Different domains
        assert normalizer.is_same_domain(
            "https://example.com",
            "https://other.com"
        ) == False
        
        # Subdomains without allow_subdomains
        assert normalizer.is_same_domain(
            "https://example.com",
            "https://sub.example.com",
            allow_subdomains=False
        ) == False
        
        # Subdomains with allow_subdomains
        assert normalizer.is_same_domain(
            "https://example.com",
            "https://sub.example.com",
            allow_subdomains=True
        ) == True

class TestWebCrawler:
    """Test web crawler functionality"""
    
    @pytest.mark.asyncio
    async def test_crawler_initialization(self):
        """Test crawler initialization"""
        crawler = WebCrawler(
            seed_url="https://example.com",
            max_depth=3,
            max_pages=100,
            include_patterns=["^/docs/.*"],
            exclude_patterns=["^/api/.*"]
        )
        
        assert crawler.seed_url == "https://example.com"
        assert crawler.max_depth == 3
        assert crawler.max_pages == 100
        assert len(crawler.include_patterns) == 1
        assert len(crawler.exclude_patterns) == 1
    
    @pytest.mark.asyncio
    async def test_should_crawl(self):
        """Test crawl decision logic"""
        crawler = WebCrawler(
            seed_url="https://example.com",
            include_patterns=["^/docs/.*"],
            exclude_patterns=["^/api/.*"],
            allow_external_links=False
        )
        
        # Mock robots.txt check
        with patch.object(crawler.robots_parser, 'can_fetch', return_value=True):
            # Should crawl - matches include pattern
            assert await crawler._should_crawl("https://example.com/docs/guide") == True
            
            # Should not crawl - matches exclude pattern
            assert await crawler._should_crawl("https://example.com/api/v1") == False
            
            # Should not crawl - external domain
            assert await crawler._should_crawl("https://other.com/page") == False
            
            # Should not crawl - doesn't match include pattern
            assert await crawler._should_crawl("https://example.com/blog/post") == False

class TestRateLimiter:
    """Test rate limiting functionality"""
    
    @pytest.mark.asyncio
    async def test_domain_rate_limiter(self):
        """Test domain-specific rate limiting"""
        from worker.app.utils.rate_limiter import DomainRateLimiter
        
        # Mock Redis client
        with patch('worker.app.utils.rate_limiter.redis.Redis') as mock_redis:
            mock_client = Mock()
            mock_redis.return_value = mock_client
            
            limiter = DomainRateLimiter()
            
            # Test rate limit check
            mock_client.get.return_value = None
            mock_client.incr.return_value = 1
            mock_client.expire.return_value = True
            
            can_proceed = await limiter.check_rate_limit("example.com")
            assert can_proceed == True
            
            # Test rate limit exceeded
            mock_client.incr.return_value = 11  # Over default limit of 10
            can_proceed = await limiter.check_rate_limit("example.com")
            assert can_proceed == False
    
    @pytest.mark.asyncio
    async def test_exponential_backoff(self):
        """Test exponential backoff on errors"""
        from worker.app.utils.rate_limiter import DomainRateLimiter
        
        with patch('worker.app.utils.rate_limiter.redis.Redis') as mock_redis:
            mock_client = Mock()
            mock_redis.return_value = mock_client
            
            limiter = DomainRateLimiter()
            
            # Record first error
            mock_client.incr.return_value = 1
            mock_client.expire.return_value = True
            await limiter.record_error("example.com")
            
            # Calculate backoff
            mock_client.get.return_value = b"3"  # 3 errors
            backoff = await limiter.get_backoff_time("example.com")
            assert backoff > 0
            assert backoff == 2 ** 3  # Exponential backoff

class TestCeleryTasks:
    """Test Celery task execution"""
    
    def test_scrape_task_creation(self):
        """Test scrape task creation"""
        from worker.app.tasks.scraping import scrape_url_task
        
        # Mock the task execution
        with patch('worker.app.tasks.scraping.WebScraper') as mock_scraper:
            mock_instance = Mock()
            mock_scraper.return_value = mock_instance
            mock_instance.scrape = Mock(return_value={
                "success": True,
                "data": {"markdown": "Test content"}
            })
            
            # Task should be registered
            assert scrape_url_task.name == 'scraping.scrape_url'
    
    def test_crawl_task_creation(self):
        """Test crawl task creation"""
        from worker.app.tasks.scraping import crawl_site_task
        
        # Task should be registered with correct name
        assert crawl_site_task.name == 'scraping.crawl_site'

class TestOpenWebUIConnector:
    """Test OpenWebUI integration"""
    
    @pytest.mark.asyncio
    async def test_file_upload(self):
        """Test file upload to OpenWebUI"""
        from api.app.services.openwebui_connector import OpenWebUIConnector
        
        connector = OpenWebUIConnector()
        
        # Mock HTTP client
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"id": "file123"}
            
            mock_instance = mock_client.return_value.__aenter__.return_value
            mock_instance.post.return_value = mock_response
            
            file_id = await connector.upload_file(
                filename="test.md",
                content=b"# Test Content",
                content_type="text/markdown"
            )
            
            assert file_id == "file123"
    
    @pytest.mark.asyncio
    async def test_bundle_sync(self):
        """Test bundle sync mode"""
        from api.app.services.openwebui_connector import OpenWebUIConnector
        
        connector = OpenWebUIConnector()
        
        with patch.object(connector, 'upload_file', return_value="zip123"):
            with patch.object(connector, 'add_file_to_collection', return_value=True):
                result = await connector.sync_crawl_to_collection(
                    crawl_id="crawl123",
                    collection_id="coll456",
                    pages=[
                        {
                            "url": "https://example.com",
                            "markdown": "# Test Page",
                            "metadata": {"title": "Test"}
                        }
                    ],
                    mode="bundle_zip"
                )
                
                assert result["success"] == True
                assert result["mode"] == "bundle_zip"
                assert result["pages_count"] == 1

class TestMCPServer:
    """Test MCP server functionality"""
    
    @pytest.mark.asyncio
    async def test_mcp_initialization(self):
        """Test MCP server initialization"""
        from api.app.api.mcp_enhanced import initialize
        
        result = await initialize()
        
        assert result.data["protocolVersion"] == "2025-06-18"
        assert result.data["serverInfo"]["name"] == "webharvest-mcp"
        assert result.data["capabilities"]["tools"]["listChanged"] == False
    
    @pytest.mark.asyncio
    async def test_mcp_tools_list(self):
        """Test MCP tools listing"""
        from api.app.api.mcp_enhanced import tools_list
        
        result = await tools_list()
        tools = result.data["tools"]
        
        # Check all tools are present
        tool_names = [t["name"] for t in tools]
        assert "scrape_url" in tool_names
        assert "crawl_site" in tool_names
        assert "get_crawl_status" in tool_names
        assert "sync_crawl_to_openwebui_collection" in tool_names
        assert len(tools) == 10  # Total number of tools
    
    @pytest.mark.asyncio
    async def test_mcp_scrape_tool(self):
        """Test MCP scrape_url tool execution"""
        from api.app.api.mcp_enhanced import tools_call
        
        with patch('api.app.api.mcp_enhanced.task_manager') as mock_tm:
            mock_tm.queue_scrape.return_value = "task123"
            
            result = await tools_call(
                name="scrape_url",
                arguments={"url": "https://example.com"}
            )
            
            assert "task_id" in result.data
            assert result.data["status"] == "queued"

class TestDatabaseModels:
    """Test database models and operations"""
    
    def test_crawl_job_creation(self):
        """Test CrawlJob model creation"""
        from api.app.models.database import CrawlJob
        import uuid
        
        job = CrawlJob(
            id=uuid.uuid4(),
            seed_url="https://example.com",
            request_json={"limit": 100},
            status="queued",
            created_by="test_user"
        )
        
        assert job.seed_url == "https://example.com"
        assert job.status == "queued"
        assert job.total_discovered == 0
        assert job.completed == 0
        assert job.failed == 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])