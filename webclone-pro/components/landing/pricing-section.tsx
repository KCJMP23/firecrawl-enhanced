'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for individuals and small projects',
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      'Up to 10 websites/month',
      'Basic AI remixing',
      '1GB storage',
      'Standard support',
      'Export to HTML/CSS',
      'Basic 3D editor',
    ],
    gradient: 'from-neural-500 to-purple-500',
    popular: false,
  },
  {
    name: 'Professional',
    price: 99,
    description: 'For agencies and growing businesses',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Up to 100 websites/month',
      'Advanced AI agents',
      '50GB storage',
      'Priority support',
      'Export to React/Vue/Angular',
      'Advanced 3D editor',
      'Video extraction',
      'Custom domains',
      'Team collaboration',
    ],
    gradient: 'from-cyber-500 to-blue-500',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 299,
    description: 'For large organizations with custom needs',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Unlimited websites',
      'Custom AI models',
      'Unlimited storage',
      'Dedicated support',
      'Custom frameworks',
      'White-label solution',
      'API access',
      'Advanced analytics',
      'Custom integrations',
      'SLA guarantee',
    ],
    gradient: 'from-purple-500 to-pink-500',
    popular: false,
  },
]

export function PricingSection() {
  return (
    <div className="container mx-auto">
      <div className="text-center mb-20">
        <Badge className="glass-morphism border-neural-500/30 mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Simple, Transparent Pricing
        </Badge>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
          Start Building the Future
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Choose the perfect plan for your needs. Scale as you grow. 
          No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden glass-morphism border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 ${
              plan.popular ? 'ring-2 ring-cyber-500/50 transform scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cyber-500 to-blue-500 py-2">
                <p className="text-center text-white text-sm font-semibold">
                  Most Popular
                </p>
              </div>
            )}
            
            <CardHeader className={`pb-8 ${plan.popular ? 'pt-12' : 'pt-8'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.gradient}`}>
                  <div className="text-white">
                    {plan.icon}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    ${plan.price}
                  </div>
                  <div className="text-white/60 text-sm">/month</div>
                </div>
              </div>
              
              <CardTitle className="text-white text-xl mb-2">
                {plan.name}
              </CardTitle>
              <p className="text-white/70 text-sm">
                {plan.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                className={`w-full bg-gradient-to-r ${plan.gradient} hover:scale-105 transition-transform text-white border-0`}
                size="lg"
              >
                Get Started
              </Button>
              
              <div className="space-y-3 pt-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-16">
        <p className="text-white/60 mb-4">
          All plans include 14-day free trial • No setup fees • Cancel anytime
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-white/40">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            SOC 2 Compliant
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
            GDPR Ready
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
            99.9% Uptime
          </div>
        </div>
      </div>
    </div>
  )
}