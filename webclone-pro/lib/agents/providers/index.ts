// Multi-Model AI Provider System
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelProvider } from '../types';
import { mockProvider } from '../mock-provider';

export type { ModelProvider } from '../types';

export interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export class OpenAIProvider implements ModelProvider {
  name = 'openai';
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateResponse(prompt: string, config: ModelConfig = {}): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: config.maxTokens && config.maxTokens > 4096 ? 'gpt-4-turbo' : 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 4000,
        top_p: config.topP ?? 1,
        frequency_penalty: config.frequencyPenalty ?? 0,
        presence_penalty: config.presencePenalty ?? 0,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI generation failed: ${error}`);
    }
  }

  calculateCost(tokens: number): number {
    // GPT-3.5-turbo: $0.001/1k tokens, GPT-4: $0.03/1k tokens
    const gpt35Cost = 0.001;
    const gpt4Cost = 0.03;
    return tokens > 4096 ? (tokens * gpt4Cost) / 1000 : (tokens * gpt35Cost) / 1000;
  }

  getMaxTokens(): number {
    return 16000; // Conservative limit for GPT-4
  }
}

export class AnthropicProvider implements ModelProvider {
  name = 'anthropic';
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateResponse(prompt: string, config: ModelConfig = {}): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: config.maxTokens ?? 4000,
        temperature: config.temperature ?? 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.content[0]?.type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Anthropic generation failed: ${error}`);
    }
  }

  calculateCost(tokens: number): number {
    // Claude-3.5-Sonnet: $0.003/1k input tokens, $0.015/1k output tokens
    const inputCost = 0.003;
    const outputCost = 0.015;
    // Assume 70% input, 30% output split
    return (tokens * 0.7 * inputCost + tokens * 0.3 * outputCost) / 1000;
  }

  getMaxTokens(): number {
    return 200000; // Claude-3.5-Sonnet context window
  }
}

export class GoogleProvider implements ModelProvider {
  name = 'google';
  private client: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(prompt: string, config: ModelConfig = {}): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          maxOutputTokens: config.maxTokens ?? 4000,
          topP: config.topP ?? 1,
        },
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Google AI API error:', error);
      throw new Error(`Google AI generation failed: ${error}`);
    }
  }

  calculateCost(tokens: number): number {
    // Gemini 1.5 Pro: $0.00125/1k input tokens, $0.00375/1k output tokens
    const inputCost = 0.00125;
    const outputCost = 0.00375;
    // Assume 70% input, 30% output split
    return (tokens * 0.7 * inputCost + tokens * 0.3 * outputCost) / 1000;
  }

  getMaxTokens(): number {
    return 1000000; // Gemini 1.5 Pro context window
  }
}

// Model Router for Cost Optimization
export class ModelRouter {
  private providers: Map<string, ModelProvider> = new Map();
  
  constructor() {
    this.setupProviders();
  }

  private setupProviders() {
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    const useMockMode = process.env.ENABLE_MOCK_MODE === 'true' || 
                        openaiKey === 'demo' || 
                        anthropicKey === 'demo' || 
                        googleKey === 'demo';

    // If any key is 'demo' or mock mode is enabled, use mock provider
    if (useMockMode || (!openaiKey && !anthropicKey && !googleKey)) {
      console.log('🤖 Running in mock mode - using simulated AI responses');
      // Create a mock wrapper that implements ModelProvider interface
      const mockWrapper = {
        name: 'mock',
        generateResponse: (prompt: string) => mockProvider.generateResponse(prompt),
        calculateCost: (tokens: number) => 0,
        getMaxTokens: () => 100000,
      };
      this.providers.set('mock', mockWrapper);
      return;
    }

    if (openaiKey && openaiKey !== 'demo') {
      this.providers.set('openai', new OpenAIProvider(openaiKey));
    }
    if (anthropicKey && anthropicKey !== 'demo') {
      this.providers.set('anthropic', new AnthropicProvider(anthropicKey));
    }
    if (googleKey && googleKey !== 'demo') {
      this.providers.set('google', new GoogleProvider(googleKey));
    }
  }

  selectOptimalModel(
    prompt: string,
    requirements: {
      maxCost?: number;
      preferredProvider?: string;
      complexity?: 'low' | 'medium' | 'high';
      contextLength?: number;
    } = {}
  ): { provider: ModelProvider; estimatedCost: number } {
    const promptTokens = this.estimateTokens(prompt);
    const totalTokens = promptTokens + (requirements.contextLength || 0);

    // Filter providers based on context length requirements
    const availableProviders = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.getMaxTokens() >= totalTokens);

    if (availableProviders.length === 0) {
      throw new Error('No provider can handle the required context length');
    }

    // If preferred provider is specified and available, use it
    if (requirements.preferredProvider) {
      const preferredProvider = this.providers.get(requirements.preferredProvider);
      if (preferredProvider && preferredProvider.getMaxTokens() >= totalTokens) {
        return {
          provider: preferredProvider,
          estimatedCost: preferredProvider.calculateCost(totalTokens)
        };
      }
    }

    // Select based on cost optimization
    let bestProvider: ModelProvider | null = null;
    let lowestCost = Infinity;

    for (const [name, provider] of availableProviders) {
      const cost = provider.calculateCost(totalTokens);
      
      // Apply complexity multiplier for quality considerations
      let adjustedCost = cost;
      if (requirements.complexity === 'high' && name === 'openai') {
        adjustedCost *= 0.8; // Prefer GPT-4 for complex tasks
      } else if (requirements.complexity === 'low' && name === 'google') {
        adjustedCost *= 0.9; // Prefer Gemini for simple tasks
      }

      if (adjustedCost < lowestCost && (!requirements.maxCost || cost <= requirements.maxCost)) {
        lowestCost = cost;
        bestProvider = provider;
      }
    }

    if (!bestProvider) {
      throw new Error('No provider meets the cost requirements');
    }

    return { provider: bestProvider, estimatedCost: lowestCost };
  }

  private estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  getProvider(name: string): ModelProvider | undefined {
    return this.providers.get(name);
  }

  listAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}