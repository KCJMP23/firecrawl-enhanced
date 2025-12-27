# Data Flow Diagrams

This document provides detailed data flow diagrams for key processes in WebHarvest and WebClone Pro systems.

## 1. WebHarvest Data Flow

### 1.1 Scraping Pipeline Data Flow

```mermaid
flowchart TD
    subgraph "Input Layer"
        API_REQUEST[API Request<br/>URL + Options]
        USER_CONFIG[User Configuration<br/>Rate limits, Filters]
    end

    subgraph "Processing Pipeline"
        URL_VALIDATION[URL Validation<br/>Security checks]
        CACHE_CHECK[Cache Lookup<br/>Redis cache key]
        RATE_LIMITER[Rate Limiter<br/>Domain-based throttling]
        
        subgraph "Browser Engine"
            PLAYWRIGHT[Playwright Launch<br/>Browser instance]
            PAGE_LOAD[Page Loading<br/>Network requests]
            JS_EXECUTION[JavaScript Execution<br/>Dynamic content]
            CONTENT_EXTRACTION[Content Extraction<br/>HTML + Assets]
        end
        
        subgraph "Content Processing"
            HTML_CLEANUP[HTML Cleanup<br/>Remove scripts, ads]
            MARKDOWN_CONVERT[Markdown Conversion<br/>Structured content]
            METADATA_EXTRACT[Metadata Extraction<br/>SEO, Schema.org]
            LINK_DISCOVERY[Link Discovery<br/>URL extraction]
        end
        
        subgraph "AI Enhancement"
            CONTENT_ANALYSIS[AI Content Analysis<br/>OpenAI processing]
            SEMANTIC_EMBEDDING[Vector Embedding<br/>Text vectorization]
            QUALITY_SCORE[Quality Assessment<br/>Content scoring]
        end
    end

    subgraph "Storage Layer"
        POSTGRES_STORE[(PostgreSQL<br/>Structured data)]
        REDIS_CACHE[(Redis<br/>Cached responses)]
        QDRANT_VECTORS[(Qdrant<br/>Vector embeddings)]
        FILE_STORAGE[(File System<br/>Assets, Screenshots)]
    end

    subgraph "Output Layer"
        API_RESPONSE[API Response<br/>JSON + Content]
        WEBHOOK_NOTIFY[Webhook Notification<br/>Job completion]
        MCP_RESPONSE[MCP Tool Response<br/>Formatted data]
    end

    API_REQUEST --> URL_VALIDATION
    USER_CONFIG --> RATE_LIMITER
    
    URL_VALIDATION --> CACHE_CHECK
    CACHE_CHECK -->|Cache Miss| RATE_LIMITER
    CACHE_CHECK -->|Cache Hit| API_RESPONSE
    
    RATE_LIMITER --> PLAYWRIGHT
    PLAYWRIGHT --> PAGE_LOAD
    PAGE_LOAD --> JS_EXECUTION
    JS_EXECUTION --> CONTENT_EXTRACTION
    
    CONTENT_EXTRACTION --> HTML_CLEANUP
    HTML_CLEANUP --> MARKDOWN_CONVERT
    MARKDOWN_CONVERT --> METADATA_EXTRACT
    CONTENT_EXTRACTION --> LINK_DISCOVERY
    
    METADATA_EXTRACT --> CONTENT_ANALYSIS
    CONTENT_ANALYSIS --> SEMANTIC_EMBEDDING
    SEMANTIC_EMBEDDING --> QUALITY_SCORE
    
    MARKDOWN_CONVERT --> POSTGRES_STORE
    METADATA_EXTRACT --> POSTGRES_STORE
    LINK_DISCOVERY --> POSTGRES_STORE
    
    MARKDOWN_CONVERT --> REDIS_CACHE
    SEMANTIC_EMBEDDING --> QDRANT_VECTORS
    CONTENT_EXTRACTION --> FILE_STORAGE
    
    POSTGRES_STORE --> API_RESPONSE
    REDIS_CACHE --> API_RESPONSE
    POSTGRES_STORE --> WEBHOOK_NOTIFY
    POSTGRES_STORE --> MCP_RESPONSE

    style API_REQUEST fill:#e1f5fe
    style PLAYWRIGHT fill:#f3e5f5
    style CONTENT_ANALYSIS fill:#fff3e0
    style POSTGRES_STORE fill:#e8f5e8
```

