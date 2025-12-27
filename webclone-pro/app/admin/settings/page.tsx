'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Settings,
  Shield,
  Bell,
  Mail,
  Globe,
  CreditCard,
  Database,
  Zap,
  Lock,
  Eye,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Key,
  Server,
  Code,
  Users
} from 'lucide-react'

interface PlatformSettings {
  siteName: string
  siteDescription: string
  supportEmail: string
  maxProjectsPerUser: number
  defaultPlan: string
  maintenanceMode: boolean
  allowSignups: boolean
  requireEmailVerification: boolean
}

interface SecuritySettings {
  passwordMinLength: number
  requireTwoFactor: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  ipWhitelist: string[]
  corsOrigins: string[]
}

interface EmailSettings {
  provider: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
}

interface PaymentSettings {
  stripePublicKey: string
  stripeSecretKey: string
  webhookSecret: string
  currency: string
  taxRate: number
  trialDays: number
}

export default function AdminSettings() {
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteName: 'WebClone Pro',
    siteDescription: 'AI-powered website cloning platform',
    supportEmail: 'support@webclonepro.com',
    maxProjectsPerUser: 100,
    defaultPlan: 'starter',
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: true
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    requireTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    corsOrigins: ['https://webclonepro.com']
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    provider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@webclonepro.com',
    fromName: 'WebClone Pro'
  })

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripePublicKey: '',
    stripeSecretKey: '',
    webhookSecret: '',
    currency: 'USD',
    taxRate: 0,
    trialDays: 14
  })

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('platform')

  const saveSettings = async (section: string) => {
    setSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`${section} settings saved successfully`)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const testEmailSettings = async () => {
    try {
      toast.info('Sending test email...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Test email sent successfully!')
    } catch (error) {
      toast.error('Failed to send test email')
    }
  }

  const testPaymentSettings = async () => {
    try {
      toast.info('Testing Stripe connection...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Stripe connection successful!')
    } catch (error) {
      toast.error('Stripe connection failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure platform-wide settings and preferences
          </p>
        </div>
        
        <Badge variant="outline" className="border-blue-600 text-blue-600">
          <Shield className="w-4 h-4 mr-1" />
          Admin Only
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            API & Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic platform configuration and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={platformSettings.siteName}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={platformSettings.supportEmail}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={platformSettings.siteDescription}
                  onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxProjects">Max Projects per User</Label>
                  <Input
                    id="maxProjects"
                    type="number"
                    value={platformSettings.maxProjectsPerUser}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, maxProjectsPerUser: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultPlan">Default Plan</Label>
                  <Select
                    value={platformSettings.defaultPlan}
                    onValueChange={(value) => setPlatformSettings(prev => ({ ...prev, defaultPlan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Manage user registration and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">
                    Temporarily disable the platform for maintenance
                  </p>
                </div>
                <Switch
                  checked={platformSettings.maintenanceMode}
                  onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow New Signups</Label>
                  <p className="text-sm text-gray-500">
                    Enable new user registrations
                  </p>
                </div>
                <Switch
                  checked={platformSettings.allowSignups}
                  onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, allowSignups: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification Required</Label>
                  <p className="text-sm text-gray-500">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  checked={platformSettings.requireEmailVerification}
                  onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={() => saveSettings('Platform')} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure password and login requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Minimum Password Length</Label>
                  <Input
                    id="passwordLength"
                    type="number"
                    min="6"
                    max="50"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="1"
                  max="168"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">
                    Force all users to enable 2FA
                  </p>
                </div>
                <Switch
                  checked={securitySettings.requireTwoFactor}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Security</CardTitle>
              <CardDescription>
                Configure IP restrictions and CORS settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="corsOrigins">CORS Origins</Label>
                <Textarea
                  id="corsOrigins"
                  value={securitySettings.corsOrigins.join('\n')}
                  onChange={(e) => setSecuritySettings(prev => ({ 
                    ...prev, 
                    corsOrigins: e.target.value.split('\n').filter(url => url.trim()) 
                  }))}
                  rows={3}
                  placeholder="https://example.com"
                />
                <p className="text-sm text-gray-500">One URL per line</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={() => saveSettings('Security')} disabled={saving}>
              {saving ? 'Saving...' : 'Save Security Settings'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure email delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={() => saveSettings('Email')} disabled={saving}>
              {saving ? 'Saving...' : 'Save Email Settings'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={testEmailSettings}>
              <Mail className="w-4 h-4 mr-2" />
              Test Email
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Configuration</CardTitle>
              <CardDescription>
                Configure payment processing with Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Keep your API keys secure. Never share them publicly.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="stripePublic">Stripe Publishable Key</Label>
                <Input
                  id="stripePublic"
                  value={paymentSettings.stripePublicKey}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                  placeholder="pk_live_..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripeSecret">Stripe Secret Key</Label>
                <Input
                  id="stripeSecret"
                  type="password"
                  value={paymentSettings.stripeSecretKey}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                  placeholder="sk_live_..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Endpoint Secret</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  value={paymentSettings.webhookSecret}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  placeholder="whsec_..."
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={paymentSettings.currency}
                    onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    min="0"
                    max="90"
                    value={paymentSettings.trialDays}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, trialDays: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={() => saveSettings('Payment')} disabled={saving}>
              {saving ? 'Saving...' : 'Save Payment Settings'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={testPaymentSettings}>
              <CreditCard className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Rate Limits</CardTitle>
              <CardDescription>
                Configure API usage limits and quotas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Requests per minute</Label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label>Daily API quota</Label>
                  <Input type="number" defaultValue="10000" />
                </div>
                <div className="space-y-2">
                  <Label>Burst limit</Label>
                  <Input type="number" defaultValue="200" />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Plan-based Limits</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Starter Plan</span>
                    <span className="font-medium">1,000 requests/day</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Pro Plan</span>
                    <span className="font-medium">10,000 requests/day</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Enterprise Plan</span>
                    <span className="font-medium">Unlimited</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={() => saveSettings('API')} disabled={saving}>
              {saving ? 'Saving...' : 'Save API Settings'}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}