# API Integration Guide - Firecrawl-Clone Platform

[![API](https://img.shields.io/badge/API-v2.0-blue.svg)](https://api.yourdomain.com/docs)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](./webharvest-openapi-spec.yaml)
[![Postman](https://img.shields.io/badge/Postman-Collection-orange.svg)](./webharvest-postman-collection.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **🔗 Complete integration guide for WebHarvest and WebClone Pro APIs** - Build powerful applications with our comprehensive REST APIs, webhooks, and real-time features.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [WebHarvest API](#webharvest-api)
- [WebClone Pro API](#webclone-pro-api)
- [Cross-Platform Integration](#cross-platform-integration)
- [Real-Time Features](#real-time-features)
- [Webhooks and Events](#webhooks-and-events)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [SDKs and Libraries](#sdks-and-libraries)
- [Best Practices](#best-practices)
- [Examples and Use Cases](#examples-and-use-cases)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Firecrawl-Clone platform provides two complementary APIs that work seamlessly together to create powerful web intelligence applications:

### API Ecosystem

```mermaid
graph TB
    subgraph "Client Applications"
        WEB[Web Applications]
        MOBILE[Mobile Apps]
        CLI[CLI Tools]
        SCRIPTS[Automation Scripts]
    end
    
    subgraph "API Gateway Layer"
        NGINX[Nginx Load Balancer]
        AUTH[Authentication Layer]
        RATE[Rate Limiting]
    end
    
    subgraph "Core APIs"
        WH_API[WebHarvest API<br/>Port 8000]
        WCP_API[WebClone Pro API<br/>Port 3000/api]
    end
    
    subgraph "Real-Time Features"
        WS[WebSocket Connections]
        HOOKS[Webhook Delivery]
        EVENTS[Server-Sent Events]
    end
    
    subgraph "External Services"
        OPENAI[OpenAI API]
        STRIPE[Stripe API]
        SUPABASE[Supabase API]
    end
    
    WEB --> NGINX
    MOBILE --> NGINX
    CLI --> NGINX
    SCRIPTS --> NGINX
    
    NGINX --> AUTH
    AUTH --> RATE
    
    RATE --> WH_API
    RATE --> WCP_API
    
    WH_API --> WS
    WCP_API --> WS
    WCP_API --> HOOKS
    WH_API --> EVENTS
    
    WCP_API --> OPENAI
    WCP_API --> STRIPE
    WCP_API --> SUPABASE
```

### Core Capabilities

| Feature | WebHarvest API | WebClone Pro API |
|---------|----------------|------------------|
| **Web Scraping** | ✅ Full scraping engine | ✅ Via WebHarvest integration |
| **Content Processing** | ✅ Multiple formats | ✅ AI enhancement |
| **User Management** | ✅ API key authentication | ✅ Full user system |
| **Real-Time Updates** | ✅ SSE and WebSocket | ✅ Collaboration features |
| **AI Integration** | ✅ MCP protocol | ✅ Native AI features |
| **File Processing** | ✅ Document extraction | ✅ Advanced PDF processing |

## 🔐 Authentication

### Authentication Methods

#### 1. WebHarvest API Key Authentication
```http
GET /v2/scrape HTTP/1.1
Host: api.yourdomain.com
Authorization: Bearer wh_1234567890abcdef
Content-Type: application/json
```

#### 2. WebClone Pro JWT Authentication
```http
POST /api/projects HTTP/1.1
Host: app.yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### 3. OAuth 2.0 (WebClone Pro)
```http
GET /api/auth/google HTTP/1.1
Host: app.yourdomain.com

# Callback
GET /api/auth/callback/google?code=...&state=... HTTP/1.1
Host: app.yourdomain.com
```

### API Key Management

#### Generate WebHarvest API Key
```bash
curl -X POST "https://api.yourdomain.com/v2/auth/api-keys" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Integration",
    "permissions": ["scrape", "crawl", "batch"],
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

```json
{
  "id": "ak_1234567890abcdef",
  "name": "Production Integration",
  "key": "wh_1234567890abcdef1234567890abcdef",
  "permissions": ["scrape", "crawl", "batch"],
  "createdAt": "2024-12-27T10:00:00Z",
  "expiresAt": "2025-12-31T23:59:59Z",
  "lastUsed": null
}
```

#### Rotate API Keys
```bash
curl -X POST "https://api.yourdomain.com/v2/auth/api-keys/ak_1234567890abcdef/rotate" \
  -H "Authorization: Bearer your-jwt-token"
```

### JWT Token Management

#### Login and Get JWT Token
```bash
curl -X POST "https://app.yourdomain.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-12-28T10:00:00Z"
  }
}
```

#### Refresh JWT Token
```bash
curl -X POST "https://app.yourdomain.com/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## 🕷️ WebHarvest API

### Core Scraping Operations

#### Single URL Scraping
```bash
curl -X POST "https://api.yourdomain.com/v2/scrape" \
  -H "Authorization: Bearer wh_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html", "links"],
    "onlyMainContent": true,
    "includeMetadata": true,
    "waitFor": 2000,
    "headers": {
      "User-Agent": "MyApp/1.0"
    }
  }'
```

#### Response Structure
```json
{
  "success": true,
  "data": {
    "markdown": "# Page Title\n\nPage content...",
    "html": "<article>Page content...</article>",
    "links": [
      {
        "url": "https://example.com/page1",
        "text": "Page 1",
        "type": "internal"
      }
    ],
    "metadata": {
      "title": "Page Title",
      "description": "Page description",
      "keywords": ["keyword1", "keyword2"],
      "author": "John Doe",
      "publishedAt": "2024-12-27T10:00:00Z",
      "lang": "en",
      "charset": "UTF-8"
    },
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "alt": "Image description",
        "width": 800,
        "height": 600
      }
    ]
  },
  "requestId": "req_123456789",
  "timestamp": "2024-12-27T10:30:00Z",
  "processingTime": 2.34
}
```

### Website Crawling

#### Start Crawl Job
```bash
curl -X POST "https://api.yourdomain.com/v2/crawl" \
  -H "Authorization: Bearer wh_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "limit": 500,
    "maxDepth": 5,
    "includePaths": ["^/docs/.*", "^/api/.*"],
    "excludePaths": ["/internal/.*", ".*\\.(jpg|png|gif)$"],
    "allowSubdomains": false,
    "allowExternalLinks": false,
    "respectRobotsTxt": true,
    "delayMs": 500,
    "scrapeOptions": {
      "formats": ["markdown"],
      "onlyMainContent": true,
      "includeMetadata": true
    },
    "webhook": {
      "url": "https://your-app.com/webhooks/crawl-complete",
      "secret": "your-webhook-secret"
    }
  }'
```

#### Crawl Response
```json
{
  "success": true,
  "data": {
    "id": "crawl_123456789",
    "status": "started",
    "url": "https://docs.example.com",
    "estimatedPages": 250,
    "estimatedDuration": 300,
    "queuePosition": 1,
    "createdAt": "2024-12-27T10:30:00Z",
    "startedAt": null,
    "completedAt": null
  }
}
```

#### Monitor Crawl Progress
```bash
curl -X GET "https://api.yourdomain.com/v2/crawl/crawl_123456789" \
  -H "Authorization: Bearer wh_your_api_key"
```

```json
{
  "success": true,
  "data": {
    "id": "crawl_123456789",
    "status": "processing",
    "url": "https://docs.example.com",
    "progress": {
      "pagesDiscovered": 324,
      "pagesProcessed": 156,
      "pagesSuccessful": 152,
      "pagesFailed": 4,
      "percentage": 48.1,
      "currentUrl": "https://docs.example.com/api/authentication"
    },
    "estimatedCompletion": "2024-12-27T10:40:00Z",
    "stats": {
      "avgProcessingTime": 1.8,
      "totalDataSize": 5242880,
      "errorRate": 2.56
    },
    "logs": [
      {
        "timestamp": "2024-12-27T10:32:00Z",
        "level": "info",
        "message": "Processing page: https://docs.example.com/getting-started",
        "metadata": {
          "statusCode": 200,
          "contentLength": 15420
        }
      }
    ]
  }
}
```

### Site Mapping

#### Fast URL Discovery
```bash
curl -X POST "https://api.yourdomain.com/v2/map" \
  -H "Authorization: Bearer wh_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "limit": 1000,
    "includeSubdomains": false,
    "includePaths": [".*"],
    "excludePaths": ["\\.pdf$", "\\.jpg$"],
    "search": "documentation"
  }'
```

#### Mapping Response
```json
{
  "success": true,
  "data": {
    "urls": [
      {
        "url": "https://example.com",
        "title": "Homepage",
        "statusCode": 200,
        "lastModified": "2024-12-26T14:30:00Z",
        "contentType": "text/html",
        "size": 45232,
        "depth": 0
      },
      {
        "url": "https://example.com/docs",
        "title": "Documentation",
        "statusCode": 200,
        "lastModified": "2024-12-25T09:15:00Z",
        "contentType": "text/html",
        "size": 32150,
        "depth": 1
      }
    ],
    "stats": {
      "totalUrls": 324,
      "uniqueUrls": 298,
      "duplicateUrls": 26,
      "errorUrls": 5,
      "totalSize": 15728640
    },
    "metadata": {
      "discoveredAt": "2024-12-27T10:30:00Z",
      "processingTime": 12.5
    }
  }
}
```

### Batch Processing

#### Batch Scrape Multiple URLs
```bash
curl -X POST "https://api.yourdomain.com/v2/batch/scrape" \
  -H "Authorization: Bearer wh_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com/page1",
      "https://example.com/page2",
      "https://example.com/page3"
    ],
    "scrapeOptions": {
      "formats": ["markdown", "metadata"],
      "onlyMainContent": true
    },
    "concurrency": 3,
    "webhook": {
      "url": "https://your-app.com/webhooks/batch-complete",
      "secret": "your-webhook-secret"
    }
  }'
```

#### Check Batch Status
```bash
curl -X GET "https://api.yourdomain.com/v2/batch/scrape/batch_123456789" \
  -H "Authorization: Bearer wh_your_api_key"
```

### MCP (Model Context Protocol) Integration

#### MCP Server Information
```bash
curl -X GET "https://api.yourdomain.com/mcp" \
  -H "Authorization: Bearer wh_your_api_key"
```

```json
{
  "protocol": "mcp",
  "version": "1.0.0",
  "implementation": "webharvest-mcp-server",
  "tools": [
    {
      "name": "scrape_url",
      "description": "Scrape content from a single URL",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {"type": "string", "format": "uri"},
          "formats": {"type": "array", "items": {"type": "string"}}
        }
      }
    },
    {
      "name": "crawl_site",
      "description": "Crawl an entire website",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {"type": "string", "format": "uri"},
          "limit": {"type": "integer", "minimum": 1, "maximum": 10000}
        }
      }
    }
  ],
  "resources": [
    {
      "name": "crawl_results",
      "description": "Access crawl job results",
      "mimeType": "application/json"
    }
  ]
}
```

#### Make MCP Tool Call
```bash
curl -X POST "https://api.yourdomain.com/mcp" \
  -H "Authorization: Bearer wh_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "scrape_url",
      "arguments": {
        "url": "https://example.com",
        "formats": ["markdown"]
      }
    }
  }'
