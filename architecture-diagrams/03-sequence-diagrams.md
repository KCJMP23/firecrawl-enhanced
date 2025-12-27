# Sequence Diagrams

This document provides detailed sequence diagrams for the key workflows in WebHarvest and WebClone Pro systems.

## 1. Website Scraping Workflow (WebHarvest)

### 1.1 Single URL Scraping

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI Server
    participant Auth as Auth Service
    participant Cache as Redis Cache
    participant Worker as Celery Worker
    participant Browser as Playwright
    participant DB as PostgreSQL

    C->>API: POST /v2/scrape {url, formats}
    API->>Auth: verify_api_key(header)
    Auth-->>API: api_key_valid

    API->>Cache: check_cache(url_hash)
    Cache-->>API: cache_miss

    API->>Worker: scrape_task.delay(request)
    Worker->>Browser: launch_browser(options)
    Browser-->>Worker: browser_instance

    Worker->>Browser: navigate_to(url)
    Browser-->>Worker: page_loaded

    Worker->>Browser: extract_content()
    Browser-->>Worker: raw_html

    Worker->>Worker: process_html()
    Worker->>Worker: convert_to_markdown()
    Worker->>Worker: extract_metadata()

    Worker->>Cache: store_result(cache_key, result)
    Worker->>DB: store_scrape_result()

    Worker-->>API: task_result
    API-->>C: {success: true, data: {...}}

    Note over C,DB: Typical scraping flow with caching
```

### 1.2 Website Crawling

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI Server
    participant Worker as Celery Worker
    participant Queue as Redis Queue
    participant Browser as Playwright
    participant DB as PostgreSQL

    C->>API: POST /v2/crawl {url, options}
    API->>DB: create_crawl_job(request)
    DB-->>API: job_id

    API->>Queue: enqueue_crawl_task(job_id)
    API-->>C: {job_id, status: "queued"}

    Worker->>Queue: consume_task()
    Worker->>DB: update_job_status("scraping")

    Worker->>Browser: launch_browser()
    Worker->>Browser: navigate_to(seed_url)
    Browser-->>Worker: page_content

    Worker->>Worker: extract_links()
    Worker->>DB: store_page_content()
    
    loop For each discovered URL
        Worker->>Worker: check_domain_rules()
        Worker->>Worker: check_rate_limits()
        Worker->>Browser: scrape_page(url)
        Browser-->>Worker: page_data
        Worker->>DB: store_page_data()
    end

    Worker->>DB: update_job_status("completed")
    Worker->>Worker: send_webhook_notification()

    Note over C,DB: Distributed crawling with rate limiting
```

## 2. Website Cloning Process (WebClone Pro)

### 2.1 AI-Powered Website Cloning

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Next.js Frontend
    participant API as API Routes
    participant Auth as Supabase Auth
    participant AI as AI Services
    participant WH as WebHarvest API
    participant DB as Supabase DB
    participant Storage as File Storage

    U->>UI: Enter URL & Clone Options
    UI->>Auth: verify_session()
    Auth-->>UI: session_valid

    UI->>API: POST /api/clone {url, options}
    API->>DB: create_project(user_id, url)
    DB-->>API: project_id

    API->>WH: POST /v2/scrape {url}
    WH-->>API: {html, markdown, assets}

    API->>AI: analyze_design_dna(html)
    AI-->>API: design_patterns

    API->>AI: extract_animations(html)
    AI-->>API: animation_data

    API->>AI: generate_modern_code(design_patterns)
    AI-->>API: optimized_code

    API->>Storage: store_assets(images, css, js)
    Storage-->>API: asset_urls

    API->>DB: update_project(clone_data, status)
    API-->>UI: WebSocket: {progress: 60%}

    API->>AI: optimize_performance(code)
    AI-->>API: optimized_code

    API->>DB: finalize_clone(project_id)
    DB-->>API: clone_complete

    API-->>UI: WebSocket: {progress: 100%, clone_url}
    UI-->>U: Show completed clone

    Note over U,Storage: AI-enhanced cloning with real-time progress