### 1.2 Crawling Data Flow

```mermaid
flowchart TD
    subgraph "Crawl Initiation"
        CRAWL_REQUEST[Crawl Request<br/>Seed URL + Config]
        JOB_CREATION[Job Creation<br/>Database record]
        QUEUE_DISPATCH[Queue Dispatch<br/>Celery task]
    end

    subgraph "URL Discovery & Management"
        URL_QUEUE[(URL Queue<br/>Pending URLs)]
        URL_FILTER[URL Filtering<br/>Domain rules, Patterns]
        DUPLICATE_CHECK[Duplicate Detection<br/>Normalized URLs]
        ROBOTS_CHECK[Robots.txt Check<br/>Crawl permissions]
    end

    subgraph "Distributed Processing"
        subgraph "Worker 1"
            W1_SCRAPE[Scrape Page]
            W1_EXTRACT[Extract Links]
            W1_STORE[Store Content]
        end
        
        subgraph "Worker 2"
            W2_SCRAPE[Scrape Page]
            W2_EXTRACT[Extract Links]
            W2_STORE[Store Content]
        end
        
        subgraph "Worker N"
            WN_SCRAPE[Scrape Page]
            WN_EXTRACT[Extract Links]
            WN_STORE[Store Content]
        end
    end

    subgraph "Data Aggregation"
        PROGRESS_TRACKER[Progress Tracking<br/>Completion status]
        RESULT_MERGER[Result Merging<br/>Content assembly]
        SITEMAP_BUILDER[Sitemap Building<br/>Site structure]
    end

    subgraph "Output Generation"
        CRAWL_REPORT[Crawl Report<br/>Summary statistics]
        CONTENT_EXPORT[Content Export<br/>Structured data]
        WEBHOOK_DELIVERY[Webhook Delivery<br/>Completion notification]
    end

    CRAWL_REQUEST --> JOB_CREATION
    JOB_CREATION --> QUEUE_DISPATCH
    QUEUE_DISPATCH --> URL_QUEUE

    URL_QUEUE --> URL_FILTER
    URL_FILTER --> DUPLICATE_CHECK
    DUPLICATE_CHECK --> ROBOTS_CHECK

    ROBOTS_CHECK --> W1_SCRAPE
    ROBOTS_CHECK --> W2_SCRAPE
    ROBOTS_CHECK --> WN_SCRAPE

    W1_SCRAPE --> W1_EXTRACT
    W1_EXTRACT --> W1_STORE
    W1_EXTRACT --> URL_QUEUE

    W2_SCRAPE --> W2_EXTRACT
    W2_EXTRACT --> W2_STORE
    W2_EXTRACT --> URL_QUEUE

    WN_SCRAPE --> WN_EXTRACT
    WN_EXTRACT --> WN_STORE
    WN_EXTRACT --> URL_QUEUE

    W1_STORE --> PROGRESS_TRACKER
    W2_STORE --> PROGRESS_TRACKER
    WN_STORE --> PROGRESS_TRACKER

    PROGRESS_TRACKER --> RESULT_MERGER
    RESULT_MERGER --> SITEMAP_BUILDER
    SITEMAP_BUILDER --> CRAWL_REPORT

    CRAWL_REPORT --> CONTENT_EXPORT
    CONTENT_EXPORT --> WEBHOOK_DELIVERY

    style CRAWL_REQUEST fill:#e1f5fe
    style URL_QUEUE fill:#fff3e0
    style W1_SCRAPE fill:#f3e5f5
    style W2_SCRAPE fill:#f3e5f5
    style WN_SCRAPE fill:#f3e5f5
    style RESULT_MERGER fill:#e8f5e8
```

## 2. WebClone Pro Data Flow

### 2.1 AI-Powered Website Cloning Data Flow

