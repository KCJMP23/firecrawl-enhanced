# Deployment Diagrams

This document provides comprehensive deployment architecture diagrams for WebHarvest and WebClone Pro systems across different environments.

## 1. Docker Compose Architecture

### 1.1 WebHarvest Docker Compose Stack

```mermaid
graph TB
    subgraph "Docker Network: webharvest"
        subgraph "Frontend Services"
            NGINX[nginx:alpine<br/>Port: 80, 443<br/>Proxy & SSL]
            OPENWEBUI[open-webui:main<br/>Port: 3000<br/>Chat Interface]
        end

        subgraph "Application Services"
            API[webharvest-api<br/>Port: 8080<br/>FastAPI Server]
            WORKER1[webharvest-worker<br/>Replica 1<br/>Celery Worker]
            WORKER2[webharvest-worker<br/>Replica 2<br/>Celery Worker]
        end

        subgraph "Data Services"
            POSTGRES[postgres:15-alpine<br/>Port: 5432<br/>Main Database]
            REDIS[redis:7-alpine<br/>Port: 6379<br/>Cache & Queue]
            QDRANT[qdrant:v1.7.4<br/>Port: 6333, 6334<br/>Vector Database]
        end

        subgraph "Volumes"
            PG_DATA[(postgres_data)]
            REDIS_DATA[(redis_data)]
            QDRANT_DATA[(qdrant_data)]
            OWU_DATA[(openwebui_data)]
            PW_CACHE[(playwright_cache)]
            SSL_CERTS[(ssl_certs)]
        end
    end

    NGINX --> API
    NGINX --> OPENWEBUI
    
    API --> POSTGRES
    API --> REDIS
    API --> QDRANT
    
    WORKER1 --> POSTGRES
    WORKER1 --> REDIS
    WORKER1 --> QDRANT
    
    WORKER2 --> POSTGRES
    WORKER2 --> REDIS
    WORKER2 --> QDRANT
    
    OPENWEBUI --> API
    
    POSTGRES --> PG_DATA
    REDIS --> REDIS_DATA
    QDRANT --> QDRANT_DATA
    OPENWEBUI --> OWU_DATA
    WORKER1 --> PW_CACHE
    WORKER2 --> PW_CACHE
    NGINX --> SSL_CERTS

    style NGINX fill:#e1f5fe
    style API fill:#f3e5f5
    style WORKER1 fill:#f3e5f5
    style WORKER2 fill:#f3e5f5
    style POSTGRES fill:#e8f5e8
    style REDIS fill:#fff3e0
    style QDRANT fill:#fce4ec
```

### 1.2 WebClone Pro Docker Compose Stack

```mermaid
graph TB
    subgraph "Docker Network: webclone-network"
        subgraph "Application Layer"
            NGINX[nginx:alpine<br/>Port: 80, 443<br/>Reverse Proxy]
            NEXTJS[webclone-pro<br/>Port: 3000<br/>Next.js Application]
        end

        subgraph "Data Layer"
            POSTGRES[postgres:15-alpine<br/>Port: 5432<br/>Supabase Database]
            REDIS[redis:7-alpine<br/>Port: 6379<br/>Session & Cache]
        end

        subgraph "Storage Volumes"
            PG_DATA[(postgres_data)]
            REDIS_DATA[(redis_data)]
            SSL_CERTS[(ssl_certificates)]
        end

        subgraph "External Services"
            SUPABASE_CLOUD[Supabase Cloud<br/>Auth & Real-time]
            OPENAI_API[OpenAI API<br/>AI Services]
            STRIPE_API[Stripe API<br/>Payments]
            LIVEBLOCKS[Liveblocks<br/>Collaboration]
        end
    end

    NGINX --> NEXTJS
    
    NEXTJS --> POSTGRES
    NEXTJS --> REDIS
    NEXTJS --> SUPABASE_CLOUD
    NEXTJS --> OPENAI_API
    NEXTJS --> STRIPE_API
    NEXTJS --> LIVEBLOCKS
    
    POSTGRES --> PG_DATA
    REDIS --> REDIS_DATA
    NGINX --> SSL_CERTS

    style NGINX fill:#e1f5fe
    style NEXTJS fill:#e3f2fd
    style POSTGRES fill:#e8f5e8
    style REDIS fill:#fff3e0
    style SUPABASE_CLOUD fill:#f3e5f5
```

