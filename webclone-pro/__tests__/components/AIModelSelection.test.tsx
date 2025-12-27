import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIModelSelection from '@/components/AIModelSelection'

describe('AIModelSelection', () => {
  it('renders AI model selection interface', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('AI Model Selection')).toBeInTheDocument()
    expect(screen.getByText('Choose the perfect AI model for your specific needs')).toBeInTheDocument()
  })

  it('displays all available AI models', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument()
    expect(screen.getByText('Claude 3 Opus')).toBeInTheDocument()
    expect(screen.getByText('Codestral')).toBeInTheDocument()
    expect(screen.getByText('Gemini Pro')).toBeInTheDocument()
    expect(screen.getByText('LLaMA 2 70B')).toBeInTheDocument()
    expect(screen.getByText('PaLM 2')).toBeInTheDocument()
  })

  it('shows model details and pricing', () => {
    render(<AIModelSelection />)
    
    // Check for pricing information
    expect(screen.getByText(/\$0\.01.*per 1K input tokens/)).toBeInTheDocument()
    expect(screen.getByText(/\$0\.03.*per 1K output tokens/)).toBeInTheDocument()
  })

  it('allows selecting different models', async () => {
    const user = userEvent.setup()
    
    render(<AIModelSelection />)
    
    const gpt4Card = screen.getByText('GPT-4 Turbo').closest('.rounded-lg')
    const claudeCard = screen.getByText('Claude 3 Opus').closest('.rounded-lg')
    
    // Select GPT-4
    await user.click(gpt4Card!)
    expect(gpt4Card).toHaveClass('border-blue-500')
    
    // Select Claude
    await user.click(claudeCard!)
    expect(claudeCard).toHaveClass('border-blue-500')
    expect(gpt4Card).not.toHaveClass('border-blue-500')
  })

  it('displays model configurations', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('Model Configuration')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('Max Tokens')).toBeInTheDocument()
    expect(screen.getByText('Top P')).toBeInTheDocument()
  })

  it('shows configuration presets', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('Creative')).toBeInTheDocument()
    expect(screen.getByText('Balanced')).toBeInTheDocument()
    expect(screen.getByText('Precise')).toBeInTheDocument()
  })

  it('displays model benchmarks', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('Model Benchmarks')).toBeInTheDocument()
    expect(screen.getByText('Code Generation')).toBeInTheDocument()
    expect(screen.getByText('Text Quality')).toBeInTheDocument()
    expect(screen.getByText('Response Speed')).toBeInTheDocument()
    expect(screen.getByText('Cost Efficiency')).toBeInTheDocument()
  })

  it('shows usage analytics section', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('Usage Analytics')).toBeInTheDocument()
    expect(screen.getByText('Tokens Used')).toBeInTheDocument()
    expect(screen.getByText('API Calls')).toBeInTheDocument()
    expect(screen.getByText('Total Cost')).toBeInTheDocument()
  })

  it('includes model playground functionality', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('Model Playground')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your prompt here...')).toBeInTheDocument()
    expect(screen.getByText('Test Model')).toBeInTheDocument()
  })

  it('allows changing configuration presets', async () => {
    const user = userEvent.setup()
    
    render(<AIModelSelection />)
    
    const creativePreset = screen.getByText('Creative')
    const precisePreset = screen.getByText('Precise')
    
    await user.click(creativePreset)
    expect(creativePreset.closest('button')).toHaveClass('bg-blue-600')
    
    await user.click(precisePreset)
    expect(precisePreset.closest('button')).toHaveClass('bg-blue-600')
    expect(creativePreset.closest('button')).not.toHaveClass('bg-blue-600')
  })

  it('displays model comparison correctly', () => {
    render(<AIModelSelection />)
    
    // Check for benchmark scores
    expect(screen.getByText('95')).toBeInTheDocument() // GPT-4 code generation
    expect(screen.getByText('92')).toBeInTheDocument() // Claude text quality
    expect(screen.getByText('88')).toBeInTheDocument() // Various benchmark scores
  })

  it('shows real-time usage metrics', () => {
    render(<AIModelSelection />)
    
    expect(screen.getByText('247.5K')).toBeInTheDocument() // Tokens used
    expect(screen.getByText('1,234')).toBeInTheDocument() // API calls
    expect(screen.getByText('$47.83')).toBeInTheDocument() // Total cost
  })

  it('handles playground input and testing', async () => {
    const user = userEvent.setup()
    
    render(<AIModelSelection />)
    
    const promptInput = screen.getByPlaceholderText('Enter your prompt here...')
    const testButton = screen.getByText('Test Model')
    
    await user.type(promptInput, 'Generate a React component')
    expect(promptInput).toHaveValue('Generate a React component')
    
    await user.click(testButton)
    // The button should be clickable (no error thrown)
  })
})