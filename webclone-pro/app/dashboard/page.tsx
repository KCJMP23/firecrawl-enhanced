'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const CloneProgress = dynamic(() => import('@/components/CloneProgress'), {
  ssr: false
})
const ExportDialog = dynamic(() => import('@/components/ExportDialog'), {
  ssr: false
})
const DeployDialog = dynamic(() => import('@/components/DeployDialog'), {
  ssr: false
})
import { 
  Plus, 
  Globe, 
  Settings, 
  LogOut, 
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Download,
  Sparkles,
  Brain,
  Rocket,
  BarChart3,
  Users,
  Clock,
  Cpu,
  Zap,
  TrendingUp,
  DollarSign,
  Code2,
  Palette,
  Chrome,
  Package,
  Activity,
  CreditCard
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface Project {
  id: string
  name: string
  description: string
  original_url: string
  status: 'pending' | 'cloning' | 'processing' | 'completed' | 'failed'
  progress: number
  created_at: string
  updated_at: string
}



function ProjectCard({ project, onAction }: { project: Project; onAction: (action: string, projectId: string) => void }) {
  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-400/20',
    cloning: 'text-blue-400 bg-blue-400/20',
    processing: 'text-purple-400 bg-purple-400/20',
    completed: 'text-green-400 bg-green-400/20',
    failed: 'text-red-400 bg-red-400/20'
  }

  return (
    <SimpleCard className="hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
          <p className="text-white/60 text-sm mb-2">{project.description || 'No description'}</p>
          <a 
            href={project.original_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            {project.original_url}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
            {project.status}
          </span>
          <SimpleButton variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </SimpleButton>
        </div>
      </div>
      
      {/* Progress Bar or Live Progress */}
      {project.status === 'cloning' || project.status === 'processing' ? (
        <div className="mb-4">
          <CloneProgress 
            projectId={project.id}
            onComplete={() => {
              // Refresh project data
              window.location.reload()
            }}
          />
        </div>
      ) : project.status === 'pending' ? (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Progress</span>
            <span className="text-white/60 text-sm">{project.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      ) : null}
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-white/40 text-sm">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
        <div className="flex items-center space-x-2">
          {project.status === 'completed' && (
            <>
              <Link href={`/editor/${project.id}`}>
                <SimpleButton size="sm" variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Edit
                </SimpleButton>
              </Link>
              <Link href={`/chat/${project.id}`}>
                <SimpleButton size="sm" variant="outline">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Chat
                </SimpleButton>
              </Link>
            </>
          )}
          {project.status === 'cloning' && (
            <SimpleButton size="sm" variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </SimpleButton>
          )}
          <SimpleButton size="sm" variant="ghost" onClick={() => onAction('delete', project.id)}>
            <Trash2 className="w-4 h-4" />
          </SimpleButton>
        </div>
      </div>
    </SimpleCard>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)
      
      // Fetch projects (mock data for now)
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Apple Homepage Clone',
          description: 'Complete clone of Apple.com with all animations',
          original_url: 'https://www.apple.com',
          status: 'completed',
          progress: 100,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Stripe Landing Page',
          description: 'Modern payment platform design',
          original_url: 'https://stripe.com',
          status: 'cloning',
          progress: 65,
          created_at: '2024-01-14T15:30:00Z',
          updated_at: '2024-01-14T16:00:00Z'
        },
        {
          id: '3',
          name: 'Netflix Interface',
          description: 'Streaming platform UI clone',
          original_url: 'https://netflix.com',
          status: 'pending',
          progress: 0,
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z'
        }
      ]
      setProjects(mockProjects)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleProjectAction = (action: string, projectId: string) => {
    console.log(`${action} project ${projectId}`)
    // Implement project actions
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.original_url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    {
      label: 'Total Clones',
      value: '∞',
      sublabel: 'Unlimited',
      icon: <Globe className="w-5 h-5" />,
      change: 'NO LIMITS',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Animations Extracted',
      value: '1,234',
      sublabel: 'All libraries',
      icon: <Sparkles className="w-5 h-5" />,
      change: '+45%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Backend Credits',
      value: '$35',
      sublabel: 'of $50',
      icon: <CreditCard className="w-5 h-5" />,
      change: '70% remaining',
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Avg Clone Speed',
      value: '8.2s',
      sublabel: 'Industry best',
      icon: <Zap className="w-5 h-5" />,
      change: '3x faster',
      color: 'from-orange-500 to-red-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  WebClone Pro
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <span className="text-white font-medium">Dashboard</span>
                <span className="text-white/60 hover:text-white cursor-pointer transition-colors">Projects</span>
                <Link href="/templates" className="text-white/60 hover:text-white cursor-pointer transition-colors">Templates</Link>
                <Link href="/teams" className="text-white/60 hover:text-white cursor-pointer transition-colors">Teams</Link>
                <Link href="/analytics" className="text-white/60 hover:text-white cursor-pointer transition-colors">Analytics</Link>
                <Link href="/monitoring" className="text-white/60 hover:text-white cursor-pointer transition-colors">Monitoring</Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white/60 text-sm">
                Welcome back, {user?.email?.split('@')[0]}
              </span>
              <Link href="/settings">
                <SimpleButton variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </SimpleButton>
              </Link>
              <SimpleButton variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </SimpleButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/60">Manage your website clones and AI projects</p>
          </div>
          <Link href="/dashboard/new">
            <SimpleButton size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </SimpleButton>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <SimpleCard key={index} className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  {stat.sublabel && (
                    <p className="text-white/40 text-xs mt-1">{stat.sublabel}</p>
                  )}
                </div>
              </div>
            </SimpleCard>
          ))}
        </div>

        {/* Competitive Advantages Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">🎯 Your Competitive Edge</h3>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm text-white">
                  <Sparkles className="w-4 h-4 mr-1 text-purple-400" />
                  Animation Extraction (Exclusive)
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm text-white">
                  <Palette className="w-4 h-4 mr-1 text-blue-400" />
                  Design DNA System
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm text-white">
                  <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                  No Token Limits
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm text-white">
                  <Code2 className="w-4 h-4 mr-1 text-cyan-400" />
                  20+ Frameworks
                </span>
              </div>
            </div>
            <Link href="/marketplace">
              <SimpleButton size="sm" variant="outline">
                Explore Marketplace →
              </SimpleButton>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <SimpleCard className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/new" className="flex items-center p-4 rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="p-3 rounded-xl bg-blue-500/20 mr-4">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Clone Website</h3>
                <p className="text-white/60 text-sm">Start a new website clone</p>
              </div>
            </Link>
            <Link href="/ai-models" className="flex items-center p-4 rounded-lg border border-white/10 hover:border-cyan-500/50 transition-colors cursor-pointer">
              <div className="p-3 rounded-xl bg-cyan-500/20 mr-4">
                <Cpu className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">AI Models</h3>
                <p className="text-white/60 text-sm">Configure AI models</p>
              </div>
            </Link>
            <div className="flex items-center p-4 rounded-lg border border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer">
              <div className="p-3 rounded-xl bg-purple-500/20 mr-4">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">AI Remix</h3>
                <p className="text-white/60 text-sm">Transform with AI</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg border border-white/10 hover:border-green-500/50 transition-colors cursor-pointer">
              <div className="p-3 rounded-xl bg-green-500/20 mr-4">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Deploy</h3>
                <p className="text-white/60 text-sm">Launch to production</p>
              </div>
            </div>
          </div>
        </SimpleCard>

        {/* Projects */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Projects</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
            <SimpleButton variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </SimpleButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onAction={handleProjectAction}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
            <p className="text-white/60 mb-6">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by cloning your first website.'}
            </p>
            <Link href="/dashboard/new">
              <SimpleButton>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </SimpleButton>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}