'use client'

import { InteractiveTutorials } from '@/components/tutorials/InteractiveTutorials'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  ArrowLeft,
  PlayCircle,
  BookOpen,
  Users,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Youtube,
  FileText,
  Lightbulb
} from 'lucide-react'
import { useState } from 'react'
import { useOnboarding } from '@/components/onboarding/OnboardingProvider'

function TutorialsContent() {
  const { startOnboarding } = useOnboarding()
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowHelp(true)}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button 
                onClick={startOnboarding}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Restart Onboarding
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Learning Hub
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Master WebClone Pro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Learn how to leverage our powerful features to build amazing websites faster than ever
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <PlayCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Video Tutorials</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Watch step-by-step video guides for all major features
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">15+ videos</Badge>
              <Badge variant="secondary">2 hours</Badge>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Documentation</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comprehensive guides and API documentation
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">50+ articles</Badge>
              <Badge variant="secondary">Always updated</Badge>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Community</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Join our community and learn from other users
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">10k+ members</Badge>
              <Badge variant="secondary">24/7 support</Badge>
            </div>
          </Card>
        </div>

        {/* Interactive Tutorials Section */}
        <InteractiveTutorials />

        {/* Additional Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tips & Tricks</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Discover pro tips to maximize your productivity
                  </p>
                  <Button variant="link" className="p-0">
                    Browse tips →
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                  <Youtube className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">YouTube Channel</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Subscribe for weekly tutorials and updates
                  </p>
                  <Button variant="link" className="p-0">
                    Subscribe now →
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Case Studies</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Learn from real-world success stories
                  </p>
                  <Button variant="link" className="p-0">
                    Read stories →
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Live Support</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Get help from our expert support team
                  </p>
                  <Button variant="link" className="p-0">
                    Start chat →
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We're here to help you succeed with WebClone Pro!
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => setShowHelp(false)}
              >
                Close
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TutorialsPage() {
  return (
    <OnboardingProvider>
      <TutorialsContent />
      <OnboardingModal />
    </OnboardingProvider>
  )
}