## 2. Kubernetes Deployment Architecture

### 2.1 WebHarvest Kubernetes Deployment

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Ingress Layer"
            INGRESS[Ingress Controller<br/>nginx-ingress<br/>SSL Termination]
            LB[Load Balancer<br/>External IP]
        end

        subgraph "Application Namespace: webharvest"
            subgraph "API Tier"
                API_DEPLOY[API Deployment<br/>replicas: 3<br/>webharvest-api]
                API_SVC[API Service<br/>ClusterIP:8080]
            end

            subgraph "Worker Tier"
                WORKER_DEPLOY[Worker Deployment<br/>replicas: 5<br/>webharvest-worker]
                WORKER_HPA[Horizontal Pod Autoscaler<br/>CPU: 70%, Memory: 80%]
            end

            subgraph "Storage Tier"
                PG_DEPLOY[PostgreSQL<br/>StatefulSet<br/>persistent storage]
                REDIS_DEPLOY[Redis<br/>Deployment<br/>replicas: 1]
                QDRANT_DEPLOY[Qdrant<br/>StatefulSet<br/>vector storage]
            end

            subgraph "Configuration"
                CONFIG_MAP[ConfigMaps<br/>Environment Variables]
                SECRETS[Secrets<br/>API Keys & Passwords]
                PVC[Persistent Volume Claims<br/>Database Storage]
            end
        end

        subgraph "Monitoring Namespace"
            PROMETHEUS[Prometheus<br/>Metrics Collection]
            GRAFANA[Grafana<br/>Visualization]
            ALERTMANAGER[AlertManager<br/>Alerting]
        end
    end

    LB --> INGRESS
    INGRESS --> API_SVC
    API_SVC --> API_DEPLOY
    
    API_DEPLOY --> REDIS_DEPLOY
    API_DEPLOY --> PG_DEPLOY
    API_DEPLOY --> QDRANT_DEPLOY
    
    WORKER_DEPLOY --> REDIS_DEPLOY
    WORKER_DEPLOY --> PG_DEPLOY
    WORKER_DEPLOY --> QDRANT_DEPLOY
    
    WORKER_HPA --> WORKER_DEPLOY
    
    API_DEPLOY --> CONFIG_MAP
    API_DEPLOY --> SECRETS
    WORKER_DEPLOY --> CONFIG_MAP
    WORKER_DEPLOY --> SECRETS
    
    PG_DEPLOY --> PVC
    QDRANT_DEPLOY --> PVC
    
    PROMETHEUS --> API_DEPLOY
    PROMETHEUS --> WORKER_DEPLOY
    GRAFANA --> PROMETHEUS
    ALERTMANAGER --> PROMETHEUS

    style INGRESS fill:#e1f5fe
    style API_DEPLOY fill:#f3e5f5
    style WORKER_DEPLOY fill:#f3e5f5
    style PG_DEPLOY fill:#e8f5e8
    style PROMETHEUS fill:#fff3e0
