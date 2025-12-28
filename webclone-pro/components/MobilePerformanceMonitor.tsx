'use client'

import { useState, useEffect } from 'react'
import {
  Smartphone,
  Zap,
  Image,
  Activity,
  Clock,
  Gauge,
  Signal,
  Battery,
  Wifi,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  FileText,
  Globe,
  Cpu,
  HardDrive,
  Monitor
} from 'lucide-react'

interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  description: string
  trend: 'up' | 'down' | 'stable'
  category: 'loading' | 'runtime' | 'network' | 'resources'
}

interface DeviceProfile {
  id: string
  name: string
  screen: string
  connection: '4G' | '3G' | 'WiFi' | 'Slow 3G'
  cpu: number // CPU slowdown multiplier
  memory: string
  icon: React.ReactNode
}

interface PerformanceIssue {
  id: string
  severity: 'high' | 'medium' | 'low'
  category: string
  message: string
  suggestion: string
  impact: string
  fileCount?: number
  sizeReduction?: string
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
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = 
    variant === 'outline' ? 'border border-white/20 bg-transparent hover:bg-white/10 text-white' :
    variant === 'ghost' ? 'hover:bg-white/10 text-white' :
    'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
  const sizeClasses = 
    size === 'sm' ? 'h-8 px-3 text-sm' : 
    size === 'lg' ? 'h-12 px-8 text-lg' :
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

function MetricCard({ metric }: { metric: PerformanceMetric }) {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'good': return 'text-green-400 bg-green-400/20 border-green-400/30'
      case 'warning': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'critical': return 'text-red-400 bg-red-400/20 border-red-400/30'
    }
  }

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-400" />
      case 'stable': return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryIcon = () => {
    switch (metric.category) {
      case 'loading': return <Clock className="w-5 h-5" />
      case 'runtime': return <Cpu className="w-5 h-5" />
      case 'network': return <Signal className="w-5 h-5" />
      case 'resources': return <HardDrive className="w-5 h-5" />
    }
  }

  return (
    <SimpleCard className="hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <div className="text-blue-400">
              {getCategoryIcon()}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-white">{metric.name}</h3>
            <p className="text-sm text-white/60">{metric.description}</p>
          </div>
        </div>
        {getTrendIcon()}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white">
            {metric.value}
            <span className="text-sm text-white/60 ml-1">{metric.unit}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {metric.status}
        </span>
      </div>
    </SimpleCard>
  )
}

