# WebHarvest API Code Examples

This document provides comprehensive code examples for interacting with the WebHarvest API across multiple programming languages.

## Authentication

All API requests (except health checks) require authentication using an API key in the Authorization header:

```
Authorization: Bearer wh_your_api_key_here
```

## Base URL

```
Base URL: http://localhost:8080 (development)
Base URL: https://api.webharvest.dev (production)
```

---

## 1. Health Check Endpoints

### Basic Health Check

<details>
<summary>📘 curl</summary>

```bash
curl -X GET "http://localhost:8080/healthz"
```

</details>

<details>
<summary>🐍 Python</summary>

```python
import requests

response = requests.get("http://localhost:8080/healthz")
print(response.json())

# Expected output:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T10:30:00.000Z",
#   "version": "1.0.0"
# }
```

</details>

<details>
<summary>🟨 JavaScript/Node.js</summary>

```javascript
const axios = require('axios');

async function healthCheck() {
  try {
    const response = await axios.get('http://localhost:8080/healthz');
    console.log(response.data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

healthCheck();
```

</details>

### Readiness Check

<details>
<summary>📘 curl</summary>

```bash
curl -X GET "http://localhost:8080/readyz"
```

</details>

<details>
<summary>🐍 Python</summary>

```python
import requests

response = requests.get("http://localhost:8080/readyz")
status_data = response.json()

if response.status_code == 200:
    print("✅ All systems ready")
    print(f"Checks: {status_data['checks']}")
else:
    print("❌ System not ready")
    for check, status in status_data['checks'].items():
        print(f"  {check}: {status}")
```

</details>

---

## 2. Single URL Scraping

### Basic Markdown Scraping

<details>
<summary>📘 curl</summary>

```bash
curl -X POST "http://localhost:8080/v2/scrape" \
  -H "Authorization: Bearer wh_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"]
  }'
```

</details>

<details>
<summary>🐍 Python</summary>

```python
import requests
import json

# Configuration
API_KEY = "wh_your_api_key_here"
BASE_URL = "http://localhost:8080"

def scrape_url(url, formats=None):
    """Scrape a single URL and return content"""
    if formats is None:
        formats = ["markdown"]
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "url": url,
        "formats": formats,
        "onlyMainContent": True,
        "timeout": 30000
    }
    
    response = requests.post(
        f"{BASE_URL}/v2/scrape",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        if result["success"]:
            return result["data"]
        else:
            print(f"❌ Scraping failed: {result.get('message', 'Unknown error')}")
            return None
    else:
        print(f"❌ HTTP Error: {response.status_code} - {response.text}")
        return None

# Example usage
content = scrape_url("https://example.com")
if content:
    print("📄 Title:", content.get("metadata", {}).get("title", "No title"))
    print("📝 Content preview:", content.get("markdown", "")[:200] + "...")
```

</details>

<details>
<summary>🟨 JavaScript/Node.js</summary>

```javascript
const axios = require('axios');

class WebHarvestClient {
  constructor(apiKey, baseUrl = 'http://localhost:8080') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async scrapeUrl(url, options = {}) {
    const {
      formats = ['markdown'],
      onlyMainContent = true,
      mobile = false,
      timeout = 30000
    } = options;

    try {
      const response = await axios.post(`${this.baseUrl}/v2/scrape`, {
        url,
        formats,
        onlyMainContent,
        mobile,
        timeout
      }, {
        headers: this.headers
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Scraping failed');
      }
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
      throw error;
    }
  }
}

// Example usage
async function example() {
  const client = new WebHarvestClient('wh_your_api_key_here');
  
  try {
    const content = await client.scrapeUrl('https://example.com');
    console.log('📄 Title:', content.metadata?.title || 'No title');
    console.log('📝 Content preview:', content.markdown?.substring(0, 200) + '...');
  } catch (error) {
    console.error('Failed to scrape:', error.message);
  }
}

example();
```

</details>

### Multi-Format Scraping with Screenshots

<details>
<summary>📘 curl</summary>

```bash
curl -X POST "http://localhost:8080/v2/scrape" \
  -H "Authorization: Bearer wh_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html", "links", "images", "screenshot"],
    "onlyMainContent": true,
    "mobile": false,
    "waitFor": 2000
  }'
```

</details>

<details>
<summary>🐍 Python</summary>

```python
import requests
import base64
from pathlib import Path

def comprehensive_scrape(url, save_screenshot=True):
    """Comprehensive scraping with all formats including screenshot"""
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "url": url,
        "formats": ["markdown", "html", "links", "images", "screenshot"],
        "onlyMainContent": True,
        "waitFor": 2000,  # Wait 2 seconds for page to load
        "mobile": False
    }
    
    response = requests.post(f"{BASE_URL}/v2/scrape", headers=headers, json=data)
    result = response.json()
    
    if result["success"]:
        content = result["data"]
        
        # Print extracted information
        print(f"🌐 URL: {url}")
        print(f"📄 Title: {content.get('metadata', {}).get('title', 'No title')}")
        print(f"🔗 Links found: {len(content.get('links', []))}")
        print(f"🖼️  Images found: {len(content.get('images', []))}")
        print(f"📝 Content length: {len(content.get('markdown', ''))} characters")
        
        # Save screenshot if available
        if save_screenshot and content.get('screenshot'):
            screenshot_data = base64.b64decode(content['screenshot'])
            screenshot_path = Path(f"screenshot_{url.split('/')[-1] or 'page'}.png")
            screenshot_path.write_bytes(screenshot_data)
            print(f"📸 Screenshot saved: {screenshot_path}")
        
        return content
    else:
        print(f"❌ Error: {result.get('message')}")
        return None

# Example usage
content = comprehensive_scrape("https://example.com")
```

</details>

---

## 3. Website Crawling

### Start Basic Crawl

<details>
<summary>📘 curl</summary>

```bash
curl -X POST "http://localhost:8080/v2/crawl" \
  -H "Authorization: Bearer wh_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "maxDiscoveryDepth": 3,
    "limit": 100,
    "delay": 250,
    "maxConcurrency": 3
  }'
```

</details>

<details>
<summary>🐍 Python</summary>

