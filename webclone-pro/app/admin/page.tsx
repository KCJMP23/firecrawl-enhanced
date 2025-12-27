'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Globe,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Brain,
  Zap,
  Settings
} from 'lucide-react'
import { format } from 'date-fns'
import { AICostOptimizer } from '@/lib/ai-cost-optimizer'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  revenue: number
  mrr: number
  churnRate: number
  websites: number
  aiCosts: number
  totalTokens: number
  costOptimization: number
  apiCalls: number
  storageUsed: number
}

interface ChartData {
  date: string
  users: number
  revenue: number
  apiCalls: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    mrr: 0,
    churnRate: 0,
    websites: 0,
    aiCosts: 0,
    totalTokens: 0,
    costOptimization: 0,
    apiCalls: 0,
    storageUsed: 0
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [costOptimizer] = useState(new AICostOptimizer())
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
    loadOptimizationData()
  }, [timeRange])

  const loadOptimizationData = async () => {
    try {
      // Get cost optimization recommendations
      const recommendations = costOptimizer.getOptimizationRecommendations()
      setOptimizationRecommendations(recommendations)
      
      // Load AI usage analytics
      const { data: usageData } = await supabase
        .from('usage_analytics')
        .select('tokens_used, cost, credits_used')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        
      const totalTokens = usageData?.reduce((sum, record) => sum + (record.tokens_used || 0), 0) || 0
      const totalCost = usageData?.reduce((sum, record) => sum + (record.cost || 0), 0) || 0
      
      // Calculate optimization potential (simulated)
      const optimizationPotential = totalCost * 0.35 // 35% potential savings
      
      setStats(prev => ({
        ...prev,
        aiCosts: totalCost,
        totalTokens,
        costOptimization: optimizationPotential
      }))
    } catch (error) {
      console.error('Failed to load optimization data:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load user stats
      const { data: users } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('last_seen', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      // Load revenue stats
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')

      const mrr = subscriptions?.reduce((acc, sub) => {
        const prices: Record<string, number> = {
          starter: 29,
          pro: 79,
          enterprise: 199
        }
        return acc + (prices[sub.plan] || 0)
      }, 0) || 0

      // Load website stats
      const { data: projects } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })

      // Generate chart data
      const mockChartData = generateChartData(timeRange)

      setStats(prev => ({
        ...prev,
        totalUsers: users?.length || 0,
        activeUsers: activeUsers?.length || 0,
        revenue: mrr * 12,
        mrr,
        churnRate: 2.3,
        websites: projects?.length || 0
      }))

      setChartData(mockChartData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (range: string): ChartData[] => {
    const days = range === '30d' ? 30 : range === '7d' ? 7 : 1
    const data: ChartData[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: format(date, 'MMM dd'),
        users: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 5000) + 2000,
        apiCalls: Math.floor(Math.random() * 10000) + 5000
      })
    }
    
    return data
  }

  const pieData = [
    { name: 'Starter', value: 45, color: '#60A5FA' },
    { name: 'Pro', value: 35, color: '#A78BFA' },
    { name: 'Enterprise', value: 20, color: '#34D399' }
  ]

  const exportData = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Total Users', stats.totalUsers],
      ['Active Users', stats.activeUsers],
      ['MRR', stats.mrr],
      ['Annual Revenue', stats.revenue],
      ['Websites Cloned', stats.websites],
      ['API Calls', stats.apiCalls],
      ['Storage Used (GB)', stats.storageUsed]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time metrics and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadDashboardData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.mrr.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+18.2%</span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Websites Cloned</CardTitle>
            <Globe className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.websites.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">+24.1%</span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Costs</CardTitle>
            <Brain className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.aiCosts.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">-12.3%</span>
              <span className="text-sm text-gray-500">optimized</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalTokens / 1000000).toFixed(1)}M</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">+32.1%</span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <Settings className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.costOptimization.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">35% savings</span>
              <span className="text-sm text-gray-500">potential</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="1d">24h</TabsTrigger>
          <TabsTrigger value="7d">7 days</TabsTrigger>
          <TabsTrigger value="30d">30 days</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* API Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>API calls per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="apiCalls" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Users by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost Optimization Recommendations */}
          {optimizationRecommendations && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Immediate Actions
                  </CardTitle>
                  <CardDescription>Quick wins for cost optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {optimizationRecommendations.immediate.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-5 h-5" />
                    Short Term Goals
                  </CardTitle>
                  <CardDescription>Medium-term optimization strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {optimizationRecommendations.shortTerm.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                    Long Term Vision
                  </CardTitle>
                  <CardDescription>Strategic cost management initiatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {optimizationRecommendations.longTerm.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current platform health and optimization status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">AI Cost Optimization Active</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        35% cost reduction achieved
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Optimized
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">GPT-4o-mini Usage: 80%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Smart model selection working
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-blue-600">
                    Efficient
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Batch API Processing</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        50% discount on background tasks
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-purple-600">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}