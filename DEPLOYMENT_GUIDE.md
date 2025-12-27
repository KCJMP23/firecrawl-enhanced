# Production Deployment Guide - Firecrawl-Clone Platform

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **🚀 Enterprise-grade deployment guide for WebHarvest and WebClone Pro** - Deploy with confidence using battle-tested configurations for Docker, Kubernetes, and major cloud providers.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Deployment](#quick-deployment)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Provider Guides](#cloud-provider-guides)
- [Security Configuration](#security-configuration)
- [Monitoring and Observability](#monitoring-and-observability)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling and Performance](#scaling-and-performance)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Firecrawl-Clone platform is designed for enterprise deployment with multiple options:

- **🐳 Docker Compose**: Perfect for single-server deployments
- **☸️ Kubernetes**: Full container orchestration for high availability
- **☁️ Cloud Native**: Leverages managed services for maximum scalability
- **🔒 Security First**: Built-in security best practices and compliance
- **📊 Observable**: Comprehensive monitoring and alerting

### Architecture Options

| Deployment Type | Best For | Complexity | Scalability | Cost |
|-----------------|----------|-------------|-------------|------|
| **Docker Compose** | Small teams, development | Low | Limited | Low |
| **Kubernetes** | Production, high availability | Medium | High | Medium |
| **Cloud Managed** | Enterprise, global scale | High | Unlimited | High |

## 🛠 Prerequisites

### System Requirements

#### Minimum Production Requirements
| Component | Requirement | Recommended |
|-----------|-------------|-------------|
| **CPU** | 8 cores | 16+ cores |
| **RAM** | 32GB | 64GB+ |
| **Storage** | 500GB SSD | 1TB+ NVMe |
| **Network** | 1Gbps | 10Gbps+ |
| **OS** | Ubuntu 22.04 LTS | Latest LTS |

#### Software Dependencies
| Tool | Version | Purpose |
|------|---------|---------|
| **Docker** | 24.0+ | Container runtime |
| **Docker Compose** | 2.20+ | Multi-container orchestration |
| **kubectl** | 1.28+ | Kubernetes management |
| **Helm** | 3.12+ | Kubernetes package manager |
| **Terraform** | 1.5+ | Infrastructure as code |

### Domain and SSL Requirements
```bash
# Domain requirements
api.yourdomain.com     # WebHarvest API
app.yourdomain.com     # WebClone Pro
chat.yourdomain.com    # OpenWebUI (optional)
admin.yourdomain.com   # Admin interface (optional)

# SSL certificates
# Use Let's Encrypt or your certificate provider
```

### Environment Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## 🚀 Quick Deployment

### One-Command Production Deployment

```bash
# Clone repository
git clone https://github.com/your-org/firecrawl-clone.git
cd firecrawl-clone

# Setup production environment
./scripts/setup-production.sh

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to Kubernetes
./scripts/deploy-kubernetes.sh
```

### Verification
```bash
# Health check all services
curl -f https://api.yourdomain.com/health
curl -f https://app.yourdomain.com/api/health

# Check service status
docker-compose ps  # For Docker
kubectl get pods   # For Kubernetes
```

## 🐳 Docker Deployment

### Production Docker Compose

#### Complete Production Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Reverse Proxy & Load Balancer
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - webharvest-api
      - webclone-pro
    networks:
      - web

  # Database
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
      - ./config/postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf:ro
      - ./logs/postgres:/var/log/postgresql
    networks:
      - backend
    ports:
      - "127.0.0.1:5432:5432"  # Only accessible from localhost
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server /etc/redis/redis.conf
    volumes:
      - redis_data:/data
      - ./config/redis/redis.conf:/etc/redis/redis.conf:ro
      - ./logs/redis:/var/log/redis
    networks:
      - backend
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Vector Database
  qdrant:
    image: qdrant/qdrant:v1.7.0
    restart: always
    volumes:
      - qdrant_data:/qdrant/storage
      - ./config/qdrant/config.yaml:/qdrant/config/production.yaml:ro
    networks:
      - backend
    ports:
      - "127.0.0.1:6333:6333"
    environment:
      QDRANT__SERVICE__HTTP_PORT: 6333
      QDRANT__SERVICE__GRPC_PORT: 6334

  # WebHarvest API
  webharvest-api:
    build:
      context: ./webharvest
      dockerfile: Dockerfile.prod
      target: production
    restart: always
    environment:
      - ENV=production
      - DEBUG=false
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379/0
      - QDRANT_URL=http://qdrant:6333
      - JWT_SECRET=${JWT_SECRET}
      - API_KEY_SALT=${API_KEY_SALT}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - SENTRY_DSN=${SENTRY_DSN}
    volumes:
      - ./logs/webharvest:/app/logs
      - webharvest_uploads:/app/uploads
    networks:
      - web
      - backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "2.0"
          memory: 4G
        reservations:
          cpus: "1.0"
          memory: 2G

  # WebHarvest Workers
  webharvest-worker:
    build:
      context: ./webharvest
      dockerfile: Dockerfile.prod
      target: worker
    restart: always
    environment:
      - ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/2
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./logs/workers:/app/logs
      - webharvest_uploads:/app/uploads
    networks:
      - backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      replicas: 4
      resources:
        limits:
          cpus: "1.0"
          memory: 2G

  # WebClone Pro
  webclone-pro:
    build:
      context: ./webclone-pro
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
      - NEXT_PUBLIC_API_URL=https://app.yourdomain.com/api
      - WEBHARVEST_API_URL=http://webharvest-api:8000
      - WEBHARVEST_API_KEY=${WEBHARVEST_API_KEY}
      - NEXTAUTH_URL=https://app.yourdomain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - SENTRY_DSN=${SENTRY_DSN_FRONTEND}
    volumes:
      - ./logs/webclone-pro:/app/logs
    networks:
      - web
      - backend
    depends_on:
      webharvest-api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1.0"
          memory: 2G

  # Monitoring Stack
  prometheus:
    image: prom/prometheus:latest
    restart: always
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - ./config/prometheus:/etc/prometheus:ro
      - prometheus_data:/prometheus
    ports:
      - "127.0.0.1:9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    restart: always
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "127.0.0.1:3001:3000"
    networks:
      - monitoring

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  qdrant_data:
    driver: local
  webharvest_uploads:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

networks:
  web:
    driver: bridge
  backend:
    driver: bridge
    internal: true
  monitoring:
    driver: bridge
```

#### Environment Configuration
```bash
# .env.production
# Copy this to .env and customize for your deployment

# Domain Configuration
DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
APP_DOMAIN=app.yourdomain.com

# Database
POSTGRES_DB=firecrawl_prod
POSTGRES_USER=firecrawl_user
POSTGRES_PASSWORD=your-super-secure-postgres-password

# Security
JWT_SECRET=your-jwt-secret-min-32-characters-long
API_KEY_SALT=your-api-key-salt
NEXTAUTH_SECRET=your-nextauth-secret

# External APIs
OPENAI_API_KEY=sk-your-production-openai-key
ANTHROPIC_API_KEY=sk-ant-your-production-anthropic-key

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WebHarvest Integration
WEBHARVEST_API_KEY=wh_your_production_api_key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
SENTRY_DSN_FRONTEND=https://your-frontend-sentry-dsn
GRAFANA_USER=admin
GRAFANA_PASSWORD=your-grafana-password

# Email (for alerts)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=alerts@yourdomain.com
SMTP_PASSWORD=your-smtp-password

# Backup
BACKUP_S3_BUCKET=your-backup-bucket
BACKUP_S3_ACCESS_KEY=your-s3-access-key
BACKUP_S3_SECRET_KEY=your-s3-secret-key
BACKUP_S3_REGION=us-east-1
```

#### Nginx Configuration
```nginx
# config/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=app:10m rate=20r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;

    # WebHarvest API
    upstream webharvest_backend {
        least_conn;
        server webharvest-api:8000 max_fails=3 fail_timeout=30s;
    }

    # WebClone Pro
    upstream webclone_backend {
        least_conn;
        server webclone-pro:3000 max_fails=3 fail_timeout=30s;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name api.yourdomain.com app.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # WebHarvest API
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/api.yourdomain.com.crt;
        ssl_certificate_key /etc/nginx/ssl/api.yourdomain.com.key;

        location / {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://webharvest_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        location /metrics {
            deny all;
            return 404;
        }
    }

    # WebClone Pro
    server {
        listen 443 ssl http2;
        server_name app.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/app.yourdomain.com.crt;
        ssl_certificate_key /etc/nginx/ssl/app.yourdomain.com.key;

        location / {
            limit_req zone=app burst=50 nodelay;
            
            proxy_pass http://webclone_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 60s;
            
            # WebSocket support for real-time collaboration
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Static asset caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://webclone_backend;
        }
    }
}
```

### Deployment Commands

#### Initial Deployment
```bash
# Setup production environment
./scripts/setup-production.sh

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Initialize databases
./scripts/init-production-db.sh

# Setup SSL certificates
./scripts/setup-ssl.sh

# Verify deployment
./scripts/verify-deployment.sh
```

#### Updates and Maintenance
```bash
# Update services
./scripts/update-production.sh

# Backup data
./scripts/backup-production.sh

# Rolling restart
./scripts/rolling-restart.sh

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f
```

## ☸️ Kubernetes Deployment

### Kubernetes Architecture

```mermaid
graph TB
    subgraph "Ingress Layer"
        NGINX[Nginx Ingress Controller]
        CERT[cert-manager]
    end
    
    subgraph "Application Layer"
        WCP[WebClone Pro Pods]
        WH[WebHarvest API Pods]
        WORKER[Worker Pods]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
        QDRANT[(Qdrant)]
    end
    
    subgraph "Storage"
        PVC[Persistent Volume Claims]
        S3[S3 Compatible Storage]
    end
    
    NGINX --> WCP
    NGINX --> WH
    WH --> WORKER
    WCP --> POSTGRES
    WH --> POSTGRES
    WH --> REDIS
    WH --> QDRANT
    POSTGRES --> PVC
    WORKER --> S3
```

### Kubernetes Manifests

#### Namespace and RBAC
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: firecrawl-clone
  labels:
    name: firecrawl-clone

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: firecrawl-clone
  namespace: firecrawl-clone

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: firecrawl-clone
rules:
- apiGroups: [""]
  resources: ["secrets", "configmaps", "services", "pods"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: firecrawl-clone
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: firecrawl-clone
subjects:
- kind: ServiceAccount
  name: firecrawl-clone
  namespace: firecrawl-clone
```

#### ConfigMaps and Secrets
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: firecrawl-config
  namespace: firecrawl-clone
data:
  POSTGRES_DB: "firecrawl_prod"
  POSTGRES_USER: "firecrawl_user"
  REDIS_URL: "redis://redis-service:6379/0"
  QDRANT_URL: "http://qdrant-service:6333"
  ENV: "production"
  DEBUG: "false"

---
apiVersion: v1
kind: Secret
metadata:
  name: firecrawl-secrets
  namespace: firecrawl-clone
type: Opaque
data:
  postgres-password: <base64-encoded-password>
  jwt-secret: <base64-encoded-jwt-secret>
  api-key-salt: <base64-encoded-api-key-salt>
  openai-api-key: <base64-encoded-openai-key>
  anthropic-api-key: <base64-encoded-anthropic-key>
  nextauth-secret: <base64-encoded-nextauth-secret>
  stripe-secret-key: <base64-encoded-stripe-secret>
  webharvest-api-key: <base64-encoded-webharvest-key>
```

#### PostgreSQL Deployment
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: firecrawl-clone
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: firecrawl-config
              key: POSTGRES_DB
        - name: POSTGRES_USER
          valueFrom:
            configMapKeyRef:
              name: firecrawl-config
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: postgres-password
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "2Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "1000m"
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
            - -d
            - $(POSTGRES_DB)
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
            - -d
            - $(POSTGRES_DB)
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "fast-ssd"
      resources:
        requests:
          storage: 100Gi

---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: firecrawl-clone
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

#### Redis Deployment
```yaml
# k8s/redis.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: firecrawl-clone
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - --appendonly
        - "yes"
        - --maxmemory
        - "2gb"
        - --maxmemory-policy
        - "allkeys-lru"
        volumeMounts:
        - name: redis-data
          mountPath: /data
        resources:
          requests:
            memory: "1Gi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: redis-data
        persistentVolumeClaim:
          claimName: redis-pvc

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: firecrawl-clone
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: "fast-ssd"
  resources:
    requests:
      storage: 20Gi

---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: firecrawl-clone
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

#### WebHarvest API Deployment
```yaml
# k8s/webharvest-api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webharvest-api
  namespace: firecrawl-clone
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webharvest-api
  template:
    metadata:
      labels:
        app: webharvest-api
    spec:
      serviceAccountName: firecrawl-clone
      containers:
      - name: webharvest-api
        image: your-registry/webharvest-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@postgres-service:5432/$(POSTGRES_DB)"
        - name: POSTGRES_USER
          valueFrom:
            configMapKeyRef:
              name: firecrawl-config
              key: POSTGRES_USER
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: firecrawl-config
              key: POSTGRES_DB
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: postgres-password
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: firecrawl-config
              key: REDIS_URL
        - name: QDRANT_URL
          valueFrom:
            configMapKeyRef:
              name: firecrawl-config
              key: QDRANT_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: jwt-secret
        - name: API_KEY_SALT
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: api-key-salt
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: openai-api-key
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: anthropic-api-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          httpGet:
            path: /readiness
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
        volumeMounts:
        - name: uploads
          mountPath: /app/uploads
      volumes:
      - name: uploads
        persistentVolumeClaim:
          claimName: webharvest-uploads-pvc

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: webharvest-uploads-pvc
  namespace: firecrawl-clone
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: "shared-storage"
  resources:
    requests:
      storage: 100Gi

---
apiVersion: v1
kind: Service
metadata:
  name: webharvest-api-service
  namespace: firecrawl-clone
spec:
  selector:
    app: webharvest-api
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
  type: ClusterIP
```

#### WebClone Pro Deployment
```yaml
# k8s/webclone-pro.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webclone-pro
  namespace: firecrawl-clone
spec:
  replicas: 2
  selector:
    matchLabels:
      app: webclone-pro
  template:
    metadata:
      labels:
        app: webclone-pro
    spec:
      serviceAccountName: firecrawl-clone
      containers:
      - name: webclone-pro
        image: your-registry/webclone-pro:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_APP_URL
          value: "https://app.yourdomain.com"
        - name: NEXT_PUBLIC_API_URL
          value: "https://app.yourdomain.com/api"
        - name: WEBHARVEST_API_URL
          value: "http://webharvest-api-service"
        - name: WEBHARVEST_API_KEY
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: webharvest-api-key
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: nextauth-secret
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: openai-api-key
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: firecrawl-secrets
              key: stripe-secret-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: webclone-pro-service
  namespace: firecrawl-clone
spec:
  selector:
    app: webclone-pro
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  type: ClusterIP
```

#### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: firecrawl-ingress
  namespace: firecrawl-clone
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "30"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "30"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    - app.yourdomain.com
    secretName: firecrawl-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webharvest-api-service
            port:
              number: 80
  - host: app.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webclone-pro-service
            port:
              number: 80
```

### Helm Chart Deployment

#### Helm Chart Structure
```
helm-chart/
├── Chart.yaml
├── values.yaml
├── values.prod.yaml
└── templates/
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secrets.yaml
    ├── postgres.yaml
    ├── redis.yaml
    ├── webharvest-api.yaml
    ├── webclone-pro.yaml
    ├── ingress.yaml
    └── monitoring.yaml
```

#### Chart.yaml
```yaml
apiVersion: v2
name: firecrawl-clone
description: Complete web intelligence platform
type: application
version: 1.0.0
appVersion: "1.0.0"
dependencies:
- name: postgresql
  version: 12.x.x
  repository: https://charts.bitnami.com/bitnami
  condition: postgresql.enabled
- name: redis
  version: 17.x.x
  repository: https://charts.bitnami.com/bitnami
  condition: redis.enabled
```

#### Deployment Commands
```bash
# Add Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install with Helm
helm install firecrawl-clone ./helm-chart \
  --namespace firecrawl-clone \
  --create-namespace \
  --values helm-chart/values.prod.yaml

# Upgrade deployment
helm upgrade firecrawl-clone ./helm-chart \
  --namespace firecrawl-clone \
  --values helm-chart/values.prod.yaml

# Rollback if needed
helm rollback firecrawl-clone 1 --namespace firecrawl-clone

# Uninstall
helm uninstall firecrawl-clone --namespace firecrawl-clone
```

### Horizontal Pod Autoscaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webharvest-api-hpa
  namespace: firecrawl-clone
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webharvest-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webclone-pro-hpa
  namespace: firecrawl-clone
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webclone-pro
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## ☁️ Cloud Provider Guides

### AWS Deployment

#### EKS Cluster Setup
```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create EKS cluster
eksctl create cluster \
  --name firecrawl-clone \
  --version 1.28 \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type m5.xlarge \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name firecrawl-clone
```

#### Terraform Configuration
```hcl
# terraform/aws/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = var.cluster_name
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    standard = {
      instance_types = ["m5.xlarge"]
      capacity_type  = "ON_DEMAND"
      
      min_size     = 2
      max_size     = 10
      desired_size = 3
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "${var.cluster_name}-postgres"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "firecrawl_prod"
  username = "firecrawl_user"
  password = var.postgres_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.cluster_name}-postgres-final-snapshot"
  
  tags = {
    Name = "${var.cluster_name}-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${var.cluster_name}-redis"
  description                = "Redis cluster for Firecrawl-Clone"
  
  node_type          = "cache.r6g.large"
  port               = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = 2
  
  subnet_group_name  = aws_elasticache_subnet_group.default.name
  security_group_ids = [aws_security_group.elasticache.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  tags = {
    Name = "${var.cluster_name}-redis"
  }
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "storage" {
  bucket = "${var.cluster_name}-storage"
  
  tags = {
    Name = "${var.cluster_name}-storage"
  }
}

resource "aws_s3_bucket_versioning" "storage" {
  bucket = aws_s3_bucket.storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "storage" {
  bucket = aws_s3_bucket.storage.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  for_each = toset([
    "/aws/eks/${var.cluster_name}/webharvest",
    "/aws/eks/${var.cluster_name}/webclone-pro"
  ])
  
  name              = each.key
  retention_in_days = 30
  
  tags = {
    Environment = "production"
    Application = "firecrawl-clone"
  }
}
```

#### Application Load Balancer Setup
```bash
# Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=firecrawl-clone \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### Google Cloud Platform (GCP)

#### GKE Cluster Setup
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Create GKE cluster
gcloud container clusters create firecrawl-clone \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-4 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade

# Configure kubectl
gcloud container clusters get-credentials firecrawl-clone --zone us-central1-a
```

#### Terraform GCP Configuration
```hcl
# terraform/gcp/main.tf
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.zone
  
  remove_default_node_pool = true
  initial_node_count       = 1
  
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-nodes"
  location   = var.zone
  cluster    = google_container_cluster.primary.name
  
  autoscaling {
    min_node_count = 2
    max_node_count = 10
  }
  
  node_config {
    machine_type = "e2-standard-4"
    
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }
}

# Cloud SQL PostgreSQL
resource "google_sql_database_instance" "postgres" {
  name             = "${var.cluster_name}-postgres"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier = "db-custom-2-8192"
    
    disk_size = 100
    disk_type = "PD_SSD"
    disk_autoresize = true
    
    backup_configuration {
      enabled = true
      start_time = "03:00"
      point_in_time_recovery_enabled = true
    }
    
    ip_configuration {
      ipv4_enabled = false
      private_network = google_compute_network.vpc.id
    }
  }
}

# Memorystore Redis
resource "google_redis_instance" "cache" {
  name           = "${var.cluster_name}-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = 4
  
  region                  = var.region
  authorized_network      = google_compute_network.vpc.id
  connect_mode           = "PRIVATE_SERVICE_ACCESS"
  
  redis_version = "REDIS_7_0"
  display_name  = "${var.cluster_name} Redis"
}

# Cloud Storage bucket
resource "google_storage_bucket" "storage" {
  name     = "${var.project_id}-${var.cluster_name}-storage"
  location = var.region
  
  versioning {
    enabled = true
  }
  
  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }
}
```

### Azure Deployment

#### AKS Cluster Setup
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login

# Create resource group
az group create --name firecrawl-clone-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group firecrawl-clone-rg \
  --name firecrawl-clone \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-cluster-autoscaler \
  --min-count 2 \
  --max-count 10 \
  --generate-ssh-keys

# Configure kubectl
az aks get-credentials --resource-group firecrawl-clone-rg --name firecrawl-clone
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### Let's Encrypt with cert-manager
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Security Policies

#### Network Policies
```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: firecrawl-network-policy
  namespace: firecrawl-clone
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  - from:
    - podSelector: {}
  egress:
  - to:
    - podSelector: {}
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
```

#### Pod Security Standards
```yaml
# k8s/pod-security-policy.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: firecrawl-clone
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Secrets Management

#### External Secrets Operator
```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace

# Configure AWS Secrets Manager integration
kubectl apply -f - <<EOF
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: firecrawl-clone
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-west-2
      auth:
        jwt:
          serviceAccountRef:
            name: firecrawl-clone
EOF
```

## 📊 Monitoring and Observability

### Prometheus and Grafana Setup

#### Prometheus Configuration
```yaml
# config/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'webharvest-api'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - firecrawl-clone
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: webharvest-api
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: ${1}:8000

  - job_name: 'webclone-pro'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - firecrawl-clone
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: webclone-pro
      - source_labels: [__meta_kubernetes_pod_ip]
        target_label: __address__
        replacement: ${1}:3000

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
```

#### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "Firecrawl-Clone Platform Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      }
    ]
  }
}
```

### Application Performance Monitoring

#### Sentry Integration
```python
# webharvest/app/monitoring.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn",
    integrations=[
        FastApiIntegration(auto_enabling_integrations=False),
        SqlalchemyIntegration()
    ],
    traces_sample_rate=0.1,
    environment="production",
    release="1.0.0"
)
```

```typescript
// webclone-pro/lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  debug: false,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/api\.yourdomain\.com/
      ]
    })
  ]
});
```

## 💾 Backup and Recovery

### Automated Backup Strategy

#### Database Backups
```bash
# scripts/backup-postgres.sh
#!/bin/bash
set -e

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create PostgreSQL backup
kubectl exec -n firecrawl-clone deployment/postgres -- \
  pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.gz" \
  s3://your-backup-bucket/postgres/

