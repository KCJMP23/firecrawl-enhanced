'use client'

import { useState, useEffect } from 'react'
import { 
  Database, 
  Cloud, 
  Zap, 
  DollarSign, 
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Settings,
  CreditCard,
  Sparkles,
  Server,
  Link2,
  Shield,
  Layers,
  GitBranch,
  Table,
  Code2,
  FileJson,
  Download,
  Upload,
  RefreshCw,
  Gauge
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BackendProvider, PlanType, DATABASE_TEMPLATES, BackendHub, DatabaseSchema } from '@/lib/backend-hub'

// Provider configurations
const PROVIDERS = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Open source Firebase alternative with Postgres',
    icon: '🔥',
    color: 'from-green-500 to-emerald-600',
    features: ['PostgreSQL', 'Real-time', 'Auth', 'Storage', 'Edge Functions'],
    freeCredits: 50,
    recommended: true
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google\'s app development platform',
    icon: '🔶',
    color: 'from-orange-500 to-amber-600',
    features: ['NoSQL', 'Real-time', 'Auth', 'Hosting', 'Functions'],
    freeCredits: 50
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Serverless Postgres with branching',
    icon: '⚡',
    color: 'from-purple-500 to-violet-600',
    features: ['PostgreSQL', 'Branching', 'Serverless', 'Auto-scaling'],
    freeCredits: 50
  },
  {
    id: 'planetscale',
    name: 'PlanetScale',
    description: 'MySQL-compatible serverless database',
    icon: '🪐',
    color: 'from-blue-500 to-indigo-600',
    features: ['MySQL', 'Branching', 'Serverless', 'Global'],
    freeCredits: 50
  },
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    description: 'NoSQL document database',
    icon: '🍃',
    color: 'from-green-600 to-lime-600',
    features: ['NoSQL', 'Flexible Schema', 'Global', 'Search'],
    freeCredits: 50
  }
]

