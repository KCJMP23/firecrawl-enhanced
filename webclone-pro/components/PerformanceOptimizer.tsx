'use client'

import { useState, useEffect } from 'react'
import { SimpleButton, SimpleCard } from '@/components/ui'
import {
  Zap,
  Gauge,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Image,
  Code,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Download,
  Settings,
  Target,
  Layers,
  FileText,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

interface PerformanceMetric {
  id: string
  name: string
  current: number
  target: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  description: string
  category: 'core' | 'js' | 'css' | 'images' | 'network'
  priority: 'high' | 'medium' | 'low'
}

interface OptimizationTask {
  id: string
  title: string
  description: string
  category: 'images' | 'code' | 'network' | 'caching' | 'bundle'
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  savings: {
    time: string
    size: string
    score: number
  }
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  estimated: string
  instructions: string[]
  automated: boolean
}

interface PerformanceBudget {
  metric: string
  budget: number
  current: number
  unit: string
  status: 'within' | 'warning' | 'exceeded'
}

interface DeviceProfile {
  id: string
  name: string
  type: 'mobile' | 'tablet' | 'desktop'
  cpu: number
  network: string
  screen: string
  icon: React.ReactNode
}


function MetricCard({ metric }: { metric: PerformanceMetric }) {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'good': return 'text-green-400 border-green-400/30 bg-green-400/10'
      case 'warning': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      case 'critical': return 'text-red-400 border-red-400/30 bg-red-400/10'
    }
  }

  const getStatusIcon = () => {
    switch (metric.status) {
      case 'good': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <XCircle className="w-4 h-4" />
    }
  }

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up': return <TrendingUp className={`w-4 h-4 ${metric.status === 'good' ? 'text-green-400' : 'text-red-400'}`} />
      case 'down': return <TrendingDown className={`w-4 h-4 ${metric.status === 'good' ? 'text-red-400' : 'text-green-400'}`} />
      case 'stable': return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryIcon = () => {
    switch (metric.category) {
      case 'core': return <Gauge className="w-4 h-4" />
      case 'js': return <Code className="w-4 h-4" />
      case 'css': return <Layers className="w-4 h-4" />
      case 'images': return <Image className="w-4 h-4" />
      case 'network': return <Globe className="w-4 h-4" />
    }
  }

  const improvement = ((metric.target - metric.current) / metric.current * 100)

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-blue-400">
            {getCategoryIcon()}
          </div>
          <span className="font-medium text-white">{metric.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <div className={metric.status === 'good' ? 'text-green-400' : metric.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}>
            {getStatusIcon()}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Current</span>
          <span className="text-white font-semibold">
            {metric.current}{metric.unit}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Target</span>
          <span className="text-green-400 font-semibold">
            {metric.target}{metric.unit}
          </span>
        </div>
        {improvement !== 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Improvement</span>
            <span className={`font-semibold ${improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="w-full bg-white/10 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full ${
            metric.status === 'good' ? 'bg-green-400' : 
            metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
        />
      </div>

      <p className="text-xs text-white/60">{metric.description}</p>
    </div>
  )
}

function OptimizationTaskCard({ task, onRun, onView }: {
  task: OptimizationTask
  onRun: (taskId: string) => void
  onView: (taskId: string) => void
}) {
  const getImpactColor = () => {
    switch (task.impact) {
      case 'high': return 'text-red-400 bg-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/20'
    }
  }

  const getDifficultyColor = () => {
    switch (task.difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'hard': return 'text-red-400 bg-red-400/20'
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'running': return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getCategoryIcon = () => {
    switch (task.category) {
      case 'images': return <Image className="w-4 h-4" />
      case 'code': return <Code className="w-4 h-4" />
      case 'network': return <Globe className="w-4 h-4" />
      case 'caching': return <Database className="w-4 h-4" />
      case 'bundle': return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-blue-500/20">
            <div className="text-blue-400">
              {getCategoryIcon()}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-white">{task.title}</h4>
            <p className="text-sm text-white/60">{task.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor()}`}>
            {task.impact}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}>
            {task.difficulty}
          </span>
          {getStatusIcon()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{task.savings.time}</div>
          <div className="text-xs text-white/60">Time Saved</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{task.savings.size}</div>
          <div className="text-xs text-white/60">Size Reduction</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">+{task.savings.score}</div>
          <div className="text-xs text-white/60">Score Boost</div>
        </div>
      </div>

      {task.status === 'running' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Progress</span>
            <span className="text-sm text-white/60">{task.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-white/60">
          <span>Est: {task.estimated}</span>
          {task.automated && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Auto</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {task.status === 'pending' && (
            <SimpleButton size="sm" onClick={() => onRun(task.id)}>
              <Play className="w-4 h-4 mr-2" />
              {task.automated ? 'Auto Fix' : 'Start'}
            </SimpleButton>
          )}
          <SimpleButton variant="outline" size="sm" onClick={() => onView(task.id)}>
            Details
          </SimpleButton>
        </div>
      </div>
    </div>
  )
}

function BudgetCard({ budget }: { budget: PerformanceBudget }) {
  const getStatusColor = () => {
    switch (budget.status) {
      case 'within': return 'text-green-400 border-green-400/30 bg-green-400/10'
      case 'warning': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      case 'exceeded': return 'text-red-400 border-red-400/30 bg-red-400/10'
    }
  }

  const usage = (budget.current / budget.budget) * 100

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{budget.metric}</span>
        <span className={`text-sm ${
          budget.status === 'within' ? 'text-green-400' : 
          budget.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {budget.status}
        </span>
      </div>
      
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Current</span>
          <span className="text-white">{budget.current}{budget.unit}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Budget</span>
          <span className="text-white/60">{budget.budget}{budget.unit}</span>
        </div>
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            budget.status === 'within' ? 'bg-green-400' : 
            budget.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${Math.min(usage, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function PerformanceOptimizer() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'optimizations' | 'budgets' | 'monitoring'>('overview')
  const [selectedDevice, setSelectedDevice] = useState('mobile')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: '1',
      name: 'First Contentful Paint',
      current: 2.8,
      target: 1.8,
      unit: 's',
      status: 'warning',
      trend: 'up',
      description: 'Time until first content appears on screen',
      category: 'core',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Largest Contentful Paint',
      current: 4.2,
      target: 2.5,
      unit: 's',
      status: 'critical',
      trend: 'up',
      description: 'Time until largest content element loads',
      category: 'core',
      priority: 'high'
    },
    {
      id: '3',
      name: 'Total Blocking Time',
      current: 350,
      target: 200,
      unit: 'ms',
      status: 'warning',
      trend: 'stable',
      description: 'Time when main thread is blocked',
      category: 'js',
      priority: 'high'
    },
    {
      id: '4',
      name: 'Cumulative Layout Shift',
      current: 0.25,
      target: 0.1,
      unit: '',
      status: 'critical',
      trend: 'down',
      description: 'Visual stability metric',
      category: 'css',
      priority: 'medium'
    },
    {
      id: '5',
      name: 'Bundle Size',
      current: 850,
      target: 500,
      unit: 'KB',
      status: 'warning',
      trend: 'up',
      description: 'Total JavaScript bundle size',
      category: 'js',
      priority: 'medium'
    },
    {
      id: '6',
      name: 'Image Optimization',
      current: 65,
      target: 90,
      unit: '%',
      status: 'warning',
      trend: 'stable',
      description: 'Percentage of optimized images',
      category: 'images',
      priority: 'medium'
    }
  ])

  const optimizationTasks: OptimizationTask[] = [
    {
      id: '1',
      title: 'Optimize Images',
      description: 'Convert images to WebP format and add responsive sizing',
      category: 'images',
      impact: 'high',
      difficulty: 'easy',
      savings: { time: '1.2s', size: '450KB', score: 15 },
      status: 'pending',
      progress: 0,
      estimated: '2 minutes',
      instructions: [
        'Convert PNG/JPG images to WebP format',
        'Add responsive image attributes',
        'Implement lazy loading',
        'Optimize image dimensions'
      ],
      automated: true
    },
    {
      id: '2',
      title: 'Minify JavaScript',
      description: 'Remove unused code and minify JavaScript bundles',
      category: 'code',
      impact: 'high',
      difficulty: 'medium',
      savings: { time: '800ms', size: '200KB', score: 12 },
      status: 'pending',
      progress: 0,
      estimated: '3 minutes',
      instructions: [
        'Analyze bundle for unused code',
        'Apply tree shaking',
        'Minify JavaScript files',
        'Split bundles for better caching'
      ],
      automated: true
    },
    {
      id: '3',
      title: 'Enable Compression',
      description: 'Enable Gzip/Brotli compression for text assets',
      category: 'network',
      impact: 'medium',
      difficulty: 'easy',
      savings: { time: '400ms', size: '150KB', score: 8 },
      status: 'completed',
      progress: 100,
      estimated: '1 minute',
      instructions: [
        'Configure server compression',
        'Enable Gzip for text files',
        'Set up Brotli compression',
        'Verify compression headers'
      ],
      automated: false
    },
    {
      id: '4',
      title: 'Implement Caching',
      description: 'Set up browser caching and service worker',
      category: 'caching',
      impact: 'high',
      difficulty: 'hard',
      savings: { time: '2.1s', size: '0KB', score: 18 },
      status: 'pending',
      progress: 0,
      estimated: '15 minutes',
      instructions: [
        'Configure cache headers',
        'Implement service worker',
        'Set up cache strategies',
        'Add offline fallbacks'
      ],
      automated: false
    },
    {
      id: '5',
      title: 'Code Splitting',
      description: 'Split JavaScript bundles for better loading',
      category: 'bundle',
      impact: 'medium',
      difficulty: 'hard',
      savings: { time: '600ms', size: '100KB', score: 10 },
      status: 'pending',
      progress: 0,
      estimated: '20 minutes',
      instructions: [
        'Identify split points',
        'Implement dynamic imports',
        'Configure webpack chunks',
        'Test loading performance'
      ],
      automated: false
    }
  ]

  const performanceBudgets: PerformanceBudget[] = [
    { metric: 'Bundle Size', budget: 500, current: 850, unit: 'KB', status: 'exceeded' },
    { metric: 'Image Size', budget: 200, current: 150, unit: 'KB', status: 'within' },
    { metric: 'CSS Size', budget: 50, current: 65, unit: 'KB', status: 'warning' },
    { metric: 'Font Size', budget: 100, current: 80, unit: 'KB', status: 'within' },
    { metric: 'Third Party', budget: 100, current: 120, unit: 'KB', status: 'warning' },
    { metric: 'Total Page Size', budget: 1000, current: 1265, unit: 'KB', status: 'exceeded' }
  ]

  const devices: DeviceProfile[] = [
    { id: 'mobile', name: 'Mobile (Slow 3G)', type: 'mobile', cpu: 4, network: 'Slow 3G', screen: '375×667', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'tablet', name: 'Tablet (4G)', type: 'tablet', cpu: 2, network: '4G', screen: '768×1024', icon: <Tablet className="w-4 h-4" /> },
    { id: 'desktop', name: 'Desktop (WiFi)', type: 'desktop', cpu: 1, network: 'WiFi', screen: '1920×1080', icon: <Monitor className="w-4 h-4" /> }
  ]

  const handleRunOptimization = (taskId: string) => {
    const task = optimizationTasks.find(t => t.id === taskId)
    if (!task) return

    // Simulate optimization process
    setIsOptimizing(true)
    // You would update the specific task status here
    console.log('Running optimization:', taskId)
  }

  const handleOptimizeAll = () => {
    setIsOptimizing(true)
    setTimeout(() => {
      setIsOptimizing(false)
    }, 5000)
  }

  const pendingTasks = optimizationTasks.filter(task => task.status === 'pending')
  const completedTasks = optimizationTasks.filter(task => task.status === 'completed')
  const totalSavings = optimizationTasks.reduce((acc, task) => acc + task.savings.score, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Performance Optimizer</h2>
          <p className="text-white/60">AI-powered performance analysis and optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            {devices.map(device => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  selectedDevice === device.id
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {device.icon}
                <span className="text-sm">{device.type}</span>
              </button>
            ))}
          </div>
          <SimpleButton variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </SimpleButton>
          <SimpleButton onClick={handleOptimizeAll} disabled={isOptimizing}>
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Optimize All
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
              <div className="text-2xl font-bold text-white">78</div>
              <div className="text-white/60 text-sm">Performance Score</div>
            </div>
            <Gauge className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{pendingTasks.length}</div>
              <div className="text-white/60 text-sm">Pending Tasks</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">+{totalSavings}</div>
              <div className="text-white/60 text-sm">Potential Score Gain</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{completedTasks.length}</div>
              <div className="text-white/60 text-sm">Optimizations Applied</div>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: <Gauge className="w-4 h-4" /> },
          { id: 'optimizations', label: 'Optimizations', icon: <Zap className="w-4 h-4" /> },
          { id: 'budgets', label: 'Budgets', icon: <Target className="w-4 h-4" /> },
          { id: 'monitoring', label: 'Monitoring', icon: <BarChart3 className="w-4 h-4" /> }
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
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map(metric => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            </SimpleCard>
          </div>

          <div className="space-y-6">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Image className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Optimize Images</span>
                  </div>
                  <span className="text-green-400 text-sm">+15 points</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Minify Code</span>
                  </div>
                  <span className="text-green-400 text-sm">+12 points</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-green-400" />
                    <span className="text-white">Enable Caching</span>
                  </div>
                  <span className="text-green-400 text-sm">+18 points</span>
                </button>
              </div>
            </SimpleCard>

            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Current Device</h3>
              <div className="space-y-3">
                {devices.map(device => (
                  <div 
                    key={device.id}
                    className={`p-3 rounded-lg border ${
                      selectedDevice === device.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-blue-400">{device.icon}</div>
                      <span className="font-medium text-white">{device.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/60">
                      <span>CPU: {device.cpu}× slowdown</span>
                      <span>Network: {device.network}</span>
                      <span className="col-span-2">Screen: {device.screen}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SimpleCard>
          </div>
        </div>
      )}

      {selectedTab === 'optimizations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Optimization Tasks</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white/60">
                {pendingTasks.length} pending • {completedTasks.length} completed
              </span>
              <SimpleButton variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze
              </SimpleButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {optimizationTasks.map(task => (
              <OptimizationTaskCard
                key={task.id}
                task={task}
                onRun={handleRunOptimization}
                onView={(id) => console.log('View task:', id)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Performance Budgets</h3>
            <SimpleButton variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure Budgets
            </SimpleButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceBudgets.map(budget => (
              <BudgetCard key={budget.metric} budget={budget} />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Performance Monitoring</h3>
            <div className="flex items-center space-x-2">
              <SimpleButton 
                variant={isMonitoring ? 'danger' : 'default'}
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </SimpleButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleCard>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Performance Trends</h4>
                <LineChart className="w-5 h-5 text-blue-400" />
              </div>
              <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                <span className="text-white/60">Performance chart would display here</span>
              </div>
            </SimpleCard>

            <SimpleCard>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Resource Breakdown</h4>
                <PieChart className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-3">
                {[
                  { name: 'JavaScript', size: '850KB', color: 'bg-yellow-400' },
                  { name: 'Images', size: '650KB', color: 'bg-blue-400' },
                  { name: 'CSS', size: '200KB', color: 'bg-green-400' },
                  { name: 'Fonts', size: '150KB', color: 'bg-purple-400' },
                  { name: 'Other', size: '100KB', color: 'bg-gray-400' }
                ].map(resource => (
                  <div key={resource.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${resource.color}`} />
                      <span className="text-white text-sm">{resource.name}</span>
                    </div>
                    <span className="text-white/60 text-sm">{resource.size}</span>
                  </div>
                ))}
              </div>
            </SimpleCard>
          </div>
        </div>
      )}
    </div>
  )
}