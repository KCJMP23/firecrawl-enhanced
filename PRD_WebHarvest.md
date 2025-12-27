# Product Requirements Document: WebHarvest

## Executive Summary

**Product Name:** WebHarvest  
**Tagline:** "Your AI-Powered Web Intelligence Platform - Harvest Knowledge, Not Just Data"  
**Version:** 1.0  
**Date:** December 2024

WebHarvest is an open-source, self-hosted alternative to Firecrawl that combines powerful web scraping capabilities with MCP (Model Context Protocol) server integration and an intuitive OpenWebUI interface. It transforms any website into LLM-ready markdown with advanced document processing, RAG capabilities, and seamless AI chat interactions.

## Problem Statement

Current web scraping and data extraction solutions present significant challenges:
- **Cost Prohibitive:** Services like Firecrawl charge per-page rates that quickly become unsustainable
- **Vendor Lock-in:** Proprietary APIs create dependency and limit customization
- **Limited Integration:** Most solutions don't seamlessly integrate with modern AI workflows
- **Privacy Concerns:** Cloud-based solutions require sending sensitive data to third parties
- **Complexity:** Setting up comprehensive web scraping with AI integration requires multiple tools

## Solution Overview

WebHarvest provides a complete, self-hosted solution that combines:
- Advanced web scraping and crawling capabilities
- MCP server for standardized AI integration
- OpenWebUI interface for intuitive interaction
- Document processing and RAG capabilities
- Real-time chat with scraped content
- Drag-and-drop file management

## Target Users

### Primary Users
1. **Small Development Teams** - Need cost-effective web data extraction
2. **AI/ML Engineers** - Require clean training data from web sources
3. **Research Organizations** - Need to collect and analyze web content at scale
4. **Content Creators** - Want to aggregate and analyze online information
5. **Enterprise Teams** - Require on-premise solutions for data privacy

### User Personas

**Developer Dan**
- Role: Full-stack developer at a startup
- Pain: Firecrawl credits depleting too quickly
- Need: Self-hosted solution with API access

**Researcher Rachel**
- Role: Data scientist at a research institution
- Pain: Manual web data collection is time-consuming
- Need: Automated crawling with AI analysis

**Enterprise Emma**
- Role: IT Manager at a Fortune 500
- Pain: Data privacy regulations prevent cloud solutions
- Need: On-premise deployment with security controls

## Core Features & Requirements

### 1. Web Scraping Engine

#### 1.1 Scraping Capabilities
- **Single Page Scraping**
  - Convert any URL to clean markdown
  - Extract structured data (JSON mode)
  - Capture screenshots
  - Preserve HTML structure
  - Handle JavaScript-rendered content
  
- **Crawling Features**
  - Recursive site crawling with depth control
  - Sitemap detection and parsing
  - URL pattern filtering
  - Concurrent request management (configurable)
  - Robots.txt compliance
  - Rate limiting and throttling

#### 1.2 Content Processing
- **Output Formats**
  - Markdown (primary)
  - Structured JSON
  - HTML preservation
  - Screenshots (PNG/JPEG)
  - PDF generation
  
- **Advanced Processing**
  - Iframe content extraction
  - Mobile viewport scraping
  - Geolocation simulation
  - Cookie/session management
  - Custom headers injection

#### 1.3 Anti-Bot Protection
- **Stealth Mode**
  - Browser fingerprint rotation
  - Proxy support (HTTP/SOCKS5)
  - User-agent randomization
  - Request header variation
  - WebRTC leak prevention

### 2. MCP Server Implementation

#### 2.1 Core MCP Components
- **Resources**
  - Scraped web pages as resources
  - Document library access
  - Crawl history retrieval
  - Configuration templates
  
- **Tools**
  - `scrape_url` - Single page extraction
  - `crawl_site` - Full site crawling
  - `search_web` - Web search integration
  - `extract_data` - Structured data extraction
  - `generate_summary` - AI summarization
  
- **Prompts**
  - Web analysis templates
  - Data extraction patterns
  - Content summarization prompts
  - Q&A conversation starters