# Clean up local backup
rm "$BACKUP_DIR/$BACKUP_FILE.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "postgres_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Automated Backup CronJob
```yaml
# k8s/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: firecrawl-clone
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:15-alpine
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h postgres-service -U $POSTGRES_USER -d $POSTGRES_DB | \
              gzip > /backup/postgres_$(date +%Y%m%d_%H%M%S).sql.gz
            env:
            - name: POSTGRES_USER
              valueFrom:
                configMapKeyRef:
                  name: firecrawl-config
                  key: POSTGRES_USER
            - name: POSTGRES_DB
              valueFrom:
                configMapKeyRef:
                  name: firecrawl-config
                  key: POSTGRES_DB
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: firecrawl-secrets
                  key: postgres-password
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          volumes:
          - name: backup-volume
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### Disaster Recovery Plan

#### Recovery Procedures
```bash
# scripts/restore-postgres.sh
#!/bin/bash
set -e

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Restoring from backup: $BACKUP_FILE"

# Stop applications
kubectl scale deployment webharvest-api --replicas=0 -n firecrawl-clone
kubectl scale deployment webclone-pro --replicas=0 -n firecrawl-clone

# Restore database
kubectl exec -n firecrawl-clone deployment/postgres -- \
  psql -U $POSTGRES_USER -d $POSTGRES_DB < $BACKUP_FILE

