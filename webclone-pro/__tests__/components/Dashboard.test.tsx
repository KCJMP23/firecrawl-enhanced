import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '@/app/dashboard/page'
import { createClient } from '@/lib/supabase/client'

// Mock the dynamic imports
jest.mock('next/dynamic', () => {
  return (importFn: any) => {
    const DynamicComponent = (props: any) => <div {...props}>Mocked Component</div>
    DynamicComponent.displayName = 'MockedDynamicComponent'
    return DynamicComponent
  }
})

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            email: 'test@example.com',
            id: 'user-123',
          },
        },
      },
    })
  })

  it('renders loading state initially', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  it('redirects to auth if no session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })
  })

  it('renders dashboard with user data', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Welcome back, test')).toBeInTheDocument()
    expect(screen.getByText('Apple Homepage Clone')).toBeInTheDocument()
    expect(screen.getByText('Stripe Landing Page')).toBeInTheDocument()
    expect(screen.getByText('Netflix Interface')).toBeInTheDocument()
  })

  it('displays project statistics correctly', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Projects')).toBeInTheDocument()
    })

    expect(screen.getByText('3')).toBeInTheDocument() // Total projects count
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Credits Left')).toBeInTheDocument()
  })

  it('filters projects based on search term', async () => {
    const user = userEvent.setup()
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Apple Homepage Clone')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search projects...')
    await user.type(searchInput, 'Apple')

    expect(screen.getByText('Apple Homepage Clone')).toBeInTheDocument()
    expect(screen.queryByText('Stripe Landing Page')).not.toBeInTheDocument()
  })

  it('handles sign out correctly', async () => {
    const user = userEvent.setup()
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    const signOutButton = screen.getByRole('button', { name: /log.*out/i })
    await user.click(signOutButton)

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('shows different status indicators for projects', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument()
    })

    expect(screen.getByText('cloning')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('displays quick actions with correct links', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    expect(screen.getByText('Clone Website')).toBeInTheDocument()
    expect(screen.getByText('AI Models')).toBeInTheDocument()
    expect(screen.getByText('AI Remix')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })

  it('shows empty state when no projects match search', async () => {
    const user = userEvent.setup()
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Apple Homepage Clone')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search projects...')
    await user.type(searchInput, 'nonexistent')

    expect(screen.getByText('No projects found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search terms.')).toBeInTheDocument()
  })

  it('displays navigation links correctly', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('WebClone Pro')).toBeInTheDocument()
    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText('Teams')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })
})