#### 2.2 MCP Protocol Support
- JSON-RPC 2.0 communication
- Stateful session management
- Authentication/authorization
- Error handling and retry logic
- Request/response logging

### 3. OpenWebUI Integration

#### 3.1 Chat Interface
- **Conversation Features**
  - Real-time web content chat
  - Multi-turn conversations
  - Context preservation
  - Citation tracking
  - Code syntax highlighting
  
- **RAG Capabilities**
  - Vector embedding generation
  - Semantic search
  - Document chunking
  - Relevance scoring
  - Source attribution

#### 3.2 Document Management
- **File Operations**
  - Drag-and-drop upload
  - Batch processing
  - Format detection
  - Preview generation
  - Organization (folders/tags)
  
- **Supported Formats**
  - Web pages (via URL)
  - PDF documents
  - Word documents
  - Markdown files
  - JSON/CSV data
  - Images (with OCR)

#### 3.3 UI Features
- **Workspace Management**
  - Project organization
  - Saved configurations
  - Crawl history
  - Analytics dashboard
  
- **Collaboration**
  - Share conversations
  - Export results
  - Team workspaces
  - Permission management

### 4. Technical Architecture

#### 4.1 Backend Services

**Core Scraping Service**
```
Technology Stack:
- Language: Python 3.11+
- Framework: FastAPI
- Browser Engine: Playwright (multi-browser)
- Task Queue: Celery + Redis
- Database: PostgreSQL
- Vector DB: Qdrant (scalable) / ChromaDB (development)
```

**MCP Server**
```
Technology Stack:
- Language: TypeScript/Python
- Protocol: JSON-RPC 2.0
- Transport: WebSocket/HTTP
- SDK: Official MCP SDK
```

**API Gateway**
```
Technology Stack:
- Framework: Express.js / FastAPI
- Authentication: JWT + OAuth2
- Rate Limiting: Redis
- Documentation: OpenAPI 3.0
```

#### 4.2 Frontend Application

**OpenWebUI Customization**
```
Technology Stack:
- Base: OpenWebUI (latest)
- Customization: React components
- State Management: Redux/Zustand
- UI Library: Tailwind CSS
- WebSocket: Socket.io
```

#### 4.3 Data Storage

**Primary Database**
```yaml
PostgreSQL:
  - User management
  - Crawl metadata
  - Configuration
  - Session data
```

**Vector Database**
```yaml
Development: ChromaDB
  - Embedded mode
  - <10M vectors
  - Rapid prototyping

Production: Qdrant
  - Distributed mode
  - Unlimited scale
  - Advanced filtering
```

**Cache Layer**
```yaml
Redis:
  - Session cache
  - Rate limiting
  - Task queue
  - Temporary data
```

**Object Storage**
```yaml
MinIO/S3:
  - Screenshots
  - Downloaded files
  - Archived content
  - Backup data
```

### 5. Open Source Components

#### 5.1 Core Dependencies

**Web Scraping**
- Playwright - Browser automation
- BeautifulSoup4 - HTML parsing
- Readability - Content extraction
- Mozilla Readability - Article extraction

**AI/ML Processing**
- LangChain - LLM orchestration
- Sentence-transformers - Embeddings
- OpenAI/Ollama - LLM integration
- Unstructured - Document parsing

**Infrastructure**
- Docker - Containerization
- Kubernetes - Orchestration (optional)
- Nginx - Reverse proxy
- Certbot - SSL certificates

#### 5.2 Integration Libraries

**MCP Implementation**
- Official MCP SDK (TypeScript/Python)
- JSON-RPC library
- WebSocket server

**OpenWebUI Extensions**
- Custom plugins
- Theme modifications
- API connectors

### 6. Deployment & Operations

#### 6.1 Deployment Options