```

## 🎨 WebClone Pro API

### Authentication and User Management

#### User Registration
```bash
curl -X POST "https://app.yourdomain.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Example Corp"
  }'
```

#### Get User Profile
```bash
curl -X GET "https://app.yourdomain.com/api/user/profile" \
  -H "Authorization: Bearer your-jwt-token"
```

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "Example Corp",
    "plan": "pro",
    "credits": 4850,
    "usage": {
      "thisMonth": {
        "projects": 15,
        "credits": 1150,
        "aiRequests": 340
      }
    },
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": false
      }
    },
    "createdAt": "2024-11-15T09:30:00Z",
    "lastLoginAt": "2024-12-27T08:45:00Z"
  }
}
```

### Project Management

#### List Projects
```bash
curl -X GET "https://app.yourdomain.com/api/projects?page=1&limit=20&status=active&search=website" \
  -H "Authorization: Bearer your-jwt-token"
```

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_123",
        "name": "Company Website Clone",
        "url": "https://company.com",
        "status": "completed",
        "framework": "react",
        "progress": 100,
        "createdAt": "2024-12-25T10:00:00Z",
        "updatedAt": "2024-12-25T10:30:00Z",
        "preview": "https://preview.webclonepro.com/proj_123",
        "stats": {
          "pages": 24,
          "components": 45,
          "assets": 128,
          "size": "2.4MB"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

#### Create New Project
```bash
curl -X POST "https://app.yourdomain.com/api/projects" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce Site Clone",
    "url": "https://shop.example.com",
    "framework": "next.js",
    "options": {
      "captureAnimations": true,
      "optimizeImages": true,
      "extractComponents": true,
      "responsive": true,
      "darkMode": true,
      "accessibility": true
    },
    "crawlOptions": {
      "depth": 3,
      "pages": ["https://shop.example.com", "https://shop.example.com/products"],
      "excludePatterns": ["/admin/*", "/api/*"],
      "includePaths": ["/products/*", "/categories/*"]
    },
    "aiSettings": {
      "model": "gpt-4-turbo",
      "creativity": 0.7,
      "optimization": "cost",
      "customInstructions": "Focus on e-commerce best practices and conversion optimization"
    }
  }'
```

```json
{
  "success": true,
  "data": {
    "id": "proj_456",
    "status": "queued",
    "estimatedTime": 300,
    "queuePosition": 2,
    "creditsCost": 150,
    "websocketUrl": "wss://app.yourdomain.com/ws/projects/proj_456"
  }
}
```

### Cloning Operations

#### Start Cloning Process
```bash
curl -X POST "https://app.yourdomain.com/api/clone" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_123",
    "options": {
      "depth": 3,
      "pages": ["https://example.com", "https://example.com/about"],
      "excludePatterns": ["/admin/*", "/private/*"],
      "captureScreenshots": true,
      "extractAnimations": true,
      "optimizeCode": true,
      "generateTests": true
    },
    "aiInstructions": "Make the design more modern and add accessibility features"
  }'
```

#### Monitor Clone Progress
```bash
curl -X GET "https://app.yourdomain.com/api/clone/clone_789/status" \
  -H "Authorization: Bearer your-jwt-token"
```

```json
{
  "success": true,
  "data": {
    "id": "clone_789",
    "projectId": "proj_123",
    "status": "processing",
    "progress": {
      "current": 7,
      "total": 12,
      "percentage": 58,
      "currentTask": "Extracting components from homepage",
      "phases": {
        "crawling": "completed",
        "analysis": "completed",
        "extraction": "in_progress",
        "optimization": "pending",
        "generation": "pending"
      }
    },
    "startedAt": "2024-12-27T10:00:00Z",
    "estimatedCompletion": "2024-12-27T10:05:00Z",
    "stats": {
      "pagesProcessed": 7,
      "componentsExtracted": 23,
      "assetsOptimized": 45,
      "codeGenerated": "65%"
    },
    "logs": [
      {
        "timestamp": "2024-12-27T10:02:30Z",
        "level": "info",
        "phase": "extraction",
        "message": "Successfully extracted header component",
        "metadata": {
          "componentType": "header",
          "complexity": "medium",
          "props": 8
        }
      }
    ]
  }
}
```

### AI Features

#### Chat with AI Assistant
```bash
curl -X POST "https://app.yourdomain.com/api/ai/chat" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_123",
    "message": "Can you make the navigation more mobile-friendly and add a search feature?",
    "context": {
      "component": "navigation",
      "currentCode": "...",
      "preferences": {
        "framework": "react",
        "styling": "tailwindcss"
      }
    },
    "model": "gpt-4-turbo",
    "stream": false
  }'
```

```json
{
  "success": true,
  "data": {
    "response": "I'll help you make the navigation more mobile-friendly and add a search feature. Here are the improvements I recommend:\n\n1. **Mobile-First Responsive Design**...",
    "suggestions": [
      {
        "type": "component_update",
        "component": "Navigation",
        "changes": ["responsive design", "mobile hamburger menu", "search integration"],
        "code": "// Updated Navigation component\nimport { useState } from 'react';\n...",
        "preview": "https://preview.webclonepro.com/proj_123/nav-preview"
      }
    ],
    "creditsUsed": 15,
    "model": "gpt-4-turbo",
    "timestamp": "2024-12-27T10:30:00Z"
  }
}
```

#### Generate Component Variations
```bash
curl -X POST "https://app.yourdomain.com/api/ai/generate-variations" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_123",
    "componentId": "comp_456",
    "variations": 3,
    "style": "modern",
    "constraints": {
      "colorScheme": "preserve",
      "layout": "flexible",
      "accessibility": "improve"
    }
  }'
```

### Document Processing (PDF)

#### Upload and Process PDF
```bash
curl -X POST "https://app.yourdomain.com/api/documents/upload" \
  -H "Authorization: Bearer your-jwt-token" \
  -F "file=@document.pdf" \
  -F "options={\"extractImages\":true,\"generateSummary\":true,\"enableChat\":true}"
```

```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "fileName": "document.pdf",
    "fileSize": 2048576,
    "pages": 15,
    "status": "processing",
    "processingOptions": {
      "extractImages": true,
      "generateSummary": true,
      "enableChat": true,
      "language": "auto"
    },
    "estimatedCompletion": "2024-12-27T10:35:00Z",
    "uploadedAt": "2024-12-27T10:30:00Z"
  }
}
```

#### Query Document with AI
```bash
curl -X POST "https://app.yourdomain.com/api/documents/doc_123/query" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the main security recommendations mentioned in this document?",
    "context": {
      "includePageNumbers": true,
      "includeImages": false,
      "maxResults": 10
    }
  }'
```

```json
{
  "success": true,
  "data": {
    "answer": "Based on the document, here are the main security recommendations:\n\n1. **Authentication and Authorization** (Pages 5-7)...",
    "sources": [
      {
        "page": 5,
        "text": "Implement multi-factor authentication for all user accounts...",
        "confidence": 0.95,
        "relevance": 0.88
      }
    ],
    "relatedQuestions": [
      "What specific authentication methods are recommended?",
      "How should API security be implemented?"
    ],
    "creditsUsed": 8,
    "processingTime": 1.23
  }
}
```

### Export and Deployment

#### Export Project
```bash
curl -X POST "https://app.yourdomain.com/api/projects/proj_123/export" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "zip",
    "framework": "next.js",
    "options": {
      "includeAssets": true,
      "optimizeImages": true,
      "minifyCode": true,
      "includeReadme": true,
      "includeTests": true,
      "includeDocs": true
    },
    "customizations": {
      "packageName": "my-cloned-website",
      "description": "Cloned website with AI enhancements",
      "author": "John Doe"
    }
  }'
```

```json
{
  "success": true,
  "data": {
    "exportId": "export_456",
    "status": "processing",
    "downloadUrl": null,
    "estimatedCompletion": "2024-12-27T10:35:00Z",
    "options": {
      "format": "zip",
      "framework": "next.js",
      "size": "estimated 15MB"
    }
  }
}
```

#### Deploy to Platform
```bash
curl -X POST "https://app.yourdomain.com/api/projects/proj_123/deploy" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "vercel",
    "config": {
      "projectName": "my-cloned-website",
      "domain": "my-website.vercel.app",
      "environment": {
        "NODE_ENV": "production",
        "API_URL": "https://api.mywebsite.com"
      },
      "buildCommand": "npm run build",
      "outputDirectory": "dist"
    },
    "git": {
      "repository": "https://github.com/user/my-cloned-website",
      "branch": "main",
      "autoCommit": true,
      "commitMessage": "Deploy cloned website"
    }
  }'
```

### Collaboration Features

#### Get Project Collaborators
```bash
curl -X GET "https://app.yourdomain.com/api/projects/proj_123/collaborators" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Invite Collaborator
```bash
curl -X POST "https://app.yourdomain.com/api/projects/proj_123/collaborators" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "colleague@example.com",
    "role": "editor",
    "permissions": ["view", "edit", "comment"],
    "message": "Join me to work on this website clone project"
  }'
