'use client'

import { useState, useEffect } from 'react'
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Grid,
  Layers,
  Move,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Zap,
  Code,
  Palette,
  Layout,
  Image,
  Type,
  Navigation
} from 'lucide-react'

interface Breakpoint {
  id: string
  name: string
  width: number
  height: number
  icon: React.ReactNode
  isActive: boolean
}

interface ResponsiveRule {
  id: string
  property: string
  breakpoint: string
  originalValue: string
  newValue: string
  element: string
  status: 'applied' | 'pending' | 'error'
  confidence: number
}

interface ConversionTask {
  id: string
  category: 'layout' | 'typography' | 'navigation' | 'images' | 'spacing'
  title: string
  description: string
  before: string
  after: string
  status: 'completed' | 'processing' | 'pending' | 'failed'
  impact: 'high' | 'medium' | 'low'
  elements: number
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
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = 
    variant === 'outline' ? 'border border-white/20 bg-transparent hover:bg-white/10 text-white' :
    variant === 'ghost' ? 'hover:bg-white/10 text-white' :
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

function BreakpointSelector({ breakpoints, onBreakpointChange }: {
  breakpoints: Breakpoint[]
  onBreakpointChange: (breakpoint: Breakpoint) => void
}) {
  const activeBreakpoint = breakpoints.find(bp => bp.isActive) || breakpoints[0]

  return (
    <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-2">
      {breakpoints.map(breakpoint => (
        <button
          key={breakpoint.id}
          onClick={() => onBreakpointChange(breakpoint)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
            breakpoint.isActive 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
              : 'hover:bg-white/10 text-white/70'
          }`}
        >
          <div className="text-current">
            {breakpoint.icon}
          </div>
          <div className="text-left">
            <div className="text-xs font-medium">{breakpoint.name}</div>
            <div className="text-xs opacity-70">{breakpoint.width}×{breakpoint.height}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

function ConversionTaskCard({ task }: { task: ConversionTask }) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'processing': return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getCategoryIcon = () => {
    switch (task.category) {
      case 'layout': return <Layout className="w-4 h-4" />
      case 'typography': return <Type className="w-4 h-4" />
      case 'navigation': return <Navigation className="w-4 h-4" />
      case 'images': return <Image className="w-4 h-4" />
      case 'spacing': return <Grid className="w-4 h-4" />
    }
  }

  const getImpactColor = () => {
    switch (task.impact) {
      case 'high': return 'text-red-400 bg-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/20'
    }
  }

  return (
    <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/20">
        <div className="text-blue-400">
          {getCategoryIcon()}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-white truncate">{task.title}</h4>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getImpactColor()}`}>
              {task.impact}
            </span>
            {getStatusIcon()}
          </div>
        </div>
        
        <p className="text-sm text-white/60 mb-3">{task.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-white/40 mb-1">Before</div>
            <div className="text-xs text-red-400 bg-red-400/10 rounded p-2 font-mono">
              {task.before}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-1">After</div>
            <div className="text-xs text-green-400 bg-green-400/10 rounded p-2 font-mono">
              {task.after}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{task.elements} elements affected</span>
          <span className="capitalize">{task.status}</span>
        </div>
      </div>
    </div>
  )
}

function RulesPanel({ rules }: { rules: ResponsiveRule[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'text-green-400 bg-green-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'error': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Responsive Rules</h3>
        <span className="text-sm text-white/60">{rules.length} rules generated</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {rules.map(rule => (
          <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <span className="font-mono text-sm text-blue-400">{rule.element}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                  {rule.status}
                </span>
              </div>
              <div className="text-sm text-white/60">
                <span className="text-white">{rule.property}</span>: {rule.originalValue} → {rule.newValue}
              </div>
              <div className="text-xs text-white/40 mt-1">
                @media (max-width: {rule.breakpoint}) • {rule.confidence}% confidence
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <SimpleButton variant="outline" size="sm">
          <Code className="w-4 h-4 mr-2" />
          View CSS
        </SimpleButton>
        <SimpleButton size="sm">
          <Zap className="w-4 h-4 mr-2" />
          Apply All
        </SimpleButton>
      </div>
    </SimpleCard>
  )
}

function PreviewPanel({ activeBreakpoint }: { activeBreakpoint: Breakpoint }) {
  const [showGrid, setShowGrid] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <SimpleCard className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
          <p className="text-sm text-white/60">{activeBreakpoint.name} • {activeBreakpoint.width}×{activeBreakpoint.height}</p>
        </div>
        <div className="flex items-center space-x-2">
          <SimpleButton 
            variant="outline" 
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </SimpleButton>
          <SimpleButton 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </SimpleButton>
        </div>
      </div>

      <div className="relative bg-white rounded-lg overflow-hidden" style={{ height: '500px' }}>
        {showGrid && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />
          </div>
        )}
        
        <iframe
          src="/api/preview"
          className="w-full h-full border-none"
          style={{
            width: activeBreakpoint.width + 'px',
            height: activeBreakpoint.height + 'px',
            transform: `scale(${Math.min(500 / activeBreakpoint.width, 500 / activeBreakpoint.height)})`,
            transformOrigin: 'top left'
          }}
        />
        
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          {activeBreakpoint.width}×{activeBreakpoint.height}
        </div>
      </div>
    </SimpleCard>
  )
}

export default function ResponsiveDesignConverter() {
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeBreakpoint, setActiveBreakpoint] = useState<string>('desktop')

  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { id: 'desktop', name: 'Desktop', width: 1920, height: 1080, icon: <Monitor className="w-4 h-4" />, isActive: true },
    { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: <Tablet className="w-4 h-4" />, isActive: false },
    { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: <Smartphone className="w-4 h-4" />, isActive: false }
  ])

  const conversionTasks: ConversionTask[] = [
    {
      id: '1',
      category: 'layout',
      title: 'Convert Grid to Flexbox',
      description: 'Transform CSS Grid layouts to responsive Flexbox for mobile compatibility',
      before: 'display: grid; grid-template-columns: repeat(4, 1fr);',
      after: 'display: flex; flex-wrap: wrap; gap: 1rem;',
      status: 'completed',
      impact: 'high',
      elements: 8
    },
    {
      id: '2',
      category: 'typography',
      title: 'Responsive Font Scaling',
      description: 'Apply clamp() function for fluid typography across all breakpoints',
      before: 'font-size: 48px;',
      after: 'font-size: clamp(24px, 5vw, 48px);',
      status: 'completed',
      impact: 'medium',
      elements: 15
    },
    {
      id: '3',
      category: 'navigation',
      title: 'Mobile Menu Conversion',
      description: 'Transform horizontal navigation to hamburger menu pattern',
      before: 'display: flex; flex-direction: row;',
      after: 'display: none; @media (max-width: 768px) { ... }',
      status: 'processing',
      impact: 'high',
      elements: 1
    },
    {
      id: '4',
      category: 'images',
      title: 'Responsive Images',
      description: 'Add srcset and sizes attributes for optimized loading',
      before: '<img src="image.jpg">',
      after: '<img srcset="..." sizes="(max-width: 768px) 100vw, 50vw">',
      status: 'pending',
      impact: 'medium',
      elements: 23
    },
    {
      id: '5',
      category: 'spacing',
      title: 'Adaptive Spacing',
      description: 'Convert fixed margins/padding to responsive units',
      before: 'margin: 64px; padding: 32px;',
      after: 'margin: clamp(16px, 4vw, 64px); padding: clamp(8px, 2vw, 32px);',
      status: 'pending',
      impact: 'low',
      elements: 45
    }
  ]

  const responsiveRules: ResponsiveRule[] = [
    {
      id: '1',
      property: 'font-size',
      breakpoint: '768px',
      originalValue: '24px',
      newValue: '18px',
      element: '.hero-title',
      status: 'applied',
      confidence: 95
    },
    {
      id: '2',
      property: 'flex-direction',
      breakpoint: '768px',
      originalValue: 'row',
      newValue: 'column',
      element: '.feature-grid',
      status: 'applied',
      confidence: 88
    },
    {
      id: '3',
      property: 'display',
      breakpoint: '768px',
      originalValue: 'flex',
      newValue: 'none',
      element: '.desktop-nav',
      status: 'pending',
      confidence: 92
    },
    {
      id: '4',
      property: 'width',
      breakpoint: '480px',
      originalValue: '50%',
      newValue: '100%',
      element: '.card',
      status: 'applied',
      confidence: 98
    }
  ]

  const handleBreakpointChange = (breakpoint: Breakpoint) => {
    setBreakpoints(prev => prev.map(bp => ({
      ...bp,
      isActive: bp.id === breakpoint.id
    })))
    setActiveBreakpoint(breakpoint.id)
  }

  const handleStartConversion = () => {
    setIsConverting(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsConverting(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const activeBp = breakpoints.find(bp => bp.isActive) || breakpoints[0]!

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Responsive Design Converter</h2>
          <p className="text-white/60">Automatically convert designs to mobile-responsive layouts</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </SimpleButton>
          <SimpleButton onClick={handleStartConversion} disabled={isConverting}>
            {isConverting ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Converting... {progress}%
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Conversion
              </>
            )}
          </SimpleButton>
        </div>
      </div>

      {/* Progress Bar */}
      {isConverting && (
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Breakpoint Selector */}
      <BreakpointSelector 
        breakpoints={breakpoints}
        onBreakpointChange={handleBreakpointChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Tasks */}
        <div className="space-y-6">
          <SimpleCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Conversion Tasks</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/60">
                  {conversionTasks.filter(t => t.status === 'completed').length} / {conversionTasks.length} completed
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversionTasks.map(task => (
                <ConversionTaskCard key={task.id} task={task} />
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <SimpleButton variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </SimpleButton>
              <SimpleButton size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Apply All
              </SimpleButton>
            </div>
          </SimpleCard>

          <RulesPanel rules={responsiveRules} />
        </div>

        {/* Preview Panel */}
        <PreviewPanel activeBreakpoint={activeBp} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{conversionTasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-white/60 text-sm">Completed Tasks</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{responsiveRules.filter(r => r.status === 'applied').length}</div>
              <div className="text-white/60 text-sm">Applied Rules</div>
            </div>
            <Code className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-white/60 text-sm">Breakpoints</div>
            </div>
            <Layout className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">92</div>
              <div className="text-white/60 text-sm">Elements Updated</div>
            </div>
            <Layers className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>
    </div>
  )
}