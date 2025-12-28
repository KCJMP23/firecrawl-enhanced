'use client'

import { useState, useEffect } from 'react'
import {
  Server,
  Key,
  Shield,
  Activity,
  BarChart3,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  Database,
  Zap,
  Users,
  FileText,
  Settings,
  Plus,
  Copy,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Bell,
  BellOff,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  GitBranch,
  Tag,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  MessageSquare
} from 'lucide-react'

interface APIEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  category: string
  status: 'active' | 'deprecated' | 'beta' | 'maintenance'
  version: string
  lastModified: Date
  usage: {
    requests: number
    errors: number
    avgResponseTime: number
    uptime: number
  }
  rateLimit: {
    requests: number
    window: string
    remaining: number
  }
  authentication: 'none' | 'api-key' | 'oauth' | 'jwt'
  documentation: string
}

interface APIKey {
  id: string
  name: string
  key: string
  status: 'active' | 'revoked' | 'expired'
  permissions: string[]
  rateLimit: number
  lastUsed: Date
  createdAt: Date
  expiresAt?: Date
  usage: {
    requests: number
    quotaUsed: number
    quotaLimit: number
  }
  owner: {
    name: string
    email: string
    type: 'user' | 'service'
  }
  restrictions: {
    ipWhitelist?: string[]
    domains?: string[]
    methods?: string[]
  }
}