# Restart applications
kubectl scale deployment webharvest-api --replicas=3 -n firecrawl-clone
kubectl scale deployment webclone-pro --replicas=2 -n firecrawl-clone

echo "Restore completed successfully"
```

## ⚡ Scaling and Performance

### Horizontal Pod Autoscaling

#### Custom Metrics Scaling
```yaml
# k8s/custom-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webharvest-api-custom-hpa
  namespace: firecrawl-clone
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webharvest-api
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name: queue_length
      target:
        type: AverageValue
        averageValue: "10"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
```

### Vertical Pod Autoscaling

```yaml
# k8s/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: webharvest-api-vpa
  namespace: firecrawl-clone
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webharvest-api
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: webharvest-api
      minAllowed:
        cpu: 500m
        memory: 1Gi
      maxAllowed:
        cpu: 4
        memory: 8Gi
```

### Performance Tuning

#### Database Optimization
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

SELECT pg_reload_conf();
```

#### Redis Optimization
```ini
# config/redis/redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 0
tcp-backlog 511
databases 16
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes
stop-writes-on-bgsave-error yes
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes
replica-lazy-flush yes
```

## 🔧 Troubleshooting

### Common Issues

#### Pod Startup Issues
```bash
# Debug pod startup
kubectl describe pod <pod-name> -n firecrawl-clone
kubectl logs <pod-name> -n firecrawl-clone --previous

# Check events
kubectl get events -n firecrawl-clone --sort-by=.metadata.creationTimestamp

# Debug networking
kubectl exec -it <pod-name> -n firecrawl-clone -- nslookup postgres-service
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it deployment/postgres -n firecrawl-clone -- \
  psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;"

# Check database logs
kubectl logs deployment/postgres -n firecrawl-clone

# Monitor connections
kubectl exec -it deployment/postgres -n firecrawl-clone -- \
  psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
  "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
```

