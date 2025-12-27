'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CreditCard,
  Zap,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  Coins,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Sparkles,
  Brain,
  FileText,
  MessageSquare,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, subDays } from 'date-fns'
import { AICostOptimizer } from '@/lib/ai-cost-optimizer'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface UsageData {
  date: string
  credits: number
  cost: number
  feature: string
}

interface CreditBalance {
  total: number
  used: number
  remaining: number
  tier: 'starter' | 'pro' | 'enterprise'
  resetDate: string
}

export default function CreditsPage() {
  const [creditBalance, setCreditBalance] = useState<CreditBalance>({
    total: 1000,
    used: 450,
    remaining: 550,
    tier: 'starter',
    resetDate: '2024-02-01'
  })
  
  const [usageHistory, setUsageHistory] = useState<UsageData[]>([])
  const [loading, setLoading] = useState(false)
  const [costOptimizer] = useState(new AICostOptimizer())
  
  // Mock usage data
  const mockUsageData: UsageData[] = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    return {
      date,
      credits: Math.floor(Math.random() * 50) + 10,
      cost: Math.random() * 2 + 0.5,
      feature: ['pdf-processing', 'ai-chat', 'website-cloning', 'design-analysis'][Math.floor(Math.random() * 4)] || 'pdf-processing'
    }
  })

  useEffect(() => {
    setUsageHistory(mockUsageData)
  }, [])

  const featureUsageBreakdown = usageHistory.reduce((acc, usage) => {
    acc[usage.feature] = (acc[usage.feature] || 0) + usage.credits
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(featureUsageBreakdown).map(([feature, credits]) => ({
    name: feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value: credits,
    color: {
      'pdf-processing': '#8b5cf6',
      'ai-chat': '#3b82f6',
      'website-cloning': '#10b981',
      'design-analysis': '#f59e0b'
    }[feature] || '#6b7280'
  }))

  const purchaseCredits = async (amount: number) => {
    setLoading(true)
    // Mock purchase simulation
    setTimeout(() => {
      setCreditBalance(prev => ({
        ...prev,
        total: prev.total + amount,
        remaining: prev.remaining + amount
      }))
      setLoading(false)
    }, 2000)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const usagePercentage = (creditBalance.used / creditBalance.total) * 100

  // Get cost optimization recommendations
  const recommendations = costOptimizer.getOptimizationRecommendations()
  const monthlyEstimate = costOptimizer.estimateMonthlyUserCost(creditBalance.tier)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Credits & Usage</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your AI usage and optimize costs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Buy Credits
          </Button>
        </div>
      </div>

      {/* Credit Balance Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold">{creditBalance.total.toLocaleString()}</p>
              </div>
              <Coins className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Used This Month</p>
                <p className={`text-2xl font-bold ${getUsageColor(usagePercentage)}`}>
                  {creditBalance.used.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-green-600">{creditBalance.remaining.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <Badge className="mt-1 bg-gradient-to-r from-blue-600 to-purple-600">
                  {creditBalance.tier.toUpperCase()}
                </Badge>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Monthly Usage Progress
          </CardTitle>
          <CardDescription>
            Resets on {format(new Date(creditBalance.resetDate), 'MMMM do, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {creditBalance.used.toLocaleString()} / {creditBalance.total.toLocaleString()} credits
              </span>
              <span className={`text-sm ${getUsageColor(usagePercentage)}`}>
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={usagePercentage} className="h-3" />
            
            {usagePercentage > 80 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  You've used {usagePercentage.toFixed(1)}% of your monthly credits. 
                  Consider upgrading your plan or purchasing additional credits.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Usage Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage Trend</CardTitle>
                <CardDescription>Credits consumed over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                      formatter={(value, name) => [`${value} credits`, 'Usage']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="credits" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feature Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Usage by Feature</CardTitle>
                <CardDescription>How your credits are being used</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} credits`, 'Usage']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage Details */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(featureUsageBreakdown).map(([feature, credits]) => {
                  const percentage = (credits / creditBalance.used) * 100
                  const Icon = {
                    'pdf-processing': FileText,
                    'ai-chat': MessageSquare,
                    'website-cloning': Sparkles,
                    'design-analysis': Brain
                  }[feature] || Activity
                  
                  return (
                    <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            {feature.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </p>
                          <p className="text-sm text-gray-600">{credits} credits used</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{percentage.toFixed(1)}%</p>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Monthly Cost Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Tier: {creditBalance.tier.toUpperCase()}</h3>
                  <div className="space-y-3">
                    {Object.entries(monthlyEstimate.features).map(([feature, cost]) => (
                      <div key={feature} className="flex justify-between">
                        <span className="capitalize">{feature.replace('-', ' ')}</span>
                        <span className="font-mono">${cost.toFixed(4)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Monthly Cost</span>
                        <span className="font-mono">${monthlyEstimate.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Profit Margin</span>
                        <span>{monthlyEstimate.profitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Recommended Credits</h3>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-3xl font-bold text-blue-600">
                      {monthlyEstimate.recommendedCredits}
                    </div>
                    <div className="text-sm text-gray-600">credits/month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Recommendations */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Immediate Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {recommendations.immediate.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">Short Term</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {recommendations.shortTerm.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-600">Long Term</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {recommendations.longTerm.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          {/* Credit Purchase Options */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { amount: 1000, price: 29, savings: 0, popular: false },
              { amount: 5000, price: 99, savings: 46, popular: true },
              { amount: 15000, price: 199, savings: 236, popular: false }
            ].map((plan) => (
              <Card key={plan.amount} className={`relative ${plan.popular ? 'border-blue-600 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center">
                    {plan.amount.toLocaleString()} Credits
                  </CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {plan.savings > 0 && (
                    <div className="text-center text-green-600 text-sm">
                      Save ${plan.savings}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => purchaseCredits(plan.amount)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Purchase
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-600 text-center mt-2">
                    ${(plan.price / plan.amount * 1000).toFixed(2)} per 1K credits
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}