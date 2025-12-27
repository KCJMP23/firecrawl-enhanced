'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Wand2,
  Palette,
  Users,
  Package,
  CreditCard,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  ChevronRight,
  Clock,
  Award,
  BookOpen,
  Video,
  FileText,
  Zap,
  Code,
  Layers,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  completed: boolean
  progress: number
  steps: TutorialStep[]
  videoUrl?: string
  articleUrl?: string
}

interface TutorialStep {
  id: string
  title: string
  description: string
  action?: string
  completed: boolean
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'clone-first-website',
    title: 'Clone Your First Website',
    description: 'Learn the basics of cloning any website with our AI-powered tools',
    duration: '5 min',
    difficulty: 'Beginner',
    category: 'Getting Started',
    completed: false,
    progress: 0,
    videoUrl: '/tutorials/clone-first-website.mp4',
    steps: [
      {
        id: 'step-1',
        title: 'Enter the URL',
        description: 'Paste the website URL you want to clone',
        action: 'Go to New Project',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Choose AI Settings',
        description: 'Select your preferred AI model and customization options',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Start Cloning',
        description: 'Click the clone button and watch the magic happen',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Review & Edit',
        description: 'Review the cloned website and make any edits',
        completed: false
      }
    ]
  },
  {
    id: 'extract-animations',
    title: 'Extract Website Animations',
    description: 'Master the art of extracting and reusing animations from any site',
    duration: '8 min',
    difficulty: 'Intermediate',
    category: 'Advanced Features',
    completed: false,
    progress: 0,
    articleUrl: '/docs/animation-extraction',
    steps: [
      {
        id: 'step-1',
        title: 'Identify Animations',
        description: 'Use our Chrome extension to detect animations',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Select Animation Type',
        description: 'Choose between GSAP, CSS, or Framer Motion',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Extract & Convert',
        description: 'Extract animations and convert to your preferred library',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Apply to Your Project',
        description: 'Integrate the animations into your cloned site',
        completed: false
      }
    ]
  },
  {
    id: 'design-system-extraction',
    title: 'Extract Design Systems',
    description: 'Learn how to extract complete design DNA from any website',
    duration: '10 min',
    difficulty: 'Advanced',
    category: 'Design Tools',
    completed: false,
    progress: 0,
    videoUrl: '/tutorials/design-system.mp4',
    steps: [
      {
        id: 'step-1',
        title: 'Analyze Design',
        description: 'Let AI analyze the website\'s design system',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Extract Colors',
        description: 'Get the complete color palette and variants',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Capture Typography',
        description: 'Extract fonts, sizes, and text styles',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Export to Tailwind',
        description: 'Generate a complete Tailwind config file',
        completed: false
      }
    ]
  },
  {
    id: 'team-collaboration',
    title: 'Collaborate with Your Team',
    description: 'Work together in real-time with live cursors and voice chat',
    duration: '6 min',
    difficulty: 'Beginner',
    category: 'Collaboration',
    completed: false,
    progress: 0,
    steps: [
      {
        id: 'step-1',
        title: 'Invite Team Members',
        description: 'Send invites to your team members',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Set Permissions',
        description: 'Configure who can edit, view, or comment',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Start Collaborating',
        description: 'Edit together with live cursors',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Use Voice Chat',
        description: 'Enable voice chat for better communication',
        completed: false
      }
    ]
  },
  {
    id: 'ai-customization',
    title: 'AI-Powered Customization',
    description: 'Use AI to modify and enhance your cloned websites',
    duration: '7 min',
    difficulty: 'Intermediate',
    category: 'AI Features',
    completed: false,
    progress: 0,
    videoUrl: '/tutorials/ai-customization.mp4',
    steps: [
      {
        id: 'step-1',
        title: 'Select AI Model',
        description: 'Choose between Claude, GPT-4, or Gemini',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Describe Changes',
        description: 'Tell the AI what you want to change',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Review Suggestions',
        description: 'Review AI-generated modifications',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Apply Changes',
        description: 'Apply the changes you like',
        completed: false
      }
    ]
  },
  {
    id: 'export-frameworks',
    title: 'Export to Any Framework',
    description: 'Learn how to export your project to 20+ different frameworks',
    duration: '5 min',
    difficulty: 'Beginner',
    category: 'Export',
    completed: false,
    progress: 0,
    steps: [
      {
        id: 'step-1',
        title: 'Choose Framework',
        description: 'Select from React, Vue, Angular, and more',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Configure Options',
        description: 'Set export preferences and optimizations',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Generate Code',
        description: 'Generate production-ready code',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Download Project',
        description: 'Download the complete project files',
        completed: false
      }
    ]
  }
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Getting Started': <Globe className="w-4 h-4" />,
  'Advanced Features': <Zap className="w-4 h-4" />,
  'Design Tools': <Palette className="w-4 h-4" />,
  'Collaboration': <Users className="w-4 h-4" />,
  'AI Features': <Sparkles className="w-4 h-4" />,
  'Export': <Package className="w-4 h-4" />
}

