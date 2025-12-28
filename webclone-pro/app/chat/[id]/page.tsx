'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send,
  Code2,
  Eye,
  Sparkles,
  Palette,
  Globe,
  Brain,
  Zap,
  Settings,
  Download,
  Share2,
  Play,
  RefreshCw,
  MessageSquare,
  Bot,
  User,
  Layers,
  Wand2,
  Target,
  ArrowLeft,
  Shield,
  Search,
  TrendingUp,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Terminal,
  Smartphone,
  Tablet,
  Monitor,
  ChevronRight,
  Command,
  Loader2,
  Plus,
  X,
  GitBranch,
  History
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agent?: string
  code?: string
}

interface Project {
  id: string
  name: string
  type: string
  original_url: string
  remix_niche?: string
  design_system?: any
  current_preview?: string
}

interface ChatPageProps {
  params: Promise<{ id: string }>
}

const agents = [
  { id: 'design', name: 'Design', icon: Palette, gradient: 'from-violet-500 to-purple-600' },
  { id: 'content', name: 'Content', icon: MessageSquare, gradient: 'from-blue-500 to-cyan-600' },
  { id: 'code', name: 'Code', icon: Code2, gradient: 'from-emerald-500 to-green-600' },
  { id: 'ux', name: 'UX', icon: Target, gradient: 'from-orange-500 to-amber-600' },
  { id: 'performance', name: 'Performance', icon: Zap, gradient: 'from-yellow-500 to-orange-500' },
  { id: 'seo', name: 'SEO', icon: Globe, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'security', name: 'Security', icon: Shield, gradient: 'from-red-500 to-pink-600' },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp, gradient: 'from-indigo-500 to-purple-600' }
]

const quickActions = [
  { label: 'Make it modern', prompt: 'Make it more modern and minimalist with clean design' },
  { label: 'Add animations', prompt: 'Add smooth animations and micro-interactions' },
  { label: 'Optimize mobile', prompt: 'Optimize for mobile devices with responsive design' },
  { label: 'Improve a11y', prompt: 'Improve accessibility following WCAG guidelines' },
  { label: 'Dark mode', prompt: 'Add dark mode support with smooth transitions' },
  { label: 'Performance', prompt: 'Optimize performance for faster loading' }
]