**Docker Compose (Recommended)**
```yaml
services:
  webharvest-api:
    image: webharvest/api:latest
    environment:
      - DATABASE_URL
      - REDIS_URL
      - SECRET_KEY
    ports:
      - "8080:8080"
  
  webharvest-mcp:
    image: webharvest/mcp:latest
    environment:
      - API_ENDPOINT
      - AUTH_TOKEN
    ports:
      - "3000:3000"
  
  openwebui:
    image: webharvest/openwebui:latest
    environment:
      - MCP_SERVER_URL
      - API_BASE_URL
    ports:
      - "80:80"
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
  
  qdrant:
    image: qdrant/qdrant
    volumes:
      - qdrant_data:/qdrant/storage
```

**Kubernetes Deployment**
- Helm charts provided
- Horizontal pod autoscaling
- Persistent volume claims
- Ingress configuration

**Local Development**
```bash
# Quick start
git clone https://github.com/webharvest/webharvest
cd webharvest
./scripts/setup.sh
docker-compose up
```

#### 6.2 Configuration

**Environment Variables**
```env
# Core Settings
WEBHARVEST_API_URL=http://localhost:8080
WEBHARVEST_MCP_PORT=3000
WEBHARVEST_UI_PORT=80

# Database
DATABASE_URL=postgresql://user:pass@localhost/webharvest
REDIS_URL=redis://localhost:6379
VECTOR_DB_URL=http://localhost:6333

# Scraping
MAX_CONCURRENT_REQUESTS=10
DEFAULT_TIMEOUT=30000
USER_AGENT_ROTATION=true
PROXY_ENABLED=false

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key
ALLOWED_ORIGINS=http://localhost

# AI/LLM
OPENAI_API_KEY=optional
OLLAMA_URL=http://localhost:11434
DEFAULT_EMBEDDING_MODEL=all-MiniLM-L6-v2
```

### 7. API Specifications

#### 7.1 REST API Endpoints

**Scraping Endpoints**
```
POST /api/v1/scrape
  Body: { url, formats: ["markdown", "json"], options }
  Response: { content, metadata, usage }

POST /api/v1/crawl
  Body: { url, maxDepth, includes, excludes, options }
  Response: { jobId, status, estimatedPages }

GET /api/v1/crawl/{jobId}
  Response: { status, progress, results, errors }
```

**Document Endpoints**
```
POST /api/v1/documents
  Body: { file, type, metadata }
  Response: { documentId, status }

GET /api/v1/documents/{documentId}
  Response: { content, metadata, embeddings }

POST /api/v1/search
  Body: { query, filters, limit }
  Response: { results, totalCount, facets }
```

#### 7.2 MCP Protocol

**Available Tools**
```json
{
  "tools": [
    {
      "name": "scrape_url",
      "description": "Scrape a single URL",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "format": { "type": "string", "enum": ["markdown", "json", "html"] }
        }
      }
    },
    {
      "name": "crawl_site",
      "description": "Crawl entire website",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "maxDepth": { "type": "number" },
          "maxPages": { "type": "number" }
        }
      }
    }
  ]
}
```

### 8. Performance Requirements

#### 8.1 Scalability Targets
- Handle 1000+ concurrent scraping requests
- Process 100,000+ pages per day
- Store 10M+ document vectors
- Support 100+ simultaneous users
- <2 second page load time

#### 8.2 Resource Efficiency
- Automatic resource cleanup
- Memory-efficient streaming
- Connection pooling
- Cache optimization
- Background job processing

### 9. Security & Privacy

#### 9.1 Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- API key management
- Rate limiting per user/IP
- Input sanitization
- XSS/CSRF protection

#### 9.2 Privacy Controls
- On-premise deployment
- No external telemetry
- Data encryption at rest
- TLS for all connections
- GDPR compliance tools
- Audit logging

### 10. Monitoring & Analytics

#### 10.1 Metrics Dashboard
- Scraping success/failure rates
- Page processing times
- API usage statistics
- Error tracking
- Resource utilization

#### 10.2 Observability
- Structured logging (JSON)
- Distributed tracing (OpenTelemetry)
- Health checks endpoints
- Prometheus metrics export
- Grafana dashboard templates