```python
import requests
import time

class CrawlManager:
    def __init__(self, api_key, base_url="http://localhost:8080"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def start_crawl(self, url, **kwargs):
        """Start a crawl job"""
        crawl_data = {
            "url": url,
            "maxDiscoveryDepth": kwargs.get("max_depth", 3),
            "limit": kwargs.get("limit", 100),
            "delay": kwargs.get("delay", 250),
            "maxConcurrency": kwargs.get("concurrency", 3),
            "includePaths": kwargs.get("include_paths"),
            "excludePaths": kwargs.get("exclude_paths"),
            "scrapeOptions": kwargs.get("scrape_options", {
                "formats": ["markdown"],
                "onlyMainContent": True
            })
        }
        
        # Remove None values
        crawl_data = {k: v for k, v in crawl_data.items() if v is not None}
        
        response = requests.post(
            f"{self.base_url}/v2/crawl",
            headers=self.headers,
            json=crawl_data
        )
        
        result = response.json()
        if result["success"]:
            print(f"✅ Crawl started: {result['id']}")
            return result["id"]
        else:
            print(f"❌ Failed to start crawl: {result}")
            return None
    
    def get_crawl_status(self, crawl_id):
        """Get crawl job status"""
        response = requests.get(
            f"{self.base_url}/v2/crawl/{crawl_id}",
            headers=self.headers
        )
        return response.json()
    
    def wait_for_crawl(self, crawl_id, timeout=600):
        """Wait for crawl to complete with progress updates"""
        start_time = time.time()
        last_completed = 0
        
        while time.time() - start_time < timeout:
            status = self.get_crawl_status(crawl_id)
            
            if status["success"]:
                current_status = status["status"]
                completed = status["completed"]
                total = status["total"]
                failed = status["failed"]
                
                # Show progress if changed
                if completed != last_completed:
                    print(f"📊 Progress: {completed}/{total} completed, {failed} failed")
                    last_completed = completed
                
                if current_status in ["completed", "failed", "canceled"]:
                    print(f"🏁 Crawl {current_status}")
                    return status
            
            time.sleep(5)  # Check every 5 seconds
        
        print("⏰ Crawl timeout reached")
        return self.get_crawl_status(crawl_id)

# Example usage
crawler = CrawlManager("wh_your_api_key_here")

# Start crawl with filtering
crawl_id = crawler.start_crawl(
    "https://docs.example.com",
    max_depth=5,
    limit=500,
    include_paths=["/docs/.*", "/api/.*"],
    exclude_paths=["/docs/legacy/.*"]
)

if crawl_id:
    final_status = crawler.wait_for_crawl(crawl_id)
    print(f"Final status: {final_status}")
```

</details>

<details>
<summary>🟨 JavaScript/Node.js</summary>

```javascript
const axios = require('axios');

class WebHarvestCrawler {
  constructor(apiKey, baseUrl = 'http://localhost:8080') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async startCrawl(url, options = {}) {
    const crawlData = {
      url,
      maxDiscoveryDepth: options.maxDepth || 3,
      limit: options.limit || 100,
      delay: options.delay || 250,
      maxConcurrency: options.concurrency || 3,
      includePaths: options.includePaths,
      excludePaths: options.excludePaths,
      scrapeOptions: options.scrapeOptions || {
        formats: ['markdown'],
        onlyMainContent: true
      }
    };

    // Remove undefined values
    Object.keys(crawlData).forEach(key => 
      crawlData[key] === undefined && delete crawlData[key]
    );

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/crawl`,
        crawlData,
        { headers: this.headers }
      );

      if (response.data.success) {
        console.log(`✅ Crawl started: ${response.data.id}`);
        return response.data.id;
      } else {
        throw new Error(response.data.message || 'Failed to start crawl');
      }
    } catch (error) {
      console.error('❌ Crawl start error:', error.message);
      throw error;
    }
  }

  async getCrawlStatus(crawlId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/crawl/${crawlId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Status check error:', error.message);
      throw error;
    }
  }

  async waitForCrawl(crawlId, timeout = 600000) {
    const startTime = Date.now();
    let lastCompleted = 0;

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Crawl timeout reached'));
          return;
        }

        try {
          const status = await this.getCrawlStatus(crawlId);
          
          if (status.success) {
            const { status: crawlStatus, completed, total, failed } = status;
            
            // Show progress if changed
            if (completed !== lastCompleted) {
              console.log(`📊 Progress: ${completed}/${total} completed, ${failed} failed`);
              lastCompleted = completed;
            }
            
            if (['completed', 'failed', 'canceled'].includes(crawlStatus)) {
              console.log(`🏁 Crawl ${crawlStatus}`);
              resolve(status);
              return;
            }
          }
          
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  }
}

// Example usage
async function crawlExample() {
  const crawler = new WebHarvestCrawler('wh_your_api_key_here');
  
  try {
    const crawlId = await crawler.startCrawl('https://docs.example.com', {
      maxDepth: 5,
      limit: 500,
      includePaths: ['/docs/.*', '/api/.*'],
      excludePaths: ['/docs/legacy/.*']
    });
    
    const finalStatus = await crawler.waitForCrawl(crawlId);
    console.log('Final status:', finalStatus);
    
    // Access crawl data
    if (finalStatus.data && finalStatus.data.length > 0) {
      console.log(`📚 Scraped ${finalStatus.data.length} pages`);
      finalStatus.data.forEach(page => {
        console.log(`  📄 ${page.url} - ${page.metadata?.title || 'No title'}`);
      });
    }
    
  } catch (error) {
    console.error('Crawl failed:', error.message);
  }
}

crawlExample();
```

</details>

### Advanced Crawl with Webhooks

<details>
<summary>🐍 Python</summary>

```python
import requests
from flask import Flask, request, jsonify

# Simple webhook receiver for demonstration
app = Flask(__name__)

@app.route('/webhook/crawl-complete', methods=['POST'])
def crawl_webhook():
    """Handle crawl completion webhook"""
    data = request.json
    print(f"🎉 Crawl {data.get('crawl_id')} completed!")
    print(f"   Status: {data.get('status')}")
    print(f"   Pages: {data.get('completed')}/{data.get('total')}")
    return jsonify({"received": True})