const DIFFICULTY_COLORS = {
  'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

export function InteractiveTutorials() {
  const [tutorials, setTutorials] = useState(TUTORIALS)
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [playingVideo, setPlayingVideo] = useState(false)

  const categories = ['All', ...Array.from(new Set(TUTORIALS.map(t => t.category)))]

  const filteredTutorials = tutorials.filter(tutorial => 
    activeCategory === 'All' || tutorial.category === activeCategory
  )

  const completedCount = tutorials.filter(t => t.completed).length
  const totalProgress = (completedCount / tutorials.length) * 100

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial)
    toast.info(`Starting: ${tutorial.title}`)
  }

  const completeStep = (tutorialId: string, stepId: string) => {
    setTutorials(prev => prev.map(tutorial => {
      if (tutorial.id === tutorialId) {
        const updatedSteps = tutorial.steps.map(step => 
          step.id === stepId ? { ...step, completed: true } : step
        )
        const completedSteps = updatedSteps.filter(s => s.completed).length
        const progress = (completedSteps / updatedSteps.length) * 100
        const completed = progress === 100

        if (completed && !tutorial.completed) {
          toast.success(`Tutorial completed: ${tutorial.title}! 🎉`)
        }

        return {
          ...tutorial,
          steps: updatedSteps,
          progress,
          completed
        }
      }
      return tutorial
    }))
  }

  const resetTutorial = (tutorialId: string) => {
    setTutorials(prev => prev.map(tutorial => {
      if (tutorial.id === tutorialId) {
        return {
          ...tutorial,
          steps: tutorial.steps.map(step => ({ ...step, completed: false })),
          progress: 0,
          completed: false
        }
      }
      return tutorial
    }))
    toast.info('Tutorial progress reset')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interactive Tutorials</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Learn how to use WebClone Pro like a pro
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
            <p className="text-2xl font-bold">{Math.round(totalProgress)}%</p>
          </div>
          <Award className={`w-12 h-12 ${totalProgress === 100 ? 'text-yellow-500' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">
              {completedCount} of {tutorials.length} tutorials completed
            </span>
            <Badge variant={totalProgress === 100 ? 'default' : 'secondary'}>
              {totalProgress === 100 ? 'Master' : 'Learning'}
            </Badge>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-7 w-full">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="flex items-center gap-1">
              {category !== 'All' && CATEGORY_ICONS[category]}
              <span className="hidden sm:inline">{category}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredTutorials.map(tutorial => (
              <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {CATEGORY_ICONS[tutorial.category]}
                        <h3 className="text-lg font-semibold">{tutorial.title}</h3>
                        <Badge className={DIFFICULTY_COLORS[tutorial.difficulty]}>
                          {tutorial.difficulty}
                        </Badge>
                        {tutorial.completed && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {tutorial.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {tutorial.duration}
                        </div>
                        {tutorial.videoUrl && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Video className="w-4 h-4" />
                            Video
                          </div>
                        )}
                        {tutorial.articleUrl && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FileText className="w-4 h-4" />
                            Article
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {tutorial.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs font-medium">{Math.round(tutorial.progress)}%</span>
                          </div>
                          <Progress value={tutorial.progress} className="h-2" />
                        </div>
                      )}

                      {/* Steps Preview */}
                      <div className="space-y-2 mb-4">
                        {tutorial.steps.slice(0, 2).map(step => (
                          <div key={step.id} className="flex items-center gap-2 text-sm">
                            {step.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={step.completed ? 'line-through text-gray-500' : ''}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                        {tutorial.steps.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{tutorial.steps.length - 2} more steps
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => startTutorial(tutorial)}
                          className="flex items-center gap-2"
                        >
                          {tutorial.progress > 0 && tutorial.progress < 100 ? (
                            <>
                              Continue
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : tutorial.completed ? (
                            <>
                              Review
                              <BookOpen className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Start Tutorial
                              <Play className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                        
                        {tutorial.progress > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetTutorial(tutorial.id)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tutorial Player Modal */}
      <AnimatePresence>
        {selectedTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTutorial(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTutorial.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTutorial.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTutorial(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedTutorial.videoUrl && (
                  <div className="mb-6">
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setPlayingVideo(!playingVideo)}
                      >
                        {playingVideo ? (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Pause Video
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Play Video
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Steps to Complete:</h3>
                  {selectedTutorial.steps.map((step, index) => (
                    <Card
                      key={step.id}
                      className={`p-4 cursor-pointer transition-all ${
                        step.completed ? 'bg-green-50 dark:bg-green-900/20' : ''
                      }`}
                      onClick={() => completeStep(selectedTutorial.id, step.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            Step {index + 1}: {step.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {step.description}
                          </p>
                          {step.action && (
                            <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                              {step.action}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}