```mermaid
flowchart TD
    subgraph "Input & Analysis"
        URL_INPUT[Target URL<br/>User input]
        USER_PREFS[User Preferences<br/>Style, Framework]
        INITIAL_SCRAPE[Initial Scraping<br/>WebHarvest API call]
    end

    subgraph "AI Processing Pipeline"
        subgraph "Design Analysis"
            VISUAL_ANALYSIS[Visual Analysis<br/>Layout detection]
            COLOR_EXTRACTION[Color Palette<br/>Theme extraction]
            TYPOGRAPHY_ANALYSIS[Typography<br/>Font analysis]
            COMPONENT_DETECTION[Component Detection<br/>UI patterns]
        end

        subgraph "Content Processing"
            CONTENT_STRUCTURE[Content Structure<br/>Semantic analysis]
            IMAGE_OPTIMIZATION[Image Optimization<br/>Format conversion]
            ASSET_COLLECTION[Asset Collection<br/>CSS, JS, Media]
        end

        subgraph "AI Enhancement"
            DESIGN_DNA_EXTRACT[Design DNA Extraction<br/>Style patterns]
            MODERN_ADAPTATION[Modern Adaptation<br/>Framework conversion]
            PERFORMANCE_OPT[Performance Optimization<br/>Code efficiency]
            ACCESSIBILITY_IMP[Accessibility Improvement<br/>A11y compliance]
        end
    end

    subgraph "Code Generation"
        FRAMEWORK_SELECTION[Framework Selection<br/>React, Vue, Angular]
        COMPONENT_GENERATION[Component Generation<br/>Modular code]
        STYLE_GENERATION[Style Generation<br/>Tailwind, CSS-in-JS]
        ROUTING_SETUP[Routing Setup<br/>Navigation structure]
    end

    subgraph "Quality Assurance"
        CODE_VALIDATION[Code Validation<br/>Syntax checking]
        RESPONSIVE_CHECK[Responsive Check<br/>Mobile compatibility]
        PERFORMANCE_AUDIT[Performance Audit<br/>Lighthouse scoring]
        SECURITY_SCAN[Security Scan<br/>Vulnerability check]
    end

    subgraph "Storage & Delivery"
        PROJECT_STORAGE[Project Storage<br/>Supabase database]
        ASSET_CDN[Asset CDN<br/>Optimized delivery]
        VERSION_CONTROL[Version Control<br/>Git integration]
        DEPLOYMENT_PREP[Deployment Preparation<br/>Build optimization]
    end

    URL_INPUT --> INITIAL_SCRAPE
    USER_PREFS --> FRAMEWORK_SELECTION
    INITIAL_SCRAPE --> VISUAL_ANALYSIS
    INITIAL_SCRAPE --> CONTENT_STRUCTURE
    INITIAL_SCRAPE --> ASSET_COLLECTION

    VISUAL_ANALYSIS --> COLOR_EXTRACTION
    VISUAL_ANALYSIS --> TYPOGRAPHY_ANALYSIS
    VISUAL_ANALYSIS --> COMPONENT_DETECTION

    COLOR_EXTRACTION --> DESIGN_DNA_EXTRACT
    TYPOGRAPHY_ANALYSIS --> DESIGN_DNA_EXTRACT
    COMPONENT_DETECTION --> DESIGN_DNA_EXTRACT
    CONTENT_STRUCTURE --> DESIGN_DNA_EXTRACT

    DESIGN_DNA_EXTRACT --> MODERN_ADAPTATION
    MODERN_ADAPTATION --> PERFORMANCE_OPT
    PERFORMANCE_OPT --> ACCESSIBILITY_IMP

    ACCESSIBILITY_IMP --> COMPONENT_GENERATION
    FRAMEWORK_SELECTION --> COMPONENT_GENERATION
    COMPONENT_GENERATION --> STYLE_GENERATION
    STYLE_GENERATION --> ROUTING_SETUP

    ROUTING_SETUP --> CODE_VALIDATION
    CODE_VALIDATION --> RESPONSIVE_CHECK
    RESPONSIVE_CHECK --> PERFORMANCE_AUDIT
    PERFORMANCE_AUDIT --> SECURITY_SCAN

    SECURITY_SCAN --> PROJECT_STORAGE
    ASSET_COLLECTION --> ASSET_CDN
    PROJECT_STORAGE --> VERSION_CONTROL
    VERSION_CONTROL --> DEPLOYMENT_PREP

    style URL_INPUT fill:#e1f5fe
    style DESIGN_DNA_EXTRACT fill:#f3e5f5
    style MODERN_ADAPTATION fill:#f3e5f5
    style COMPONENT_GENERATION fill:#fff3e0
    style PROJECT_STORAGE fill:#e8f5e8
```

