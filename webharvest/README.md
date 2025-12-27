# WebHarvest - Self-Hosted Web Scraping + AI Chat Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)

WebHarvest is a powerful, self-hosted alternative to Firecrawl that combines web scraping capabilities with MCP (Model Context Protocol) server integration and an intuitive OpenWebUI interface. Transform any website into LLM-ready markdown with advanced document processing and seamless AI chat interactions.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 8GB RAM available
- 50GB free disk space

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/webharvest.git
cd webharvest

# Copy environment variables
cp .env.example .env

# Edit .env file with your settings (especially passwords)
nano .env

# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

The services will be available at:
- API: http://localhost:8080
- OpenWebUI: http://localhost:3000
- API Documentation: http://localhost:8080/docs

## 🎯 Features

### Core Capabilities

- **Firecrawl-Compatible API**: Drop-in replacement for Firecrawl v2 API
- **MCP Server Integration**: AI-powered tools for Claude and other MCP clients
- **Open WebUI Chat Interface**: Drag-and-drop files and chat with scraped content
- **Self-Hosted**: Complete data sovereignty with no recurring costs

### Scraping Features

- **Multiple Output Formats**: Markdown, HTML, JSON, Screenshots
- **JavaScript Rendering**: Full browser automation with Playwright
- **Smart Content Extraction**: Readability algorithm for main content
- **Change Tracking**: Monitor content changes over time
- **Batch Processing**: Scrape multiple URLs concurrently

### Crawling Features

- **Recursive Site Crawling**: Depth-controlled traversal
- **Sitemap Support**: Automatic sitemap detection and parsing
- **URL Pattern Filtering**: Include/exclude paths with regex
- **Rate Limiting**: Configurable per-domain limits
- **Robots.txt Compliance**: Respects robots.txt by default

## 📖 API Reference

### Scrape Endpoint

```bash
curl -X POST http://localhost:8080/v2/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "links"],
    "onlyMainContent": true
  }'
```

### Crawl Endpoint

```bash
curl -X POST http://localhost:8080/v2/crawl \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "limit": 100,
    "includePaths": ["^/docs/.*"],
    "maxDepth": 3
  }'
```

### Map Endpoint

```bash
curl -X POST http://localhost:8080/v2/map \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "limit": 1000
  }'
```

## 🤖 MCP Integration

WebHarvest includes a built-in MCP server that exposes scraping tools to AI assistants:

### Available MCP Tools

1. `scrape_url` - Scrape a single URL
2. `crawl_site` - Crawl an entire website
3. `get_crawl_status` - Check crawl progress
4. `map_site` - Get site URL map
5. `sync_to_openwebui` - Sync results to OpenWebUI

### Connecting from Open WebUI

1. Navigate to Open WebUI Settings
2. Add MCP Server:
   - URL: `http://webharvest-api:8080/mcp`
   - Type: Streamable HTTP
3. Use natural language to trigger crawls:
   ```
   "Crawl https://docs.example.com and add to my knowledge base"
   ```

## 🔧 Configuration

### Environment Variables

Comprehensive configuration options in `.env`:

#### Core Settings
```env
# Basic Configuration
WEBHARVEST_ENV=production                    # Environment: development, staging, production
WEBHARVEST_HOST=0.0.0.0                     # Server host binding
WEBHARVEST_PORT=8080                        # Server port
WEBHARVEST_WORKERS=4                        # Number of worker processes

# Crawling Limits
MAX_CRAWL_PAGES=10000                       # Maximum pages per crawl job
MAX_CRAWL_DEPTH=10                          # Maximum crawling depth
DEFAULT_RATE_LIMIT_PER_DOMAIN=2            # Concurrent requests per domain
DEFAULT_DELAY_MS=500                        # Delay between requests (milliseconds)
RESPECT_ROBOTS_TXT=true                     # Honor robots.txt files
MAX_CONCURRENT_CRAWLS=5                     # Simultaneous crawl jobs

# Timeouts
REQUEST_TIMEOUT=30000                       # HTTP request timeout (ms)
PAGE_LOAD_TIMEOUT=30000                     # Page load timeout (ms)
NAVIGATION_TIMEOUT=30000                    # Navigation timeout (ms)
SCRIPT_TIMEOUT=10000                        # JavaScript execution timeout (ms)
```