interface APIMetrics {
  totalRequests: number
  successRate: number
  avgResponseTime: number
  errorRate: number
  topEndpoints: { path: string; requests: number }[]
  statusCodes: { [key: string]: number }
  timeRange: '1h' | '24h' | '7d' | '30d'
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'disabled' | 'failed'
  lastTriggered?: Date
  deliveryRate: number
  retryPolicy: {
    attempts: number
    backoff: string
  }
  headers: { [key: string]: string }
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

function EndpointCard({ endpoint, onAction }: {
  endpoint: APIEndpoint
  onAction: (action: string, endpointId: string) => void
}) {
  const getStatusColor = () => {
    switch (endpoint.status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'deprecated': return 'text-red-400 bg-red-400/20'
      case 'beta': return 'text-yellow-400 bg-yellow-400/20'
      case 'maintenance': return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getMethodColor = () => {
    switch (endpoint.method) {
      case 'GET': return 'text-green-400 bg-green-400/20'
      case 'POST': return 'text-blue-400 bg-blue-400/20'
      case 'PUT': return 'text-yellow-400 bg-yellow-400/20'
      case 'DELETE': return 'text-red-400 bg-red-400/20'
      case 'PATCH': return 'text-purple-400 bg-purple-400/20'
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${getMethodColor()}`}>
              {endpoint.method}
            </span>
            <span className="text-white font-medium">{endpoint.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
              {endpoint.status}
            </span>
          </div>
          
          <div className="text-sm text-white/60 font-mono mb-2">
            {endpoint.path}
          </div>
          
          <p className="text-sm text-white/70 mb-3">{endpoint.description}</p>
          
          <div className="flex items-center space-x-4 text-xs text-white/60">
            <span>v{endpoint.version}</span>
            <span>•</span>
            <span>{endpoint.category}</span>
            <span>•</span>
            <span>Modified {endpoint.lastModified.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SimpleButton variant="ghost" size="icon" onClick={() => onAction('test', endpoint.id)}>
            <Play className="w-4 h-4" />
          </SimpleButton>
          <SimpleButton variant="ghost" size="icon" onClick={() => onAction('docs', endpoint.id)}>
            <FileText className="w-4 h-4" />
          </SimpleButton>
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('edit', endpoint.id)}
                >
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  Edit Endpoint
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('clone', endpoint.id)}
                >
                  <Copy className="w-4 h-4 inline mr-2" />
                  Duplicate
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('analytics', endpoint.id)}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  View Analytics
                </button>
                <div className="border-t border-white/10 my-1" />
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-red-400"
                  onClick={() => onAction('delete', endpoint.id)}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 pt-3 border-t border-white/10">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{endpoint.usage.requests.toLocaleString()}</div>
          <div className="text-xs text-white/60">Requests</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${endpoint.usage.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {endpoint.usage.errors}
          </div>
          <div className="text-xs text-white/60">Errors</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{endpoint.usage.avgResponseTime}ms</div>
          <div className="text-xs text-white/60">Avg Response</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${endpoint.usage.uptime >= 99 ? 'text-green-400' : 'text-yellow-400'}`}>
            {endpoint.usage.uptime}%
          </div>
          <div className="text-xs text-white/60">Uptime</div>
        </div>
      </div>
    </div>
  )
}

function APIKeyCard({ apiKey, onAction }: {
  apiKey: APIKey
  onAction: (action: string, keyId: string) => void
}) {
  const [showKey, setShowKey] = useState(false)

  const getStatusColor = () => {
    switch (apiKey.status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'revoked': return 'text-red-400 bg-red-400/20'
      case 'expired': return 'text-gray-400 bg-gray-400/20'
    }
  }

  const maskedKey = `${apiKey.key.substring(0, 8)}${'*'.repeat(16)}${apiKey.key.substring(24)}`

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-white font-medium">{apiKey.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
              {apiKey.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <code className="text-sm font-mono text-white/80 bg-black/30 px-2 py-1 rounded">
              {showKey ? apiKey.key : maskedKey}
            </code>
            <SimpleButton variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </SimpleButton>
            <SimpleButton variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(apiKey.key)}>
              <Copy className="w-4 h-4" />
            </SimpleButton>
          </div>

          <div className="flex items-center space-x-4 text-xs text-white/60 mb-3">
            <span>{apiKey.owner.name}</span>
            <span>•</span>
            <span>{apiKey.owner.type}</span>
            <span>•</span>
            <span>Created {apiKey.createdAt.toLocaleDateString()}</span>
            {apiKey.expiresAt && (
              <>
                <span>•</span>
                <span>Expires {apiKey.expiresAt.toLocaleDateString()}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {apiKey.permissions.slice(0, 3).map(permission => (
              <span key={permission} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                {permission}
              </span>
            ))}
            {apiKey.permissions.length > 3 && (
              <span className="px-2 py-1 text-xs text-white/60">
                +{apiKey.permissions.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SimpleButton variant="outline" size="sm" onClick={() => onAction('regenerate', apiKey.id)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </SimpleButton>
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('edit', apiKey.id)}
                >
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  Edit Permissions
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('usage', apiKey.id)}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  View Usage
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('logs', apiKey.id)}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Access Logs
                </button>
                <div className="border-t border-white/10 my-1" />
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-red-400"
                  onClick={() => onAction('revoke', apiKey.id)}
                >
                  <XCircle className="w-4 h-4 inline mr-2" />
                  Revoke Key
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/10">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{apiKey.usage.requests.toLocaleString()}</div>
          <div className="text-xs text-white/60">Requests</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {Math.round((apiKey.usage.quotaUsed / apiKey.usage.quotaLimit) * 100)}%
          </div>
          <div className="text-xs text-white/60">Quota Used</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{apiKey.rateLimit}/min</div>
          <div className="text-xs text-white/60">Rate Limit</div>
        </div>
      </div>
    </div>
  )
}

function MetricsChart({ metrics }: { metrics: APIMetrics }) {
  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">API Metrics</h3>
        <select className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:border-blue-500">
          <option value="1h" className="bg-gray-900">Last Hour</option>
          <option value="24h" className="bg-gray-900">Last 24 Hours</option>
          <option value="7d" className="bg-gray-900">Last 7 Days</option>
          <option value="30d" className="bg-gray-900">Last 30 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{metrics.totalRequests.toLocaleString()}</div>
          <div className="text-sm text-white/60">Total Requests</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
            <span className="text-xs text-green-400">+12.5%</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{metrics.successRate}%</div>
          <div className="text-sm text-white/60">Success Rate</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
            <span className="text-xs text-green-400">+2.1%</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{metrics.avgResponseTime}ms</div>
          <div className="text-sm text-white/60">Avg Response</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingDown className="w-3 h-3 text-green-400 mr-1" />
            <span className="text-xs text-green-400">-15ms</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{metrics.errorRate}%</div>
          <div className="text-sm text-white/60">Error Rate</div>
          <div className="flex items-center justify-center mt-1">
            <TrendingDown className="w-3 h-3 text-green-400 mr-1" />
            <span className="text-xs text-green-400">-0.5%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-white font-medium mb-3">Top Endpoints</h4>
          <div className="space-y-2">
            {metrics.topEndpoints.map((endpoint, index) => (
              <div key={endpoint.path} className="flex items-center justify-between p-2 bg-white/5 rounded">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="text-white/80 font-mono text-sm">{endpoint.path}</span>
                </div>
                <span className="text-white/60 text-sm">{endpoint.requests.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-3">Status Code Distribution</h4>
          <div className="space-y-2">
            {Object.entries(metrics.statusCodes).map(([code, count]) => {
              const percentage = (count / metrics.totalRequests) * 100
              const color = code.startsWith('2') ? 'bg-green-500' : 
                           code.startsWith('4') ? 'bg-yellow-500' : 
                           code.startsWith('5') ? 'bg-red-500' : 'bg-blue-500'
              
              return (
                <div key={code} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-white/80 font-mono text-sm w-8">{code}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-2 w-32">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">{count.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SimpleCard>
  )
}

function WebhookCard({ webhook, onAction }: {
  webhook: WebhookEndpoint
  onAction: (action: string, webhookId: string) => void
}) {
  const getStatusColor = () => {
    switch (webhook.status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'disabled': return 'text-gray-400 bg-gray-400/20'
      case 'failed': return 'text-red-400 bg-red-400/20'
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-white font-medium">{webhook.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
              {webhook.status}
            </span>
          </div>
          
          <div className="text-sm text-white/70 font-mono mb-2">{webhook.url}</div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {webhook.events.slice(0, 3).map(event => (
              <span key={event} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                {event}
              </span>
            ))}
            {webhook.events.length > 3 && (
              <span className="px-2 py-1 text-xs text-white/60">
                +{webhook.events.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-white/60">
            <span>Delivery: {webhook.deliveryRate}%</span>
            <span>•</span>
            <span>Retries: {webhook.retryPolicy.attempts}</span>
            {webhook.lastTriggered && (
              <>
                <span>•</span>
                <span>Last: {webhook.lastTriggered.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SimpleButton variant="outline" size="sm" onClick={() => onAction('test', webhook.id)}>
            <Zap className="w-4 h-4 mr-2" />
            Test
          </SimpleButton>
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('edit', webhook.id)}
                >
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  Edit Webhook
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('logs', webhook.id)}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Delivery Logs
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('toggle', webhook.id)}
                >
                  {webhook.status === 'active' ? <Pause className="w-4 h-4 inline mr-2" /> : <Play className="w-4 h-4 inline mr-2" />}
                  {webhook.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <div className="border-t border-white/10 my-1" />
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-red-400"
                  onClick={() => onAction('delete', webhook.id)}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function APIManagementSystem() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'endpoints' | 'keys' | 'webhooks' | 'analytics' | 'docs'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [apiMetrics] = useState<APIMetrics>({
    totalRequests: 1247892,
    successRate: 99.2,
    avgResponseTime: 145,
    errorRate: 0.8,
    topEndpoints: [
      { path: '/api/v1/projects', requests: 45231 },
      { path: '/api/v1/templates', requests: 38492 },
      { path: '/api/v1/users', requests: 29384 },
      { path: '/api/v1/analytics', requests: 18293 },
      { path: '/api/v1/webhooks', requests: 12847 }
    ],
    statusCodes: {
      '200': 1186420,
      '201': 32481,
      '400': 15234,
      '401': 8392,
      '403': 3421,
      '404': 1542,
      '500': 402
    },
    timeRange: '24h'
  })

  const [apiEndpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      name: 'List Projects',
      path: '/api/v1/projects',
      method: 'GET',
      description: 'Retrieve all projects for the authenticated user',
      category: 'Projects',
      status: 'active',
      version: '1.2.0',
      lastModified: new Date('2024-12-20'),
      usage: { requests: 45231, errors: 12, avgResponseTime: 120, uptime: 99.8 },
      rateLimit: { requests: 1000, window: '1h', remaining: 847 },
      authentication: 'api-key',
      documentation: '/docs/api/projects#list'
    },
    {
      id: '2',
      name: 'Create Project',
      path: '/api/v1/projects',
      method: 'POST',
      description: 'Create a new project with specified configuration',
      category: 'Projects',
      status: 'active',
      version: '1.2.0',
      lastModified: new Date('2024-12-18'),
      usage: { requests: 8934, errors: 3, avgResponseTime: 340, uptime: 99.9 },
      rateLimit: { requests: 100, window: '1h', remaining: 67 },
      authentication: 'oauth',
      documentation: '/docs/api/projects#create'
    },
    {
      id: '3',
      name: 'Get Analytics',
      path: '/api/v1/analytics/{project_id}',
      method: 'GET',
      description: 'Retrieve analytics data for a specific project',
      category: 'Analytics',
      status: 'beta',
      version: '2.0.0',
      lastModified: new Date('2024-12-22'),
      usage: { requests: 18293, errors: 45, avgResponseTime: 890, uptime: 98.7 },
      rateLimit: { requests: 500, window: '1h', remaining: 234 },
      authentication: 'jwt',
      documentation: '/docs/api/analytics#get'
    },
    {
      id: '4',
      name: 'Legacy User Profile',
      path: '/api/v0/user/profile',
      method: 'GET',
      description: 'Legacy endpoint for user profile data',
      category: 'Users',
      status: 'deprecated',
      version: '0.9.0',
      lastModified: new Date('2024-11-15'),
      usage: { requests: 3421, errors: 89, avgResponseTime: 1240, uptime: 95.2 },
      rateLimit: { requests: 200, window: '1h', remaining: 156 },
      authentication: 'api-key',
      documentation: '/docs/api/legacy/users#profile'
    }
  ])

  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'wcp_prod_1234567890abcdef1234567890abcdef',
      status: 'active',
      permissions: ['read:projects', 'write:projects', 'read:analytics'],
      rateLimit: 1000,
      lastUsed: new Date('2024-12-25T10:30:00Z'),
      createdAt: new Date('2024-12-01'),
      usage: { requests: 45231, quotaUsed: 67890, quotaLimit: 100000 },
      owner: { name: 'Production App', email: 'admin@company.com', type: 'service' },
      restrictions: { 
        ipWhitelist: ['192.168.1.100', '10.0.0.50'],
        domains: ['app.company.com'],
        methods: ['GET', 'POST']
      }
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'wcp_dev_abcdef1234567890abcdef1234567890',
      status: 'active',
      permissions: ['read:projects', 'write:projects', 'read:users'],
      rateLimit: 500,
      lastUsed: new Date('2024-12-24T16:45:00Z'),
      createdAt: new Date('2024-12-15'),
      expiresAt: new Date('2025-06-15'),
      usage: { requests: 8934, quotaUsed: 12340, quotaLimit: 50000 },
      owner: { name: 'John Developer', email: 'john@company.com', type: 'user' },
      restrictions: {}
    },
    {
      id: '3',
      name: 'Analytics Dashboard',
      key: 'wcp_analytics_9876543210fedcba9876543210fedcba',
      status: 'active',
      permissions: ['read:analytics', 'read:projects'],
      rateLimit: 200,
      lastUsed: new Date('2024-12-25T08:15:00Z'),
      createdAt: new Date('2024-11-20'),
      usage: { requests: 18293, quotaUsed: 28450, quotaLimit: 30000 },
      owner: { name: 'Analytics Service', email: 'analytics@company.com', type: 'service' },
      restrictions: { methods: ['GET'] }
    },
    {
      id: '4',
      name: 'Old Integration',
      key: 'wcp_old_fedcba9876543210fedcba9876543210',
      status: 'expired',
      permissions: ['read:projects'],
      rateLimit: 100,
      lastUsed: new Date('2024-11-30T12:00:00Z'),
      createdAt: new Date('2024-06-01'),
      expiresAt: new Date('2024-12-01'),
      usage: { requests: 3421, quotaUsed: 5000, quotaLimit: 10000 },
      owner: { name: 'Legacy System', email: 'legacy@oldcompany.com', type: 'service' },
      restrictions: {}
    }
  ])

  const [webhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Project Events',
      url: 'https://api.company.com/webhooks/projects',
      events: ['project.created', 'project.updated', 'project.deleted'],
      status: 'active',
      lastTriggered: new Date('2024-12-25T09:45:00Z'),
      deliveryRate: 98.7,
      retryPolicy: { attempts: 3, backoff: 'exponential' },
      headers: { 'Authorization': 'Bearer token123', 'X-Source': 'WebClonePro' }
    },
    {
      id: '2',
      name: 'User Activity',
      url: 'https://analytics.company.com/events',
      events: ['user.signup', 'user.login', 'user.upgrade'],
      status: 'active',
      lastTriggered: new Date('2024-12-25T10:12:00Z'),
      deliveryRate: 99.2,
      retryPolicy: { attempts: 5, backoff: 'linear' },
      headers: { 'X-API-Key': 'analytics_key_456' }
    },
    {
      id: '3',
      name: 'Payment Notifications',
      url: 'https://billing.company.com/notifications',
      events: ['payment.success', 'payment.failed', 'subscription.canceled'],
      status: 'failed',
      lastTriggered: new Date('2024-12-24T14:30:00Z'),
      deliveryRate: 76.3,
      retryPolicy: { attempts: 3, backoff: 'exponential' },
      headers: { 'Authorization': 'Bearer billing_token' }
    }
  ])

  const handleEndpointAction = (action: string, endpointId: string) => {
    console.log('Endpoint action:', action, endpointId)
  }

  const handleKeyAction = (action: string, keyId: string) => {
    console.log('API Key action:', action, keyId)
  }

  const handleWebhookAction = (action: string, webhookId: string) => {
    console.log('Webhook action:', action, webhookId)
  }

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.path.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory
    const matchesStatus = statusFilter === 'all' || endpoint.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const activeEndpoints = apiEndpoints.filter(e => e.status === 'active').length
  const totalKeys = apiKeys.length
  const activeKeys = apiKeys.filter(k => k.status === 'active').length
  const webhookCount = webhooks.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">API Management</h2>
          <p className="text-white/60">Manage your API endpoints, keys, and integrations</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </SimpleButton>
          <SimpleButton>
            <Plus className="w-4 h-4 mr-2" />
            New API Key
          </SimpleButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{activeEndpoints}</div>
              <div className="text-white/60 text-sm">Active Endpoints</div>
            </div>
            <Server className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{activeKeys}/{totalKeys}</div>
              <div className="text-white/60 text-sm">API Keys</div>
            </div>
            <Key className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{apiMetrics.totalRequests.toLocaleString()}</div>
              <div className="text-white/60 text-sm">Total Requests</div>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{webhookCount}</div>
              <div className="text-white/60 text-sm">Webhooks</div>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'endpoints', label: 'Endpoints', icon: <Server className="w-4 h-4" /> },
          { id: 'keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
          { id: 'webhooks', label: 'Webhooks', icon: <Zap className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'docs', label: 'Documentation', icon: <FileText className="w-4 h-4" /> }
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
        <div className="space-y-6">
          <MetricsChart metrics={apiMetrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">API Gateway</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-green-400 text-sm">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-green-400 text-sm">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Cache Layer</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-yellow-400 text-sm">Degraded</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">CDN</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-green-400 text-sm">Operational</span>
                  </div>
                </div>
              </div>
            </SimpleCard>

            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { time: '5 min ago', event: 'New API key created', type: 'info' },
                  { time: '12 min ago', event: 'Webhook delivery failed', type: 'warning' },
                  { time: '23 min ago', event: 'Rate limit exceeded for key prod_123', type: 'error' },
                  { time: '1 hour ago', event: 'New endpoint deployed', type: 'success' },
                  { time: '2 hours ago', event: 'API key regenerated', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-white/5 rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'warning' ? 'bg-yellow-400' :
                      activity.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="text-white/80 text-sm">{activity.event}</div>
                      <div className="text-white/40 text-xs">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SimpleCard>
          </div>
        </div>
      )}

      {selectedTab === 'endpoints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all" className="bg-gray-900">All Categories</option>
                <option value="Projects" className="bg-gray-900">Projects</option>
                <option value="Users" className="bg-gray-900">Users</option>
                <option value="Analytics" className="bg-gray-900">Analytics</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all" className="bg-gray-900">All Status</option>
                <option value="active" className="bg-gray-900">Active</option>
                <option value="deprecated" className="bg-gray-900">Deprecated</option>
                <option value="beta" className="bg-gray-900">Beta</option>
                <option value="maintenance" className="bg-gray-900">Maintenance</option>
              </select>
            </div>

            <SimpleButton>
              <Plus className="w-4 h-4 mr-2" />
              Add Endpoint
            </SimpleButton>
          </div>

          <div className="space-y-4">
            {filteredEndpoints.map(endpoint => (
              <EndpointCard
                key={endpoint.id}
                endpoint={endpoint}
                onAction={handleEndpointAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">API Keys</h3>
            <SimpleButton>
              <Plus className="w-4 h-4 mr-2" />
              Generate Key
            </SimpleButton>
          </div>

          <div className="space-y-4">
            {apiKeys.map(apiKey => (
              <APIKeyCard
                key={apiKey.id}
                apiKey={apiKey}
                onAction={handleKeyAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Webhooks</h3>
            <SimpleButton>
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </SimpleButton>
          </div>

          <div className="space-y-4">
            {webhooks.map(webhook => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onAction={handleWebhookAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          <MetricsChart metrics={apiMetrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
              <div className="space-y-3">
                {[
                  { country: 'United States', requests: 456789, percentage: 36.6 },
                  { country: 'United Kingdom', requests: 234567, percentage: 18.8 },
                  { country: 'Germany', requests: 189234, percentage: 15.2 },
                  { country: 'Canada', requests: 156789, percentage: 12.6 },
                  { country: 'Australia', requests: 98765, percentage: 7.9 }
                ].map(country => (
                  <div key={country.country} className="flex items-center justify-between">
                    <span className="text-white/80">{country.country}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                      <span className="text-white/60 text-sm w-20 text-right">
                        {country.requests.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SimpleCard>

            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Error Analysis</h3>
              <div className="space-y-4">
                {[
                  { error: '401 Unauthorized', count: 8392, trend: '+5%' },
                  { error: '404 Not Found', count: 1542, trend: '-12%' },
                  { error: '429 Rate Limited', count: 892, trend: '+23%' },
                  { error: '500 Server Error', count: 402, trend: '-8%' }
                ].map(error => (
                  <div key={error.error} className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div>
                      <div className="text-white/80 text-sm">{error.error}</div>
                      <div className="text-white/60 text-xs">{error.count} occurrences</div>
                    </div>
                    <div className={`text-sm ${error.trend.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
                      {error.trend}
                    </div>
                  </div>
                ))}
              </div>
            </SimpleCard>
          </div>
        </div>
      )}

      {selectedTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">API Documentation</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/80 mb-4">
                  Welcome to the WebClone Pro API documentation. Our RESTful API allows you to integrate
                  your applications with our platform programmatically.
                </p>
                
                <h4 className="text-white font-semibold mb-2">Authentication</h4>
                <p className="text-white/70 mb-4">
                  All API requests require authentication using an API key. Include your API key in the
                  Authorization header:
                </p>
                <pre className="bg-black/30 p-4 rounded-lg text-sm text-green-400 mb-6">
{`Authorization: Bearer your_api_key_here`}
                </pre>

                <h4 className="text-white font-semibold mb-2">Rate Limiting</h4>
                <p className="text-white/70 mb-4">
                  API requests are limited based on your subscription plan. Rate limit headers are
                  included in all responses:
                </p>
                <pre className="bg-black/30 p-4 rounded-lg text-sm text-green-400 mb-6">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1640995200`}
                </pre>

                <h4 className="text-white font-semibold mb-2">Error Handling</h4>
                <p className="text-white/70 mb-4">
                  The API uses standard HTTP status codes and returns error details in JSON format:
                </p>
                <pre className="bg-black/30 p-4 rounded-lg text-sm text-red-400 mb-6">
{`{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is missing required parameters"
  }
}`}
                </pre>
              </div>
            </SimpleCard>
          </div>

          <div className="space-y-6">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { name: 'Getting Started', url: '/docs/getting-started' },
                  { name: 'Authentication', url: '/docs/auth' },
                  { name: 'Projects API', url: '/docs/projects' },
                  { name: 'Users API', url: '/docs/users' },
                  { name: 'Analytics API', url: '/docs/analytics' },
                  { name: 'Webhooks', url: '/docs/webhooks' },
                  { name: 'SDKs', url: '/docs/sdks' }
                ].map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    className="block p-2 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </SimpleCard>

            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">API Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">API Gateway</span>
                  <span className="text-green-400">99.9% uptime</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Response Time</span>
                  <span className="text-white">145ms avg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Last Incident</span>
                  <span className="text-white/60">7 days ago</span>
                </div>
              </div>
            </SimpleCard>

            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <div className="space-y-3">
                <p className="text-white/70 text-sm">
                  Need help with the API? We're here to assist you.
                </p>
                <div className="space-y-2">
                  <SimpleButton variant="outline" size="sm" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </SimpleButton>
                  <SimpleButton variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Examples
                  </SimpleButton>
                </div>
              </div>
            </SimpleCard>
          </div>
        </div>
      )}
    </div>
  )
}