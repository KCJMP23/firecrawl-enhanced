'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Search,
  Grid3x3,
  List,
  Home,
  Clock,
  Star,
  Trash2,
  FolderOpen,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  MoreVertical,
  FileText,
  Globe,
  Code2,
  Package,
  Image,
  Database,
  Sparkles,
  Download,
  Share2,
  Eye,
  Edit,
  Copy,
  Info,
  ChevronRight,
  Filter,
  SortDesc,
  Upload,
  Folder,
  Zap,
  TrendingUp,
  Activity,
  Award,
  BarChart3,
  Cpu,
  Layers,
  Shield,
  GitBranch,
  Rocket,
  Brain,
  Palette,
  Video,
  Music,
  BookOpen,
  Command,
  Crown,
  Diamond,
  Flame,
  Lightning,
  Target,
  Infinity,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  X
} from 'lucide-react'

interface Project {
  id: string
  name: string
  type: 'website' | 'pdf' | 'component' | 'api' | 'design-system'
  original_url: string
  remix_niche?: string
  thumbnail?: string
  status: 'draft' | 'processing' | 'ready' | 'remixed'
  last_modified: string
  created_at: string
  owner: string
  size?: string
  shared_with?: string[]
  starred?: boolean
  aiModel?: string
  extractionScore?: number
  performance?: {
    speed: number
    accessibility: number
    seo: number
  }
}

const projectTypeGradients = {
  website: 'from-blue-600 to-cyan-600',
  pdf: 'from-red-600 to-orange-600',
  component: 'from-purple-600 to-pink-600',
  api: 'from-green-600 to-emerald-600',
  'design-system': 'from-amber-600 to-yellow-600'
}

const projectTypeIcons = {
  website: Globe,
  pdf: FileText,
  component: Package,
  api: Database,
  'design-system': Sparkles
}

const statusColors = {
  draft: 'text-gray-400',
  processing: 'text-yellow-500',
  ready: 'text-green-500',
  remixed: 'text-purple-500'
}

const statusIcons = {
  draft: Edit,
  processing: Loader2,
  ready: CheckCircle,
  remixed: Sparkles
}

