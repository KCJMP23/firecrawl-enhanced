# Component Diagrams

This document provides detailed component-level diagrams for both WebHarvest and WebClone Pro systems.

## 1. WebHarvest Component Architecture

### 1.1 Service Layer Components

```mermaid
graph TB
    subgraph "API Server Components"
        MAIN[main.py<br/>FastAPI Application]
        MIDDLEWARE[Metrics Middleware<br/>CORS & Security]
        
        subgraph "API Routes"
            SCRAPE[/v2/scrape<br/>Single URL Scraping]
            CRAWL[/v2/crawl<br/>Website Crawling]
            BATCH[/v2/batch<br/>Bulk Processing]
            MAP[/v2/map<br/>Site Mapping]
            HEALTH[/healthz<br/>Health Checks]
            METRICS[/metrics<br/>Prometheus]
        end
        
        subgraph "MCP Server"
            MCP_ENHANCED[MCP Enhanced Server<br/>WebSocket/JSON-RPC]
            MCP_TOOLS[MCP Tools<br/>scrape, crawl, batch]
        end
    end

    subgraph "Service Layer"
        SCRAPER_SERVICE[Scraper Service<br/>Content Extraction]
        TASK_MANAGER[Task Manager<br/>Job Orchestration]
        OPENWEBUI_CONNECTOR[OpenWebUI Connector<br/>AI Integration]
    end

    subgraph "Utility Components"
        AUTH[Authentication<br/>API Key Validation]
        LOGGING[Structured Logging<br/>Request Tracking]
        CACHE[Redis Cache<br/>Response Caching]
    end

    MAIN --> MIDDLEWARE
    MIDDLEWARE --> SCRAPE
    MIDDLEWARE --> CRAWL
    MIDDLEWARE --> BATCH
    MIDDLEWARE --> MAP
    MIDDLEWARE --> HEALTH
    MIDDLEWARE --> METRICS

    SCRAPE --> SCRAPER_SERVICE
    CRAWL --> TASK_MANAGER
    BATCH --> TASK_MANAGER
    MAP --> SCRAPER_SERVICE

    MCP_ENHANCED --> MCP_TOOLS
    MCP_TOOLS --> SCRAPER_SERVICE

    SCRAPER_SERVICE --> AUTH
    TASK_MANAGER --> AUTH
    
    SCRAPER_SERVICE --> LOGGING
    TASK_MANAGER --> LOGGING
    
    SCRAPER_SERVICE --> CACHE
    
    style MAIN fill:#e1f5fe
    style SCRAPER_SERVICE fill:#f3e5f5
    style TASK_MANAGER fill:#f3e5f5
    style AUTH fill:#e8f5e8
```

### 1.2 Worker Components

```mermaid
graph TB
    subgraph "Celery Worker Architecture"
        WORKER_MAIN[worker/main.py<br/>Celery Application]
        
        subgraph "Task Processors"
            SCRAPE_TASK[Scrape Task<br/>Single URL Processing]
            CRAWL_TASK[Crawl Task<br/>Multi-page Crawling]
            BATCH_TASK[Batch Task<br/>Bulk URL Processing]
            CLEANUP_TASK[Cleanup Task<br/>Resource Management]
        end
        
        subgraph "Browser Automation"
            PLAYWRIGHT[Playwright Manager<br/>Browser Lifecycle]
            BROWSER_POOL[Browser Pool<br/>Instance Management]
            PAGE_PROCESSOR[Page Processor<br/>Content Extraction]
        end
        
        subgraph "Content Processing"
            HTML_PARSER[HTML Parser<br/>BeautifulSoup/lxml]
            MARKDOWN_CONVERTER[Markdown Converter<br/>Content Cleanup]
            METADATA_EXTRACTOR[Metadata Extractor<br/>SEO & Schema]
            LINK_EXTRACTOR[Link Extractor<br/>URL Discovery]
        end
    end

    WORKER_MAIN --> SCRAPE_TASK
    WORKER_MAIN --> CRAWL_TASK
    WORKER_MAIN --> BATCH_TASK
    WORKER_MAIN --> CLEANUP_TASK

    SCRAPE_TASK --> PLAYWRIGHT
    CRAWL_TASK --> PLAYWRIGHT
    BATCH_TASK --> PLAYWRIGHT

    PLAYWRIGHT --> BROWSER_POOL
    BROWSER_POOL --> PAGE_PROCESSOR

    PAGE_PROCESSOR --> HTML_PARSER
    PAGE_PROCESSOR --> MARKDOWN_CONVERTER
    PAGE_PROCESSOR --> METADATA_EXTRACTOR
    PAGE_PROCESSOR --> LINK_EXTRACTOR

    style WORKER_MAIN fill:#f3e5f5
    style PLAYWRIGHT fill:#fff3e0
    style HTML_PARSER fill:#e8f5e8
    style MARKDOWN_CONVERTER fill:#e8f5e8
```

