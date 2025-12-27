'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Server, 
  TrendingUp, 
  TrendingDown,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Users,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Settings
} from 'lucide-react'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  change: number
  threshold: {
    warning: number
    critical: number
  }
}

interface ServiceHealth {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  uptime: number
  lastCheck: string
  endpoints: {
    path: string
    status: number
    responseTime: number
  }[]
}

interface AlertRule {
  id: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  description: string
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 45.8,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      change: 2.3,
      threshold: { warning: 70, critical: 90 }
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 67.2,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      change: 5.1,
      threshold: { warning: 80, critical: 95 }
    },
    {
      id: 'disk',
      name: 'Disk Usage',
      value: 32.1,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      change: 1.2,
      threshold: { warning: 80, critical: 90 }
    },
    {
      id: 'network',
      name: 'Network I/O',
      value: 125.6,
      unit: 'MB/s',
      status: 'healthy',
      trend: 'stable',
      change: -0.8,
      threshold: { warning: 500, critical: 800 }
    },
    {
      id: 'requests',
      name: 'Requests/sec',
      value: 847,
      unit: 'req/s',
      status: 'healthy',
      trend: 'up',
      change: 12.4,
      threshold: { warning: 1000, critical: 1500 }
    },
    {
      id: 'response_time',
      name: 'Avg Response Time',
      value: 89,
      unit: 'ms',
      status: 'healthy',
      trend: 'down',
      change: -5.2,
      threshold: { warning: 200, critical: 500 }
    }
  ])

  const [services, setServices] = useState<ServiceHealth[]>([
    {
      service: 'API Gateway',
      status: 'healthy',
      responseTime: 45,
      uptime: 99.98,
      lastCheck: '2025-12-26T00:05:00Z',
      endpoints: [
        { path: '/api/health', status: 200, responseTime: 12 },
        { path: '/api/clone', status: 200, responseTime: 156 },
        { path: '/api/deploy', status: 200, responseTime: 89 }
      ]
    },
    {
      service: 'Database',
      status: 'healthy',
      responseTime: 23,
      uptime: 99.99,
      lastCheck: '2025-12-26T00:05:00Z',
      endpoints: [
        { path: 'postgresql://primary', status: 200, responseTime: 23 },
        { path: 'postgresql://replica', status: 200, responseTime: 25 }
      ]
    },
    {
      service: 'Redis Cache',
      status: 'healthy',
      responseTime: 2,
      uptime: 99.95,
      lastCheck: '2025-12-26T00:05:00Z',
      endpoints: [
        { path: 'redis://primary', status: 200, responseTime: 2 },
        { path: 'redis://cluster', status: 200, responseTime: 3 }
      ]
    },
    {
      service: 'File Storage',
      status: 'degraded',
      responseTime: 234,
      uptime: 98.76,
      lastCheck: '2025-12-26T00:05:00Z',
      endpoints: [
        { path: '/storage/upload', status: 200, responseTime: 234 },
        { path: '/storage/download', status: 500, responseTime: 0 }
      ]
    }
  ])

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'cpu_high',
      metric: 'CPU Usage',
      condition: 'greater_than',
      threshold: 80,
      severity: 'high',
      enabled: true,
      description: 'CPU usage exceeds 80%'
    },
    {
      id: 'memory_critical',
      metric: 'Memory Usage',
      condition: 'greater_than',
      threshold: 90,
      severity: 'critical',
      enabled: true,
      description: 'Memory usage critical'
    },
    {
      id: 'response_time_slow',
      metric: 'Response Time',
      condition: 'greater_than',
      threshold: 300,
      severity: 'medium',
      enabled: true,
      description: 'Response time too slow'
    }
  ])

  const [activeTab, setActiveTab] = useState('overview')

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'cpu': return <Cpu className="w-5 h-5" />
      case 'memory': return <Memory className="w-5 h-5" />
      case 'disk': return <HardDrive className="w-5 h-5" />
      case 'network': return <Network className="w-5 h-5" />
      case 'requests': return <Users className="w-5 h-5" />
      case 'response_time': return <Zap className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/20'
      case 'warning': case 'degraded': return 'text-yellow-400 bg-yellow-400/20'
      case 'critical': case 'down': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">System Monitoring</h1>
            <p className="text-white/60">Real-time system health and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">All Systems Operational</span>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mb-8 bg-white/5 p-1 rounded-lg border border-white/10">
          {['overview', 'metrics', 'services', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <Card key={metric.id} className="bg-white/5 border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/80">
                      {metric.name}
                    </CardTitle>
                    <div className="text-blue-400">
                      {getMetricIcon(metric.id)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold text-white">
                        {metric.value}
                        <span className="text-sm text-white/60 ml-1">{metric.unit}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-xs font-medium ${
                          metric.change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Services Status */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Service Health</CardTitle>
                <CardDescription className="text-white/60">
                  Real-time status of all critical services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          service.status === 'healthy' ? 'bg-green-400' :
                          service.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <h3 className="font-medium text-white">{service.service}</h3>
                          <p className="text-sm text-white/60">
                            Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <p className="text-sm font-medium text-white">{service.responseTime}ms</p>
                          <p className="text-xs text-white/60">Response Time</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{service.uptime}%</p>
                          <p className="text-xs text-white/60">Uptime</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {service.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <LineChart className="w-5 h-5 mr-2" />
                    Response Time Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-white/60 border border-white/10 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p>Response time chart would be rendered here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Resource Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-white/60 border border-white/10 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-8 h-8 mx-auto mb-2" />
                      <p>Resource usage chart would be rendered here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Alert Rules</CardTitle>
                <CardDescription className="text-white/60">
                  Configure monitoring alerts and thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                        <div>
                          <h3 className="font-medium text-white">{rule.description}</h3>
                          <p className="text-sm text-white/60">
                            {rule.metric} {rule.condition.replace('_', ' ')} {rule.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rule.severity === 'critical' ? 'text-red-400 bg-red-400/20' :
                          rule.severity === 'high' ? 'text-orange-400 bg-orange-400/20' :
                          rule.severity === 'medium' ? 'text-yellow-400 bg-yellow-400/20' :
                          'text-blue-400 bg-blue-400/20'
                        }`}>
                          {rule.severity}
                        </div>
                        <button className="text-white/60 hover:text-white">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional tabs would be implemented similarly */}
        {activeTab !== 'overview' && activeTab !== 'alerts' && (
          <div className="text-center py-12">
            <div className="text-white/60">
              <Activity className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View</h3>
              <p>Detailed {activeTab} monitoring interface would be implemented here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}