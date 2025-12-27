import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for E2E tests
    await page.route('**/auth/v1/token**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        }),
      })
    })

    // Mock session endpoint
    await page.route('**/auth/v1/user**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
        }),
      })
    })

    await page.goto('/dashboard')
  })

  test('should load dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/WebClone Pro/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should display navigation correctly', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('text=WebClone Pro')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Templates')).toBeVisible()
    await expect(page.locator('text=Teams')).toBeVisible()
    await expect(page.locator('text=Analytics')).toBeVisible()
  })

  test('should show project statistics', async ({ page }) => {
    await expect(page.locator('text=Total Projects')).toBeVisible()
    await expect(page.locator('text=Completed')).toBeVisible()
    await expect(page.locator('text=In Progress')).toBeVisible()
    await expect(page.locator('text=Credits Left')).toBeVisible()
  })

  test('should display quick actions', async ({ page }) => {
    await expect(page.locator('text=Quick Actions')).toBeVisible()
    await expect(page.locator('text=Clone Website')).toBeVisible()
    await expect(page.locator('text=AI Models')).toBeVisible()
    await expect(page.locator('text=AI Remix')).toBeVisible()
    await expect(page.locator('text=Deploy')).toBeVisible()
  })

  test('should show project cards', async ({ page }) => {
    await expect(page.locator('text=Apple Homepage Clone')).toBeVisible()
    await expect(page.locator('text=Stripe Landing Page')).toBeVisible()
    await expect(page.locator('text=Netflix Interface')).toBeVisible()
  })

  test('should filter projects with search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search projects..."]')
    await searchInput.fill('Apple')
    
    await expect(page.locator('text=Apple Homepage Clone')).toBeVisible()
    await expect(page.locator('text=Stripe Landing Page')).not.toBeVisible()
  })

  test('should navigate to AI models page', async ({ page }) => {
    await page.locator('text=AI Models').click()
    await expect(page.url()).toContain('/ai-models')
    await expect(page.locator('text=AI Model Configuration')).toBeVisible()
  })

  test('should navigate to new project page', async ({ page }) => {
    await page.locator('text=New Project').first().click()
    await expect(page.url()).toContain('/dashboard/new')
  })

  test('should show user welcome message', async ({ page }) => {
    await expect(page.locator('text=Welcome back, test')).toBeVisible()
  })

  test('should display project status badges correctly', async ({ page }) => {
    await expect(page.locator('text=completed')).toBeVisible()
    await expect(page.locator('text=cloning')).toBeVisible()
    await expect(page.locator('text=pending')).toBeVisible()
  })

  test('should show progress bars for active projects', async ({ page }) => {
    // Check for progress indicators
    const progressBars = page.locator('[role="progressbar"], .bg-gradient-to-r')
    await expect(progressBars.first()).toBeVisible()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('text=Quick Actions')).toBeVisible()
  })

  test('should handle settings navigation', async ({ page }) => {
    await page.locator('text=Settings').click()
    await expect(page.url()).toContain('/settings')
  })

  test('should display project creation date', async ({ page }) => {
    // Look for date patterns in project cards
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/
    const projectCard = page.locator('text=Apple Homepage Clone').locator('..').locator('..')
    await expect(projectCard).toContainText(datePattern)
  })

  test('should show correct project actions based on status', async ({ page }) => {
    // Completed project should have Edit and AI Chat buttons
    const appleProject = page.locator('text=Apple Homepage Clone').locator('..').locator('..')
    await expect(appleProject.locator('text=Edit')).toBeVisible()
    await expect(appleProject.locator('text=AI Chat')).toBeVisible()
    
    // In-progress project should have Pause button
    const stripeProject = page.locator('text=Stripe Landing Page').locator('..').locator('..')
    await expect(stripeProject.locator('text=Pause')).toBeVisible()
  })
})

test.describe('AI Models Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/auth/v1/token**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' },
        }),
      })
    })

    await page.goto('/ai-models')
  })

  test('should load AI models page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI Model Configuration')
    await expect(page.locator('text=Configure and manage your AI models')).toBeVisible()
  })

  test('should display all AI model options', async ({ page }) => {
    await expect(page.locator('text=GPT-4 Turbo')).toBeVisible()
    await expect(page.locator('text=Claude 3 Opus')).toBeVisible()
    await expect(page.locator('text=Codestral')).toBeVisible()
    await expect(page.locator('text=Gemini Pro')).toBeVisible()
  })

  test('should allow model selection', async ({ page }) => {
    const gpt4Card = page.locator('text=GPT-4 Turbo').locator('..')
    await gpt4Card.click()
    
    // Check if the card gets selected (border color change)
    await expect(gpt4Card).toHaveClass(/border-blue-500/)
  })

  test('should show model configuration options', async ({ page }) => {
    await expect(page.locator('text=Model Configuration')).toBeVisible()
    await expect(page.locator('text=Temperature')).toBeVisible()
    await expect(page.locator('text=Max Tokens')).toBeVisible()
    await expect(page.locator('text=Top P')).toBeVisible()
  })

  test('should display model playground', async ({ page }) => {
    await expect(page.locator('text=Model Playground')).toBeVisible()
    await expect(page.locator('placeholder=Enter your prompt here...')).toBeVisible()
    await expect(page.locator('text=Test Model')).toBeVisible()
  })

  test('should handle playground input', async ({ page }) => {
    const promptInput = page.locator('placeholder=Enter your prompt here...')
    await promptInput.fill('Generate a React component for a button')
    
    await expect(promptInput).toHaveValue('Generate a React component for a button')
    
    const testButton = page.locator('text=Test Model')
    await testButton.click()
  })

  test('should navigate back to dashboard', async ({ page }) => {
    await page.locator('text=Back to Dashboard').click()
    await expect(page.url()).toContain('/dashboard')
  })
})