### 2.2 Real-time Collaboration Data Flow

```mermaid
flowchart TD
    subgraph "User Interactions"
        USER_A[User A<br/>Code edits]
        USER_B[User B<br/>Comments]
        USER_C[User C<br/>Visual changes]
    end

    subgraph "Client-Side Processing"
        subgraph "Editor A"
            EDITOR_A[Monaco Editor A]
            YJS_A[Y.js Document A]
            AWARENESS_A[Awareness Provider A]
        end
        
        subgraph "Editor B"
            EDITOR_B[Monaco Editor B]
            YJS_B[Y.js Document B]
            AWARENESS_B[Awareness Provider B]
        end
        
        subgraph "Editor C"
            EDITOR_C[Monaco Editor C]
            YJS_C[Y.js Document C]
            AWARENESS_C[Awareness Provider C]
        end
    end

    subgraph "Collaboration Infrastructure"
        WEBSOCKET_SERVER[WebSocket Server<br/>Real-time sync]
        LIVEBLOCKS[Liveblocks Service<br/>Collaboration backend]
        CONFLICT_RESOLVER[Conflict Resolver<br/>CRDT operations]
        PRESENCE_MANAGER[Presence Manager<br/>User awareness]
    end

    subgraph "Data Synchronization"
        OPERATION_QUEUE[Operation Queue<br/>Change buffer]
        TRANSFORM_ENGINE[Transform Engine<br/>Operation transformation]
        BROADCAST_ENGINE[Broadcast Engine<br/>Change distribution]
        PERSISTENCE_LAYER[Persistence Layer<br/>State storage]
    end

    subgraph "Real-time Features"
        LIVE_CURSORS[Live Cursors<br/>User positions]
        LIVE_SELECTIONS[Live Selections<br/>Text highlights]
        LIVE_COMMENTS[Live Comments<br/>Annotations]
        LIVE_PRESENCE[Live Presence<br/>User status]
    end

    USER_A --> EDITOR_A
    USER_B --> EDITOR_B
    USER_C --> EDITOR_C

    EDITOR_A --> YJS_A
    EDITOR_B --> YJS_B
    EDITOR_C --> YJS_C

    YJS_A --> AWARENESS_A
    YJS_B --> AWARENESS_B
    YJS_C --> AWARENESS_C

    YJS_A --> WEBSOCKET_SERVER
    YJS_B --> WEBSOCKET_SERVER
    YJS_C --> WEBSOCKET_SERVER

    WEBSOCKET_SERVER --> LIVEBLOCKS
    LIVEBLOCKS --> CONFLICT_RESOLVER
    CONFLICT_RESOLVER --> PRESENCE_MANAGER

    WEBSOCKET_SERVER --> OPERATION_QUEUE
    OPERATION_QUEUE --> TRANSFORM_ENGINE
    TRANSFORM_ENGINE --> BROADCAST_ENGINE
    BROADCAST_ENGINE --> PERSISTENCE_LAYER

    PRESENCE_MANAGER --> LIVE_CURSORS
    PRESENCE_MANAGER --> LIVE_SELECTIONS
    BROADCAST_ENGINE --> LIVE_COMMENTS
    PRESENCE_MANAGER --> LIVE_PRESENCE

    LIVE_CURSORS --> EDITOR_A
    LIVE_CURSORS --> EDITOR_B
    LIVE_CURSORS --> EDITOR_C

    LIVE_COMMENTS --> EDITOR_A
    LIVE_COMMENTS --> EDITOR_B
    LIVE_COMMENTS --> EDITOR_C

    style USER_A fill:#e1f5fe
    style WEBSOCKET_SERVER fill:#f3e5f5
    style LIVEBLOCKS fill:#fce4ec
    style TRANSFORM_ENGINE fill:#fff3e0
```

## 3. AI Cost Optimization Data Flow

### 3.1 Intelligent Model Selection Flow