def start_crawl_with_webhook(url):
    """Start crawl with webhook notification"""
    crawl_data = {
        "url": url,
        "maxDiscoveryDepth": 5,
        "limit": 1000,
        "webhook": {
            "url": "https://your-domain.com/webhook/crawl-complete",
            "headers": {
                "X-Webhook-Secret": "your-secret-here"
            }
        },
        "scrapeOptions": {
            "formats": ["markdown", "links"],
            "onlyMainContent": True
        }
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{BASE_URL}/v2/crawl", headers=headers, json=crawl_data)
    return response.json()

# Start webhook server in background and initiate crawl
if __name__ == '__main__':
    # In a real application, run webhook server separately
    result = start_crawl_with_webhook("https://docs.example.com")
    print(f"Crawl started: {result}")
    
    # app.run(host='0.0.0.0', port=5000)  # Webhook receiver
```

</details>

---

## 4. Site Mapping

### Fast URL Discovery

<details>
<summary>📘 curl</summary>

```bash
curl -X POST "http://localhost:8080/v2/map" \
  -H "Authorization: Bearer wh_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "limit": 1000,
    "search": "api"
  }'
```

</details>

<details>
<summary>🐍 Python</summary>

```python
def map_website(url, search_term=None, limit=1000):
    """Map website URLs without content extraction"""
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "url": url,
        "limit": limit,
        "ignoreSitemap": False,
        "sitemapOnly": False
    }
    
    if search_term:
        data["search"] = search_term
    
    response = requests.post(f"{BASE_URL}/v2/map", headers=headers, json=data)
    result = response.json()
    
    if result["success"]:
        links = result["links"]
        metadata = result["metadata"]
        
        print(f"🗺️  Site Map Results for {url}")
        print(f"   Found {len(links)} URLs")
        print(f"   Total discovered: {metadata['total']}")
        print(f"   Results truncated: {metadata['truncated']}")
        print(f"   Sitemap found: {metadata['sitemapFound']}")
        
        # Group URLs by path
        url_groups = {}
        for link in links:
            try:
                path = link.split('/', 3)[3] if len(link.split('/')) > 3 else '/'
                base_path = '/' + path.split('/')[1] if '/' in path else '/'
                if base_path not in url_groups:
                    url_groups[base_path] = []
                url_groups[base_path].append(link)
            except:
                continue
        
        # Display grouped results
        for path, urls in url_groups.items():
            print(f"\n📁 {path} ({len(urls)} URLs)")
            for url in urls[:5]:  # Show first 5
                print(f"   🔗 {url}")
            if len(urls) > 5:
                print(f"   ... and {len(urls) - 5} more")
        
        return links
    else:
        print(f"❌ Mapping failed: {result.get('message')}")
        return None

# Example usage
links = map_website("https://docs.example.com", search_term="api", limit=500)
```

</details>

---

## 5. Batch Processing

### Batch Scrape Multiple URLs

<details>
<summary>📘 curl</summary>

```bash
curl -X POST "http://localhost:8080/v2/batch/scrape" \
  -H "Authorization: Bearer wh_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com/page1",
      "https://example.com/page2",
      "https://example.com/page3"
    ],
    "maxConcurrency": 5,
    "scrapeOptions": {
      "formats": ["markdown", "links"],
      "onlyMainContent": true
    }
  }'
```

</details>

<details>
<summary>🐍 Python</summary>

```python
import requests
import time
from urllib.parse import urlparse

class BatchProcessor:
    def __init__(self, api_key, base_url="http://localhost:8080"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def start_batch_scrape(self, urls, concurrency=5, scrape_options=None):
        """Start batch scraping job"""
        if scrape_options is None:
            scrape_options = {
                "formats": ["markdown"],
                "onlyMainContent": True
            }
        
        batch_data = {
            "urls": urls,
            "maxConcurrency": concurrency,
            "ignoreInvalidURLs": True,
            "scrapeOptions": scrape_options
        }
        
        response = requests.post(
            f"{self.base_url}/v2/batch/scrape",
            headers=self.headers,
            json=batch_data
        )
        
        result = response.json()
        if result["success"]:
            print(f"✅ Batch started: {result['id']}")
            if result.get("invalidURLs"):
                print(f"⚠️  Invalid URLs: {result['invalidURLs']}")
            return result["id"]
        else:
            print(f"❌ Batch failed: {result}")
            return None
    
    def get_batch_status(self, batch_id):
        """Get batch processing status"""
        response = requests.get(
            f"{self.base_url}/v2/batch/scrape/{batch_id}",
            headers=self.headers
        )
        return response.json()
    
    def wait_for_batch(self, batch_id, timeout=600):
        """Wait for batch to complete"""
        start_time = time.time()
        last_completed = 0
        
        while time.time() - start_time < timeout:
            status = self.get_batch_status(batch_id)
            
            if status["success"]:
                current_status = status["status"]
                completed = status["completed"]
                total = status["total"]
                failed = status["failed"]
                
                if completed != last_completed:
                    progress = (completed / total * 100) if total > 0 else 0
                    print(f"📊 Progress: {completed}/{total} ({progress:.1f}%) completed, {failed} failed")
                    last_completed = completed
                
                if current_status in ["completed", "failed"]:
                    print(f"🏁 Batch {current_status}")
                    return status
            
            time.sleep(3)
        
        print("⏰ Batch timeout reached")
        return self.get_batch_status(batch_id)
    
    def process_urls_from_file(self, filename):
        """Process URLs from a text file"""
        try:
            with open(filename, 'r') as f:
                urls = [line.strip() for line in f if line.strip()]
            
            # Validate URLs
            valid_urls = []
            for url in urls:
                try:
                    parsed = urlparse(url)
                    if parsed.scheme in ['http', 'https']:
                        valid_urls.append(url)
                except:
                    print(f"⚠️  Skipping invalid URL: {url}")
            
            print(f"📝 Processing {len(valid_urls)} valid URLs from {filename}")
            
            # Process in chunks of 50
            chunk_size = 50
            all_results = []
            
            for i in range(0, len(valid_urls), chunk_size):
                chunk = valid_urls[i:i + chunk_size]
                print(f"\n🔄 Processing chunk {i//chunk_size + 1} ({len(chunk)} URLs)")
                
                batch_id = self.start_batch_scrape(chunk, concurrency=10)
                if batch_id:
                    result = self.wait_for_batch(batch_id)
                    if result and result.get("data"):
                        all_results.extend(result["data"])
            
            return all_results
            
        except FileNotFoundError:
            print(f"❌ File not found: {filename}")
            return None

# Example usage
processor = BatchProcessor("wh_your_api_key_here")

# Method 1: Process URL list directly
urls = [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3",
    "https://example.com/about",
    "https://example.com/contact"
]

batch_id = processor.start_batch_scrape(
    urls, 
    concurrency=3,
    scrape_options={
        "formats": ["markdown", "links"],
        "onlyMainContent": True
    }
)

if batch_id:
    final_result = processor.wait_for_batch(batch_id)
    print(f"\n📋 Final Results:")
    for page in final_result.get("data", []):
        title = page.get("metadata", {}).get("title", "No title")
        print(f"  📄 {page['url']} - {title}")

# Method 2: Process URLs from file
# Create urls.txt with one URL per line, then:
# results = processor.process_urls_from_file("urls.txt")
```

</details>

---

## 6. Model Context Protocol (MCP) Integration

### MCP Tool Calling

<details>
<summary>🐍 Python MCP Client</summary>

```python
import requests
import json

class MCPClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.rpc_url = f"{base_url}/mcp"
    
    def _call_rpc(self, method, params=None):
        """Make JSON-RPC call to MCP server"""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or {}
        }
        
        response = requests.post(self.rpc_url, json=payload)
        result = response.json()
        
        if "error" in result:
            raise Exception(f"MCP Error: {result['error']}")
        
        return result.get("result")
    
    def initialize(self):
        """Initialize MCP connection"""
        return self._call_rpc("initialize")
    
    def list_tools(self):
        """List available MCP tools"""
        return self._call_rpc("tools/list")
    
    def call_tool(self, tool_name, arguments):
        """Call an MCP tool"""
        return self._call_rpc("tools/call", {
            "name": tool_name,
            "arguments": arguments
        })
    
    def list_prompts(self):
        """List available prompts"""
        return self._call_rpc("prompts/list")
    
    def get_prompt(self, prompt_name, arguments=None):
        """Get a specific prompt"""
        return self._call_rpc("prompts/get", {
            "name": prompt_name,
            "arguments": arguments or {}
        })