#### Security Configuration
```env
# Authentication & Authorization
JWT_SECRET=your-secret-key-min-32-chars     # JWT signing secret (min 32 chars)
JWT_EXPIRATION=3600                         # Token expiration (seconds)
API_KEY_SALT=your-api-key-salt              # API key hashing salt
WEBHOOK_SECRET=your-webhook-secret          # Webhook validation secret

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
ALLOWED_METHODS=GET,POST,PUT,DELETE
ALLOWED_HEADERS=Content-Type,Authorization

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60          # Requests per minute per IP
RATE_LIMIT_BURST=10                        # Burst allowance
RATE_LIMIT_REDIS_URL=redis://localhost:6379/1
```

#### Database Configuration
```env
# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/webharvest
DATABASE_POOL_SIZE=10                       # Connection pool size
DATABASE_MAX_OVERFLOW=20                    # Pool overflow
DATABASE_POOL_TIMEOUT=30                    # Pool acquisition timeout

# Redis
REDIS_URL=redis://localhost:6379/0         # Redis connection string
REDIS_KEY_PREFIX=webharvest:                # Key namespace prefix
REDIS_SESSION_TTL=3600                      # Session TTL (seconds)

# Vector Database
QDRANT_URL=http://localhost:6333            # Qdrant server URL
QDRANT_API_KEY=your-qdrant-api-key         # Qdrant API key (optional)
QDRANT_COLLECTION_NAME=webharvest          # Collection name
VECTOR_DIMENSION=384                        # Embedding dimension
```

#### Performance Tuning
```env
# Worker Configuration
WORKER_CONCURRENCY=4                        # Celery worker concurrency
WORKER_PREFETCH_MULTIPLIER=4                # Task prefetch multiplier
WORKER_MAX_TASKS_PER_CHILD=100             # Tasks before worker restart

# Caching
CACHE_TTL=3600                             # Default cache TTL (seconds)
CACHE_MAX_SIZE=1000                        # In-memory cache size
CACHE_CLEANUP_INTERVAL=300                 # Cache cleanup interval

# Browser Settings
BROWSER_HEADLESS=true                      # Run browsers in headless mode
BROWSER_POOL_SIZE=5                        # Browser instance pool size
BROWSER_IDLE_TIMEOUT=300                   # Browser idle timeout (seconds)
BROWSER_VIEWPORT_WIDTH=1920                # Default viewport width
BROWSER_VIEWPORT_HEIGHT=1080               # Default viewport height
```

#### AI and Processing
```env
# OpenAI Integration
OPENAI_API_KEY=sk-your-openai-key          # OpenAI API key
OPENAI_MODEL=gpt-4-turbo-preview           # Default model
OPENAI_MAX_TOKENS=4000                     # Max tokens per request
OPENAI_TEMPERATURE=0.7                     # Model temperature

# Embedding Configuration
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_BATCH_SIZE=32                    # Batch size for embeddings
EMBEDDING_MAX_LENGTH=512                   # Max text length for embedding

# Content Processing
CONTENT_MAX_SIZE=10485760                  # Max content size (10MB)
CONTENT_CHUNK_SIZE=1000                    # Text chunk size for processing
CONTENT_CHUNK_OVERLAP=200                  # Overlap between chunks
```

#### Monitoring and Logging
```env
# Logging
LOG_LEVEL=INFO                             # Logging level: DEBUG, INFO, WARNING, ERROR
LOG_FORMAT=json                            # Log format: text, json
LOG_FILE=/var/log/webharvest/app.log      # Log file path
LOG_ROTATION=daily                         # Log rotation: daily, weekly, monthly
LOG_RETENTION=30                           # Log retention days

# Monitoring
PROMETHEUS_ENABLED=true                    # Enable Prometheus metrics
PROMETHEUS_PORT=9090                       # Metrics port
HEALTH_CHECK_INTERVAL=30                   # Health check interval (seconds)

# Telemetry
TELEMETRY_ENABLED=false                    # Enable usage telemetry
TELEMETRY_ENDPOINT=https://telemetry.example.com
```

### Domain Controls

#### Per-Project Domain Configuration

Configure allowed/denied domains per project:

```json
{
  "domain_allowlist": ["example.com", "docs.example.com", "*.public-site.com"],
  "domain_denylist": ["private.example.com", "internal.*", "admin.example.com"],
  "rate_limits": {
    "example.com": {
      "requests_per_minute": 30,
      "concurrent_requests": 2,
      "delay_ms": 1000
    },
    "docs.example.com": {
      "requests_per_minute": 60,
      "concurrent_requests": 4,
      "delay_ms": 500
    }
  },
  "custom_headers": {
    "example.com": {
      "User-Agent": "Custom Bot 1.0",
      "X-API-Key": "your-api-key"
    }
  }
}
```