```

### 2.2 PDF Processing Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React Component
    participant API as PDF API Route
    participant Processor as PDF Processor
    participant AI as OpenAI API
    participant Vector as Vector DB
    participant DB as Supabase

    U->>UI: Upload PDF file
    UI->>API: POST /api/pdf/upload (multipart)
    API->>API: validate_file(pdf)

    API->>Processor: extract_text(pdf_buffer)
    Processor-->>API: raw_text

    API->>Processor: extract_images(pdf)
    Processor-->>API: image_data

    API->>DB: create_pdf_document(metadata)
    DB-->>API: document_id

    API->>AI: chunk_text(raw_text)
    AI-->>API: text_chunks

    loop For each chunk
        API->>AI: generate_embeddings(chunk)
        AI-->>API: embedding_vector
        API->>Vector: store_embedding(chunk, vector)
    end

    API->>AI: analyze_document_structure(text)
    AI-->>API: structure_analysis

    API->>AI: extract_key_concepts(text)
    AI-->>API: concepts

    API->>DB: update_document(analysis, status)
    DB-->>API: update_complete

    API-->>UI: {document_id, analysis}
    UI-->>U: Show analysis results

    Note over U,DB: Comprehensive PDF processing with AI analysis
```

## 3. Real-time Collaboration Flow

### 3.1 Collaborative Editor Session

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant Editor1 as Editor Client 1
    participant Editor2 as Editor Client 2
    participant LB as Liveblocks
    participant YJS as Y.js Provider
    participant Monaco as Monaco Editor

    U1->>Editor1: Open project editor
    Editor1->>LB: connect_to_room(project_id)
    LB-->>Editor1: room_connected

    Editor1->>YJS: initialize_document()
    Editor1->>Monaco: bind_yjs_document()

    U2->>Editor2: Join project editor
    Editor2->>LB: connect_to_room(project_id)
    LB-->>Editor2: room_connected
    LB-->>Editor1: user_joined(user2)

    Editor2->>YJS: sync_document_state()
    YJS-->>Editor2: current_document_state

    U1->>Editor1: Type code changes
    Editor1->>Monaco: handle_text_change()
    Monaco->>YJS: apply_local_operation()
    YJS->>LB: broadcast_operation()
    LB->>Editor2: receive_operation()
    Editor2->>YJS: apply_remote_operation()
    YJS->>Monaco: update_editor_content()
    Monaco-->>U2: Show live changes

    U2->>Editor2: Add comment
    Editor2->>LB: add_thread(position, text)
    LB->>Editor1: thread_created()
    Editor1-->>U1: Show new comment

    U1->>Editor1: Leave session
    Editor1->>LB: disconnect()
    LB-->>Editor2: user_left(user1)

    Note over U1,Monaco: Real-time collaborative editing with conflict resolution
```

## 4. MCP Integration Workflow

### 4.1 MCP Tool Integration

```mermaid
sequenceDiagram
    participant AI as AI Agent (Claude)
    participant MCP as MCP Server
    participant WH as WebHarvest API
    participant Worker as Celery Worker
    participant Browser as Playwright

    AI->>MCP: WebSocket connection
    MCP-->>AI: connection_established

    AI->>MCP: list_tools()
    MCP-->>AI: [scrape, crawl, batch_scrape]

    AI->>MCP: call_tool("scrape", {url: "..."})
    MCP->>WH: POST /v2/scrape
    WH->>Worker: enqueue_scrape_task()
    Worker->>Browser: scrape_url()
    Browser-->>Worker: page_data
    Worker-->>WH: scrape_result
    WH-->>MCP: {success: true, data: {...}}
    MCP-->>AI: formatted_result

    AI->>MCP: call_tool("crawl", {url: "...", max_pages: 10})
    MCP->>WH: POST /v2/crawl
    WH->>Worker: enqueue_crawl_task()
    
    loop Crawling Progress
        Worker->>Browser: scrape_page()
        Worker->>MCP: WebSocket: progress_update
        MCP-->>AI: crawl_progress
    end
    
    Worker-->>WH: crawl_complete
    WH-->>MCP: crawl_results
    MCP-->>AI: formatted_crawl_data

    Note over AI,Browser: MCP enables AI agents to use WebHarvest tools
```

## 5. Credit Tracking and Billing System

### 5.1 Credit Purchase Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as Credits API
    participant Stripe as Stripe API
    participant DB as Supabase
    participant Webhook as Stripe Webhook

    U->>UI: Click "Buy Credits"
    UI->>API: GET /api/credits/balance
    API->>DB: get_user_credits(user_id)
    DB-->>API: current_credits
    API-->>UI: credit_balance

    UI->>API: POST /api/credits/purchase {amount}
    API->>Stripe: create_checkout_session()
    Stripe-->>API: checkout_url
    API-->>UI: {checkout_url}

    UI-->>U: Redirect to Stripe
    U->>Stripe: Complete payment
    Stripe->>Webhook: payment_succeeded event
    
    Webhook->>API: POST /api/stripe/webhook
    API->>API: verify_webhook_signature()
    API->>DB: add_credits(user_id, amount)
    API->>DB: create_transaction_record()

    API-->>UI: WebSocket: credits_updated
    UI-->>U: Show updated balance

    Note over U,Webhook: Secure credit purchase with webhook verification
```