### 1.3 Database Schema Components

```mermaid
erDiagram
    projects {
        uuid id PK
        varchar name
        text description
        timestamp created_at
        timestamp updated_at
        varchar openwebui_collection_id
        varchar sync_mode
        text_array domain_allowlist
        text_array domain_denylist
        integer max_pages_per_crawl
        integer rate_limit_per_domain
        integer rate_limit_delay_ms
    }

    crawl_jobs {
        uuid id PK
        uuid project_id FK
        text seed_url
        jsonb request_json
        varchar status
        timestamp created_at
        timestamp started_at
        timestamp finished_at
        integer total_discovered
        integer completed
        integer failed
        boolean canceled
        text error
        text webhook_url
        varchar created_by
    }

    crawl_pages {
        uuid id PK
        uuid crawl_job_id FK
        text url
        text normalized_url
        integer status_code
        text markdown
        text html
        text raw_html
        text_array links
        text_array images
        jsonb metadata
        varchar content_hash
        text error
        timestamp created_at
        integer processing_time_ms
    }

    batch_jobs {
        uuid id PK
        uuid project_id FK
        text_array urls
        jsonb request_json
        varchar status
        timestamp created_at
        timestamp started_at
        timestamp finished_at
        integer total_urls
        integer completed
        integer failed
        text webhook_url
        varchar created_by
    }

    batch_results {
        uuid id PK
        uuid batch_job_id FK
        text url
        integer status_code
        text markdown
        text html
        jsonb metadata
        varchar content_hash
        text error
        timestamp created_at
    }

    scrape_cache {
        varchar cache_key PK
        text url
        text normalized_url
        varchar request_hash
        jsonb response_json
        varchar content_hash
        timestamp created_at
        timestamp expires_at
    }

    api_keys {
        uuid id PK
        varchar key_hash UK
        varchar name
        uuid project_id FK
        jsonb permissions
        integer rate_limit
        timestamp expires_at
        timestamp last_used_at
        timestamp created_at
        varchar created_by
        boolean is_active
    }

    projects ||--o{ crawl_jobs : "has"
    crawl_jobs ||--o{ crawl_pages : "contains"
    projects ||--o{ batch_jobs : "has"
    batch_jobs ||--o{ batch_results : "contains"
    projects ||--o{ api_keys : "has"
```

## 2. WebClone Pro Component Architecture

### 2.1 Frontend Components

```mermaid
graph TB
    subgraph "Next.js Application Structure"
        APP_ROOT[app/layout.tsx<br/>Root Layout]
        
        subgraph "Page Components"
            LANDING[app/page.tsx<br/>Landing Page]
            DASHBOARD[app/dashboard/page.tsx<br/>Dashboard]
            EDITOR[app/editor/[id]/page.tsx<br/>Project Editor]
            AUTH[app/auth/page.tsx<br/>Authentication]
            PRICING[app/pricing/page.tsx<br/>Pricing]
            ADMIN[app/admin/page.tsx<br/>Admin Panel]
        end
        
        subgraph "UI Components"
            CLONE_PROGRESS[CloneProgress.tsx<br/>Real-time Progress]
            COLLAB_EDITOR[CollaborativeEditor.tsx<br/>Code Editor]
            AI_CHAT[AICodeGenerator.tsx<br/>AI Assistant]
            DEPLOY_DIALOG[DeployDialog.tsx<br/>Deployment UI]
            BILLING[BillingSubscriptionManagement.tsx<br/>Billing UI]
        end
        
        subgraph "3D Components"
            HERO_3D[Hero3D.tsx<br/>Landing Animation]
            THREE_FIBER[React Three Fiber<br/>3D Rendering]
        end
    end

    APP_ROOT --> LANDING
    APP_ROOT --> DASHBOARD
    APP_ROOT --> EDITOR
    APP_ROOT --> AUTH
    APP_ROOT --> PRICING
    APP_ROOT --> ADMIN

    DASHBOARD --> CLONE_PROGRESS
    EDITOR --> COLLAB_EDITOR
    EDITOR --> AI_CHAT
    DASHBOARD --> DEPLOY_DIALOG
    PRICING --> BILLING

    LANDING --> HERO_3D
    HERO_3D --> THREE_FIBER

    style APP_ROOT fill:#e3f2fd
    style COLLAB_EDITOR fill:#f3e5f5
    style AI_CHAT fill:#f3e5f5
    style HERO_3D fill:#fff3e0
```

