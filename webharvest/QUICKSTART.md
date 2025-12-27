# WebHarvest Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites

Ensure you have:
- Docker Desktop installed and running
- 8GB+ RAM available
- Terminal/Command Line access

### 2. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/webharvest.git
cd webharvest

# Run automated setup
./scripts/setup.sh
```

The setup script will:
- Create secure passwords automatically
- Build Docker images
- Start all services
- Verify everything is working

### 3. Test the API

#### Using the Interactive Docs

Open http://localhost:8080/docs in your browser

#### Using curl

```bash
# Test health endpoint
curl http://localhost:8080/healthz

# Scrape a webpage (using test API key)
curl -X POST http://localhost:8080/v2/scrape \
  -H "Authorization: Bearer wh_test_key_123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"]
  }'
```

### 4. Access Open WebUI

1. Open http://localhost:3000
2. Create an account (first user becomes admin)
3. Start chatting!

### 5. Configure MCP in Open WebUI

1. Go to Settings → External Tools
2. Add MCP Server:
   - Name: WebHarvest
   - URL: http://webharvest-api:8080/mcp
   - Type: Streamable HTTP
3. Save settings

### 6. Try Your First Crawl

In Open WebUI chat:
```
Crawl https://docs.python.org/3/tutorial/ and add it to my knowledge base
```

## 🛠️ Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f webharvest-api
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Update Services

```bash
git pull
docker-compose build
docker-compose up -d
```

## 📊 Monitor Performance

### Check Service Health

```bash
curl http://localhost:8080/readyz | jq
```

### View Metrics

```bash
curl http://localhost:8080/metrics
```

## 🔧 Configuration

Edit `.env` file to customize:

```env
# Increase worker concurrency
WORKER_CONCURRENCY=8

# Change rate limits
DEFAULT_RATE_LIMIT_PER_DOMAIN=5
DEFAULT_DELAY_MS=1000

# Adjust crawl limits
MAX_CRAWL_PAGES=50000
```

Apply changes:
```bash
docker-compose up -d
```

## 🐛 Troubleshooting

### Services Won't Start

Check Docker is running:
```bash
docker ps
```

Check logs for errors:
```bash
docker-compose logs | grep ERROR
```

### API Returns 401 Unauthorized

Ensure you're using the correct API key:
- Test key: `wh_test_key_123456789`
- Format: `Authorization: Bearer YOUR_KEY`

### Crawls Are Slow

1. Increase worker concurrency in `.env`
2. Scale workers: `docker-compose up -d --scale webharvest-worker=4`
3. Check rate limits aren't too restrictive

### Out of Memory

1. Increase Docker memory allocation
2. Reduce `WORKER_CONCURRENCY`
3. Lower `MAX_CRAWL_PAGES`

## 📚 Next Steps

- Read the [full documentation](README.md)
- Check [API reference](http://localhost:8080/docs)
- Join our [Discord community](#)
- Report issues on [GitHub](https://github.com/yourusername/webharvest/issues)

## 🎯 Example Use Cases

### 1. Documentation Chatbot

```python
import requests

# Crawl documentation site
response = requests.post(
    "http://localhost:8080/v2/crawl",
    headers={"Authorization": "Bearer wh_test_key_123456789"},
    json={
        "url": "https://docs.example.com",
        "includePaths": ["^/api/.*"],
        "limit": 500
    }
)
crawl_id = response.json()["id"]
```

### 2. Content Monitoring

```python
# Check for changes
response = requests.post(
    "http://localhost:8080/v2/scrape",
    headers={"Authorization": "Bearer wh_test_key_123456789"},
    json={
        "url": "https://example.com/page",
        "changeTracking": True
    }
)
changes = response.json()["data"].get("changeTracking", {})
```

### 3. Batch Processing

```python
# Scrape multiple URLs
response = requests.post(
    "http://localhost:8080/v2/batch/scrape",
    headers={"Authorization": "Bearer wh_test_key_123456789"},
    json={
        "urls": [
            "https://example.com/page1",
            "https://example.com/page2",
            "https://example.com/page3"
        ],
        "scrapeOptions": {"formats": ["markdown"]}
    }
)
```

---

Need help? Check our [documentation](README.md) or [open an issue](https://github.com/yourusername/webharvest/issues)!