'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Star,
  Crown,
  Shield,
  Infinity,
  Package,
  Receipt,
  Download,
  Eye,
  Edit3,
  RefreshCw,
  Plus,
  Trash2,
  MoreHorizontal,
  Settings,
  Bell,
  BellOff,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Cloud,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Award,
  Gift,
  Percent,
  Calculator,
  FileText,
  ExternalLink,
  Copy,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
    currency: string
  }
  features: {
    name: string
    included: boolean
    limit?: number | 'unlimited'
    description?: string
  }[]
  limits: {
    projects: number | 'unlimited'
    templates: number | 'unlimited'
    collaborators: number | 'unlimited'
    storage: string
    apiCalls: number | 'unlimited'
    bandwidthGb: number | 'unlimited'
  }
  popular?: boolean
  enterprise?: boolean
  icon: React.ReactNode
  color: string
}

interface Subscription {
  id: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  billingCycle: 'monthly' | 'yearly'
  price: number
  currency: string
  nextBillingDate: Date
  usage: {
    projects: number
    storage: number
    apiCalls: number
    bandwidth: number
    collaborators: number
  }
}

interface Invoice {
  id: string
  number: string
  status: 'paid' | 'pending' | 'failed' | 'draft'
  amount: number
  currency: string
  date: Date
  dueDate: Date
  paidDate?: Date
  description: string
  items: {
    description: string
    quantity: number
    unitAmount: number
    totalAmount: number
  }[]
  paymentMethod: string
  downloadUrl: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'paypal'
  brand?: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  bankName?: string
  accountLast4?: string
  email?: string
  isDefault: boolean
  createdAt: Date
  status: 'active' | 'expired' | 'requires_action'
}

interface UsageMetric {
  name: string
  current: number
  limit: number | 'unlimited'
  percentage: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  unit: string
  icon: React.ReactNode
  color: string
}