```

## 🔗 Cross-Platform Integration

### Unified Workflow

#### WebHarvest → WebClone Pro Integration
```bash
# Step 1: Scrape with WebHarvest
curl -X POST "https://api.yourdomain.com/v2/crawl" \
  -H "Authorization: Bearer wh_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://target-website.com",
    "limit": 100,
    "scrapeOptions": {
      "formats": ["markdown", "html", "links", "images"]
    }
  }'

# Step 2: Get crawl results
CRAWL_ID="crawl_123456789"
curl -X GET "https://api.yourdomain.com/v2/crawl/$CRAWL_ID" \
  -H "Authorization: Bearer wh_your_api_key"

# Step 3: Create WebClone Pro project with results
curl -X POST "https://app.yourdomain.com/api/projects" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Scraped Website Clone",
    "webharvest": {
      "crawlId": "'$CRAWL_ID'",
      "useResults": true
    },
    "framework": "react"
  }'
```

### Webhook Integration

#### WebHarvest Webhook → WebClone Pro
```javascript
// webhook-handler.js
const express = require('express');
const app = express();

app.post('/webhooks/crawl-complete', async (req, res) => {
  const { crawlId, status, results } = req.body;
  
  if (status === 'completed') {
    // Automatically create WebClone Pro project
    const response = await fetch('https://app.yourdomain.com/api/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Auto-generated from crawl ${crawlId}`,
        webharvest: {
          crawlId: crawlId,
          useResults: true
        },
        framework: 'react',
        options: {
          captureAnimations: true,
          optimizeImages: true
        }
      })
    });
    
    const project = await response.json();
    console.log(`Created project: ${project.data.id}`);
  }
  
  res.status(200).json({ received: true });
});
```

### Data Synchronization

#### Sync WebHarvest Results to WebClone Pro
```bash
curl -X POST "https://app.yourdomain.com/api/sync/webharvest" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "crawlId": "crawl_123456789",
    "projectId": "proj_123",
    "options": {
      "updateExisting": true,
      "mergeMode": "intelligent",
      "preserveCustomizations": true
    }
  }'
