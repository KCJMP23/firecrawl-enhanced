'use client'

import { useState, useEffect } from 'react'
import {
  Globe,
  X,
  Rocket,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Key,
  CloudUpload,
  Loader2
} from 'lucide-react'

interface DeployDialogProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
}

interface DeploymentProvider {
  id: string
  name: string
  icon: string
  description: string
  requiresAuth: boolean
}

export default function DeployDialog({ projectId, projectName, isOpen, onClose }: DeployDialogProps) {
  const [providers, setProviders] = useState<DeploymentProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean
    url?: string
    error?: string
  } | null>(null)
  const [credentials, setCredentials] = useState({
    token: '',
    username: '',
    projectName: ''
  })
  const [step, setStep] = useState<'select' | 'configure' | 'deploying' | 'complete'>('select')

  useEffect(() => {
    if (isOpen) {
      fetchProviders()
    }
  }, [isOpen])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/deploy')
      const data = await response.json()
      setProviders(data.providers || [])
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    }
  }

  if (!isOpen) return null

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    const provider = providers.find(p => p.id === providerId)
    if (provider?.requiresAuth) {
      setStep('configure')
    } else {
      handleDeploy()
    }
  }

  const handleDeploy = async () => {
    setStep('deploying')
    setIsDeploying(true)
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          provider: selectedProvider,
          settings: credentials
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setDeploymentResult({
          success: true,
          url: data.deployment.url
        })
        setStep('complete')
      } else {
        throw new Error(data.error || 'Deployment failed')
      }
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed'
      })
      setStep('complete')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleReset = () => {
    setStep('select')
    setSelectedProvider('')
    setDeploymentResult(null)
    setCredentials({ token: '', username: '', projectName: '' })
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Deploy Project</h2>
            <p className="text-white/60">Deploy "{projectName}" to production</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Provider Selection */}
        {step === 'select' && (
          <>
            <div className="space-y-4 mb-8">
              {providers.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.id)}
                  className="w-full p-4 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 transition-all text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{provider.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-white/60">{provider.description}</p>
                    </div>
                    <Rocket className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Pro Tip</h4>
                  <p className="text-xs text-white/60">
                    Choose Vercel or Netlify for the best performance and easiest setup.
                    Both offer generous free tiers perfect for getting started.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Configuration */}
        {step === 'configure' && (
          <>
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  <Key className="w-4 h-4 inline mr-2" />
                  API Token
                </label>
                <input
                  type="password"
                  value={credentials.token}
                  onChange={(e) => setCredentials(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Enter your API token"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-white/40 mt-2">
                  You can find your API token in your provider's dashboard
                </p>
              </div>

              {selectedProvider === 'github-pages' && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="your-github-username"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  Project Name (optional)
                </label>
                <input
                  type="text"
                  value={credentials.projectName}
                  onChange={(e) => setCredentials(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder={projectName}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleDeploy}
                disabled={!credentials.token}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <CloudUpload className="w-5 h-5" />
                <span>Deploy Now</span>
              </button>
            </div>
          </>
        )}

        {/* Deploying */}
        {step === 'deploying' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 mb-6">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Deploying your project...</h3>
            <p className="text-white/60 mb-6">This may take a few moments</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-white/40">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Preparing files</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
              <span>Uploading</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></div>
              <span>Building</span>
            </div>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="text-center py-8">
            {deploymentResult?.success ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Deployment Successful!</h3>
                <p className="text-white/60 mb-6">Your project is now live</p>
                {deploymentResult.url && (
                  <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <p className="text-sm text-white/60 mb-2">Your deployment URL:</p>
                    <a
                      href={deploymentResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center justify-center space-x-2"
                    >
                      <span className="font-mono">{deploymentResult.url}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Deployment Failed</h3>
                <p className="text-white/60 mb-6">{deploymentResult?.error || 'An error occurred'}</p>
              </>
            )}
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}