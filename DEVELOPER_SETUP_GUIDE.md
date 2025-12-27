# Developer Setup Guide - Firecrawl-Clone Platform

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](README.md)
[![Build Status](https://img.shields.io/badge/build-passing-green.svg)](https://github.com/your-org/firecrawl-clone)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289da)](https://discord.gg/firecrawl-clone)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Complete development environment setup for WebHarvest and WebClone Pro** - Get up and running in minutes with our streamlined development workflow.

## Table of Contents

- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Environment Setup](#environment-setup)
- [WebHarvest Development](#webharvest-development)
- [WebClone Pro Development](#webclone-pro-development)
- [Integrated Development](#integrated-development)
- [Testing and Quality](#testing-and-quality)
- [Debugging and Troubleshooting](#debugging-and-troubleshooting)
- [Contributing](#contributing)

## 🚀 Quick Start

Get both systems running in under 5 minutes:

```bash
# Clone the repository
git clone https://github.com/your-org/firecrawl-clone.git
cd firecrawl-clone

# Quick development setup
./scripts/dev-setup.sh

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Verify everything is running
./scripts/health-check.sh
```

**Access Points:**
- WebHarvest API: http://localhost:8000
- WebClone Pro: http://localhost:3000  
- OpenWebUI: http://localhost:8080
- API Documentation: http://localhost:8000/docs

## 💻 System Requirements

### Minimum Requirements
| Component | Requirement | Recommended |
|-----------|-------------|-------------|
| **OS** | macOS 10.15+, Ubuntu 20.04+, Windows 10+ | Latest stable versions |
| **CPU** | 4 cores @ 2.4GHz | 8+ cores @ 3.0GHz+ |
| **RAM** | 16GB | 32GB+ |
| **Storage** | 50GB SSD | 100GB+ NVMe SSD |
| **Network** | Broadband internet | Fiber/high-speed connection |

### Software Dependencies
| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Docker** | 24.0+ | Containerization | [Install Docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** | 2.20+ | Multi-container orchestration | [Install Compose](https://docs.docker.com/compose/install/) |
| **Node.js** | 18.19.0+ | Frontend development | [Install via NVM](https://github.com/nvm-sh/nvm) |
| **Python** | 3.11+ | Backend development | [Install via Pyenv](https://github.com/pyenv/pyenv) |
| **Git** | 2.34+ | Version control | [Install Git](https://git-scm.com/downloads) |

### Optional Tools
| Tool | Purpose | Installation |
|------|---------|--------------|
| **PostgreSQL** | Local database | [Install PostgreSQL](https://postgresql.org/download/) |
| **Redis** | Local caching | [Install Redis](https://redis.io/download/) |
| **kubectl** | Kubernetes management | [Install kubectl](https://kubernetes.io/docs/tasks/tools/) |

## 🛠 Environment Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/firecrawl-clone.git
cd firecrawl-clone

# Make scripts executable
chmod +x scripts/*.sh

# Setup Git hooks
git config core.hooksPath .githooks
chmod +x .githooks/*
```

### 2. Development Tools Installation

#### Node.js Version Management
```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use Node.js
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0

# Verify installation
node --version  # Should show v18.19.0+
npm --version   # Should show 9.0.0+
```

#### Python Version Management
```bash
# Install pyenv
curl https://pyenv.run | bash

# Add to shell profile
echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
source ~/.bashrc

# Install Python
pyenv install 3.11.7
pyenv global 3.11.7

# Verify installation
python --version  # Should show Python 3.11.7+
```

### 3. IDE Configuration

#### Visual Studio Code Setup
```bash
# Install recommended extensions
code --install-extension ms-python.python
code --install-extension ms-python.flake8
code --install-extension ms-python.black-formatter
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next

# Copy workspace settings
cp .vscode/settings.example.json .vscode/settings.json
```

#### VS Code Configuration
```json
// .vscode/settings.json
{
  "python.defaultInterpreterPath": "./webharvest/.venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 4. Environment Variables

#### Global Configuration
```bash
# Copy environment templates
cp .env.example .env

# Edit global settings
nano .env
```

#### Environment Variables Reference
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/firecrawl_dev
REDIS_URL=redis://localhost:6379/0

# API Keys (Development)
OPENAI_API_KEY=sk-your-development-key
ANTHROPIC_API_KEY=sk-ant-your-development-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
API_KEY_SALT=your-api-key-salt

# External Services
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHARVEST_API_URL=http://localhost:8000
```

## 🕷️ WebHarvest Development

### Setup WebHarvest Backend

#### 1. Python Environment
```bash
cd webharvest

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# or .venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install
```

#### 2. Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready
./scripts/wait-for-services.sh

# Run database migrations
alembic upgrade head

# Seed development data
python scripts/seed_data.py
```

#### 3. Environment Configuration
```bash
# Copy WebHarvest environment
cp .env.example .env

# Edit WebHarvest-specific settings
nano .env
```

```env
# WebHarvest API Configuration
WEBHARVEST_HOST=0.0.0.0
WEBHARVEST_PORT=8000
WEBHARVEST_WORKERS=4
DEBUG=true

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/webharvest_dev
REDIS_URL=redis://localhost:6379/0

# Scraping Configuration
MAX_CRAWL_PAGES=1000
MAX_CRAWL_DEPTH=5
DEFAULT_RATE_LIMIT_PER_DOMAIN=2
REQUEST_TIMEOUT=30000

# Authentication
JWT_SECRET=your-webharvest-jwt-secret
API_KEY_SALT=your-api-key-salt
```

#### 4. Start Development Server
```bash
# Start WebHarvest API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use development script
./scripts/dev-server.sh
```

#### 5. Development Workflow
```bash
# Run tests
pytest tests/ -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run linting
flake8 app/
black app/
isort app/

# Run type checking
mypy app/
```

### WebHarvest API Testing
```bash
# Test basic functionality
curl -X GET "http://localhost:8000/health"

# Test scraping
curl -X POST "http://localhost:8000/v2/scrape" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"url": "https://example.com"}'

# Test MCP server
curl -X GET "http://localhost:8000/mcp"
```

## 🎨 WebClone Pro Development

### Setup WebClone Pro Frontend

#### 1. Node.js Environment
```bash
cd webclone-pro

# Install dependencies
npm install

# Install development tools
npm install -g @next/eslint-plugin-next
npm install -g typescript
```

#### 2. Environment Configuration
```bash
# Copy WebClone Pro environment
cp .env.example .env.local

# Edit WebClone Pro settings
nano .env.local
```

```env
# WebClone Pro Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development

# WebHarvest Integration
WEBHARVEST_API_URL=http://localhost:8000
WEBHARVEST_API_KEY=your-webharvest-api-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# AI Services
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# File Storage
NEXT_PUBLIC_STORAGE_BUCKET=your-storage-bucket
```

#### 3. Database Setup
```bash
# Setup Supabase (if using local instance)
npx supabase start
npx supabase db reset

# Or connect to remote Supabase
npx supabase link --project-ref your-project-ref
npx supabase db pull
```

#### 4. Start Development Server
```bash
# Start Next.js development server
npm run dev

# Or with debugging
npm run dev:debug

# Build for production testing
npm run build
npm run start
```

#### 5. Development Workflow
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
```

### WebClone Pro Testing
```bash
# Test application
curl -X GET "http://localhost:3000/api/health"

# Test authentication
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

## 🔄 Integrated Development

### Running Both Systems Together

#### 1. Docker Compose Development
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Scale specific services
docker-compose -f docker-compose.dev.yml up -d --scale webharvest-worker=3

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

#### 2. Development Docker Compose Configuration
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: firecrawl_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_dev_data:/data

  webharvest-api:
    build:
      context: ./webharvest
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      - DEBUG=true
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/firecrawl_dev
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./webharvest:/app
    depends_on:
      - postgres
      - redis
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

  webclone-pro:
    build:
      context: ./webclone-pro
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - WEBHARVEST_API_URL=http://webharvest-api:8000
    volumes:
      - ./webclone-pro:/app
      - /app/node_modules
    depends_on:
      - webharvest-api
    command: npm run dev

volumes:
  postgres_dev_data:
  redis_dev_data:
```

#### 3. Integration Testing
```bash
# Test WebClone Pro -> WebHarvest integration
curl -X POST "http://localhost:3000/api/scrape" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"url": "https://example.com"}'

# Test data flow between systems
./scripts/test-integration.sh
```

### Development Utilities

#### 1. Database Management
```bash
# Reset development databases
./scripts/reset-dev-db.sh

# Backup development data
./scripts/backup-dev-data.sh

# Restore development data
./scripts/restore-dev-data.sh backup-file.sql

# Run migrations
cd webharvest && alembic upgrade head
cd webclone-pro && npx prisma db push
```

#### 2. Code Quality Scripts
```bash
# Run all quality checks
./scripts/quality-check.sh

# Format all code
./scripts/format-all.sh

# Run all tests
./scripts/test-all.sh

# Security scan
./scripts/security-scan.sh
```

#### 3. Development Scripts
```bash
# scripts/dev-setup.sh - Complete development setup
#!/bin/bash
set -e

echo "🚀 Setting up Firecrawl-Clone development environment..."

# Install system dependencies
./scripts/install-deps.sh

# Setup WebHarvest
cd webharvest
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cd ..

# Setup WebClone Pro
cd webclone-pro
npm install
cd ..

# Start databases
docker-compose up -d postgres redis

# Wait for services
./scripts/wait-for-services.sh

# Run migrations
cd webharvest
source .venv/bin/activate
alembic upgrade head
python scripts/seed_data.py
cd ..

cd webclone-pro
npx prisma db push
npx prisma db seed
cd ..

echo "✅ Development environment setup complete!"
echo "🌟 Run 'docker-compose -f docker-compose.dev.yml up -d' to start all services"
```

## 🧪 Testing and Quality

### Test Strategy Overview

```mermaid
graph TB
    A[Code Changes] --> B[Pre-commit Hooks]
    B --> C[Unit Tests]
    C --> D[Integration Tests]
    D --> E[E2E Tests]
    E --> F[Performance Tests]
    F --> G[Security Tests]
    G --> H[Quality Gate]
    H --> I[Deployment Ready]
```

### Unit Testing

#### WebHarvest Unit Tests
```bash
cd webharvest

# Run all unit tests
pytest tests/unit/ -v

# Run specific test files
pytest tests/unit/test_scraper.py -v

# Run with coverage
pytest tests/unit/ --cov=app --cov-report=html

# Run parallel tests
pytest tests/unit/ -n auto
```

#### WebClone Pro Unit Tests
```bash
cd webclone-pro

# Run all unit tests
npm run test

# Run specific test files
npm run test -- ProjectCard.test.tsx

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Testing

#### API Integration Tests
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run WebHarvest integration tests
cd webharvest
pytest tests/integration/ -v --integration

# Run WebClone Pro integration tests
cd webclone-pro
npm run test:integration

# Cleanup test environment
docker-compose -f docker-compose.test.yml down -v
```

#### Cross-System Integration Tests
```bash
# Test WebClone Pro -> WebHarvest communication
pytest tests/integration/test_system_integration.py -v

# Test data flow end-to-end
npm run test:e2e:integration
```

### End-to-End Testing

#### Playwright E2E Tests
```bash
cd webclone-pro

# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Debug specific test
npx playwright test --debug project-workflow.spec.ts
```

#### E2E Test Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Performance Testing

#### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Run load tests
cd tests/performance
artillery run load-test.yml

# Generate detailed report
artillery run load-test.yml --output report.json
artillery report report.json
```

#### Performance Test Configuration
```yaml
# tests/performance/load-test.yml
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 300
      arrivalRate: 10
      name: "Steady load"
    - duration: 120
      arrivalRate: 20
      name: "Spike test"
  defaults:
    headers:
      Authorization: 'Bearer test-key'

scenarios:
  - name: "Scrape endpoint"
    weight: 70
    flow:
      - post:
          url: "/v2/scrape"
          json:
            url: "https://httpbin.org/html"
            formats: ["markdown"]

  - name: "Health check"
    weight: 30
    flow:
      - get:
          url: "/health"
```

## 🐛 Debugging and Troubleshooting

### Common Issues and Solutions

#### 1. Port Conflicts
```bash
# Find process using port
lsof -ti:8000 | xargs kill -9

# Use alternative ports
WEBHARVEST_PORT=8001 uvicorn app.main:app --reload --port 8001
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Reset database
docker-compose down postgres
docker volume rm firecrawl-clone_postgres_dev_data
docker-compose up -d postgres

# Test connection
psql -h localhost -U postgres -d firecrawl_dev -c "SELECT 1;"
```

#### 3. Node.js Module Issues
```bash
# Clear node_modules and reinstall
cd webclone-pro
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### 4. Python Environment Issues
```bash
cd webharvest

# Recreate virtual environment
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Debugging Tools

#### Python Debugging
```python
# Add to your Python code for debugging
import pdb; pdb.set_trace()

# Or use IPython debugger
import IPython; IPython.embed()

# Use VS Code debugger
# Add breakpoints in VS Code and press F5
```

#### JavaScript/TypeScript Debugging
```javascript
// Add to your code for debugging
debugger;

// Use console.log with structured data
console.log('Debug info:', { variable, context: 'component-name' });

// Use VS Code debugger
// Add breakpoints and use F5 or attach to running process
```

#### Docker Debugging
```bash
# View logs for specific service
docker-compose logs -f webharvest-api

# Execute commands in running container
docker-compose exec webharvest-api bash

# Debug container startup issues
docker-compose up webharvest-api --no-deps

# Check container health
docker-compose ps
docker inspect <container-name>
```

### Performance Debugging

#### Python Performance
```python
# Profile function performance
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()
# Your code here
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats()
```

#### Memory Usage Monitoring
```bash
# Monitor memory usage
docker stats

# Check memory leaks
cd webharvest
python -m memory_profiler your_script.py

# Node.js memory monitoring
cd webclone-pro
node --inspect npm run dev
# Open chrome://inspect in Chrome
```

## 🤝 Contributing

### Development Workflow

1. **Fork and Clone**
   ```bash
   git fork https://github.com/your-org/firecrawl-clone.git
   git clone https://github.com/your-username/firecrawl-clone.git
   cd firecrawl-clone
   git remote add upstream https://github.com/your-org/firecrawl-clone.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Process**
   ```bash
   # Make your changes
   # Run tests
   ./scripts/test-all.sh
   
   # Run quality checks
   ./scripts/quality-check.sh
   
   # Commit changes
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Submit Pull Request**
   ```bash
   git push origin feature/your-feature-name
   # Create PR via GitHub interface
   ```

### Code Standards

#### Python (WebHarvest)
```python
# Follow PEP 8 with these settings:
# - Line length: 88 characters (Black default)
# - Use type hints for all functions
# - Use docstrings for all public functions
# - Follow Google docstring style

def scrape_url(url: str, options: ScrapingOptions) -> ScrapingResult:
    """
    Scrape content from a URL.
    
    Args:
        url: The URL to scrape
        options: Scraping configuration options
        
    Returns:
        ScrapingResult containing extracted content
        
    Raises:
        ScrapingError: If scraping fails
    """
    pass
```

#### TypeScript (WebClone Pro)
```typescript
// Use strict TypeScript settings
// Follow these conventions:
// - Use interfaces for object shapes
// - Use React.FC for components
// - Prefer const assertions
// - Use proper error boundaries

interface ProjectCardProps {
  readonly project: Project;
  readonly onSelect: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onSelect 
}) => {
  // Component implementation
};
```

### Testing Requirements

- **Unit Tests**: Minimum 85% code coverage
- **Integration Tests**: All API endpoints must have integration tests
- **E2E Tests**: Critical user paths must be covered
- **Performance Tests**: No regressions in response times

### Documentation Requirements

- **Code Documentation**: All public APIs must have documentation
- **README Updates**: Update relevant README files
- **API Documentation**: Update OpenAPI specs
- **Changelog**: Add entries to CHANGELOG.md

---

## 🎉 Success!

You now have a complete development environment for the Firecrawl-Clone platform! 

### Next Steps

1. **Explore the Code**: Start with the main application files
2. **Run Tests**: Verify everything works with `./scripts/test-all.sh`
3. **Make Changes**: Follow the contributing guidelines
4. **Join Community**: Connect with other developers on [Discord](https://discord.gg/firecrawl-clone)

### Getting Help

- 📚 **Documentation**: Check the [docs directory](./docs/)
- 🐛 **Issues**: Report bugs on [GitHub Issues](https://github.com/your-org/firecrawl-clone/issues)
- 💬 **Discussions**: Ask questions on [GitHub Discussions](https://github.com/your-org/firecrawl-clone/discussions)
- 🤝 **Community**: Join our [Discord server](https://discord.gg/firecrawl-clone)

---

**Happy coding!** 🚀

*This guide is a living document. Please help us improve it by submitting suggestions and corrections.*