### 2.2 API Routes Architecture

```mermaid
graph TB
    subgraph "Next.js API Routes"
        API_ROOT[app/api/]
        
        subgraph "Core APIs"
            CLONE_API[clone/route.ts<br/>Website Cloning]
            PDF_API[pdf/upload/route.ts<br/>PDF Processing]
            CACHE_API[cache/route.ts<br/>Cache Management]
            HEALTH_API[health/route.ts<br/>Health Checks]
        end
        
        subgraph "AI Services"
            DESIGN_DNA[design-dna/extract/route.ts<br/>Design Analysis]
            ANIMATIONS[animations/extract/route.ts<br/>Animation Analysis]
        end
        
        subgraph "Collaboration"
            COLLAB_AUTH[collaboration/auth/route.ts<br/>Collab Authentication]
        end
        
        subgraph "Billing & Credits"
            CREDITS_BALANCE[credits/balance/route.ts<br/>Credit Balance]
            CREDITS_PURCHASE[credits/purchase/route.ts<br/>Credit Purchase]
            STRIPE_CHECKOUT[stripe/checkout/route.ts<br/>Payment Checkout]
            STRIPE_WEBHOOK[stripe/webhook/route.ts<br/>Payment Webhooks]
        end
        
        subgraph "Deployment"
            DEPLOY[deploy/route.ts<br/>Site Deployment]
            EXPORT[export/route.ts<br/>Code Export]
        end
        
        subgraph "Analytics"
            USAGE_ANALYTICS[usage/analytics/route.ts<br/>Usage Tracking]
            METRICS[metrics/route.ts<br/>Performance Metrics]
        end
    end

    API_ROOT --> CLONE_API
    API_ROOT --> PDF_API
    API_ROOT --> CACHE_API
    API_ROOT --> HEALTH_API
    
    API_ROOT --> DESIGN_DNA
    API_ROOT --> ANIMATIONS
    
    API_ROOT --> COLLAB_AUTH
    
    API_ROOT --> CREDITS_BALANCE
    API_ROOT --> CREDITS_PURCHASE
    API_ROOT --> STRIPE_CHECKOUT
    API_ROOT --> STRIPE_WEBHOOK
    
    API_ROOT --> DEPLOY
    API_ROOT --> EXPORT
    
    API_ROOT --> USAGE_ANALYTICS
    API_ROOT --> METRICS

    style API_ROOT fill:#e8f5e8
    style CLONE_API fill:#f3e5f5
    style DESIGN_DNA fill:#f3e5f5
    style STRIPE_CHECKOUT fill:#fff3e0
    style DEPLOY fill:#fce4ec
```

### 2.3 AI Service Components

