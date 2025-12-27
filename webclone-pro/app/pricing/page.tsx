'use client'

import { useState } from 'react'
import { Check, X, Sparkles, Zap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PRICING_PLANS } from '@/lib/stripe'
import { formatPrice, calculateAnnualSavings } from '@/lib/stripe-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          router.push('/auth?redirect=/pricing')
          return
        }
        throw new Error(error.error || 'Failed to start checkout')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Subscribe error:', error)
      toast.error('Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Limited Time: 14-Day Free Trial
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Unlimited Cloning. Zero Token Limits.
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            While competitors charge per token and nickel-and-dime you for backends,
            we offer <span className="font-semibold text-primary">truly unlimited cloning</span> with
            {' '}<span className="font-semibold text-green-600">$50-150 in bundled credits</span> every month.
          </p>

          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Label htmlFor="annual-toggle" className="cursor-pointer">
              Monthly
            </Label>
            <Switch
              id="annual-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="annual-toggle" className="cursor-pointer">
              Annual
              <Badge className="ml-2" variant="default">
                Save 20%
              </Badge>
            </Label>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="mb-12 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-400">
            Why We're Different
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-500 mb-2">
                ❌ What Competitors Do:
              </h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-400">
                <li>• Charge $20-50/month + token costs</li>
                <li>• Separate Supabase billing ($25+/month)</li>
                <li>• Limited to 3-4 frameworks</li>
                <li>• No animation extraction</li>
                <li>• Token anxiety on every action</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-500 mb-2">
                ✅ What We Offer:
              </h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-400">
                <li>• Flat rate, unlimited cloning</li>
                <li>• $50-150 bundled backend credits</li>
                <li>• 20+ framework exports</li>
                <li>• Universal animation extraction</li>
                <li>• Clone without counting tokens</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {Object.values(PRICING_PLANS).map((plan) => {
            const price = isAnnual ? Math.floor(plan.price * 0.8) : plan.price
            const savings = isAnnual ? calculateAnnualSavings(plan.price) : 0
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-primary/10 to-purple-600/10 border-2 border-primary shadow-xl'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6">
                  {plan.id === 'starter' && <Zap className="w-8 h-8 text-blue-500 mb-2" />}
                  {plan.id === 'pro' && <Sparkles className="w-8 h-8 text-purple-500 mb-2" />}
                  {plan.id === 'enterprise' && <Building2 className="w-8 h-8 text-indigo-500 mb-2" />}
                  
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatPrice(price)}</span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  
                  {isAnnual && savings > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save {formatPrice(savings)}/year
                    </p>
                  )}
                </div>

                <Button
                  className={`w-full mb-6 ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  disabled={loading === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loading === plan.id ? 'Processing...' : 'Start Free Trial'}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Platform Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">WebClone Pro</th>
                  <th className="text-center py-3 px-4">Lovable.dev</th>
                  <th className="text-center py-3 px-4">v0.dev</th>
                  <th className="text-center py-3 px-4">Bolt.new</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Pricing Model', 'Flat Unlimited', 'Token-based', 'Token-based', 'Token-based'],
                  ['Backend Credits', '$50-150/mo included', 'Separate billing', 'Separate billing', 'Separate billing'],
                  ['Framework Support', '20+', '3-4', '2-3', '4-5'],
                  ['Animation Extraction', '✓', '✗', '✗', '✗'],
                  ['Design DNA Extraction', '✓', '✗', '✗', '✗'],
                  ['Affiliate Builder', '✓', '✗', '✗', '✗'],
                  ['Chrome Extension', '✓', '✗', '✗', '✗'],
                  ['Animation Marketplace', '✓', '✗', '✗', '✗'],
                  ['Free Trial', '14 days', '7 days', 'Limited', '7 days'],
                  ['Team Collaboration', '5-∞ members', '1-5 members', '1-3 members', '1-5 members']
                ].map(([feature, ...values], index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="py-3 px-4 font-medium">{feature}</td>
                    {values.map((value, i) => (
                      <td key={i} className="text-center py-3 px-4">
                        {value === '✓' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : value === '✗' ? (
                          <X className="w-5 h-5 text-red-500 mx-auto" />
                        ) : (
                          <span className={i === 0 ? 'font-semibold text-primary' : 'text-gray-600 dark:text-gray-400'}>
                            {value}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'What does "unlimited cloning" really mean?',
                a: 'Unlike competitors who charge per token, you can clone as many websites as you want without worrying about usage limits or surprise charges.'
              },
              {
                q: 'What are bundled backend credits?',
                a: 'We include $50-150 worth of Supabase, Firebase, or other backend service credits with your plan. Competitors make you pay separately.'
              },
              {
                q: 'Can I export to any framework?',
                a: 'Yes! We support 20+ frameworks including React, Vue, Angular, Svelte, Next.js, Nuxt, and many more.'
              },
              {
                q: 'How does animation extraction work?',
                a: 'Our AI can extract and recreate animations from any website, converting between GSAP, Framer Motion, CSS, and more.'
              },
              {
                q: 'Is there really a 14-day free trial?',
                a: 'Yes! Full access to all features for 14 days. No credit card required to start.'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}