'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Globe,
  FileText,
  Package,
  Database,
  Sparkles,
  Link2,
  Upload,
  Wand2,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Check,
  AlertCircle,
  Loader2,
  Search,
  ArrowRight,
  Eye,
  Code2,
  Palette,
  Image as ImageIcon,
  Video,
  ChevronRight,
  Star,
  Rocket,
  Bot,
  Layers,
  Command,
  Cpu,
  GitBranch,
  Lightning,
  Brain,
  Flame,
  Diamond,
  Crown,
  Target,
  ArrowUpRight,
  Infinity
} from 'lucide-react'

interface ExtractionOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  credits: number
  features: string[]
  recommended?: boolean
  badge?: string
  gradient: string
}

const extractionOptions: ExtractionOption[] = [
  {
    id: 'design-only',
    name: 'Design System',
    description: 'Extract design tokens & components',
    icon: <Palette className="w-6 h-6" />,
    credits: 1,
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      'Color palette & gradients',
      'Typography scales',
      'Spacing system',
      'Component patterns'
    ]
  },
  {
    id: 'full-remix',
    name: 'AI Remix Studio',
    description: 'Complete extraction with AI-powered remixing',
    icon: <Brain className="w-6 h-6" />,
    credits: 5,
    gradient: 'from-purple-600 to-pink-600',
    features: [
      'Everything in Design System',
      'GPT-4 content generation',
      'Multi-agent optimization',
      'Export to any framework',
      'Responsive variations'
    ],
    recommended: true,
    badge: 'MOST POPULAR'
  },
  {
    id: 'animations',
    name: 'Motion Capture',
    description: 'Extract all animations & interactions',
    icon: <Sparkles className="w-6 h-6" />,
    credits: 3,
    gradient: 'from-orange-500 to-red-500',
    features: [
      'GSAP timeline extraction',
      'Framer Motion sequences',
      'CSS animations',
      'Scroll-triggered effects',
      'Micro-interactions'
    ],
    badge: 'UNIQUE'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Suite',
    description: 'Full analysis with competitive insights',
    icon: <Crown className="w-6 h-6" />,
    credits: 10,
    gradient: 'from-yellow-500 to-orange-500',
    features: [
      'Complete site crawl',
      'Performance metrics',
      'SEO & accessibility',
      'Security analysis',
      'Competitive insights',
      'White-label export'
    ],
    badge: 'PREMIUM'
  }
]