# Example usage
mcp = MCPClient()

# Initialize connection
init_result = mcp.initialize()
print("MCP Initialized:", init_result["serverInfo"]["name"])

# List available tools
tools = mcp.list_tools()
print("\nAvailable tools:")
for tool in tools["tools"]:
    print(f"  🛠️  {tool['name']}: {tool['description']}")

# Scrape a URL using MCP
scrape_result = mcp.call_tool("scrape_url", {
    "url": "https://example.com",
    "formats": ["markdown"],
    "onlyMainContent": True
})
print(f"\nScrape result: {scrape_result}")

# Start a crawl using MCP
crawl_result = mcp.call_tool("crawl_site", {
    "url": "https://docs.example.com",
    "maxDepth": 3,
    "limit": 50
})
print(f"\nCrawl started: {crawl_result}")

# Check crawl status
if crawl_result.get("crawl_id"):
    status_result = mcp.call_tool("get_crawl_status", {
        "crawl_id": crawl_result["crawl_id"]
    })
    print(f"Crawl status: {status_result}")

# Get documentation ingestion prompt
prompts = mcp.list_prompts()
print(f"\nAvailable prompts: {[p['name'] for p in prompts['prompts']]}")

doc_prompt = mcp.get_prompt("ingest_docs", {
    "url": "https://docs.example.com",
    "collection_name": "Example Documentation"
})
print(f"\nDocumentation prompt: {doc_prompt['messages'][0]['content']}")
```

</details>

---

## 7. Complete Workflows

### Documentation Ingestion Workflow

<details>
<summary>🐍 Python</summary>

```python
import requests
import time
import json
from pathlib import Path

class DocumentationIngester:
    def __init__(self, api_key, base_url="http://localhost:8080"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def ingest_documentation(self, doc_url, collection_name="Documentation", max_depth=5, max_pages=1000):
        """Complete documentation ingestion workflow"""
        
        print(f"📚 Starting documentation ingestion for {doc_url}")
        
        # Step 1: Map the site to understand structure
        print("🗺️  Step 1: Mapping site structure...")
        map_result = self._map_site(doc_url)
        if not map_result:
            return False
        
        print(f"   Found {len(map_result['links'])} URLs")
        
        # Step 2: Start comprehensive crawl
        print("🕷️  Step 2: Starting documentation crawl...")
        crawl_id = self._start_doc_crawl(doc_url, max_depth, max_pages)
        if not crawl_id:
            return False
        
        # Step 3: Wait for crawl completion
        print("⏳ Step 3: Waiting for crawl completion...")
        crawl_result = self._wait_for_crawl(crawl_id)
        if not crawl_result:
            return False
        
        # Step 4: Process and save results
        print("💾 Step 4: Processing results...")
        pages = crawl_result.get("data", [])
        if pages:
            self._save_documentation(pages, collection_name)
            print(f"✅ Successfully ingested {len(pages)} documentation pages")
            return True
        else:
            print("❌ No pages were crawled")
            return False
    
    def _map_site(self, url):
        """Map site to understand structure"""
        data = {
            "url": url,
            "limit": 5000,
            "ignoreSitemap": False
        }
        
        response = requests.post(f"{self.base_url}/v2/map", headers=self.headers, json=data)
        result = response.json()
        return result if result.get("success") else None
    
    def _start_doc_crawl(self, url, max_depth, max_pages):
        """Start documentation crawl with optimized settings"""
        data = {
            "url": url,
            "maxDiscoveryDepth": max_depth,
            "limit": max_pages,
            "delay": 500,  # Be respectful to docs sites
            "maxConcurrency": 3,
            "includePaths": [
                "/docs/.*",
                "/documentation/.*", 
                "/guide/.*",
                "/tutorial/.*",
                "/api/.*",
                "/reference/.*"
            ],
            "excludePaths": [
                "/blog/.*",
                "/news/.*",
                ".*\\.pdf$",
                ".*\\.zip$"
            ],
            "scrapeOptions": {
                "formats": ["markdown", "links"],
                "onlyMainContent": True
            }
        }
        
        response = requests.post(f"{self.base_url}/v2/crawl", headers=self.headers, json=data)
        result = response.json()
        return result["id"] if result.get("success") else None
    
    def _wait_for_crawl(self, crawl_id):
        """Wait for crawl with progress updates"""
        last_update = time.time()
        
        while True:
            response = requests.get(f"{self.base_url}/v2/crawl/{crawl_id}", headers=self.headers)
            status = response.json()
            
            if not status.get("success"):
                print("❌ Failed to get crawl status")
                return None
            
            current_status = status["status"]
            completed = status["completed"]
            total = status["total"] 
            failed = status["failed"]
            
            # Update progress every 10 seconds
            if time.time() - last_update > 10:
                print(f"   📊 {completed}/{total} pages processed ({failed} failed)")
                last_update = time.time()
            
            if current_status in ["completed", "failed", "canceled"]:
                return status
                
            time.sleep(5)
    
    def _save_documentation(self, pages, collection_name):
        """Save documentation pages to files"""
        output_dir = Path(f"docs_{collection_name.lower().replace(' ', '_')}")
        output_dir.mkdir(exist_ok=True)
        
        # Save individual pages
        for i, page in enumerate(pages):
            url = page.get("url", "")
            title = page.get("metadata", {}).get("title", f"page_{i}")
            markdown = page.get("markdown", "")
            
            # Create safe filename
            safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            filename = f"{i:03d}_{safe_title[:50]}.md"
            
            file_path = output_dir / filename
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"# {title}\n\n")
                f.write(f"**Source:** {url}\n\n")
                f.write(markdown)
            
            print(f"   📄 Saved: {filename}")
        
        # Save summary
        summary_path = output_dir / "summary.json"
        summary = {
            "collection_name": collection_name,
            "total_pages": len(pages),
            "ingested_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "pages": [
                {
                    "url": page.get("url"),
                    "title": page.get("metadata", {}).get("title"),
                    "word_count": len(page.get("markdown", "").split()) if page.get("markdown") else 0
                }
                for page in pages
            ]
        }
        
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"   📋 Summary saved: {summary_path}")