#### Global Domain Policies

```env
# Global domain restrictions
GLOBAL_DOMAIN_ALLOWLIST=*.edu,*.org,github.com
GLOBAL_DOMAIN_DENYLIST=*.gov,*.mil,facebook.com,twitter.com

# IP range restrictions
ALLOWED_IP_RANGES=192.168.1.0/24,10.0.0.0/8
BLOCKED_IP_RANGES=127.0.0.0/8,169.254.0.0/16

# Protocol restrictions
ALLOWED_SCHEMES=https,http
FORCE_HTTPS=true
```

#### Advanced Filtering

```json
{
  "url_patterns": {
    "include": [
      "^https?://[^/]+/docs/.*",
      "^https?://[^/]+/api/.*",
      ".*\\.pdf$"
    ],
    "exclude": [
      ".*\\.js$",
      ".*\\.css$",
      "/admin/.*",
      "/private/.*"
    ]
  },
  "content_type_filters": {
    "allowed": ["text/html", "text/plain", "application/pdf"],
    "blocked": ["application/javascript", "text/css", "image/*"]
  },
  "size_limits": {
    "max_page_size": 10485760,
    "max_total_size": 104857600
  }
}
```

## 🐳 Docker Deployment

### Production Deployment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  webharvest-api:
    image: webharvest/api:latest
    restart: always
    environment:
      - LOG_LEVEL=INFO
      - DEBUG=false
    # ... other production settings
```

### Scaling Workers

```bash
# Scale worker containers
docker-compose up -d --scale webharvest-worker=4
```

## 📊 Monitoring & Observability

### Health Checks

#### Basic Health Endpoints
```bash
# Basic health check
curl http://localhost:8080/health
# Response: {"status": "healthy", "timestamp": "2024-12-27T10:30:00Z"}

# Detailed health check
curl http://localhost:8080/health/detailed
# Response includes database, redis, and external service status

# Readiness check
curl http://localhost:8080/ready
# Response: {"ready": true, "services": ["database", "redis", "browser_pool"]}

# Liveness check
curl http://localhost:8080/live
# Response: {"alive": true, "uptime": 3600}
```

#### Health Check Configuration
```env
HEALTH_CHECK_DATABASE=true
HEALTH_CHECK_REDIS=true
HEALTH_CHECK_BROWSER_POOL=true
HEALTH_CHECK_EXTERNAL_APIS=false
HEALTH_CHECK_TIMEOUT=5
```

### Prometheus Metrics

#### Available Metrics
```bash
# Get all metrics
curl http://localhost:8080/metrics

# Key metrics include:
# - webharvest_requests_total
# - webharvest_request_duration_seconds
# - webharvest_crawl_pages_total
# - webharvest_crawl_success_rate
# - webharvest_browser_pool_size
# - webharvest_database_connections
# - webharvest_memory_usage_bytes
```

#### Grafana Dashboard

Import pre-built dashboard:

```bash
# Download dashboard JSON
wget https://raw.githubusercontent.com/your-org/webharvest/main/monitoring/grafana-dashboard.json

# Import into Grafana
curl -X POST http://admin:admin@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @grafana-dashboard.json
```

### Application Metrics

#### Performance Metrics
```python
# Custom metrics in your application
from prometheus_client import Counter, Histogram, Gauge

# Request counters
requests_total = Counter('webharvest_requests_total', 
                        'Total requests', ['method', 'endpoint', 'status'])

# Response time histogram
request_duration = Histogram('webharvest_request_duration_seconds',
                           'Request duration', ['method', 'endpoint'])

# Active crawls gauge
active_crawls = Gauge('webharvest_active_crawls', 'Number of active crawls')
```

#### Business Metrics
```python
# Crawling success rates
crawl_success_rate = Gauge('webharvest_crawl_success_rate', 
                          'Crawl success rate', ['domain'])

# Page processing time
page_process_time = Histogram('webharvest_page_process_seconds',
                             'Page processing time', ['content_type'])

# Error tracking
errors_total = Counter('webharvest_errors_total',
                      'Total errors', ['error_type', 'domain'])