```

### 2.2 WebClone Pro Kubernetes Deployment

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Ingress Layer"
            INGRESS[Ingress Controller<br/>cert-manager + Let's Encrypt]
            CDN[CloudFront CDN<br/>Static Assets]
        end

        subgraph "Application Namespace: webclone-pro"
            subgraph "Frontend Tier"
                NEXTJS_DEPLOY[Next.js Deployment<br/>replicas: 3<br/>Auto-scaling]
                NEXTJS_SVC[Next.js Service<br/>ClusterIP:3000]
            end

            subgraph "Cache Layer"
                REDIS_DEPLOY[Redis Deployment<br/>Session Store]
                REDIS_SVC[Redis Service<br/>ClusterIP:6379]
            end

            subgraph "Configuration & Secrets"
                CONFIG[ConfigMap<br/>App Configuration]
                SECRETS[Secrets<br/>API Keys, DB Credentials]
                ENV_SECRETS[External Secrets<br/>Supabase, OpenAI, Stripe]
            end

            subgraph "Scaling & Monitoring"
                HPA[Horizontal Pod Autoscaler<br/>CPU & Memory based]
                VPA[Vertical Pod Autoscaler<br/>Resource optimization]
            end
        end

        subgraph "External Services"
            SUPABASE[Supabase<br/>Managed Database<br/>Auth & Real-time]
            OPENAI[OpenAI API<br/>AI Models]
            STRIPE[Stripe<br/>Payment Processing]
            LIVEBLOCKS[Liveblocks<br/>Collaboration Platform]
        end
    end

    INGRESS --> NEXTJS_SVC
    CDN --> INGRESS
    NEXTJS_SVC --> NEXTJS_DEPLOY
    
    NEXTJS_DEPLOY --> REDIS_SVC
    REDIS_SVC --> REDIS_DEPLOY
    
    NEXTJS_DEPLOY --> CONFIG
    NEXTJS_DEPLOY --> SECRETS
    NEXTJS_DEPLOY --> ENV_SECRETS
    
    HPA --> NEXTJS_DEPLOY
    VPA --> NEXTJS_DEPLOY
    
    NEXTJS_DEPLOY --> SUPABASE
    NEXTJS_DEPLOY --> OPENAI
    NEXTJS_DEPLOY --> STRIPE
    NEXTJS_DEPLOY --> LIVEBLOCKS

    style INGRESS fill:#e1f5fe
    style NEXTJS_DEPLOY fill:#e3f2fd
    style REDIS_DEPLOY fill:#fff3e0
    style SUPABASE fill:#e8f5e8
    style HPA fill:#f3e5f5
```

## 3. Production Scaling Patterns

### 3.1 WebHarvest Horizontal Scaling

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        ALB[Application Load Balancer<br/>AWS ALB / Azure Front Door]
        WAF[Web Application Firewall<br/>DDoS Protection]
    end

    subgraph "API Tier (Auto-scaling)"
        API1[API Instance 1<br/>t3.large]
        API2[API Instance 2<br/>t3.large]
        API3[API Instance 3<br/>t3.large]
        APIN[API Instance N<br/>Auto-scaled]
    end

    subgraph "Worker Tier (Queue-based Scaling)"
        WORKER_GROUP1[Worker Group 1<br/>General Tasks<br/>c5.xlarge x 3]
        WORKER_GROUP2[Worker Group 2<br/>Heavy Crawling<br/>c5.2xlarge x 5]
        WORKER_GROUP3[Worker Group 3<br/>Browser Tasks<br/>m5.large x 10]
    end

    subgraph "Data Tier"
        POSTGRES_CLUSTER[PostgreSQL Cluster<br/>Primary + 2 Read Replicas<br/>r5.xlarge]
        REDIS_CLUSTER[Redis Cluster<br/>3 Masters, 3 Replicas<br/>r6g.large]
        QDRANT_CLUSTER[Qdrant Cluster<br/>3 Nodes<br/>m5.xlarge]
    end

    subgraph "Message Queues"
        CELERY_BROKER[Redis Queue<br/>Task Distribution]
        DLQ[Dead Letter Queue<br/>Failed Task Handling]
    end

    WAF --> ALB
    ALB --> API1
    ALB --> API2
    ALB --> API3
    ALB --> APIN

    API1 --> POSTGRES_CLUSTER
    API2 --> POSTGRES_CLUSTER
    API3 --> POSTGRES_CLUSTER

    API1 --> REDIS_CLUSTER
    API2 --> REDIS_CLUSTER
    API3 --> REDIS_CLUSTER

    CELERY_BROKER --> WORKER_GROUP1
    CELERY_BROKER --> WORKER_GROUP2
    CELERY_BROKER --> WORKER_GROUP3

    WORKER_GROUP1 --> POSTGRES_CLUSTER
    WORKER_GROUP2 --> POSTGRES_CLUSTER
    WORKER_GROUP3 --> POSTGRES_CLUSTER

    CELERY_BROKER --> DLQ

    style ALB fill:#e1f5fe
    style WORKER_GROUP1 fill:#f3e5f5
    style WORKER_GROUP2 fill:#f3e5f5
    style WORKER_GROUP3 fill:#f3e5f5
    style POSTGRES_CLUSTER fill:#e8f5e8