```mermaid
graph TB
    subgraph "AI Service Architecture"
        AI_OPTIMIZER[AI Cost Optimizer<br/>lib/ai-cost-optimizer.ts]
        
        subgraph "AI Processing"
            DESIGN_EXTRACTOR[Design DNA Extractor<br/>lib/design-dna-extractor.ts]
            ANIMATION_EXTRACTOR[Animation Extractor<br/>lib/animation-extractor.ts]
            PDF_PROCESSOR[PDF Processor<br/>lib/pdf-processor.ts]
            CODE_GENERATOR[AI Code Generator<br/>Components/AICodeGenerator.tsx]
        end
        
        subgraph "AI Models"
            OPENAI_CLIENT[OpenAI Client<br/>GPT-4 Integration]
            MODEL_SELECTOR[AI Model Selection<br/>Dynamic Model Switching]
            COST_CALCULATOR[Cost Calculator<br/>Token Usage Tracking]
        end
        
        subgraph "Vector Processing"
            EMBEDDINGS[Text Embeddings<br/>Content Vectorization]
            SIMILARITY[Similarity Search<br/>Design Matching]
            SEMANTIC_CACHE[Semantic Cache<br/>Vector-based Caching]
        end
    end

    AI_OPTIMIZER --> DESIGN_EXTRACTOR
    AI_OPTIMIZER --> ANIMATION_EXTRACTOR
    AI_OPTIMIZER --> PDF_PROCESSOR
    AI_OPTIMIZER --> CODE_GENERATOR

    DESIGN_EXTRACTOR --> OPENAI_CLIENT
    ANIMATION_EXTRACTOR --> OPENAI_CLIENT
    PDF_PROCESSOR --> OPENAI_CLIENT
    CODE_GENERATOR --> OPENAI_CLIENT

    AI_OPTIMIZER --> MODEL_SELECTOR
    MODEL_SELECTOR --> COST_CALCULATOR

    DESIGN_EXTRACTOR --> EMBEDDINGS
    EMBEDDINGS --> SIMILARITY
    SIMILARITY --> SEMANTIC_CACHE

    style AI_OPTIMIZER fill:#f3e5f5
    style OPENAI_CLIENT fill:#fff3e0
    style EMBEDDINGS fill:#fce4ec
    style SEMANTIC_CACHE fill:#e8f5e8
```

### 2.4 Database Schema Components (Supabase)

```mermaid
erDiagram
    profiles {
        uuid id PK
        text email UK
        text full_name
        text avatar_url
        text subscription_plan
        text subscription_status
        integer credits_remaining
        integer max_websites
        timestamp created_at
        timestamp updated_at
    }

    projects {
        uuid id PK
        uuid user_id FK
        text name
        text description
        text original_url
        text status
        integer progress
        jsonb clone_settings
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    clones {
        uuid id PK
        uuid project_id FK
        text name
        integer version
        text status
        jsonb clone_data
        jsonb assets
        jsonb pages
        text hosting_url
        bigint size_bytes
        timestamp created_at
        timestamp updated_at
    }

    chat_sessions {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        text name
        text system_prompt
        timestamp created_at
        timestamp updated_at
    }

    chat_messages {
        uuid id PK
        uuid session_id FK
        text role
        text content
        jsonb metadata
        timestamp created_at
    }

    pdf_documents {
        uuid id PK
        uuid user_id FK
        text filename
        text storage_path
        jsonb metadata
        text processing_status
        text content_text
        jsonb analysis_results
        timestamp created_at
        timestamp updated_at
    }

    usage_analytics {
        uuid id PK
        uuid user_id FK
        text event_type
        jsonb event_data
        timestamp created_at
    }

    deployments {
        uuid id PK
        uuid project_id FK
        uuid clone_id FK
        text platform
        text deployment_url
        text status
        jsonb config
        timestamp created_at
        timestamp updated_at
    }

    profiles ||--o{ projects : "owns"
    projects ||--o{ clones : "has"
    profiles ||--o{ chat_sessions : "creates"
    chat_sessions ||--o{ chat_messages : "contains"
    profiles ||--o{ pdf_documents : "uploads"
    profiles ||--o{ usage_analytics : "generates"
    projects ||--o{ deployments : "deploys"
    clones ||--o{ deployments : "deploys"
```

### 2.5 Real-time Collaboration Components

