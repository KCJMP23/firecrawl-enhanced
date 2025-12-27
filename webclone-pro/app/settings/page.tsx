'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionManager } from '@/components/SubscriptionManager'
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  Code,
  Globe,
  Palette,
  Save,
  Check,
  AlertCircle,
  Key,
  Mail,
  Github,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Download,
  Upload,
  ChevronRight
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface UserSettings {
  email: string
  name: string
  avatar: string
  notifications: {
    email: boolean
    browser: boolean
    cloneComplete: boolean
    deploymentStatus: boolean
    weeklyReport: boolean
  }
  privacy: {
    publicProfile: boolean
    showProjects: boolean
    allowAnalytics: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
  }
  api: {
    keys: Array<{
      id: string
      name: string
      key: string
      created: Date
      lastUsed: Date | null
    }>
  }
}



export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'api' | 'billing' | 'danger'>('general')
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    name: '',
    avatar: '',
    notifications: {
      email: true,
      browser: false,
      cloneComplete: true,
      deploymentStatus: true,
      weeklyReport: false
    },
    privacy: {
      publicProfile: false,
      showProjects: false,
      allowAnalytics: true
    },
    appearance: {
      theme: 'dark',
      accentColor: '#6366f1'
    },
    api: {
      keys: []
    }
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      
      setUser(session.user)
      
      // Load user profile and settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        setSettings(prev => ({
          ...prev,
          email: session.user.email || '',
          name: profile.full_name || '',
          avatar: profile.avatar_url || '',
          ...profile.settings
        }))
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: settings.name,
          avatar_url: settings.avatar,
          settings: {
            notifications: settings.notifications,
            privacy: settings.privacy,
            appearance: settings.appearance
          }
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const generateApiKey = async () => {
    const key = `wcp_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`
    const newKey = {
      id: Date.now().toString(),
      name: `API Key ${settings.api.keys.length + 1}`,
      key,
      created: new Date(),
      lastUsed: null
    }
    
    setSettings(prev => ({
      ...prev,
      api: {
        keys: [...prev.api.keys, newKey]
      }
    }))
  }

  const deleteApiKey = (keyId: string) => {
    setSettings(prev => ({
      ...prev,
      api: {
        keys: prev.api.keys.filter(k => k.id !== keyId)
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertCircle className="w-4 h-4" /> }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <SimpleButton onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </SimpleButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/60">Manage your account settings and preferences</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <div className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-2 border-blue-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-blue-400' : 'text-white/60'}>
                      {tab.icon}
                    </span>
                    <span className={activeTab === tab.id ? 'text-white' : 'text-white/80'}>
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* General Settings */}
              {activeTab === 'general' && (
                <SimpleCard>
                  <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-3">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                          {settings.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <SimpleButton variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </SimpleButton>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-3">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-3">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="email"
                          value={settings.email}
                          disabled
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60"
                        />
                        <SimpleButton variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Change Email
                        </SimpleButton>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-3">
                        Appearance
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: 'light' }}))}
                          className={`p-3 rounded-lg border ${
                            settings.appearance.theme === 'light'
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <Sun className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: 'dark' }}))}
                          className={`p-3 rounded-lg border ${
                            settings.appearance.theme === 'dark'
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <Moon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: 'system' }}))}
                          className={`p-3 rounded-lg border ${
                            settings.appearance.theme === 'system'
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <Monitor className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </SimpleCard>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <SimpleCard>
                  <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {Object.entries({
                      email: 'Email notifications',
                      browser: 'Browser notifications',
                      cloneComplete: 'Clone completion alerts',
                      deploymentStatus: 'Deployment status updates',
                      weeklyReport: 'Weekly progress reports'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 cursor-pointer">
                        <span className="text-white/80">{label}</span>
                        <input
                          type="checkbox"
                          checked={settings.notifications[key as keyof typeof settings.notifications]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [key]: e.target.checked
                            }
                          }))}
                          className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                      </label>
                    ))}
                  </div>
                </SimpleCard>
              )}

              {/* Privacy */}
              {activeTab === 'privacy' && (
                <SimpleCard>
                  <h2 className="text-xl font-bold text-white mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-6">
                    {Object.entries({
                      publicProfile: 'Make my profile public',
                      showProjects: 'Show my projects publicly',
                      allowAnalytics: 'Allow usage analytics'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 cursor-pointer">
                        <div>
                          <span className="text-white/80 block">{label}</span>
                          <span className="text-white/40 text-sm">
                            {key === 'publicProfile' && 'Others can view your profile'}
                            {key === 'showProjects' && 'Display your projects on your public profile'}
                            {key === 'allowAnalytics' && 'Help us improve by sharing usage data'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.privacy[key as keyof typeof settings.privacy]}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            privacy: {
                              ...prev.privacy,
                              [key]: e.target.checked
                            }
                          }))}
                          className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                      </label>
                    ))}
                    
                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Github className="w-5 h-5" />
                            <span className="text-white/80">GitHub</span>
                          </div>
                          <SimpleButton variant="outline" size="sm">
                            Connect
                          </SimpleButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </SimpleCard>
              )}

              {/* API Keys */}
              {activeTab === 'api' && (
                <SimpleCard>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">API Keys</h2>
                    <SimpleButton onClick={generateApiKey} size="sm">
                      <Key className="w-4 h-4 mr-2" />
                      Generate New Key
                    </SimpleButton>
                  </div>
                  
                  {settings.api.keys.length > 0 ? (
                    <div className="space-y-3">
                      {settings.api.keys.map(key => (
                        <div key={key.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-white mb-1">{key.name}</div>
                            <div className="font-mono text-xs text-white/40">{key.key}</div>
                            <div className="text-xs text-white/40 mt-1">
                              Created {key.created.toLocaleDateString()}
                            </div>
                          </div>
                          <SimpleButton
                            variant="outline"
                            size="sm"
                            onClick={() => deleteApiKey(key.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </SimpleButton>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <Key className="w-12 h-12 mx-auto mb-3 text-white/20" />
                      <p>No API keys generated yet</p>
                    </div>
                  )}
                </SimpleCard>
              )}

              {/* Billing */}
              {activeTab === 'billing' && (
                <SubscriptionManager />
              )}

              {/* Danger Zone */}
              {activeTab === 'danger' && (
                <SimpleCard className="border-red-500/20">
                  <h2 className="text-xl font-bold text-white mb-6">Danger Zone</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-yellow-500/20 rounded-lg bg-yellow-500/10">
                      <h3 className="font-semibold text-yellow-400 mb-2">Export Account Data</h3>
                      <p className="text-white/60 text-sm mb-4">
                        Download all your data including projects, settings, and analytics
                      </p>
                      <SimpleButton variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </SimpleButton>
                    </div>
                    
                    <div className="p-4 border border-red-500/20 rounded-lg bg-red-500/10">
                      <h3 className="font-semibold text-red-400 mb-2">Delete Account</h3>
                      <p className="text-white/60 text-sm mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <SimpleButton variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </SimpleButton>
                    </div>
                  </div>
                </SimpleCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}