# Example usage
ingester = DocumentationIngester("wh_your_api_key_here")

# Ingest popular documentation sites
docs_sites = [
    ("https://docs.python.org", "Python Documentation"),
    ("https://docs.djangoproject.com", "Django Documentation"), 
    ("https://reactjs.org/docs", "React Documentation"),
    ("https://docs.fastapi.tiangolo.com", "FastAPI Documentation")
]

for url, name in docs_sites:
    print(f"\n{'='*50}")
    success = ingester.ingest_documentation(
        doc_url=url,
        collection_name=name,
        max_depth=4,
        max_pages=500
    )
    
    if success:
        print(f"✅ {name} ingestion completed")
    else:
        print(f"❌ {name} ingestion failed")
```

</details>

### Change Detection Workflow

<details>
<summary>🐍 Python</summary>

```python
import requests
import json
import time
from datetime import datetime, timedelta
import hashlib

class ChangeDetector:
    def __init__(self, api_key, base_url="http://localhost:8080"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def detect_changes(self, url, comparison_interval_hours=24):
        """Detect changes by comparing current crawl with previous one"""
        
        print(f"🔍 Starting change detection for {url}")
        
        # Step 1: Load previous crawl data if available
        previous_data = self._load_previous_crawl(url)
        
        # Step 2: Perform new crawl
        print("🕷️  Performing fresh crawl...")
        new_crawl_id = self._start_crawl(url)
        if not new_crawl_id:
            return None
        
        new_data = self._wait_for_crawl(new_crawl_id)
        if not new_data:
            return None
        
        # Step 3: Compare results
        print("🔄 Analyzing changes...")
        changes = self._compare_crawls(previous_data, new_data)
        
        # Step 4: Save new data for future comparison
        self._save_crawl_data(url, new_data)
        
        # Step 5: Generate report
        report = self._generate_change_report(url, changes)
        print("📊 Change detection completed")
        
        return report
    
    def _start_crawl(self, url):
        """Start a crawl for change detection"""
        data = {
            "url": url,
            "maxDiscoveryDepth": 5,
            "limit": 1000,
            "delay": 250,
            "maxConcurrency": 5,
            "scrapeOptions": {
                "formats": ["markdown"],
                "onlyMainContent": True
            }
        }
        
        response = requests.post(f"{self.base_url}/v2/crawl", headers=self.headers, json=data)
        result = response.json()
        return result["id"] if result.get("success") else None
    
    def _wait_for_crawl(self, crawl_id):
        """Wait for crawl completion"""
        while True:
            response = requests.get(f"{self.base_url}/v2/crawl/{crawl_id}", headers=self.headers)
            status = response.json()
            
            if not status.get("success"):
                return None
            
            if status["status"] == "completed":
                return status
            elif status["status"] in ["failed", "canceled"]:
                return None
            
            time.sleep(5)
    
    def _load_previous_crawl(self, url):
        """Load previous crawl data from file"""
        filename = f"crawl_data_{hashlib.md5(url.encode()).hexdigest()}.json"
        try:
            with open(filename, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("   No previous crawl data found")
            return None
    
    def _save_crawl_data(self, url, crawl_data):
        """Save crawl data for future comparison"""
        filename = f"crawl_data_{hashlib.md5(url.encode()).hexdigest()}.json"
        save_data = {
            "url": url,
            "crawled_at": datetime.now().isoformat(),
            "data": crawl_data
        }
        
        with open(filename, 'w') as f:
            json.dump(save_data, f, indent=2)
    
    def _compare_crawls(self, previous_data, new_data):
        """Compare two crawl results to detect changes"""
        if not previous_data:
            return {
                "new_pages": len(new_data.get("data", [])),
                "modified_pages": 0,
                "removed_pages": 0,
                "total_changes": len(new_data.get("data", []))
            }
        
        prev_pages = {page["url"]: page for page in previous_data["data"]["data"]}
        new_pages = {page["url"]: page for page in new_data.get("data", [])}
        
        # Find new pages
        new_urls = set(new_pages.keys()) - set(prev_pages.keys())
        
        # Find removed pages  
        removed_urls = set(prev_pages.keys()) - set(new_pages.keys())
        
        # Find modified pages
        modified_pages = []
        for url in set(prev_pages.keys()) & set(new_pages.keys()):
            prev_content = prev_pages[url].get("markdown", "")
            new_content = new_pages[url].get("markdown", "")
            
            prev_hash = hashlib.md5(prev_content.encode()).hexdigest()
            new_hash = hashlib.md5(new_content.encode()).hexdigest()
            
            if prev_hash != new_hash:
                modified_pages.append({
                    "url": url,
                    "title": new_pages[url].get("metadata", {}).get("title", ""),
                    "prev_length": len(prev_content),
                    "new_length": len(new_content),
                    "change_ratio": abs(len(new_content) - len(prev_content)) / max(len(prev_content), 1)
                })
        
        return {
            "new_pages": [{"url": url, "title": new_pages[url].get("metadata", {}).get("title", "")} for url in new_urls],
            "removed_pages": [{"url": url, "title": prev_pages[url].get("metadata", {}).get("title", "")} for url in removed_urls],
            "modified_pages": modified_pages,
            "summary": {
                "new_count": len(new_urls),
                "removed_count": len(removed_urls), 
                "modified_count": len(modified_pages),
                "total_changes": len(new_urls) + len(removed_urls) + len(modified_pages)
            }
        }
    
    def _generate_change_report(self, url, changes):
        """Generate a human-readable change report"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        report = {
            "url": url,
            "detected_at": timestamp,
            "summary": changes["summary"],
            "details": changes
        }
        
        # Print summary
        summary = changes["summary"]
        print(f"\n📋 Change Detection Report for {url}")
        print(f"   Detected at: {timestamp}")
        print(f"   🆕 New pages: {summary['new_count']}")
        print(f"   🗑️  Removed pages: {summary['removed_count']}")
        print(f"   ✏️  Modified pages: {summary['modified_count']}")
        print(f"   📊 Total changes: {summary['total_changes']}")
        
        if summary['total_changes'] == 0:
            print("   ✅ No changes detected")
        else:
            # Show details
            if changes["new_pages"]:
                print(f"\n   🆕 New Pages:")
                for page in changes["new_pages"][:5]:
                    print(f"      • {page['url']} - {page['title']}")
                if len(changes["new_pages"]) > 5:
                    print(f"      ... and {len(changes['new_pages']) - 5} more")
            
            if changes["modified_pages"]:
                print(f"\n   ✏️  Modified Pages:")
                for page in changes["modified_pages"][:5]:
                    ratio = page['change_ratio'] * 100
                    print(f"      • {page['url']} - {page['title']} ({ratio:.1f}% change)")
                if len(changes["modified_pages"]) > 5:
                    print(f"      ... and {len(changes['modified_pages']) - 5} more")
            
            if changes["removed_pages"]:
                print(f"\n   🗑️  Removed Pages:")
                for page in changes["removed_pages"][:5]:
                    print(f"      • {page['url']} - {page['title']}")
        
        # Save detailed report
        report_filename = f"change_report_{hashlib.md5(url.encode()).hexdigest()}_{int(time.time())}.json"
        with open(report_filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n   📄 Detailed report saved: {report_filename}")
        
        return report

# Example usage
detector = ChangeDetector("wh_your_api_key_here")

# Monitor specific sites for changes
monitored_sites = [
    "https://docs.python.org",
    "https://blog.example.com", 
    "https://company.com/docs"
]

for site in monitored_sites:
    print(f"\n{'='*60}")
    report = detector.detect_changes(site)
    
    if report and report["summary"]["total_changes"] > 0:
        print(f"🚨 Changes detected on {site}!")
        # You could send alerts, webhooks, etc. here
    else:
        print(f"✅ No changes on {site}")
```

</details>

---

## 8. Error Handling and Best Practices

### Robust Error Handling

<details>
<summary>🐍 Python</summary>

```python
import requests
import time
import logging
from typing import Optional, Dict, Any
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class RobustWebHarvestClient:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8080"):
        self.api_key = api_key
        self.base_url = base_url
        self.logger = self._setup_logging()
        self.session = self._setup_session()
    
    def _setup_logging(self):
        """Setup logging for the client"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger('WebHarvestClient')
    
    def _setup_session(self):
        """Setup requests session with retry strategy"""
        session = requests.Session()
        
        # Retry strategy
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            method_whitelist=["HEAD", "GET", "OPTIONS"],
            backoff_factor=1
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Default headers
        session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'WebHarvest-Client/1.0'
        })
        
        return session
    
    def _handle_response(self, response: requests.Response) -> Optional[Dict[Any, Any]]:
        """Handle API response with proper error handling"""
        try:
            data = response.json()
        except ValueError as e:
            self.logger.error(f"Invalid JSON response: {e}")
            return None
        
        if response.status_code == 200:
            if data.get("success"):
                return data
            else:
                self.logger.error(f"API returned success=false: {data.get('message')}")
                return None
        
        elif response.status_code == 401:
            self.logger.error("Authentication failed - check API key")
            return None
        
        elif response.status_code == 429:
            self.logger.warning("Rate limit exceeded - waiting before retry")
            time.sleep(60)  # Wait 1 minute
            return None
        
        elif response.status_code >= 500:
            self.logger.error(f"Server error {response.status_code}: {data.get('message', 'Unknown error')}")
            return None
        
        else:
            self.logger.error(f"Unexpected status code {response.status_code}: {data}")
            return None
    
    def scrape_url_safe(self, url: str, retries: int = 3, **kwargs) -> Optional[Dict[Any, Any]]:
        """Safely scrape a URL with retries and error handling"""
        
        for attempt in range(retries):
            try:
                self.logger.info(f"Scraping {url} (attempt {attempt + 1}/{retries})")
                
                payload = {
                    "url": url,
                    "formats": kwargs.get("formats", ["markdown"]),
                    "onlyMainContent": kwargs.get("only_main_content", True),
                    "timeout": kwargs.get("timeout", 30000),
                    "maxAge": kwargs.get("max_age", 172800000)
                }
                
                response = self.session.post(f"{self.base_url}/v2/scrape", json=payload, timeout=60)
                result = self._handle_response(response)
                
                if result:
                    self.logger.info(f"Successfully scraped {url}")
                    return result["data"]
                
                if attempt < retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    self.logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                
            except requests.exceptions.Timeout:
                self.logger.warning(f"Timeout scraping {url} (attempt {attempt + 1})")
            except requests.exceptions.ConnectionError:
                self.logger.warning(f"Connection error scraping {url} (attempt {attempt + 1})")
            except Exception as e:
                self.logger.error(f"Unexpected error scraping {url}: {e}")
                break
        
        self.logger.error(f"Failed to scrape {url} after {retries} attempts")
        return None
    
    def start_crawl_safe(self, url: str, **kwargs) -> Optional[str]:
        """Safely start a crawl with validation"""
        
        # Validate URL
        if not url.startswith(('http://', 'https://')):
            self.logger.error(f"Invalid URL format: {url}")
            return None
        
        try:
            payload = {
                "url": url,
                "maxDiscoveryDepth": kwargs.get("max_depth", 3),
                "limit": kwargs.get("limit", 100),
                "delay": max(250, kwargs.get("delay", 250)),  # Minimum 250ms delay
                "maxConcurrency": min(10, kwargs.get("max_concurrency", 3)),  # Max 10 concurrent
                "scrapeOptions": kwargs.get("scrape_options", {
                    "formats": ["markdown"],
                    "onlyMainContent": True
                })
            }
            
            # Add optional parameters
            if kwargs.get("include_paths"):
                payload["includePaths"] = kwargs["include_paths"]
            if kwargs.get("exclude_paths"):
                payload["excludePaths"] = kwargs["exclude_paths"]
            
            response = self.session.post(f"{self.base_url}/v2/crawl", json=payload, timeout=30)
            result = self._handle_response(response)
            
            if result:
                crawl_id = result["id"]
                self.logger.info(f"Started crawl {crawl_id} for {url}")
                return crawl_id
            
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to start crawl for {url}: {e}")
            return None
    
    def monitor_crawl_safe(self, crawl_id: str, timeout: int = 1800) -> Optional[Dict[Any, Any]]:
        """Safely monitor crawl progress with timeout"""
        
        start_time = time.time()
        last_progress_time = start_time
        last_completed = 0
        
        self.logger.info(f"Monitoring crawl {crawl_id}")
        
        while time.time() - start_time < timeout:
            try:
                response = self.session.get(f"{self.base_url}/v2/crawl/{crawl_id}", timeout=30)
                result = self._handle_response(response)
                
                if not result:
                    time.sleep(10)
                    continue
                
                status = result["status"]
                completed = result["completed"]
                total = result["total"]
                failed = result["failed"]
                
                # Check for progress
                if completed > last_completed:
                    last_progress_time = time.time()
                    last_completed = completed
                    progress = (completed / total * 100) if total > 0 else 0
                    self.logger.info(f"Crawl progress: {completed}/{total} ({progress:.1f}%) completed, {failed} failed")
                
                # Check for stalled crawl (no progress for 10 minutes)
                if time.time() - last_progress_time > 600:
                    self.logger.warning(f"Crawl {crawl_id} appears stalled - no progress for 10 minutes")
                
                if status in ["completed", "failed", "canceled"]:
                    self.logger.info(f"Crawl {crawl_id} finished with status: {status}")
                    return result
                
                time.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                self.logger.warning(f"Error checking crawl status: {e}")
                time.sleep(30)  # Wait longer after error
        
        self.logger.error(f"Crawl {crawl_id} monitoring timed out after {timeout} seconds")
        return None
    
    def health_check(self) -> bool:
        """Check if the API is healthy"""
        try:
            response = self.session.get(f"{self.base_url}/healthz", timeout=10)
            return response.status_code == 200
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            return False

