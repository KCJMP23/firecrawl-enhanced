'use client'

import { useOnboarding } from './OnboardingProvider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Globe,
  Wand2,
  Palette,
  Users,
  Package,
  CreditCard,
  Rocket,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Zap,
  Code,
  Layers,
  Share2
} from 'lucide-react'
import { useState } from 'react'
import confetti from 'canvas-confetti'

const STEP_ICONS: Record<string, React.ReactNode> = {
  'welcome': <Sparkles className="w-8 h-8" />,
  'clone-website': <Globe className="w-8 h-8" />,
  'ai-customization': <Wand2 className="w-8 h-8" />,
  'animation-extraction': <Zap className="w-8 h-8" />,
  'design-dna': <Palette className="w-8 h-8" />,
  'collaboration': <Users className="w-8 h-8" />,
  'export-frameworks': <Package className="w-8 h-8" />,
  'backend-credits': <CreditCard className="w-8 h-8" />,
  'complete': <Rocket className="w-8 h-8" />
}

const FEATURE_DEMOS = {
  'clone-website': {
    videoUrl: '/demos/clone-demo.mp4',
    features: [
      'Enter any URL',
      'AI clones in seconds',
      'Preserves all styles',
      'No token limits'
    ]
  },
  'animation-extraction': {
    videoUrl: '/demos/animation-demo.mp4',
    features: [
      'Extract GSAP animations',
      'Copy Framer Motion',
      'Capture CSS animations',
      'Convert between libraries'
    ]
  },
  'design-dna': {
    videoUrl: '/demos/design-dna-demo.mp4',
    features: [
      'Extract color palettes',
      'Copy typography systems',
      'Capture spacing rules',
      'Export to Tailwind'
    ]
  }
}

export function OnboardingModal() {
  const {
    isOnboarding,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    progress,
    completeStep
  } = useOnboarding()

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const currentStepData = steps[currentStep]!  // steps array always has items
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    completeStep(currentStepData.id)
    
    if (isLastStep) {
      // Fire confetti for completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
    
    nextStep()
  }

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  if (!isOnboarding) return null

  return (
    <Dialog open={isOnboarding} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10">
                {STEP_ICONS[currentStepData.id]}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {currentStepData.title}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {currentStepData.description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.id === 'welcome' && (
                <div className="space-y-4">
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
                    <h3 className="font-semibold mb-3">What makes us different:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Unlimited cloning (no tokens!)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm">$50-150 bundled credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm">20+ framework exports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Animation extraction</span>
                      </div>
                    </div>
                  </Card>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Badge variant="default">New</Badge>
                    <p className="text-sm">
                      14-day free trial • No credit card required • Cancel anytime
                    </p>
                  </div>
                </div>
              )}

              {currentStepData.id === 'clone-website' && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Globe className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <p className="text-white">Clone any website instantly</p>
                        <p className="text-gray-400 text-sm mt-2">Just paste the URL</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {['No token limits', 'Instant cloning', 'All assets included', 'SEO preserved'].map(feature => (
                      <label key={feature} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox 
                          checked={checkedItems.has(feature)}
                          onCheckedChange={() => toggleCheck(feature)}
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentStepData.id === 'ai-customization' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
                      <Wand2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm font-medium">AI Redesign</p>
                    </Card>
                    <Card className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
                      <Code className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Code Gen</p>
                    </Card>
                    <Card className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
                      <Layers className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Component AI</p>
                    </Card>
                  </div>
                  
                  <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-medium">AI Models Included:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Claude 3.5, GPT-4, Gemini Pro - all included!
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {currentStepData.id === 'animation-extraction' && (
                <div className="space-y-4">
                  <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-0">
                    <div className="flex items-center gap-4 mb-4">
                      <Zap className="w-10 h-10 text-orange-600" />
                      <div>
                        <h3 className="font-semibold">Industry First!</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No other platform offers animation extraction
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {['GSAP', 'Framer Motion', 'CSS Animations', 'Lottie', 'Three.js'].map(lib => (
                        <div key={lib} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-sm font-medium">{lib}</span>
                          <Badge variant="outline">Supported</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {currentStepData.id === 'design-dna' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <Palette className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="font-medium text-sm">Color Systems</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Extract complete palettes
                      </p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <Code className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium text-sm">Typography</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Font families & scales
                      </p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <Layers className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium text-sm">Spacing</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Margins & padding rules
                      </p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                      <Share2 className="w-6 h-6 text-orange-600 mb-2" />
                      <p className="font-medium text-sm">Components</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Extract UI patterns
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {currentStepData.id === 'collaboration' && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm">John is editing header...</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm">Sarah added a comment...</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-sm">Mike is viewing code...</span>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['Live cursors', 'Voice chat', 'Screen share'].map(feature => (
                      <Badge key={feature} variant="secondary" className="justify-center py-2">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentStepData.id === 'export-frameworks' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      'React', 'Vue', 'Angular', 'Svelte',
                      'Next.js', 'Nuxt', 'SvelteKit', 'Remix',
                      'Gatsby', 'Astro', 'Qwik', 'SolidJS',
                      'Alpine', 'Lit', 'Preact', 'Ember',
                      'Flutter', 'React Native', 'Ionic', 'Tailwind'
                    ].map(framework => (
                      <Card key={framework} className="p-2 text-center text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                        {framework}
                      </Card>
                    ))}
                  </div>
                  
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-center">
                      <span className="font-bold text-blue-600">20+ frameworks</span> vs competitors' 3-4
                    </p>
                  </Card>
                </div>
              )}

              {currentStepData.id === 'backend-credits' && (
                <div className="space-y-4">
                  <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0">
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold text-green-600">$50 - $150</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bundled backend credits every month
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { name: 'Supabase', credit: '$50+' },
                        { name: 'Firebase', credit: '$50+' },
                        { name: 'Neon', credit: '$50+' },
                        { name: 'PlanetScale', credit: '$50+' }
                      ].map(backend => (
                        <div key={backend.name} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                          <span className="font-medium">{backend.name}</span>
                          <Badge variant="default">{backend.credit} included</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {currentStepData.id === 'complete' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                    >
                      <Rocket className="w-20 h-20 mx-auto text-blue-600 mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">You're Ready to Launch! 🎉</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Let's clone your first website and see the magic happen!
                    </p>
                  </div>
                  
                  <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <p className="text-center text-sm">
                      <span className="font-semibold">Pro tip:</span> Start with a simple site to get familiar with the tools
                    </p>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-blue-600' 
                    : index < currentStep 
                    ? 'bg-blue-400' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {isLastStep ? 'Start Cloning' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}