```

### 3.2 WebClone Pro Global Distribution

```mermaid
graph TB
    subgraph "Global CDN Layer"
        CF[CloudFlare<br/>Global Edge Network]
        CDN_US[CDN Edge - US East<br/>Static Assets]
        CDN_EU[CDN Edge - EU West<br/>Static Assets]
        CDN_ASIA[CDN Edge - Asia Pacific<br/>Static Assets]
    end

    subgraph "US East Region"
        US_LB[Load Balancer US<br/>Auto-scaling Group]
        US_APP[Next.js Cluster<br/>3-15 instances<br/>t3.medium to c5.large]
        US_REDIS[Redis US<br/>ElastiCache]
    end

    subgraph "EU West Region"
        EU_LB[Load Balancer EU<br/>Auto-scaling Group]
        EU_APP[Next.js Cluster<br/>3-10 instances<br/>t3.medium]
        EU_REDIS[Redis EU<br/>ElastiCache]
    end

    subgraph "Global Services"
        SUPABASE_GLOBAL[Supabase Global<br/>Multi-region Database<br/>Auto-failover]
        OPENAI_GLOBAL[OpenAI API<br/>Global Endpoints]
        STRIPE_GLOBAL[Stripe Global<br/>Multi-region]
        LIVEBLOCKS_GLOBAL[Liveblocks Global<br/>Real-time Sync]
    end

    CF --> CDN_US
    CF --> CDN_EU
    CF --> CDN_ASIA

    CDN_US --> US_LB
    CDN_EU --> EU_LB

    US_LB --> US_APP
    EU_LB --> EU_APP

    US_APP --> US_REDIS
    EU_APP --> EU_REDIS

    US_APP --> SUPABASE_GLOBAL
    EU_APP --> SUPABASE_GLOBAL

    US_APP --> OPENAI_GLOBAL
    EU_APP --> OPENAI_GLOBAL

    US_APP --> STRIPE_GLOBAL
    EU_APP --> STRIPE_GLOBAL

    US_APP --> LIVEBLOCKS_GLOBAL
    EU_APP --> LIVEBLOCKS_GLOBAL

    style CF fill:#e1f5fe
    style US_APP fill:#e3f2fd
    style EU_APP fill:#e3f2fd
    style SUPABASE_GLOBAL fill:#e8f5e8
