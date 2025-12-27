'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Shield,
  Eye,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface SystemMetric {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  network: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  responseTime: number
  uptime: number
  lastCheck: string
}

interface AlertItem {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  resolved: boolean
}

export default function MonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMonitoringData()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(loadMonitoringData, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMonitoringData = () => {
    // Simulate loading system metrics
    const metrics: SystemMetric[] = []
    const now = Date.now()
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 5 * 60 * 1000) // 5-minute intervals
      metrics.push({
        timestamp: format(timestamp, 'HH:mm'),
        cpu: Math.random() * 40 + 30, // 30-70%
        memory: Math.random() * 30 + 50, // 50-80%
        disk: Math.random() * 20 + 60, // 60-80%
        network: Math.random() * 500 + 100 // 100-600 MB/s
      })
    }
    
    setSystemMetrics(metrics)
    
    // Mock service statuses
    const serviceStatuses: ServiceStatus[] = [
      {
        name: 'API Gateway',
        status: 'healthy',
        responseTime: 45,
        uptime: 99.9,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Database',
        status: 'warning',
        responseTime: 120,
        uptime: 99.5,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'AI Service',
        status: 'healthy',
        responseTime: 230,
        uptime: 99.8,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'File Storage',
        status: 'healthy',
        responseTime: 85,
        uptime: 99.9,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'CDN',
        status: 'healthy',
        responseTime: 15,
        uptime: 100,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Email Service',
        status: 'critical',
        responseTime: 5000,
        uptime: 95.2,
        lastCheck: new Date().toISOString()
      }
    ]
    
    setServices(serviceStatuses)
    
    // Mock alerts
    const alertItems: AlertItem[] = [
      {
        id: '1',
        type: 'error',
        title: 'Email Service Down',
        description: 'SMTP server is not responding. Users cannot receive emails.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'High Database Load',
        description: 'Database CPU usage above 80% for the last 15 minutes.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Scheduled Maintenance',
        description: 'Database maintenance scheduled for tomorrow 2:00 AM UTC.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '4',
        type: 'warning',
        title: 'API Rate Limit Exceeded',
        description: 'Multiple users hitting rate limits. Consider upgrading capacity.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        resolved: true
      }
    ]
    
    setAlerts(alertItems)
    setLoading(false)
  }

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const colors = {
      healthy: 'bg-green-600',
      warning: 'border-yellow-600 text-yellow-600',
      critical: 'bg-red-600'
    }
    
    return (
      <Badge 
        variant={status === 'warning' ? 'outline' : 'default'}
        className={colors[status]}
      >
        {status}
      </Badge>
    )
  }

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
    }
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time system health and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" onClick={loadMonitoringData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.cpu.toFixed(1) || '0'}%
                </p>
                <Badge variant={(systemMetrics[systemMetrics.length - 1]?.cpu ?? 0) > 80 ? 'destructive' : 'secondary'}>
                  {(systemMetrics[systemMetrics.length - 1]?.cpu ?? 0) > 80 ? 'High' : 'Normal'}
                </Badge>
              </div>
              <Cpu className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Memory</p>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.memory.toFixed(1) || '0'}%
                </p>
                <Badge variant="secondary">Normal</Badge>
              </div>
              <Server className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disk Usage</p>
                <p className="text-2xl font-bold">
                  {systemMetrics[systemMetrics.length - 1]?.disk.toFixed(1) || '0'}%
                </p>
                <Badge variant="secondary">Normal</Badge>
              </div>
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Network I/O</p>
                <p className="text-2xl font-bold">
                  {Math.round(systemMetrics[systemMetrics.length - 1]?.network || 0)}MB/s
                </p>
                <Badge variant="secondary">Normal</Badge>
              </div>
              <Network className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Incidents</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CPU & Memory Usage</CardTitle>
                <CardDescription>Last 2 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cpu"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="CPU %"
                    />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Memory %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Bandwidth utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={systemMetrics}>
                    <defs>
                      <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} MB/s`, 'Network I/O']} />
                    <Area
                      type="monotone"
                      dataKey="network"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorNetwork)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-4">
            {services.map(service => (
              <Card key={service.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-500">
                          Last checked: {format(new Date(service.lastCheck), 'HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Response Time</p>
                        <p className="font-medium">{service.responseTime}ms</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="font-medium">{service.uptime}%</p>
                      </div>
                      
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map(alert => (
              <Alert key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        {alert.resolved && (
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className="mt-1">
                        {alert.description}
                      </AlertDescription>
                      <p className="text-sm text-gray-500 mt-2">
                        {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  {!alert.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>Last 100 entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="text-gray-600">[2024-01-20 15:45:23] INFO: API Gateway - Health check passed</div>
                <div className="text-red-600">[2024-01-20 15:44:56] ERROR: Email Service - Connection timeout</div>
                <div className="text-yellow-600">[2024-01-20 15:43:12] WARN: Database - High CPU usage detected</div>
                <div className="text-gray-600">[2024-01-20 15:42:08] INFO: AI Service - Processing request batch</div>
                <div className="text-gray-600">[2024-01-20 15:41:45] INFO: CDN - Cache hit rate: 95.2%</div>
                <div className="text-blue-600">[2024-01-20 15:40:33] DEBUG: File Storage - Cleanup completed</div>
                <div className="text-gray-600">[2024-01-20 15:39:28] INFO: API Gateway - New user session created</div>
                <div className="text-yellow-600">[2024-01-20 15:38:45] WARN: Rate Limiter - User exceeded limits</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}