# System Overview Diagrams

This document provides high-level architectural diagrams for the WebHarvest and WebClone Pro ecosystem.

## 1. WebHarvest System Architecture

WebHarvest is a self-hosted web scraping platform built with FastAPI and Celery workers, designed for high-performance data extraction and AI integration.

```mermaid
graph TB
    subgraph "External Services"
        OAI[OpenAI API]
        OWU[Open WebUI]
        WH[Webhooks]
    end

    subgraph "Client Layer"
        CLI[WebHarvest CLI]
        API_CLIENTS[API Clients]
        MCP_CLIENTS[MCP Clients]
    end

    subgraph "Load Balancer"
        NGINX[Nginx Proxy]
    end

    subgraph "WebHarvest Core"
        API[FastAPI Server<br/>:8080]
        WORKER1[Celery Worker 1]
        WORKER2[Celery Worker 2]
        WORKERN[Celery Worker N]
    end

    subgraph "Storage Layer"
        POSTGRES[(PostgreSQL<br/>Structured Data)]
        REDIS[(Redis<br/>Cache & Queue)]
        QDRANT[(Qdrant<br/>Vector Store)]
    end

    subgraph "Browser Automation"
        PW[Playwright<br/>Browser Engine]
        CHROME[Chromium Instances]
    end

    subgraph "MCP Integration"
        MCP_SERVER[MCP Server<br/>WebSocket/JSON-RPC]
        MCP_TOOLS[MCP Tools<br/>scrape, crawl, batch]
    end

    CLI --> NGINX
    API_CLIENTS --> NGINX
    MCP_CLIENTS --> MCP_SERVER
    
    NGINX --> API
    API --> WORKER1
    API --> WORKER2
    API --> WORKERN
    
    API --> POSTGRES
    API --> REDIS
    API --> QDRANT
    
    WORKER1 --> REDIS
    WORKER2 --> REDIS
    WORKERN --> REDIS
    
    WORKER1 --> PW
    WORKER2 --> PW
    WORKERN --> PW
    
    PW --> CHROME
    
    API --> OAI
    API --> OWU
    API --> WH
    
    MCP_SERVER --> API
    
    style API fill:#e1f5fe
    style WORKER1 fill:#f3e5f5
    style WORKER2 fill:#f3e5f5
    style WORKERN fill:#f3e5f5
    style POSTGRES fill:#e8f5e8
    style REDIS fill:#fff3e0
    style QDRANT fill:#fce4ec
```

## 2. WebClone Pro System Architecture

WebClone Pro is an AI-native website cloning platform built with Next.js 15 and Supabase, featuring real-time collaboration and advanced AI capabilities.

```mermaid
graph TB
    subgraph "External Services"
        OPENAI[OpenAI GPT-4]
        STRIPE[Stripe Payments]
        GITHUB[GitHub Integration]
        CDN[CDN/Asset Storage]
    end

    subgraph "Frontend Layer"
        WEB[Next.js 15 Frontend<br/>React 19 + TypeScript]
        CHROME_EXT[Chrome Extension]
        PWA[Progressive Web App]
    end

    subgraph "API Layer"
        NEXTAPI[Next.js API Routes<br/>:3000/api/*]
        WEBSOCKET[WebSocket Server<br/>Real-time Sync]
    end

    subgraph "AI Services"
        AI_CLONE[AI Website Cloner]
        AI_OPTIMIZER[AI Cost Optimizer]
        AI_CHAT[AI Chat Assistant]
        AI_PDF[AI PDF Processor]
        DESIGN_DNA[Design DNA Extractor]
    end

    subgraph "Real-time Collaboration"
        LIVEBLOCKS[Liveblocks Integration]
        YJS[Y.js CRDT]
        MONACO[Monaco Editor<br/>Code Collaboration]
    end

    subgraph "Backend Services"
        SUPABASE[Supabase<br/>Auth + Database + Storage]
        POSTGRES[(PostgreSQL<br/>with pgvector)]
        REDIS[(Redis<br/>Cache + Sessions)]
    end

    subgraph "Deployment Platform"
        VERCEL[Vercel Hosting]
        DOCKER[Docker Containers]
        K8S[Kubernetes Clusters]
    end

    WEB --> NEXTAPI
    CHROME_EXT --> NEXTAPI
    PWA --> NEXTAPI
    
    NEXTAPI --> SUPABASE
    NEXTAPI --> REDIS
    NEXTAPI --> OPENAI
    NEXTAPI --> STRIPE
    
    WEBSOCKET --> LIVEBLOCKS
    WEBSOCKET --> YJS
    
    AI_CLONE --> OPENAI
    AI_OPTIMIZER --> OPENAI
    AI_CHAT --> OPENAI
    AI_PDF --> OPENAI
    
    SUPABASE --> POSTGRES
    
    NEXTAPI --> AI_CLONE
    NEXTAPI --> AI_OPTIMIZER
    NEXTAPI --> AI_CHAT
    NEXTAPI --> AI_PDF
    NEXTAPI --> DESIGN_DNA
    
    MONACO --> YJS
    
    NEXTAPI --> CDN
    NEXTAPI --> GITHUB
    
    WEB --> VERCEL
    NEXTAPI --> DOCKER
    DOCKER --> K8S
    
    style WEB fill:#e3f2fd
    style NEXTAPI fill:#e8f5e8
    style SUPABASE fill:#fff3e0
    style AI_CLONE fill:#f3e5f5
    style AI_OPTIMIZER fill:#f3e5f5
    style AI_CHAT fill:#f3e5f5
    style LIVEBLOCKS fill:#fce4ec
```

