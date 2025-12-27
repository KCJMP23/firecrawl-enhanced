import { render, screen } from '@testing-library/react'

// Simple component tests that focus on basic functionality

describe('Simple Component Tests', () => {
  it('should render basic components', () => {
    const TestComponent = () => <div>Hello World</div>
    render(<TestComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle button clicks', () => {
    const mockClick = jest.fn()
    const Button = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
      <button onClick={onClick}>{children}</button>
    )
    
    render(<Button onClick={mockClick}>Click me</Button>)
    const button = screen.getByText('Click me')
    button.click()
    expect(mockClick).toHaveBeenCalled()
  })

  it('should display text content', () => {
    const Card = ({ title, content }: { title: string, content: string }) => (
      <div>
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
    )
    
    render(<Card title="Test Title" content="Test Content" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should handle conditional rendering', () => {
    const ConditionalComponent = ({ show }: { show: boolean }) => (
      <div>
        {show && <span>Visible</span>}
        {!show && <span>Hidden</span>}
      </div>
    )
    
    const { rerender } = render(<ConditionalComponent show={true} />)
    expect(screen.getByText('Visible')).toBeInTheDocument()
    
    rerender(<ConditionalComponent show={false} />)
    expect(screen.getByText('Hidden')).toBeInTheDocument()
  })
})