```mermaid
flowchart TD
    subgraph "Request Analysis"
        AI_REQUEST[AI Request<br/>Task + Content]
        CONTENT_ANALYZER[Content Analyzer<br/>Complexity assessment]
        CACHE_LOOKUP[Semantic Cache<br/>Similar requests]
    end

    subgraph "Model Selection Engine"
        COMPLEXITY_SCORER[Complexity Scorer<br/>Text analysis]
        COST_CALCULATOR[Cost Calculator<br/>Token estimation]
        MODEL_SELECTOR[Model Selector<br/>Optimal choice]
        FALLBACK_CHAIN[Fallback Chain<br/>Alternative models]
    end

    subgraph "Available Models"
        GPT4[GPT-4<br/>High capability, High cost]
        GPT35[GPT-3.5-turbo<br/>Medium capability, Low cost]
        GPT4_MINI[GPT-4-mini<br/>Fast, Efficient]
        CLAUDE[Claude-3<br/>Alternative provider]
    end

    subgraph "Request Processing"
        RATE_LIMITER[Rate Limiter<br/>API quotas]
        REQUEST_QUEUE[Request Queue<br/>Batching]
        RETRY_LOGIC[Retry Logic<br/>Error handling]
        RESPONSE_VALIDATOR[Response Validator<br/>Quality check]
    end

    subgraph "Cost Optimization"
        TOKEN_TRACKER[Token Tracker<br/>Usage monitoring]
        BUDGET_ENFORCER[Budget Enforcer<br/>Spending limits]
        USAGE_ANALYTICS[Usage Analytics<br/>Pattern analysis]
        COST_ALERTS[Cost Alerts<br/>Budget warnings]
    end

    subgraph "Response Processing"
        QUALITY_FILTER[Quality Filter<br/>Response validation]
        CACHE_STORE[Cache Store<br/>Future optimization]
        METRICS_COLLECTOR[Metrics Collector<br/>Performance data]
    end

    AI_REQUEST --> CONTENT_ANALYZER
    CONTENT_ANALYZER --> CACHE_LOOKUP
    CACHE_LOOKUP -->|Cache Miss| COMPLEXITY_SCORER
    CACHE_LOOKUP -->|Cache Hit| QUALITY_FILTER

    COMPLEXITY_SCORER --> COST_CALCULATOR
    COST_CALCULATOR --> MODEL_SELECTOR
    MODEL_SELECTOR --> FALLBACK_CHAIN

    MODEL_SELECTOR --> GPT4
    MODEL_SELECTOR --> GPT35
    MODEL_SELECTOR --> GPT4_MINI
    MODEL_SELECTOR --> CLAUDE

    GPT4 --> RATE_LIMITER
    GPT35 --> RATE_LIMITER
    GPT4_MINI --> RATE_LIMITER
    CLAUDE --> RATE_LIMITER

    RATE_LIMITER --> REQUEST_QUEUE
    REQUEST_QUEUE --> RETRY_LOGIC
    RETRY_LOGIC --> RESPONSE_VALIDATOR

    RESPONSE_VALIDATOR --> TOKEN_TRACKER
    TOKEN_TRACKER --> BUDGET_ENFORCER
    BUDGET_ENFORCER --> USAGE_ANALYTICS
    USAGE_ANALYTICS --> COST_ALERTS

    RESPONSE_VALIDATOR --> QUALITY_FILTER
    QUALITY_FILTER --> CACHE_STORE
    CACHE_STORE --> METRICS_COLLECTOR

    style AI_REQUEST fill:#e1f5fe
    style MODEL_SELECTOR fill:#f3e5f5
    style GPT4 fill:#fff3e0
    style COST_CALCULATOR fill:#fce4ec
    style QUALITY_FILTER fill:#e8f5e8
```

## 4. Credit Tracking and Billing Data Flow

### 4.1 Credit Management System

