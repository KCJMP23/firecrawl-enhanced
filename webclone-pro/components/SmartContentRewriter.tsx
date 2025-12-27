'use client'

import { useState, useEffect } from 'react'
import { SimpleButton, SimpleCard } from '@/components/ui'
import {
  PenTool,
  Sparkles,
  Wand2,
  RefreshCw,
  Copy,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  Zap,
  FileText,
  MessageSquare,
  Lightbulb,
  Heart,
  Star,
  ThumbsUp,
  BarChart3,
  Edit,
  Languages,
  Mic,
  Volume2,
  Settings,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Plus
} from 'lucide-react'

interface ContentBlock {
  id: string
  type: 'headline' | 'paragraph' | 'list' | 'cta' | 'quote'
  original: string
  rewritten?: string
  status: 'pending' | 'rewriting' | 'completed' | 'error'
  confidence: number
  improvements: string[]
  suggestions: string[]
  metrics: {
    readability: number
    engagement: number
    seo: number
    sentiment: number
  }
}

interface RewritingStyle {
  id: string
  name: string
  description: string
  tone: string
  audience: string
  examples: string[]
  icon: React.ReactNode
  color: string
}

interface AnalyticsData {
  originalScore: number
  rewrittenScore: number
  improvement: number
  category: string
  icon: React.ReactNode
}