### 5.2 Credit Deduction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant API as Clone API
    participant Credits as Credit Service
    participant AI as AI Services
    participant DB as Supabase

    U->>API: POST /api/clone {url}
    API->>Credits: estimate_cost(operation_type)
    Credits-->>API: estimated_credits

    API->>DB: get_user_credits(user_id)
    DB-->>API: available_credits

    alt Sufficient Credits
        API->>Credits: reserve_credits(user_id, amount)
        Credits->>DB: deduct_credits(user_id, amount)
        
        API->>AI: perform_cloning()
        AI-->>API: clone_result
        
        API->>Credits: confirm_usage(actual_cost)
        Credits->>DB: adjust_credits(difference)
        
        API-->>U: {success: true, clone_data}
    else Insufficient Credits
        API-->>U: {error: "insufficient_credits", required: X}
    end

    Note over U,DB: Credit system prevents overuse and tracks consumption
```

## 6. AI Cost Optimization Flow

### 6.1 Dynamic Model Selection

```mermaid
sequenceDiagram
    participant User as User Request
    participant Optimizer as AI Cost Optimizer
    participant Models as Model Registry
    participant OpenAI as OpenAI API
    participant Cache as Response Cache
    participant Analytics as Cost Analytics

    User->>Optimizer: ai_request(task_type, content)
    Optimizer->>Models: get_available_models(task_type)
    Models-->>Optimizer: [gpt-4, gpt-3.5-turbo, ...]

    Optimizer->>Cache: check_semantic_cache(content_hash)
    Cache-->>Optimizer: cache_miss

    Optimizer->>Optimizer: calculate_complexity(content)
    Optimizer->>Models: select_optimal_model(complexity, cost)
    Models-->>Optimizer: selected_model

    Optimizer->>OpenAI: api_call(selected_model, content)
    OpenAI-->>Optimizer: ai_response

    Optimizer->>Cache: store_response(content_hash, response)
    Optimizer->>Analytics: log_usage(model, tokens, cost)

    Optimizer-->>User: optimized_response

    Note over User,Analytics: Intelligent model selection based on cost and complexity
```

## 7. Deployment Pipeline Flow

### 7.1 Automated Deployment

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard
    participant API as Deploy API
    participant Git as Git Service
    participant Platform as Deploy Platform
    participant CDN as CDN Service

    U->>UI: Click "Deploy to Production"
    UI->>API: POST /api/deploy {clone_id, platform}
    API->>API: validate_deployment_config()

    API->>Git: create_repository(clone_code)
    Git-->>API: repo_url

    API->>Platform: create_deployment(repo_url)
    Platform-->>API: deployment_id

    loop Deployment Progress
        Platform->>API: WebSocket: build_progress
        API-->>UI: deployment_status_update
    end

    Platform->>CDN: deploy_assets()
    CDN-->>Platform: asset_urls

    Platform-->>API: deployment_complete(live_url)
    API->>UI: WebSocket: deployment_success
    UI-->>U: Show live website URL

    Note over U,CDN: Automated deployment with real-time progress tracking
```

## Key Workflow Characteristics

### WebHarvest Workflows
- **Async Processing**: All scraping operations are handled asynchronously
- **Rate Limiting**: Built-in rate limiting prevents overwhelming target sites
- **Caching**: Intelligent caching reduces duplicate requests
- **Error Handling**: Comprehensive error tracking and retry mechanisms

### WebClone Pro Workflows
- **AI-Enhanced**: All major workflows leverage AI for optimization
- **Real-time**: Live collaboration and progress updates
- **Credit-Based**: Cost tracking and usage limitations
- **Multi-Platform**: Support for various deployment targets

### Shared Patterns
- **Event-Driven**: Both systems use event-driven architectures
- **Microservices**: Modular design with clear service boundaries
- **Observability**: Comprehensive logging and metrics collection
- **Security**: Authentication and authorization at every level