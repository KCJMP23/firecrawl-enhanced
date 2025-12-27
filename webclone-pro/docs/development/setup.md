# Developer Setup Guide

## Prerequisites

Before you begin development on WebClone Pro 2026, ensure you have the following installed:

### Required Software

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 8.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
  - GitLens

### Required Accounts & Services

- **Supabase** account ([supabase.com](https://supabase.com))
- **OpenAI** API key ([openai.com](https://openai.com))
- **Stripe** account for payments ([stripe.com](https://stripe.com))
- **Liveblocks** account for collaboration ([liveblocks.io](https://liveblocks.io))

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/webclone-pro-2026.git
cd webclone-pro-2026
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 15 with React 19
- TypeScript 5.7+
- Tailwind CSS 3.4+
- Supabase client libraries
- OpenAI SDK
- Liveblocks collaboration tools

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
DATABASE_URL=your_postgres_connection_string

# AI Services
OPENAI_API_KEY=sk-your_openai_api_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Collaboration
LIVEBLOCKS_SECRET_KEY=sk_your_liveblocks_secret
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_your_liveblocks_public

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Setup

#### Initialize Supabase

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db reset
```

#### Database Migrations

The project includes comprehensive SQL migrations:

```bash
# Apply all migrations
supabase db push

# Or run individual migrations
supabase migration up 20241220_initial_schema.sql
supabase migration up 20241220_create_pdf_documents.sql
supabase migration up 20241221_create_usage_tables.sql
```

#### Enable Required Extensions

```sql
-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_documents ENABLE ROW LEVEL SECURITY;
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Workflow

### Code Structure

```
webclone-pro/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API endpoints
│   ├── dashboard/         # Main dashboard
│   ├── admin/            # Admin panel
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── lib/                 # Utility libraries
│   ├── supabase/       # Database client
│   ├── ai-cost-optimizer.ts
│   ├── pdf-processor.ts
│   └── utils.ts
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── docs/               # Documentation
├── supabase/          # Database migrations
│   └── migrations/
└── public/            # Static assets
```

### Branch Strategy

We follow a Git Flow branching strategy:

```
main                    # Production-ready code
├── develop            # Integration branch
│   ├── feature/       # Feature branches
│   │   ├── feature/pdf-processing
│   │   ├── feature/ai-optimization
│   │   └── feature/real-time-collab
│   ├── hotfix/        # Critical bug fixes
│   └── release/       # Release preparation
```

#### Creating Feature Branches

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name develop

# Work on your feature
git add .
git commit -m "feat: implement your feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request to develop branch
```

### Code Quality Standards

#### TypeScript Configuration

The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### ESLint Configuration

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "useTabs": false
}
```

### Testing Strategy

#### Unit Testing with Jest

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test components/ui/Button.test.tsx
```

#### Example Test

```typescript
// __tests__/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Integration Testing with Playwright

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Generate test code
npx playwright codegen localhost:3000
```

#### Example E2E Test

```typescript
// tests/e2e/project-creation.spec.ts
import { test, expect } from '@playwright/test'

test('user can create a new project', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Login
  await page.click('text=Sign In')
  await page.fill('[data-testid=email]', 'test@example.com')
  await page.fill('[data-testid=password]', 'password')
  await page.click('[data-testid=submit]')
  
  // Create project
  await page.click('text=New Project')
  await page.fill('[data-testid=project-name]', 'Test Website')
  await page.fill('[data-testid=source-url]', 'https://example.com')
  await page.selectOption('[data-testid=framework]', 'react')
  await page.click('[data-testid=create-project]')
  
  // Verify creation
  await expect(page.locator('text=Processing started')).toBeVisible()
  await expect(page.locator('[data-testid=project-status]')).toHaveText('processing')
})
```

## API Development

### Creating New API Endpoints

API routes follow Next.js 15 App Router conventions:

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, sourceUrl, framework } = body

    // Validate input
    if (!name || !sourceUrl) {
      return NextResponse.json(
        { error: 'Name and source URL are required' },
        { status: 400 }
      )
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: session.user.id,
        name,
        source_url: sourceUrl,
        framework: framework || 'react',
        status: 'processing'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Trigger background processing
    await triggerProjectProcessing(project.id)

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### Database Queries

Use Supabase client with TypeScript:

```typescript
// lib/database/projects.ts
import { createClient } from '@/lib/supabase/server'

export interface Project {
  id: string
  user_id: string
  name: string
  source_url: string
  status: 'processing' | 'completed' | 'failed'
  framework: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export class ProjectService {
  private supabase = createClient()

  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    return data
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return data
  }

  async updateProjectStatus(
    projectId: string, 
    status: Project['status']
  ): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', projectId)

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }
  }
}
```

## Frontend Development

### Component Development

Use shadcn/ui components with TypeScript:

```typescript
// components/project/ProjectCard.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Globe, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600'
      case 'processing':
        return 'bg-blue-600'
      case 'failed':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription className="text-sm">
                {project.source_url}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {getStatusIcon(project.status)}
            <span className="ml-1 capitalize">{project.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {project.status === 'processing' && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Processing...</span>
                <span>{project.metadata.progress || 0}%</span>
              </div>
              <Progress value={project.metadata.progress || 0} />
            </div>
          )}

          {project.metadata.components && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{project.metadata.components} components</span>
              <span>{project.metadata.animations} animations</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {new Date(project.created_at).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(project)}
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(project)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### State Management

Use React Context for global state:

```typescript
// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      signUp
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
```

## Deployment

### Environment Setup

#### Staging Environment

```bash
# Build for staging
npm run build

# Test production build locally
npm start

# Deploy to Vercel staging
vercel --target staging

# Run database migrations on staging
supabase db push --environment staging
```

#### Production Deployment

```bash
# Final build and test
npm run build
npm run test
npm run test:e2e

# Deploy to production
vercel --prod

# Run production migrations
supabase db push --environment production

# Verify deployment
curl https://app.webclonepro.com/api/health
```

### Environment Variables

Production environment requires:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key

# AI Services
OPENAI_API_KEY=sk-your_production_openai_key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_production_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Collaboration
LIVEBLOCKS_SECRET_KEY=sk_prod_your_liveblocks_secret
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_prod_your_liveblocks_public

# App Configuration
NEXT_PUBLIC_APP_URL=https://app.webclonepro.com
NODE_ENV=production
```

## Monitoring & Debugging

### Development Tools

#### Database Monitoring

```bash
# View real-time logs
supabase logs

# Monitor queries
supabase db logs

# Check performance
supabase db analyze
```

#### API Testing

```bash
# Test API endpoints
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer your_jwt_token"

# Test with different methods
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"name": "Test Project", "sourceUrl": "https://example.com"}'
```

### Performance Monitoring

#### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npx depcheck

# Audit for security issues
npm audit
```

#### Performance Profiling

```typescript
// Use React DevTools Profiler
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  console.log('Profiler:', { id, phase, actualDuration })
}

<Profiler id="ProjectList" onRender={onRenderCallback}>
  <ProjectList projects={projects} />
</Profiler>
```

## Contributing Guidelines

### Code Style

1. **Use TypeScript**: All new code must be TypeScript
2. **Follow ESLint rules**: Fix all linting errors
3. **Write tests**: Include unit tests for new features
4. **Document APIs**: Add JSDoc comments for functions
5. **Use semantic commits**: Follow conventional commit format

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(projects): add real-time progress updates"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs(api): update authentication documentation"
```

### Pull Request Process

1. **Create feature branch** from `develop`
2. **Implement changes** with tests
3. **Run all checks** locally
4. **Create pull request** with description
5. **Address review feedback**
6. **Merge after approval**

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] All tests pass
- [ ] No ESLint errors
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Documentation updated
- [ ] Backward compatibility maintained

This development setup ensures a productive and consistent development experience for all contributors to WebClone Pro 2026.