# Example usage with comprehensive error handling
def main():
    client = RobustWebHarvestClient("wh_your_api_key_here")
    
    # Check API health first
    if not client.health_check():
        print("❌ API is not healthy")
        return
    
    print("✅ API is healthy")
    
    # Test scraping with error handling
    test_urls = [
        "https://httpbin.org/html",  # Should work
        "https://httpbin.org/status/404",  # Will fail
        "https://httpbin.org/delay/5",  # Slow response
        "invalid-url",  # Invalid format
    ]
    
    for url in test_urls:
        result = client.scrape_url_safe(url)
        if result:
            title = result.get("metadata", {}).get("title", "No title")
            print(f"✅ Scraped: {url} - {title}")
        else:
            print(f"❌ Failed: {url}")
    
    # Test crawling with monitoring
    crawl_id = client.start_crawl_safe(
        "https://httpbin.org",
        max_depth=2,
        limit=10,
        delay=1000  # Be respectful
    )
    
    if crawl_id:
        final_result = client.monitor_crawl_safe(crawl_id, timeout=300)  # 5 minute timeout
        if final_result:
            print(f"✅ Crawl completed: {final_result['completed']} pages")
        else:
            print("❌ Crawl failed or timed out")

if __name__ == "__main__":
    main()
```

</details>

---

## 9. SDK Integration Examples

### WebHarvest Python SDK (Conceptual)

<details>
<summary>🐍 Python SDK</summary>

```python
# webharvest_sdk.py - Conceptual Python SDK

