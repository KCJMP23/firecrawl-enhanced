'use client'

import { useState, useEffect } from 'react'
import {
  Code,
  Wand2,
  Brain,
  Sparkles,
  Play,
  Pause,
  Copy,
  Download,
  RefreshCw,
  Settings,
  FileText,
  Layers,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Cpu,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  ArrowRight
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface CodeTemplate {
  id: string
  name: string
  description: string
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'
  category: 'component' | 'layout' | 'animation' | 'form' | 'utility'
  complexity: 'basic' | 'intermediate' | 'advanced'
  estimatedTime: string
  dependencies: string[]
  preview: string
  code: string
  icon: React.ReactNode
}

interface GenerationRequest {
  id: string
  prompt: string
  framework: string
  style: string
  features: string[]
  status: 'pending' | 'generating' | 'completed' | 'failed'
  progress: number
  createdAt: Date
  estimatedTime?: string
  result?: {
    code: string
    explanation: string
    dependencies: string[]
    preview: string
  }
}

interface AIModel {
  id: string
  name: string
  description: string
  strengths: string[]
  speed: 'fast' | 'medium' | 'slow'
  quality: 'high' | 'medium' | 'low'
  costPerRequest: number
  icon: React.ReactNode
}



function CodeTemplateCard({ template, onSelect }: {
  template: CodeTemplate
  onSelect: (template: CodeTemplate) => void
}) {
  const getComplexityColor = () => {
    switch (template.complexity) {
      case 'basic': return 'text-green-400 bg-green-400/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20'
      case 'advanced': return 'text-red-400 bg-red-400/20'
    }
  }

  const getFrameworkColor = () => {
    switch (template.framework) {
      case 'react': return 'text-blue-400 bg-blue-400/20'
      case 'vue': return 'text-green-400 bg-green-400/20'
      case 'angular': return 'text-red-400 bg-red-400/20'
      case 'svelte': return 'text-orange-400 bg-orange-400/20'
      case 'vanilla': return 'text-yellow-400 bg-yellow-400/20'
    }
  }

  return (
    <div className="group relative p-4 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-all cursor-pointer"
         onClick={() => onSelect(template)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <div className="text-blue-400">
              {template.icon}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-white/60">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor()}`}>
            {template.complexity}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrameworkColor()}`}>
            {template.framework}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-white/60 mb-3">
        <span className="capitalize">{template.category}</span>
        <span>{template.estimatedTime}</span>
      </div>

      {template.dependencies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.dependencies.slice(0, 3).map(dep => (
            <span key={dep} className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
              {dep}
            </span>
          ))}
          {template.dependencies.length > 3 && (
            <span className="px-2 py-1 text-xs text-white/40">
              +{template.dependencies.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <SimpleButton size="sm" className="w-full">
          <Wand2 className="w-4 h-4 mr-2" />
          Use Template
        </SimpleButton>
      </div>
    </div>
  )
}

function GenerationRequestCard({ request, onCancel, onRetry }: {
  request: GenerationRequest
  onCancel: (id: string) => void
  onRetry: (id: string) => void
}) {
  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'generating': return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusColor = () => {
    switch (request.status) {
      case 'pending': return 'border-yellow-500/30 bg-yellow-500/10'
      case 'generating': return 'border-blue-500/30 bg-blue-500/10'
      case 'completed': return 'border-green-500/30 bg-green-500/10'
      case 'failed': return 'border-red-500/30 bg-red-500/10'
    }
  }

  return (
    <div className={`p-4 rounded-lg border transition-all ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon()}
            <span className="font-medium text-white capitalize">{request.status}</span>
            {request.estimatedTime && (
              <span className="text-sm text-white/60">• {request.estimatedTime}</span>
            )}
          </div>
          <p className="text-white/80 mb-2">{request.prompt}</p>
          <div className="flex items-center space-x-3 text-xs text-white/60">
            <span className="capitalize">{request.framework}</span>
            <span>•</span>
            <span className="capitalize">{request.style}</span>
            <span>•</span>
            <span>{request.features.join(', ')}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {request.status === 'generating' && (
            <SimpleButton variant="outline" size="sm" onClick={() => onCancel(request.id)}>
              Cancel
            </SimpleButton>
          )}
          {request.status === 'failed' && (
            <SimpleButton variant="outline" size="sm" onClick={() => onRetry(request.id)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </SimpleButton>
          )}
        </div>
      </div>

      {request.status === 'generating' && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Progress</span>
            <span className="text-sm text-white/60">{request.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${request.progress}%` }}
            />
          </div>
        </div>
      )}

      {request.result && request.status === 'completed' && (
        <div className="mt-4 space-y-3">
          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-2">Generated Code</h4>
            <pre className="text-xs text-white/80 bg-black/30 rounded p-3 overflow-x-auto">
              {request.result.code.substring(0, 200)}...
            </pre>
          </div>
          
          <div className="flex items-center space-x-2">
            <SimpleButton size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </SimpleButton>
            <SimpleButton variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </SimpleButton>
            <SimpleButton variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </SimpleButton>
          </div>
        </div>
      )}
    </div>
  )
}

function ModelSelector({ models, selectedModel, onModelChange }: {
  models: AIModel[]
  selectedModel: string
  onModelChange: (modelId: string) => void
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const currentModel = models.find(m => m.id === selectedModel)

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 px-4 py-2 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="text-purple-400">
          {currentModel?.icon}
        </div>
        <div className="text-left">
          <div className="text-white font-medium">{currentModel?.name}</div>
          <div className="text-xs text-white/60">{currentModel?.speed} • ${currentModel?.costPerRequest} per request</div>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-80 bg-black/90 border border-white/10 rounded-lg shadow-lg z-10">
          <div className="p-2">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id)
                  setShowDropdown(false)
                }}
                className={`w-full text-left flex items-start space-x-3 px-3 py-3 rounded hover:bg-white/10 transition-colors ${
                  model.id === selectedModel ? 'bg-white/5' : ''
                }`}
              >
                <div className="text-purple-400 mt-1">
                  {model.icon}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{model.name}</div>
                  <div className="text-sm text-white/60 mb-1">{model.description}</div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`px-2 py-0.5 rounded ${
                      model.speed === 'fast' ? 'bg-green-500/20 text-green-400' :
                      model.speed === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {model.speed}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                      model.quality === 'high' ? 'bg-green-500/20 text-green-400' :
                      model.quality === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {model.quality}
                    </span>
                    <span className="text-white/60">${model.costPerRequest}</span>
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {model.strengths.join(', ')}
                  </div>
                </div>
                {model.id === selectedModel && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AICodeGenerator() {
  const [selectedTab, setSelectedTab] = useState<'generate' | 'templates' | 'history'>('generate')
  const [prompt, setPrompt] = useState('')
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo')
  const [isGenerating, setIsGenerating] = useState(false)

  const [generationRequests, setGenerationRequests] = useState<GenerationRequest[]>([
    {
      id: '1',
      prompt: 'Create a responsive navigation component with mobile menu',
      framework: 'react',
      style: 'modern',
      features: ['responsive', 'animations'],
      status: 'completed',
      progress: 100,
      createdAt: new Date(Date.now() - 300000),
      result: {
        code: `import React, { useState } from 'react';\n\nconst Navigation = () => {\n  const [isOpen, setIsOpen] = useState(false);\n\n  return (\n    <nav className="bg-white shadow-lg">\n      {/* Navigation code */}\n    </nav>\n  );\n};\n\nexport default Navigation;`,
        explanation: 'A responsive navigation component with hamburger menu for mobile devices',
        dependencies: ['react', 'tailwindcss'],
        preview: 'https://preview.webclonepro.com/nav1'
      }
    },
    {
      id: '2',
      prompt: 'Build a card component with hover effects',
      framework: 'react',
      style: 'glassmorphism',
      features: ['hover-effects', 'animations'],
      status: 'generating',
      progress: 65,
      createdAt: new Date(Date.now() - 60000),
      estimatedTime: '2 minutes'
    }
  ])

  const codeTemplates: CodeTemplate[] = [
    {
      id: '1',
      name: 'Hero Section',
      description: 'Modern hero section with CTA and background gradient',
      framework: 'react',
      category: 'layout',
      complexity: 'basic',
      estimatedTime: '5 mins',
      dependencies: ['tailwindcss'],
      preview: 'https://preview.webclonepro.com/hero1',
      code: 'const Hero = () => { /* Hero code */ }',
      icon: <Monitor className="w-4 h-4" />
    },
    {
      id: '2',
      name: 'Contact Form',
      description: 'Responsive contact form with validation',
      framework: 'react',
      category: 'form',
      complexity: 'intermediate',
      estimatedTime: '10 mins',
      dependencies: ['react-hook-form', 'yup'],
      preview: 'https://preview.webclonepro.com/form1',
      code: 'const ContactForm = () => { /* Form code */ }',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: '3',
      name: 'Card Grid',
      description: 'Responsive card grid with hover animations',
      framework: 'react',
      category: 'component',
      complexity: 'basic',
      estimatedTime: '7 mins',
      dependencies: ['framer-motion'],
      preview: 'https://preview.webclonepro.com/cards1',
      code: 'const CardGrid = () => { /* Grid code */ }',
      icon: <Layers className="w-4 h-4" />
    }
  ]

  const aiModels: AIModel[] = [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Most advanced model with superior code generation capabilities',
      strengths: ['Complex logic', 'Best practices', 'Documentation'],
      speed: 'medium',
      quality: 'high',
      costPerRequest: 0.15,
      icon: <Brain className="w-4 h-4" />
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Excellent for React and modern web development',
      strengths: ['React expertise', 'Clean code', 'TypeScript'],
      speed: 'medium',
      quality: 'high',
      costPerRequest: 0.12,
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'codestral',
      name: 'Codestral',
      description: 'Fast and efficient for standard web components',
      strengths: ['Speed', 'Web standards', 'Vanilla JS'],
      speed: 'fast',
      quality: 'medium',
      costPerRequest: 0.05,
      icon: <Zap className="w-4 h-4" />
    }
  ]

  const frameworks = ['react', 'vue', 'angular', 'svelte', 'vanilla']
  const styles = ['modern', 'minimal', 'glassmorphism', 'neumorphism', 'retro']
  const features = ['responsive', 'animations', 'dark-mode', 'accessibility', 'performance']

  const handleGenerate = () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    const newRequest: GenerationRequest = {
      id: Date.now().toString(),
      prompt,
      framework: selectedFramework,
      style: selectedStyle,
      features: selectedFeatures,
      status: 'generating',
      progress: 0,
      createdAt: new Date(),
      estimatedTime: '3 minutes'
    }

    setGenerationRequests(prev => [newRequest, ...prev])

    // Simulate generation
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setIsGenerating(false)
        
        // Update request to completed
        setGenerationRequests(prev => prev.map(req => 
          req.id === newRequest.id 
            ? { 
                ...req, 
                status: 'completed', 
                progress: 100,
                result: {
                  code: `// Generated ${selectedFramework} component\nconst GeneratedComponent = () => {\n  return (\n    <div className="${selectedStyle}-style">\n      {/* Generated code based on: ${prompt} */}\n    </div>\n  )\n}`,
                  explanation: `A ${selectedFramework} component generated based on your prompt`,
                  dependencies: ['react', 'tailwindcss'],
                  preview: 'https://preview.webclonepro.com/generated'
                }
              }
            : req
        ))
      } else {
        setGenerationRequests(prev => prev.map(req => 
          req.id === newRequest.id ? { ...req, progress } : req
        ))
      }
    }, 200)

    setPrompt('')
  }

  const handleTemplateSelect = (template: CodeTemplate) => {
    setPrompt(`Create a ${template.name.toLowerCase()} - ${template.description}`)
    setSelectedFramework(template.framework)
    setSelectedTab('generate')
  }

  const activeRequests = generationRequests.filter(req => req.status === 'generating')
  const completedRequests = generationRequests.filter(req => req.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Code Generator</h2>
          <p className="text-white/60">Generate production-ready components with AI assistance</p>
        </div>
        <div className="flex items-center space-x-3">
          <ModelSelector 
            models={aiModels}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          <SimpleButton variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </SimpleButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{completedRequests.length}</div>
              <div className="text-white/60 text-sm">Generated</div>
            </div>
            <Code className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{activeRequests.length}</div>
              <div className="text-white/60 text-sm">In Progress</div>
            </div>
            <Cpu className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{codeTemplates.length}</div>
              <div className="text-white/60 text-sm">Templates</div>
            </div>
            <Layers className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">$2.47</div>
              <div className="text-white/60 text-sm">Credits Used</div>
            </div>
            <Target className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'generate', label: 'Generate', icon: <Wand2 className="w-4 h-4" /> },
          { id: 'templates', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
          { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> }
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

      {selectedTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Form */}
          <div className="lg:col-span-2 space-y-6">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Describe Your Component</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    What do you want to build?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Create a responsive pricing table with 3 tiers, hover effects, and a popular badge..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Framework</label>
                    <select
                      value={selectedFramework}
                      onChange={(e) => setSelectedFramework(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {frameworks.map(framework => (
                        <option key={framework} value={framework} className="bg-gray-900">
                          {framework.charAt(0).toUpperCase() + framework.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Style</label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {styles.map(style => (
                        <option key={style} value={style} className="bg-gray-900">
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Features</label>
                    <div className="relative">
                      <select
                        multiple
                        value={selectedFeatures}
                        onChange={(e) => setSelectedFeatures(Array.from(e.target.selectedOptions, option => option.value))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        size={1}
                      >
                        {features.map(feature => (
                          <option key={feature} value={feature} className="bg-gray-900">
                            {feature.charAt(0).toUpperCase() + feature.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.map(feature => (
                    <span key={feature} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center">
                      {feature}
                      <button
                        onClick={() => setSelectedFeatures(prev => prev.filter(f => f !== feature))}
                        className="ml-2 hover:text-blue-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <SimpleButton 
                  onClick={handleGenerate} 
                  disabled={!prompt.trim() || isGenerating}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Component
                    </>
                  )}
                </SimpleButton>
              </div>
            </SimpleCard>
          </div>

          {/* Active Generations */}
          <div className="space-y-6">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Generations</h3>
              <div className="space-y-3">
                {generationRequests.slice(0, 3).map(request => (
                  <GenerationRequestCard
                    key={request.id}
                    request={request}
                    onCancel={(id) => {
                      setGenerationRequests(prev => prev.filter(req => req.id !== id))
                    }}
                    onRetry={(id) => {
                      setGenerationRequests(prev => prev.map(req => 
                        req.id === id ? { ...req, status: 'generating', progress: 0 } : req
                      ))
                    }}
                  />
                ))}
              </div>
            </SimpleCard>
          </div>
        </div>
      )}

      {selectedTab === 'templates' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Code Templates</h3>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:border-blue-500">
                <option value="all" className="bg-gray-900">All Categories</option>
                <option value="layout" className="bg-gray-900">Layout</option>
                <option value="component" className="bg-gray-900">Component</option>
                <option value="form" className="bg-gray-900">Form</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {codeTemplates.map(template => (
              <CodeTemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Generation History</h3>
            <SimpleButton variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </SimpleButton>
          </div>

          <div className="space-y-4">
            {generationRequests.map(request => (
              <GenerationRequestCard
                key={request.id}
                request={request}
                onCancel={(id) => {
                  setGenerationRequests(prev => prev.filter(req => req.id !== id))
                }}
                onRetry={(id) => {
                  setGenerationRequests(prev => prev.map(req => 
                    req.id === id ? { ...req, status: 'generating', progress: 0 } : req
                  ))
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}