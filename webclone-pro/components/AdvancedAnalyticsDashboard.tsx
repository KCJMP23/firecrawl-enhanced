'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Clock,
  Zap,
  Activity,
  Target,
  Layers,
  Download,
  Share,
  Filter,
  Calendar,
  RefreshCw,
  Settings,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  MapPin,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  AreaChart,
  BarChart,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

interface AnalyticsMetric {
  id: string
  name: string
  value: number | string
  change: number
  changeType: 'increase' | 'decrease'
  period: string
  icon: React.ReactNode
  color: string
  format: 'number' | 'percentage' | 'currency' | 'time' | 'bytes'
}

interface ChartData {
  id: string
  title: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut'
  data: any[]
  metrics: {
    current: number
    previous: number
    change: number
    trend: 'up' | 'down' | 'stable'
  }
  timeframe: string
}

interface ProjectAnalytics {
  id: string
  name: string
  url: string
  status: 'active' | 'completed' | 'draft'
  metrics: {
    views: number
    clicks: number
    conversions: number
    bounceRate: number
    avgSessionTime: number
    performance: number
  }
  lastUpdated: Date
}

interface UserSegment {
  id: string
  name: string
  count: number
  percentage: number
  growth: number
  characteristics: string[]
  color: string
}

interface GeographicData {
  country: string
  users: number
  percentage: number
  revenue: number
  flag: string
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

function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  const formatValue = (value: number | string, format: string) => {
    if (typeof value === 'string') return value
    
    switch (format) {
      case 'percentage': return `${value}%`
      case 'currency': return `$${value.toLocaleString()}`
      case 'time': return `${value}s`
      case 'bytes': return `${(value / 1024).toFixed(1)}KB`
      default: return value.toLocaleString()
    }
  }

  const getChangeIcon = () => {
    if (metric.changeType === 'increase') {
      return <TrendingUp className="w-4 h-4 text-green-400" />
    } else {
      return <TrendingDown className="w-4 h-4 text-red-400" />
    }
  }

