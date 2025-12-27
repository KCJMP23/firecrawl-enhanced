import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BillingSubscriptionManagement from '@/components/BillingSubscriptionManagement'

describe('BillingSubscriptionManagement', () => {
  it('renders billing and subscription management interface', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Billing & Subscription Management')).toBeInTheDocument()
    expect(screen.getByText('Manage your subscription, usage, and billing preferences')).toBeInTheDocument()
  })

  it('displays all subscription plans', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows pricing for each plan', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('$29/month')).toBeInTheDocument()
    expect(screen.getByText('$99/month')).toBeInTheDocument()
    expect(screen.getByText('$299/month')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('highlights the popular plan', () => {
    render(<BillingSubscriptionManagement />)
    
    const proCard = screen.getByText('Pro').closest('.rounded-lg')
    expect(proCard?.querySelector('.bg-gradient-to-r')).toBeInTheDocument()
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('shows current subscription status', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Current Plan')).toBeInTheDocument()
    expect(screen.getByText('Pro Plan')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Next billing: January 15, 2024')).toBeInTheDocument()
  })

  it('displays usage metrics', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Usage Metrics')).toBeInTheDocument()
    expect(screen.getByText('Projects Created')).toBeInTheDocument()
    expect(screen.getByText('AI API Calls')).toBeInTheDocument()
    expect(screen.getByText('Storage Used')).toBeInTheDocument()
    expect(screen.getByText('Team Members')).toBeInTheDocument()
  })

  it('shows usage progress bars', () => {
    render(<BillingSubscriptionManagement />)
    
    // Check for usage percentages
    expect(screen.getByText('32 / 50')).toBeInTheDocument() // Projects
    expect(screen.getByText('8.4K / 10K')).toBeInTheDocument() // API calls
    expect(screen.getByText('3.2 / 5.0 GB')).toBeInTheDocument() // Storage
    expect(screen.getByText('7 / 10')).toBeInTheDocument() // Team members
  })

  it('displays billing history', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Billing History')).toBeInTheDocument()
    expect(screen.getByText('Download')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('$99.00')).toBeInTheDocument()
  })

  it('shows payment methods section', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Payment Methods')).toBeInTheDocument()
    expect(screen.getByText('•••• •••• •••• 4242')).toBeInTheDocument()
    expect(screen.getByText('Expires 12/25')).toBeInTheDocument()
    expect(screen.getByText('Add Payment Method')).toBeInTheDocument()
  })

  it('allows billing cycle toggle', async () => {
    const user = userEvent.setup()
    
    render(<BillingSubscriptionManagement />)
    
    const monthlyButton = screen.getByText('Monthly')
    const yearlyButton = screen.getByText('Yearly')
    
    expect(monthlyButton.closest('button')).toHaveClass('bg-white/10')
    
    await user.click(yearlyButton)
    expect(yearlyButton.closest('button')).toHaveClass('bg-white/10')
    expect(monthlyButton.closest('button')).not.toHaveClass('bg-white/10')
  })

  it('shows yearly savings badge', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Save 17%')).toBeInTheDocument()
  })

  it('displays plan features correctly', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('10 projects')).toBeInTheDocument()
    expect(screen.getByText('5GB storage')).toBeInTheDocument()
    expect(screen.getByText('Email support')).toBeInTheDocument()
    expect(screen.getByText('Unlimited projects')).toBeInTheDocument()
    expect(screen.getByText('Priority support')).toBeInTheDocument()
  })

  it('handles plan upgrade/downgrade buttons', async () => {
    const user = userEvent.setup()
    
    render(<BillingSubscriptionManagement />)
    
    const upgradeButtons = screen.getAllByText('Choose Plan')
    expect(upgradeButtons.length).toBeGreaterThan(0)
    
    await user.click(upgradeButtons[0])
    // Button should be clickable (no error thrown)
  })

  it('shows invoice download functionality', async () => {
    const user = userEvent.setup()
    
    render(<BillingSubscriptionManagement />)
    
    const downloadButtons = screen.getAllByText('Download')
    expect(downloadButtons.length).toBeGreaterThan(0)
    
    await user.click(downloadButtons[0])
    // Button should be clickable (no error thrown)
  })

  it('displays proper usage warnings when approaching limits', () => {
    render(<BillingSubscriptionManagement />)
    
    // Check for usage percentages that might trigger warnings
    const usageBars = screen.getAllByRole('progressbar')
    expect(usageBars.length).toBeGreaterThan(0)
  })

  it('shows contact sales for enterprise plan', () => {
    render(<BillingSubscriptionManagement />)
    
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('displays current plan badge correctly', () => {
    render(<BillingSubscriptionManagement />)
    
    const currentPlanBadge = screen.getByText('Current Plan')
    expect(currentPlanBadge).toBeInTheDocument()
    expect(currentPlanBadge.closest('div')).toHaveClass('bg-green-500/20')
  })
})