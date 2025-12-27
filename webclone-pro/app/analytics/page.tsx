'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Clock,
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  ExternalLink,
  Zap,
  Eye,
  MousePointer,
  Share2
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface AnalyticsData {
  overview: {
    totalClones: number
    totalDeployments: number
    totalViews: number
    avgCloneTime: number
    successRate: number
    storageUsed: number
  }
  trends: {
    daily: Array<{ date: string; clones: number; views: number }>
    weekly: Array<{ week: string; clones: number; deployments: number }>
  }
  topProjects: Array<{
    id: string
    name: string
    url: string
    clones: number
    views: number
    deployments: number
  }>
  technologies: Array<{
    name: string
    count: number
    percentage: number
  }>
  performance: {
    avgLoadTime: number
    avgCloneSize: number
    errorRate: number
  }
}



function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'up' 
}: {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400'
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity
  
  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <div className="text-blue-400">{icon}</div>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-white/60 text-sm">{title}</div>
      </div>
    </SimpleCard>
  )
}

function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/60">{item.label}</span>
            <span className="text-sm font-medium text-white">{item.value}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalClones: 247,
      totalDeployments: 89,
      totalViews: 3456,
      avgCloneTime: 2.5,
      successRate: 94.3,
      storageUsed: 12.7
    },
    trends: {
      daily: [
        { date: 'Mon', clones: 12, views: 145 },
        { date: 'Tue', clones: 19, views: 223 },
        { date: 'Wed', clones: 15, views: 189 },
        { date: 'Thu', clones: 25, views: 312 },
        { date: 'Fri', clones: 22, views: 278 },
        { date: 'Sat', clones: 18, views: 234 },
        { date: 'Sun', clones: 14, views: 167 }
      ],
      weekly: []
    },
    topProjects: [
      { id: '1', name: 'Apple Homepage Clone', url: 'apple.com', clones: 45, views: 892, deployments: 12 },
      { id: '2', name: 'Stripe Landing', url: 'stripe.com', clones: 38, views: 734, deployments: 8 },
      { id: '3', name: 'Netflix Interface', url: 'netflix.com', clones: 31, views: 623, deployments: 6 }
    ],
    technologies: [
      { name: 'React', count: 89, percentage: 36 },
      { name: 'Next.js', count: 67, percentage: 27 },
      { name: 'Vue', count: 45, percentage: 18 },
      { name: 'Static HTML', count: 46, percentage: 19 }
    ],
    performance: {
      avgLoadTime: 1.3,
      avgCloneSize: 24.5,
      errorRate: 2.1
    }
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      
      // In production, fetch real analytics data
      // For now, using mock data
      setLoading(false)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setLoading(false)
    }
  }

  const exportReport = () => {
    // Export analytics as CSV/PDF
    console.log('Exporting report...')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <SimpleButton variant="outline" onClick={exportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </SimpleButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/60">Track your cloning activity and performance metrics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clones"
            value={analyticsData.overview.totalClones}
            change="+12%"
            icon={<Globe className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Deployments"
            value={analyticsData.overview.totalDeployments}
            change="+8%"
            icon={<Zap className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Total Views"
            value={analyticsData.overview.totalViews.toLocaleString()}
            change="+24%"
            icon={<Eye className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Success Rate"
            value={`${analyticsData.overview.successRate}%`}
            change="-2%"
            icon={<Activity className="w-6 h-6" />}
            trend="down"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Trend */}
          <SimpleCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Activity Trend</h3>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-white/60">Clones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-white/60">Views</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {analyticsData.trends.daily.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <span className="text-sm text-white/60 w-12">{day.date}</span>
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1 bg-white/10 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-blue-500/80 rounded-full"
                        style={{ width: `${(day.clones / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white/80 w-8">{day.clones}</span>
                  </div>
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1 bg-white/10 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-purple-500/80 rounded-full"
                        style={{ width: `${(day.views / 350) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white/80 w-12">{day.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </SimpleCard>

          {/* Technology Distribution */}
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-6">Export Formats</h3>
            <BarChart data={analyticsData.technologies.map(t => ({
              label: t.name,
              value: t.count
            }))} />
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/60 mb-1">Most Popular</div>
                  <div className="font-semibold text-white">React (36%)</div>
                </div>
                <div>
                  <div className="text-white/60 mb-1">Growing Fast</div>
                  <div className="font-semibold text-green-400">Next.js (+24%)</div>
                </div>
              </div>
            </div>
          </SimpleCard>
        </div>

        {/* Top Projects */}
        <SimpleCard className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Projects</h3>
            <SimpleButton variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </SimpleButton>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-3 text-sm text-white/60 font-medium">Project Name</th>
                  <th className="pb-3 text-sm text-white/60 font-medium">URL</th>
                  <th className="pb-3 text-sm text-white/60 font-medium text-center">Clones</th>
                  <th className="pb-3 text-sm text-white/60 font-medium text-center">Views</th>
                  <th className="pb-3 text-sm text-white/60 font-medium text-center">Deployments</th>
                  <th className="pb-3 text-sm text-white/60 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topProjects.map(project => (
                  <tr key={project.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4">
                      <Link href={`/editor/${project.id}`} className="font-medium text-white hover:text-blue-400">
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-4">
                      <span className="text-white/60">{project.url}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-white">{project.clones}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-white">{project.views.toLocaleString()}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-white">{project.deployments}</span>
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/editor/${project.id}`}>
                        <SimpleButton variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </SimpleButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SimpleCard>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SimpleCard>
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-green-400">-0.2s</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analyticsData.performance.avgLoadTime}s
            </div>
            <div className="text-white/60 text-sm">Avg. Clone Time</div>
            <div className="mt-4 text-xs text-white/40">
              15% faster than last month
            </div>
          </SimpleCard>

          <SimpleCard>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-yellow-400">+2.1MB</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analyticsData.performance.avgCloneSize}MB
            </div>
            <div className="text-white/60 text-sm">Avg. Clone Size</div>
            <div className="mt-4 text-xs text-white/40">
              Within optimal range
            </div>
          </SimpleCard>

          <SimpleCard>
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-5 h-5 text-red-400" />
              <span className="text-xs text-green-400">-0.5%</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analyticsData.performance.errorRate}%
            </div>
            <div className="text-white/60 text-sm">Error Rate</div>
            <div className="mt-4 text-xs text-white/40">
              Below industry average
            </div>
          </SimpleCard>
        </div>
      </div>
    </div>
  )
}