// Pricing plans
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    credits: 0,
    features: [
      'Basic backend connections',
      'Manual configuration',
      'Community support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    credits: 50,
    popular: true,
    features: [
      '$50 backend credits included',
      'Auto-provisioning',
      'Schema templates',
      'Migration tools',
      'Priority support'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    credits: 150,
    features: [
      '$150 backend credits included',
      'All providers',
      'Custom schemas',
      'Data migration',
      'White-label options',
      'Dedicated support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    credits: -1,
    features: [
      'Unlimited credits',
      'Custom infrastructure',
      'SLA guarantees',
      'Training & onboarding'
    ]
  }
]

interface BackendIntegrationHubProps {
  currentPlan?: PlanType
  onPlanUpgrade?: (plan: PlanType) => void
}

export default function BackendIntegrationHub({ 
  currentPlan = 'starter',
  onPlanUpgrade 
}: BackendIntegrationHubProps) {
  const [selectedProvider, setSelectedProvider] = useState<BackendProvider>('supabase')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof DATABASE_TEMPLATES>('saas')
  const [projectName, setProjectName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [creditUsage, setCreditUsage] = useState<Map<string, number>>(new Map())
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [generatedSchema, setGeneratedSchema] = useState<DatabaseSchema | null>(null)
  const [backendHub] = useState(() => new BackendHub(currentPlan))

  // Get available credits for current plan
  const getAvailableCredits = (provider: BackendProvider): number => {
    const plan = PLANS.find(p => p.id === currentPlan)
    if (!plan) return 0
    if (plan.credits === -1) return -1 // Unlimited
    
    const used = creditUsage.get(provider) || 0
    return Math.max(0, plan.credits - used)
  }

  // Auto-provision backend
  const handleAutoProvision = async () => {
    if (currentPlan === 'starter') {
      setShowUpgradeModal(true)
      return
    }

    setIsProvisioning(true)
    setConnectionStatus('connecting')

    try {
      // Provision Supabase with bundled credits
      const config = await backendHub.provisionSupabase(projectName || 'webclone-project')
      
      setProjectUrl(config.projectUrl || '')
      setApiKey(config.apiKey || '')
      
      // Generate and apply schema
      const schema = backendHub.generateSchema(selectedTemplate)
      setGeneratedSchema(schema)
      await backendHub.applySchema(schema)
      
      setConnectionStatus('connected')
      
      // Track credit usage
      const newUsage = new Map(creditUsage)
      newUsage.set(selectedProvider, (creditUsage.get(selectedProvider) || 0) + 1)
      setCreditUsage(newUsage)
    } catch (error) {
      console.error('Provisioning failed:', error)
      setConnectionStatus('disconnected')
    } finally {
      setIsProvisioning(false)
    }
  }

  // Manual connection
  const handleManualConnect = async () => {
    setConnectionStatus('connecting')

    try {
      const success = await backendHub.connectBackend({
        provider: selectedProvider,
        projectUrl,
        apiKey
      })

      if (success) {
        setConnectionStatus('connected')
        
        // Apply selected template schema if connected
        if (selectedTemplate) {
          const schema = backendHub.generateSchema(selectedTemplate)
          setGeneratedSchema(schema)
          await backendHub.applySchema(schema)
        }
      } else {
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Connection failed:', error)
      setConnectionStatus('disconnected')
    }
  }

  // Export schema as SQL
  const exportSchema = () => {
    if (!generatedSchema) return

    const sql = generatedSchema.tables.map(table => {
      const columns = table.columns.map(col => {
        let def = `  ${col.name} ${col.type}`
        if (!col.nullable) def += ' NOT NULL'
        if (col.defaultValue !== undefined) def += ` DEFAULT ${col.defaultValue}`
        return def
      }).join(',\n')

      return `CREATE TABLE ${table.name} (\n${columns}\n);`
    }).join('\n\n')

    const blob = new Blob([sql], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTemplate}-schema.sql`
    a.click()
  }

  const currentPlanData = PLANS.find(p => p.id === currentPlan)

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header with Credit Display */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Backend Integration Hub
            </h1>
            <p className="text-gray-400">
              Connect your database with bundled credits - no separate billing required
            </p>
          </div>
          
          {/* Credit Display */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Available Credits</p>
                <p className="text-2xl font-bold text-white">
                  {currentPlanData?.credits === -1 ? '∞' : `$${currentPlanData?.credits || 0}`}
                  <span className="text-sm text-gray-400 ml-2">/month</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30">
          <Sparkles className="w-4 h-4 text-green-400 mr-2" />
          <span className="text-sm font-medium text-white">
            {currentPlanData?.name} Plan
          </span>
          {currentPlan === 'starter' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="ml-3 text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              Upgrade for credits →
            </button>
          )}
        </div>
      </div>

      {/* Provider Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Choose Your Backend Provider</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map((provider) => {
            const credits = getAvailableCredits(provider.id as BackendProvider)
            const isSelected = selectedProvider === provider.id
            
            return (
              <motion.div
                key={provider.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setSelectedProvider(provider.id as BackendProvider)}
                  className={`relative w-full p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {provider.recommended && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                      <span className="text-xs font-bold text-white">RECOMMENDED</span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{provider.icon}</span>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                        <p className="text-xs text-gray-400">{provider.description}</p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="w-6 h-6 text-blue-400" />
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {provider.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Credits */}
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">With your plan:</span>
                        <span className={`text-sm font-bold ${
                          credits > 0 || credits === -1 ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {credits === -1 ? 'Unlimited' : credits > 0 ? `$${credits} credits` : 'Upgrade required'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Connection Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Auto-Provision */}
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-blue-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Auto-Provision (Recommended)</h3>
          </div>
          
          <p className="text-gray-400 mb-6">
            Let us automatically set up and configure your backend with optimal settings
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Database Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as keyof typeof DATABASE_TEMPLATES)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {Object.entries(DATABASE_TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>{template.name} - {template.description}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAutoProvision}
              disabled={isProvisioning || (currentPlan === 'starter' && selectedProvider !== 'custom')}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
                isProvisioning || (currentPlan === 'starter' && selectedProvider !== 'custom')
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isProvisioning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Provisioning...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Auto-Provision & Configure
                </>
              )}
            </button>

            {currentPlan === 'starter' && (
              <p className="text-xs text-orange-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Upgrade to Pro for auto-provisioning with credits
              </p>
            )}
          </div>
        </div>

        {/* Manual Connection */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-gray-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Manual Connection</h3>
          </div>
          
          <p className="text-gray-400 mb-6">
            Connect to an existing backend with your own credentials
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project URL
              </label>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="your-api-key"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleManualConnect}
              disabled={!projectUrl || !apiKey}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
                !projectUrl || !apiKey
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Link2 className="w-5 h-5 mr-2" />
              Connect Manually
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'disconnected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-6 rounded-xl border-2 ${
            connectionStatus === 'connected'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {connectionStatus === 'connected' ? (
                <Check className="w-6 h-6 text-green-400 mr-3" />
              ) : (
                <Loader2 className="w-6 h-6 text-yellow-400 mr-3 animate-spin" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {connectionStatus === 'connected' ? 'Connected Successfully' : 'Connecting...'}
                </h3>
                <p className="text-sm text-gray-400">
                  {connectionStatus === 'connected' 
                    ? `Your ${selectedProvider} backend is ready to use`
                    : 'Setting up your backend connection'
                  }
                </p>
              </div>
            </div>

            {connectionStatus === 'connected' && generatedSchema && (
              <button
                onClick={exportSchema}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Schema
              </button>
            )}
          </div>

          {/* Schema Preview */}
          {connectionStatus === 'connected' && generatedSchema && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Generated Schema</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {generatedSchema.tables.map((table) => (
                  <div key={table.name} className="px-3 py-2 bg-white/5 rounded-lg">
                    <div className="flex items-center">
                      <Table className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm text-white font-medium">{table.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {table.columns.length} columns
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full border border-white/10"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Unlock Backend Credits
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.slice(1).map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-xl border-2 ${
                      plan.popular
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                        <span className="text-xs font-bold text-white">MOST POPULAR</span>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline">
                        {typeof plan.price === 'number' ? (
                          <>
                            <span className="text-3xl font-bold text-white">${plan.price}</span>
                            <span className="text-gray-400 ml-2">/month</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-white">{plan.price}</span>
                        )}
                      </div>
                      {plan.credits > 0 && (
                        <div className="mt-2 px-3 py-1 bg-green-500/20 rounded-lg inline-block">
                          <span className="text-green-400 font-bold">
                            ${plan.credits} backend credits included
                          </span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        onPlanUpgrade?.(plan.id as PlanType)
                        setShowUpgradeModal(false)
                      }}
                      className={`w-full py-3 rounded-lg font-medium transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}