from typing import List, Dict, Any, Optional, Union, Callable
import asyncio
import aiohttp
import time
from dataclasses import dataclass
from enum import Enum

class ScrapeFormat(Enum):
    MARKDOWN = "markdown"
    HTML = "html"
    RAW_HTML = "rawHtml"
    LINKS = "links"
    IMAGES = "images"
    SCREENSHOT = "screenshot"

class JobStatus(Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"

@dataclass
class ScrapeOptions:
    formats: List[ScrapeFormat] = None
    only_main_content: bool = True
    include_tags: List[str] = None
    exclude_tags: List[str] = None
    headers: Dict[str, str] = None
    wait_for: int = None
    mobile: bool = False
    timeout: int = 30000
    max_age: int = 172800000
    actions: List[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.formats is None:
            self.formats = [ScrapeFormat.MARKDOWN]

@dataclass
class CrawlOptions:
    max_discovery_depth: int = 10
    limit: int = 5000
    include_paths: List[str] = None
    exclude_paths: List[str] = None
    sitemap: str = "include"
    ignore_query_parameters: bool = False
    crawl_entire_domain: bool = False
    allow_external_links: bool = False
    allow_subdomains: bool = False
    delay: int = 250
    max_concurrency: int = 5
    webhook: Dict[str, Any] = None
    scrape_options: ScrapeOptions = None

class WebHarvestSDK:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8080"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def scrape(self, url: str, options: ScrapeOptions = None) -> Dict[str, Any]:
        """Scrape a single URL"""
        if options is None:
            options = ScrapeOptions()
        
        payload = {
            "url": url,
            "formats": [fmt.value for fmt in options.formats],
            "onlyMainContent": options.only_main_content,
            "mobile": options.mobile,
            "timeout": options.timeout,
            "maxAge": options.max_age
        }
        
        if options.include_tags:
            payload["includeTags"] = options.include_tags
        if options.exclude_tags:
            payload["excludeTags"] = options.exclude_tags
        if options.headers:
            payload["headers"] = options.headers
        if options.wait_for:
            payload["waitFor"] = options.wait_for
        if options.actions:
            payload["actions"] = options.actions
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v2/scrape",
                headers=self.headers,
                json=payload
            ) as response:
                result = await response.json()
                if result.get("success"):
                    return result["data"]
                raise Exception(f"Scraping failed: {result.get('message')}")
    
    async def start_crawl(self, url: str, options: CrawlOptions = None) -> str:
        """Start a crawl job and return the job ID"""
        if options is None:
            options = CrawlOptions()
        
        payload = {
            "url": url,
            "maxDiscoveryDepth": options.max_discovery_depth,
            "limit": options.limit,
            "sitemap": options.sitemap,
            "ignoreQueryParameters": options.ignore_query_parameters,
            "crawlEntireDomain": options.crawl_entire_domain,
            "allowExternalLinks": options.allow_external_links,
            "allowSubdomains": options.allow_subdomains,
            "delay": options.delay,
            "maxConcurrency": options.max_concurrency
        }
        
        if options.include_paths:
            payload["includePaths"] = options.include_paths
        if options.exclude_paths:
            payload["excludePaths"] = options.exclude_paths
        if options.webhook:
            payload["webhook"] = options.webhook
        if options.scrape_options:
            payload["scrapeOptions"] = {
                "formats": [fmt.value for fmt in options.scrape_options.formats],
                "onlyMainContent": options.scrape_options.only_main_content
            }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v2/crawl",
                headers=self.headers,
                json=payload
            ) as response:
                result = await response.json()
                if result.get("success"):
                    return result["id"]
                raise Exception(f"Failed to start crawl: {result.get('message')}")
    
    async def get_crawl_status(self, crawl_id: str) -> Dict[str, Any]:
        """Get crawl job status"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/v2/crawl/{crawl_id}",
                headers=self.headers
            ) as response:
                result = await response.json()
                if result.get("success"):
                    return result
                raise Exception(f"Failed to get crawl status: {result.get('message')}")
    
    async def wait_for_crawl(
        self, 
        crawl_id: str, 
        timeout: int = 1800,
        progress_callback: Callable[[int, int, int], None] = None
    ) -> Dict[str, Any]:
        """Wait for crawl completion with optional progress callback"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = await self.get_crawl_status(crawl_id)
            
            current_status = status["status"]
            completed = status["completed"]
            total = status["total"]
            failed = status["failed"]
            
            if progress_callback:
                progress_callback(completed, total, failed)
            
            if current_status in ["completed", "failed", "canceled"]:
                return status
            
            await asyncio.sleep(5)
        
        raise TimeoutError(f"Crawl {crawl_id} timed out after {timeout} seconds")
    
    async def cancel_crawl(self, crawl_id: str) -> bool:
        """Cancel a running crawl"""
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{self.base_url}/v2/crawl/{crawl_id}",
                headers=self.headers
            ) as response:
                result = await response.json()
                return result.get("success", False)
    
    async def map_site(self, url: str, search: str = None, limit: int = 5000) -> List[str]:
        """Map a website and return discovered URLs"""
        payload = {
            "url": url,
            "limit": limit,
            "ignoreSitemap": False,
            "sitemapOnly": False
        }
        
        if search:
            payload["search"] = search
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v2/map",
                headers=self.headers,
                json=payload
            ) as response:
                result = await response.json()
                if result.get("success"):
                    return result["links"]
                raise Exception(f"Site mapping failed: {result.get('message')}")
    
    async def batch_scrape(self, urls: List[str], options: ScrapeOptions = None) -> str:
        """Start a batch scrape job"""
        if options is None:
            options = ScrapeOptions()
        
        payload = {
            "urls": urls,
            "ignoreInvalidURLs": True,
            "maxConcurrency": 10,
            "scrapeOptions": {
                "formats": [fmt.value for fmt in options.formats],
                "onlyMainContent": options.only_main_content
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v2/batch/scrape",
                headers=self.headers,
                json=payload
            ) as response:
                result = await response.json()
                if result.get("success"):
                    return result["id"]
                raise Exception(f"Failed to start batch scrape: {result.get('message')}")
    
    async def get_batch_status(self, batch_id: str) -> Dict[str, Any]:
        """Get batch job status"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/v2/batch/scrape/{batch_id}",
                headers=self.headers
            ) as response:
                result = await response.json()
                if result.get("success"):
                    return result
                raise Exception(f"Failed to get batch status: {result.get('message')}")

# Example usage of the SDK
async def sdk_example():
    sdk = WebHarvestSDK("wh_your_api_key_here")
    
    # Simple scraping
    content = await sdk.scrape("https://example.com")
    print(f"Title: {content.get('metadata', {}).get('title')}")
    
    # Advanced scraping with options
    options = ScrapeOptions(
        formats=[ScrapeFormat.MARKDOWN, ScrapeFormat.LINKS, ScrapeFormat.IMAGES],
        only_main_content=True,
        mobile=False,
        wait_for=2000
    )
    
    content = await sdk.scrape("https://example.com", options)
    print(f"Links found: {len(content.get('links', []))}")
    print(f"Images found: {len(content.get('images', []))}")
    
    # Crawling with progress tracking
    def progress_callback(completed, total, failed):
        progress = (completed / total * 100) if total > 0 else 0
        print(f"Progress: {completed}/{total} ({progress:.1f}%) completed, {failed} failed")
    
    crawl_options = CrawlOptions(
        max_discovery_depth=3,
        limit=100,
        include_paths=["/docs/.*"],
        exclude_paths=["/admin/.*"],
        delay=500
    )
    
    crawl_id = await sdk.start_crawl("https://docs.example.com", crawl_options)
    result = await sdk.wait_for_crawl(crawl_id, progress_callback=progress_callback)
    
    print(f"Crawl completed: {result['completed']} pages")
    
    # Site mapping
    urls = await sdk.map_site("https://example.com", search="api")
    print(f"Found {len(urls)} API-related URLs")
    
    # Batch processing
    url_list = [
        "https://example.com/page1",
        "https://example.com/page2", 
        "https://example.com/page3"
    ]
    
    batch_id = await sdk.batch_scrape(url_list)
    batch_result = await sdk.get_batch_status(batch_id)
    print(f"Batch status: {batch_result['status']}")

# Run the example
if __name__ == "__main__":
    asyncio.run(sdk_example())
```

</details>

---

This comprehensive documentation provides working examples for all major WebHarvest API endpoints across multiple programming languages, along with practical workflows and robust error handling patterns. Each example is production-ready and includes proper authentication, error handling, and best practices for interacting with the API.

The examples demonstrate:
- Basic and advanced usage patterns
- Comprehensive error handling
- Rate limiting awareness  
- Efficient polling and monitoring
- Real-world workflows like documentation ingestion and change detection
- SDK-style abstractions for easier integration

You can adapt these examples to your specific use case and integrate them into your applications or automation workflows.