function PlanCard({ plan, currentPlanId, isYearly, onSelect }: {
  plan: SubscriptionPlan
  currentPlanId?: string
  isYearly: boolean
  onSelect: (planId: string) => void
}) {
  const price = isYearly ? plan.price.yearly : plan.price.monthly
  const yearlyDiscount = plan.price.monthly > 0 ? Math.round((1 - plan.price.yearly / (plan.price.monthly * 12)) * 100) : 0
  const isCurrent = currentPlanId === plan.id

  return (
    <div className={`relative rounded-lg border transition-all ${
      plan.popular 
        ? 'border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-purple-500/10 shadow-lg' 
        : 'border-white/10 bg-white/5 hover:border-white/20'
    } ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color}`}>
            <div className="text-white">
              {plan.icon}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <p className="text-white/60 text-sm">{plan.description}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">
              ${price.toLocaleString()}
            </span>
            <span className="text-white/60">
              /{isYearly ? 'year' : 'month'}
            </span>
          </div>
          {isYearly && yearlyDiscount > 0 && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-green-400 text-sm">Save {yearlyDiscount}%</span>
              <span className="text-white/40 text-sm line-through">
                ${(plan.price.monthly * 12).toLocaleString()}/year
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {plan.features.slice(0, 6).map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              {feature.included ? (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span className={`text-sm ${feature.included ? 'text-white/80' : 'text-white/40'}`}>
                {feature.name}
                {feature.limit && feature.limit !== 'unlimited' && (
                  <span className="text-white/60"> ({feature.limit})</span>
                )}
                {feature.limit === 'unlimited' && (
                  <span className="text-blue-400"> (Unlimited)</span>
                )}
              </span>
            </div>
          ))}
          
          {plan.features.length > 6 && (
            <div className="text-white/60 text-xs">
              +{plan.features.length - 6} more features
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-white/60 mb-6">
          <div>Projects: {plan.limits.projects === 'unlimited' ? '∞' : plan.limits.projects}</div>
          <div>Storage: {plan.limits.storage}</div>
          <div>Collaborators: {plan.limits.collaborators === 'unlimited' ? '∞' : plan.limits.collaborators}</div>
          <div>API Calls: {plan.limits.apiCalls === 'unlimited' ? '∞' : `${plan.limits.apiCalls?.toLocaleString()}`}</div>
        </div>

        <SimpleButton
          className="w-full"
          variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
          onClick={() => onSelect(plan.id)}
          disabled={isCurrent}
        >
          {isCurrent ? 'Current Plan' : plan.enterprise ? 'Contact Sales' : 'Upgrade Now'}
        </SimpleButton>
      </div>
    </div>
  )
}

function UsageCard({ metric }: { metric: UsageMetric }) {
  const getPercentageColor = () => {
    if (metric.percentage >= 90) return 'text-red-400'
    if (metric.percentage >= 70) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getProgressColor = () => {
    if (metric.percentage >= 90) return 'bg-red-500'
    if (metric.percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTrendIcon = () => {
    if (metric.trend === 'up') return <TrendingUp className="w-3 h-3 text-red-400" />
    if (metric.trend === 'down') return <TrendingDown className="w-3 h-3 text-green-400" />
    return <div className="w-3 h-3" />
  }

  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
          <div className="text-white">
            {metric.icon}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className={`text-xs ${
            metric.trend === 'up' ? 'text-red-400' : 
            metric.trend === 'down' ? 'text-green-400' : 'text-white/60'
          }`}>
            {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}{metric.trendValue}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">{metric.name}</span>
          <span className={`font-medium ${getPercentageColor()}`}>
            {metric.percentage}%
          </span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(metric.percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-white/60">
          <span>{metric.current.toLocaleString()} {metric.unit}</span>
          <span>
            {metric.limit === 'unlimited' ? '∞' : `${metric.limit.toLocaleString()} ${metric.unit}`}
          </span>
        </div>
      </div>
    </SimpleCard>
  )
}

function InvoiceCard({ invoice, onAction }: {
  invoice: Invoice
  onAction: (action: string, invoiceId: string) => void
}) {
  const getStatusColor = () => {
    switch (invoice.status) {
      case 'paid': return 'text-green-400 bg-green-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'failed': return 'text-red-400 bg-red-400/20'
      case 'draft': return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
      case 'draft': return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">#{invoice.number}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-white/60 text-sm">{invoice.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-white font-medium">
            ${invoice.amount.toLocaleString()} {invoice.currency.toUpperCase()}
          </div>
          <div className="text-white/60 text-xs">
            {invoice.date.toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <div className="text-white/60 text-xs mb-1">Issue Date</div>
          <div className="text-white/80">{invoice.date.toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Due Date</div>
          <div className="text-white/80">{invoice.dueDate.toLocaleDateString()}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Payment Method</div>
          <div className="text-white/80">{invoice.paymentMethod}</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <SimpleButton variant="outline" size="sm" onClick={() => onAction('download', invoice.id)}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </SimpleButton>
        <SimpleButton variant="outline" size="sm" onClick={() => onAction('view', invoice.id)}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </SimpleButton>
        {invoice.status === 'failed' && (
          <SimpleButton size="sm" onClick={() => onAction('retry', invoice.id)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Payment
          </SimpleButton>
        )}
      </div>
    </div>
  )
}

function PaymentMethodCard({ method, onAction }: {
  method: PaymentMethod
  onAction: (action: string, methodId: string) => void
}) {
  const getTypeIcon = () => {
    switch (method.type) {
      case 'card': return <CreditCard className="w-4 h-4" />
      case 'bank': return <Database className="w-4 h-4" />
      case 'paypal': return <Globe className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    switch (method.status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'expired': return 'text-red-400 bg-red-400/20'
      case 'requires_action': return 'text-yellow-400 bg-yellow-400/20'
    }
  }

  const getDisplayInfo = () => {
    switch (method.type) {
      case 'card':
        return `${method.brand?.toUpperCase()} •••• ${method.last4}`
      case 'bank':
        return `${method.bankName} •••• ${method.accountLast4}`
      case 'paypal':
        return method.email
    }
  }

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-blue-500/20">
            <div className="text-blue-400">
              {getTypeIcon()}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">{getDisplayInfo()}</span>
              {method.isDefault && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  Default
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                {method.status.replace('_', ' ')}
              </span>
              {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                <span className="text-white/60 text-xs">
                  Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!method.isDefault && (
            <SimpleButton variant="outline" size="sm" onClick={() => onAction('set_default', method.id)}>
              Set Default
            </SimpleButton>
          )}
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('edit', method.id)}
                >
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  Edit Details
                </button>
                {method.status === 'requires_action' && (
                  <button 
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                    onClick={() => onAction('verify', method.id)}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Verify
                  </button>
                )}
                <div className="border-t border-white/10 my-1" />
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-red-400"
                  onClick={() => onAction('remove', method.id)}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-white/60">
        Added {method.createdAt.toLocaleDateString()}
      </div>
    </div>
  )
}

export default function BillingSubscriptionManagement() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'plans' | 'usage' | 'invoices' | 'payment'>('overview')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showCancelModal, setShowCancelModal] = useState(false)

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      price: { monthly: 29, yearly: 290, currency: 'USD' },
      features: [
        { name: 'Project Creation', included: true, limit: 10 },
        { name: 'Template Library', included: true, limit: 50 },
        { name: 'Basic Analytics', included: true },
        { name: 'Email Support', included: true },
        { name: 'Version Control', included: true },
        { name: 'API Access', included: false },
        { name: 'White Label', included: false },
        { name: 'Priority Support', included: false }
      ],
      limits: {
        projects: 10,
        templates: 50,
        collaborators: 2,
        storage: '10 GB',
        apiCalls: 1000,
        bandwidthGb: 100
      },
      icon: <Package className="w-6 h-6" />,
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing teams and businesses',
      price: { monthly: 99, yearly: 990, currency: 'USD' },
      features: [
        { name: 'Project Creation', included: true, limit: 50 },
        { name: 'Template Library', included: true, limit: 200 },
        { name: 'Advanced Analytics', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Version Control', included: true },
        { name: 'API Access', included: true, limit: 10000 },
        { name: 'Team Collaboration', included: true },
        { name: 'White Label', included: false }
      ],
      limits: {
        projects: 50,
        templates: 200,
        collaborators: 10,
        storage: '100 GB',
        apiCalls: 10000,
        bandwidthGb: 1000
      },
      popular: true,
      icon: <Star className="w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For larger teams with advanced needs',
      price: { monthly: 299, yearly: 2990, currency: 'USD' },
      features: [
        { name: 'Project Creation', included: true, limit: 'unlimited' },
        { name: 'Template Library', included: true, limit: 'unlimited' },
        { name: 'Enterprise Analytics', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Version Control', included: true },
        { name: 'API Access', included: true, limit: 100000 },
        { name: 'Team Collaboration', included: true },
        { name: 'White Label', included: true }
      ],
      limits: {
        projects: 'unlimited',
        templates: 'unlimited',
        collaborators: 50,
        storage: '1 TB',
        apiCalls: 100000,
        bandwidthGb: 10000
      },
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: { monthly: 0, yearly: 0, currency: 'USD' },
      features: [
        { name: 'Everything in Business', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'Dedicated Support', included: true },
        { name: 'SLA Guarantees', included: true },
        { name: 'SSO/SAML', included: true },
        { name: 'Advanced Security', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'On-premise Deployment', included: true }
      ],
      limits: {
        projects: 'unlimited',
        templates: 'unlimited',
        collaborators: 'unlimited',
        storage: 'Unlimited',
        apiCalls: 'unlimited',
        bandwidthGb: 'unlimited'
      },
      enterprise: true,
      icon: <Shield className="w-6 h-6" />,
      color: 'from-yellow-500/20 to-yellow-600/20'
    }
  ]

  const currentSubscription: Subscription = {
    id: 'sub_12345',
    planId: 'pro',
    status: 'active',
    currentPeriodStart: new Date('2024-12-01'),
    currentPeriodEnd: new Date('2025-01-01'),
    cancelAtPeriodEnd: false,
    billingCycle: 'monthly',
    price: 99,
    currency: 'USD',
    nextBillingDate: new Date('2025-01-01'),
    usage: {
      projects: 23,
      storage: 45,
      apiCalls: 7834,
      bandwidth: 567,
      collaborators: 6
    }
  }

  const usageMetrics: UsageMetric[] = [
    {
      name: 'Projects',
      current: currentSubscription.usage.projects,
      limit: 50,
      percentage: (currentSubscription.usage.projects / 50) * 100,
      trend: 'up',
      trendValue: 15,
      unit: 'projects',
      icon: <Package className="w-4 h-4" />,
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      name: 'Storage',
      current: currentSubscription.usage.storage,
      limit: 100,
      percentage: (currentSubscription.usage.storage / 100) * 100,
      trend: 'up',
      trendValue: 8,
      unit: 'GB',
      icon: <Database className="w-4 h-4" />,
      color: 'from-green-500/20 to-green-600/20'
    },
    {
      name: 'API Calls',
      current: currentSubscription.usage.apiCalls,
      limit: 10000,
      percentage: (currentSubscription.usage.apiCalls / 10000) * 100,
      trend: 'down',
      trendValue: 5,
      unit: 'calls',
      icon: <Zap className="w-4 h-4" />,
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      name: 'Bandwidth',
      current: currentSubscription.usage.bandwidth,
      limit: 1000,
      percentage: (currentSubscription.usage.bandwidth / 1000) * 100,
      trend: 'stable',
      trendValue: 0,
      unit: 'GB',
      icon: <Activity className="w-4 h-4" />,
      color: 'from-yellow-500/20 to-yellow-600/20'
    },
    {
      name: 'Collaborators',
      current: currentSubscription.usage.collaborators,
      limit: 10,
      percentage: (currentSubscription.usage.collaborators / 10) * 100,
      trend: 'up',
      trendValue: 20,
      unit: 'users',
      icon: <Users className="w-4 h-4" />,
      color: 'from-red-500/20 to-red-600/20'
    }
  ]

  const recentInvoices: Invoice[] = [
    {
      id: 'inv_001',
      number: 'WCP-2024-001',
      status: 'paid',
      amount: 99,
      currency: 'USD',
      date: new Date('2024-12-01'),
      dueDate: new Date('2024-12-01'),
      paidDate: new Date('2024-12-01'),
      description: 'Pro Plan - Monthly Subscription',
      items: [
        { description: 'Pro Plan (Dec 2024)', quantity: 1, unitAmount: 99, totalAmount: 99 }
      ],
      paymentMethod: 'Visa •••• 4242',
      downloadUrl: '/invoices/001.pdf'
    },
    {
      id: 'inv_002',
      number: 'WCP-2024-002',
      status: 'paid',
      amount: 99,
      currency: 'USD',
      date: new Date('2024-11-01'),
      dueDate: new Date('2024-11-01'),
      paidDate: new Date('2024-11-01'),
      description: 'Pro Plan - Monthly Subscription',
      items: [
        { description: 'Pro Plan (Nov 2024)', quantity: 1, unitAmount: 99, totalAmount: 99 }
      ],
      paymentMethod: 'Visa •••• 4242',
      downloadUrl: '/invoices/002.pdf'
    },
    {
      id: 'inv_003',
      number: 'WCP-2024-003',
      status: 'pending',
      amount: 99,
      currency: 'USD',
      date: new Date('2025-01-01'),
      dueDate: new Date('2025-01-01'),
      description: 'Pro Plan - Monthly Subscription',
      items: [
        { description: 'Pro Plan (Jan 2025)', quantity: 1, unitAmount: 99, totalAmount: 99 }
      ],
      paymentMethod: 'Visa •••• 4242',
      downloadUrl: '/invoices/003.pdf'
    }
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pm_001',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      createdAt: new Date('2024-06-15'),
      status: 'active'
    },
    {
      id: 'pm_002',
      type: 'card',
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false,
      createdAt: new Date('2024-03-10'),
      status: 'expired'
    },
    {
      id: 'pm_003',
      type: 'paypal',
      email: 'user@example.com',
      isDefault: false,
      createdAt: new Date('2024-08-20'),
      status: 'active'
    }
  ]

  const handlePlanSelect = (planId: string) => {
    console.log('Plan selected:', planId)
  }

  const handleInvoiceAction = (action: string, invoiceId: string) => {
    console.log('Invoice action:', action, invoiceId)
  }

  const handlePaymentMethodAction = (action: string, methodId: string) => {
    console.log('Payment method action:', action, methodId)
  }

  const currentPlan = subscriptionPlans.find(plan => plan.id === currentSubscription.planId)
  const nextBillingAmount = currentSubscription.price
  const isYearly = billingCycle === 'yearly'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
          <p className="text-white/60">Manage your subscription, usage, and payment methods</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </SimpleButton>
          <SimpleButton>
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </SimpleButton>
        </div>
      </div>

      {/* Current Subscription Overview */}
      <SimpleCard className="border-blue-500/30 bg-blue-500/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${currentPlan?.color}`}>
              <div className="text-white">
                {currentPlan?.icon}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{currentPlan?.name} Plan</h3>
              <p className="text-white/60">{currentPlan?.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${nextBillingAmount}/{currentSubscription.billingCycle.slice(0, -2)}
            </div>
            <div className="text-white/60 text-sm">
              Next billing: {currentSubscription.nextBillingDate.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-white/80 text-sm">Active subscription</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-white/80 text-sm">
              Renews {currentSubscription.currentPeriodEnd.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span className="text-white/80 text-sm">Visa •••• 4242</span>
          </div>
        </div>
      </SimpleCard>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">${(nextBillingAmount * 12).toLocaleString()}</div>
              <div className="text-white/60 text-sm">Annual Cost</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{usageMetrics.length}</div>
              <div className="text-white/60 text-sm">Usage Metrics</div>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{recentInvoices.length}</div>
              <div className="text-white/60 text-sm">Total Invoices</div>
            </div>
            <Receipt className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{paymentMethods.filter(m => m.status === 'active').length}</div>
              <div className="text-white/60 text-sm">Payment Methods</div>
            </div>
            <CreditCard className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'plans', label: 'Plans', icon: <Package className="w-4 h-4" /> },
          { id: 'usage', label: 'Usage', icon: <Activity className="w-4 h-4" /> },
          { id: 'invoices', label: 'Invoices', icon: <Receipt className="w-4 h-4" /> },
          { id: 'payment', label: 'Payment Methods', icon: <CreditCard className="w-4 h-4" /> }
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
            <h3 className="text-lg font-semibold text-white mb-4">Usage Overview</h3>
            <div className="space-y-4">
              {usageMetrics.slice(0, 3).map(metric => (
                <div key={metric.name} className="flex items-center justify-between">
                  <span className="text-white/80">{metric.name}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.percentage >= 90 ? 'bg-red-500' :
                          metric.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-sm w-12 text-right">
                      {metric.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
            <div className="space-y-3">
              {recentInvoices.slice(0, 4).map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center space-x-3">
                    {invoice.status === 'paid' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    )}
                    <div>
                      <div className="text-white/80 text-sm">#{invoice.number}</div>
                      <div className="text-white/60 text-xs">{invoice.date.toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-white font-medium">
                    ${invoice.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <SimpleButton variant="outline" className="h-auto p-4 flex-col">
                <ArrowUpRight className="w-6 h-6 mb-2 text-blue-400" />
                <span className="text-sm">Upgrade Plan</span>
              </SimpleButton>
              <SimpleButton variant="outline" className="h-auto p-4 flex-col">
                <Download className="w-6 h-6 mb-2 text-green-400" />
                <span className="text-sm">Download Invoice</span>
              </SimpleButton>
              <SimpleButton variant="outline" className="h-auto p-4 flex-col">
                <CreditCard className="w-6 h-6 mb-2 text-purple-400" />
                <span className="text-sm">Update Payment</span>
              </SimpleButton>
              <SimpleButton variant="outline" className="h-auto p-4 flex-col">
                <Settings className="w-6 h-6 mb-2 text-yellow-400" />
                <span className="text-sm">Billing Settings</span>
              </SimpleButton>
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Subscription Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Auto-renewal</span>
                <button className="relative w-10 h-5 rounded-full bg-blue-500 transition-all">
                  <div className="absolute w-3 h-3 rounded-full bg-white top-1 left-6 transition-all" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Billing notifications</span>
                <button className="relative w-10 h-5 rounded-full bg-blue-500 transition-all">
                  <div className="absolute w-3 h-3 rounded-full bg-white top-1 left-6 transition-all" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Usage alerts</span>
                <button className="relative w-10 h-5 rounded-full bg-white/20 transition-all">
                  <div className="absolute w-3 h-3 rounded-full bg-white top-1 left-1 transition-all" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <SimpleButton 
                variant="danger" 
                className="w-full"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Subscription
              </SimpleButton>
            </div>
          </SimpleCard>
        </div>
      )}

      {selectedTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Choose Your Plan</h3>
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-2 rounded-md text-sm transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-2 rounded-md text-sm transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentPlanId={currentSubscription.planId}
                isYearly={isYearly}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'usage' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Current Usage</h3>
            <SimpleButton variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Usage
            </SimpleButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usageMetrics.map(metric => (
              <UsageCard key={metric.name} metric={metric} />
            ))}
          </div>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Usage Trends</h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <span className="text-white/60">Usage trend chart would render here</span>
            </div>
          </SimpleCard>
        </div>
      )}

      {selectedTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Billing History</h3>
            <div className="flex items-center space-x-3">
              <SimpleButton variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </SimpleButton>
              <select className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                <option value="all" className="bg-gray-900">All Invoices</option>
                <option value="paid" className="bg-gray-900">Paid</option>
                <option value="pending" className="bg-gray-900">Pending</option>
                <option value="failed" className="bg-gray-900">Failed</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {recentInvoices.map(invoice => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onAction={handleInvoiceAction}
              />
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'payment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
            <SimpleButton>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </SimpleButton>
          </div>

          <div className="space-y-4">
            {paymentMethods.map(method => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onAction={handlePaymentMethodAction}
              />
            ))}
          </div>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  placeholder="Your Company Inc."
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Tax ID</label>
                <input
                  type="text"
                  placeholder="123-45-6789"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white/80 text-sm font-medium mb-2">Billing Address</label>
                <textarea
                  rows={3}
                  placeholder="123 Main St, City, State 12345"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <SimpleButton>
                Save Changes
              </SimpleButton>
            </div>
          </SimpleCard>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Cancel Subscription</h3>
            <p className="text-white/70 mb-4">
              Are you sure you want to cancel your subscription? You'll continue to have access until {currentSubscription.currentPeriodEnd.toLocaleDateString()}.
            </p>
            <div className="flex items-center space-x-3">
              <SimpleButton
                variant="danger"
                onClick={() => {
                  console.log('Subscription cancelled')
                  setShowCancelModal(false)
                }}
              >
                Yes, Cancel
              </SimpleButton>
              <SimpleButton
                variant="outline"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Subscription
              </SimpleButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}