'use client'

import { useState, useEffect } from 'react'
import {
  Palette,
  Sparkles,
  Wand2,
  Eye,
  Layers,
  Type,
  Image,
  Layout,
  Grid,
  Contrast,
  Droplets,
  Sun,
  Moon,
  Brush,
  Scissors,
  Move,
  RotateCw,
  Copy,
  Download,
  Settings,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Save,
  Undo2,
  Redo2,
  Maximize,
  Minimize,
  Square,
  Circle,
  Triangle
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface ColorPalette {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  neutral: string[]
  description: string
  mood: string
}

interface DesignSuggestion {
  id: string
  type: 'color' | 'typography' | 'layout' | 'spacing' | 'imagery'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  before: string
  after: string
  preview: string
  reasoning: string[]
}

interface TypographyPairing {
  id: string
  name: string
  heading: string
  body: string
  accent: string
  description: string
  style: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant'
  preview: string
}

interface LayoutTemplate {
  id: string
  name: string
  description: string
  structure: string
  components: string[]
  complexity: 'simple' | 'moderate' | 'complex'
  category: 'landing' | 'dashboard' | 'blog' | 'ecommerce' | 'portfolio'
  preview: string
  icon: React.ReactNode
}



function ColorPaletteCard({ palette, onSelect, isSelected }: {
  palette: ColorPalette
  onSelect: (paletteId: string) => void
  isSelected: boolean
}) {
  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500/50 bg-blue-500/10' 
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
      onClick={() => onSelect(palette.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white">{palette.name}</h4>
        {isSelected && <CheckCircle className="w-4 h-4 text-green-400" />}
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        <div 
          className="w-8 h-8 rounded-full border border-white/20"
          style={{ backgroundColor: palette.primary }}
        />
        <div 
          className="w-6 h-6 rounded-full border border-white/20"
          style={{ backgroundColor: palette.secondary }}
        />
        <div 
          className="w-6 h-6 rounded-full border border-white/20"
          style={{ backgroundColor: palette.accent }}
        />
        {palette.neutral.slice(0, 3).map((color, index) => (
          <div 
            key={index}
            className="w-4 h-4 rounded-full border border-white/20"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      <p className="text-sm text-white/60 mb-2">{palette.description}</p>
      <span className="text-xs text-white/40 capitalize">{palette.mood}</span>
    </div>
  )
}

function DesignSuggestionCard({ suggestion, onApply, onDismiss }: {
  suggestion: DesignSuggestion
  onApply: (suggestionId: string) => void
  onDismiss: (suggestionId: string) => void
}) {
  const getImpactColor = () => {
    switch (suggestion.impact) {
      case 'high': return 'text-red-400 bg-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/20'
    }
  }

  const getTypeIcon = () => {
    switch (suggestion.type) {
      case 'color': return <Palette className="w-4 h-4" />
      case 'typography': return <Type className="w-4 h-4" />
      case 'layout': return <Layout className="w-4 h-4" />
      case 'spacing': return <Grid className="w-4 h-4" />
      case 'imagery': return <Image className="w-4 h-4" />
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-purple-500/20">
            <div className="text-purple-400">
              {getTypeIcon()}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-white">{suggestion.title}</h4>
            <p className="text-sm text-white/60">{suggestion.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor()}`}>
            {suggestion.impact}
          </span>
          <span className="text-xs text-white/60">{suggestion.confidence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-xs text-white/40 mb-1">Before</div>
          <div className="h-16 rounded bg-gray-700 flex items-center justify-center text-xs text-white/60">
            {suggestion.before}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/40 mb-1">After</div>
          <div className="h-16 rounded bg-green-900/30 border border-green-500/30 flex items-center justify-center text-xs text-green-400">
            {suggestion.after}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-white/40 mb-1">Reasoning</div>
        <div className="space-y-1">
          {suggestion.reasoning.map((reason, index) => (
            <div key={index} className="flex items-start space-x-2 text-xs text-white/60">
              <span className="text-blue-400">•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <SimpleButton size="sm" onClick={() => onApply(suggestion.id)}>
          <Wand2 className="w-4 h-4 mr-2" />
          Apply
        </SimpleButton>
        <SimpleButton variant="outline" size="sm" onClick={() => onDismiss(suggestion.id)}>
          Dismiss
        </SimpleButton>
        <SimpleButton variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </SimpleButton>
      </div>
    </div>
  )
}

function TypographyPairingCard({ pairing, onSelect, isSelected }: {
  pairing: TypographyPairing
  onSelect: (pairingId: string) => void
  isSelected: boolean
}) {
  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500/50 bg-blue-500/10' 
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
      onClick={() => onSelect(pairing.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white">{pairing.name}</h4>
        <span className="text-xs text-white/60 capitalize">{pairing.style}</span>
      </div>
      
      <div className="space-y-3 mb-4">
        <div>
          <div className="text-xs text-white/40 mb-1">Heading</div>
          <div style={{ fontFamily: pairing.heading }} className="text-lg font-bold text-white">
            Design Excellence
          </div>
        </div>
        <div>
          <div className="text-xs text-white/40 mb-1">Body</div>
          <div style={{ fontFamily: pairing.body }} className="text-sm text-white/70">
            Beautiful typography enhances readability and creates visual hierarchy.
          </div>
        </div>
        <div>
          <div className="text-xs text-white/40 mb-1">Accent</div>
          <div style={{ fontFamily: pairing.accent }} className="text-sm text-blue-400 font-medium">
            Call to Action
          </div>
        </div>
      </div>
      
      <p className="text-xs text-white/60">{pairing.description}</p>
      {isSelected && <CheckCircle className="w-4 h-4 text-green-400 mt-2" />}
    </div>
  )
}

function LayoutTemplateCard({ template, onSelect }: {
  template: LayoutTemplate
  onSelect: (templateId: string) => void
}) {
  const getComplexityColor = () => {
    switch (template.complexity) {
      case 'simple': return 'text-green-400 bg-green-400/20'
      case 'moderate': return 'text-yellow-400 bg-yellow-400/20'
      case 'complex': return 'text-red-400 bg-red-400/20'
    }
  }

  return (
    <div 
      className="p-4 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all group"
      onClick={() => onSelect(template.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-blue-500/20">
            <div className="text-blue-400">
              {template.icon}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
              {template.name}
            </h4>
            <p className="text-sm text-white/60">{template.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor()}`}>
          {template.complexity}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-xs text-white/40 mb-1">Structure</div>
        <div className="text-sm text-white/80 font-mono">{template.structure}</div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {template.components.map(component => (
          <span key={component} className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
            {component}
          </span>
        ))}
      </div>

      <div className="text-xs text-white/40 capitalize">{template.category}</div>
    </div>
  )
}

function DesignControls({ onAction }: { onAction: (action: string) => void }) {
  const [selectedTool, setSelectedTool] = useState('select')

  const tools = [
    { id: 'select', icon: <Move className="w-4 h-4" />, label: 'Select' },
    { id: 'brush', icon: <Brush className="w-4 h-4" />, label: 'Brush' },
    { id: 'type', icon: <Type className="w-4 h-4" />, label: 'Text' },
    { id: 'shape', icon: <Square className="w-4 h-4" />, label: 'Shape' },
    { id: 'image', icon: <Image className="w-4 h-4" />, label: 'Image' }
  ]

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div className="flex items-center space-x-1">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`p-2 rounded transition-all ${
              selectedTool === tool.id
                ? 'bg-blue-500 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-1">
        <SimpleButton variant="ghost" size="icon" onClick={() => onAction('undo')}>
          <Undo2 className="w-4 h-4" />
        </SimpleButton>
        <SimpleButton variant="ghost" size="icon" onClick={() => onAction('redo')}>
          <Redo2 className="w-4 h-4" />
        </SimpleButton>
        <div className="w-px h-6 bg-white/20 mx-2" />
        <SimpleButton variant="ghost" size="icon" onClick={() => onAction('zoom-in')}>
          <Maximize className="w-4 h-4" />
        </SimpleButton>
        <SimpleButton variant="ghost" size="icon" onClick={() => onAction('zoom-out')}>
          <Minimize className="w-4 h-4" />
        </SimpleButton>
      </div>

      <div className="flex items-center space-x-2">
        <SimpleButton variant="outline" size="sm" onClick={() => onAction('preview')}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </SimpleButton>
        <SimpleButton size="sm" onClick={() => onAction('save')}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </SimpleButton>
      </div>
    </div>
  )
}

export default function VisualDesignAssistant() {
  const [selectedTab, setSelectedTab] = useState<'suggestions' | 'colors' | 'typography' | 'layouts'>('suggestions')
  const [selectedPalette, setSelectedPalette] = useState('modern-blue')
  const [selectedTypography, setSelectedTypography] = useState('clean-modern')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDesignControls, setShowDesignControls] = useState(false)

  const colorPalettes: ColorPalette[] = [
    {
      id: 'modern-blue',
      name: 'Modern Blue',
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#06b6d4',
      neutral: ['#f8fafc', '#e2e8f0', '#64748b', '#1e293b'],
      description: 'Clean and professional with calming blue tones',
      mood: 'trustworthy'
    },
    {
      id: 'warm-sunset',
      name: 'Warm Sunset',
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#fbbf24',
      neutral: ['#fef3c7', '#fed7aa', '#9ca3af', '#374151'],
      description: 'Energetic and warm with orange and yellow accents',
      mood: 'energetic'
    },
    {
      id: 'minimal-gray',
      name: 'Minimal Gray',
      primary: '#111827',
      secondary: '#374151',
      accent: '#6366f1',
      neutral: ['#ffffff', '#f9fafb', '#d1d5db', '#6b7280'],
      description: 'Sophisticated monochrome with purple highlights',
      mood: 'sophisticated'
    },
    {
      id: 'nature-green',
      name: 'Nature Green',
      primary: '#059669',
      secondary: '#047857',
      accent: '#84cc16',
      neutral: ['#f0fdf4', '#d1fae5', '#6b7280', '#1f2937'],
      description: 'Fresh and natural with green earth tones',
      mood: 'natural'
    }
  ]

  const typographyPairings: TypographyPairing[] = [
    {
      id: 'clean-modern',
      name: 'Clean Modern',
      heading: 'Inter',
      body: 'Inter',
      accent: 'Inter',
      description: 'Versatile and highly readable for digital interfaces',
      style: 'modern',
      preview: 'https://preview.webclonepro.com/typography/modern'
    },
    {
      id: 'elegant-serif',
      name: 'Elegant Serif',
      heading: 'Playfair Display',
      body: 'Source Sans Pro',
      accent: 'Playfair Display',
      description: 'Sophisticated pairing for editorial and premium brands',
      style: 'elegant',
      preview: 'https://preview.webclonepro.com/typography/elegant'
    },
    {
      id: 'minimal-mono',
      name: 'Minimal Mono',
      heading: 'Space Mono',
      body: 'Space Mono',
      accent: 'Space Mono',
      description: 'Technical and modern with monospace consistency',
      style: 'minimal',
      preview: 'https://preview.webclonepro.com/typography/mono'
    },
    {
      id: 'bold-impact',
      name: 'Bold Impact',
      heading: 'Montserrat',
      body: 'Open Sans',
      accent: 'Montserrat',
      description: 'Strong headers with readable body text',
      style: 'bold',
      preview: 'https://preview.webclonepro.com/typography/bold'
    }
  ]

  const layoutTemplates: LayoutTemplate[] = [
    {
      id: 'hero-grid',
      name: 'Hero + Feature Grid',
      description: 'Large hero section with feature grid below',
      structure: 'hero | grid(3x2) | cta',
      components: ['Hero', 'Feature Cards', 'CTA Section'],
      complexity: 'simple',
      category: 'landing',
      preview: 'https://preview.webclonepro.com/layouts/hero-grid',
      icon: <Layout className="w-4 h-4" />
    },
    {
      id: 'sidebar-dashboard',
      name: 'Sidebar Dashboard',
      description: 'Left sidebar with main content area and widgets',
      structure: 'sidebar | main + widgets',
      components: ['Navigation', 'Content Area', 'Widget Grid', 'Header'],
      complexity: 'moderate',
      category: 'dashboard',
      preview: 'https://preview.webclonepro.com/layouts/dashboard',
      icon: <Grid className="w-4 h-4" />
    },
    {
      id: 'masonry-portfolio',
      name: 'Masonry Portfolio',
      description: 'Pinterest-style masonry layout for portfolios',
      structure: 'header | masonry | contact',
      components: ['Header', 'Project Cards', 'Filter Bar', 'Footer'],
      complexity: 'complex',
      category: 'portfolio',
      preview: 'https://preview.webclonepro.com/layouts/masonry',
      icon: <Layers className="w-4 h-4" />
    }
  ]

  const designSuggestions: DesignSuggestion[] = [
    {
      id: '1',
      type: 'color',
      title: 'Improve Color Contrast',
      description: 'Increase contrast ratio for better accessibility',
      impact: 'high',
      confidence: 94,
      before: 'Color contrast: 3.2:1',
      after: 'Color contrast: 4.8:1',
      preview: 'https://preview.webclonepro.com/suggestions/contrast',
      reasoning: [
        'Current contrast doesn\'t meet WCAG AA standards',
        'Text is difficult to read for users with visual impairments',
        'Improving contrast will enhance overall readability'
      ]
    },
    {
      id: '2',
      type: 'typography',
      title: 'Optimize Font Hierarchy',
      description: 'Establish clearer visual hierarchy with font sizes',
      impact: 'medium',
      confidence: 87,
      before: 'H1: 32px, H2: 28px, Body: 16px',
      after: 'H1: 48px, H2: 32px, Body: 18px',
      preview: 'https://preview.webclonepro.com/suggestions/typography',
      reasoning: [
        'Current hierarchy is too subtle',
        'Larger font sizes improve readability on mobile',
        'Better distinction between heading levels'
      ]
    },
    {
      id: '3',
      type: 'spacing',
      title: 'Consistent Spacing System',
      description: 'Apply consistent spacing throughout the design',
      impact: 'medium',
      confidence: 91,
      before: 'Mixed spacing values',
      after: '8px scale system',
      preview: 'https://preview.webclonepro.com/suggestions/spacing',
      reasoning: [
        'Inconsistent spacing creates visual chaos',
        'Systematic approach improves visual rhythm',
        'Easier maintenance and development'
      ]
    }
  ]

  const handleAnalyzeDesign = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  const handleApplySuggestion = (suggestionId: string) => {
    console.log('Applying suggestion:', suggestionId)
  }

  const handleDismissSuggestion = (suggestionId: string) => {
    console.log('Dismissing suggestion:', suggestionId)
  }

  const handleDesignAction = (action: string) => {
    console.log('Design action:', action)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Visual Design Assistant</h2>
          <p className="text-white/60">AI-powered design recommendations and tools</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline" onClick={() => setShowDesignControls(!showDesignControls)}>
            <Brush className="w-4 h-4 mr-2" />
            Design Tools
          </SimpleButton>
          <SimpleButton onClick={handleAnalyzeDesign} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Design
              </>
            )}
          </SimpleButton>
        </div>
      </div>

      {/* Design Controls */}
      {showDesignControls && (
        <DesignControls onAction={handleDesignAction} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{designSuggestions.length}</div>
              <div className="text-white/60 text-sm">Suggestions</div>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">4.8:1</div>
              <div className="text-white/60 text-sm">Contrast Ratio</div>
            </div>
            <Contrast className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">92%</div>
              <div className="text-white/60 text-sm">Design Score</div>
            </div>
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">15</div>
              <div className="text-white/60 text-sm">Applied Changes</div>
            </div>
            <CheckCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'suggestions', label: 'Suggestions', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'colors', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
          { id: 'typography', label: 'Typography', icon: <Type className="w-4 h-4" /> },
          { id: 'layouts', label: 'Layouts', icon: <Layout className="w-4 h-4" /> }
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
      {selectedTab === 'suggestions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Design Suggestions</h3>
            <div className="flex items-center space-x-2">
              <SimpleButton variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </SimpleButton>
              <SimpleButton variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </SimpleButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {designSuggestions.map(suggestion => (
              <DesignSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={handleApplySuggestion}
                onDismiss={handleDismissSuggestion}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'colors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Color Palettes</h3>
            <SimpleButton>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Palette
            </SimpleButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorPalettes.map(palette => (
              <ColorPaletteCard
                key={palette.id}
                palette={palette}
                onSelect={setSelectedPalette}
                isSelected={selectedPalette === palette.id}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'typography' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Typography Pairings</h3>
            <SimpleButton>
              <Type className="w-4 h-4 mr-2" />
              Custom Pairing
            </SimpleButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {typographyPairings.map(pairing => (
              <TypographyPairingCard
                key={pairing.id}
                pairing={pairing}
                onSelect={setSelectedTypography}
                isSelected={selectedTypography === pairing.id}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'layouts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Layout Templates</h3>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:border-blue-500">
                <option value="all" className="bg-gray-900">All Categories</option>
                <option value="landing" className="bg-gray-900">Landing</option>
                <option value="dashboard" className="bg-gray-900">Dashboard</option>
                <option value="portfolio" className="bg-gray-900">Portfolio</option>
              </select>
              <SimpleButton>
                <Layout className="w-4 h-4 mr-2" />
                Create Layout
              </SimpleButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layoutTemplates.map(template => (
              <LayoutTemplateCard
                key={template.id}
                template={template}
                onSelect={(id) => console.log('Selected template:', id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}