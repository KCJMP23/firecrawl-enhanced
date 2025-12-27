'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { driver, type Config as DriverConfig } from 'driver.js'
import 'driver.js/dist/driver.css'
import { toast } from 'sonner'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: () => void
}

interface OnboardingContext {
  isOnboarding: boolean
  currentStep: number
  steps: OnboardingStep[]
  startOnboarding: () => void
  completeStep: (stepId: string) => void
  skipOnboarding: () => void
  nextStep: () => void
  previousStep: () => void
  progress: number
}

const OnboardingContext = createContext<OnboardingContext | undefined>(undefined)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

interface OnboardingProviderProps {
  children: ReactNode
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to WebClone Pro! 🎉',
    description: 'Let\'s take a quick tour to help you get started with our powerful features.',
    completed: false
  },
  {
    id: 'clone-website',
    title: 'Clone Any Website',
    description: 'Simply enter a URL and our AI will clone it instantly. No tokens, unlimited clones!',
    completed: false
  },
  {
    id: 'ai-customization',
    title: 'AI-Powered Customization',
    description: 'Use our AI to modify designs, change content, and adapt to your brand.',
    completed: false
  },
  {
    id: 'animation-extraction',
    title: 'Extract Animations',
    description: 'Copy animations from any website - a feature competitors don\'t offer!',
    completed: false
  },
  {
    id: 'design-dna',
    title: 'Design DNA System',
    description: 'Extract complete design systems including colors, fonts, and spacing.',
    completed: false
  },
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration',
    description: 'Invite team members to edit together with live cursors and voice chat.',
    completed: false
  },
  {
    id: 'export-frameworks',
    title: '20+ Framework Exports',
    description: 'Export to React, Vue, Angular, Next.js, and 16+ more frameworks.',
    completed: false
  },
  {
    id: 'backend-credits',
    title: 'Bundled Backend Credits',
    description: 'Get $50-150 in backend credits included - no separate billing!',
    completed: false
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'Start cloning websites and building amazing projects!',
    completed: false
  }
]

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState(ONBOARDING_STEPS)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (profile && !profile.onboarding_completed && !hasSeenOnboarding) {
        // Auto-start onboarding for new users
        setTimeout(() => startOnboarding(), 1000)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const startOnboarding = () => {
    setIsOnboarding(true)
    setCurrentStep(0)
    setHasSeenOnboarding(true)

    // Initialize driver.js for the tour
    const driverConfig: DriverConfig = {
      showProgress: true,
      animate: true,
      smoothScroll: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 4,
      stageRadius: 8,
      popoverClass: 'webclone-onboarding-popover',
      progressText: '{{current}} of {{total}}',
      showButtons: ['next', 'previous'],
      steps: [
        {
          element: '[data-tour="dashboard"]',
          popover: {
            title: 'Your Dashboard',
            description: 'This is your central hub. View all projects, track usage, and access features.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '[data-tour="new-project"]',
          popover: {
            title: 'Start a New Clone',
            description: 'Click here to clone any website instantly. Just enter the URL!',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '[data-tour="ai-assistant"]',
          popover: {
            title: 'AI Assistant',
            description: 'Your AI helper can modify designs, generate content, and answer questions.',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '[data-tour="animation-tools"]',
          popover: {
            title: 'Animation Extraction',
            description: 'Extract and reuse animations from any website - exclusive to WebClone Pro!',
            side: 'right',
            align: 'center'
          }
        },
        {
          element: '[data-tour="collaboration"]',
          popover: {
            title: 'Team Collaboration',
            description: 'Invite team members and work together in real-time.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '[data-tour="export-options"]',
          popover: {
            title: 'Export to Any Framework',
            description: 'Export your project to 20+ frameworks including React, Vue, and Next.js.',
            side: 'top',
            align: 'center'
          }
        }
      ],
      onDestroyStarted: () => {
        if (currentStep === steps.length - 1) {
          completeOnboarding()
        }
      }
    }

    const driverObj = driver(driverConfig)
    driverObj.drive()
  }

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeOnboarding()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipOnboarding = () => {
    setIsOnboarding(false)
    toast.info('Onboarding skipped. You can restart it anytime from settings.')
    saveOnboardingStatus(false)
  }

  const completeOnboarding = async () => {
    setIsOnboarding(false)
    toast.success('Welcome aboard! You\'re ready to start cloning websites! 🚀')
    await saveOnboardingStatus(true)
    
    // Navigate to new project page
    router.push('/dashboard/new')
  }

  const saveOnboardingStatus = async (completed: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: completed,
          onboarding_date: new Date().toISOString()
        })
        .eq('id', session.user.id)
    } catch (error) {
      console.error('Error saving onboarding status:', error)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <OnboardingContext.Provider 
      value={{
        isOnboarding,
        currentStep,
        steps,
        startOnboarding,
        completeStep,
        skipOnboarding,
        nextStep,
        previousStep,
        progress
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}