#### Performance Issues
```bash
# Check resource usage
kubectl top pods -n firecrawl-clone
kubectl top nodes

# Monitor application metrics
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Debug slow queries
kubectl exec -it deployment/postgres -n firecrawl-clone -- \
  psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### Emergency Procedures

#### Service Recovery
```bash
# Emergency restart of all services
kubectl rollout restart deployment/webharvest-api -n firecrawl-clone
kubectl rollout restart deployment/webclone-pro -n firecrawl-clone

# Scale down to conserve resources
kubectl scale deployment webharvest-api --replicas=1 -n firecrawl-clone

# Emergency database maintenance mode
kubectl patch deployment webharvest-api -p '{"spec":{"replicas":0}}' -n firecrawl-clone
```

#### Data Recovery
```bash
# Restore from latest backup
./scripts/emergency-restore.sh latest

# Point-in-time recovery
./scripts/point-in-time-restore.sh "2024-12-27 10:30:00"

# Manual data export
kubectl exec -it deployment/postgres -n firecrawl-clone -- \
  pg_dump -U $POSTGRES_USER -d $POSTGRES_DB -t critical_table > emergency_backup.sql
```

---

## 🎉 Deployment Complete!

Congratulations! You now have a production-ready deployment of the Firecrawl-Clone platform. 

### Next Steps

1. **Monitor Performance**: Use Grafana dashboards to monitor system health
2. **Setup Alerts**: Configure alerting for critical issues
3. **Test Backups**: Verify your backup and recovery procedures
4. **Security Audit**: Run security scans and penetration tests
5. **Load Testing**: Perform load testing to validate performance

### Getting Help

- 📚 **Documentation**: [Architecture Diagrams](./architecture-diagrams/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/firecrawl-clone/issues)
- 💬 **Community**: [Discord Server](https://discord.gg/firecrawl-clone)
- 🆘 **Support**: [Enterprise Support](mailto:support@firecrawl-clone.com)

---

**Production deployment successful!** 🚀

*This deployment guide is continuously updated. Please contribute improvements and report issues.*