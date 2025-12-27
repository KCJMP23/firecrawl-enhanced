'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Globe, 
  Sparkles, 
  Zap, 
  Settings, 
  ChevronDown,
  Info
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'



function SimpleInput({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  ...props
}: {
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  required?: boolean
  [key: string]: any
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full h-12 px-4 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-blue-500 backdrop-blur-sm ${className}`}
      {...props}
    />
  )
}

function SimpleTextarea({ 
  placeholder,
  value,
  onChange,
  className = '',
  rows = 3,
  ...props
}: {
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  rows?: number
  [key: string]: any
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-blue-500 backdrop-blur-sm resize-none ${className}`}
      {...props}
    />
  )
}

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    description: '',
    extractVideos: false,
    includeAssets: true,
    respectRobots: false,
    maxDepth: 2,
    waitTime: 1000,
    userAgent: 'WebClone Pro Bot'
  })
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url,
          name: formData.name,
          description: formData.description,
          settings: {
            extractVideos: formData.extractVideos,
            includeAssets: formData.includeAssets,
            respectRobots: formData.respectRobots,
            maxDepth: formData.maxDepth,
            waitTime: formData.waitTime,
            userAgent: formData.userAgent
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Redirect to dashboard with success message
        router.push(`/dashboard?success=Project "${formData.name}" created successfully!`)
      } else {
        throw new Error(result.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const presets = [
    {
      name: 'Marketing Landing Page',
      description: 'Perfect for marketing sites with animations',
      icon: <Sparkles className="w-5 h-5" />,
      settings: {
        extractVideos: false,
        includeAssets: true,
        maxDepth: 1,
        waitTime: 2000
      }
    },
    {
      name: 'E-commerce Store',
      description: 'Complete product pages and catalogs',
      icon: <Globe className="w-5 h-5" />,
      settings: {
        extractVideos: true,
        includeAssets: true,
        maxDepth: 3,
        waitTime: 1500
      }
    },
    {
      name: 'Documentation Site',
      description: 'Multi-page technical documentation',
      icon: <Zap className="w-5 h-5" />,
      settings: {
        extractVideos: false,
        includeAssets: false,
        maxDepth: 5,
        waitTime: 500
      }
    }
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    setFormData(prev => ({
      ...prev,
      ...preset.settings
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                WebClone Pro
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Clone Any Website</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Transform any website into your own with our AI-powered cloning engine. 
            Perfect 1:1 copies with all assets and animations preserved.
          </p>
        </div>

        {/* Presets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Choose a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {presets.map((preset, index) => (
              <SimpleCard 
                key={index} 
                className="cursor-pointer hover:border-blue-500/50 transition-all group"
                onClick={() => applyPreset(preset)}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                    <div className="text-blue-400">
                      {preset.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">{preset.name}</h3>
                    <p className="text-white/60 text-sm">{preset.description}</p>
                  </div>
                </div>
              </SimpleCard>
            ))}
          </div>
        </div>

        {/* Form */}
        <SimpleCard>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Settings */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-3" />
                Project Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Website URL *
                  </label>
                  <SimpleInput
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    required
                  />
                  <p className="text-white/40 text-sm mt-2">
                    Enter the URL of the website you want to clone
                  </p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Project Name *
                  </label>
                  <SimpleInput
                    placeholder="My Amazing Website Clone"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Description
                  </label>
                  <SimpleTextarea
                    placeholder="Describe what this clone is for..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border-t border-white/10 pt-8">
              <SimpleButton
                type="button"
                variant="ghost"
                className="mb-6 p-0 h-auto"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="w-5 h-5 mr-2" />
                Advanced Settings
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </SimpleButton>

              {showAdvanced && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.extractVideos}
                          onChange={(e) => setFormData(prev => ({ ...prev, extractVideos: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <span className="text-white/80">Extract Videos</span>
                      </label>
                      <p className="text-white/40 text-sm mt-2 ml-7">
                        Download and include video files
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.includeAssets}
                          onChange={(e) => setFormData(prev => ({ ...prev, includeAssets: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <span className="text-white/80">Include All Assets</span>
                      </label>
                      <p className="text-white/40 text-sm mt-2 ml-7">
                        Images, CSS, JS files
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.respectRobots}
                          onChange={(e) => setFormData(prev => ({ ...prev, respectRobots: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <span className="text-white/80">Respect robots.txt</span>
                      </label>
                      <p className="text-white/40 text-sm mt-2 ml-7">
                        Follow website crawling rules
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-3">
                        Max Depth
                      </label>
                      <SimpleInput
                        type="number"
                        min="1"
                        max="10"
                        value={formData.maxDepth.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxDepth: parseInt(e.target.value) || 2 }))}
                      />
                      <p className="text-white/40 text-sm mt-2">
                        How deep to crawl linked pages
                      </p>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-3">
                        Wait Time (ms)
                      </label>
                      <SimpleInput
                        type="number"
                        min="0"
                        max="10000"
                        step="100"
                        value={formData.waitTime.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, waitTime: parseInt(e.target.value) || 1000 }))}
                      />
                      <p className="text-white/40 text-sm mt-2">
                        Time to wait for page loading
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-8">
              <div className="flex items-center text-white/60 text-sm">
                <Info className="w-4 h-4 mr-2" />
                Cloning typically takes 2-5 minutes
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <SimpleButton variant="outline">Cancel</SimpleButton>
                </Link>
                <SimpleButton 
                  type="submit" 
                  size="lg"
                  disabled={loading || !formData.url || !formData.name}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Starting Clone...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Cloning
                    </>
                  )}
                </SimpleButton>
              </div>
            </div>
          </form>
        </SimpleCard>
      </div>
    </div>
  )
}