```

## ⚡ Real-Time Features

### WebSocket Connections

#### Connect to Project Updates
```javascript
// project-websocket.js
const ws = new WebSocket('wss://app.yourdomain.com/ws/projects/proj_123', {
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`
  }
});

ws.onopen = () => {
  console.log('Connected to project updates');
  
  // Subscribe to specific events
  ws.send(JSON.stringify({
    type: 'subscribe',
    events: ['clone_progress', 'ai_response', 'collaborator_change']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'clone_progress':
      updateProgressBar(data.progress);
      break;
    case 'ai_response':
      displayAIResponse(data.response);
      break;
    case 'collaborator_change':
      updateCollaboratorList(data.collaborators);
      break;
  }
};
```

#### WebHarvest Crawl Progress via SSE
```javascript
// crawl-progress.js
const eventSource = new EventSource(
  'https://api.yourdomain.com/v2/crawl/crawl_123456789/stream',
  {
    headers: {
      'Authorization': `Bearer wh_your_api_key`
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'progress') {
    document.getElementById('progress').style.width = `${data.percentage}%`;
    document.getElementById('status').textContent = data.currentTask;
  }
  
  if (data.type === 'completed') {
    eventSource.close();
    window.location.href = `/results/${data.crawlId}`;
  }
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

### Collaborative Editing

#### Real-Time Code Collaboration
```javascript
// collaborative-editor.js
class CollaborativeEditor {
  constructor(projectId, token) {
    this.ws = new WebSocket(
      `wss://app.yourdomain.com/ws/editor/${projectId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      switch (type) {
        case 'code_change':
          this.applyRemoteChange(data);
          break;
        case 'cursor_position':
          this.updateCursorPosition(data);
          break;
        case 'user_joined':
          this.addCollaborator(data.user);
          break;
      }
    };
  }
  
  sendChange(change) {
    this.ws.send(JSON.stringify({
      type: 'code_change',
      data: change,
      timestamp: Date.now()
    }));
  }
  
  applyRemoteChange(change) {
    // Apply change to editor without creating conflict
    const operation = this.transformOperation(change);
    this.editor.applyOperation(operation);
  }
}
```

## 🔔 Webhooks and Events

### Webhook Configuration

#### Register Webhook Endpoints
```bash
curl -X POST "https://api.yourdomain.com/v2/webhooks" \
  -H "Authorization: Bearer wh_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/webharvest",
    "events": [
      "crawl.completed",
      "crawl.failed", 
      "batch.completed",
      "rate_limit.exceeded"
    ],
    "secret": "your-webhook-secret",
    "active": true,
    "retry": {
      "attempts": 3,
      "backoff": "exponential"
    }
  }'
```

### Event Types

#### WebHarvest Events
```javascript
// webhook-events.js
const webhookEvents = {
  // Crawl Events
  'crawl.started': {
    crawlId: 'crawl_123',
    url: 'https://example.com',
    timestamp: '2024-12-27T10:30:00Z'
  },
  
  'crawl.progress': {
    crawlId: 'crawl_123',
    pagesProcessed: 150,
    totalPages: 300,
    percentage: 50,
    currentUrl: 'https://example.com/page150'
  },
  
  'crawl.completed': {
    crawlId: 'crawl_123',
    status: 'completed',
    results: {
      totalPages: 300,
      successfulPages: 295,
      failedPages: 5,
      totalSize: '15.2MB',
      processingTime: '5m 23s'
    }
  },
  
  'crawl.failed': {
    crawlId: 'crawl_123',
    error: 'Connection timeout',
    failureReason: 'network_error',
    retryable: true
  }
};
```

#### WebClone Pro Events
```javascript
const webcloneEvents = {
  // Project Events
  'project.created': {
    projectId: 'proj_123',
    userId: 'user_456',
    name: 'New Project'
  },
  
  'project.clone_completed': {
    projectId: 'proj_123',
    cloneId: 'clone_789',
    components: 45,
    pages: 12,
    framework: 'react'
  },
  
  // AI Events
  'ai.response_generated': {
    projectId: 'proj_123',
    messageId: 'msg_789',
    creditsUsed: 15,
    model: 'gpt-4-turbo'
  },
  
  // Collaboration Events
  'collaboration.user_joined': {
    projectId: 'proj_123',
    userId: 'user_789',
    role: 'editor'
  }
};
```

### Webhook Security

#### Verify Webhook Signatures
```javascript
// webhook-verification.js
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  const actualSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(actualSignature, 'hex')
  );
}

// Express.js middleware
function webhookAuth(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}
```

## ❌ Error Handling

### Error Response Format

#### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid URL format provided",
    "details": {
      "field": "url",
      "value": "not-a-valid-url",
      "expected": "Valid HTTP/HTTPS URL"
    },
    "timestamp": "2024-12-27T10:30:00Z",
    "requestId": "req_123456789",
    "documentation": "https://docs.firecrawl-clone.com/errors#validation-error"
  }
}
```

### Error Codes Reference

#### WebHarvest Error Codes
| Code | HTTP Status | Description | Retry |
|------|-------------|-------------|-------|
| `INVALID_URL` | 400 | Invalid or malformed URL | No |
| `RATE_LIMIT_EXCEEDED` | 429 | API rate limit exceeded | Yes |
| `CRAWL_TIMEOUT` | 408 | Crawl operation timed out | Yes |
| `SITE_UNREACHABLE` | 502 | Target website unreachable | Yes |
| `AUTHENTICATION_FAILED` | 401 | Invalid API key | No |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits available | No |
| `CRAWL_LIMIT_EXCEEDED` | 400 | Too many pages requested | No |

#### WebClone Pro Error Codes
| Code | HTTP Status | Description | Retry |
|------|-------------|-------------|-------|
| `PROJECT_NOT_FOUND` | 404 | Project does not exist | No |
| `CLONE_IN_PROGRESS` | 409 | Clone operation already running | No |
| `AI_SERVICE_UNAVAILABLE` | 503 | AI service temporarily unavailable | Yes |
| `EXPORT_FAILED` | 500 | Project export failed | Yes |
| `COLLABORATION_LIMIT` | 400 | Too many collaborators | No |

### Error Handling Best Practices

#### Implementing Retry Logic
```javascript
// retry-handler.js
class APIClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.maxRetries = 3;
  }
  
  async request(endpoint, options = {}, retryCount = 0) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new APIError(data.error, response.status);
      }
      
      return data;
      
    } catch (error) {
      if (this.shouldRetry(error, retryCount)) {
        const delay = this.getRetryDelay(retryCount);
        await this.sleep(delay);
        return this.request(endpoint, options, retryCount + 1);
      }
      
      throw error;
    }
  }
  
  shouldRetry(error, retryCount) {
    if (retryCount >= this.maxRetries) return false;
    
    const retryableCodes = [
      'RATE_LIMIT_EXCEEDED',
      'CRAWL_TIMEOUT', 
      'SITE_UNREACHABLE',
      'AI_SERVICE_UNAVAILABLE'
    ];
    
    return retryableCodes.includes(error.code) || 
           error.status >= 500;
  }
  
  getRetryDelay(retryCount) {
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, retryCount) * 1000;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class APIError extends Error {
  constructor(errorData, status) {
    super(errorData.message);
    this.code = errorData.code;
    this.status = status;
    this.details = errorData.details;
  }
}
```

## 🚦 Rate Limiting

### Rate Limit Headers

All API responses include rate limiting information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1703686800
X-RateLimit-Window: 3600
Retry-After: 30
```

