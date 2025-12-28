/**
 * Mock Provider for Local Testing
 * Simulates AI responses when API keys are not available
 */

export class MockProvider {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async generateResponse(prompt: string, context?: any): Promise<string> {
    // Simulate API latency
    await this.delay(500 + Math.random() * 1000);

    // Parse the prompt to understand what's being asked
    const promptLower = prompt.toLowerCase();

    // Website cloning responses
    if (promptLower.includes('clone') || promptLower.includes('website')) {
      return this.generateWebsiteCloneResponse();
    }

    // Component generation responses
    if (promptLower.includes('component') || promptLower.includes('react')) {
      return this.generateComponentResponse();
    }

    // Code generation responses
    if (promptLower.includes('code') || promptLower.includes('function')) {
      return this.generateCodeResponse();
    }

    // Analysis responses
    if (promptLower.includes('analyze') || promptLower.includes('review')) {
      return this.generateAnalysisResponse();
    }

    // Default response
    return this.generateDefaultResponse();
  }

  private generateWebsiteCloneResponse(): string {
    return JSON.stringify({
      status: 'success',
      message: 'Website analysis complete',
      data: {
        structure: {
          pages: ['index.html', 'about.html', 'contact.html'],
          assets: {
            css: ['styles/main.css', 'styles/responsive.css'],
            js: ['scripts/app.js', 'scripts/utils.js'],
            images: ['logo.png', 'hero.jpg', 'team.jpg']
          }
        },
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
        features: ['Responsive design', 'Contact form', 'Image gallery'],
        recommendations: [
          'Convert to React components for better maintainability',
          'Add TypeScript for type safety',
          'Implement lazy loading for images'
        ]
      }
    }, null, 2);
  }

  private generateComponentResponse(): string {
    return `import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

// Mock generated - Replace with actual AI response when API keys are configured`;
  }

  private generateCodeResponse(): string {
    return `/**
 * Mock Function Implementation
 * This is a simulated response for testing purposes
 */

function processData(input: any[]): any[] {
  // Simulate data processing
  return input
    .filter(item => item !== null && item !== undefined)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }))
    .sort((a, b) => a.id - b.id);
}

// Example usage
const data = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  null,
  { id: 3, name: 'Item 3' }
];

const result = processData(data);
console.log('Processed:', result);

// Note: This is mock data for testing. Configure API keys for actual AI responses.`;
  }

  private generateAnalysisResponse(): string {
    return JSON.stringify({
      analysis: {
        summary: 'Code analysis complete',
        metrics: {
          complexity: 'Medium',
          maintainability: 'Good',
          performance: 'Optimal',
          security: 'No issues detected'
        },
        suggestions: [
          'Consider adding error handling for edge cases',
          'Implement caching for improved performance',
          'Add comprehensive unit tests'
        ],
        codeQuality: {
          score: 85,
          grade: 'B+',
          issues: {
            critical: 0,
            major: 2,
            minor: 5
          }
        }
      },
      note: 'This is simulated analysis. Configure API keys for real AI analysis.'
    }, null, 2);
  }

  private generateDefaultResponse(): string {
    return `Mock response generated for testing purposes.

This is a simulated AI response because no API keys are configured.

To enable real AI responses, please add your API keys to the .env.local file:
- OpenAI: OPENAI_API_KEY
- Anthropic: ANTHROPIC_API_KEY
- Google AI: GOOGLE_AI_API_KEY

The application is running in mock mode and will provide simulated responses for testing.`;
  }

  // Simulate streaming responses
  async *streamResponse(prompt: string): AsyncGenerator<string> {
    const response = await this.generateResponse(prompt);
    const words = response.split(' ');
    
    for (const word of words) {
      yield word + ' ';
      await this.delay(50 + Math.random() * 100);
    }
  }
}

export const mockProvider = new MockProvider();