```

## 4. CI/CD Pipeline Visualization

### 4.1 WebHarvest CI/CD Pipeline

```mermaid
graph LR
    subgraph "Source Control"
        GIT[Git Repository<br/>GitHub/GitLab]
        BRANCH[Feature Branch]
        MAIN[Main Branch]
    end

    subgraph "CI Pipeline"
        TRIGGER[Webhook Trigger<br/>Push/PR Events]
        
        subgraph "Build Stage"
            LINT[Code Linting<br/>flake8, black]
            TEST[Unit Tests<br/>pytest]
            SECURITY[Security Scan<br/>bandit, safety]
            BUILD[Docker Build<br/>Multi-stage Build]
        end
        
        subgraph "Quality Gates"
            COVERAGE[Code Coverage<br/>>= 80%]
            SONAR[SonarQube<br/>Quality Analysis]
            VULNS[Vulnerability Scan<br/>Trivy, Snyk]
        end
    end

    subgraph "CD Pipeline"
        subgraph "Staging"
            STAGING_DEPLOY[Deploy to Staging<br/>Kubernetes Staging]
            E2E_TEST[E2E Tests<br/>API Testing]
            PERFORMANCE[Performance Tests<br/>Load Testing]
        end
        
        subgraph "Production"
            APPROVAL[Manual Approval<br/>Release Gate]
            PROD_DEPLOY[Production Deployment<br/>Blue-Green/Canary]
            SMOKE_TEST[Smoke Tests<br/>Health Checks]
            MONITOR[Monitoring<br/>Alerts & Metrics]
        end
    end

    subgraph "Infrastructure"
        TERRAFORM[Terraform<br/>Infrastructure as Code]
        HELM[Helm Charts<br/>Kubernetes Deployments]
        SECRETS[Secret Management<br/>HashiCorp Vault]
    end

    GIT --> TRIGGER
    BRANCH --> TRIGGER
    MAIN --> TRIGGER
    
    TRIGGER --> LINT
    LINT --> TEST
    TEST --> SECURITY
    SECURITY --> BUILD
    
    BUILD --> COVERAGE
    COVERAGE --> SONAR
    SONAR --> VULNS
    
    VULNS --> STAGING_DEPLOY
    STAGING_DEPLOY --> E2E_TEST
    E2E_TEST --> PERFORMANCE
    
    PERFORMANCE --> APPROVAL
    APPROVAL --> PROD_DEPLOY
    PROD_DEPLOY --> SMOKE_TEST
    SMOKE_TEST --> MONITOR
    
    TERRAFORM --> STAGING_DEPLOY
    TERRAFORM --> PROD_DEPLOY
    HELM --> STAGING_DEPLOY
    HELM --> PROD_DEPLOY
    SECRETS --> STAGING_DEPLOY
    SECRETS --> PROD_DEPLOY

    style TRIGGER fill:#e1f5fe
    style BUILD fill:#f3e5f5
    style STAGING_DEPLOY fill:#fff3e0
    style PROD_DEPLOY fill:#e8f5e8
```

### 4.2 WebClone Pro CI/CD Pipeline

```mermaid
graph LR
    subgraph "Source Control"
        GITHUB[GitHub Repository<br/>main, develop branches]
        PR[Pull Request<br/>Feature branches]
    end

    subgraph "Vercel CI/CD"
        WEBHOOK[GitHub Webhook<br/>Auto-trigger]
        
        subgraph "Build Process"
            INSTALL[npm install<br/>Dependency installation]
            LINT[ESLint + Prettier<br/>Code quality]
            TYPE_CHECK[TypeScript<br/>Type checking]
            TEST_UNIT[Jest<br/>Unit tests]
            TEST_E2E[Playwright<br/>E2E tests]
            BUILD_NEXT[Next.js Build<br/>Static generation]
        end
        
        subgraph "Deployment"
            PREVIEW[Preview Deployment<br/>PR branches]
            STAGING[Staging Deployment<br/>develop branch]
            PRODUCTION[Production Deployment<br/>main branch]
        end
    end

    subgraph "Quality Assurance"
        LIGHTHOUSE[Lighthouse CI<br/>Performance audits]
        SECURITY_SCAN[Security scan<br/>npm audit, Snyk]
        BUNDLE_ANALYSIS[Bundle Analysis<br/>Size optimization]
        A11Y[Accessibility Tests<br/>axe-core]
    end

    subgraph "Monitoring & Observability"
        VERCEL_ANALYTICS[Vercel Analytics<br/>Performance monitoring]
        SENTRY[Sentry<br/>Error tracking]
        LOGS[Vercel Logs<br/>Request logging]
        ALERTS[Alert System<br/>Performance degradation]
    end

    GITHUB --> WEBHOOK
    PR --> WEBHOOK
    
    WEBHOOK --> INSTALL
    INSTALL --> LINT
    LINT --> TYPE_CHECK
    TYPE_CHECK --> TEST_UNIT
    TEST_UNIT --> TEST_E2E
    TEST_E2E --> BUILD_NEXT
    
    BUILD_NEXT --> LIGHTHOUSE
    BUILD_NEXT --> SECURITY_SCAN
    BUILD_NEXT --> BUNDLE_ANALYSIS
    BUILD_NEXT --> A11Y
    
    BUILD_NEXT --> PREVIEW
    BUILD_NEXT --> STAGING
    BUILD_NEXT --> PRODUCTION
    
    PRODUCTION --> VERCEL_ANALYTICS
    PRODUCTION --> SENTRY
    PRODUCTION --> LOGS
    PRODUCTION --> ALERTS

    style WEBHOOK fill:#e1f5fe
    style BUILD_NEXT fill:#e3f2fd
    style PRODUCTION fill:#e8f5e8
    style VERCEL_ANALYTICS fill:#f3e5f5