### Rate Limit Policies

#### WebHarvest Rate Limits
| Tier | Requests/Hour | Burst Limit | Concurrent Crawls |
|------|---------------|-------------|-------------------|
| **Free** | 100 | 10 | 1 |
| **Pro** | 1,000 | 50 | 3 |
| **Enterprise** | 10,000 | 200 | 10 |

#### WebClone Pro Rate Limits
| Tier | AI Requests/Hour | Projects/Day | Collaborators |
|------|------------------|--------------|---------------|
| **Free** | 50 | 5 | 2 |
| **Pro** | 500 | 50 | 10 |
| **Enterprise** | 2,000 | 200 | Unlimited |

### Handling Rate Limits

#### Rate Limit Detection and Backoff
```javascript
// rate-limit-handler.js
class RateLimitHandler {
  async handleRateLimit(response) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      
      if (retryAfter) {
        console.log(`Rate limited. Waiting ${retryAfter} seconds...`);
        await this.sleep(parseInt(retryAfter) * 1000);
        return true; // Indicate retry is needed
      }
      
      if (resetTime) {
        const waitTime = (parseInt(resetTime) * 1000) - Date.now();
        if (waitTime > 0) {
          console.log(`Rate limited. Waiting until ${new Date(resetTime * 1000)}...`);
          await this.sleep(waitTime);
          return true;
        }
      }
    }
    
    return false; // No rate limit or no retry needed
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 📚 SDKs and Libraries

### Official SDK Libraries

#### JavaScript/TypeScript SDK
```bash
npm install @firecrawl-clone/sdk
```

```typescript
// sdk-example.ts
import { WebHarvestClient, WebCloneProClient } from '@firecrawl-clone/sdk';

// WebHarvest client
const webHarvest = new WebHarvestClient({
  apiKey: 'wh_your_api_key',
  baseUrl: 'https://api.yourdomain.com'
});

// Scrape single URL
const scrapeResult = await webHarvest.scrape({
  url: 'https://example.com',
  formats: ['markdown', 'links']
});

// Start crawl
const crawl = await webHarvest.crawl({
  url: 'https://docs.example.com',
  limit: 100,
  onProgress: (progress) => {
    console.log(`Progress: ${progress.percentage}%`);
  }
});

// WebClone Pro client
const webClone = new WebCloneProClient({
  token: 'your-jwt-token',
  baseUrl: 'https://app.yourdomain.com'
});

// Create project
const project = await webClone.createProject({
  name: 'My Website Clone',
  url: 'https://target-site.com',
  framework: 'react'
});

// Monitor clone progress
webClone.onCloneProgress(project.id, (progress) => {
  console.log(`Clone progress: ${progress.percentage}%`);
});
```

#### Python SDK
```bash
pip install firecrawl-clone-sdk
```

```python
# sdk-example.py
from firecrawl_clone import WebHarvestClient, WebCloneProClient

# WebHarvest client
client = WebHarvestClient(
    api_key="wh_your_api_key",
    base_url="https://api.yourdomain.com"
)

# Scrape single URL
result = client.scrape(
    url="https://example.com",
    formats=["markdown", "links"]
)
print(f"Scraped content: {result.data.markdown}")

# Start crawl with callback
def progress_callback(progress):
    print(f"Progress: {progress.percentage}%")

crawl = client.crawl(
    url="https://docs.example.com",
    limit=100,
    on_progress=progress_callback
)

# WebClone Pro client
webclone = WebCloneProClient(
    token="your-jwt-token",
    base_url="https://app.yourdomain.com"
)

# Create project
project = webclone.create_project(
    name="My Website Clone",
    url="https://target-site.com",
    framework="react",
    options={
        "capture_animations": True,
        "optimize_images": True
    }
)

# Chat with AI
response = webclone.chat(
    project_id=project.id,
    message="Make the navigation more modern"
)
print(f"AI response: {response.data.response}")
```

### Community SDKs

#### Go SDK
```go
// main.go
package main