```

### Logging

#### Structured Logging
```json
{
  "timestamp": "2024-12-27T10:30:00.000Z",
  "level": "INFO",
  "logger": "webharvest.crawler",
  "message": "Page scraped successfully",
  "context": {
    "url": "https://example.com/page1",
    "status_code": 200,
    "content_length": 15420,
    "processing_time": 2.45,
    "crawl_id": "crawl_123456789",
    "user_id": "user_abc123"
  },
  "trace_id": "trace_xyz789",
  "span_id": "span_456def"
}
```

#### Log Aggregation
```yaml
# docker-compose.yml - Add logging driver
version: '3.8'
services:
  webharvest-api:
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: webharvest.api
        
  # Or use JSON file driver
  webharvest-worker:
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "3"
        labels: "service=webharvest-worker"
```

### Alerting

#### Prometheus Alerting Rules
```yaml
# alerts.yml
groups:
  - name: webharvest
    rules:
      - alert: WebHarvestHighErrorRate
        expr: rate(webharvest_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
          
      - alert: WebHarvestCrawlTimeout
        expr: webharvest_crawl_duration_seconds > 3600
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Crawl taking too long
          
      - alert: WebHarvestDatabaseDown
        expr: webharvest_database_connections == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database connection lost
```

#### Notification Channels
```env
# Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#alerts

# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=alerts@yourdomain.com
SMTP_PASSWORD=your-password
ALERT_EMAIL_TO=devops@yourdomain.com

# PagerDuty integration
PAGERDUTY_ROUTING_KEY=your-pagerduty-key
```

### Performance Monitoring

#### Application Performance Monitoring (APM)
```python
# Using OpenTelemetry
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Configure tracing
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Jaeger exporter
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=14268,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)
```

#### Database Monitoring
```sql
-- Monitor slow queries
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Monitor connection usage
SELECT count(*), state
FROM pg_stat_activity
GROUP BY state;

-- Monitor table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔒 Security

### API Authentication

All API endpoints require Bearer token authentication:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Rate Limiting

Default rate limits:
- 1000 requests/hour per API key
- 2 concurrent requests per domain
- 500ms delay between domain requests

## 🧪 Testing

#### Unit Tests

```bash
# Run all tests
docker-compose exec webharvest-api pytest tests/

# Run specific test categories
pytest tests/unit/                    # Unit tests only
pytest tests/integration/             # Integration tests only
pytest tests/e2e/                     # End-to-end tests only

# Run with verbose output
pytest -v tests/

# Run specific test file
pytest tests/test_scraper.py

# Run tests matching pattern
pytest -k "test_scrape" tests/
```

#### Test Coverage

```bash
# Generate coverage report
pytest --cov=app --cov-report=html --cov-report=term

# View coverage in browser
open htmlcov/index.html

# Generate coverage for specific modules
pytest --cov=app.services --cov-report=term tests/

# Fail if coverage below threshold
pytest --cov=app --cov-fail-under=90 tests/
```

#### Integration Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
pytest tests/integration/ --integration

# Test with external services
INTEGRATION_TEST=true pytest tests/integration/

# Cleanup test environment
docker-compose -f docker-compose.test.yml down -v
```

#### Performance Tests

```bash
# Run performance benchmarks
pytest tests/performance/ --benchmark-only

# Generate performance reports
pytest tests/performance/ --benchmark-json=benchmark.json

# Compare performance over time
pytest-benchmark compare benchmark.json
```

#### Test Configuration

```python
# pytest.ini
[tool:pytest]
addopts = 
    --strict-markers
    --strict-config
    --cov=app
    --cov-report=term-missing:skip-covered
    --cov-report=html:htmlcov
    --cov-report=xml
    --cov-fail-under=85

markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    slow: Slow running tests
    external: Tests requiring external services

testpaths = tests

python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repo
git clone https://github.com/yourusername/webharvest.git

# Install dependencies
pip install -r requirements-dev.txt

# Run locally
python -m app.main
```

## 📝 License

WebHarvest is MIT licensed. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Browser automation by [Playwright](https://playwright.dev/)
- MCP protocol by [Anthropic](https://modelcontextprotocol.io/)
- UI powered by [Open WebUI](https://github.com/open-webui/open-webui)

## 📮 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/webharvest/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/webharvest/discussions)

---

**Note**: This is an early release. Features are being actively developed. Please report any issues you encounter!