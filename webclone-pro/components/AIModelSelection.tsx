'use client'

import { useState, useEffect } from 'react'
import {
  Brain,
  Zap,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Sliders,
  Code,
  FileText,
  Image,
  MessageSquare,
  Cpu,
  BarChart3,
  Target,
  Award,
  Shield,
  Globe,
  RefreshCw,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit3,
  Copy,
  Download,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Database,
  Cloud,
  Lock,
  Unlock,
  Timer,
  Gauge,
  Flame,
  Snowflake,
  Lightbulb,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { ModelCard } from '@/components/ai-models/ModelCard'
import { ConfigurationCard } from '@/components/ai-models/ConfigurationCard'
import { BenchmarkChart } from '@/components/ai-models/BenchmarkChart'

interface AIModel {
  id: string
  name: string
  provider: string
  version: string
  description: string
  capabilities: string[]
  strengths: string[]
  limitations: string[]
  pricing: {
    inputTokens: number
    outputTokens: number
    currency: string
    unit: string
  }
  performance: {
    speed: 'fast' | 'medium' | 'slow'
    quality: 'high' | 'medium' | 'low'
    accuracy: number
    efficiency: number
  }
  specifications: {
    contextWindow: number
    maxTokens: number
    multimodal: boolean
    languages: string[]
    trainingCutoff: string
  }
  usage: {
    totalRequests: number
    successRate: number
    averageLatency: number
    costThisMonth: number
    trend: 'up' | 'down' | 'stable'
  }
  status: 'available' | 'deprecated' | 'beta' | 'maintenance'
  category: 'text' | 'code' | 'multimodal' | 'reasoning' | 'creative'
  icon: React.ReactNode
  color: string
  popular?: boolean
  recommended?: boolean
}

interface ModelConfiguration {
  id: string
  modelId: string
  name: string
  description: string
  parameters: {
    temperature: number
    topP: number
    topK?: number
    maxTokens: number
    frequencyPenalty: number
    presencePenalty: number
  }
  systemPrompt: string
  isDefault: boolean
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

interface ModelBenchmark {
  modelId: string
  testName: string
  score: number
  category: 'reasoning' | 'coding' | 'creative' | 'factual' | 'safety'
  benchmark: string
  lastUpdated: Date
}

interface UsageAnalytics {
  modelId: string
  period: '24h' | '7d' | '30d'
  metrics: {
    requests: number
    tokens: number
    cost: number
    latency: number
    errors: number
    successRate: number
  }
  trend: {
    requests: number
    cost: number
    latency: number
  }
}

function SimpleButton({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false,
  ...props 
}: {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = 
    variant === 'outline' ? 'border border-white/20 bg-transparent hover:bg-white/10 text-white' :
    variant === 'ghost' ? 'hover:bg-white/10 text-white' :
    variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
    'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
  const sizeClasses = 
    size === 'sm' ? 'h-8 px-3 text-sm' : 
    size === 'lg' ? 'h-12 px-8 text-lg' :
    size === 'icon' ? 'h-10 w-10' :
    'h-10 px-4 py-2'
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${className}`}>
      {children}
    </div>
  )
}




export default function AIModelSelection() {
  const [selectedTab, setSelectedTab] = useState<'models' | 'configurations' | 'benchmarks' | 'usage' | 'playground'>('models')
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4-turbo'])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [searchTerm, setSearchTerm] = useState('')

  const aiModels: AIModel[] = [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      version: '1106',
      description: 'Most advanced model with superior reasoning and code generation capabilities',
      capabilities: ['Text Generation', 'Code Generation', 'Analysis', 'Creative Writing', 'Q&A'],
      strengths: ['Complex reasoning', 'Code quality', 'Instruction following', 'Consistency'],
      limitations: ['Higher cost', 'Rate limits', 'Longer latency'],
      pricing: { inputTokens: 0.01, outputTokens: 0.03, currency: 'USD', unit: '1K tokens' },
      performance: { speed: 'medium', quality: 'high', accuracy: 94, efficiency: 85 },
      specifications: {
        contextWindow: 128000,
        maxTokens: 4096,
        multimodal: true,
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
        trainingCutoff: 'April 2024'
      },
      usage: {
        totalRequests: 45231,
        successRate: 98.7,
        averageLatency: 1850,
        costThisMonth: 423.50,
        trend: 'up'
      },
      status: 'available',
      category: 'text',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-green-500/20 to-green-600/20',
      popular: true,
      recommended: true
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      version: '3.0',
      description: 'Powerful model excelling at complex reasoning and creative tasks',
      capabilities: ['Text Generation', 'Analysis', 'Creative Writing', 'Research', 'Code Review'],
      strengths: ['Creative writing', 'Analysis', 'Ethical reasoning', 'Long context'],
      limitations: ['Higher cost', 'Limited availability', 'Code generation'],
      pricing: { inputTokens: 0.015, outputTokens: 0.075, currency: 'USD', unit: '1K tokens' },
      performance: { speed: 'slow', quality: 'high', accuracy: 92, efficiency: 78 },
      specifications: {
        contextWindow: 200000,
        maxTokens: 4096,
        multimodal: true,
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko'],
        trainingCutoff: 'August 2023'
      },
      usage: {
        totalRequests: 18934,
        successRate: 97.2,
        averageLatency: 2450,
        costThisMonth: 287.30,
        trend: 'stable'
      },
      status: 'available',
      category: 'text',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      id: 'codestral',
      name: 'Codestral',
      provider: 'Mistral AI',
      version: '22B',
      description: 'Specialized code generation model for multiple programming languages',
      capabilities: ['Code Generation', 'Code Completion', 'Bug Fixing', 'Code Review', 'Refactoring'],
      strengths: ['Code generation', 'Multiple languages', 'Fast inference', 'Cost effective'],
      limitations: ['Limited general knowledge', 'Narrow focus', 'Newer model'],
      pricing: { inputTokens: 0.002, outputTokens: 0.006, currency: 'USD', unit: '1K tokens' },
      performance: { speed: 'fast', quality: 'medium', accuracy: 87, efficiency: 92 },
      specifications: {
        contextWindow: 32000,
        maxTokens: 8192,
        multimodal: false,
        languages: ['en'],
        trainingCutoff: 'May 2024'
      },
      usage: {
        totalRequests: 32847,
        successRate: 96.8,
        averageLatency: 890,
        costThisMonth: 156.20,
        trend: 'up'
      },
      status: 'available',
      category: 'code',
      icon: <Code className="w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-600/20',
      popular: true
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      version: '0125',
      description: 'Fast and cost-effective model for most general-purpose tasks',
      capabilities: ['Text Generation', 'Q&A', 'Summarization', 'Translation', 'Basic Coding'],
      strengths: ['Fast speed', 'Low cost', 'Wide availability', 'Good general knowledge'],
      limitations: ['Lower reasoning', 'Less creativity', 'Shorter context'],
      pricing: { inputTokens: 0.0005, outputTokens: 0.0015, currency: 'USD', unit: '1K tokens' },
      performance: { speed: 'fast', quality: 'medium', accuracy: 78, efficiency: 95 },
      specifications: {
        contextWindow: 16385,
        maxTokens: 4096,
        multimodal: false,
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
        trainingCutoff: 'September 2021'
      },
      usage: {
        totalRequests: 89234,
        successRate: 97.5,
        averageLatency: 650,
        costThisMonth: 89.40,
        trend: 'stable'
      },
      status: 'available',
      category: 'text',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500/20 to-yellow-600/20'
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      provider: 'OpenAI',
      version: '3.0',
      description: 'Advanced image generation model with superior quality and prompt adherence',
      capabilities: ['Image Generation', 'Style Transfer', 'Image Editing', 'Visual Creativity'],
      strengths: ['High quality images', 'Prompt adherence', 'Style versatility', 'Text rendering'],
      limitations: ['Image only', 'Higher cost', 'Content restrictions'],
      pricing: { inputTokens: 0.04, outputTokens: 0.08, currency: 'USD', unit: 'image' },
      performance: { speed: 'slow', quality: 'high', accuracy: 91, efficiency: 68 },
      specifications: {
        contextWindow: 0,
        maxTokens: 0,
        multimodal: true,
        languages: ['en'],
        trainingCutoff: 'September 2023'
      },
      usage: {
        totalRequests: 5672,
        successRate: 94.3,
        averageLatency: 12000,
        costThisMonth: 234.80,
        trend: 'down'
      },
      status: 'available',
      category: 'multimodal',
      icon: <Image className="w-6 h-6" />,
      color: 'from-pink-500/20 to-pink-600/20'
    },
    {
      id: 'gpt-4-vision',
      name: 'GPT-4 Vision',
      provider: 'OpenAI',
      version: '1106-vision',
      description: 'Multimodal model capable of understanding and analyzing images',
      capabilities: ['Image Analysis', 'Visual Q&A', 'OCR', 'Chart Reading', 'Scene Understanding'],
      strengths: ['Visual understanding', 'OCR capabilities', 'Chart analysis', 'Detailed descriptions'],
      limitations: ['Higher cost', 'Image size limits', 'Processing time'],
      pricing: { inputTokens: 0.01, outputTokens: 0.03, currency: 'USD', unit: '1K tokens' },
      performance: { speed: 'medium', quality: 'high', accuracy: 89, efficiency: 75 },
      specifications: {
        contextWindow: 128000,
        maxTokens: 4096,
        multimodal: true,
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
        trainingCutoff: 'April 2024'
      },
      usage: {
        totalRequests: 12847,
        successRate: 96.1,
        averageLatency: 2340,
        costThisMonth: 187.60,
        trend: 'up'
      },
      status: 'beta',
      category: 'multimodal',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-indigo-500/20 to-indigo-600/20'
    }
  ]

  const modelConfigurations: ModelConfiguration[] = [
    {
      id: 'config-1',
      modelId: 'gpt-4-turbo',
      name: 'Creative Writing',
      description: 'Optimized for creative and engaging content generation',
      parameters: {
        temperature: 0.8,
        topP: 0.9,
        topK: 40,
        maxTokens: 2048,
        frequencyPenalty: 0.3,
        presencePenalty: 0.1
      },
      systemPrompt: 'You are a creative writing assistant. Help users create engaging, original content with vivid descriptions and compelling narratives.',
      isDefault: false,
      createdAt: new Date('2024-12-01'),
      lastUsed: new Date('2024-12-24'),
      usageCount: 45
    },
    {
      id: 'config-2',
      modelId: 'gpt-4-turbo',
      name: 'Code Assistant',
      description: 'Configured for precise code generation and debugging',
      parameters: {
        temperature: 0.2,
        topP: 0.95,
        maxTokens: 4096,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      systemPrompt: 'You are a programming assistant. Provide clean, well-documented code with explanations. Follow best practices and include error handling.',
      isDefault: true,
      createdAt: new Date('2024-11-15'),
      lastUsed: new Date('2024-12-25'),
      usageCount: 123
    },
    {
      id: 'config-3',
      modelId: 'claude-3-opus',
      name: 'Research Assistant',
      description: 'Optimized for analytical and research tasks',
      parameters: {
        temperature: 0.3,
        topP: 0.9,
        maxTokens: 3000,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1
      },
      systemPrompt: 'You are a research assistant. Provide thorough, well-researched responses with citations and balanced perspectives.',
      isDefault: false,
      createdAt: new Date('2024-12-10'),
      lastUsed: new Date('2024-12-23'),
      usageCount: 67
    }
  ]

  const benchmarkData: ModelBenchmark[] = [
    { modelId: 'gpt-4-turbo', testName: 'MMLU', score: 86.4, category: 'reasoning', benchmark: 'Massive Multitask Language Understanding', lastUpdated: new Date('2024-12-15') },
    { modelId: 'gpt-4-turbo', testName: 'HumanEval', score: 87.0, category: 'coding', benchmark: 'Code Generation Benchmark', lastUpdated: new Date('2024-12-15') },
    { modelId: 'gpt-4-turbo', testName: 'HellaSwag', score: 95.3, category: 'reasoning', benchmark: 'Commonsense NLI', lastUpdated: new Date('2024-12-15') },
    { modelId: 'claude-3-opus', testName: 'MMLU', score: 83.1, category: 'reasoning', benchmark: 'Massive Multitask Language Understanding', lastUpdated: new Date('2024-12-10') },
    { modelId: 'claude-3-opus', testName: 'HumanEval', score: 84.5, category: 'coding', benchmark: 'Code Generation Benchmark', lastUpdated: new Date('2024-12-10') },
    { modelId: 'codestral', testName: 'HumanEval', score: 81.1, category: 'coding', benchmark: 'Code Generation Benchmark', lastUpdated: new Date('2024-12-12') },
    { modelId: 'codestral', testName: 'MBPP', score: 78.2, category: 'coding', benchmark: 'Mostly Basic Python Problems', lastUpdated: new Date('2024-12-12') }
  ]

  const handleModelAction = (action: string, modelId: string) => {
    console.log('Model action:', action, modelId)
    
    if (action === 'select') {
      setSelectedModels(prev => [...prev, modelId])
    } else if (action === 'deselect') {
      setSelectedModels(prev => prev.filter(id => id !== modelId))
    }
  }

  const handleConfigAction = (action: string, configId: string) => {
    console.log('Config action:', action, configId)
  }

  const filteredModels = aiModels.filter(model => {
    const matchesCategory = categoryFilter === 'all' || model.category === categoryFilter
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'popularity': return (b.usage.totalRequests || 0) - (a.usage.totalRequests || 0)
      case 'cost': return a.pricing.inputTokens - b.pricing.inputTokens
      case 'speed': 
        const speedOrder = { fast: 3, medium: 2, slow: 1 }
        return speedOrder[b.performance.speed] - speedOrder[a.performance.speed]
      case 'quality':
        const qualityOrder = { high: 3, medium: 2, low: 1 }
        return qualityOrder[b.performance.quality] - qualityOrder[a.performance.quality]
      default: return 0
    }
  })

  const totalCost = aiModels.reduce((sum, model) => sum + (model.usage.costThisMonth || 0), 0)
  const totalRequests = aiModels.reduce((sum, model) => sum + (model.usage.totalRequests || 0), 0)
  const avgLatency = aiModels.reduce((sum, model, _, arr) => sum + (model.usage.averageLatency || 0) / arr.length, 0)
  const avgSuccessRate = aiModels.reduce((sum, model, _, arr) => sum + (model.usage.successRate || 0) / arr.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Model Selection</h2>
          <p className="text-white/60">Choose and configure AI models for your projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Models
          </SimpleButton>
          <SimpleButton>
            <Plus className="w-4 h-4 mr-2" />
            Custom Configuration
          </SimpleButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{selectedModels.length}</div>
              <div className="text-white/60 text-sm">Active Models</div>
            </div>
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
              <div className="text-white/60 text-sm">Monthly Cost</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</div>
              <div className="text-white/60 text-sm">Total Requests</div>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{avgSuccessRate.toFixed(1)}%</div>
              <div className="text-white/60 text-sm">Success Rate</div>
            </div>
            <CheckCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'models', label: 'Models', icon: <Brain className="w-4 h-4" /> },
          { id: 'configurations', label: 'Configurations', icon: <Settings className="w-4 h-4" /> },
          { id: 'benchmarks', label: 'Benchmarks', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'usage', label: 'Usage Analytics', icon: <Activity className="w-4 h-4" /> },
          { id: 'playground', label: 'Playground', icon: <Play className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'models' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all" className="bg-gray-900">All Categories</option>
                <option value="text" className="bg-gray-900">Text</option>
                <option value="code" className="bg-gray-900">Code</option>
                <option value="multimodal" className="bg-gray-900">Multimodal</option>
                <option value="reasoning" className="bg-gray-900">Reasoning</option>
                <option value="creative" className="bg-gray-900">Creative</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="popularity" className="bg-gray-900">Popularity</option>
                <option value="cost" className="bg-gray-900">Cost</option>
                <option value="speed" className="bg-gray-900">Speed</option>
                <option value="quality" className="bg-gray-900">Quality</option>
              </select>
            </div>

            <div className="text-white/60 text-sm">
              {filteredModels.length} of {aiModels.length} models
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedModels.map(model => {
              // Adapt AIModel to ModelCard's expected format
              const categoryMap: Record<string, 'text' | 'image' | 'code' | 'multimodal'> = {
                'text': 'text',
                'code': 'code',
                'multimodal': 'multimodal',
                'reasoning': 'text',
                'creative': 'text',
                'image': 'image'
              };
              
              const modelCardData = {
                ...model,
                category: categoryMap[model.category] || 'text',
                pricing: {
                  input: model.pricing.inputTokens,
                  output: model.pricing.outputTokens,
                  currency: model.pricing.currency
                },
                performance: {
                  speed: model.performance.speed,
                  quality: model.performance.quality,
                  costEfficiency: (model.performance.efficiency > 85 ? 'high' : model.performance.efficiency > 70 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
                },
                limits: {
                  maxTokens: model.specifications.maxTokens,
                  contextWindow: model.specifications.contextWindow,
                  requestsPerMinute: 60
                },
                metrics: {
                  latencyP95: model.usage.averageLatency,
                  throughput: 1000,
                  errorRate: 100 - model.usage.successRate,
                  uptime: model.usage.successRate
                },
                tags: model.capabilities.slice(0, 3),
                lastUpdated: new Date().toISOString()
              };
              
              return (
                <ModelCard
                  key={model.id}
                  model={modelCardData}
                  onAction={handleModelAction}
                  isSelected={selectedModels.includes(model.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {selectedTab === 'configurations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Model Configurations</h3>
            <SimpleButton>
              <Plus className="w-4 h-4 mr-2" />
              New Configuration
            </SimpleButton>
          </div>

          <div className="space-y-4">
            {modelConfigurations.map(config => (
              <ConfigurationCard
                key={config.id}
                config={config}
                onAction={handleConfigAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'benchmarks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BenchmarkChart benchmarks={benchmarkData} />
          
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Benchmark Details</h3>
            <div className="space-y-3">
              {benchmarkData.slice(0, 6).map(benchmark => (
                <div key={`${benchmark.modelId}-${benchmark.testName}`} className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div>
                    <div className="text-white/80 text-sm font-medium">
                      {aiModels.find(m => m.id === benchmark.modelId)?.name} - {benchmark.testName}
                    </div>
                    <div className="text-white/60 text-xs">{benchmark.benchmark}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{benchmark.score}%</div>
                    <div className={`text-xs ${
                      benchmark.score >= 80 ? 'text-green-400' :
                      benchmark.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {benchmark.score >= 80 ? 'Excellent' :
                       benchmark.score >= 60 ? 'Good' : 'Fair'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SimpleCard>
        </div>
      )}

      {selectedTab === 'usage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Usage by Model</h3>
            <div className="space-y-4">
              {aiModels.slice(0, 5).map(model => (
                <div key={model.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${model.color}`}>
                      <div className="text-white">
                        {model.icon}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/80 text-sm">{model.name}</div>
                      <div className="text-white/60 text-xs">{model.usage.totalRequests.toLocaleString()} requests</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">${model.usage.costThisMonth.toFixed(2)}</div>
                    <div className="flex items-center space-x-1">
                      {model.usage.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : model.usage.trend === 'down' ? (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      ) : (
                        <Activity className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="text-xs text-white/60">{model.usage.successRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <span className="text-white/60">Cost breakdown chart would render here</span>
            </div>
          </SimpleCard>

          <SimpleCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{avgLatency.toFixed(0)}ms</div>
                <div className="text-white/60 text-sm">Avg Latency</div>
                <div className="flex items-center justify-center mt-1">
                  <TrendingDown className="w-3 h-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">-12%</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{avgSuccessRate.toFixed(1)}%</div>
                <div className="text-white/60 text-sm">Success Rate</div>
                <div className="flex items-center justify-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+2.3%</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</div>
                <div className="text-white/60 text-sm">Total Requests</div>
                <div className="flex items-center justify-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+18%</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
                <div className="text-white/60 text-sm">Monthly Cost</div>
                <div className="flex items-center justify-center mt-1">
                  <TrendingUp className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-yellow-400">+8%</span>
                </div>
              </div>
            </div>
          </SimpleCard>
        </div>
      )}

      {selectedTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SimpleCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Model Playground</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Select Model</label>
                <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  {selectedModels.map(modelId => {
                    const model = aiModels.find(m => m.id === modelId)
                    return (
                      <option key={modelId} value={modelId} className="bg-gray-900">
                        {model?.name}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Prompt</label>
                <textarea
                  placeholder="Enter your prompt here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <SimpleButton>
                  <Play className="w-4 h-4 mr-2" />
                  Generate
                </SimpleButton>
                <SimpleButton variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </SimpleButton>
                <SimpleButton variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </SimpleButton>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Response</label>
                <div className="h-48 bg-white/5 rounded-lg p-4 text-white/70 text-sm overflow-y-auto">
                  <span className="text-white/40">Generated response will appear here...</span>
                </div>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Temperature: <span className="text-white/60">0.7</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  defaultValue="0.7"
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Top P: <span className="text-white/60">0.9</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  defaultValue="0.9"
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Max Tokens</label>
                <input
                  type="number"
                  defaultValue="2048"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Frequency Penalty: <span className="text-white/60">0.0</span>
                </label>
                <input 
                  type="range" 
                  min="-2" 
                  max="2" 
                  step="0.1" 
                  defaultValue="0"
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Presence Penalty: <span className="text-white/60">0.0</span>
                </label>
                <input 
                  type="range" 
                  min="-2" 
                  max="2" 
                  step="0.1" 
                  defaultValue="0"
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="text-white font-medium mb-2">Estimated Cost</h4>
              <div className="text-2xl font-bold text-green-400">$0.023</div>
              <div className="text-xs text-white/60">per request</div>
            </div>
          </SimpleCard>
        </div>
      )}
    </div>
  )
}