import (
    "context"
    "fmt"
    "github.com/firecrawl-clone/go-sdk"
)

func main() {
    client := firecrawlsdk.NewWebHarvestClient("wh_your_api_key")
    
    result, err := client.Scrape(context.Background(), &firecrawlsdk.ScrapeRequest{
        URL: "https://example.com",
        Formats: []string{"markdown", "links"},
    })
    
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Scraped content: %s\n", result.Data.Markdown)
}
```

#### Ruby SDK
```ruby
# example.rb
require 'firecrawl_clone'

client = FirecrawlClone::WebHarvestClient.new(
  api_key: 'wh_your_api_key',
  base_url: 'https://api.yourdomain.com'
)

result = client.scrape(
  url: 'https://example.com',
  formats: ['markdown', 'links']
)

puts "Scraped content: #{result.data.markdown}"
```

## 🎯 Best Practices

### API Design Patterns

#### Idempotent Operations
```javascript
// Use idempotency keys for operations that should not be repeated
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': generateUUID() // Ensure unique for each logical operation
  },
  body: JSON.stringify(projectData)
});
```

#### Pagination Best Practices
```javascript
// Implement cursor-based pagination for large datasets
async function getAllProjects() {
  let allProjects = [];
  let cursor = null;
  
  do {
    const response = await fetch(`/api/projects?limit=100${cursor ? `&cursor=${cursor}` : ''}`);
    const data = await response.json();
    
    allProjects = allProjects.concat(data.data.projects);
    cursor = data.data.nextCursor;
  } while (cursor);
  
  return allProjects;
}
```

#### Efficient Bulk Operations
```javascript
// Use batch endpoints for bulk operations
const batchResult = await fetch('/api/batch/scrape', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    urls: urls.slice(0, 100), // Process in batches of 100
    scrapeOptions: {
      formats: ['markdown'],
      onlyMainContent: true
    },
    concurrency: 5 // Limit concurrent operations
  })
});
```

### Performance Optimization

#### Caching Strategies
```javascript
// Implement intelligent caching
class APICache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }
  
  getCacheKey(endpoint, params) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }
  
  get(endpoint, params) {
    const key = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    return null;
  }
  
  set(endpoint, params, data) {
    const key = this.getCacheKey(endpoint, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

#### Connection Pooling
```javascript
// Use connection pooling for better performance
const { Agent } = require('https');

const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 10,
  timeout: 30000
});

const apiClient = axios.create({
  httpsAgent,
  timeout: 30000
});
```

### Security Best Practices

#### Secure Token Storage
```javascript
// Securely store and manage tokens
class TokenManager {
  constructor() {
    this.tokenKey = 'firecrawl_token';
    this.refreshKey = 'firecrawl_refresh';
  }
  
  storeTokens(accessToken, refreshToken) {
    // In browser: use secure httpOnly cookies
    // In Node.js: use encrypted storage
    if (typeof window !== 'undefined') {
      // Browser environment - use secure cookies
      document.cookie = `${this.tokenKey}=${accessToken}; Secure; HttpOnly; SameSite=Strict`;
    } else {
      // Node.js environment - use environment variables or secure storage
      process.env.FIRECRAWL_ACCESS_TOKEN = accessToken;
    }
  }
  
  getToken() {
    if (typeof window !== 'undefined') {
      return this.getCookieValue(this.tokenKey);
    } else {
      return process.env.FIRECRAWL_ACCESS_TOKEN;
    }
  }
  
  getCookieValue(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }
}
```

#### Input Validation
```javascript
// Validate all inputs before sending to API
class InputValidator {
  static validateUrl(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  
  static validateScrapeOptions(options) {
    const validFormats = ['markdown', 'html', 'links', 'images', 'screenshot'];
    
    if (options.formats) {
      return options.formats.every(format => validFormats.includes(format));
    }
    
    return true;
  }
  
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove potentially dangerous characters
      return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                  .replace(/javascript:/gi, '')
                  .trim();
    }
    
    return input;
  }
}
```

## 💡 Examples and Use Cases

### Complete Integration Examples

#### E-commerce Site Analysis
```javascript
// ecommerce-analyzer.js
class EcommerceAnalyzer {
  constructor(webharvestKey, webcloneToken) {
    this.webharvest = new WebHarvestClient({ apiKey: webharvestKey });
    this.webclone = new WebCloneProClient({ token: webcloneToken });
  }
  
  async analyzeCompetitor(competitorUrl) {
    console.log('🔍 Starting competitor analysis...');
    
    // Step 1: Crawl competitor site
    const crawl = await this.webharvest.crawl({
      url: competitorUrl,
      limit: 200,
      includePaths: ['/product/', '/category/', '/'],
      excludePaths: ['/admin/', '/checkout/', '/account/'],
      scrapeOptions: {
        formats: ['markdown', 'links', 'images'],
        includeMetadata: true
      }
    });
    
    console.log(`📊 Crawl started: ${crawl.id}`);
    
    // Step 2: Wait for crawl completion
    await this.waitForCrawlCompletion(crawl.id);
    
    // Step 3: Create analysis project
    const project = await this.webclone.createProject({
      name: `${new URL(competitorUrl).hostname} Analysis`,
      webharvest: { crawlId: crawl.id },
      framework: 'react',
      options: {
        captureAnimations: true,
        extractComponents: true,
        analyzePatterns: true
      }
    });
    
    // Step 4: AI-powered analysis
    const insights = await this.webclone.chat({
      projectId: project.id,
      message: `Analyze this e-commerce site and provide insights on:
        1. Product page layout and conversion optimization
        2. Navigation patterns and user experience
        3. Visual design trends and branding
        4. Performance optimization opportunities
        
        Focus on actionable recommendations for improving our own site.`
    });
    
    console.log('🤖 AI Analysis Complete:', insights.response);
    
    return {
      crawlResults: await this.webharvest.getCrawlResults(crawl.id),
      projectId: project.id,
      insights: insights.response,
      recommendations: this.extractRecommendations(insights.response)
    };
  }
  
  async waitForCrawlCompletion(crawlId) {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        const status = await this.webharvest.getCrawlStatus(crawlId);
        
        if (status.status === 'completed') {
          resolve(status);
        } else if (status.status === 'failed') {
          reject(new Error('Crawl failed'));
        } else {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        }
      };
      
      checkStatus();
    });
  }
  
  extractRecommendations(aiResponse) {
    // Parse AI response to extract actionable recommendations
    const recommendations = [];
    const lines = aiResponse.split('\n');
    
    for (const line of lines) {
      if (line.includes('recommendation') || line.includes('improve')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations;
  }
}

// Usage
const analyzer = new EcommerceAnalyzer('wh_your_key', 'your_jwt_token');
const analysis = await analyzer.analyzeCompetitor('https://competitor.com');
console.log('Analysis complete:', analysis);
```

#### Documentation Site Migration
```javascript
// docs-migrator.js
class DocumentationMigrator {
  async migrateDocs(sourceUrl, targetFramework = 'next.js') {
    // Step 1: Comprehensive crawl of documentation
    const crawl = await this.webharvest.crawl({
      url: sourceUrl,
      limit: 1000,
      maxDepth: 10,
      includePaths: ['/docs/', '/api/', '/guides/'],
      scrapeOptions: {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        preserveCodeBlocks: true
      }
    });
    
    // Step 2: Create migration project
    const project = await this.webclone.createProject({
      name: 'Documentation Migration',
      webharvest: { crawlId: crawl.id },
      framework: targetFramework,
      options: {
        preserveStructure: true,
        optimizeNavigation: true,
        generateSearchIndex: true,
        improveAccessibility: true
      }
    });
    
    // Step 3: AI-enhanced migration
    const enhancement = await this.webclone.chat({
      projectId: project.id,
      message: `Enhance this documentation site with:
        1. Modern, responsive design
        2. Improved navigation with search
        3. Code syntax highlighting
        4. Dark/light theme toggle
        5. Better mobile experience
        6. Accessibility improvements
        
        Maintain all existing content and links.`
    });
    
    // Step 4: Generate and deploy
    const exportResult = await this.webclone.export({
      projectId: project.id,
      format: 'github',
      options: {
        includeCI: true,
        setupVercelDeploy: true,
        generateReadme: true
      }
    });
    
    return {
      originalPages: crawl.stats.totalPages,
      migratedProject: project.id,
      enhancements: enhancement.suggestions,
      deploymentUrl: exportResult.deploymentUrl
    };
  }
}
```

#### Content Monitoring System
```javascript
// content-monitor.js
class ContentMonitor {
  constructor() {
    this.monitoredSites = new Map();
    this.webhooks = new WebhookHandler();
  }
  
  async addSiteMonitoring(url, checkInterval = '1h') {
    // Initial crawl to establish baseline
    const baseline = await this.webharvest.crawl({
      url,
      limit: 50,
      scrapeOptions: {
        formats: ['markdown', 'metadata'],
        generateFingerprint: true
      }
    });
    
    // Store baseline for comparison
    this.monitoredSites.set(url, {
      baselineCrawl: baseline.id,
      lastCheck: Date.now(),
      checkInterval: this.parseInterval(checkInterval)
    });
    
    // Schedule periodic checks
    this.scheduleCheck(url);
    
    return {
      monitorId: baseline.id,
      message: `Monitoring started for ${url}`
    };
  }
  
  async checkForChanges(url) {
    const siteData = this.monitoredSites.get(url);
    
    // Perform new crawl
    const newCrawl = await this.webharvest.crawl({
      url,
      limit: 50,
      scrapeOptions: {
        formats: ['markdown', 'metadata'],
        generateFingerprint: true
      }
    });
    
    // Compare with baseline
    const changes = await this.compareFingerprints(
      siteData.baselineCrawl,
      newCrawl.id
    );
    
    if (changes.hasChanges) {
      await this.handleChangesDetected(url, changes);
    }
    
    // Update monitoring data
    siteData.lastCheck = Date.now();
    this.monitoredSites.set(url, siteData);
    
    return changes;
  }
  
  async compareFingerprints(baselineId, newId) {
    const baseline = await this.webharvest.getCrawlResults(baselineId);
    const newResults = await this.webharvest.getCrawlResults(newId);
    
    const changes = {
      hasChanges: false,
      newPages: [],
      modifiedPages: [],
      deletedPages: [],
      contentChanges: []
    };
    
    // Compare page fingerprints
    for (const page of newResults.pages) {
      const baselinePage = baseline.pages.find(p => p.url === page.url);
      
      if (!baselinePage) {
        changes.newPages.push(page);
        changes.hasChanges = true;
      } else if (page.fingerprint !== baselinePage.fingerprint) {
        changes.modifiedPages.push({
          url: page.url,
          changes: this.detectContentChanges(baselinePage, page)
        });
        changes.hasChanges = true;
      }
    }
    
    return changes;
  }
  
  async handleChangesDetected(url, changes) {
    // Send webhook notification
    await this.webhooks.send('/content-changes', {
      url,
      timestamp: new Date().toISOString(),
      changes: {
        newPages: changes.newPages.length,
        modifiedPages: changes.modifiedPages.length,
        deletedPages: changes.deletedPages.length
      },
      details: changes
    });
    
    // Create analysis report
    const report = await this.webclone.createProject({
      name: `Change Analysis - ${url}`,
      type: 'analysis',
      data: changes
    });
    
    // AI analysis of changes
    const analysis = await this.webclone.chat({
      projectId: report.id,
      message: `Analyze these website changes and provide insights on:
        1. Significance of changes (major/minor/cosmetic)
        2. Potential impact on SEO or user experience
        3. Competitive intelligence implications
        4. Recommendations for response`
    });
    
    console.log(`🔍 Changes detected on ${url}:`, analysis.response);
  }
}
```

### Specialized Use Cases

#### API-First Headless CMS Integration
```javascript
// headless-cms-integration.js
class HeadlessCMSIntegrator {
  async migrateToHeadlessCMS(sourceUrl, cmsType = 'strapi') {
    // Crawl and extract structured content
    const crawl = await this.webharvest.crawl({
      url: sourceUrl,
      scrapeOptions: {
        formats: ['markdown', 'structured'],
        extractSchema: true,
        identifyContentTypes: true
      }
    });
    
    // Analyze content structure
    const analysis = await this.webclone.chat({
      projectId: 'content-analysis',
      message: `Analyze this website's content structure and create a headless CMS schema for ${cmsType}. Include:
        1. Content types (posts, pages, products, etc.)
        2. Field definitions and relationships
        3. Media handling strategy
        4. SEO metadata structure`
    });
    
    // Generate CMS schema and migration scripts
    const migration = await this.generateCMSMigration(crawl, analysis, cmsType);
    
    return migration;
  }
}
```

#### Multi-Language Site Localization
```javascript
// localization-manager.js
class LocalizationManager {
  async analyzeMultiLanguageSite(baseUrl) {
    // Detect language variants
    const mapping = await this.webharvest.map({
      url: baseUrl,
      detectLanguages: true,
      groupByLanguage: true
    });
    
    // Create localization project
    const project = await this.webclone.createProject({
      name: 'Multi-Language Analysis',
      type: 'localization',
      data: mapping
    });
    
    // AI-powered localization recommendations
    const recommendations = await this.webclone.chat({
      projectId: project.id,
      message: `Analyze this multi-language website and provide:
        1. Language detection accuracy
        2. Content synchronization issues
        3. SEO optimization opportunities
        4. Technical implementation recommendations
        5. Missing language variants`
    });
    
    return {
      languages: mapping.languages,
      recommendations: recommendations.response,
      projectId: project.id
    };
  }
}
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Authentication Issues

**Problem: "Invalid API key" errors**
```javascript
// Solution: Verify API key format and permissions
const debugAuth = async (apiKey) => {
  // Check key format
  if (!apiKey.startsWith('wh_')) {
    throw new Error('Invalid API key format. WebHarvest keys should start with "wh_"');
  }
  
  // Test authentication
  try {
    const response = await fetch('https://api.yourdomain.com/v2/auth/verify', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (response.status === 401) {
      throw new Error('API key is invalid or expired');
    }
    
    const result = await response.json();
    console.log('✅ Authentication successful:', result);
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  }
};
```

**Problem: JWT token expiration**
```javascript
// Solution: Implement automatic token refresh
class TokenManager {
  async refreshToken(refreshToken) {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (response.status === 401) {
        // Refresh token is also expired, need to re-authenticate
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      
      const tokens = await response.json();
      this.storeTokens(tokens.accessToken, tokens.refreshToken);
      
      return tokens.accessToken;
    } catch (error) {
      if (error.message === 'REFRESH_TOKEN_EXPIRED') {
        // Redirect to login
        window.location.href = '/auth/login';
      }
      throw error;
    }
  }
}
```

#### API Response Issues

**Problem: Slow API responses**
```javascript
// Solution: Implement request optimization
const optimizeRequests = {
  // Use compression
  headers: {
    'Accept-Encoding': 'gzip, deflate, br'
  },
  
  // Implement request batching
  async batchRequests(requests) {
    const batches = [];
    const batchSize = 10;
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    const results = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(request => this.makeRequest(request))
      );
      results.push(...batchResults);
    }
    
    return results;
  }
};
```

**Problem: Large response payloads**
```javascript
// Solution: Use streaming and pagination
const handleLargeResponses = {
  async streamCrawlResults(crawlId) {
    const response = await fetch(`/v2/crawl/${crawlId}/stream`, {
      headers: { 'Accept': 'text/event-stream' }
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const events = chunk.split('\n').filter(line => line.trim());
      
      for (const event of events) {
        if (event.startsWith('data: ')) {
          const data = JSON.parse(event.slice(6));
          this.processResultChunk(data);
        }
      }
    }
  }
};
```

#### WebSocket Connection Issues

**Problem: WebSocket disconnections**
```javascript
// Solution: Implement reconnection logic
class WebSocketManager {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.connect();
  }
  
  connect() {
    try {
      this.ws = new WebSocket(this.url, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };
      
      this.ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        this.handleDisconnection();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleDisconnection();
    }
  }
  
  handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
      
      // Exponential backoff
      this.reconnectDelay *= 2;
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }
}
```

### Debug Tools and Utilities

#### API Request Logger
```javascript
// debug-logger.js
class APIDebugger {
  constructor() {
    this.logs = [];
    this.enableLogging = process.env.NODE_ENV !== 'production';
  }
  