const popularSites = [
  { name: 'Apple', url: 'https://www.apple.com', type: 'Tech', icon: '🍎', gradient: 'from-gray-700 to-gray-900' },
  { name: 'Stripe', url: 'https://stripe.com', type: 'FinTech', icon: '💳', gradient: 'from-purple-600 to-blue-600' },
  { name: 'Linear', url: 'https://linear.app', type: 'SaaS', icon: '📊', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Vercel', url: 'https://vercel.com', type: 'DevTools', icon: '▲', gradient: 'from-black to-gray-800' },
  { name: 'Airbnb', url: 'https://www.airbnb.com', type: 'Travel', icon: '🏠', gradient: 'from-red-500 to-pink-500' },
  { name: 'Spotify', url: 'https://www.spotify.com', type: 'Music', icon: '🎵', gradient: 'from-green-500 to-green-600' }
]

const recentExtractions = [
  { url: 'dribbble.com', time: '2 min ago', type: 'Design Portfolio' },
  { url: 'notion.so', time: '5 min ago', type: 'Productivity' },
  { url: 'figma.com', time: '12 min ago', type: 'Design Tool' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [projectType, setProjectType] = useState('website')
  const [selectedOption, setSelectedOption] = useState('full-remix')
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [step, setStep] = useState<'url' | 'options' | 'processing'>('url')
  const [extractionProgress, setExtractionProgress] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const validateUrl = (inputUrl: string) => {
    try {
      const urlObj = new URL(inputUrl)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'Please enter a valid HTTP or HTTPS URL'
      }
      return ''
    } catch {
      return 'Please enter a valid URL'
    }
  }

  const handleUrlSubmit = () => {
    const error = validateUrl(url)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError('')
    setStep('options')
  }

  const handleStartExtraction = async () => {
    setStep('processing')
    setIsLoading(true)
    
    // Start listening for progress updates
    const eventSource = new EventSource('/api/extract/progress')
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setExtractionProgress(data)
      
      if (data.status === 'complete') {
        eventSource.close()
      }
    }
    
    eventSource.onerror = () => {
      eventSource.close()
    }
    
    try {
      // Start extraction via API
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          options: {
            extractionType: selectedOption,
            contentType: projectType
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Extraction failed')
      }

      const { project, creditsUsed } = await response.json()
      
      // Navigate to chat/remix page with the new project
      setTimeout(() => {
        eventSource.close()
        router.push(`/chat/${project.id}`)
      }, 1000)
    } catch (error) {
      console.error('Extraction error:', error)
      eventSource.close()
      setValidationError(error instanceof Error ? error.message : 'Extraction failed')
      setStep('options')
      setIsLoading(false)
    }
  }

  const handleQuickStart = (siteUrl: string) => {
    setUrl(siteUrl)
    setValidationError('')
    setStep('options')
  }

  const currentCredits = 35
  const selectedCredits = extractionOptions.find(o => o.id === selectedOption)?.credits || 0
  const hasEnoughCredits = currentCredits >= selectedCredits

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-md w-full text-center px-6">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <div className="relative">
                  <Cpu className="w-12 h-12 text-white animate-pulse" />
                  <div className="absolute inset-0 animate-spin-slow">
                    <Sparkles className="w-12 h-12 text-white/50" />
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Extracting Design DNA
            </h2>
            <p className="text-gray-400 mb-8 font-mono text-sm">{url}</p>
            
            <div className="space-y-4 text-left max-w-xs mx-auto">
              {[
                { label: 'Analyzing DOM structure', progress: 100, icon: <Code2 className="w-4 h-4" /> },
                { label: 'Extracting design tokens', progress: extractionProgress?.step >= 3 ? 100 : 20, icon: <Palette className="w-4 h-4" /> },
                { label: 'Capturing animations', progress: extractionProgress?.step >= 6 ? 100 : 0, icon: <Sparkles className="w-4 h-4" /> },
                { label: 'Training AI models', progress: extractionProgress?.step >= 9 ? 100 : 0, icon: <Brain className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`text-purple-400 ${item.progress === 100 ? 'opacity-100' : 'opacity-50'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        item.progress === 100 ? 'text-white' : 'text-gray-500'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{item.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative"
                      style={{ width: `${item.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
            </div>
            <span>AI agents working their magic</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'options') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('url')} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Choose Your Extraction Mode
                  </h1>
                  <p className="text-sm text-gray-500 font-mono">{url}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-300">
                    <span className="text-white font-bold">{currentCredits}</span> credits
                  </span>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                  Get More
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {extractionOptions.map((option, index) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedOption === option.id ? 'scale-[1.02]' : ''
                }`}
              >
                {/* Card glow effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${option.gradient} rounded-2xl opacity-0 group-hover:opacity-100 ${
                  selectedOption === option.id ? 'opacity-100' : ''
                } transition duration-300 blur`}></div>
                
                <div className={`relative p-6 bg-gray-900 rounded-2xl border ${
                  selectedOption === option.id 
                    ? 'border-transparent' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}>
                  {option.badge && (
                    <div className="absolute -top-3 left-6">
                      <span className={`px-3 py-1 bg-gradient-to-r ${option.gradient} text-white text-xs font-bold rounded-full`}>
                        {option.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${option.gradient} shadow-lg`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{option.name}</h3>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {option.credits}
                        </span>
                        <span className="text-xs text-gray-500">credits</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {option.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${option.gradient} p-0.5`}>
                          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {selectedOption === option.id && (
                    <div className="absolute top-4 right-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${option.gradient} flex items-center justify-center shadow-lg`}>
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {option.recommended && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-2 text-xs">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-400">Recommended for most users</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom action bar */}
          <div className="mt-12 p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  hasEnoughCredits ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'
                }`}>
                  {hasEnoughCredits ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-green-300">Ready to extract</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-sm text-red-300">Need {selectedCredits - currentCredits} more credits</span>
                    </>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  Estimated time: <span className="text-white font-medium">10-30 seconds</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('url')}
                  className="px-6 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 font-medium transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleStartExtraction}
                  disabled={!hasEnoughCredits}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transition-all flex items-center gap-2 group"
                >
                  <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Extraction
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-pink-900/10"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Mouse follower gradient */}
      <div 
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 blur-3xl transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
        }}
      />
      
      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        
        {/* Hero section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-800 rounded-full text-xs text-purple-300 mb-6">
            <Sparkles className="w-3 h-3" />
            AI-Powered Extraction
          </div>
          
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-300">
              Clone Any Website
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Extract design systems, animations, and components from any website. 
            Our AI agents will remix everything for your specific needs.
          </p>
          
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Infinity className="w-4 h-4" />
              <span>Unlimited Remixes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lightning className="w-4 h-4" />
              <span>10s Average</span>
            </div>
          </div>
        </div>
        
        {/* Main input card */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 mb-8">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-4">
              Enter Website URL
            </label>
            <div className="relative group">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setValidationError('')
                }}
                placeholder="https://example.com"
                className="w-full px-6 py-5 pl-14 text-lg bg-black border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600 text-white"
                autoFocus
              />
              <Globe className="w-6 h-6 text-gray-500 absolute left-5 top-1/2 -translate-y-1/2" />
              {url && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <Eye className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>
            {validationError && (
              <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {validationError}
              </p>
            )}
          </div>
          
          {/* Content type selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-4">
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'website', name: 'Website', icon: <Globe className="w-5 h-5" />, color: 'purple' },
                { id: 'pdf', name: 'PDF', icon: <FileText className="w-5 h-5" />, color: 'blue' },
                { id: 'component', name: 'Component', icon: <Package className="w-5 h-5" />, color: 'green' },
                { id: 'api', name: 'API Docs', icon: <Database className="w-5 h-5" />, color: 'orange' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  className={`p-4 rounded-xl border transition-all group ${
                    projectType === type.id
                      ? `bg-${type.color}-900/30 border-${type.color}-700 text-white`
                      : 'bg-gray-800/30 border-gray-700 hover:border-gray-600 text-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={projectType === type.id ? `text-${type.color}-400` : ''}>
                      {type.icon}
                    </div>
                    <span className="text-sm font-medium">{type.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleUrlSubmit}
            disabled={!url || isLoading}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Continue to Extraction Options
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
        
        {/* Popular sites grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Popular sites */}
          <div className="bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Popular Sites to Try
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {popularSites.map(site => (
                <button
                  key={site.url}
                  onClick={() => handleQuickStart(site.url)}
                  className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all text-left group border border-gray-700 hover:border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${site.gradient} flex items-center justify-center text-lg`}>
                      {site.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{site.name}</div>
                      <div className="text-xs text-gray-500">{site.type}</div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Recent extractions */}
          <div className="bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Community Extractions
            </h3>
            <div className="space-y-3">
              {recentExtractions.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="text-sm text-white font-mono">{item.url}</div>
                      <div className="text-xs text-gray-500">{item.type}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-600">
            We respect intellectual property. Only design patterns are extracted - no copyrighted content or assets.
          </p>
        </div>
      </div>
    </div>
  )
}