function DeviceSelector({ devices, selectedDevice, onDeviceChange }: {
  devices: DeviceProfile[]
  selectedDevice: string
  onDeviceChange: (deviceId: string) => void
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const currentDevice = devices.find(d => d.id === selectedDevice)

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 px-4 py-2 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="text-blue-400">
          {currentDevice?.icon}
        </div>
        <div className="text-left">
          <div className="text-white font-medium">{currentDevice?.name}</div>
          <div className="text-xs text-white/60">{currentDevice?.screen} • {currentDevice?.connection}</div>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-64 bg-black/90 border border-white/10 rounded-lg shadow-lg z-10">
          <div className="p-2">
            {devices.map(device => (
              <button
                key={device.id}
                onClick={() => {
                  onDeviceChange(device.id)
                  setShowDropdown(false)
                }}
                className={`w-full text-left flex items-center space-x-3 px-3 py-3 rounded hover:bg-white/10 transition-colors ${
                  device.id === selectedDevice ? 'bg-white/5' : ''
                }`}
              >
                <div className="text-blue-400">
                  {device.icon}
                </div>
                <div>
                  <div className="text-white font-medium">{device.name}</div>
                  <div className="text-xs text-white/60">{device.screen} • {device.connection}</div>
                  <div className="text-xs text-white/40">{device.memory} RAM • {device.cpu}× CPU</div>
                </div>
                {device.id === selectedDevice && (
                  <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function IssuesPanel({ issues }: { issues: PerformanceIssue[] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4" />
      case 'medium': return <AlertTriangle className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Performance Issues</h3>
        <span className="text-sm text-white/60">{issues.length} issues found</span>
      </div>

      <div className="space-y-3">
        {issues.map(issue => (
          <div key={issue.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
            <div className={`p-1 rounded ${getSeverityColor(issue.severity)}`}>
              {getSeverityIcon(issue.severity)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white">{issue.message}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>
              <p className="text-sm text-white/60 mb-2">{issue.suggestion}</p>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{issue.category}</span>
                <span className="text-green-400">{issue.impact}</span>
              </div>
              {issue.fileCount && (
                <div className="flex items-center space-x-4 mt-2 text-xs text-white/60">
                  <span>{issue.fileCount} files affected</span>
                  {issue.sizeReduction && (
                    <span className="text-green-400">{issue.sizeReduction} potential savings</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <SimpleButton variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </SimpleButton>
        <SimpleButton size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Auto-Fix All
        </SimpleButton>
      </div>
    </SimpleCard>
  )
}

export default function MobilePerformanceMonitor() {
  const [selectedDevice, setSelectedDevice] = useState('iphone-13')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(new Date())

  const devices: DeviceProfile[] = [
    {
      id: 'iphone-13',
      name: 'iPhone 13',
      screen: '390×844',
      connection: '4G',
      cpu: 1,
      memory: '6GB',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      id: 'pixel-7',
      name: 'Pixel 7',
      screen: '393×851',
      connection: '4G',
      cpu: 1,
      memory: '8GB',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      id: 'iphone-se',
      name: 'iPhone SE',
      screen: '375×667',
      connection: '3G',
      cpu: 2,
      memory: '3GB',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      id: 'low-end',
      name: 'Low-End Android',
      screen: '360×640',
      connection: 'Slow 3G',
      cpu: 4,
      memory: '2GB',
      icon: <Smartphone className="w-5 h-5" />
    }
  ]

  const metrics: PerformanceMetric[] = [
    {
      id: '1',
      name: 'First Contentful Paint',
      value: 1.2,
      unit: 's',
      status: 'good',
      description: 'Time until first content appears',
      trend: 'down',
      category: 'loading'
    },
    {
      id: '2',
      name: 'Largest Contentful Paint',
      value: 2.8,
      unit: 's',
      status: 'warning',
      description: 'Time until main content loads',
      trend: 'up',
      category: 'loading'
    },
    {
      id: '3',
      name: 'Total Blocking Time',
      value: 450,
      unit: 'ms',
      status: 'critical',
      description: 'Time main thread is blocked',
      trend: 'up',
      category: 'runtime'
    },
    {
      id: '4',
      name: 'Cumulative Layout Shift',
      value: 0.15,
      unit: '',
      status: 'warning',
      description: 'Visual stability score',
      trend: 'stable',
      category: 'runtime'
    },
    {
      id: '5',
      name: 'Speed Index',
      value: 3.1,
      unit: 's',
      status: 'warning',
      description: 'How quickly content is visually displayed',
      trend: 'down',
      category: 'loading'
    },
    {
      id: '6',
      name: 'Time to Interactive',
      value: 4.2,
      unit: 's',
      status: 'critical',
      description: 'Time until page is fully interactive',
      trend: 'up',
      category: 'runtime'
    }
  ]

  const issues: PerformanceIssue[] = [
    {
      id: '1',
      severity: 'high',
      category: 'Images',
      message: 'Unoptimized images detected',
      suggestion: 'Convert to WebP format and add responsive sizing',
      impact: '2.3s faster load time',
      fileCount: 12,
      sizeReduction: '1.2MB'
    },
    {
      id: '2',
      severity: 'high',
      category: 'JavaScript',
      message: 'Large bundle size blocking render',
      suggestion: 'Implement code splitting and lazy loading',
      impact: '1.8s faster TTI',
      fileCount: 3,
      sizeReduction: '800KB'
    },
    {
      id: '3',
      severity: 'medium',
      category: 'CSS',
      message: 'Unused CSS detected',
      suggestion: 'Remove unused styles and critical CSS inline',
      impact: '0.5s faster FCP',
      fileCount: 5,
      sizeReduction: '200KB'
    },
    {
      id: '4',
      severity: 'medium',
      category: 'Fonts',
      message: 'Font loading causing layout shift',
      suggestion: 'Preload critical fonts and use font-display: swap',
      impact: '0.08 better CLS',
      fileCount: 2
    },
    {
      id: '5',
      severity: 'low',
      category: 'Caching',
      message: 'Missing cache headers',
      suggestion: 'Set appropriate cache policies for static assets',
      impact: '40% faster repeat visits'
    }
  ]

  const handleRunAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setLastAnalysis(new Date())
    }, 3000)
  }

  const getPerformanceScore = () => {
    const goodMetrics = metrics.filter(m => m.status === 'good').length
    const totalMetrics = metrics.length
    return Math.round((goodMetrics / totalMetrics) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Mobile Performance Monitor</h2>
          <p className="text-white/60">Real-time performance testing across mobile devices</p>
        </div>
        <div className="flex items-center space-x-3">
          <DeviceSelector 
            devices={devices}
            selectedDevice={selectedDevice}
            onDeviceChange={setSelectedDevice}
          />
          <SimpleButton onClick={handleRunAnalysis} disabled={isAnalyzing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Run Test'}
          </SimpleButton>
        </div>
      </div>

      {/* Performance Score */}
      <SimpleCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Performance Score</h3>
            <p className="text-sm text-white/60">
              Last tested: {lastAnalysis ? lastAnalysis.toLocaleString() : 'Never'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{getPerformanceScore()}</div>
            <div className="text-sm text-white/60">/ 100</div>
          </div>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getPerformanceScore()}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-green-400 font-bold">{metrics.filter(m => m.status === 'good').length}</div>
            <div className="text-xs text-white/60">Good</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">{metrics.filter(m => m.status === 'warning').length}</div>
            <div className="text-xs text-white/60">Warning</div>
          </div>
          <div>
            <div className="text-red-400 font-bold">{metrics.filter(m => m.status === 'critical').length}</div>
            <div className="text-xs text-white/60">Critical</div>
          </div>
        </div>
      </SimpleCard>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Issues Panel */}
      <IssuesPanel issues={issues} />

      {/* Quick Actions */}
      <SimpleCard>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Optimization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded bg-green-500/20">
                <Image className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white">Optimize Images</div>
                <div className="text-sm text-white/60">Convert and compress images</div>
              </div>
            </div>
            <div className="text-green-400 text-sm">1.2MB savings</div>
          </button>
          
          <button className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded bg-blue-500/20">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white">Minify Assets</div>
                <div className="text-sm text-white/60">Compress CSS/JS files</div>
              </div>
            </div>
            <div className="text-blue-400 text-sm">800KB savings</div>
          </button>
        </div>
      </SimpleCard>
    </div>
  )
}