  logRequest(url, options, startTime) {
    if (!this.enableLogging) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      url,
      method: options.method || 'GET',
      headers: this.sanitizeHeaders(options.headers),
      startTime
    };
    
    this.logs.push(logEntry);
  }
  
  logResponse(logIndex, response, data, endTime) {
    if (!this.enableLogging || !this.logs[logIndex]) return;
    
    const logEntry = this.logs[logIndex];
    logEntry.status = response.status;
    logEntry.statusText = response.statusText;
    logEntry.responseHeaders = Object.fromEntries(response.headers.entries());
    logEntry.responseSize = JSON.stringify(data).length;
    logEntry.duration = endTime - logEntry.startTime;
    
    console.log('📊 API Call:', logEntry);
  }
  
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer ***REDACTED***';
    }
    return sanitized;
  }
  
  exportLogs() {
    return {
      logs: this.logs,
      summary: {
        totalRequests: this.logs.length,
        averageDuration: this.logs.reduce((sum, log) => sum + (log.duration || 0), 0) / this.logs.length,
        errorRate: this.logs.filter(log => log.status >= 400).length / this.logs.length
      }
    };
  }
}
```

#### Health Check Utility
```javascript
// health-checker.js
class HealthChecker {
  async checkSystemHealth() {
    const checks = [
      { name: 'WebHarvest API', check: () => this.checkWebHarvest() },
      { name: 'WebClone Pro API', check: () => this.checkWebClonePro() },
      { name: 'Authentication', check: () => this.checkAuth() },
      { name: 'WebSocket', check: () => this.checkWebSocket() }
    ];
    
    const results = await Promise.allSettled(
      checks.map(async ({ name, check }) => ({
        name,
        result: await check()
      }))
    );
    
    const healthReport = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };
    