```mermaid
flowchart TD
    subgraph "User Actions"
        USER_OPERATION[User Operation<br/>Clone, Process, etc.]
        CREDIT_PURCHASE[Credit Purchase<br/>Stripe payment]
        USAGE_EVENT[Usage Event<br/>API call, AI operation]
    end

    subgraph "Cost Estimation"
        OPERATION_ESTIMATOR[Operation Estimator<br/>Cost prediction]
        COMPLEXITY_ANALYZER[Complexity Analyzer<br/>Resource assessment]
        CREDIT_CALCULATOR[Credit Calculator<br/>Points conversion]
    end

    subgraph "Credit Management"
        CREDIT_BALANCE[Credit Balance<br/>User account]
        RESERVATION_SYSTEM[Reservation System<br/>Pre-allocation]
        DEDUCTION_ENGINE[Deduction Engine<br/>Usage tracking]
        REFUND_PROCESSOR[Refund Processor<br/>Unused credits]
    end

    subgraph "Real-time Tracking"
        USAGE_MONITOR[Usage Monitor<br/>Live tracking]
        THRESHOLD_CHECKER[Threshold Checker<br/>Limit warnings]
        BALANCE_UPDATER[Balance Updater<br/>Real-time sync]
        ALERT_SYSTEM[Alert System<br/>Low balance warnings]
    end

    subgraph "Payment Processing"
        STRIPE_WEBHOOK[Stripe Webhook<br/>Payment events]
        PAYMENT_VALIDATOR[Payment Validator<br/>Transaction verification]
        CREDIT_ALLOCATOR[Credit Allocator<br/>Balance increase]
        RECEIPT_GENERATOR[Receipt Generator<br/>Invoice creation]
    end

    subgraph "Analytics & Reporting"
        USAGE_ANALYTICS[Usage Analytics<br/>Pattern analysis]
        BILLING_REPORTS[Billing Reports<br/>Monthly summaries]
        COST_OPTIMIZATION[Cost Optimization<br/>Efficiency insights]
        FRAUD_DETECTION[Fraud Detection<br/>Abuse prevention]
    end

    USER_OPERATION --> OPERATION_ESTIMATOR
    OPERATION_ESTIMATOR --> COMPLEXITY_ANALYZER
    COMPLEXITY_ANALYZER --> CREDIT_CALCULATOR

    CREDIT_CALCULATOR --> CREDIT_BALANCE
    CREDIT_BALANCE --> RESERVATION_SYSTEM
    RESERVATION_SYSTEM --> DEDUCTION_ENGINE

    USAGE_EVENT --> USAGE_MONITOR
    USAGE_MONITOR --> THRESHOLD_CHECKER
    THRESHOLD_CHECKER --> BALANCE_UPDATER
    BALANCE_UPDATER --> ALERT_SYSTEM

    DEDUCTION_ENGINE --> REFUND_PROCESSOR
    REFUND_PROCESSOR --> CREDIT_BALANCE

    CREDIT_PURCHASE --> STRIPE_WEBHOOK
    STRIPE_WEBHOOK --> PAYMENT_VALIDATOR
    PAYMENT_VALIDATOR --> CREDIT_ALLOCATOR
    CREDIT_ALLOCATOR --> CREDIT_BALANCE
    CREDIT_ALLOCATOR --> RECEIPT_GENERATOR

    USAGE_MONITOR --> USAGE_ANALYTICS
    USAGE_ANALYTICS --> BILLING_REPORTS
    BILLING_REPORTS --> COST_OPTIMIZATION
    USAGE_ANALYTICS --> FRAUD_DETECTION

    style USER_OPERATION fill:#e1f5fe
    style CREDIT_BALANCE fill:#e8f5e8
    style USAGE_MONITOR fill:#f3e5f5
    style STRIPE_WEBHOOK fill:#fff3e0
    style USAGE_ANALYTICS fill:#fce4ec
```

## 5. PDF Processing Data Flow

### 5.1 Intelligent PDF Analysis Pipeline

