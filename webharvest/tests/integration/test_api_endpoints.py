"""
Integration tests for API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
import json
import uuid

def test_api_imports():
    """Test that API modules can be imported"""
    from api.app.main import app
    from api.app.api import scrape, crawl, batch, map, health
    assert app is not None

class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        from api.app.main import app
        client = TestClient(app)
        
        response = client.get("/healthz")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_readiness_check(self):
        """Test readiness check endpoint"""
        from api.app.main import app
        client = TestClient(app)
        
        with patch('api.app.api.health.check_database', return_value=True):
            with patch('api.app.api.health.check_redis', return_value=True):
                response = client.get("/readyz")
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "ready"

class TestScrapeEndpoints:
    """Test scraping API endpoints"""
    
    def test_scrape_without_auth(self):
        """Test scrape endpoint requires authentication"""
        from api.app.main import app
        client = TestClient(app)
        
        response = client.post("/v2/scrape", json={
            "url": "https://example.com"
        })
        assert response.status_code == 401
    
    def test_scrape_with_auth(self):
        """Test scrape endpoint with valid auth"""
        from api.app.main import app
        client = TestClient(app)
        
        with patch('api.app.utils.auth.verify_api_key', return_value="test_key"):
            with patch('api.app.services.task_manager.TaskManager.queue_scrape') as mock_queue:
                mock_queue.return_value = "task123"
                
                response = client.post("/v2/scrape", 
                    json={"url": "https://example.com"},
                    headers={"Authorization": "Bearer test_key"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] == True
                assert "id" in data

class TestCrawlEndpoints:
    """Test crawling API endpoints"""
    
    def test_start_crawl(self):
        """Test starting a crawl job"""
        from api.app.main import app
        client = TestClient(app)
        
        with patch('api.app.utils.auth.verify_api_key', return_value="test_key"):
            with patch('api.app.models.database.get_db') as mock_db:
                mock_session = Mock()
                mock_db.return_value = mock_session
                
                with patch('api.app.services.task_manager.TaskManager.queue_crawl') as mock_queue:
                    mock_queue.return_value = "task456"
                    
                    response = client.post("/v2/crawl",
                        json={
                            "url": "https://example.com",
                            "limit": 100,
                            "maxDiscoveryDepth": 3
                        },
                        headers={"Authorization": "Bearer test_key"}
                    )
                    
                    assert response.status_code == 200
                    data = response.json()
                    assert data["success"] == True
                    assert "id" in data
    
    def test_get_crawl_status(self):
        """Test getting crawl job status"""
        from api.app.main import app
        from api.app.models.database import CrawlJob
        client = TestClient(app)
        
        mock_job = Mock(spec=CrawlJob)
        mock_job.id = uuid.uuid4()
        mock_job.status = "running"
        mock_job.total_discovered = 50
        mock_job.completed = 30
        mock_job.failed = 2
        
        with patch('api.app.utils.auth.verify_api_key', return_value="test_key"):
            with patch('api.app.models.database.get_db') as mock_db:
                mock_session = Mock()
                mock_query = Mock()
                mock_filter = Mock()
                
                mock_db.return_value = mock_session
                mock_session.query.return_value = mock_query
                mock_query.filter.return_value = mock_filter
                mock_filter.first.return_value = mock_job
                
                response = client.get(f"/v2/crawl/{mock_job.id}",
                    headers={"Authorization": "Bearer test_key"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "running"
                assert data["total"] == 50
                assert data["completed"] == 30

class TestBatchEndpoints:
    """Test batch processing endpoints"""
    
    def test_batch_scrape(self):
        """Test batch scrape endpoint"""
        from api.app.main import app
        client = TestClient(app)
        
        with patch('api.app.utils.auth.verify_api_key', return_value="test_key"):
            with patch('api.app.models.database.get_db') as mock_db:
                mock_session = Mock()
                mock_db.return_value = mock_session
                
                with patch('api.app.services.task_manager.TaskManager.queue_batch_scrape') as mock_queue:
                    mock_queue.return_value = "batch789"
                    
                    response = client.post("/v2/batch/scrape",
                        json={
                            "urls": [
                                "https://example.com/page1",
                                "https://example.com/page2"
                            ]
                        },
                        headers={"Authorization": "Bearer test_key"}
                    )
                    
                    assert response.status_code == 200
                    data = response.json()
                    assert data["success"] == True
                    assert "id" in data

class TestMapEndpoints:
    """Test site mapping endpoints"""
    
    def test_map_site(self):
        """Test site mapping endpoint"""
        from api.app.main import app
        client = TestClient(app)
        
        with patch('api.app.utils.auth.verify_api_key', return_value="test_key"):
            with patch('api.app.services.task_manager.TaskManager.queue_map') as mock_queue:
                mock_queue.return_value = "map123"
                
                response = client.post("/v2/map",
                    json={"url": "https://example.com"},
                    headers={"Authorization": "Bearer test_key"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] == True

class TestMCPEndpoints:
    """Test MCP server endpoints"""
    
    def test_mcp_info(self):
        """Test MCP info endpoint"""
        from api.app.main import app
        client = TestClient(app)
        
        response = client.get("/mcp")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "WebHarvest MCP Server"
        assert data["protocol"] == "2025-06-18"
        assert data["tools"] == 10
    
    def test_mcp_json_rpc(self):
        """Test MCP JSON-RPC endpoint"""
        from api.app.main import app
        client = TestClient(app)
        
        # Test initialize method
        request_data = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {}
        }
        
        response = client.post("/mcp",
            content=json.dumps(request_data),
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["result"]["protocolVersion"] == "2025-06-18"

class TestErrorHandling:
    """Test API error handling"""
    
    def test_404_handler(self):
        """Test 404 error handler"""
        from api.app.main import app
        client = TestClient(app)
        
        response = client.get("/nonexistent/endpoint")
        assert response.status_code == 404
        data = response.json()
        assert data["success"] == False
        assert "not exist" in data["message"]
    
    def test_invalid_url_format(self):
        """Test invalid URL format in request"""
        from api.app.main import app
        client = TestClient(app)
        
        with patch('api.app.utils.auth.verify_api_key', return_value="test_key"):
            response = client.post("/v2/scrape",
                json={"url": "not-a-valid-url"},
                headers={"Authorization": "Bearer test_key"}
            )
            
            assert response.status_code == 422  # Validation error

class TestMetrics:
    """Test metrics collection"""
    
    def test_metrics_endpoint(self):
        """Test Prometheus metrics endpoint"""
        from api.app.main import app
        client = TestClient(app)
        
        response = client.get("/metrics")
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/plain; charset=utf-8"
        
        # Check for standard Prometheus metrics
        content = response.text
        assert "webharvest_requests_total" in content
        assert "webharvest_request_duration_seconds" in content

if __name__ == "__main__":
    pytest.main([__file__, "-v"])