```mermaid
graph TB
    subgraph "Collaboration Stack"
        LIVEBLOCKS[Liveblocks Provider<br/>lib/liveblocks.ts]
        
        subgraph "Editor Components"
            COLLAB_EDITOR[CollaborativeEditor.tsx<br/>Main Editor Interface]
            MONACO_EDITOR[Monaco Editor<br/>Code Editor]
            COLLAB_CANVAS[CollaborativeCanvas.tsx<br/>Visual Editor]
        end
        
        subgraph "CRDT Integration"
            YJS[Y.js Document<br/>Conflict-free Replicated Data]
            Y_MONACO[Y-Monaco Binding<br/>Editor Synchronization]
            Y_WEBSOCKET[Y-WebSocket Provider<br/>Real-time Sync]
        end
        
        subgraph "Real-time Features"
            LIVE_CURSORS[Live Cursors<br/>User Presence]
            LIVE_AWARENESS[Live Awareness<br/>User Status]
            LIVE_COMMENTS[Live Comments<br/>Collaborative Notes]
            VERSION_HISTORY[Version Control<br/>Change Tracking]
        end
    end

    LIVEBLOCKS --> COLLAB_EDITOR
    LIVEBLOCKS --> COLLAB_CANVAS

    COLLAB_EDITOR --> MONACO_EDITOR
    MONACO_EDITOR --> Y_MONACO
    
    Y_MONACO --> YJS
    YJS --> Y_WEBSOCKET
    
    LIVEBLOCKS --> LIVE_CURSORS
    LIVEBLOCKS --> LIVE_AWARENESS
    LIVEBLOCKS --> LIVE_COMMENTS
    LIVEBLOCKS --> VERSION_HISTORY

    style LIVEBLOCKS fill:#fce4ec
    style YJS fill:#f3e5f5
    style MONACO_EDITOR fill:#e3f2fd
    style LIVE_CURSORS fill:#fff3e0
```

## 3. External Service Integration Components

### 3.1 WebHarvest External Integrations

```mermaid
graph LR
    subgraph "WebHarvest"
        WH_API[WebHarvest API]
    end

    subgraph "External Services"
        OPENAI[OpenAI API<br/>GPT Models]
        OPENWEBUI[Open WebUI<br/>Chat Interface]
        QDRANT[Qdrant<br/>Vector Database]
        WEBHOOKS[Webhook Endpoints<br/>External Notifications]
        PROMETHEUS[Prometheus<br/>Metrics Collection]
    end

    WH_API --> OPENAI
    WH_API --> OPENWEBUI
    WH_API --> QDRANT
    WH_API --> WEBHOOKS
    WH_API --> PROMETHEUS

    style WH_API fill:#f3e5f5
    style OPENAI fill:#fff3e0
    style QDRANT fill:#fce4ec
```

### 3.2 WebClone Pro External Integrations

```mermaid
graph LR
    subgraph "WebClone Pro"
        WCP_API[WebClone Pro API]
    end

    subgraph "External Services"
        OPENAI[OpenAI API<br/>GPT-4, DALL-E]
        STRIPE[Stripe<br/>Payment Processing]
        SUPABASE[Supabase<br/>Backend as a Service]
        GITHUB[GitHub<br/>Version Control]
        VERCEL[Vercel<br/>Deployment Platform]
        CDN[CDN Services<br/>Asset Delivery]
        LIVEBLOCKS_CLOUD[Liveblocks Cloud<br/>Collaboration Backend]
    end

    WCP_API --> OPENAI
    WCP_API --> STRIPE
    WCP_API --> SUPABASE
    WCP_API --> GITHUB
    WCP_API --> VERCEL
    WCP_API --> CDN
    WCP_API --> LIVEBLOCKS_CLOUD

    style WCP_API fill:#e3f2fd
    style STRIPE fill:#fff3e0
    style SUPABASE fill:#e8f5e8
    style GITHUB fill:#f3e5f5
```

## Component Dependencies and Relationships

### WebHarvest Component Flow
1. **API Layer**: FastAPI routes handle HTTP requests
2. **Service Layer**: Business logic and orchestration
3. **Worker Layer**: Async task processing with Celery
4. **Storage Layer**: PostgreSQL, Redis, and Qdrant
5. **Integration Layer**: MCP server and external APIs

### WebClone Pro Component Flow
1. **Frontend Layer**: Next.js pages and React components
2. **API Layer**: Next.js API routes and middleware
3. **Service Layer**: AI services and business logic
4. **Backend Layer**: Supabase and real-time collaboration
5. **External Layer**: Third-party integrations and deployments

Both systems follow a layered architecture pattern with clear separation of concerns and well-defined interfaces between components.