function ContentBlockCard({ block, onRewrite, onAccept, onReject }: {
  block: ContentBlock
  onRewrite: (blockId: string) => void
  onAccept: (blockId: string) => void
  onReject: (blockId: string) => void
}) {
  const [showComparison, setShowComparison] = useState(false)

  const getStatusIcon = () => {
    switch (block.status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'rewriting': return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getTypeIcon = () => {
    switch (block.type) {
      case 'headline': return <FileText className="w-4 h-4" />
      case 'paragraph': return <MessageSquare className="w-4 h-4" />
      case 'list': return <Edit className="w-4 h-4" />
      case 'cta': return <Target className="w-4 h-4" />
      case 'quote': return <MessageSquare className="w-4 h-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-blue-500/20">
            <div className="text-blue-400">
              {getTypeIcon()}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white capitalize">{block.type}</span>
              {getStatusIcon()}
            </div>
            <div className="text-sm text-white/60">
              {block.confidence}% confidence • {block.improvements.length} improvements
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {block.status === 'pending' && (
            <SimpleButton size="sm" onClick={() => onRewrite(block.id)}>
              <Wand2 className="w-4 h-4 mr-2" />
              Rewrite
            </SimpleButton>
          )}
          
          {block.status === 'completed' && block.rewritten && (
            <div className="flex items-center space-x-2">
              <SimpleButton 
                variant="outline" 
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
              >
                {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </SimpleButton>
              <SimpleButton variant="outline" size="sm" onClick={() => onReject(block.id)}>
                ×
              </SimpleButton>
              <SimpleButton size="sm" onClick={() => onAccept(block.id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </SimpleButton>
            </div>
          )}
        </div>
      </div>

      {/* Original Content */}
      <div className="mb-4">
        <div className="text-sm text-white/60 mb-2">Original</div>
        <div className="p-3 bg-white/5 rounded-lg text-white/80">
          {block.original}
        </div>
      </div>

      {/* Rewritten Content */}
      {block.rewritten && (
        <div className="mb-4">
          <div className="text-sm text-white/60 mb-2">Rewritten</div>
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-white/80">
            {block.rewritten}
          </div>
        </div>
      )}

      {/* Metrics Comparison */}
      {showComparison && block.rewritten && (
        <div className="mb-4">
          <div className="text-sm text-white/60 mb-3">Performance Metrics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(block.metrics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(value)}`}>
                  {value}%
                </div>
                <div className="text-xs text-white/60 capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {block.improvements.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-white/60 mb-2">Improvements Made</div>
          <div className="flex flex-wrap gap-2">
            {block.improvements.map((improvement, index) => (
              <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                {improvement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {block.suggestions.length > 0 && (
        <div>
          <div className="text-sm text-white/60 mb-2">Additional Suggestions</div>
          <div className="space-y-1">
            {block.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StyleSelector({ styles, selectedStyle, onStyleChange }: {
  styles: RewritingStyle[]
  selectedStyle: string
  onStyleChange: (styleId: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {styles.map(style => (
        <button
          key={style.id}
          onClick={() => onStyleChange(style.id)}
          className={`p-4 rounded-lg border text-left transition-all ${
            selectedStyle === style.id
              ? `border-${style.color}-500/50 bg-${style.color}-500/10`
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className={`text-${style.color}-400`}>
              {style.icon}
            </div>
            <span className="font-medium text-white">{style.name}</span>
          </div>
          <p className="text-sm text-white/60 mb-3">{style.description}</p>
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{style.tone}</span>
            <span>{style.audience}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function AnalyticsPanel({ data }: { data: AnalyticsData[] }) {
  return (
    <SimpleCard>
      <h3 className="text-lg font-semibold text-white mb-4">Content Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map(item => (
          <div key={item.category} className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="text-blue-400">
                {item.icon}
              </div>
              <span className="font-medium text-white">{item.category}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Original</span>
                <span className="text-white">{item.originalScore}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-red-400 h-2 rounded-full"
                  style={{ width: `${item.originalScore}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Rewritten</span>
                <span className="text-white">{item.rewrittenScore}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full"
                  style={{ width: `${item.rewrittenScore}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Improvement</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">+{item.improvement}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SimpleCard>
  )
}

export default function SmartContentRewriter() {
  const [selectedStyle, setSelectedStyle] = useState('professional')
  const [isRewriting, setIsRewriting] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [preserveFormatting, setPreserveFormatting] = useState(true)

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: '1',
      type: 'headline',
      original: 'Welcome to Our Amazing Product',
      status: 'pending',
      confidence: 0,
      improvements: [],
      suggestions: [],
      metrics: { readability: 65, engagement: 45, seo: 50, sentiment: 70 }
    },
    {
      id: '2',
      type: 'paragraph',
      original: 'Our product is really good and you should definitely buy it. It has lots of features and benefits that will help you achieve your goals.',
      rewritten: 'Transform your workflow with our innovative solution designed for professionals like you. Experience increased productivity, streamlined processes, and measurable results that drive your success forward.',
      status: 'completed',
      confidence: 92,
      improvements: ['Enhanced emotional appeal', 'Improved clarity', 'Added specificity', 'Better call-to-action'],
      suggestions: ['Add social proof', 'Include specific benefits', 'Mention pricing'],
      metrics: { readability: 85, engagement: 78, seo: 82, sentiment: 85 }
    },
    {
      id: '3',
      type: 'cta',
      original: 'Click here to learn more',
      rewritten: 'Start Your Free Trial Today',
      status: 'completed',
      confidence: 88,
      improvements: ['Action-oriented language', 'Urgency added', 'Value proposition'],
      suggestions: ['Add time-limited offer', 'Include risk-free guarantee'],
      metrics: { readability: 90, engagement: 85, seo: 75, sentiment: 80 }
    }
  ])

  const rewritingStyles: RewritingStyle[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Business-focused, authoritative, and credible tone',
      tone: 'Formal',
      audience: 'Business',
      examples: ['Drive results', 'Optimize performance', 'Strategic advantage'],
      icon: <Users className="w-4 h-4" />,
      color: 'blue'
    },
    {
      id: 'casual',
      name: 'Casual & Friendly',
      description: 'Conversational, approachable, and warm',
      tone: 'Informal',
      audience: 'General',
      examples: ['Hey there!', 'Super easy', 'You\'ll love this'],
      icon: <Heart className="w-4 h-4" />,
      color: 'green'
    },
    {
      id: 'persuasive',
      name: 'Persuasive',
      description: 'Compelling, action-oriented, and motivational',
      tone: 'Urgent',
      audience: 'Customers',
      examples: ['Don\'t miss out', 'Limited time', 'Transform now'],
      icon: <Target className="w-4 h-4" />,
      color: 'purple'
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Detailed, precise, and informative',
      tone: 'Expert',
      audience: 'Developers',
      examples: ['Implementation', 'Architecture', 'Performance metrics'],
      icon: <FileText className="w-4 h-4" />,
      color: 'yellow'
    },
    {
      id: 'emotional',
      name: 'Emotional',
      description: 'Inspiring, empathetic, and story-driven',
      tone: 'Inspirational',
      audience: 'Community',
      examples: ['Imagine possibilities', 'Your journey', 'Feel empowered'],
      icon: <Star className="w-4 h-4" />,
      color: 'pink'
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Clean, simple, and straightforward',
      tone: 'Direct',
      audience: 'Modern',
      examples: ['Simple.', 'Just works.', 'Clean design.'],
      icon: <Zap className="w-4 h-4" />,
      color: 'gray'
    }
  ]

  const analyticsData: AnalyticsData[] = [
    {
      originalScore: 65,
      rewrittenScore: 85,
      improvement: 20,
      category: 'Readability',
      icon: <FileText className="w-4 h-4" />
    },
    {
      originalScore: 45,
      rewrittenScore: 78,
      improvement: 33,
      category: 'Engagement',
      icon: <Heart className="w-4 h-4" />
    },
    {
      originalScore: 50,
      rewrittenScore: 82,
      improvement: 32,
      category: 'SEO Score',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      originalScore: 70,
      rewrittenScore: 85,
      improvement: 15,
      category: 'Sentiment',
      icon: <ThumbsUp className="w-4 h-4" />
    }
  ]

  const handleRewriteBlock = (blockId: string) => {
    setContentBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, status: 'rewriting' }
        : block
    ))

    // Simulate rewriting process
    setTimeout(() => {
      setContentBlocks(prev => prev.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              status: 'completed',
              confidence: Math.floor(Math.random() * 20) + 80,
              rewritten: generateRewrittenContent(block.original, selectedStyle),
              improvements: ['Enhanced clarity', 'Improved tone', 'Better engagement'],
              suggestions: ['Add call-to-action', 'Include social proof'],
              metrics: {
                readability: Math.floor(Math.random() * 20) + 75,
                engagement: Math.floor(Math.random() * 25) + 70,
                seo: Math.floor(Math.random() * 20) + 75,
                sentiment: Math.floor(Math.random() * 15) + 80
              }
            }
          : block
      ))
    }, 2000)
  }

  const handleRewriteAll = () => {
    setIsRewriting(true)
    
    // Rewrite all pending blocks
    const pendingBlocks = contentBlocks.filter(block => block.status === 'pending')
    
    pendingBlocks.forEach((block, index) => {
      setTimeout(() => {
        handleRewriteBlock(block.id)
        if (index === pendingBlocks.length - 1) {
          setIsRewriting(false)
        }
      }, index * 1000)
    })
  }

  const generateRewrittenContent = (original: string, style: string): string => {
    // This would normally call an AI API
    const variations = {
      professional: `Enhance your business outcomes with ${original.toLowerCase()}`,
      casual: `Hey! ${original} - and it's pretty awesome!`,
      persuasive: `Don't wait - ${original.toLowerCase()} and transform your results today!`,
      technical: `Advanced ${original.toLowerCase()} with enterprise-grade features`,
      emotional: `Discover the power of ${original.toLowerCase()} that changes everything`,
      minimalist: original.split(' ').slice(0, 4).join(' ') + '.'
    }
    
    return variations[style as keyof typeof variations] || original
  }

  const handleAcceptBlock = (blockId: string) => {
    setContentBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, original: block.rewritten || block.original, rewritten: undefined, status: 'pending' }
        : block
    ))
  }

  const handleRejectBlock = (blockId: string) => {
    setContentBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, rewritten: undefined, status: 'pending' }
        : block
    ))
  }

  const completedBlocks = contentBlocks.filter(block => block.status === 'completed')
  const pendingBlocks = contentBlocks.filter(block => block.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Smart Content Rewriter</h2>
          <p className="text-white/60">Transform your content with AI-powered rewriting</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline" onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </SimpleButton>
          <SimpleButton onClick={handleRewriteAll} disabled={isRewriting || pendingBlocks.length === 0}>
            {isRewriting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Rewriting...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Rewrite All
              </>
            )}
          </SimpleButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{contentBlocks.length}</div>
              <div className="text-white/60 text-sm">Content Blocks</div>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{completedBlocks.length}</div>
              <div className="text-white/60 text-sm">Rewritten</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {completedBlocks.length > 0 ? Math.round(completedBlocks.reduce((acc, block) => acc + block.confidence, 0) / completedBlocks.length) : 0}%
              </div>
              <div className="text-white/60 text-sm">Avg Confidence</div>
            </div>
            <Target className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">+27%</div>
              <div className="text-white/60 text-sm">Engagement</div>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <SimpleCard>
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Target Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">Preserve Formatting</span>
              <button
                onClick={() => setPreserveFormatting(!preserveFormatting)}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  preserveFormatting ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute w-3 h-3 rounded-full bg-white top-1 transition-all ${
                  preserveFormatting ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <SimpleButton variant="outline" size="sm">
                <Languages className="w-4 h-4 mr-2" />
                Detect Language
              </SimpleButton>
              <SimpleButton variant="outline" size="sm">
                <Volume2 className="w-4 h-4 mr-2" />
                Voice Preview
              </SimpleButton>
            </div>
          </div>
        </SimpleCard>
      )}

      {/* Style Selection */}
      <SimpleCard>
        <h3 className="text-lg font-semibold text-white mb-4">Writing Style</h3>
        <StyleSelector 
          styles={rewritingStyles}
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />
      </SimpleCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Blocks */}
        <div className="space-y-6">
          <SimpleCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Content Blocks</h3>
              <div className="flex items-center space-x-2">
                <SimpleButton variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </SimpleButton>
                <SimpleButton variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </SimpleButton>
              </div>
            </div>

            <div className="space-y-4">
              {contentBlocks.map(block => (
                <ContentBlockCard
                  key={block.id}
                  block={block}
                  onRewrite={handleRewriteBlock}
                  onAccept={handleAcceptBlock}
                  onReject={handleRejectBlock}
                />
              ))}
            </div>
          </SimpleCard>
        </div>

        {/* Analytics */}
        <div className="space-y-6">
          <AnalyticsPanel data={analyticsData} />

          {/* Quick Actions */}
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <Copy className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Copy All</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <Download className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Export</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <RotateCcw className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Reset All</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <BarChart3 className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Analytics</div>
                </div>
              </button>
            </div>
          </SimpleCard>
        </div>
      </div>
    </div>
  )
}