function ProjectCard({ 
  project, 
  viewMode,
  onAction 
}: { 
  project: Project
  viewMode: 'grid' | 'list'
  onAction: (action: string, projectId: string) => void 
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const TypeIcon = projectTypeIcons[project.type]
  const StatusIcon = statusIcons[project.status]
  
  if (viewMode === 'list') {
    return (
      <div 
        className="group relative flex items-center p-4 hover:bg-gray-800/50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient accent on hover */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${projectTypeGradients[project.type]} rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        
        <div className="flex items-center flex-1 min-w-0 ml-2">
          {/* Icon with gradient background */}
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${projectTypeGradients[project.type]} shadow-lg mr-4`}>
            <TypeIcon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-semibold text-white truncate">{project.name}</span>
              {project.remix_niche && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {project.remix_niche}
                </span>
              )}
              {project.starred && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
              <div className={`flex items-center gap-1 ${statusColors[project.status]}`}>
                <StatusIcon className={`w-4 h-4 ${project.status === 'processing' ? 'animate-spin' : ''}`} />
                <span className="text-xs capitalize">{project.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="font-mono">{project.original_url}</span>
              <span>Modified {new Date(project.last_modified).toLocaleDateString()}</span>
              <span>{project.size || '--'}</span>
              {project.extractionScore && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">{project.extractionScore}% match</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        {project.performance && (
          <div className="flex gap-4 mr-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Speed</div>
              <div className="text-sm font-bold text-green-400">{project.performance.speed}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">A11y</div>
              <div className="text-sm font-bold text-yellow-400">{project.performance.accessibility}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">SEO</div>
              <div className="text-sm font-bold text-blue-400">{project.performance.seo}</div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onAction('open', project.id)}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            title="Open"
          >
            <Eye className="w-4 h-4 text-gray-300" />
          </button>
          <button 
            onClick={() => onAction('remix', project.id)}
            className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors border border-purple-600/30"
            title="Remix"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="relative group cursor-pointer"
      onDoubleClick={() => onAction('open', project.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card glow effect on hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${projectTypeGradients[project.type]} rounded-2xl opacity-0 group-hover:opacity-30 transition duration-300 blur-lg`}></div>
      
      {/* Card */}
      <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden">
        {/* Thumbnail Area */}
        <div className="aspect-[4/3] bg-gray-900 relative overflow-hidden">
          {project.thumbnail ? (
            <img 
              src={project.thumbnail} 
              alt={project.name}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${projectTypeGradients[project.type]} opacity-20`}>
              <div className="w-full h-full flex items-center justify-center">
                <TypeIcon className="w-16 h-16 text-white/30" />
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xl border border-gray-700 ${statusColors[project.status]}`}>
              <StatusIcon className={`w-3 h-3 ${project.status === 'processing' ? 'animate-spin' : ''}`} />
              <span className="text-xs font-medium capitalize">{project.status}</span>
            </div>
          </div>
          
          {/* Type Badge */}
          <div className="absolute top-3 right-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${projectTypeGradients[project.type]} shadow-lg`}>
              <TypeIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          
          {/* Starred Indicator */}
          {project.starred && (
            <div className="absolute bottom-3 right-3">
              <div className="p-2 rounded-lg bg-black/50 backdrop-blur-xl border border-yellow-500/30">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end`}>
            <div className="p-4 w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => onAction('open', project.id)}
                    className="p-2.5 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-colors"
                    title="Open"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => onAction('remix', project.id)}
                    className="p-2.5 bg-purple-600/30 backdrop-blur-xl rounded-lg hover:bg-purple-600/40 transition-colors border border-purple-500/30"
                    title="Remix"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </button>
                  <button 
                    onClick={() => onAction('share', project.id)}
                    className="p-2.5 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2.5 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* Performance Metrics */}
              {project.performance && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-1.5 bg-white/5 rounded-lg backdrop-blur-xl">
                    <div className="text-[10px] text-gray-400 mb-0.5">Speed</div>
                    <div className="text-sm font-bold text-green-400">{project.performance.speed}</div>
                  </div>
                  <div className="text-center p-1.5 bg-white/5 rounded-lg backdrop-blur-xl">
                    <div className="text-[10px] text-gray-400 mb-0.5">A11y</div>
                    <div className="text-sm font-bold text-yellow-400">{project.performance.accessibility}</div>
                  </div>
                  <div className="text-center p-1.5 bg-white/5 rounded-lg backdrop-blur-xl">
                    <div className="text-[10px] text-gray-400 mb-0.5">SEO</div>
                    <div className="text-sm font-bold text-blue-400">{project.performance.seo}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Project Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white truncate mb-1" title={project.name}>
            {project.name}
          </h3>
          {project.remix_niche && (
            <p className="text-xs text-purple-400 mb-2">
              Remixed for: {project.remix_niche}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {new Date(project.last_modified).toLocaleDateString()}
            </p>
            {project.extractionScore && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">{project.extractionScore}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      {showMenu && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
          <div className="p-1">
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Eye className="w-4 h-4 text-gray-500 group-hover:text-white" /> Preview
            </button>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Edit className="w-4 h-4 text-gray-500 group-hover:text-white" /> Open in Editor
            </button>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Sparkles className="w-4 h-4 text-purple-400" /> 
              <span className="text-purple-400">Remix with AI</span>
            </button>
            <div className="my-1 border-t border-gray-800"></div>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Copy className="w-4 h-4 text-gray-500 group-hover:text-white" /> Make a Copy
            </button>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Share2 className="w-4 h-4 text-gray-500 group-hover:text-white" /> Share
            </button>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Download className="w-4 h-4 text-gray-500 group-hover:text-white" /> Export
            </button>
            <div className="my-1 border-t border-gray-800"></div>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Star className="w-4 h-4 text-gray-500 group-hover:text-yellow-500" /> 
              {project.starred ? 'Remove from Starred' : 'Add to Starred'}
            </button>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 text-gray-300 hover:text-white group">
              <Info className="w-4 h-4 text-gray-500 group-hover:text-white" /> View Details
            </button>
            <div className="my-1 border-t border-gray-800"></div>
            <button className="w-full px-3 py-2 text-left text-sm hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-3 text-red-400 hover:text-red-300 group">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeSection, setActiveSection] = useState('home')
  const [sortBy, setSortBy] = useState('modified')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)
      
      // Enhanced mock projects
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Apple.com Clone',
          type: 'website',
          original_url: 'https://www.apple.com',
          remix_niche: 'Tech Startup',
          thumbnail: '/api/placeholder/400/300',
          status: 'remixed',
          last_modified: '2024-12-27T10:00:00Z',
          created_at: '2024-12-25T10:00:00Z',
          owner: 'Me',
          size: '12.4 MB',
          starred: true,
          aiModel: 'GPT-4',
          extractionScore: 98,
          performance: {
            speed: 95,
            accessibility: 88,
            seo: 92
          }
        },
        {
          id: '2',
          name: 'E-commerce Components',
          type: 'component',
          original_url: 'https://shopify.com',
          remix_niche: 'Fashion Store',
          thumbnail: '/api/placeholder/400/300',
          status: 'ready',
          last_modified: '2024-12-26T15:30:00Z',
          created_at: '2024-12-24T15:30:00Z',
          owner: 'Me',
          size: '4.2 MB',
          aiModel: 'Claude 3',
          extractionScore: 94,
          performance: {
            speed: 91,
            accessibility: 95,
            seo: 88
          }
        },
        {
          id: '3',
          name: 'Brand Guidelines',
          type: 'pdf',
          original_url: 'company-brand.pdf',
          thumbnail: '/api/placeholder/400/300',
          status: 'ready',
          last_modified: '2024-12-25T09:15:00Z',
          created_at: '2024-12-23T09:15:00Z',
          owner: 'Me',
          size: '8.7 MB',
          extractionScore: 100
        },
        {
          id: '4',
          name: 'Material Design System',
          type: 'design-system',
          original_url: 'https://material.io',
          remix_niche: 'Healthcare App',
          thumbnail: '/api/placeholder/400/300',
          status: 'remixed',
          last_modified: '2024-12-24T14:20:00Z',
          created_at: '2024-12-22T14:20:00Z',
          owner: 'Me',
          size: '18.3 MB',
          starred: true,
          aiModel: 'GPT-4 Vision',
          extractionScore: 96,
          performance: {
            speed: 89,
            accessibility: 94,
            seo: 90
          }
        },
        {
          id: '5',
          name: 'Stripe API Documentation',
          type: 'api',
          original_url: 'https://stripe.com/docs/api',
          remix_niche: 'Payment Gateway',
          thumbnail: '/api/placeholder/400/300',
          status: 'processing',
          last_modified: '2024-12-23T11:45:00Z',
          created_at: '2024-12-21T11:45:00Z',
          owner: 'Me',
          size: '2.1 MB',
          aiModel: 'Claude 3',
          extractionScore: 87
        },
        {
          id: '6',
          name: 'Linear.app Dashboard',
          type: 'website',
          original_url: 'https://linear.app',
          remix_niche: 'Project Management',
          thumbnail: '/api/placeholder/400/300',
          status: 'ready',
          last_modified: '2024-12-27T08:00:00Z',
          created_at: '2024-12-26T08:00:00Z',
          owner: 'Me',
          size: '7.3 MB',
          starred: true,
          aiModel: 'GPT-4',
          extractionScore: 92,
          performance: {
            speed: 97,
            accessibility: 91,
            seo: 94
          }
        }
      ]
      setProjects(mockProjects)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleProjectAction = (action: string, projectId: string) => {
    if (action === 'open') {
      router.push(`/chat/${projectId}`)
    } else if (action === 'remix') {
      router.push(`/chat/${projectId}?action=remix`)
    } else {
      console.log(`${action} project ${projectId}`)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.remix_niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.original_url.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeSection === 'starred') return matchesSearch && project.starred
    if (activeSection === 'recent') {
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 7)
      return matchesSearch && new Date(project.last_modified) > dayAgo
    }
    if (activeSection === 'trash') return false
    
    return matchesSearch
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'modified') {
      return new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime()
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy === 'score') {
      return (b.extractionScore || 0) - (a.extractionScore || 0)
    }
    return 0
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center backdrop-blur-xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-400">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-pink-900/10"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Mouse follower gradient */}
      <div 
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-5 blur-3xl transition-all duration-1000 ease-out z-0"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
        }}
      />

      {/* Sidebar */}
      <div className="relative w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 flex flex-col z-10">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">WebClone Pro</span>
              <p className="text-xs text-gray-500">Next-gen extraction</p>
            </div>
          </div>
        </div>
        
        {/* New Button */}
        <div className="p-4">
          <Link href="/dashboard/new">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-medium group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>New Extraction</span>
            </button>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {[
            { id: 'home', label: 'Dashboard', icon: Home },
            { id: 'my-drive', label: 'My Projects', icon: Folder },
            { id: 'shared', label: 'Shared with me', icon: Users },
            { id: 'recent', label: 'Recent', icon: Clock },
            { id: 'starred', label: 'Starred', icon: Star },
            { id: 'trash', label: 'Trash', icon: Trash2 },
          ].map(item => {
            const Icon = item.icon
            return (
              <button 
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-600/30' 
                    : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeSection === item.id ? 'text-purple-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'starred' && (
                  <span className="ml-auto text-xs text-gray-500">
                    {projects.filter(p => p.starred).length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        
        {/* Stats */}
        <div className="p-4 space-y-4 border-t border-gray-800">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-400">Active</span>
              </div>
              <p className="text-lg font-bold text-white">{projects.filter(p => p.status === 'processing').length}</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-400">Complete</span>
              </div>
              <p className="text-lg font-bold text-white">{projects.filter(p => p.status === 'ready' || p.status === 'remixed').length}</p>
            </div>
          </div>
          
          {/* Credits */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                Credits
              </span>
              <span className="text-white font-medium">35 / 50</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full relative" style={{ width: '70%' }}>
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>
            <button className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Get unlimited credits →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col z-10">
        {/* Top Bar */}
        <div className="bg-gray-900/30 backdrop-blur-xl border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects, URLs, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-6">
              <button className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2.5 hover:bg-gray-800/50 rounded-xl transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="bg-gray-900/20 backdrop-blur-xl border-b border-gray-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const options = ['modified', 'name', 'score']
                  const current = options.indexOf(sortBy)
                  setSortBy(options[(current + 1) % options.length])
                }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-1.5 hover:bg-gray-800/50 rounded-lg transition-all"
              >
                <SortDesc className="w-4 h-4" />
                Sort: {sortBy === 'modified' ? 'Last modified' : sortBy === 'name' ? 'Name' : 'Match score'}
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-1.5 hover:bg-gray-800/50 rounded-lg transition-all">
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 text-gray-400'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Projects Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white capitalize bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {activeSection === 'my-drive' ? 'My Projects' : activeSection === 'home' ? 'Dashboard' : activeSection.replace('-', ' ')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {sortedProjects.length} {sortedProjects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          
          {/* Quick Stats for Dashboard */}
          {activeSection === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Extractions', value: projects.length, icon: Package, color: 'from-blue-600 to-cyan-600', change: '+12%' },
                { label: 'AI Remixes', value: projects.filter(p => p.status === 'remixed').length, icon: Sparkles, color: 'from-purple-600 to-pink-600', change: '+24%' },
                { label: 'Avg. Score', value: Math.round(projects.reduce((acc, p) => acc + (p.extractionScore || 0), 0) / projects.length), icon: TrendingUp, color: 'from-green-600 to-emerald-600', change: '+5%' },
                { label: 'Credits Left', value: 15, icon: Zap, color: 'from-yellow-600 to-orange-600', change: '-30%' }
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="relative p-5 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Main Content Area */}
          {sortedProjects.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProjects.map(project => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    viewMode={viewMode}
                    onAction={handleProjectAction}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedProjects.map(project => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    viewMode={viewMode}
                    onAction={handleProjectAction}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mb-6">
                <FolderOpen className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-gray-400 mb-8 text-center max-w-md">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by extracting your first website'}
              </p>
              <Link href="/dashboard/new">
                <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-medium group">
                  <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Start Extracting</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}