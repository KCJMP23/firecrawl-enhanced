'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Users,
  FileText,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Bell,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Copy,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Fingerprint,
  ShieldCheck,
  ShieldX,
  Scan,
  Bug,
  AlertCircle,
  Info,
  Star,
  Target,
  Layers,
  Code,
  Server,
  Cloud,
  Wifi,
  WifiOff
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'compliance'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  timestamp: Date
  source: string
  ipAddress: string
  location: string
  userId?: string
  userAgent?: string
  status: 'active' | 'investigating' | 'resolved' | 'false_positive'
  affectedResources: string[]
  mitigation?: string
}

interface ThreatIntelligence {
  id: string
  threatType: 'malware' | 'phishing' | 'brute_force' | 'ddos' | 'data_breach'
  confidence: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  indicators: {
    type: 'ip' | 'domain' | 'hash' | 'url'
    value: string
    firstSeen: Date
    lastSeen: Date
  }[]
  description: string
  recommendations: string[]
  source: string
}

interface ComplianceCheck {
  id: string
  framework: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'FedRAMP'
  control: string
  description: string
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed'
  lastAssessed: Date
  evidence: string[]
  recommendations: string[]
  responsible: string
  dueDate?: Date
}

interface AccessControl {
  id: string
  type: 'user' | 'service' | 'api'
  subject: string
  permissions: string[]
  resources: string[]
  conditions: {
    ipWhitelist?: string[]
    timeRestriction?: string
    mfaRequired?: boolean
    sessionTimeout?: number
  }
  status: 'active' | 'suspended' | 'expired'
  createdAt: Date
  lastUsed?: Date
  createdBy: string
}