```mermaid
flowchart TD
    subgraph "PDF Input"
        PDF_UPLOAD[PDF Upload<br/>File validation]
        SECURITY_CHECK[Security Check<br/>Malware scan]
        FORMAT_VALIDATION[Format Validation<br/>PDF structure]
    end

    subgraph "Content Extraction"
        TEXT_EXTRACTOR[Text Extractor<br/>OCR + Direct text]
        IMAGE_EXTRACTOR[Image Extractor<br/>Embedded images]
        METADATA_PARSER[Metadata Parser<br/>Document properties]
        STRUCTURE_ANALYZER[Structure Analyzer<br/>Layout detection]
    end

    subgraph "AI Processing"
        CONTENT_CHUNKER[Content Chunker<br/>Intelligent segmentation]
        EMBEDDING_GENERATOR[Embedding Generator<br/>Vector creation]
        TOPIC_CLASSIFIER[Topic Classifier<br/>Content categorization]
        SUMMARY_GENERATOR[Summary Generator<br/>Key points extraction]
    end

    subgraph "Knowledge Processing"
        ENTITY_EXTRACTOR[Entity Extractor<br/>Named entities]
        RELATIONSHIP_MAPPER[Relationship Mapper<br/>Entity connections]
        CONCEPT_IDENTIFIER[Concept Identifier<br/>Key concepts]
        QUESTION_GENERATOR[Question Generator<br/>Q&A pairs]
    end

    subgraph "Vector Storage"
        VECTOR_INDEXER[Vector Indexer<br/>Similarity search]
        CHUNK_STORAGE[Chunk Storage<br/>Text segments]
        METADATA_STORE[Metadata Store<br/>Document info]
        SIMILARITY_ENGINE[Similarity Engine<br/>Semantic search]
    end

    subgraph "Query Interface"
        SEARCH_INTERFACE[Search Interface<br/>User queries]
        CONTEXT_RETRIEVER[Context Retriever<br/>Relevant chunks]
        ANSWER_GENERATOR[Answer Generator<br/>AI responses]
        CITATION_TRACKER[Citation Tracker<br/>Source references]
    end

    PDF_UPLOAD --> SECURITY_CHECK
    SECURITY_CHECK --> FORMAT_VALIDATION
    FORMAT_VALIDATION --> TEXT_EXTRACTOR
    FORMAT_VALIDATION --> IMAGE_EXTRACTOR
    FORMAT_VALIDATION --> METADATA_PARSER
    FORMAT_VALIDATION --> STRUCTURE_ANALYZER

    TEXT_EXTRACTOR --> CONTENT_CHUNKER
    STRUCTURE_ANALYZER --> CONTENT_CHUNKER
    CONTENT_CHUNKER --> EMBEDDING_GENERATOR
    CONTENT_CHUNKER --> TOPIC_CLASSIFIER
    CONTENT_CHUNKER --> SUMMARY_GENERATOR

    EMBEDDING_GENERATOR --> ENTITY_EXTRACTOR
    TOPIC_CLASSIFIER --> ENTITY_EXTRACTOR
    ENTITY_EXTRACTOR --> RELATIONSHIP_MAPPER
    RELATIONSHIP_MAPPER --> CONCEPT_IDENTIFIER
    CONCEPT_IDENTIFIER --> QUESTION_GENERATOR

    EMBEDDING_GENERATOR --> VECTOR_INDEXER
    CONTENT_CHUNKER --> CHUNK_STORAGE
    METADATA_PARSER --> METADATA_STORE
    VECTOR_INDEXER --> SIMILARITY_ENGINE

    SEARCH_INTERFACE --> CONTEXT_RETRIEVER
    CONTEXT_RETRIEVER --> SIMILARITY_ENGINE
    SIMILARITY_ENGINE --> ANSWER_GENERATOR
    ANSWER_GENERATOR --> CITATION_TRACKER

    style PDF_UPLOAD fill:#e1f5fe
    style CONTENT_CHUNKER fill:#f3e5f5
    style EMBEDDING_GENERATOR fill:#fff3e0
    style VECTOR_INDEXER fill:#fce4ec
    style SEARCH_INTERFACE fill:#e8f5e8
```

## Data Flow Characteristics

### WebHarvest Data Patterns
- **Stream Processing**: Continuous data flow through pipeline stages
- **Caching Strategy**: Multi-level caching for performance optimization
- **Parallel Processing**: Worker-based distributed data processing
- **Vector Integration**: Semantic search capabilities with embeddings

### WebClone Pro Data Patterns
- **AI-Driven Pipeline**: Multiple AI services in processing chain
- **Real-time Synchronization**: Live collaboration data streams
- **Cost Optimization**: Data flow designed for efficient resource usage
- **Multi-format Output**: Support for various deployment targets

### Shared Data Principles
- **Data Validation**: Input validation at every entry point
- **Error Handling**: Graceful degradation with fallback mechanisms
- **Monitoring**: Comprehensive data flow observability
- **Security**: Data protection throughout the processing pipeline