## 3. Combined Ecosystem Architecture

This diagram shows how WebHarvest and WebClone Pro work together as a comprehensive web intelligence platform.

```mermaid
graph TB
    subgraph "WebClone Pro Frontend"
        WCP_UI[WebClone Pro Interface]
        DASHBOARD[Analytics Dashboard]
        EDITOR[Collaborative Editor]
    end

    subgraph "WebClone Pro Backend"
        WCP_API[Next.js API Routes]
        WCP_AI[AI Services]
        WCP_COLLAB[Real-time Collaboration]
    end

    subgraph "WebHarvest Engine"
        WH_API[WebHarvest API]
        WH_WORKERS[Scraping Workers]
        WH_MCP[MCP Server]
    end

    subgraph "Shared Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
        VECTOR_DB[(Vector Database)]
        FILE_STORAGE[(File Storage)]
    end

    subgraph "External Integrations"
        AI_MODELS[AI Models<br/>OpenAI, Anthropic]
        PAYMENTS[Stripe]
        VERSION_CONTROL[Git Integration]
        DEPLOY_PLATFORMS[Deployment Platforms<br/>Vercel, Netlify, AWS]
    end

    subgraph "User Interfaces"
        WEB_UI[Web Interface]
        CLI_UI[CLI Interface]
        MCP_UI[MCP Integration]
        MOBILE[Mobile PWA]
    end

    WEB_UI --> WCP_UI
    CLI_UI --> WH_API
    MCP_UI --> WH_MCP
    MOBILE --> WCP_UI

    WCP_UI --> WCP_API
    WCP_API --> WCP_AI
    WCP_API --> WCP_COLLAB
    
    WCP_API <--> WH_API
    WH_API --> WH_WORKERS
    WH_API --> WH_MCP
    
    WCP_API --> POSTGRES
    WCP_API --> REDIS
    WCP_API --> VECTOR_DB
    WCP_API --> FILE_STORAGE
    
    WH_API --> POSTGRES
    WH_API --> REDIS
    WH_API --> VECTOR_DB
    
    WCP_AI --> AI_MODELS
    WCP_API --> PAYMENTS
    WCP_API --> VERSION_CONTROL
    WCP_API --> DEPLOY_PLATFORMS
    
    style WCP_UI fill:#e3f2fd
    style WCP_API fill:#e8f5e8
    style WH_API fill:#fff3e0
    style WH_WORKERS fill:#f3e5f5
    style POSTGRES fill:#e8f5e8
    style REDIS fill:#fff3e0
    style VECTOR_DB fill:#fce4ec
```

## 4. Technology Stack Overview

```mermaid
graph LR
    subgraph "WebHarvest Stack"
        WH_LANG[Python 3.11+]
        WH_FRAME[FastAPI]
        WH_WORKER[Celery]
        WH_BROWSER[Playwright]
    end

    subgraph "WebClone Pro Stack"
        WCP_LANG[TypeScript]
        WCP_FRAME[Next.js 15]
        WCP_UI[React 19]
        WCP_BACKEND[Supabase]
    end

    subgraph "Shared Infrastructure"
        DB[PostgreSQL 15]
        CACHE[Redis 7]
        VECTOR[Qdrant/pgvector]
        CONTAINER[Docker]
    end

    subgraph "AI & ML"
        OPENAI_API[OpenAI API]
        ANTHROPIC[Anthropic Claude]
        VECTOR_SEARCH[Vector Search]
        EMBEDDINGS[Text Embeddings]
    end

    WH_LANG --> WH_FRAME
    WH_FRAME --> WH_WORKER
    WH_WORKER --> WH_BROWSER
    
    WCP_LANG --> WCP_FRAME
    WCP_FRAME --> WCP_UI
    WCP_UI --> WCP_BACKEND
    
    WH_FRAME --> DB
    WCP_BACKEND --> DB
    
    WH_WORKER --> CACHE
    WCP_FRAME --> CACHE
    
    WH_FRAME --> VECTOR
    WCP_FRAME --> VECTOR
    
    WH_FRAME --> OPENAI_API
    WCP_FRAME --> OPENAI_API
    
    style WH_FRAME fill:#f3e5f5
    style WCP_FRAME fill:#e3f2fd
    style DB fill:#e8f5e8
    style OPENAI_API fill:#fff3e0
```

## Key Architectural Principles

### WebHarvest
- **Microservices Architecture**: Separate API and worker services for scalability
- **Event-Driven Processing**: Celery workers handle async scraping tasks
- **MCP Integration**: Model Context Protocol for AI tool integration
- **Vector Storage**: Qdrant for semantic search and AI-powered content analysis

### WebClone Pro
- **JAMstack Architecture**: Static generation with dynamic API routes
- **AI-First Design**: Integrated AI services for intelligent cloning and optimization
- **Real-time Collaboration**: Live editing with conflict resolution
- **Multi-tenant SaaS**: Secure user isolation with row-level security

### Shared Infrastructure
- **Container-First**: Docker containers for consistent deployments
- **Database-Driven**: PostgreSQL as the single source of truth
- **Cache-Optimized**: Redis for performance and session management
- **Vector-Enhanced**: Semantic search and AI-powered features