## Development Phases

### Phase 1: Core MVP (Weeks 1-4)
- [ ] Basic scraping engine with Playwright
- [ ] Single URL to markdown conversion
- [ ] Simple REST API
- [ ] PostgreSQL setup
- [ ] Docker compose configuration

### Phase 2: MCP Integration (Weeks 5-6)
- [ ] MCP server implementation
- [ ] Basic tools (scrape, search)
- [ ] JSON-RPC communication
- [ ] Authentication system

### Phase 3: OpenWebUI Integration (Weeks 7-8)
- [ ] OpenWebUI customization
- [ ] Chat interface with scraped content
- [ ] Document upload/management
- [ ] Basic RAG implementation

### Phase 4: Advanced Features (Weeks 9-10)
- [ ] Crawling capabilities
- [ ] Vector database integration
- [ ] Advanced anti-bot features
- [ ] Batch processing

### Phase 5: Production Ready (Weeks 11-12)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation
- [ ] Deployment scripts
- [ ] Testing suite

## Success Metrics

### Technical KPIs
- Page scraping success rate >95%
- API response time <500ms (p95)
- System uptime >99.9%
- Zero critical security vulnerabilities

### User KPIs
- Setup time <30 minutes
- User satisfaction score >4.5/5
- Active installations >1000 (Year 1)
- GitHub stars >500 (6 months)

### Business KPIs
- Cost savings >80% vs Firecrawl
- Community contributors >20
- Production deployments >100

## Competitive Advantages

1. **100% Self-Hosted** - Complete data sovereignty
2. **No Usage Limits** - Scrape unlimited pages
3. **MCP Standard** - Future-proof AI integration
4. **Open Source** - Transparent, customizable, no vendor lock-in
5. **Unified Platform** - Scraping + AI chat in one solution
6. **Cost Effective** - One-time setup, no recurring fees
7. **Privacy First** - Your data never leaves your infrastructure

## Risk Mitigation

### Technical Risks
- **Risk:** Website anti-scraping measures
- **Mitigation:** Stealth mode, proxy rotation, browser fingerprinting

### Legal Risks
- **Risk:** Copyright/TOS violations
- **Mitigation:** Robots.txt compliance, rate limiting, user responsibility disclaimers

### Adoption Risks
- **Risk:** Complex setup for non-technical users
- **Mitigation:** One-click installers, comprehensive documentation, video tutorials

## Conclusion

WebHarvest addresses the critical need for an affordable, privacy-focused web scraping solution integrated with modern AI capabilities. By leveraging open-source components and standard protocols like MCP, it provides a robust alternative to expensive SaaS solutions while maintaining complete data sovereignty.

The modular architecture ensures easy customization and extension, while the familiar OpenWebUI interface reduces the learning curve. With comprehensive features from basic scraping to advanced AI-powered analysis, WebHarvest positions itself as the go-to solution for teams seeking control over their web data extraction pipeline.

## Appendices

### A. Technology Stack Summary
- **Backend:** Python/FastAPI, TypeScript
- **Frontend:** OpenWebUI (customized)
- **Database:** PostgreSQL, Redis, Qdrant/ChromaDB
- **Scraping:** Playwright
- **AI/ML:** LangChain, Sentence-transformers
- **Deployment:** Docker, Kubernetes

### B. API Rate Limits (Configurable)
- Free tier: 100 requests/hour
- Standard: 1000 requests/hour
- Enterprise: Unlimited

### C. Hardware Requirements
**Minimum (Development):**
- 4 CPU cores
- 8GB RAM
- 50GB storage

**Recommended (Production):**
- 8+ CPU cores
- 32GB RAM
- 500GB SSD storage
- GPU (optional, for embeddings)

### D. License
- Core: MIT License
- Documentation: CC BY 4.0
- Commercial support available

---

*This PRD serves as the complete blueprint for WebHarvest development. Each component is designed to be implemented without stubs, using proven open-source libraries and frameworks. The modular architecture allows for parallel development and incremental feature rollout.*