    results.forEach((result, index) => {
      const checkName = checks[index].name;
      
      if (result.status === 'fulfilled') {
        healthReport.checks[checkName] = result.value.result;
      } else {
        healthReport.checks[checkName] = {
          status: 'unhealthy',
          error: result.reason.message
        };
        healthReport.overall = 'degraded';
      }
    });
    
    return healthReport;
  }
  
  async checkWebHarvest() {
    const response = await fetch('https://api.yourdomain.com/health');
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: response.headers.get('x-response-time'),
      version: (await response.json()).version
    };
  }
  
  async checkWebClonePro() {
    const response = await fetch('https://app.yourdomain.com/api/health');
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: response.headers.get('x-response-time'),
      version: (await response.json()).version
    };
  }
}
```

---

## 🎉 Integration Complete!

Congratulations! You now have comprehensive knowledge of integrating with the Firecrawl-Clone platform APIs. 

### Next Steps

1. **Start Building**: Use the examples and SDKs to build your integration
2. **Join Community**: Connect with other developers on [Discord](https://discord.gg/firecrawl-clone)
3. **Contribute**: Help improve the APIs and documentation
4. **Stay Updated**: Follow our [changelog](./CHANGELOG.md) for new features

### Resources

- 📚 **Complete API Reference**: [OpenAPI Specification](./webharvest-openapi-spec.yaml)
- 🧪 **Interactive Testing**: [Postman Collection](./webharvest-postman-collection.json)
- 🛠 **Code Examples**: [Integration Examples Repository](https://github.com/your-org/firecrawl-clone-examples)
- 📖 **Tutorials**: [Step-by-step Guides](https://docs.firecrawl-clone.com/tutorials)

### Getting Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-org/firecrawl-clone/issues)
- 💬 **Community Support**: [Discord Server](https://discord.gg/firecrawl-clone)
- 📧 **Enterprise Support**: support@firecrawl-clone.com
- 📞 **Priority Support**: Available for Enterprise customers

---

**Happy integrating!** 🚀

*This integration guide is continuously updated with new features and improvements. Please contribute your feedback and suggestions.*