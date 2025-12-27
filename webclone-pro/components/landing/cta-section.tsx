'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Globe, Users, TrendingUp } from 'lucide-react'

const stats = [
  {
    icon: <Globe className="w-6 h-6" />,
    value: '1M+',
    label: 'Websites Cloned',
  },
  {
    icon: <Users className="w-6 h-6" />,
    value: '50K+',
    label: 'Active Users',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    value: '99.9%',
    label: 'Uptime',
  },
]

export function CTASection() {
  return (
    <div className="container mx-auto text-center">
      <div className="max-w-4xl mx-auto">
        <Badge className="glass-morphism border-cyber-500/30 mb-8">
          <Sparkles className="w-4 h-4 mr-2" />
          Join the Revolution
        </Badge>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
          Ready to Clone the
          <br />
          <span className="text-gradient">Future of Web?</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of developers, designers, and businesses who are already 
          building the next generation of websites with AI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="neural-gradient hover:scale-105 transition-all px-12 py-6 text-lg ambient-glow"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="glass-morphism border-white/20 hover:bg-white/10 px-12 py-6 text-lg"
          >
            Schedule Demo
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-xl glass-morphism border-white/20">
                  <div className="text-cyber-400">
                    {stat.icon}
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/60 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 p-8 glass-morphism border-white/10 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between text-left">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">
                Still have questions?
              </h3>
              <p className="text-white/70">
                Our team is here to help you get started with WebClone Pro.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="glass-morphism border-white/20">
                View Documentation
              </Button>
              <Button className="neural-gradient">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}