```

## 5. Infrastructure as Code Structure

### 5.1 Terraform Infrastructure Layout

```mermaid
graph TB
    subgraph "Terraform Modules"
        subgraph "Networking Module"
            VPC[VPC Configuration<br/>CIDR, Subnets]
            SECURITY_GROUPS[Security Groups<br/>Firewall Rules]
            LOAD_BALANCERS[Load Balancers<br/>Application/Network LB]
        end

        subgraph "Compute Module"
            EKS[EKS Cluster<br/>Kubernetes control plane]
            NODE_GROUPS[Worker Node Groups<br/>Auto-scaling groups]
            FARGATE[Fargate Profiles<br/>Serverless containers]
        end

        subgraph "Storage Module"
            RDS[RDS PostgreSQL<br/>Multi-AZ deployment]
            ELASTICACHE[ElastiCache Redis<br/>Cluster mode]
            EFS[EFS Storage<br/>Shared file system]
            S3[S3 Buckets<br/>Asset storage]
        end

        subgraph "Monitoring Module"
            CLOUDWATCH[CloudWatch<br/>Metrics & Logs]
            X_RAY[AWS X-Ray<br/>Distributed tracing]
            SNS[SNS Topics<br/>Alert notifications]
        end

        subgraph "Security Module"
            IAM[IAM Roles & Policies<br/>Service permissions]
            KMS[KMS Keys<br/>Encryption at rest]
            SECRETS_MANAGER[Secrets Manager<br/>Credential storage]
            CERTIFICATE_MANAGER[Certificate Manager<br/>SSL/TLS certificates]
        end
    end

    VPC --> EKS
    SECURITY_GROUPS --> NODE_GROUPS
    LOAD_BALANCERS --> EKS

    EKS --> NODE_GROUPS
    EKS --> FARGATE

    NODE_GROUPS --> RDS
    NODE_GROUPS --> ELASTICACHE
    NODE_GROUPS --> EFS
    NODE_GROUPS --> S3

    CLOUDWATCH --> EKS
    X_RAY --> NODE_GROUPS
    SNS --> CLOUDWATCH

    IAM --> EKS
    KMS --> RDS
    KMS --> S3
    SECRETS_MANAGER --> NODE_GROUPS
    CERTIFICATE_MANAGER --> LOAD_BALANCERS

    style VPC fill:#e1f5fe
    style EKS fill:#f3e5f5
    style RDS fill:#e8f5e8
    style IAM fill:#fff3e0
```

## Deployment Best Practices

### WebHarvest Deployment
- **Container Security**: Non-root containers, minimal base images
- **Resource Management**: CPU/Memory limits and requests defined
- **High Availability**: Multi-AZ deployment with auto-failover
- **Monitoring**: Comprehensive metrics and alerting

### WebClone Pro Deployment
- **Edge Optimization**: Global CDN with edge caching
- **Serverless Scaling**: Function-based scaling for AI operations
- **Performance**: Bundle optimization and lazy loading
- **Real-time**: WebSocket connection management at scale

### Shared Infrastructure
- **GitOps**: Infrastructure and application configuration as code
- **Zero-Downtime**: Blue-green and canary deployment strategies
- **Disaster Recovery**: Automated backup and restore procedures
- **Cost Optimization**: Resource scheduling and right-sizing