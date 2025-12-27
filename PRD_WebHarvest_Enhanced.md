# Product Requirements Document: WebHarvest
## "Your AI-Powered Web Intelligence Platform - Harvest Knowledge, Not Just Data"

---

## Table of Contents

* [Product Overview and Goals](#product-overview-and-goals)
* [Market Context and Industry Analysis](#market-context-and-industry-analysis)
* [Users and Workflows](#users-and-workflows)
* [Functional and Non-Functional Requirements](#functional-and-non-functional-requirements)
* [Technical Architecture](#technical-architecture)
* [Interfaces and Integrations](#interfaces-and-integrations)
* [Database Schema and Core Algorithms](#database-schema-and-core-algorithms)
* [Deployment and Operations](#deployment-and-operations)
* [Test Plan and Acceptance Criteria](#test-plan-and-acceptance-criteria)
* [Development Phases](#development-phases)
* [Success Metrics and Risk Mitigation](#success-metrics-and-risk-mitigation)
* [Delivery Package](#delivery-package)

---

## Product Overview and Goals

### Problem Statement and Context

Current web scraping and data extraction solutions present significant challenges in the rapidly evolving AI landscape:

- **Cost Prohibitive:** Services like Firecrawl charge per-page rates that quickly become unsustainable at scale
- **Vendor Lock-in:** Proprietary APIs create dependency and limit customization options
- **Limited Integration:** Most solutions don't seamlessly integrate with modern AI workflows
- **Privacy Concerns:** Cloud-based solutions require sending sensitive data to third parties
- **Complexity:** Setting up comprehensive web scraping with AI integration requires multiple disparate tools

**Key Compatibility Notes:**
- Firecrawl's public repository is **AGPL-3.0** licensed. To avoid AGPL obligations, this implementation will be built from scratch without copying code
- Firecrawl's API shape provides a useful target for drop-in compatibility, especially `/scrape`, `/crawl`, `/map`, `/batch/scrape` endpoints

### Solution Overview

**WebHarvest** is an open-source, self-hosted alternative to Firecrawl that combines powerful web scraping capabilities with MCP (Model Context Protocol) server integration and an intuitive OpenWebUI interface. It transforms any website into LLM-ready markdown with advanced document processing, RAG capabilities, and seamless AI chat interactions.

### Goals, Non-Goals, and Success Metrics

**Primary Goals:**

1. **Self-hosted service** that can:
   - Scrape a single URL into clean Markdown and other formats
   - Crawl a site and return per-page content
   - Map a site into a URL list fast
   - Batch scrape many URLs

2. **Built-in MCP server** that exposes the above as tools (plus "sync results into Open WebUI knowledge")

3. **Simple Open WebUI UX** by using Open WebUI as the chat UI:
   - Drag/drop files into a knowledge collection
   - Chat with a file or a collection
   - Use MCP tools from chat to ingest websites into knowledge

4. **Works fully local** on a single machine via docker compose

5. **No placeholders** in the build spec. Every included endpoint and tool must be implemented and tested

**Non-Goals:**
- Bypassing paywalls, CAPTCHAs, or site protections
- Ignoring robots.txt by default
- "Stealth" scraping that aims to evade website policies
- Providing a hosted SaaS in v1

**Success Metrics:**
- Scrape p95 latency (static page): < 3 seconds on a typical home server
- Crawl success rate (allowed pages): > 90% for standard docs sites (static + common JS frameworks)
- Open WebUI ingestion flow: user can ingest a docs site and ask questions with citations in < 5 minutes end-to-end
- Cost: runs on one box with predictable CPU/RAM use. No per-credit billing

---

## Market Context and Industry Analysis

### AI Adoption and Cost Pressures

The market landscape for AI-powered data extraction is rapidly evolving with significant adoption challenges:

**Industry Statistics (2024-2025):**
- **McKinsey's early 2024 survey:** 65% of respondents say their organizations regularly use generative AI, with overall AI adoption jumping to **72%**
- **Stanford's 2025 AI Index:** 78% of organizations used AI in 2024, and generative AI drew **$33.9B** in global private investment
- **Gartner prediction:** 30% of GenAI projects will be abandoned by end of 2025 due to issues like poor data quality and escalating costs

**Key Market Insights:**
- *Rita Sallam (Gartner):* "Executives are impatient to see returns... yet organizations are struggling to prove and realize value"
- *Rita Sallam (Gartner):* "Costs aren't as predictable as other technologies"

**Product Focus Areas:**
Based on this market analysis, WebHarvest must prioritize:
1. **Predictable operating costs** - No per-credit billing
2. **Reliable data extraction** - High success rates for content processing
3. **Easy ingestion-to-chat workflow** - Minimal friction from data to insights

---

## Users and Workflows

### Primary Personas and Use Cases

**Persona A: Solo Developer (Primary User)**
- Role: Individual developer or small team lead
- Pain: Firecrawl credits depleting too quickly, need predictable costs
- Needs: "One command" deployment, trigger crawls from chat
- Goal: Turn documentation sites into queryable knowledge bases

**Persona B: Small Development Team**
- Role: 3-10 person engineering team
- Pain: Shared knowledge management, need audit trails
- Needs: Shared knowledge collections, role-based access, crawl scheduling
- Goal: Collaborative documentation analysis and change tracking

**Persona C: AI/ML Engineers**
- Role: Data scientists and ML engineers
- Pain: Manual web data collection is time-consuming
- Needs: Clean training data from web sources, batch processing
- Goal: Automated data pipeline for model training

**Persona D: Research Organizations**
- Role: Academic or commercial research teams
- Pain: Manual content analysis across multiple sources
- Needs: Large-scale content collection and analysis
- Goal: Research automation and knowledge discovery

**Use Cases:**

1. **"Turn docs site into a chatbot"**
   - Crawl documentation website
   - Upload results into an Open WebUI knowledge collection
   - Chat with that collection for Q&A

2. **"Review a PDF + a set of internal pages"**
   - Drag/drop PDF(s) in Open WebUI
   - Crawl internal pages that require headers/cookies (explicitly provided by user)
   - Cross-reference content between sources

3. **"Batch scrape a list of URLs"**
   - Upload a text file with URLs
   - Batch scrape and store outputs
   - Process results in bulk

4. **"Monitor docs changes"**
   - Re-scrape on schedule
   - Produce diffs and notify of changes
   - Track content evolution over time

### End-to-End User Journeys

**Journey 1: Drag/drop file and chat**
1. User opens Open WebUI
2. User uploads a file via Open WebUI file upload
3. Open WebUI auto-extracts content into its vector store
4. User chats with the file or with a collection by referencing it in chat completions

**Journey 2: Crawl a website from chat and add to knowledge**
1. User: "crawl https://docs.example.com and add to knowledge collection 'Example Docs'"
2. Model calls MCP tool `crawl_site` with url + include/exclude rules
3. Model polls `get_crawl_status` until complete
4. Model calls MCP tool `sync_crawl_to_openwebui_collection` to:
   - Convert each page to a `.md` file (or bundle as `.zip`)
   - Upload file(s) to Open WebUI via `POST /api/v1/files/`
   - Add them to the target knowledge collection via `POST /api/v1/knowledge/{id}/file/add`
5. User chats with the collection in Open WebUI

**Journey 3: Single page scrape from chat**
1. User: "scrape this page and show me markdown + links"
2. Model calls MCP tool `scrape_url`
3. Tool returns Markdown and extracted links

**Important Open WebUI Configuration:**
- Open WebUI supports MCP natively starting v0.6.31 and expects **Streamable HTTP** MCP servers, not stdio
- Open WebUI recommends setting `WEBUI_SECRET_KEY` to avoid MCP OAuth token issues across restarts

---

## Functional and Non-Functional Requirements

This section defines what must be built with no placeholders or stubs.

### A) Firecrawl-Compatible HTTP API (Core)

Target compatibility with Firecrawl v2 shapes where practical for drop-in replacement capability.

#### A1. POST `/v2/scrape` - Single Page Extraction

**Input (JSON):**
```json
{
  "url": "https://example.com/page",
  "formats": ["markdown", "html", "rawHtml", "links", "images", "screenshot"],
  "onlyMainContent": true,
  "includeTags": ["p", "h1", "h2", "h3", "h4", "h5", "h6"],
  "excludeTags": ["nav", "footer", "aside"],
  "headers": {
    "Authorization": "Bearer token",
    "User-Agent": "Custom Agent"
  },
  "waitFor": 1000,
  "mobile": false,
  "timeout": 30000,
  "maxAge": 172800000,
  "actions": [
    { "type": "wait", "milliseconds": 500 },
    { "type": "click", "selector": "button#accept" }
  ]
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "markdown": "# Page Title\n\nContent...",
    "html": "<article>...</article>",
    "rawHtml": "<!DOCTYPE html>...",
    "links": ["https://example.com/link1", "https://example.com/link2"],
    "images": ["https://example.com/image1.jpg"],
    "screenshot": "/screenshots/abc123.png",
    "metadata": {
      "title": "Page Title",
      "description": "Page description",
      "language": "en",
      "sourceURL": "https://example.com/page",
      "statusCode": 200,
      "error": null
    },
    "warning": "Some content may have been blocked by robots.txt",
    "changeTracking": {
      "previousScrapeAt": "2024-12-24T10:00:00Z",
      "changeStatus": "changed",
      "diff": "- Old line\n+ New line"
    }
  }
}
```

**Behavior:**
- Respect robots.txt by default (override only with explicit admin flag)
- Rate limit per domain (configurable: default 2 concurrent, 500ms delay)
- Normalize URL (strip fragments; optionally drop query parameters)
- Cache responses based on `(normalized_url, request_options_hash)`
- Support custom headers for authentication/cookies

#### A2. POST `/v2/crawl` - Asynchronous Site Crawling

**Input:**
```json
{
  "url": "https://docs.example.com",
  "excludePaths": ["^/blog/.*", "^/admin/.*"],
  "includePaths": ["^/docs/.*"],
  "maxDiscoveryDepth": 10,
  "sitemap": "include",
  "ignoreQueryParameters": true,
  "limit": 5000,
  "crawlEntireDomain": false,
  "allowExternalLinks": false,
  "allowSubdomains": false,
  "delay": 250,
  "maxConcurrency": 5,
  "webhook": {
    "url": "https://webhook.example.com/crawl-updates",
    "events": ["completed", "failed", "progress"]
  },
  "scrapeOptions": {
    "formats": ["markdown"],
    "onlyMainContent": true
  }
}
```

**Output:**
```json
{
  "success": true,
  "id": "crawl_123abc",
  "url": "/v2/crawl/crawl_123abc"
}
```

#### A3. GET `/v2/crawl/{id}` - Crawl Status and Results

**Response:**
```json
{
  "success": true,
  "status": "scraping",
  "total": 150,
  "completed": 75,
  "failed": 2,
  "data": [
    {
      "url": "https://docs.example.com/page1",
      "markdown": "# Page Content",
      "metadata": {
        "title": "Page 1",
        "statusCode": 200
      }
    }
  ],
  "next": "eyJjdXJzb3IiOiIxMDAifQ=="
}
```

**Status Values:**
- `queued` - Job is waiting to start
- `scraping` - Currently processing pages
- `completed` - All pages processed successfully
- `failed` - Job failed with errors
- `canceled` - Job was manually canceled

#### A4. DELETE `/v2/crawl/{id}` - Cancel Crawl

Cancels the crawl job, stops workers, and marks job as canceled.

#### A5. POST `/v2/map` - Fast Site Mapping

**Input:**
```json
{
  "url": "https://docs.example.com",
  "search": "API documentation",
  "limit": 1000,
  "ignoreSitemap": false,
  "sitemapOnly": false
}
```

**Output:**
```json
{
  "success": true,
  "links": [
    "https://docs.example.com/api",
    "https://docs.example.com/api/auth",
    "https://docs.example.com/api/users"
  ],
  "metadata": {
    "total": 856,
    "truncated": false,
    "sitemapFound": true
  }
}
```

#### A6. POST `/v2/batch/scrape` - Batch URL Processing

**Input:**
```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3"
  ],
  "ignoreInvalidURLs": true,
  "maxConcurrency": 10,
  "scrapeOptions": {
    "formats": ["markdown"],
    "onlyMainContent": true
  },
  "webhook": {
    "url": "https://webhook.example.com/batch-updates"
  }
}
```

**Output:**
```json
{
  "success": true,
  "id": "batch_456def",
  "url": "/v2/batch/scrape/batch_456def",
  "invalidURLs": ["not-a-url", "ftp://invalid.com"]
}
```

### B) Action DSL (Playwright-backed)

Support a small, explicit set of browser actions for JavaScript-heavy pages.

**Supported Actions:**
```json
[
  { "type": "wait", "milliseconds": 500 },
  { "type": "click", "selector": "button#accept" },
  { "type": "type", "selector": "input[name=q]", "text": "search query" },
  { "type": "scroll", "y": 1200 },
  { "type": "press", "key": "Enter" },
  { "type": "screenshot", "fullPage": true }
]
```

**Safety Rules:**
- Run actions only when `render: true` or when formats include `screenshot`
- Hard limits:
  - Max actions per request: 25
  - Max total action time: 30s (configurable)
- Never run arbitrary JavaScript from user input
- All actions must be deterministic and safe

### C) Change Tracking (Document Monitoring)

#### C1. Scrape-level Change Tracking

When `changeTracking` is requested in `/scrape`:
- Store a `content_hash` for extracted Markdown content
- If prior version exists, compute unified diff
- Return change status and diff information

**Response Structure:**
```json
{
  "changeTracking": {
    "previousScrapeAt": "2024-12-24T10:00:00Z",
    "changeStatus": "new|changed|unchanged",
    "diff": "unified diff text",
    "contentHash": "sha256:abc123..."
  }
}
```

#### C2. Crawl-level Schedules (v1.1)

**Scheduled Crawl Management:**
```
POST /v2/schedules
{
  "type": "crawl",
  "cron": "0 2 * * *",
  "crawlRequest": { /* full crawl payload */ },
  "webhook": "https://example.com/schedule-webhook"
}

GET /v2/schedules
DELETE /v2/schedules/{id}
```

**Implementation:** Scheduler runs inside worker container using APScheduler or Celery beat.

### D) Open WebUI Connector

Provide seamless integration with Open WebUI for knowledge management.

#### D1. Core Requirements

**Service Module:** `openwebui_connector`
- Upload files to Open WebUI: `POST /api/v1/files/`
- Add files to knowledge collections: `POST /api/v1/knowledge/{id}/file/add`

**Upload Formats:**
- One file per page (individual .md files)
- Single .zip with multiple .md files (recommended for large crawls)

**Configuration:**
```env
OPENWEBUI_BASE_URL=http://openwebui:3000
OPENWEBUI_API_KEY=sk-xxx
```

#### D2. Knowledge Collection Mapping

**Database Storage:**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  openwebui_collection_id TEXT,
  sync_mode TEXT CHECK (sync_mode IN ('per_page', 'bundle_zip')),
  domain_allowlist TEXT[],
  domain_denylist TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### E) MCP Server (Streamable HTTP)

Implement MCP server with comprehensive tool support for Open WebUI integration.

#### E1. Minimum MCP Tool Set

**Required Tools:**
1. `scrape_url` - Single page scraping
2. `crawl_site` - Full site crawling
3. `get_crawl_status` - Monitor crawl progress
4. `cancel_crawl` - Stop running crawls
5. `map_site` - Fast URL discovery
6. `batch_scrape` - Process multiple URLs
7. `get_batch_status` - Monitor batch progress
8. `sync_crawl_to_openwebui_collection` - Upload crawl results
9. `sync_scrape_to_openwebui_collection` - Upload single page
10. `create_project` + `list_projects` - Project management

#### E2. MCP Resources (Read-only)

**Available Resources:**
- `doc://{doc_id}` - Returns stored Markdown content
- `crawl://{crawl_id}/page/{n}` - Returns specific page result
- `crawl://{crawl_id}/summary` - Returns crawl metadata and statistics

#### E3. MCP Prompts (User-controlled)

**Workflow Prompts:**
- "Ingest docs site into knowledge collection"
- "Re-crawl and produce diff summary"
- "Batch process URL list with analysis"

### F) Admin and Safety Controls

#### F1. Domain Management
- **Global allowlist/denylist** for domains
- **Per-project allowlist/denylist** overrides
- **Default rate limits:** 2 concurrent requests per domain, 500ms delay
- **Configurable limits** via admin interface

#### F2. Robots.txt Compliance
- **Default behavior:** Respect robots.txt
- **Override capability:** Admin-only flag to ignore robots.txt
- **Audit logging** when robots.txt is bypassed

#### F3. Resource Limits
```env
MAX_CRAWL_PAGES=10000        # Per crawl job
MAX_BATCH_URLS=1000         # Per batch request
MAX_CONCURRENT_CRAWLS=5     # System-wide
MAX_PAGE_SIZE=50MB          # Individual page limit
```

#### F4. Audit Logging

**Audit Events:**
- Crawl/scrape requests with user identification
- Domain allowlist/denylist changes
- Rate limit violations
- Robots.txt overrides
- System configuration changes

---

## Technical Architecture

### Components and Deployment Topology

**Single Docker Compose Deployment:**

```yaml
services:
  webharvest-api:
    build: ./api
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/webharvest
      - REDIS_URL=redis://redis:6379
      - OPENWEBUI_API_KEY=${OPENWEBUI_API_KEY}
    depends_on:
      - postgres
      - redis

  webharvest-worker:
    build: ./worker
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/webharvest
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    ports:
      - "3000:8080"
    environment:
      - WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY}
      - OPENAI_API_BASE_URL=http://webharvest-api:8080/mcp
    volumes:
      - openwebui_data:/app/backend/data

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=webharvest
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
  openwebui_data:
```

### Core Service Architecture

#### 1. WebHarvest API Service
- **Framework:** FastAPI (Python 3.11+)
- **Endpoints:** Firecrawl-compatible REST API + MCP server
- **Authentication:** JWT Bearer tokens
- **Rate Limiting:** Redis-backed per-domain and per-user limits

#### 2. WebHarvest Worker Service
- **Engine:** Celery with Redis broker
- **Browser Automation:** Playwright (Chrome, Firefox, Safari)
- **Content Extraction:** BeautifulSoup4 + Readability
- **Concurrency:** Configurable per-domain limits

#### 3. Open WebUI Service
- **Base:** Official Open WebUI image
- **Customization:** Custom themes and MCP integration
- **Storage:** Vector embeddings + file management

#### 4. Supporting Services
- **PostgreSQL:** Primary data storage
- **Redis:** Job queue + caching + rate limiting
- **Qdrant:** Vector database for embeddings (optional ChromaDB for development)

---

## Interfaces and Integrations

### HTTP API Specification

#### Authentication
```
Authorization: Bearer <WEBHARVEST_API_KEY>
```

#### Common Response Format
```json
{
  "success": true|false,
  "data": { /* response data */ },
  "error": "error message if success=false",
  "warning": "optional warning message"
}
```

#### Error Handling
```json
{
  "success": false,
  "error": "Invalid URL format",
  "code": "INVALID_URL",
  "details": {
    "url": "not-a-url",
    "message": "URL must start with http:// or https://"
  }
}
```

### MCP Server Specification

#### Transport and Capabilities

**Endpoint:** `/mcp` (Streamable HTTP)

**Capabilities Response:**
```json
{
  "protocolVersion": "2025-06-18",
  "capabilities": {
    "tools": { "listChanged": false },
    "resources": { "subscribe": false, "listChanged": false },
    "prompts": { "listChanged": false }
  },
  "serverInfo": {
    "name": "webharvest-mcp",
    "version": "1.0.0"
  }
}
```

#### Tool Schema Examples

**scrape_url Tool:**
```json
{
  "name": "scrape_url",
  "description": "Scrape a single URL and extract content in various formats",
  "inputSchema": {
    "type": "object",
    "required": ["url"],
    "properties": {
      "url": {
        "type": "string",
        "description": "URL to scrape",
        "format": "uri"
      },
      "formats": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["markdown", "html", "rawHtml", "links", "images", "screenshot"]
        },
        "default": ["markdown"],
        "description": "Output formats to return"
      },
      "onlyMainContent": {
        "type": "boolean",
        "default": true,
        "description": "Extract only main content using readability"
      },
      "waitFor": {
        "type": "number",
        "description": "Milliseconds to wait after page load",
        "minimum": 0,
        "maximum": 30000
      }
    }
  }
}
```

**crawl_site Tool:**
```json
{
  "name": "crawl_site",
  "description": "Start crawling a website and return job ID for monitoring",
  "inputSchema": {
    "type": "object",
    "required": ["url"],
    "properties": {
      "url": {
        "type": "string",
        "format": "uri"
      },
      "maxDepth": {
        "type": "number",
        "default": 3,
        "minimum": 1,
        "maximum": 10
      },
      "includePaths": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Regex patterns for URLs to include"
      },
      "excludePaths": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Regex patterns for URLs to exclude"
      },
      "limit": {
        "type": "number",
        "default": 100,
        "maximum": 10000
      }
    }
  }
}
```

**sync_crawl_to_openwebui_collection Tool:**
```json
{
  "name": "sync_crawl_to_openwebui_collection",
  "description": "Upload crawl results to Open WebUI knowledge collection",
  "inputSchema": {
    "type": "object",
    "required": ["crawl_id", "collection_id"],
    "properties": {
      "crawl_id": {
        "type": "string",
        "description": "ID of completed crawl job"
      },
      "collection_id": {
        "type": "string",
        "description": "Open WebUI knowledge collection ID"
      },
      "mode": {
        "type": "string",
        "enum": ["per_page", "bundle_zip"],
        "default": "bundle_zip",
        "description": "How to upload: individual files or single zip"
      },
      "title_prefix": {
        "type": "string",
        "description": "Prefix for uploaded file titles"
      }
    }
  }
}
```

### Open WebUI Integration

#### Required API Calls

**File Upload:**
```
POST /api/v1/files/
Content-Type: multipart/form-data

file: <binary data>
```

**Add to Knowledge Collection:**
```
POST /api/v1/knowledge/{collection_id}/file/add
Content-Type: application/json

{
  "file_id": "uploaded_file_id"
}
```

**Chat with Collection:**
```
POST /api/chat/completions
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [...],
  "files": [
    {
      "type": "collection",
      "id": "collection_id"
    }
  ]
}
```

---

## Database Schema and Core Algorithms

### PostgreSQL Schema

#### Core Tables

```sql
-- Projects and configuration
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    openwebui_collection_id TEXT,
    sync_mode TEXT CHECK (sync_mode IN ('per_page', 'bundle_zip')) DEFAULT 'bundle_zip',
    domain_allowlist TEXT[] DEFAULT '{}',
    domain_denylist TEXT[] DEFAULT '{}',
    max_pages_per_crawl INTEGER DEFAULT 10000,
    rate_limit_per_domain INTEGER DEFAULT 2,
    rate_limit_delay_ms INTEGER DEFAULT 500
);

-- Crawl jobs
CREATE TABLE crawl_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    seed_url TEXT NOT NULL,
    request_json JSONB NOT NULL,
    status TEXT CHECK (status IN ('queued', 'scraping', 'completed', 'failed', 'canceled')) DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    total_discovered INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    canceled BOOLEAN DEFAULT FALSE,
    error TEXT,
    webhook_url TEXT,
    created_by TEXT
);

-- Individual page results
CREATE TABLE crawl_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crawl_job_id UUID REFERENCES crawl_jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    status_code INTEGER,
    markdown TEXT,
    html TEXT,
    raw_html TEXT,
    links TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    content_hash TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_time_ms INTEGER
);

-- Scrape cache for performance
CREATE TABLE scrape_cache (
    cache_key TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    response_json JSONB NOT NULL,
    content_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Batch scrape jobs
CREATE TABLE batch_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    urls TEXT[] NOT NULL,
    request_json JSONB NOT NULL,
    status TEXT CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'canceled')) DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    total_urls INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    webhook_url TEXT,
    created_by TEXT
);

-- Batch results
CREATE TABLE batch_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_job_id UUID REFERENCES batch_jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status_code INTEGER,
    markdown TEXT,
    html TEXT,
    metadata JSONB DEFAULT '{}',
    content_hash TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logging
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled jobs (v1.1)
CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    job_type TEXT CHECK (job_type IN ('crawl', 'batch_scrape')) NOT NULL,
    cron_schedule TEXT NOT NULL,
    job_config JSONB NOT NULL,
    webhook_url TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);
```

#### Indexes for Performance

```sql
-- URL lookups and deduplication
CREATE INDEX idx_crawl_pages_normalized_url ON crawl_pages(normalized_url);
CREATE INDEX idx_crawl_pages_crawl_job_id ON crawl_pages(crawl_job_id);
CREATE INDEX idx_scrape_cache_normalized_url ON scrape_cache(normalized_url);
CREATE INDEX idx_scrape_cache_expires_at ON scrape_cache(expires_at);

-- Job monitoring
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_created_at ON crawl_jobs(created_at);
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);

-- Content search
CREATE INDEX idx_crawl_pages_content_hash ON crawl_pages(content_hash);
CREATE INDEX idx_crawl_pages_url_gin ON crawl_pages USING gin(to_tsvector('english', url));
CREATE INDEX idx_crawl_pages_markdown_gin ON crawl_pages USING gin(to_tsvector('english', markdown));

-- Audit queries
CREATE INDEX idx_audit_log_actor ON audit_log(actor);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

### Core Crawling Algorithm

#### URL Discovery and Normalization

```python
def normalize_url(url: str, ignore_query_params: bool = False) -> str:
    """Normalize URL for deduplication and caching"""
    parsed = urlparse(url)
    
    # Remove fragment
    normalized = urlunparse((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        parsed.path,
        parsed.params,
        '' if ignore_query_params else parsed.query,
        ''  # Always remove fragment
    ))
    
    # Canonicalize trailing slashes
    if normalized.endswith('/') and normalized.count('/') > 2:
        normalized = normalized.rstrip('/')
    
    return normalized
```

#### Crawl Discovery Process

```python
async def discover_urls(seed_url: str, config: CrawlConfig) -> AsyncIterator[str]:
    """Discover URLs following crawl configuration rules"""
    discovered = set()
    queue = deque([seed_url])
    depth_map = {seed_url: 0}
    
    # Try sitemap first if enabled
    if config.sitemap in ['include', 'only']:
        sitemap_urls = await extract_sitemap_urls(seed_url)
        queue.extend(sitemap_urls)
        for url in sitemap_urls:
            depth_map[url] = 0
    
    if config.sitemap == 'only':
        # Only use sitemap URLs
        for url in queue:
            if should_include_url(url, config):
                yield url
        return
    
    while queue and len(discovered) < config.limit:
        current_url = queue.popleft()
        current_depth = depth_map.get(current_url, 0)
        
        if current_depth > config.max_discovery_depth:
            continue
            
        if current_url in discovered:
            continue
            
        if not should_include_url(current_url, config):
            continue
            
        discovered.add(current_url)
        yield current_url
        
        # Extract links for next depth level
        if current_depth < config.max_discovery_depth:
            try:
                links = await extract_links_from_page(current_url)
                for link in links:
                    absolute_url = urljoin(current_url, link)
                    normalized = normalize_url(absolute_url, config.ignore_query_parameters)
                    if normalized not in discovered and normalized not in depth_map:
                        depth_map[normalized] = current_depth + 1
                        queue.append(normalized)
            except Exception as e:
                logger.warning(f"Failed to extract links from {current_url}: {e}")

def should_include_url(url: str, config: CrawlConfig) -> bool:
    """Check if URL should be included based on crawl configuration"""
    parsed = urlparse(url)
    seed_parsed = urlparse(config.seed_url)
    
    # Domain restrictions
    if not config.allow_external_links and parsed.netloc != seed_parsed.netloc:
        return False
        
    if not config.allow_subdomains and not parsed.netloc.endswith(seed_parsed.netloc):
        return False
    
    # Path filtering
    path = parsed.path
    
    # Include patterns (must match at least one if specified)
    if config.include_paths:
        if not any(re.match(pattern, path) for pattern in config.include_paths):
            return False
    
    # Exclude patterns (must not match any)
    if config.exclude_paths:
        if any(re.match(pattern, path) for pattern in config.exclude_paths):
            return False
    
    return True
```

#### Rate Limiting and Backoff

```python
class DomainRateLimiter:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.backoff_multiplier = 2.0
        self.max_backoff = 300  # 5 minutes
    
    async def acquire(self, domain: str, max_concurrent: int = 2, delay_ms: int = 500):
        """Acquire rate limit token for domain"""
        current_key = f"rate_limit:{domain}:current"
        delay_key = f"rate_limit:{domain}:delay"
        backoff_key = f"rate_limit:{domain}:backoff"
        
        # Check current concurrency
        current = await self.redis.get(current_key) or 0
        if int(current) >= max_concurrent:
            await asyncio.sleep(0.1)
            return await self.acquire(domain, max_concurrent, delay_ms)
        
        # Increment counter with expiration
        await self.redis.incr(current_key)
        await self.redis.expire(current_key, 60)
        
        # Apply delay (base + any backoff)
        backoff = await self.redis.get(backoff_key) or 0
        total_delay = (delay_ms + int(backoff)) / 1000.0
        await asyncio.sleep(total_delay)
        
        return RateLimitToken(self.redis, domain)
    
    async def handle_error(self, domain: str, status_code: int):
        """Handle rate limiting errors with exponential backoff"""
        backoff_key = f"rate_limit:{domain}:backoff"
        
        if status_code in [429, 503, 502, 504]:
            current_backoff = await self.redis.get(backoff_key) or 0
            new_backoff = min(
                (int(current_backoff) + 1000) * self.backoff_multiplier,
                self.max_backoff * 1000
            )
            await self.redis.setex(backoff_key, 3600, int(new_backoff))
            logger.warning(f"Rate limited on {domain}, backoff: {new_backoff}ms")
```

### Content Extraction Algorithm

#### Main Content Extraction

```python
async def extract_page_content(
    url: str, 
    formats: List[str], 
    config: ScrapeConfig
) -> PageContent:
    """Extract content from a web page in multiple formats"""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080} if not config.mobile else {'width': 375, 'height': 667},
            user_agent=get_random_user_agent()
        )
        
        page = await context.new_page()
        
        try:
            # Navigate with timeout
            await page.goto(url, timeout=config.timeout, wait_until='domcontentloaded')
            
            # Execute actions if specified
            if config.actions:
                await execute_actions(page, config.actions)
            
            # Wait for additional content loading
            if config.wait_for:
                await asyncio.sleep(config.wait_for / 1000)
            
            # Extract content in requested formats
            content = PageContent(url=url)
            
            if 'rawHtml' in formats:
                content.raw_html = await page.content()
            
            if any(fmt in formats for fmt in ['markdown', 'html', 'links', 'images']):
                # Get cleaned HTML
                cleaned_html = await extract_main_content(page, config)
                
                if 'html' in formats:
                    content.html = cleaned_html
                
                if 'markdown' in formats:
                    content.markdown = html_to_markdown(cleaned_html)
                
                if 'links' in formats:
                    content.links = await extract_links(page)
                
                if 'images' in formats:
                    content.images = await extract_images(page)
            
            if 'screenshot' in formats:
                screenshot_path = await capture_screenshot(page, config)
                content.screenshot = screenshot_path
            
            # Extract metadata
            content.metadata = await extract_metadata(page)
            
            return content
            
        finally:
            await browser.close()

async def extract_main_content(page: Page, config: ScrapeConfig) -> str:
    """Extract main content using readability-style algorithm"""
    
    if config.only_main_content:
        # Use Mozilla Readability algorithm
        readability_result = await page.evaluate("""
            () => {
                const Readability = require('readability');
                const doc = document.cloneNode(true);
                const article = new Readability(doc).parse();
                return article ? article.content : document.body.innerHTML;
            }
        """)
        return readability_result
    else:
        # Return full body content with tag filtering
        return await page.evaluate(f"""
            () => {{
                let content = document.body.cloneNode(true);
                
                // Remove excluded tags
                {json.dumps(config.exclude_tags or [])}.forEach(tag => {{
                    content.querySelectorAll(tag).forEach(el => el.remove());
                }});
                
                // Keep only included tags if specified
                const includeTags = {json.dumps(config.include_tags or [])};
                if (includeTags.length > 0) {{
                    const selector = includeTags.join(', ');
                    const elements = content.querySelectorAll(selector);
                    const newContent = document.createElement('div');
                    elements.forEach(el => newContent.appendChild(el.cloneNode(true)));
                    content = newContent;
                }}
                
                return content.innerHTML;
            }}
        """)
```

---

## Deployment and Operations

### Docker Compose Configuration

#### Production-Ready Compose File

```yaml
version: '3.8'

services:
  webharvest-api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://webharvest:${POSTGRES_PASSWORD}@postgres:5432/webharvest
      - REDIS_URL=redis://redis:6379
      - QDRANT_URL=http://qdrant:6333
      - OPENWEBUI_BASE_URL=http://openwebui:8080
      - OPENWEBUI_API_KEY=${OPENWEBUI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
      - LOG_LEVEL=INFO
      - MAX_CRAWL_PAGES=10000
      - DEFAULT_RATE_LIMIT_PER_DOMAIN=2
      - DEFAULT_DELAY_MS=500
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  webharvest-worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL=postgresql://webharvest:${POSTGRES_PASSWORD}@postgres:5432/webharvest
      - REDIS_URL=redis://redis:6379
      - QDRANT_URL=http://qdrant:6333
      - LOG_LEVEL=INFO
      - PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 2
    volumes:
      - playwright_cache:/ms-playwright

  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    ports:
      - "3000:8080"
    environment:
      - WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY}
      - DATA_DIR=/app/backend/data
      - MCP_SERVERS={"webharvest": {"command": ["curl", "-X", "POST", "http://webharvest-api:8080/mcp"]}}
    volumes:
      - openwebui_data:/app/backend/data
    restart: unless-stopped
    depends_on:
      - webharvest-api

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=webharvest
      - POSTGRES_USER=webharvest
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U webharvest -d webharvest"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  qdrant:
    image: qdrant/qdrant:v1.7.4
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__GRPC_PORT=6334
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - webharvest-api
      - openwebui
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
  openwebui_data:
  playwright_cache:

networks:
  default:
    name: webharvest
```

### Environment Configuration

#### Required Environment Variables

```bash
# Database
POSTGRES_PASSWORD=your_secure_password_here

# Security
JWT_SECRET=your_jwt_secret_key_32_chars_min
WEBHOOK_SECRET=your_webhook_secret_key
WEBUI_SECRET_KEY=your_openwebui_secret_key

# API Keys
OPENWEBUI_API_KEY=sk-your_openwebui_api_key

# Optional
OPENAI_API_KEY=sk-your_openai_key
OLLAMA_URL=http://localhost:11434

# Scraping Configuration
MAX_CRAWL_PAGES=10000
DEFAULT_RATE_LIMIT_PER_DOMAIN=2
DEFAULT_DELAY_MS=500
RESPECT_ROBOTS_TXT=true

# Performance
WORKER_CONCURRENCY=4
REDIS_CACHE_TTL=3600
```

### Monitoring and Observability

#### Health Check Endpoints

```python
# webharvest-api/app/health.py
from fastapi import APIRouter, Depends
from sqlalchemy import text
from redis import Redis
import httpx

router = APIRouter()

@router.get("/healthz")
async def health_check(
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """Basic health check - fast response for load balancer"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@router.get("/readyz")
async def readiness_check(
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """Comprehensive readiness check - validates all dependencies"""
    checks = {}
    
    # Database connectivity
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
    
    # Redis connectivity
    try:
        redis.ping()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {str(e)}"
    
    # Qdrant connectivity
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://qdrant:6333/health")
            checks["qdrant"] = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception as e:
        checks["qdrant"] = f"unhealthy: {str(e)}"
    
    # Worker queue health
    try:
        queue_size = redis.llen("celery")
        checks["worker_queue"] = f"healthy (queue_size: {queue_size})"
    except Exception as e:
        checks["worker_queue"] = f"unhealthy: {str(e)}"
    
    all_healthy = all("healthy" in status for status in checks.values())
    status_code = 200 if all_healthy else 503
    
    return Response(
        content=json.dumps({
            "status": "ready" if all_healthy else "not_ready",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat()
        }),
        status_code=status_code,
        media_type="application/json"
    )
```

#### Prometheus Metrics

```python
# webharvest-api/app/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time

# Metrics definitions
scrape_requests_total = Counter(
    'webharvest_scrape_requests_total',
    'Total number of scrape requests',
    ['method', 'status']
)

scrape_duration_seconds = Histogram(
    'webharvest_scrape_duration_seconds',
    'Time spent on scrape requests',
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]
)

crawl_jobs_active = Gauge(
    'webharvest_crawl_jobs_active',
    'Number of active crawl jobs'
)

crawl_pages_processed_total = Counter(
    'webharvest_crawl_pages_processed_total',
    'Total number of pages processed in crawls',
    ['status']
)

worker_queue_size = Gauge(
    'webharvest_worker_queue_size',
    'Number of tasks in worker queue'
)

@router.get("/metrics")
def prometheus_metrics():
    """Expose Prometheus metrics"""
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )

# Middleware for automatic metrics collection
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    if request.url.path.startswith("/metrics"):
        return await call_next(request)
    
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    scrape_duration_seconds.observe(duration)
    scrape_requests_total.labels(
        method=request.method,
        status=f"{response.status_code//100}xx"
    ).inc()
    
    return response
```

### Security Configuration

#### Nginx Reverse Proxy

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream webharvest_api {
        server webharvest-api:8080;
    }
    
    upstream openwebui {
        server openwebui:8080;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=crawl:10m rate=1r/s;
    
    server {
        listen 80;
        server_name localhost;
        
        # Redirect to HTTPS in production
        # return 301 https://$server_name$request_uri;
        
        # API endpoints
        location /api/ {
            proxy_pass http://webharvest_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Rate limiting
            limit_req zone=api burst=20 nodelay;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 60s;
        }
        
        # MCP endpoint
        location /mcp {
            proxy_pass http://webharvest_api/mcp;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Crawl endpoints (stricter rate limiting)
        location ~ ^/api/v2/(crawl|batch) {
            proxy_pass http://webharvest_api;
            limit_req zone=crawl burst=5 nodelay;
        }
        
        # Open WebUI
        location / {
            proxy_pass http://openwebui;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
        
        # Block common attack patterns
        location ~ /\. {
            deny all;
        }
        
        location ~ \.(env|git|svn) {
            deny all;
        }
    }
}
```

---

## Test Plan and Acceptance Criteria

### Acceptance Criteria (Must Pass)

#### 1. Core Functionality Tests

**Single URL Scraping:**
- [ ] Single URL scrape returns valid Markdown content for a standard webpage
- [ ] Metadata extraction includes title, description, language, statusCode
- [ ] Multiple format requests (markdown + html + links) return all requested formats
- [ ] Error handling for invalid URLs returns proper error response

**Site Crawling:**
- [ ] Crawl job returns job ID immediately upon submission
- [ ] Status endpoint shows progress increments (total/completed/failed counters)
- [ ] Crawl completes in "completed" status for a small test site (<50 pages)
- [ ] Results include per-page markdown and metadata
- [ ] Include/exclude path patterns work correctly

**Site Mapping:**
- [ ] Map endpoint returns at least 100 links for a typical documentation site
- [ ] Results respect the specified limit parameter
- [ ] Sitemap detection works when available

**Batch Processing:**
- [ ] Batch scrape accepts array of 50 URLs
- [ ] Returns job ID and handles invalid URLs appropriately
- [ ] Status endpoint returns results with proper pagination
- [ ] All successful URLs return markdown content

#### 2. MCP Integration Tests

**MCP Server Connectivity:**
- [ ] Open WebUI can successfully connect to MCP server endpoint
- [ ] MCP capabilities endpoint returns proper tool/resource/prompt lists
- [ ] Authentication works between Open WebUI and MCP server

**MCP Tools Functionality:**
- [ ] `scrape_url` tool works end-to-end through Open WebUI chat
- [ ] `crawl_site` tool can be invoked and monitored through chat
- [ ] `sync_crawl_to_openwebui_collection` successfully uploads crawl results

#### 3. Open WebUI Integration Tests

**Knowledge Collection Sync:**
- [ ] Crawl results can be uploaded to Open WebUI knowledge collection
- [ ] Uploaded files appear in the specified collection
- [ ] Chat completions can reference and query the uploaded content
- [ ] Citations and source attribution work correctly

**File Management:**
- [ ] Drag-and-drop file upload works in Open WebUI
- [ ] Multiple file formats (PDF, Markdown, TXT) are processed correctly
- [ ] Collection organization and tagging functions properly

#### 4. Safety and Compliance Tests

**Domain Controls:**
- [ ] Domain denylist successfully blocks crawling of specified domains
- [ ] Domain allowlist restricts crawling to specified domains only
- [ ] Rate limiting prevents excessive requests to target domains

**Robots.txt Compliance:**
- [ ] Crawler respects robots.txt disallow directives by default
- [ ] Admin override capability works when explicitly enabled
- [ ] Audit log captures robots.txt violations when override is used

#### 5. Performance Tests

**Response Times:**
- [ ] Single page scrape completes in <3 seconds for static pages
- [ ] API endpoints respond in <500ms for status checks
- [ ] Crawl job submission returns immediately (<1 second)

**Concurrent Load:**
- [ ] System handles 10 concurrent scrape requests without errors
- [ ] Multiple crawl jobs can run simultaneously without conflicts
- [ ] Rate limiting prevents domain overload during concurrent operations

#### 6. Observability Tests

**Health Checks:**
- [ ] `/healthz` endpoint returns 200 OK when system is operational
- [ ] `/readyz` endpoint validates all dependencies (DB, Redis, Qdrant)
- [ ] Metrics endpoint exposes Prometheus-format metrics

**Monitoring:**
- [ ] Request counters increment correctly for each endpoint
- [ ] Duration histograms capture response times accurately
- [ ] Error rates are tracked and exposed via metrics

### Testing Framework

#### Unit Tests Structure

```python
# tests/test_scraping.py
import pytest
from app.scraping import normalize_url, should_include_url, extract_main_content

class TestURLNormalization:
    def test_strip_fragment(self):
        assert normalize_url("https://example.com/page#section") == "https://example.com/page"
    
    def test_lowercase_domain(self):
        assert normalize_url("https://EXAMPLE.COM/Page") == "https://example.com/Page"
    
    def test_query_param_removal(self):
        assert normalize_url("https://example.com/page?utm=source", True) == "https://example.com/page"

class TestCrawlFiltering:
    def test_include_paths(self):
        config = CrawlConfig(seed_url="https://example.com", include_paths=["^/docs/.*"])
        assert should_include_url("https://example.com/docs/guide", config) == True
        assert should_include_url("https://example.com/blog/post", config) == False
    
    def test_exclude_paths(self):
        config = CrawlConfig(seed_url="https://example.com", exclude_paths=["^/admin/.*"])
        assert should_include_url("https://example.com/docs/guide", config) == True
        assert should_include_url("https://example.com/admin/panel", config) == False
```

#### Integration Tests

```python
# tests/test_api_integration.py
import pytest
import httpx
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestScrapeEndpoint:
    def test_scrape_single_url(self):
        response = client.post("/v2/scrape", json={
            "url": "https://httpbin.org/html",
            "formats": ["markdown", "links"]
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "markdown" in data["data"]
        assert "links" in data["data"]
        assert len(data["data"]["markdown"]) > 0

    def test_invalid_url_error(self):
        response = client.post("/v2/scrape", json={
            "url": "not-a-valid-url",
            "formats": ["markdown"]
        })
        assert response.status_code == 400
        data = response.json()
        assert data["success"] == False
        assert "error" in data

class TestCrawlEndpoint:
    def test_start_crawl_job(self):
        response = client.post("/v2/crawl", json={
            "url": "https://httpbin.org",
            "limit": 5
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        return data["id"]
    
    def test_get_crawl_status(self):
        crawl_id = self.test_start_crawl_job()
        response = client.get(f"/v2/crawl/{crawl_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["queued", "scraping", "completed", "failed"]
```

#### End-to-End Tests

```python
# tests/test_e2e.py
import pytest
import docker
import time
import httpx

class TestDockerComposeE2E:
    @pytest.fixture(scope="class")
    def docker_services(self):
        """Start services using docker-compose for E2E testing"""
        client = docker.from_env()
        # Start test stack
        subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "up", "-d"])
        time.sleep(30)  # Wait for services to be ready
        yield
        subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "down"])
    
    def test_full_workflow(self, docker_services):
        """Test complete workflow: crawl → sync → chat"""
        base_url = "http://localhost:8080"
        
        # 1. Start crawl
        crawl_response = httpx.post(f"{base_url}/v2/crawl", json={
            "url": "https://httpbin.org",
            "limit": 10
        })
        assert crawl_response.status_code == 200
        crawl_id = crawl_response.json()["id"]
        
        # 2. Wait for completion
        for _ in range(60):  # 1 minute timeout
            status_response = httpx.get(f"{base_url}/v2/crawl/{crawl_id}")
            status = status_response.json()["status"]
            if status in ["completed", "failed"]:
                break
            time.sleep(1)
        
        assert status == "completed"
        
        # 3. Test MCP sync (if Open WebUI available)
        mcp_response = httpx.post(f"{base_url}/mcp", json={
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "sync_crawl_to_openwebui_collection",
                "arguments": {
                    "crawl_id": crawl_id,
                    "collection_id": "test-collection",
                    "mode": "bundle_zip"
                }
            }
        })
        
        # Verify sync succeeded
        assert mcp_response.status_code == 200
```

### Performance Benchmarks

```python
# tests/test_performance.py
import pytest
import asyncio
import httpx
import time

class TestPerformanceBenchmarks:
    @pytest.mark.asyncio
    async def test_concurrent_scrapes(self):
        """Test 10 concurrent scrape requests"""
        start_time = time.time()
        
        async with httpx.AsyncClient() as client:
            tasks = []
            for i in range(10):
                task = client.post("http://localhost:8080/v2/scrape", json={
                    "url": f"https://httpbin.org/html?id={i}",
                    "formats": ["markdown"]
                })
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # All requests should succeed
        assert all(r.status_code == 200 for r in responses)
        
        # Should complete in reasonable time (less than 30 seconds)
        assert total_time < 30.0
        
        # Average response time should be reasonable
        avg_time = total_time / 10
        assert avg_time < 5.0
    
    def test_crawl_performance(self):
        """Test crawl speed for known site"""
        response = httpx.post("http://localhost:8080/v2/crawl", json={
            "url": "https://httpbin.org",
            "limit": 20
        })
        crawl_id = response.json()["id"]
        
        start_time = time.time()
        pages_processed = 0
        
        while True:
            status_response = httpx.get(f"http://localhost:8080/v2/crawl/{crawl_id}")
            status_data = status_response.json()
            
            if status_data["status"] == "completed":
                pages_processed = status_data["completed"]
                break
            elif status_data["status"] == "failed":
                pytest.fail("Crawl failed")
            
            time.sleep(1)
            if time.time() - start_time > 300:  # 5 minute timeout
                pytest.fail("Crawl took too long")
        
        total_time = time.time() - start_time
        pages_per_minute = (pages_processed / total_time) * 60
        
        # Should process at least 10 pages per minute
        assert pages_per_minute >= 10
```

---

## Development Phases

### Phase 1: Foundation and Core API (Weeks 1-3)

**Week 1: Infrastructure Setup**
- [ ] Docker Compose configuration with all services
- [ ] PostgreSQL database with complete schema
- [ ] Redis setup for job queue and caching
- [ ] FastAPI application structure with basic routing
- [ ] Celery worker setup with Playwright integration

**Week 2: Core Scraping Engine**
- [ ] Single URL scraping with Playwright
- [ ] Content extraction using Readability algorithm
- [ ] Multiple output format support (markdown, html, links, images)
- [ ] Action DSL implementation for browser automation
- [ ] Screenshot capture functionality

**Week 3: Firecrawl-Compatible API**
- [ ] `/v2/scrape` endpoint with full parameter support
- [ ] `/v2/crawl` job creation and management
- [ ] `/v2/map` site mapping functionality
- [ ] `/v2/batch/scrape` batch processing
- [ ] Error handling and response formatting

### Phase 2: Advanced Crawling (Weeks 4-5)

**Week 4: Crawling Algorithm**
- [ ] URL discovery from sitemaps and links
- [ ] Include/exclude path pattern matching
- [ ] Domain boundary enforcement
- [ ] Depth-limited traversal
- [ ] URL normalization and deduplication

**Week 5: Performance and Safety**
- [ ] Rate limiting per domain with Redis
- [ ] Exponential backoff for errors
- [ ] Robots.txt compliance checking
- [ ] Content change tracking and diffing
- [ ] Job cancellation and cleanup

### Phase 3: MCP Server Integration (Weeks 6-7)

**Week 6: MCP Protocol Implementation**
- [ ] Streamable HTTP MCP server
- [ ] JSON-RPC 2.0 request handling
- [ ] Tool schema definitions and validation
- [ ] Resource and prompt management
- [ ] Authentication and security

**Week 7: MCP Tools and Workflows**
- [ ] All 10 required MCP tools implementation
- [ ] Open WebUI connector service
- [ ] Knowledge collection sync functionality
- [ ] Error handling and progress tracking
- [ ] Tool testing and validation

### Phase 4: Open WebUI Integration (Weeks 8-9)

**Week 8: File Management Integration**
- [ ] Open WebUI API client implementation
- [ ] File upload and collection management
- [ ] Batch upload with ZIP bundling
- [ ] Project to collection mapping
- [ ] Sync status tracking

**Week 9: End-to-End Workflows**
- [ ] Chat-to-crawl workflow testing
- [ ] Knowledge collection chat functionality
- [ ] Citation and source attribution
- [ ] Error recovery and user feedback
- [ ] Performance optimization

### Phase 5: Production Readiness (Weeks 10-12)

**Week 10: Security and Compliance**
- [ ] Domain allowlist/denylist enforcement
- [ ] Audit logging for all operations
- [ ] JWT authentication and authorization
- [ ] Input validation and sanitization
- [ ] Security testing and hardening

**Week 11: Monitoring and Operations**
- [ ] Health check endpoints
- [ ] Prometheus metrics collection
- [ ] Structured logging with correlation IDs
- [ ] Error tracking and alerting
- [ ] Performance monitoring dashboards

**Week 12: Testing and Documentation**
- [ ] Comprehensive test suite (unit, integration, E2E)
- [ ] Performance benchmarking
- [ ] Documentation and setup guides
- [ ] Deployment automation scripts
- [ ] Release preparation and validation

---

## Success Metrics and Risk Mitigation

### Success Metrics

#### Technical KPIs
- **Page scraping success rate:** >95% for standard web pages
- **API response time:** <500ms (p95) for status endpoints
- **Crawl performance:** >50 pages/minute for typical documentation sites
- **System uptime:** >99.9% availability
- **Error rate:** <1% for valid requests

#### User Experience KPIs
- **Setup time:** <30 minutes from clone to working system
- **Workflow completion:** Docs site to chatbot in <5 minutes
- **User satisfaction:** >4.5/5 based on GitHub issues and feedback
- **Community engagement:** >500 GitHub stars within 6 months

#### Business KPIs
- **Cost savings:** >80% reduction vs. Firecrawl for typical usage
- **Community adoption:** >1000 active installations within Year 1
- **Contributor growth:** >20 external contributors
- **Production deployments:** >100 documented production uses

### Risk Analysis and Mitigation

#### Technical Risks

**Risk:** Website anti-scraping measures block crawling attempts
- **Probability:** High
- **Impact:** Medium
- **Mitigation:** 
  - Implement stealth mode with browser fingerprint rotation
  - Support proxy integration for IP rotation
  - Respect rate limits and add configurable delays
  - Provide user-agent randomization options

**Risk:** Memory leaks or resource exhaustion during large crawls
- **Probability:** Medium
- **Impact:** High
- **Mitigation:**
  - Implement automatic resource cleanup after each page
  - Add memory monitoring and alerts
  - Use browser pool with lifecycle management
  - Implement circuit breakers for runaway jobs

**Risk:** Database performance degradation with large datasets
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Design efficient database indexes from start
  - Implement data archival policies
  - Add database connection pooling
  - Plan for horizontal scaling options

#### Legal and Compliance Risks

**Risk:** Copyright or ToS violations through aggressive scraping
- **Probability:** Medium
- **Impact:** High
- **Mitigation:**
  - Default to robots.txt compliance
  - Provide clear user responsibility disclaimers
  - Implement conservative rate limiting defaults
  - Document legal best practices for users

**Risk:** GDPR or privacy regulation violations in EU deployments
- **Probability:** Low
- **Impact:** High
- **Mitigation:**
  - Self-hosted architecture keeps data local
  - No external telemetry or tracking by default
  - Provide data retention and deletion tools
  - Document privacy compliance features

#### Adoption and Market Risks

**Risk:** Complex setup deters non-technical users
- **Probability:** High
- **Impact:** Medium
- **Mitigation:**
  - Provide one-command Docker Compose setup
  - Create comprehensive documentation with examples
  - Build guided setup wizard for common configurations
  - Develop community tutorials and videos

**Risk:** Competing with well-funded commercial solutions
- **Probability:** High
- **Impact:** Medium
- **Mitigation:**
  - Focus on cost savings and self-hosting benefits
  - Leverage open-source community contributions
  - Provide superior customization options
  - Target privacy-conscious organizations

**Risk:** MCP standard changes breaking compatibility
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Follow official MCP SDK and updates closely
  - Implement versioned MCP protocol support
  - Maintain backward compatibility when possible
  - Participate in MCP community discussions

#### Operational Risks

**Risk:** Support burden overwhelming maintainer capacity
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Comprehensive documentation to reduce support tickets
  - Clear issue templates and troubleshooting guides
  - Community moderation and contributor guidelines
  - Automated issue triage and response templates

**Risk:** Dependencies becoming unmaintained or vulnerable
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Regular dependency audits and updates
  - Pin specific versions with security monitoring
  - Maintain minimal dependency footprint
  - Have fallback options for critical dependencies

### Competitive Advantages

1. **100% Self-Hosted:** Complete data sovereignty and predictable costs
2. **MCP Standard Compliance:** Future-proof AI integration with emerging tools
3. **Open Source Transparency:** Full code visibility and customization capability
4. **Unified Workflow:** Scraping to chat in single integrated platform
5. **Privacy-First Design:** No external data transmission required
6. **Cost Effectiveness:** One-time setup vs. recurring per-page charges
7. **Community-Driven:** Responsive to user needs and contributions

---

## Delivery Package

### Final Deliverables

#### Core Application
```
webharvest/
├── docker-compose.yml              # Production deployment
├── docker-compose.dev.yml          # Development setup
├── docker-compose.test.yml         # Testing environment
├── .env.example                    # Environment variables template
├── README.md                       # Setup and usage guide
├── CONTRIBUTING.md                 # Contributor guidelines
├── LICENSE                         # MIT license
├── api/
│   ├── Dockerfile                  # API service container
│   ├── requirements.txt            # Python dependencies
│   ├── app/
│   │   ├── main.py                 # FastAPI application
│   │   ├── models/                 # Database models
│   │   ├── api/                    # API endpoints
│   │   ├── services/               # Business logic
│   │   ├── mcp/                    # MCP server implementation
│   │   └── utils/                  # Utility functions
│   └── tests/                      # API tests
├── worker/
│   ├── Dockerfile                  # Worker service container
│   ├── requirements.txt            # Python dependencies
│   ├── app/
│   │   ├── main.py                 # Celery worker
│   │   ├── tasks/                  # Background tasks
│   │   ├── scraping/               # Scraping engine
│   │   └── utils/                  # Utility functions
│   └── tests/                      # Worker tests
├── scripts/
│   ├── setup.sh                    # Automated setup script
│   ├── init.sql                    # Database initialization
│   ├── seed-data.sql               # Sample data for testing
│   └── backup.sh                   # Database backup script
├── docs/
│   ├── api-reference.md            # Complete API documentation
│   ├── mcp-integration.md          # MCP setup guide
│   ├── openwebui-setup.md          # Open WebUI configuration
│   ├── deployment-guide.md         # Production deployment
│   ├── troubleshooting.md          # Common issues and solutions
│   └── contributing.md             # Development guide
├── config/
│   ├── nginx.conf                  # Nginx configuration
│   ├── redis.conf                  # Redis configuration
│   └── grafana/                    # Monitoring dashboards
└── tests/
    ├── integration/                # Integration tests
    ├── e2e/                        # End-to-end tests
    └── performance/                # Performance benchmarks
```

#### Documentation Package

**README.md Structure:**
```markdown
# WebHarvest - Self-Hosted Web Scraping + AI Chat Platform

## Quick Start
- Prerequisites
- One-command setup
- First crawl tutorial

## Features
- Firecrawl-compatible API
- MCP server integration
- Open WebUI chat interface
- Self-hosted deployment

## Configuration
- Environment variables
- Domain allowlists/denylists
- Rate limiting settings
- Security options

## API Reference
- REST endpoints
- MCP tools
- Authentication
- Error codes

## Deployment
- Docker Compose
- Kubernetes (Helm charts)
- Production considerations
- Monitoring setup
```

#### API Documentation

**OpenAPI Specification (openapi.yaml):**
Complete OpenAPI 3.0 specification with:
- All endpoint definitions
- Request/response schemas
- Authentication requirements
- Error code documentation
- Example requests and responses

**MCP Tools Documentation (mcp-tools.json):**
```json
{
  "tools": [
    {
      "name": "scrape_url",
      "description": "Scrape a single URL and extract content",
      "input_schema": { /* complete schema */ },
      "examples": [ /* usage examples */ ]
    }
    // ... all 10 tools with complete documentation
  ],
  "resources": [ /* MCP resources */ ],
  "prompts": [ /* MCP prompts */ ]
}
```

#### Testing and Quality Assurance

**Test Coverage Report:**
- Minimum 80% code coverage for core functionality
- 100% coverage for API endpoints
- Integration tests for all major workflows
- Performance benchmarks with baseline metrics

**Quality Gates:**
- All tests pass in CI/CD pipeline
- Security scan with zero critical vulnerabilities
- Performance tests meet defined benchmarks
- Documentation completeness verification

#### Production Deployment Assets

**Kubernetes Helm Chart:**
```yaml
# Chart.yaml
apiVersion: v2
name: webharvest
description: Self-hosted web scraping platform
type: application
version: 1.0.0
appVersion: "1.0.0"

# values.yaml
replicaCount: 1
image:
  repository: webharvest
  tag: latest
service:
  type: ClusterIP
  port: 80
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
resources:
  limits:
    cpu: 500m
    memory: 512Mi
persistence:
  enabled: true
  size: 10Gi
```

**Monitoring Stack:**
- Prometheus configuration
- Grafana dashboards
- Alerting rules
- Log aggregation setup

#### Metadata and Marketing

**JSON-LD Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "WebHarvest",
  "description": "Self-hosted web scraping platform with AI chat integration",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": ["Linux", "macOS", "Windows"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "WebHarvest Contributors"
  }
}
```

### Hardware Requirements

#### Minimum Configuration (Development)
- **CPU:** 4 cores (x86_64 or ARM64)
- **Memory:** 8GB RAM
- **Storage:** 50GB available disk space
- **Network:** Broadband internet connection

#### Recommended Configuration (Production)
- **CPU:** 8+ cores (x86_64)
- **Memory:** 32GB RAM
- **Storage:** 500GB SSD
- **Network:** High-speed internet with static IP
- **Optional:** GPU for enhanced embedding performance

#### Scaling Considerations
- **Horizontal:** Multiple worker containers for increased throughput
- **Vertical:** Additional RAM for larger crawl jobs and caching
- **Storage:** Object storage (S3/MinIO) for archived content
- **Network:** CDN for static assets and geographic distribution

### FAQ for Implementation

**Q: How does this compare to Firecrawl in terms of features?**
A: WebHarvest provides API compatibility with Firecrawl v2 plus additional features like MCP integration, change tracking, and Open WebUI chat interface. The main difference is self-hosting vs. SaaS.

**Q: What's the learning curve for setup?**
A: With Docker Compose, setup takes <30 minutes. The included setup script handles all dependencies and configuration. Basic Docker knowledge is helpful but not required.

**Q: How does rate limiting work?**
A: Per-domain rate limiting with configurable concurrency (default: 2 concurrent requests per domain, 500ms delay). Automatic exponential backoff for 429/503 responses.

**Q: Can this handle JavaScript-heavy sites?**
A: Yes, using Playwright with full browser rendering. The Action DSL supports common interactions like clicking buttons and waiting for content. Performance impact is managed through timeouts and limits.

**Q: What about legal compliance?**
A: WebHarvest respects robots.txt by default, implements rate limiting, and provides domain filtering. Users are responsible for compliance with site terms and applicable laws.

**Q: How does the MCP integration work?**
A: WebHarvest runs a Streamable HTTP MCP server that Open WebUI connects to. This provides 10+ tools for scraping and content management that can be invoked through natural language chat.

---

*This enhanced PRD provides a complete implementation blueprint for WebHarvest, combining the original vision with detailed technical specifications from the ChatGPT analysis. Every component is designed to be implemented without stubs, using proven open-source technologies and following industry best practices.*