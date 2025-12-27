'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  ExternalLink,
  Zap,
  Building2
} from 'lucide-react'
import { PRICING_PLANS } from '@/lib/stripe'
import { formatPrice } from '@/lib/stripe-client'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_customer_id: string
}

interface Credits {
  backend_credits: number
  credits_reset_at: string
}

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [credits, setCredits] = useState<Credits | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }

      // Load subscription
      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (sub) {
        setSubscription(sub)
      }

      // Load credits
      const { data: cred } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (cred) {
        setCredits(cred)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const openBillingPortal = async () => {
    try {
      setPortalLoading(true)
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to open billing portal')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      toast.error('Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            Start your 14-day free trial to unlock all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/pricing">View Pricing Plans</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const plan = PRICING_PLANS[subscription.plan_id as keyof typeof PRICING_PLANS]
  const daysRemaining = Math.ceil(
    (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const creditsUsedPercent = credits 
    ? ((plan.limits.bundledCredits - credits.backend_credits) / plan.limits.bundledCredits) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {plan.id === 'starter' && <Zap className="w-5 h-5 text-blue-500" />}
                {plan.id === 'pro' && <Sparkles className="w-5 h-5 text-purple-500" />}
                {plan.id === 'enterprise' && <Building2 className="w-5 h-5 text-indigo-500" />}
                {plan.name} Plan
              </CardTitle>
              <CardDescription>
                {formatPrice(plan.price)}/month
              </CardDescription>
            </div>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Billing Period */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Current Period</span>
            </div>
            <span className="text-sm font-medium">
              {new Date(subscription.current_period_start).toLocaleDateString()} - 
              {' '}{new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          </div>

          {/* Days Remaining */}
          {!subscription.cancel_at_period_end && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Renews in {daysRemaining} days
              </span>
              <Progress value={(30 - daysRemaining) / 30 * 100} className="w-32" />
            </div>
          )}

          {/* Cancellation Notice */}
          {subscription.cancel_at_period_end && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-400">
                Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Manage Subscription Button */}
          <Button
            onClick={openBillingPortal}
            disabled={portalLoading}
            variant="outline"
            className="w-full"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {portalLoading ? 'Opening...' : 'Manage Billing'}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Backend Credits */}
      {credits && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backend Credits</CardTitle>
            <CardDescription>
              Included with your {plan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {formatPrice(credits.backend_credits)} remaining
                </span>
                <span className="text-sm text-gray-500">
                  of {formatPrice(plan.limits.bundledCredits)}
                </span>
              </div>
              <Progress value={100 - creditsUsedPercent} />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Credits reset on {new Date(credits.credits_reset_at).toLocaleDateString()}
            </p>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                💡 These credits can be used for Supabase, Firebase, Neon, and other backend services
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {plan.id !== 'enterprise' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg">
              <p className="text-sm font-medium mb-2">Ready to upgrade?</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Unlock more features and higher limits
              </p>
              <Button size="sm" asChild>
                <a href="/pricing">View Upgrade Options</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}