interface VulnerabilityAssessment {
  id: string
  type: 'infrastructure' | 'application' | 'dependency' | 'configuration'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  cve?: string
  cvss?: number
  affectedComponent: string
  discoveredAt: Date
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
  assignee?: string
  remediationSteps: string[]
  estimatedEffort: string
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

function SecurityEventCard({ event, onAction }: {
  event: SecurityEvent
  onAction: (action: string, eventId: string) => void
}) {
  const getSeverityColor = () => {
    switch (event.severity) {
      case 'critical': return 'text-red-400 bg-red-400/20 border-red-400/30'
      case 'high': return 'text-orange-400 bg-orange-400/20 border-orange-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'low': return 'text-blue-400 bg-blue-400/20 border-blue-400/30'
      case 'info': return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  const getStatusIcon = () => {
    switch (event.status) {
      case 'active': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'investigating': return <Search className="w-4 h-4 text-yellow-400" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'false_positive': return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeIcon = () => {
    switch (event.type) {
      case 'authentication': return <Key className="w-4 h-4" />
      case 'authorization': return <Shield className="w-4 h-4" />
      case 'data_access': return <Database className="w-4 h-4" />
      case 'system': return <Server className="w-4 h-4" />
      case 'compliance': return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className={`p-4 rounded-lg border transition-all ${getSeverityColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-white/10">
            <div className="text-white">
              {getTypeIcon()}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-white">{event.title}</span>
              {getStatusIcon()}
            </div>
            <p className="text-white/80 text-sm">{event.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/60">
            {event.timestamp.toLocaleString()}
          </span>
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('investigate', event.id)}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Investigate
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('resolve', event.id)}
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Mark Resolved
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('false_positive', event.id)}
                >
                  <XCircle className="w-4 h-4 inline mr-2" />
                  False Positive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-white/60 text-xs mb-1">Source</div>
          <div className="text-white/80">{event.source}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">IP Address</div>
          <div className="text-white/80 font-mono text-xs">{event.ipAddress}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Location</div>
          <div className="text-white/80">{event.location}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Affected Resources</div>
          <div className="text-white/80">{event.affectedResources.join(', ')}</div>
        </div>
      </div>

      {event.mitigation && (
        <div className="mt-3 p-3 bg-white/5 rounded border-l-4 border-blue-500">
          <div className="text-white/60 text-xs mb-1">Recommended Mitigation</div>
          <div className="text-white/80 text-sm">{event.mitigation}</div>
        </div>
      )}
    </div>
  )
}

function ComplianceCheckCard({ check }: { check: ComplianceCheck }) {
  const getStatusColor = () => {
    switch (check.status) {
      case 'compliant': return 'text-green-400 bg-green-400/20'
      case 'non_compliant': return 'text-red-400 bg-red-400/20'
      case 'partially_compliant': return 'text-yellow-400 bg-yellow-400/20'
      case 'not_assessed': return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getFrameworkIcon = () => {
    switch (check.framework) {
      case 'SOC2': return <ShieldCheck className="w-4 h-4" />
      case 'ISO27001': return <Shield className="w-4 h-4" />
      case 'GDPR': return <Lock className="w-4 h-4" />
      case 'HIPAA': return <FileText className="w-4 h-4" />
      case 'PCI_DSS': return <Key className="w-4 h-4" />
      case 'FedRAMP': return <Star className="w-4 h-4" />
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-blue-500/20">
            <div className="text-blue-400">
              {getFrameworkIcon()}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-white">{check.framework}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                {check.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-white/80 text-sm font-medium">{check.control}</p>
            <p className="text-white/60 text-sm">{check.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <div className="text-white/60 text-xs mb-1">Last Assessed</div>
          <div className="text-white/80">{check.lastAssessed.toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Responsible</div>
          <div className="text-white/80">{check.responsible}</div>
        </div>
      </div>

      {check.recommendations.length > 0 && (
        <div className="mb-3">
          <div className="text-white/60 text-xs mb-2">Recommendations</div>
          <div className="space-y-1">
            {check.recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-blue-400 mt-0.5">•</span>
                <span className="text-white/70">{rec}</span>
              </div>
            ))}
            {check.recommendations.length > 2 && (
              <div className="text-white/40 text-xs">
                +{check.recommendations.length - 2} more recommendations
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <SimpleButton variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </SimpleButton>
        <SimpleButton variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Evidence
        </SimpleButton>
      </div>
    </div>
  )
}

function VulnerabilityCard({ vulnerability, onAction }: {
  vulnerability: VulnerabilityAssessment
  onAction: (action: string, vulnId: string) => void
}) {
  const getSeverityColor = () => {
    switch (vulnerability.severity) {
      case 'critical': return 'text-red-400 bg-red-400/20 border-red-400/30'
      case 'high': return 'text-orange-400 bg-orange-400/20 border-orange-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'low': return 'text-blue-400 bg-blue-400/20 border-blue-400/30'
      case 'info': return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  const getStatusIcon = () => {
    switch (vulnerability.status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'accepted_risk': return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeIcon = () => {
    switch (vulnerability.type) {
      case 'infrastructure': return <Server className="w-4 h-4" />
      case 'application': return <Code className="w-4 h-4" />
      case 'dependency': return <Layers className="w-4 h-4" />
      case 'configuration': return <Settings className="w-4 h-4" />
    }
  }

  return (
    <div className={`p-4 rounded-lg border transition-all ${getSeverityColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-white/10">
            <div className="text-white">
              {getTypeIcon()}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-white">{vulnerability.title}</span>
              {getStatusIcon()}
              {vulnerability.cvss && (
                <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
                  CVSS: {vulnerability.cvss}
                </span>
              )}
            </div>
            <p className="text-white/80 text-sm">{vulnerability.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <SimpleButton variant="outline" size="sm" onClick={() => onAction('assign', vulnerability.id)}>
            <Users className="w-4 h-4 mr-2" />
            Assign
          </SimpleButton>
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('details', vulnerability.id)}
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  View Details
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('remediate', vulnerability.id)}
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Mark Resolved
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('accept_risk', vulnerability.id)}
                >
                  <Info className="w-4 h-4 inline mr-2" />
                  Accept Risk
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <div className="text-white/60 text-xs mb-1">Component</div>
          <div className="text-white/80">{vulnerability.affectedComponent}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Discovered</div>
          <div className="text-white/80">{vulnerability.discoveredAt.toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Effort</div>
          <div className="text-white/80">{vulnerability.estimatedEffort}</div>
        </div>
      </div>

      {vulnerability.cve && (
        <div className="mb-3 p-2 bg-white/5 rounded">
          <div className="text-white/60 text-xs mb-1">CVE ID</div>
          <div className="text-white/80 font-mono text-sm">{vulnerability.cve}</div>
        </div>
      )}

      <div className="mb-3">
        <div className="text-white/60 text-xs mb-2">Remediation Steps</div>
        <div className="space-y-1">
          {vulnerability.remediationSteps.slice(0, 2).map((step, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <span className="text-blue-400 mt-0.5">{index + 1}.</span>
              <span className="text-white/70">{step}</span>
            </div>
          ))}
          {vulnerability.remediationSteps.length > 2 && (
            <div className="text-white/40 text-xs">
              +{vulnerability.remediationSteps.length - 2} more steps
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccessControlCard({ access, onAction }: {
  access: AccessControl
  onAction: (action: string, accessId: string) => void
}) {
  const getStatusColor = () => {
    switch (access.status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'suspended': return 'text-yellow-400 bg-yellow-400/20'
      case 'expired': return 'text-red-400 bg-red-400/20'
    }
  }

  const getTypeIcon = () => {
    switch (access.type) {
      case 'user': return <Users className="w-4 h-4" />
      case 'service': return <Server className="w-4 h-4" />
      case 'api': return <Key className="w-4 h-4" />
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-green-500/20">
            <div className="text-green-400">
              {getTypeIcon()}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-white">{access.subject}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                {access.status}
              </span>
            </div>
            <div className="text-white/60 text-xs capitalize">{access.type} access</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <SimpleButton variant="outline" size="sm" onClick={() => onAction('edit', access.id)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </SimpleButton>
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('suspend', access.id)}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  {access.status === 'suspended' ? 'Restore' : 'Suspend'}
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('audit', access.id)}
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  View Audit Log
                </button>
                <div className="border-t border-white/10 my-1" />
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-red-400"
                  onClick={() => onAction('revoke', access.id)}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Revoke Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-white/60 text-xs mb-2">Permissions</div>
        <div className="flex flex-wrap gap-1">
          {access.permissions.slice(0, 4).map(permission => (
            <span key={permission} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              {permission}
            </span>
          ))}
          {access.permissions.length > 4 && (
            <span className="px-2 py-1 text-xs text-white/60">
              +{access.permissions.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-white/60 text-xs mb-2">Resources</div>
        <div className="text-white/80 text-sm">{access.resources.join(', ')}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-white/60 text-xs mb-1">Created</div>
          <div className="text-white/80">{access.createdAt.toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Last Used</div>
          <div className="text-white/80">
            {access.lastUsed ? access.lastUsed.toLocaleDateString() : 'Never'}
          </div>
        </div>
      </div>

      {Object.keys(access.conditions).length > 0 && (
        <div className="mt-3 p-2 bg-white/5 rounded">
          <div className="text-white/60 text-xs mb-1">Conditions</div>
          <div className="space-y-1 text-xs">
            {access.conditions.ipWhitelist && (
              <div className="text-white/70">
                IP Whitelist: {access.conditions.ipWhitelist.join(', ')}
              </div>
            )}
            {access.conditions.mfaRequired && (
              <div className="text-white/70">MFA Required</div>
            )}
            {access.conditions.sessionTimeout && (
              <div className="text-white/70">
                Session Timeout: {access.conditions.sessionTimeout}m
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EnterpriseSecurityFeatures() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'events' | 'compliance' | 'vulnerabilities' | 'access' | 'monitoring'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'authentication',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      description: 'Detected 15 failed login attempts from IP 192.168.1.100 in 5 minutes',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      source: 'Authentication Service',
      ipAddress: '192.168.1.100',
      location: 'New York, US',
      userId: 'user_12345',
      userAgent: 'Mozilla/5.0 Chrome/91.0',
      status: 'investigating',
      affectedResources: ['User Account', 'Login Service'],
      mitigation: 'Consider implementing account lockout after 5 failed attempts'
    },
    {
      id: '2',
      type: 'data_access',
      severity: 'medium',
      title: 'Unusual Data Export Activity',
      description: 'Large volume data export detected outside normal business hours',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      source: 'Data Access Monitor',
      ipAddress: '10.0.0.50',
      location: 'San Francisco, US',
      userId: 'admin_67890',
      status: 'active',
      affectedResources: ['Customer Database', 'Analytics Data'],
      mitigation: 'Review data access patterns and implement additional monitoring'
    },
    {
      id: '3',
      type: 'system',
      severity: 'critical',
      title: 'Potential DDoS Attack',
      description: 'Abnormal traffic spike detected from multiple IP addresses',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      source: 'Network Monitor',
      ipAddress: 'Multiple',
      location: 'Various',
      status: 'active',
      affectedResources: ['Web Application', 'API Gateway'],
      mitigation: 'Activate DDoS protection and implement rate limiting'
    }
  ])

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      id: '1',
      framework: 'SOC2',
      control: 'CC6.1 - Logical and Physical Access Controls',
      description: 'The entity implements logical and physical access controls to limit access to systems and data',
      status: 'compliant',
      lastAssessed: new Date('2024-12-15'),
      evidence: ['Access control matrix', 'Audit logs', 'Physical security review'],
      recommendations: [],
      responsible: 'Security Team'
    },
    {
      id: '2',
      framework: 'GDPR',
      control: 'Article 25 - Data Protection by Design',
      description: 'Implement appropriate technical and organizational measures to ensure data protection',
      status: 'partially_compliant',
      lastAssessed: new Date('2024-12-10'),
      evidence: ['Privacy impact assessment', 'Data mapping'],
      recommendations: [
        'Implement additional encryption for personal data',
        'Update data retention policies',
        'Enhance consent management'
      ],
      responsible: 'Privacy Officer',
      dueDate: new Date('2025-01-31')
    },
    {
      id: '3',
      framework: 'ISO27001',
      control: 'A.9.2 - User Access Management',
      description: 'Ensure authorized user access and prevent unauthorized access',
      status: 'non_compliant',
      lastAssessed: new Date('2024-12-05'),
      evidence: [],
      recommendations: [
        'Implement automated user provisioning',
        'Regular access reviews',
        'Multi-factor authentication for all users'
      ],
      responsible: 'IT Security',
      dueDate: new Date('2025-02-15')
    }
  ])

  const [vulnerabilities] = useState<VulnerabilityAssessment[]>([
    {
      id: '1',
      type: 'application',
      severity: 'critical',
      title: 'SQL Injection in User Registration',
      description: 'Input validation bypass allowing SQL injection attacks',
      cve: 'CVE-2024-12345',
      cvss: 9.8,
      affectedComponent: 'User Registration Service',
      discoveredAt: new Date('2024-12-20'),
      status: 'in_progress',
      assignee: 'dev-team@company.com',
      remediationSteps: [
        'Implement parameterized queries',
        'Add input validation',
        'Update ORM framework',
        'Conduct security testing'
      ],
      estimatedEffort: '3 days'
    },
    {
      id: '2',
      type: 'infrastructure',
      severity: 'high',
      title: 'Outdated OpenSSL Version',
      description: 'Server running vulnerable OpenSSL version susceptible to remote code execution',
      cve: 'CVE-2024-67890',
      cvss: 7.5,
      affectedComponent: 'Web Server (nginx)',
      discoveredAt: new Date('2024-12-18'),
      status: 'open',
      remediationSteps: [
        'Update OpenSSL to latest version',
        'Restart affected services',
        'Verify patch installation'
      ],
      estimatedEffort: '1 day'
    },
    {
      id: '3',
      type: 'dependency',
      severity: 'medium',
      title: 'Vulnerable npm Package',
      description: 'Third-party package with known security vulnerability',
      affectedComponent: 'Frontend Dependencies',
      discoveredAt: new Date('2024-12-22'),
      status: 'open',
      remediationSteps: [
        'Update package to secure version',
        'Review package dependencies',
        'Run security audit'
      ],
      estimatedEffort: '2 hours'
    }
  ])

  const [accessControls] = useState<AccessControl[]>([
    {
      id: '1',
      type: 'user',
      subject: 'john.doe@company.com',
      permissions: ['read:projects', 'write:projects', 'read:analytics'],
      resources: ['Project Dashboard', 'Analytics API'],
      conditions: {
        ipWhitelist: ['192.168.1.0/24'],
        mfaRequired: true,
        sessionTimeout: 480
      },
      status: 'active',
      createdAt: new Date('2024-12-01'),
      lastUsed: new Date('2024-12-24'),
      createdBy: 'admin@company.com'
    },
    {
      id: '2',
      type: 'service',
      subject: 'analytics-service',
      permissions: ['read:all_data', 'write:analytics'],
      resources: ['Database', 'Analytics Engine'],
      conditions: {
        ipWhitelist: ['10.0.0.100'],
        sessionTimeout: 1440
      },
      status: 'active',
      createdAt: new Date('2024-11-15'),
      lastUsed: new Date('2024-12-25'),
      createdBy: 'system'
    },
    {
      id: '3',
      type: 'api',
      subject: 'mobile-app-api',
      permissions: ['read:public_data', 'write:user_data'],
      resources: ['Public API', 'User Service'],
      conditions: {
        mfaRequired: false,
        sessionTimeout: 60
      },
      status: 'suspended',
      createdAt: new Date('2024-10-01'),
      createdBy: 'api-admin@company.com'
    }
  ])

  const handleEventAction = (action: string, eventId: string) => {
    console.log('Security event action:', action, eventId)
  }

  const handleVulnerabilityAction = (action: string, vulnId: string) => {
    console.log('Vulnerability action:', action, vulnId)
  }

  const handleAccessAction = (action: string, accessId: string) => {
    console.log('Access control action:', action, accessId)
  }

  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length
  const openVulnerabilities = vulnerabilities.filter(v => v.status === 'open').length
  const complianceScore = Math.round((complianceChecks.filter(c => c.status === 'compliant').length / complianceChecks.length) * 100)
  const activeAccess = accessControls.filter(a => a.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Enterprise Security</h2>
          <p className="text-white/60">Advanced security monitoring and compliance management</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Security Report
          </SimpleButton>
          <SimpleButton variant="outline">
            <Scan className="w-4 h-4 mr-2" />
            Run Scan
          </SimpleButton>
          <SimpleButton>
            <Shield className="w-4 h-4 mr-2" />
            Security Center
          </SimpleButton>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard className="border-red-500/30 bg-red-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-400">{criticalEvents}</div>
              <div className="text-white/60 text-sm">Critical Events</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard className="border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-400">{openVulnerabilities}</div>
              <div className="text-white/60 text-sm">Open Vulnerabilities</div>
            </div>
            <Bug className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard className="border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">{complianceScore}%</div>
              <div className="text-white/60 text-sm">Compliance Score</div>
            </div>
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard className="border-green-500/30 bg-green-500/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">{activeAccess}</div>
              <div className="text-white/60 text-sm">Active Access</div>
            </div>
            <Key className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
          { id: 'events', label: 'Security Events', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <Bug className="w-4 h-4" /> },
          { id: 'access', label: 'Access Control', icon: <Key className="w-4 h-4" /> },
          { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Security Posture</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Overall Security Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-white font-medium">75/100</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80">Patch Management</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-yellow-400">60%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80">Access Management</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
                  </div>
                  <span className="text-green-400">90%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80">Monitoring Coverage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-blue-400">85%</span>
                </div>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Threats</h3>
            <div className="space-y-3">
              {securityEvents.slice(0, 4).map(event => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded">
                  <div className={`w-2 h-2 rounded-full ${
                    event.severity === 'critical' ? 'bg-red-400' :
                    event.severity === 'high' ? 'bg-orange-400' :
                    event.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <div className="text-white/80 text-sm font-medium">{event.title}</div>
                    <div className="text-white/60 text-xs">{event.timestamp.toLocaleString()}</div>
                  </div>
                  <div className="text-white/40 text-xs">{event.severity}</div>
                </div>
              ))}
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Status</h3>
            <div className="space-y-4">
              {['SOC2', 'ISO27001', 'GDPR', 'HIPAA'].map(framework => {
                const check = complianceChecks.find(c => c.framework === framework)
                const status = check?.status || 'not_assessed'
                const color = status === 'compliant' ? 'text-green-400' :
                             status === 'non_compliant' ? 'text-red-400' :
                             status === 'partially_compliant' ? 'text-yellow-400' : 'text-gray-400'
                
                return (
                  <div key={framework} className="flex items-center justify-between">
                    <span className="text-white/80">{framework}</span>
                    <span className={`capitalize ${color}`}>{status.replace('_', ' ')}</span>
                  </div>
                )
              })}
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-4">
              {[
                { name: 'Firewall', status: 'operational', uptime: '99.9%' },
                { name: 'IDS/IPS', status: 'operational', uptime: '99.7%' },
                { name: 'SIEM', status: 'operational', uptime: '99.8%' },
                { name: 'Backup Systems', status: 'warning', uptime: '98.5%' }
              ].map(system => (
                <div key={system.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      system.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-white/80">{system.name}</span>
                  </div>
                  <span className="text-white/60 text-sm">{system.uptime}</span>
                </div>
              ))}
            </div>
          </SimpleCard>
        </div>
      )}

      {selectedTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search security events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all" className="bg-gray-900">All Severities</option>
                <option value="critical" className="bg-gray-900">Critical</option>
                <option value="high" className="bg-gray-900">High</option>
                <option value="medium" className="bg-gray-900">Medium</option>
                <option value="low" className="bg-gray-900">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all" className="bg-gray-900">All Status</option>
                <option value="active" className="bg-gray-900">Active</option>
                <option value="investigating" className="bg-gray-900">Investigating</option>
                <option value="resolved" className="bg-gray-900">Resolved</option>
                <option value="false_positive" className="bg-gray-900">False Positive</option>
              </select>
            </div>

            <SimpleButton>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert Rule
            </SimpleButton>
          </div>

          <div className="space-y-4">
            {securityEvents.map(event => (
              <SecurityEventCard
                key={event.id}
                event={event}
                onAction={handleEventAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'compliance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Compliance Frameworks</h3>
            <div className="flex items-center space-x-3">
              <SimpleButton variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </SimpleButton>
              <SimpleButton>
                <Plus className="w-4 h-4 mr-2" />
                Add Assessment
              </SimpleButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceChecks.map(check => (
              <ComplianceCheckCard key={check.id} check={check} />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'vulnerabilities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Vulnerability Assessment</h3>
            <div className="flex items-center space-x-3">
              <SimpleButton variant="outline">
                <Scan className="w-4 h-4 mr-2" />
                Run Scan
              </SimpleButton>
              <SimpleButton>
                <Upload className="w-4 h-4 mr-2" />
                Import Results
              </SimpleButton>
            </div>
          </div>

          <div className="space-y-4">
            {vulnerabilities.map(vulnerability => (
              <VulnerabilityCard
                key={vulnerability.id}
                vulnerability={vulnerability}
                onAction={handleVulnerabilityAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'access' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Access Control Management</h3>
            <div className="flex items-center space-x-3">
              <SimpleButton variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Directory
              </SimpleButton>
              <SimpleButton>
                <Plus className="w-4 h-4 mr-2" />
                Grant Access
              </SimpleButton>
            </div>
          </div>

          <div className="space-y-4">
            {accessControls.map(access => (
              <AccessControlCard
                key={access.id}
                access={access}
                onAction={handleAccessAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Real-time Monitoring</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Network Traffic</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400">Normal</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80">Authentication Events</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-400">Elevated</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80">Data Access</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400">Normal</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80">System Resources</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400">Optimal</span>
                </div>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Alert Configuration</h3>
            <div className="space-y-3">
              {[
                { rule: 'Failed Login Threshold', status: 'enabled', trigger: '5 attempts' },
                { rule: 'Data Export Volume', status: 'enabled', trigger: '> 1GB' },
                { rule: 'Privilege Escalation', status: 'enabled', trigger: 'Any' },
                { rule: 'Off-hours Access', status: 'disabled', trigger: '18:00-06:00' }
              ].map(alert => (
                <div key={alert.rule} className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div>
                    <div className="text-white/80 text-sm">{alert.rule}</div>
                    <div className="text-white/40 text-xs">Trigger: {alert.trigger}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    alert.status === 'enabled' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {alert.status}
                  </div>
                </div>
              ))}
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Security Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Threat Detection Rate</span>
                  <span className="text-white font-medium">98.7%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.7%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Mean Time to Detection</span>
                  <span className="text-white font-medium">4.2 min</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Mean Time to Response</span>
                  <span className="text-white font-medium">12.8 min</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Integration Status</h3>
            <div className="space-y-3">
              {[
                { service: 'SIEM Platform', status: 'connected', health: 'healthy' },
                { service: 'Threat Intelligence', status: 'connected', health: 'healthy' },
                { service: 'Identity Provider', status: 'connected', health: 'warning' },
                { service: 'Backup System', status: 'disconnected', health: 'error' }
              ].map(integration => (
                <div key={integration.service} className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      integration.health === 'healthy' ? 'bg-green-400' :
                      integration.health === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-white/80 text-sm">{integration.service}</span>
                  </div>
                  <span className={`text-xs capitalize ${
                    integration.status === 'connected' ? 'text-green-400' :
                    integration.status === 'disconnected' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </SimpleCard>
        </div>
      )}
    </div>
  )
}