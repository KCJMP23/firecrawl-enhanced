# Developer Guide - Firecrawl-Clone

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](README.md)
[![Build Status](https://img.shields.io/badge/build-passing-green.svg)](https://github.com/your-org/firecrawl-clone)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-green.svg)](https://codecov.io/gh/your-org/firecrawl-clone)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Comprehensive development guide for contributing to and extending the Firecrawl-Clone platform

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Contributing Guidelines](#contributing-guidelines)
- [Performance Guidelines](#performance-guidelines)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [API Development](#api-development)
- [Database Management](#database-management)
- [Deployment Guidelines](#deployment-guidelines)

## Development Environment Setup

### Prerequisites

#### System Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **Operating System** | Windows 10+, macOS 10.15+, Ubuntu 18.04+ | WSL2 recommended for Windows |
| **CPU** | 4+ cores | 8+ cores recommended for optimal performance |
| **Memory** | 16GB RAM minimum | 32GB recommended for full stack development |
| **Storage** | 50GB free space | SSD recommended |
| **Network** | Stable internet connection | Required for AI APIs and package downloads |

#### Required Software

```bash
# Node.js (use nvm for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18.19.0
nvm use 18.19.0

# Python 3.11+ (use pyenv for version management)
curl https://pyenv.run | bash
pyenv install 3.11.7
pyenv global 3.11.7

# Docker and Docker Compose
# Install from https://docker.com/get-started

# PostgreSQL (optional, can use Docker)
# Install from https://postgresql.org/download

# Redis (optional, can use Docker)
# Install from https://redis.io/download

# Git
git --version  # Should be 2.34+
```

### Quick Development Setup

#### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/firecrawl-clone.git
cd firecrawl-clone

# Install development dependencies
./scripts/dev-setup.sh

# Verify setup
./scripts/verify-setup.sh
```

#### 2. Environment Configuration

```bash
# Copy environment templates
cp .env.example .env
cp webharvest/.env.example webharvest/.env
cp webclone-pro/.env.example webclone-pro/.env.local

# Edit environment files with your configuration
# Use your preferred editor: code, vim, nano, etc.
code .env
```

#### 3. Database Setup

```bash
# Start database services
docker-compose up -d postgres redis qdrant

# Wait for services to be ready
./scripts/wait-for-services.sh

# Initialize databases
cd webharvest
python -m alembic upgrade head
python scripts/seed_data.py

cd ../webclone-pro
npm run db:push
npm run db:seed
```

#### 4. Start Development Services

```bash
# Terminal 1: WebHarvest API
cd webharvest
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: WebClone Pro
cd webclone-pro
npm run dev

# Terminal 3: MCP Server (optional)
cd webharvest
python -m app.mcp.server

# Terminal 4: Worker processes
cd webharvest
celery -A app.worker worker --loglevel=info
```

#### 5. Verification

```bash
# Check all services are running
curl http://localhost:8000/health        # WebHarvest API
curl http://localhost:3000/api/health    # WebClone Pro API
curl http://localhost:8080/health        # OpenWebUI (if running)

# Run basic tests
cd webharvest && pytest tests/test_health.py
cd webclone-pro && npm run test:basic
```

### IDE Configuration

#### Visual Studio Code

```json
// .vscode/settings.json
{
  "python.defaultInterpreterPath": "./webharvest/.venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.formatting.blackArgs": ["--line-length", "88"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.venv": true,
    "**/__pycache__": true,
    "**/.pytest_cache": true
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode-remote.remote-containers",
    "ms-azuretools.vscode-docker"
  ]
}
```

#### PyCharm Configuration

```ini
# .idea/misc.xml - Python interpreter
<component name="ProjectRootManager" version="2" project-jdk-name="Python 3.11 (firecrawl-clone)" />

# Code style settings
[tool:pytest]
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --strict-markers --strict-config --cov=app

[flake8]
max-line-length = 88
extend-ignore = E203, W503
exclude = .git,__pycache__,.venv,migrations
```

## Architecture Overview

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        API_CLIENT[API Clients]
        CLI[CLI Tools]
    end
    
    subgraph "Application Layer"
        NGINX[Nginx Reverse Proxy]
        WCP[WebClone Pro - Next.js]
        WH[WebHarvest API - FastAPI]
        MCP[MCP Server]
        WORKER[Celery Workers]
    end
    
    subgraph "Service Layer"
        SCRAPER[Scraping Engine]
        AI[AI Processing]
        PDF[PDF Processor]
        COLLAB[Collaboration]
        DEPLOY[Deployment]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
        VECTOR[(Vector DB)]
        STORAGE[(File Storage)]
    end
    
    subgraph "External APIs"
        OPENAI[OpenAI]
        STRIPE[Stripe]
        GITHUB[GitHub]
        VERCEL[Vercel]
    end
    
    WEB --> NGINX
    API_CLIENT --> NGINX
    CLI --> NGINX
    
    NGINX --> WCP
    NGINX --> WH
    
    WCP --> WH
    WH --> MCP
    WH --> WORKER
    
    WORKER --> SCRAPER
    WORKER --> AI
    WORKER --> PDF
    
    WCP --> COLLAB
    WCP --> DEPLOY
    
    SCRAPER --> POSTGRES
    AI --> VECTOR
    COLLAB --> REDIS
    
    AI --> OPENAI
    WCP --> STRIPE
    DEPLOY --> VERCEL
```

### Module Architecture

#### WebHarvest (Backend)

```
webharvest/
├── app/
│   ├── api/               # API routes and endpoints
│   │   ├── __init__.py
│   │   ├── scrape.py      # Scraping endpoints
│   │   ├── crawl.py       # Crawling endpoints
│   │   ├── batch.py       # Batch operations
│   │   ├── health.py      # Health checks
│   │   └── mcp.py         # MCP server endpoints
│   ├── services/          # Business logic layer
│   │   ├── __init__.py
│   │   ├── scraper.py     # Core scraping logic
│   │   ├── task_manager.py # Task queue management
│   │   └── openwebui_connector.py # OpenWebUI integration
│   ├── models/            # Database models and schemas
│   │   ├── __init__.py
│   │   └── database.py    # SQLAlchemy models
│   ├── utils/             # Utility functions
│   │   ├── __init__.py
│   │   ├── auth.py        # Authentication utilities
│   │   └── logging.py     # Logging configuration
│   ├── mcp/               # MCP server implementation
│   └── main.py            # FastAPI application entry point
├── tests/                 # Test suite
├── scripts/               # Utility scripts
├── requirements.txt       # Python dependencies
└── Dockerfile            # Container configuration
```

#### WebClone Pro (Frontend)

```
webclone-pro/
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Main dashboard
│   ├── editor/           # 3D editor interface
│   ├── analytics/        # Analytics dashboard
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── 3d/              # Three.js components
│   ├── auth/            # Authentication components
│   └── dialogs/         # Modal dialogs
├── lib/                  # Utility libraries
│   ├── supabase/        # Database client
│   ├── stripe.ts        # Payment processing
│   ├── utils.ts         # General utilities
│   └── validation.ts    # Form validation schemas
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── styles/              # Global styles
├── public/              # Static assets
└── package.json         # Node.js dependencies
```

### Database Schema

#### WebHarvest Database (PostgreSQL)

```sql
-- Core tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crawl_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    url VARCHAR(2048) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    options JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE scraped_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crawl_job_id UUID REFERENCES crawl_jobs(id),
    url VARCHAR(2048) NOT NULL,
    content TEXT,
    metadata JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_scraped_pages_url ON scraped_pages(url);
CREATE INDEX idx_scraped_pages_crawl_job ON scraped_pages(crawl_job_id);
```

#### WebClone Pro Database (Supabase/PostgreSQL)

```sql
-- User management
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects and cloning
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048),
    status VARCHAR(50) DEFAULT 'draft',
    framework VARCHAR(50),
    options JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI usage tracking
CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    project_id UUID REFERENCES projects(id),
    model VARCHAR(50),
    tokens_used INTEGER,
    cost_cents INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Design Principles

#### RESTful API Guidelines

```python
# Use proper HTTP status codes
@app.get("/api/v1/projects/{project_id}")
async def get_project(project_id: str, user: User = Depends(get_current_user)):
    project = await project_service.get_project(project_id, user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.from_orm(project)

# Use consistent error handling
class APIError(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str = None):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code

@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )

# Use proper request/response models
class CreateProjectRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    url: HttpUrl
    framework: Literal["react", "vue", "angular", "svelte"]
    options: ProjectOptions = Field(default_factory=ProjectOptions)

    class Config:
        schema_extra = {
            "example": {
                "name": "My Website Clone",
                "url": "https://example.com",
                "framework": "react",
                "options": {
                    "captureAnimations": True,
                    "optimizeImages": True
                }
            }
        }
```

## Development Workflow

### Git Workflow

#### Branch Strategy

```bash
# Main branches
main                    # Production-ready code
develop                 # Integration branch for features

# Feature branches
feature/WH-123-add-pdf-processing      # WebHarvest feature
feature/WCP-456-improve-ui             # WebClone Pro feature

# Release branches
release/v1.2.0          # Preparing for release

# Hotfix branches
hotfix/v1.1.1-security-fix    # Critical fixes

# Branch naming convention
feature/[COMPONENT]-[TICKET]-[SHORT-DESCRIPTION]
bugfix/[COMPONENT]-[TICKET]-[SHORT-DESCRIPTION]
hotfix/[VERSION]-[SHORT-DESCRIPTION]
```

#### Commit Message Convention

```bash
# Format: type(scope): description
# 
# Types: feat, fix, docs, style, refactor, test, chore
# Scope: component or area of change
# Description: imperative, present tense

# Examples
git commit -m "feat(webharvest): add PDF text extraction support"
git commit -m "fix(webclone-pro): resolve authentication token refresh issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(scraper): add integration tests for crawling engine"
git commit -m "refactor(api): improve error handling middleware"

# Breaking changes
git commit -m "feat(api)!: change authentication to use JWT tokens

BREAKING CHANGE: API key authentication is deprecated. 
Use JWT tokens with Authorization header instead."
```

### Development Process

#### 1. Issue Creation and Assignment

```markdown
## Bug Report Template
**Summary**: Brief description of the issue

**Environment**:
- OS: Ubuntu 20.04
- Node.js: 18.19.0
- Python: 3.11.7
- Browser: Chrome 120.0

**Steps to Reproduce**:
1. Navigate to project dashboard
2. Click "Create Project"
3. Enter URL: https://example.com
4. Click "Start Cloning"

**Expected Behavior**: Project should start cloning
**Actual Behavior**: Error message "Invalid URL" appears

**Screenshots**: (if applicable)
**Logs**: (if applicable)

## Feature Request Template
**Summary**: Brief description of the feature

**Use Case**: Who would benefit and how
**Acceptance Criteria**:
- [ ] User can upload PDF files
- [ ] Text is extracted and processed
- [ ] Results are searchable

**Technical Notes**: Implementation considerations
```

#### 2. Feature Development Lifecycle

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/WH-123-add-pdf-processing

# 2. Implement feature with tests
# Write failing tests first (TDD)
cd webharvest
pytest tests/test_pdf_processing.py -v  # Should fail initially

# Implement feature
# Add tests
# Ensure all tests pass
pytest tests/ -v

# 3. Update documentation
# Update README, API docs, etc.

# 4. Commit changes
git add .
git commit -m "feat(webharvest): add PDF text extraction support

- Add PDFProcessor class with text extraction
- Support for multiple PDF libraries (PyPDF2, pdfplumber)
- Add PDF upload endpoint
- Include comprehensive test coverage"

# 5. Push and create PR
git push origin feature/WH-123-add-pdf-processing
# Create PR via GitHub/GitLab interface
```

#### 3. Code Review Process

```yaml
# .github/pull_request_template.md
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

### Code Quality Standards

#### Python Code Style (WebHarvest)

```python
# Use type hints everywhere
from typing import List, Dict, Optional, Union
from pydantic import BaseModel

class ScrapingOptions(BaseModel):
    timeout: int = 30
    wait_for: Optional[int] = None
    headers: Dict[str, str] = {}
    proxy: Optional[str] = None

async def scrape_url(
    url: str, 
    options: ScrapingOptions = ScrapingOptions()
) -> Dict[str, Union[str, int]]:
    """
    Scrape a single URL and return processed content.
    
    Args:
        url: The URL to scrape
        options: Scraping configuration options
        
    Returns:
        Dictionary containing scraped content and metadata
        
    Raises:
        ScrapingError: If scraping fails
        ValidationError: If URL is invalid
    """
    # Implementation here
    pass

# Use proper logging
import structlog

logger = structlog.get_logger(__name__)

async def process_request(request_data: dict) -> dict:
    logger.info("Processing scraping request", url=request_data.get("url"))
    
    try:
        result = await scrape_url(request_data["url"])
        logger.info("Scraping completed successfully", 
                   pages_scraped=len(result.get("pages", [])))
        return result
    except Exception as e:
        logger.error("Scraping failed", error=str(e), url=request_data.get("url"))
        raise

# Use proper error handling
class ScrapingError(Exception):
    """Base exception for scraping operations."""
    pass

class URLValidationError(ScrapingError):
    """Raised when URL validation fails."""
    pass

class TimeoutError(ScrapingError):
    """Raised when scraping times out."""
    pass
```

#### TypeScript Code Style (WebClone Pro)

```typescript
// Use strict TypeScript configuration
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// Use proper interfaces and types
interface Project {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly status: ProjectStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly options?: ProjectOptions;
}

type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';

// Use functional components with proper typing
interface ProjectCardProps {
  readonly project: Project;
  readonly onSelect: (projectId: string) => void;
  readonly onEdit?: (projectId: string) => void;
  readonly className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onSelect, 
  onEdit,
  className 
}) => {
  const handleSelect = useCallback(() => {
    onSelect(project.id);
  }, [project.id, onSelect]);

  const handleEdit = useCallback(() => {
    onEdit?.(project.id);
  }, [project.id, onEdit]);

  return (
    <Card className={cn('transition-all hover:shadow-lg', className)}>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.url}</CardDescription>
      </CardHeader>
      <CardContent>
        <StatusBadge status={project.status} />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSelect}>Open</Button>
        {onEdit && (
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Use proper error boundaries
class ProjectErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Project error:', error, errorInfo);
    // Send to error tracking service
    errorTracking.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

## Testing Guidelines

### Testing Strategy

```mermaid
graph TD
    A[Unit Tests] --> B[Integration Tests]
    B --> C[E2E Tests]
    C --> D[Performance Tests]
    D --> E[Security Tests]
    
    A --> F[Code Coverage]
    B --> F
    C --> F
    
    F --> G[Quality Gate]
    G --> H[Production Deployment]
```

### Unit Testing

#### Python Unit Tests (WebHarvest)

```python
# tests/test_scraper.py
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.scraper import ScrapingService, ScrapingOptions
from app.exceptions import ScrapingError

class TestScrapingService:
    @pytest.fixture
    def scraping_service(self):
        return ScrapingService()

    @pytest.fixture
    def mock_playwright_page(self):
        page = AsyncMock()
        page.goto = AsyncMock()
        page.content = AsyncMock(return_value="<html><body>Test content</body></html>")
        page.evaluate = AsyncMock(return_value="Test content")
        return page

    @pytest.mark.asyncio
    async def test_scrape_url_success(self, scraping_service, mock_playwright_page):
        """Test successful URL scraping."""
        with patch('app.services.scraper.get_playwright_page', 
                   return_value=mock_playwright_page):
            
            result = await scraping_service.scrape_url(
                "https://example.com",
                ScrapingOptions(timeout=30)
            )
            
            assert result["url"] == "https://example.com"
            assert "content" in result
            assert result["status"] == "success"
            
            mock_playwright_page.goto.assert_called_once_with(
                "https://example.com", 
                timeout=30000
            )

    @pytest.mark.asyncio
    async def test_scrape_url_timeout(self, scraping_service):
        """Test scraping timeout handling."""
        with patch('app.services.scraper.get_playwright_page') as mock_get_page:
            mock_get_page.side_effect = TimeoutError("Page load timeout")
            
            with pytest.raises(ScrapingError) as exc_info:
                await scraping_service.scrape_url(
                    "https://slow-example.com",
                    ScrapingOptions(timeout=1)
                )
            
            assert "timeout" in str(exc_info.value).lower()

    @pytest.mark.parametrize("url,expected_valid", [
        ("https://example.com", True),
        ("http://example.com", True),
        ("ftp://example.com", False),
        ("invalid-url", False),
        ("", False),
    ])
    def test_url_validation(self, scraping_service, url, expected_valid):
        """Test URL validation logic."""
        if expected_valid:
            assert scraping_service.validate_url(url) is True
        else:
            with pytest.raises(URLValidationError):
                scraping_service.validate_url(url)

# conftest.py - Shared fixtures
@pytest.fixture
def test_database():
    """Create test database instance."""
    from sqlalchemy import create_engine
    from app.models.database import Base
    
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    yield engine
    
    engine.dispose()

@pytest.fixture
async def test_client():
    """Create test HTTP client."""
    from fastapi.testclient import TestClient
    from app.main import app
    
    with TestClient(app) as client:
        yield client
```

#### React Component Tests (WebClone Pro)

```typescript
// components/__tests__/ProjectCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCard } from '../ProjectCard';
import type { Project } from '@/types';

const mockProject: Project = {
  id: 'proj_123',
  name: 'Test Project',
  url: 'https://example.com',
  status: 'completed',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('ProjectCard', () => {
  const mockOnSelect = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project information correctly', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        onSelect={mockOnSelect} 
        onEdit={mockOnEdit} 
      />
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('calls onSelect when Open button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onSelect={mockOnSelect} 
      />
    );

    await user.click(screen.getByRole('button', { name: /open/i }));
    
    expect(mockOnSelect).toHaveBeenCalledWith('proj_123');
  });

  it('shows Edit button only when onEdit is provided', () => {
    const { rerender } = render(
      <ProjectCard 
        project={mockProject} 
        onSelect={mockOnSelect} 
      />
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();

    rerender(
      <ProjectCard 
        project={mockProject} 
        onSelect={mockOnSelect} 
        onEdit={mockOnEdit} 
      />
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onSelect={mockOnSelect} 
        onEdit={mockOnEdit} 
      />
    );

    const openButton = screen.getByRole('button', { name: /open/i });
    
    await user.tab(); // Focus on first interactive element
    expect(openButton).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockOnSelect).toHaveBeenCalledWith('proj_123');
  });
});

// Mock API responses for integration tests
// __mocks__/api.ts
export const mockApiResponses = {
  getProjects: {
    projects: [mockProject],
    pagination: {
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  },
  createProject: {
    id: 'proj_456',
    status: 'queued',
    estimatedTime: 180,
    queuePosition: 1,
  },
};

// Setup MSW for API mocking
// setupTests.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mockApiResponses } from './__mocks__/api';

export const server = setupServer(
  rest.get('/api/projects', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.getProjects));
  }),
  
  rest.post('/api/projects', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.createProject));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Integration Testing

```bash
# WebHarvest integration tests
cd webharvest
pytest tests/integration/ -v --integration

# WebClone Pro integration tests  
cd webclone-pro
npm run test:integration
```

```python
# tests/integration/test_api_flow.py
import pytest
import asyncio
from httpx import AsyncClient
from app.main import app

@pytest.mark.integration
class TestAPIFlow:
    @pytest.mark.asyncio
    async def test_complete_scraping_flow(self):
        """Test complete scraping workflow from API to database."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # 1. Create scraping job
            response = await ac.post("/api/v1/scrape", json={
                "url": "https://httpbin.org/html",
                "formats": ["markdown", "html"]
            }, headers={"Authorization": "Bearer test-key"})
            
            assert response.status_code == 200
            data = response.json()
            assert "markdown" in data["data"]
            assert "html" in data["data"]
            
            # 2. Verify job is stored in database
            # Add database verification logic
            
            # 3. Check metrics are updated
            metrics_response = await ac.get("/metrics")
            assert "webharvest_requests_total" in metrics_response.text

    @pytest.mark.asyncio
    async def test_crawling_workflow(self):
        """Test complete crawling workflow."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Start crawl job
            response = await ac.post("/api/v1/crawl", json={
                "url": "https://httpbin.org",
                "limit": 5,
                "maxDepth": 2
            }, headers={"Authorization": "Bearer test-key"})
            
            assert response.status_code == 202
            crawl_id = response.json()["id"]
            
            # Poll for completion (with timeout)
            for _ in range(30):  # 30 second timeout
                status_response = await ac.get(
                    f"/api/v1/crawl/{crawl_id}",
                    headers={"Authorization": "Bearer test-key"}
                )
                
                status_data = status_response.json()
                if status_data["status"] in ["completed", "failed"]:
                    break
                    
                await asyncio.sleep(1)
            
            assert status_data["status"] == "completed"
            assert len(status_data["results"]["pages"]) > 0
```

### End-to-End Testing

```typescript
// e2e/project-workflow.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Project Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login or setup test user
    await page.goto('/auth/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'testpassword');
    await page.click('[data-testid=login-button]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete project creation and cloning workflow', async ({ page }) => {
    // 1. Navigate to create project
    await page.click('[data-testid=create-project-button]');
    await expect(page).toHaveURL('/dashboard/new');

    // 2. Fill out project form
    await page.fill('[data-testid=project-name]', 'Test E2E Project');
    await page.fill('[data-testid=project-url]', 'https://example.com');
    await page.selectOption('[data-testid=framework-select]', 'react');
    
    // 3. Start cloning
    await page.click('[data-testid=start-cloning-button]');
    
    // 4. Wait for cloning to complete
    await expect(page.locator('[data-testid=cloning-status]')).toHaveText('Processing', { timeout: 5000 });
    
    // 5. Verify completion
    await expect(page.locator('[data-testid=cloning-status]')).toHaveText('Completed', { timeout: 60000 });
    
    // 6. Check project appears in dashboard
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid=project-card]')).toContainText('Test E2E Project');
  });

  test('collaborative editing workflow', async ({ browser }) => {
    // Create two browser contexts for collaboration testing
    const user1Context = await browser.newContext();
    const user2Context = await browser.newContext();
    
    const user1Page = await user1Context.newPage();
    const user2Page = await user2Context.newPage();
    
    // Both users join the same project
    await user1Page.goto('/editor/test-project-id');
    await user2Page.goto('/editor/test-project-id');
    
    // User 1 makes changes
    await user1Page.click('[data-testid=code-editor]');
    await user1Page.keyboard.type('console.log("Hello from user 1");');
    
    // User 2 should see the changes in real-time
    await expect(user2Page.locator('[data-testid=code-editor]')).toContainText('Hello from user 1');
    
    await user1Context.close();
    await user2Context.close();
  });
});
```

### Performance Testing

```python
# tests/performance/test_load.py
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
import requests

def test_api_performance():
    """Test API performance under load."""
    
    def make_request():
        response = requests.post(
            "http://localhost:8000/api/v1/scrape",
            json={"url": "https://httpbin.org/html"},
            headers={"Authorization": "Bearer test-key"}
        )
        return response.status_code, response.elapsed.total_seconds()
    
    # Test with 50 concurrent requests
    with ThreadPoolExecutor(max_workers=50) as executor:
        start_time = time.time()
        futures = [executor.submit(make_request) for _ in range(100)]
        
        results = []
        for future in futures:
            status_code, duration = future.result()
            results.append((status_code, duration))
        
        end_time = time.time()
    
    # Analyze results
    successful_requests = sum(1 for status, _ in results if status == 200)
    average_duration = sum(duration for _, duration in results) / len(results)
    total_duration = end_time - start_time
    
    print(f"Total requests: {len(results)}")
    print(f"Successful: {successful_requests}")
    print(f"Success rate: {successful_requests/len(results)*100:.1f}%")
    print(f"Average response time: {average_duration:.3f}s")
    print(f"Requests per second: {len(results)/total_duration:.1f}")
    
    # Assertions for performance requirements
    assert successful_requests / len(results) >= 0.95  # 95% success rate
    assert average_duration <= 2.0  # Average response time under 2s
    assert len(results) / total_duration >= 25  # At least 25 RPS
```

## Contributing Guidelines

### Pull Request Process

#### 1. Pre-commit Checks

```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Manual pre-commit run
pre-commit run --all-files
```

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
  
  - repo: https://github.com/psf/black
    rev: 23.9.1
    hooks:
      - id: black
        language_version: python3.11
  
  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
        additional_dependencies: [flake8-docstrings]
  
  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: ["--profile", "black"]
  
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.3
    hooks:
      - id: prettier
        types_or: [javascript, jsx, typescript, tsx, json, yaml, markdown]
```

#### 2. Automated Testing

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test-webharvest:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.11, 3.12]
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_webharvest
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install dependencies
      working-directory: ./webharvest
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run tests
      working-directory: ./webharvest
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost/test_webharvest
        REDIS_URL: redis://localhost:6379/0
      run: |
        pytest tests/ -v --cov=app --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./webharvest/coverage.xml

  test-webclone-pro:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: './webclone-pro/package-lock.json'
    
    - name: Install dependencies
      working-directory: ./webclone-pro
      run: npm ci
    
    - name: Run type checking
      working-directory: ./webclone-pro
      run: npm run type-check
    
    - name: Run linting
      working-directory: ./webclone-pro
      run: npm run lint
    
    - name: Run unit tests
      working-directory: ./webclone-pro
      run: npm run test:coverage
    
    - name: Run E2E tests
      working-directory: ./webclone-pro
      run: npm run test:e2e

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
```

#### 3. Code Review Checklist

```markdown
## Reviewer Checklist

### Functionality
- [ ] Feature works as described in requirements
- [ ] Edge cases are handled appropriately
- [ ] Error handling is comprehensive
- [ ] Performance impact is acceptable

### Code Quality
- [ ] Code follows project style guidelines
- [ ] Functions/classes have single responsibilities
- [ ] Code is readable and well-commented
- [ ] No code duplication or unnecessary complexity

### Testing
- [ ] Unit tests cover new functionality
- [ ] Integration tests pass
- [ ] Test coverage meets minimum requirements (85%)
- [ ] Tests are meaningful and not just for coverage

### Security
- [ ] Input validation is implemented
- [ ] No hardcoded secrets or credentials
- [ ] SQL injection and XSS vulnerabilities checked
- [ ] Authentication/authorization properly implemented

### Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Inline code documentation added
- [ ] Breaking changes documented

### Performance
- [ ] Database queries are optimized
- [ ] No N+1 query problems
- [ ] Caching implemented where appropriate
- [ ] Memory usage is reasonable

### Accessibility (Frontend)
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets standards
- [ ] Focus indicators are visible
```

### Release Process

#### 1. Version Management

```bash
# Follow Semantic Versioning
MAJOR.MINOR.PATCH

# Examples:
1.0.0     # Initial release
1.0.1     # Bug fix
1.1.0     # New feature (backward compatible)
2.0.0     # Breaking change

# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version numbers
cd webharvest
# Update __version__ in app/__init__.py
echo "__version__ = '1.2.0'" > app/__init__.py

cd ../webclone-pro
npm version 1.2.0  # Updates package.json

# Update CHANGELOG
echo "## [1.2.0] - $(date +%Y-%m-%d)
### Added
- New PDF processing capabilities
- Enhanced AI cost optimization

### Changed
- Improved error handling in scraping engine
- Updated UI components for better accessibility

### Fixed
- Fixed authentication token refresh issue
- Resolved memory leak in browser pool

### Security
- Updated dependencies to address security vulnerabilities
" >> CHANGELOG.md

# Commit and push release branch
git add .
git commit -m "chore: bump version to 1.2.0"
git push origin release/v1.2.0

# Create PR from release branch to main
# After approval and merge, tag the release
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

#### 2. Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Build and push Docker images
      run: |
        # Build WebHarvest image
        docker build -t webharvest:${{ github.ref_name }} ./webharvest
        docker tag webharvest:${{ github.ref_name }} $ECR_REGISTRY/webharvest:${{ github.ref_name }}
        docker push $ECR_REGISTRY/webharvest:${{ github.ref_name }}
        
        # Build WebClone Pro image
        docker build -t webclone-pro:${{ github.ref_name }} ./webclone-pro
        docker tag webclone-pro:${{ github.ref_name }} $ECR_REGISTRY/webclone-pro:${{ github.ref_name }}
        docker push $ECR_REGISTRY/webclone-pro:${{ github.ref_name }}
    
    - name: Deploy to Kubernetes
      run: |
        # Update deployment manifests with new image tags
        sed -i "s|image: webharvest:.*|image: $ECR_REGISTRY/webharvest:${{ github.ref_name }}|g" k8s/webharvest-deployment.yaml
        sed -i "s|image: webclone-pro:.*|image: $ECR_REGISTRY/webclone-pro:${{ github.ref_name }}|g" k8s/webclone-pro-deployment.yaml
        
        # Apply deployments
        kubectl apply -f k8s/
        
        # Wait for rollout to complete
        kubectl rollout status deployment/webharvest-deployment
        kubectl rollout status deployment/webclone-pro-deployment
    
    - name: Run smoke tests
      run: |
        # Wait for services to be ready
        sleep 30
        
        # Test WebHarvest health
        curl -f https://api.firecrawl-clone.com/health
        
        # Test WebClone Pro health
        curl -f https://app.firecrawl-clone.com/api/health
    
    - name: Create GitHub release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false
```

## Performance Guidelines

### Database Performance

#### Query Optimization

```python
# Use proper indexes
# migrations/003_add_performance_indexes.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Composite index for common query patterns
    op.create_index(
        'idx_projects_user_status_created',
        'projects',
        ['user_id', 'status', 'created_at']
    )
    
    # Partial index for active projects only
    op.execute("""
        CREATE INDEX CONCURRENTLY idx_projects_active 
        ON projects(user_id, created_at) 
        WHERE status IN ('processing', 'queued')
    """)
    
    # Expression index for search functionality
    op.execute("""
        CREATE INDEX CONCURRENTLY idx_projects_name_search 
        ON projects USING gin(to_tsvector('english', name))
    """)

# Optimize queries with proper joins and subqueries
async def get_user_projects_with_stats(user_id: str, limit: int = 20):
    query = """
    SELECT 
        p.*,
        COUNT(c.id) as clone_count,
        MAX(c.created_at) as last_clone_at
    FROM projects p
    LEFT JOIN clones c ON p.id = c.project_id
    WHERE p.user_id = $1
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT $2
    """
    
    return await database.fetch_all(query, user_id, limit)

# Use connection pooling and prepared statements
from asyncpg import create_pool

async def create_database_pool():
    return await create_pool(
        DATABASE_URL,
        min_size=10,
        max_size=20,
        max_queries=50000,
        max_inactive_connection_lifetime=300,
        command_timeout=60
    )
```

#### Caching Strategy

```python
# Redis caching implementation
import aioredis
import json
from typing import Optional, Any
from functools import wraps

class CacheService:
    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url)
        self.default_ttl = 3600  # 1 hour
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            value = await self.redis.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.warning(f"Cache get failed for key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache."""
        try:
            ttl = ttl or self.default_ttl
            await self.redis.setex(key, ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.warning(f"Cache set failed for key {key}: {e}")
            return False
    
    async def invalidate(self, pattern: str) -> int:
        """Invalidate cache keys matching pattern."""
        keys = await self.redis.keys(pattern)
        if keys:
            return await self.redis.delete(*keys)
        return 0

# Cache decorator
def cache_result(key_pattern: str, ttl: int = 3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = key_pattern.format(*args, **kwargs)
            
            # Try to get from cache
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_service.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Usage example
@cache_result("user_projects:{user_id}", ttl=1800)
async def get_user_projects(user_id: str):
    # This will be cached for 30 minutes
    return await project_service.get_projects_by_user(user_id)
```

### Frontend Performance

#### React Performance Optimization

```typescript
// Use React.memo for expensive components
import { memo, useMemo, useCallback } from 'react';

interface ProjectListProps {
  projects: Project[];
  onSelect: (id: string) => void;
  searchQuery: string;
}

export const ProjectList = memo<ProjectListProps>(({ 
  projects, 
  onSelect, 
  searchQuery 
}) => {
  // Memoize filtered projects
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  // Memoize callback to prevent child re-renders
  const handleSelect = useCallback((projectId: string) => {
    onSelect(projectId);
  }, [onSelect]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map(project => (
        <ProjectCard 
          key={project.id}
          project={project}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
});

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window';

interface VirtualizedProjectListProps {
  projects: Project[];
  height: number;
}

const VirtualizedProjectList: React.FC<VirtualizedProjectListProps> = ({ 
  projects, 
  height 
}) => {
  const Row = useCallback(({ index, style }) => (
    <div style={style}>
      <ProjectCard project={projects[index]} />
    </div>
  ), [projects]);

  return (
    <List
      height={height}
      itemCount={projects.length}
      itemSize={200} // Height of each project card
      width="100%"
    >
      {Row}
    </List>
  );
};

// Code splitting with React.lazy
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ProjectEditor = lazy(() => import('@/components/ProjectEditor'));
const AnalyticsDashboard = lazy(() => import('@/components/AnalyticsDashboard'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/editor/:id" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectEditor />
          </Suspense>
        } />
        <Route path="/analytics" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AnalyticsDashboard />
          </Suspense>
        } />
      </Routes>
    </Router>
  );
}
```

#### Bundle Optimization

```typescript
// next.config.ts
const nextConfig = {
  // Enable modern build optimizations
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },

  // Bundle analysis
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Analyze bundle size
      if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: true,
          })
        );
      }

      // Split large libraries into separate chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'storage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Security Best Practices

### Authentication and Authorization

```python
# JWT token management
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

class AuthService:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7

    def hash_password(self, password: str) -> str:
        """Hash a password for storage."""
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, data: dict) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire, "type": "access"})
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, data: dict) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> Optional[dict]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.JWTError:
            raise AuthenticationError("Invalid token")

# Rate limiting implementation
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/scrape")
@limiter.limit("10/minute")  # 10 requests per minute per IP
async def scrape_endpoint(request: Request, ...):
    # Endpoint implementation
    pass

# Input validation and sanitization
from pydantic import BaseModel, validator, HttpUrl
from typing import List
import re

class ScrapeRequest(BaseModel):
    url: HttpUrl
    formats: List[str] = ["markdown"]
    wait_for: Optional[int] = None
    headers: Optional[Dict[str, str]] = None

    @validator('formats')
    def validate_formats(cls, v):
        allowed_formats = ["markdown", "html", "json", "screenshot"]
        for format_type in v:
            if format_type not in allowed_formats:
                raise ValueError(f"Invalid format: {format_type}")
        return v

    @validator('wait_for')
    def validate_wait_for(cls, v):
        if v is not None and (v < 0 or v > 30000):
            raise ValueError("wait_for must be between 0 and 30000 milliseconds")
        return v

    @validator('headers')
    def validate_headers(cls, v):
        if v is None:
            return v
        
        # Prevent header injection
        for key, value in v.items():
            if re.search(r'[\r\n]', key) or re.search(r'[\r\n]', value):
                raise ValueError("Headers cannot contain newline characters")
        
        # Limit header count and size
        if len(v) > 20:
            raise ValueError("Too many headers")
        
        return v
```

### Data Protection

```python
# Encryption service
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

class EncryptionService:
    def __init__(self, password: str):
        self.password = password.encode()
        self.salt = os.urandom(16)
        self._key = self._derive_key()
        self.cipher_suite = Fernet(self._key)

    def _derive_key(self) -> bytes:
        """Derive encryption key from password."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.password))
        return key

    def encrypt(self, plaintext: str) -> str:
        """Encrypt plaintext string."""
        encrypted = self.cipher_suite.encrypt(plaintext.encode())
        return base64.urlsafe_b64encode(encrypted).decode()

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt ciphertext string."""
        try:
            encrypted = base64.urlsafe_b64decode(ciphertext.encode())
            decrypted = self.cipher_suite.decrypt(encrypted)
            return decrypted.decode()
        except Exception as e:
            raise ValueError("Failed to decrypt data") from e

# Secure API key storage
import secrets
import hashlib

def generate_api_key(length: int = 32) -> str:
    """Generate a secure API key."""
    return secrets.token_urlsafe(length)

def hash_api_key(api_key: str, salt: str = None) -> tuple[str, str]:
    """Hash API key for secure storage."""
    if salt is None:
        salt = secrets.token_hex(16)
    
    # Use SHA-256 with salt for hashing
    key_hash = hashlib.pbkdf2_hmac(
        'sha256',
        api_key.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # iterations
    )
    
    return salt, key_hash.hex()

def verify_api_key(api_key: str, salt: str, stored_hash: str) -> bool:
    """Verify API key against stored hash."""
    _, computed_hash = hash_api_key(api_key, salt)
    return computed_hash == stored_hash
```

### Security Monitoring

```python
# Security event logging
import structlog
from datetime import datetime
from typing import Dict, Any

security_logger = structlog.get_logger("security")

class SecurityMonitor:
    def __init__(self):
        self.failed_attempts = {}  # IP -> count
        self.blocked_ips = set()
        self.max_attempts = 5
        self.block_duration = 3600  # 1 hour

    def log_authentication_attempt(self, 
                                 ip_address: str, 
                                 user_email: str, 
                                 success: bool, 
                                 user_agent: str = None):
        """Log authentication attempt."""
        security_logger.info(
            "authentication_attempt",
            ip_address=ip_address,
            user_email=user_email,
            success=success,
            user_agent=user_agent,
            timestamp=datetime.utcnow().isoformat()
        )

        if not success:
            self._handle_failed_attempt(ip_address)

    def log_suspicious_activity(self, 
                              ip_address: str, 
                              activity_type: str, 
                              details: Dict[str, Any]):
        """Log suspicious security activity."""
        security_logger.warning(
            "suspicious_activity",
            ip_address=ip_address,
            activity_type=activity_type,
            details=details,
            timestamp=datetime.utcnow().isoformat()
        )

    def _handle_failed_attempt(self, ip_address: str):
        """Handle failed authentication attempt."""
        current_time = datetime.utcnow().timestamp()
        
        if ip_address not in self.failed_attempts:
            self.failed_attempts[ip_address] = []
        
        # Clean old attempts
        self.failed_attempts[ip_address] = [
            timestamp for timestamp in self.failed_attempts[ip_address]
            if current_time - timestamp < self.block_duration
        ]
        
        # Add current attempt
        self.failed_attempts[ip_address].append(current_time)
        
        # Block IP if too many attempts
        if len(self.failed_attempts[ip_address]) >= self.max_attempts:
            self.blocked_ips.add(ip_address)
            security_logger.critical(
                "ip_blocked",
                ip_address=ip_address,
                attempts=len(self.failed_attempts[ip_address]),
                timestamp=datetime.utcnow().isoformat()
            )

    def is_blocked(self, ip_address: str) -> bool:
        """Check if IP address is blocked."""
        return ip_address in self.blocked_ips

# SQL injection prevention
from sqlalchemy.sql import text
from sqlalchemy.exc import DataError

async def safe_database_query(query: str, params: dict):
    """Execute database query with injection protection."""
    try:
        # Use parameterized queries only
        stmt = text(query)
        result = await database.execute(stmt, params)
        return result
    except DataError as e:
        security_logger.warning(
            "potential_sql_injection",
            query=query[:100],  # Log first 100 chars only
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )
        raise ValueError("Invalid query parameters")

# XSS prevention
import html
import re
from typing import Union

def sanitize_html_input(text: str) -> str:
    """Sanitize user input to prevent XSS."""
    if not text:
        return ""
    
    # HTML escape
    sanitized = html.escape(text)
    
    # Remove potentially dangerous patterns
    dangerous_patterns = [
        r'<script.*?>.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'on\w+\s*=',
    ]
    
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
    
    return sanitized.strip()

def validate_url_input(url: str) -> bool:
    """Validate URL input to prevent SSRF."""
    parsed = urlparse(url)
    
    # Check scheme
    if parsed.scheme not in ['http', 'https']:
        return False
    
    # Block private networks
    try:
        ip = ipaddress.ip_address(parsed.hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return False
    except ValueError:
        # Not an IP address, continue validation
        pass
    
    # Block localhost variations
    if parsed.hostname in ['localhost', '127.0.0.1', '::1']:
        return False
    
    return True
```

## Troubleshooting

### Common Issues and Solutions

#### Development Environment Issues

```bash
# Issue: Port already in use
# Solution: Find and kill process using port
lsof -ti:8000 | xargs kill -9  # Kill process on port 8000
netstat -tulpn | grep 8000     # Check what's using port 8000

# Issue: Database connection fails
# Solution: Check database status and connectivity
docker ps | grep postgres               # Check if PostgreSQL is running
psql -h localhost -U postgres -d webharvest -c "SELECT 1;"  # Test connection

# Issue: Redis connection fails
# Solution: Check Redis status
docker ps | grep redis                  # Check if Redis is running
redis-cli ping                          # Test connection

# Issue: Python import errors
# Solution: Check virtual environment and dependencies
source .venv/bin/activate               # Activate virtual environment
pip list | grep -E "fastapi|pydantic"  # Check installed packages
pip install -r requirements.txt        # Reinstall dependencies

# Issue: Node.js version conflicts
# Solution: Use Node Version Manager
nvm list                               # List installed Node versions
nvm use 18.19.0                       # Switch to specific version
nvm install --lts                     # Install latest LTS
```

#### Application Performance Issues

```python
# Performance monitoring and debugging
import cProfile
import pstats
import io
from functools import wraps

def profile_performance(func):
    """Decorator to profile function performance."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        pr = cProfile.Profile()
        pr.enable()
        
        result = func(*args, **kwargs)
        
        pr.disable()
        s = io.StringIO()
        ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
        ps.print_stats()
        
        logger.info(f"Performance profile for {func.__name__}:\n{s.getvalue()}")
        return result
    
    return wrapper

# Memory usage monitoring
import tracemalloc
import psutil
import os

def monitor_memory_usage():
    """Monitor application memory usage."""
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    logger.info(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")
    
    if tracemalloc.is_tracing():
        current, peak = tracemalloc.get_traced_memory()
        logger.info(f"Traced memory - Current: {current / 1024 / 1024:.2f} MB, "
                   f"Peak: {peak / 1024 / 1024:.2f} MB")

# Database query monitoring
import asyncio
import time
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")  
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 0.1:  # Log slow queries (>100ms)
        logger.warning(f"Slow query detected: {total:.3f}s - {statement[:100]}...")
```

#### Error Debugging Techniques

```python
# Comprehensive error handling and debugging
import traceback
import sys
from contextlib import contextmanager

@contextmanager
def error_context(operation_name: str, **context_data):
    """Context manager for error tracking with additional context."""
    try:
        logger.info(f"Starting operation: {operation_name}", **context_data)
        yield
        logger.info(f"Completed operation: {operation_name}", **context_data)
    except Exception as e:
        error_details = {
            "operation": operation_name,
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            **context_data
        }
        
        logger.error("Operation failed", **error_details)
        
        # Send to error tracking service in production
        if os.getenv("ENVIRONMENT") == "production":
            sentry_sdk.capture_exception(e, extra=error_details)
        
        raise

# Usage example
async def scrape_with_error_context(url: str):
    async with error_context("url_scraping", url=url, user_id="user123"):
        result = await scraper.scrape(url)
        return result

# Custom exception hierarchy for better error handling
class WebHarvestError(Exception):
    """Base exception for WebHarvest operations."""
    def __init__(self, message: str, error_code: str = None, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

class ScrapingError(WebHarvestError):
    """Exception for scraping operations."""
    pass

class ValidationError(WebHarvestError):
    """Exception for validation errors."""
    pass

class AuthenticationError(WebHarvestError):
    """Exception for authentication errors."""
    pass

# Error handler middleware
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

@app.exception_handler(WebHarvestError)
async def webharvest_error_handler(request: Request, exc: WebHarvestError):
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": exc.error_code or "WEBHARVEST_ERROR",
                "message": exc.message,
                "details": exc.details,
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": getattr(request.state, "request_id", None)
            }
        }
    )
```

### Debugging Tools and Techniques

```bash
# Docker debugging
docker logs webharvest-api --follow --tail 100    # View API logs
docker exec -it webharvest-api bash               # Shell into container
docker stats                                       # Monitor resource usage
docker system prune                               # Clean up unused containers/images

# Database debugging
# Connect to PostgreSQL
psql -h localhost -U postgres -d webharvest

# Common debugging queries
SELECT * FROM pg_stat_activity WHERE state = 'active';  # Active connections
SELECT * FROM pg_locks;                                  # Lock information
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = 'user123';  # Query analysis

# Redis debugging
redis-cli monitor                    # Monitor all Redis commands
redis-cli info memory              # Memory usage information
redis-cli --latency                # Monitor latency
redis-cli keys "webharvest:*"      # List keys with pattern

# Network debugging
curl -v http://localhost:8000/health           # Verbose HTTP request
nslookup api.example.com                       # DNS resolution
ping api.example.com                          # Network connectivity
telnet api.example.com 80                     # Port connectivity

# SSL/TLS debugging
openssl s_client -connect api.example.com:443 -servername api.example.com
```

---

## Contributing

We welcome contributions to improve this Developer Guide and the overall project. Please see our [Contributing Guidelines](#contributing-guidelines) for details on submitting improvements.

### Areas for Improvement

- Add more specific debugging scenarios
- Include additional performance optimization techniques
- Expand testing examples for complex scenarios
- Add more security best practices
- Include mobile development guidelines

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [project issues](https://github.com/your-org/firecrawl-clone/issues)
2. Search the [discussions](https://github.com/your-org/firecrawl-clone/discussions)
3. Join our [Discord community](https://discord.gg/firecrawl-clone)
4. Contact the maintainers directly

---

**Happy coding!** 🚀

*This developer guide is a living document. Keep it updated as the project evolves.*