  return (
    <SimpleCard className="hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color}`}>
          <div className="text-white">
            {metric.icon}
          </div>
        </div>
        {getChangeIcon()}
      </div>
      
      <div className="space-y-2">
        <p className="text-white/60 text-sm">{metric.name}</p>
        <p className="text-3xl font-bold text-white">
          {formatValue(metric.value, metric.format)}
        </p>
        <div className="flex items-center space-x-2 text-sm">
          <span className={`font-medium ${
            metric.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
          }`}>
            {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
          </span>
          <span className="text-white/40">vs {metric.period}</span>
        </div>
      </div>
    </SimpleCard>
  )
}

function ChartCard({ chart }: { chart: ChartData }) {
  const getChartIcon = () => {
    switch (chart.type) {
      case 'line': return <LineChart className="w-4 h-4" />
      case 'bar': return <BarChart className="w-4 h-4" />
      case 'area': return <AreaChart className="w-4 h-4" />
      case 'pie': return <PieChart className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-blue-500/20">
            <div className="text-blue-400">
              {getChartIcon()}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">{chart.title}</h3>
            <p className="text-sm text-white/60">{chart.timeframe}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              {chart.metrics.current.toLocaleString()}
            </div>
            <div className={`text-sm flex items-center ${
              chart.metrics.trend === 'up' ? 'text-green-400' : 
              chart.metrics.trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {chart.metrics.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
               chart.metrics.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : 
               <Activity className="w-3 h-3 mr-1" />}
              {chart.metrics.change > 0 ? '+' : ''}{chart.metrics.change}%
            </div>
          </div>
          
          <SimpleButton variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </SimpleButton>
        </div>
      </div>
      
      <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
        <span className="text-white/60 text-sm">
          {chart.title} visualization would render here
        </span>
      </div>
    </SimpleCard>
  )
}

function ProjectAnalyticsTable({ projects }: { projects: ProjectAnalytics[] }) {
  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Project Performance</h3>
        <div className="flex items-center space-x-2">
          <SimpleButton variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </SimpleButton>
          <SimpleButton variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </SimpleButton>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 font-medium text-white/80">Project</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">Status</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">Views</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">Clicks</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">Conversion</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">Performance</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-white">{project.name}</div>
                    <div className="text-sm text-white/60">{project.url}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-white">
                  {project.metrics.views.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-white">
                  {project.metrics.clicks.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-white">
                  {project.metrics.conversions.toFixed(1)}%
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          project.metrics.performance >= 80 ? 'bg-green-400' :
                          project.metrics.performance >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${project.metrics.performance}%` }}
                      />
                    </div>
                    <span className="text-sm text-white w-8">{project.metrics.performance}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-white/60 text-sm">
                  {project.lastUpdated.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimpleCard>
  )
}

function UserSegmentCard({ segments }: { segments: UserSegment[] }) {
  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">User Segments</h3>
        <SimpleButton variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </SimpleButton>
      </div>
      
      <div className="space-y-4">
        {segments.map(segment => (
          <div key={segment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${segment.color}`} />
              <div>
                <div className="font-medium text-white">{segment.name}</div>
                <div className="text-sm text-white/60">
                  {segment.characteristics.join(', ')}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-medium">
                {segment.count.toLocaleString()} ({segment.percentage}%)
              </div>
              <div className={`text-sm flex items-center ${
                segment.growth > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {segment.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {segment.growth > 0 ? '+' : ''}{segment.growth}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </SimpleCard>
  )
}

function GeographicAnalytics({ data }: { data: GeographicData[] }) {
  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Geographic Distribution</h3>
        <div className="flex items-center space-x-2">
          <SimpleButton variant="outline" size="sm">
            <MapPin className="w-4 h-4 mr-2" />
            Map View
          </SimpleButton>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map(country => (
          <div key={country.country} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{country.flag}</span>
              <div>
                <div className="font-medium text-white">{country.country}</div>
                <div className="text-sm text-white/60">{country.percentage}% of total</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-medium">
                {country.users.toLocaleString()} users
              </div>
              <div className="text-sm text-green-400">
                ${country.revenue.toLocaleString()} revenue
              </div>
            </div>
          </div>
        ))}
      </div>
    </SimpleCard>
  )
}

export default function AdvancedAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['all'])

  const timeframes = [
    { id: '1d', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '3 Months' },
    { id: '1y', label: '1 Year' }
  ]

  const analyticsMetrics: AnalyticsMetric[] = [
    {
      id: '1',
      name: 'Total Projects',
      value: 247,
      change: 12.5,
      changeType: 'increase',
      period: 'last month',
      icon: <Layers className="w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-600/20',
      format: 'number'
    },
    {
      id: '2',
      name: 'Active Users',
      value: 8432,
      change: 8.3,
      changeType: 'increase',
      period: 'last week',
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-500/20 to-green-600/20',
      format: 'number'
    },
    {
      id: '3',
      name: 'Total Revenue',
      value: 43250,
      change: 15.7,
      changeType: 'increase',
      period: 'last month',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-600/20',
      format: 'currency'
    },
    {
      id: '4',
      name: 'Conversion Rate',
      value: 3.84,
      change: 2.1,
      changeType: 'increase',
      period: 'last week',
      icon: <Target className="w-6 h-6" />,
      color: 'from-yellow-500/20 to-yellow-600/20',
      format: 'percentage'
    },
    {
      id: '5',
      name: 'Avg. Session Time',
      value: 247,
      change: 5.2,
      changeType: 'increase',
      period: 'last week',
      icon: <Clock className="w-6 h-6" />,
      color: 'from-red-500/20 to-red-600/20',
      format: 'time'
    },
    {
      id: '6',
      name: 'Performance Score',
      value: 94.2,
      change: 3.1,
      changeType: 'increase',
      period: 'last month',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-indigo-500/20 to-indigo-600/20',
      format: 'number'
    }
  ]

  const chartData: ChartData[] = [
    {
      id: '1',
      title: 'User Growth',
      type: 'line',
      data: [],
      metrics: { current: 8432, previous: 7786, change: 8.3, trend: 'up' },
      timeframe: 'Last 30 days'
    },
    {
      id: '2',
      title: 'Project Creation',
      type: 'bar',
      data: [],
      metrics: { current: 247, previous: 220, change: 12.3, trend: 'up' },
      timeframe: 'Last 30 days'
    },
    {
      id: '3',
      title: 'Revenue Breakdown',
      type: 'pie',
      data: [],
      metrics: { current: 43250, previous: 37400, change: 15.6, trend: 'up' },
      timeframe: 'Last 30 days'
    },
    {
      id: '4',
      title: 'Performance Trends',
      type: 'area',
      data: [],
      metrics: { current: 94.2, previous: 91.3, change: 3.2, trend: 'up' },
      timeframe: 'Last 7 days'
    }
  ]

  const projectAnalytics: ProjectAnalytics[] = [
    {
      id: '1',
      name: 'E-commerce Store',
      url: 'shop.example.com',
      status: 'active',
      metrics: {
        views: 12450,
        clicks: 892,
        conversions: 7.2,
        bounceRate: 34.5,
        avgSessionTime: 145,
        performance: 92
      },
      lastUpdated: new Date('2024-12-24')
    },
    {
      id: '2',
      name: 'Corporate Website',
      url: 'company.example.com',
      status: 'completed',
      metrics: {
        views: 8932,
        clicks: 567,
        conversions: 4.8,
        bounceRate: 42.1,
        avgSessionTime: 98,
        performance: 87
      },
      lastUpdated: new Date('2024-12-23')
    },
    {
      id: '3',
      name: 'Portfolio Site',
      url: 'designer.example.com',
      status: 'active',
      metrics: {
        views: 5678,
        clicks: 234,
        conversions: 12.3,
        bounceRate: 28.9,
        avgSessionTime: 203,
        performance: 95
      },
      lastUpdated: new Date('2024-12-25')
    }
  ]

  const userSegments: UserSegment[] = [
    {
      id: '1',
      name: 'Power Users',
      count: 1247,
      percentage: 14.8,
      growth: 23.5,
      characteristics: ['High engagement', 'Premium features', 'Daily usage'],
      color: 'bg-blue-400'
    },
    {
      id: '2',
      name: 'Casual Users',
      count: 5234,
      percentage: 62.1,
      growth: 8.2,
      characteristics: ['Weekly usage', 'Basic features', 'Mobile-first'],
      color: 'bg-green-400'
    },
    {
      id: '3',
      name: 'Trial Users',
      count: 1951,
      percentage: 23.1,
      growth: -2.3,
      characteristics: ['First 30 days', 'Exploring features', 'Free tier'],
      color: 'bg-yellow-400'
    }
  ]

  const geographicData: GeographicData[] = [
    { country: 'United States', users: 3241, percentage: 38.4, revenue: 18750, flag: '🇺🇸' },
    { country: 'United Kingdom', users: 1876, percentage: 22.3, revenue: 11200, flag: '🇬🇧' },
    { country: 'Canada', users: 1234, percentage: 14.6, revenue: 7830, flag: '🇨🇦' },
    { country: 'Australia', users: 892, percentage: 10.6, revenue: 5420, flag: '🇦🇺' },
    { country: 'Germany', users: 756, percentage: 9.0, revenue: 4280, flag: '🇩🇪' },
    { country: 'France', users: 433, percentage: 5.1, revenue: 2450, flag: '🇫🇷' }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        // Refresh data logic would go here
        console.log('Refreshing analytics data...')
      }, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
          <p className="text-white/60">Comprehensive insights into your projects and users</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            {timeframes.map(timeframe => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`px-3 py-2 rounded-md text-sm transition-all ${
                  selectedTimeframe === timeframe.id
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
          <SimpleButton variant="outline" onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Stop' : 'Auto'} Refresh
          </SimpleButton>
          <SimpleButton>
            <Share className="w-4 h-4 mr-2" />
            Share Report
          </SimpleButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {analyticsMetrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.map(chart => (
          <ChartCard key={chart.id} chart={chart} />
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ProjectAnalyticsTable projects={projectAnalytics} />
        </div>
        
        <div className="space-y-6">
          <UserSegmentCard segments={userSegments} />
          <GeographicAnalytics data={geographicData} />
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <SimpleCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Real-time Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Live</span>
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[
            { time: '2 minutes ago', event: 'New project created', user: 'john@example.com', type: 'success' },
            { time: '5 minutes ago', event: 'User upgraded to Pro plan', user: 'sarah@example.com', type: 'info' },
            { time: '8 minutes ago', event: 'Project deployed successfully', user: 'mike@example.com', type: 'success' },
            { time: '12 minutes ago', event: 'Performance optimization completed', user: 'lisa@example.com', type: 'info' },
            { time: '15 minutes ago', event: 'API rate limit exceeded', user: 'system', type: 'warning' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
              <div className={`p-1 rounded-full ${
                activity.type === 'success' ? 'bg-green-500/20' :
                activity.type === 'warning' ? 'bg-yellow-500/20' :
                'bg-blue-500/20'
              }`}>
                {activity.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                 activity.type === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-400" /> :
                 <Info className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm">{activity.event}</div>
                <div className="text-white/60 text-xs">{activity.user} • {activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </SimpleCard>
    </div>
  )
}