'use client'

import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Globe, 
  Brain, 
  Rocket, 
  Users, 
  TrendingUp, 
  Check,
  Code2,
  Palette,
  DollarSign,
  Clock,
  Shield,
  Infinity,
  Play
} from 'lucide-react'
import { SimpleButton } from '@/components/ui'

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
  )
})


function SimpleBadge({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold bg-white/10 backdrop-blur-sm text-white ${className}`}>
      {children}
    </div>
  )
}

function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${className}`}>
      {children}
    </div>
  )
}


export default function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "One-Click Extraction",
      description: "Clone any website instantly with our Chrome extension. Perfect 1:1 accuracy.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Animation Extraction",
      description: "Extract GSAP, Framer Motion, CSS animations. No other platform offers this.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Design DNA System",
      description: "Extract complete design systems - colors, typography, spacing, components.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "20+ Framework Export",
      description: "Export to React, Vue, Angular, Svelte, Next.js, and 15+ more frameworks.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Bundled Backend Credits",
      description: "$50-150 backend credits included. Competitors charge separately.",
      gradient: "from-red-500 to-rose-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Animation Marketplace",
      description: "Buy, sell, and share animations. Build your own animation empire.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ]

  const plans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for side projects',
      features: [
        'Unlimited website clones',
        'Basic extraction features',
        'Export to 5 frameworks',
        'Community support',
        'Public projects only',
        'NO TOKENS OR LIMITS'
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: 79,
      description: 'For professional developers',
      features: [
        'Everything in Starter',
        '$50 backend credits/month',
        'Animation extraction',
        'Design DNA system',
        'Export to ALL frameworks',
        'Private projects',
        'Priority support',
        'Chrome extension',
        'Affiliate site builder'
      ],
      popular: true,
    },
    {
      name: 'Business',
      price: 199,
      description: 'For teams and agencies',
      features: [
        'Everything in Pro',
        '$150 backend credits/month',
        'Team collaboration',
        'White-label options',
        'API access',
        'Custom branding',
        'Dedicated support',
        'Animation marketplace access',
        'Advanced analytics'
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">WebClone Pro</span>
              <SimpleBadge>2026</SimpleBadge>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-white/80 hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</Link>
              <Link href="/auth">
                <SimpleButton variant="outline">Sign In</SimpleButton>
              </Link>
              <Link href="/auth">
                <SimpleButton>
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </SimpleButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <Hero3D />
        
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <SimpleBadge className="mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by AI • Built for 2026
          </SimpleBadge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            Clone Any Website.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Export to Any Framework.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            The ONLY platform with animation extraction, design DNA system, and flat unlimited pricing.
            <span className="text-purple-400 font-bold"> No tokens. No limits. Just $29/month.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <SimpleButton size="lg" className="px-12 py-6 hover:scale-105 transition-transform">
                Start Cloning Free
                <Rocket className="ml-2 w-5 h-5" />
              </SimpleButton>
            </Link>
            <SimpleButton size="lg" variant="outline" className="px-12 py-6">
              Watch Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </SimpleButton>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-white/60">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              No Credit Card Required
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
              Deploy in Seconds
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
              AI-Powered
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <SimpleBadge className="mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Revolutionary Features
            </SimpleBadge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              The Future is Here
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience next-generation web cloning with cutting-edge AI, 
              3D interfaces, and autonomous development capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <SimpleCard key={index} className="group hover:scale-105 transition-all duration-300 hover:border-white/20">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient}`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </SimpleCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <SimpleBadge className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Simple, Transparent Pricing
            </SimpleBadge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Start Building the Future
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. Scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <SimpleCard key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-blue-500/50 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 py-2 rounded-t-lg">
                    <p className="text-center text-white text-sm font-semibold">Most Popular</p>
                  </div>
                )}
                
                <div className={`${plan.popular ? 'pt-8' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-white">${plan.price}</div>
                    <div className="text-white/60 text-sm">/month</div>
                  </div>
                  
                  <h3 className="text-white text-xl mb-2">{plan.name}</h3>
                  <p className="text-white/70 text-sm mb-6">{plan.description}</p>
                  
                  <SimpleButton className="w-full mb-6">Get Started</SimpleButton>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SimpleCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <SimpleBadge className="mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Join the Revolution
          </SimpleBadge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            Ready to Clone the
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Future of Web?</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers, designers, and businesses who are already 
            building the next generation of websites with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth">
              <SimpleButton size="lg" className="px-12 py-6 hover:scale-105 transition-transform">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </SimpleButton>
            </Link>
            <SimpleButton size="lg" variant="outline" className="px-12 py-6">
              Schedule Demo
            </SimpleButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-white/60 text-sm">Websites Cloned</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-white/60 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">WebClone Pro</span>
              </div>
              <p className="text-white/60">
                The future of AI-native web development. Clone, remix, reimagine.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-white/60">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/enterprise" className="hover:text-white">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-white/60">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white">API Reference</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-white/60">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/40">
            <p>&copy; 2026 WebClone Pro. All rights reserved. Built for the future.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}