'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

export function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden glass-morphism border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105">
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br',
        gradient
      )} />
      
      <CardContent className="p-8 relative z-10">
        <div className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br',
          gradient
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gradient transition-colors duration-500">
          {title}
        </h3>
        
        <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-500">
          {description}
        </p>
        
        <div className="absolute top-4 right-4">
          <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}