const viewModes = [
  { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
  { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' }
]

export default function ChatPage({ params }: ChatPageProps) {
  const { id: projectId } = use(params)
  const router = useRouter()
  
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [activeAgent, setActiveAgent] = useState('design')
  const [remixNiche, setRemixNiche] = useState('')
  const [showRemixModal, setShowRemixModal] = useState(true)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [splitView, setSplitView] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Load project data
    const mockProject: Project = {
      id: projectId,
      name: 'Modern SaaS Platform',
      type: 'website',
      original_url: 'https://example.com',
      remix_niche: '',
      current_preview: '/api/placeholder/800/600'
    }
    setProject(mockProject)
    
    // Initial system message
    setMessages([
      {
        id: '1',
        role: 'system',
        content: "Welcome! I've analyzed the design system. Let's transform it for your specific needs. What industry or niche would you like to adapt this design for?",
        timestamp: new Date(),
        agent: 'Design Agent'
      }
    ])
  }, [projectId])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // Simulate AI response
    setTimeout(() => {
      const agent = agents.find(a => a.id === activeAgent)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAgentResponse(input, activeAgent, remixNiche),
        timestamp: new Date(),
        agent: agent?.name + ' Agent',
        code: activeAgent === 'code' ? generateSampleCode() : undefined
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }
  
  const generateAgentResponse = (input: string, agent: string, niche: string) => {
    const responses: Record<string, string> = {
      design: `Applying modern design principles for ${niche || 'your industry'}. I'll create a clean, professional interface with smooth animations and intuitive navigation.`,
      content: `Crafting compelling content for ${niche || 'your audience'}. I'll focus on clear messaging, strong value propositions, and conversion-optimized copy.`,
      code: `Implementing the technical architecture for ${niche || 'your platform'}. Using React, TypeScript, and modern best practices for scalability.`,
      ux: `Optimizing user experience for ${niche || 'your users'}. Focusing on intuitive flows, reduced friction, and delightful interactions.`,
      performance: `Enhancing performance metrics for optimal user experience. Targeting sub-2s load times and smooth 60fps interactions.`,
      seo: `Implementing SEO best practices for ${niche || 'your market'}. Focusing on technical SEO, content optimization, and schema markup.`,
      security: `Applying security measures for ${niche || 'your application'}. Implementing authentication, authorization, and data protection.`,
      analytics: `Setting up analytics for ${niche || 'your business'}. Tracking user behavior, conversion funnels, and key metrics.`
    }
    
    return responses[agent] || 'Processing your request...'
  }
  
  const generateSampleCode = () => {
    return `export const HeroSection = () => {
  return (
    <motion.section className="relative overflow-hidden">
      <div className="container mx-auto px-6 py-24">
        <motion.h1 
          className="text-6xl font-bold gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Transform Your Business
        </motion.h1>
      </div>
    </motion.section>
  )
}`
  }
  
  const handleRemixSubmit = () => {
    if (!remixNiche.trim()) return
    
    setShowRemixModal(false)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Perfect! Let's transform this design for the ${remixNiche} industry. I'll adapt the visual language, content structure, and technical implementation specifically for your needs.`,
      timestamp: new Date(),
      agent: 'Design Agent'
    }])
    
    if (project) {
      project.remix_niche = remixNiche
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Remix Modal */}
      <AnimatePresence>
        {showRemixModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => router.push('/dashboard')}
            />
            <motion.div 
              className="relative bg-card border border-border rounded-2xl max-w-lg w-full p-8 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button 
                onClick={() => router.push('/dashboard')}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-6">
                  <Wand2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-gradient">Remix This Design</h2>
                <p className="text-muted-foreground">
                  We'll intelligently adapt this design system for your specific industry, 
                  maintaining professional quality while tailoring it to your needs.
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Industry or Niche
                  </label>
                  <input
                    type="text"
                    value={remixNiche}
                    onChange={(e) => setRemixNiche(e.target.value)}
                    placeholder="e.g., SaaS, Healthcare, E-commerce, FinTech..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemixSubmit}
                    disabled={!remixNiche.trim()}
                    className="flex-1 px-6 py-3 gradient-brand text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
                  >
                    Start Remixing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar - Chat */}
      <div className="w-[420px] bg-card border-r border-border flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/dashboard" 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1">
              <h1 className="font-semibold text-foreground">{project?.name}</h1>
              {remixNiche && (
                <p className="text-xs text-muted-foreground">Remixing for {remixNiche}</p>
              )}
            </div>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <History className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          {/* Agent Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {agents.map(agent => {
              const Icon = agent.icon
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeAgent === agent.id
                      ? `bg-gradient-to-r ${agent.gradient} text-white`
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{agent.name}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary'
                    : 'bg-gradient-to-br from-violet-500 to-purple-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.agent && (
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">
                      {message.agent}
                    </p>
                  )}
                  <div className={`inline-block px-4 py-2.5 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.code && (
                      <div className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                        <code className="text-xs font-mono">View code →</code>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted px-4 py-2.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={remixNiche ? "Describe your changes..." : "First, select your niche above"}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              disabled={!remixNiche}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || !remixNiche}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-1.5 flex-wrap">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action.prompt)}
                className="text-[11px] px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content - Preview/Code */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Toolbar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowPreview(true); setShowCode(false); setSplitView(false) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showPreview && !showCode ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1.5" />
              Preview
            </button>
            <button
              onClick={() => { setShowCode(true); setShowPreview(false); setSplitView(false) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showCode && !showPreview ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <Code2 className="w-4 h-4 inline mr-1.5" />
              Code
            </button>
            <button
              onClick={() => { setSplitView(!splitView); setShowCode(splitView ? false : true); setShowPreview(true) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                splitView ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-1.5" />
              Split
            </button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            {/* View Mode Selector */}
            {showPreview && (
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                {viewModes.map(mode => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === mode.id ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                      }`}
                      title={mode.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <GitBranch className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium">
              <Download className="w-4 h-4 inline mr-1.5" />
              Export
            </button>
            <button className="px-3 py-1.5 gradient-brand text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
              <Play className="w-4 h-4 inline mr-1.5" />
              Deploy
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {showPreview && (
            <div className={`${splitView ? 'w-1/2 border-r border-border' : 'flex-1'} flex items-center justify-center p-8 bg-grid`}>
              <motion.div 
                className="bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                style={{ 
                  width: viewModes.find(m => m.id === viewMode)?.width,
                  maxWidth: '100%'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-muted/50 p-2 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 bg-background rounded text-xs text-muted-foreground">
                      {project?.original_url}
                    </div>
                  </div>
                </div>
                <div className="aspect-video bg-gradient-mesh flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 font-medium">Live Preview</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          
          {(showCode || splitView) && (
            <div className={`${splitView ? 'w-1/2' : 'flex-1'} flex flex-col bg-[#0a0a0a]`}>
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                    <Terminal className="w-3 h-3 text-violet-400" />
                    <span className="text-xs text-gray-400">HeroSection.tsx</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded">
                    React + TypeScript
                  </span>
                </div>
                <button 
                  onClick={() => handleCopy(generateSampleCode())}
                  className="p-1.5 hover:bg-white/5 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed">
                  <code>{generateSampleCode()}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}