'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  Upload,
  Zap,
  Brain,
  Search,
  MessageSquare,
  Download,
  Image,
  Hash,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function PDFDemo() {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [demoResults, setDemoResults] = useState<any>(null)
  const [chatQuery, setChatQuery] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const runDemo = async () => {
    setProcessing(true)
    setProgress(0)
    
    // Simulate PDF processing steps
    const steps = [
      { name: 'Uploading PDF', duration: 1000 },
      { name: 'Extracting text content', duration: 2000 },
      { name: 'Extracting images', duration: 1500 },
      { name: 'Generating embeddings', duration: 3000 },
      { name: 'AI analysis', duration: 2500 },
      { name: 'Building search index', duration: 1000 }
    ]
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (step) {
        toast.info(step.name)
        await new Promise(resolve => setTimeout(resolve, step.duration))
        setProgress(((i + 1) / steps.length) * 100)
      }
    }
    
    // Mock results
    const mockResults = {
      filename: 'sample-document.pdf',
      pages: 24,
      textChunks: 156,
      images: 8,
      processingTime: '11.2 seconds',
      summary: 'This document presents a comprehensive analysis of modern web development frameworks and their impact on user experience. It covers topics including React, Vue.js, Angular, and emerging technologies like WebAssembly and Progressive Web Apps.',
      topics: [
        'Web Development',
        'React Framework', 
        'Vue.js',
        'Angular',
        'Progressive Web Apps',
        'WebAssembly',
        'User Experience',
        'Performance Optimization'
      ],
      entities: [
        'Facebook (React)',
        'Google (Angular)',
        'Evan You (Vue.js)',
        'Mozilla (WebAssembly)',
        'W3C Standards',
        'ECMAScript',
        'TypeScript',
        'Node.js'
      ],
      extractedImages: [
        {
          page: 3,
          description: 'Architecture diagram showing the relationship between frontend frameworks and browser APIs',
          type: 'Diagram'
        },
        {
          page: 7,
          description: 'Performance comparison chart displaying load times across different frameworks',
          type: 'Chart'
        },
        {
          page: 15,
          description: 'Code snippet demonstrating React component lifecycle methods',
          type: 'Code Sample'
        }
      ]
    }
    
    setDemoResults(mockResults)
    setProcessing(false)
    toast.success('PDF processing completed!')
  }

  const handleChatQuery = async () => {
    if (!chatQuery.trim()) return
    
    setChatLoading(true)
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResponses: Record<string, string> = {
      'react': 'Based on the document, React is described as a popular JavaScript library for building user interfaces, developed by Facebook. The document mentions that React uses a virtual DOM for efficient rendering and has a component-based architecture that promotes code reusability.',
      'performance': 'The document includes a detailed performance comparison showing that modern frameworks have significantly improved load times. The analysis indicates that proper optimization techniques can reduce initial page load by up to 60% compared to legacy implementations.',
      'frameworks': 'The document compares three major frameworks: React (developed by Facebook), Vue.js (created by Evan You), and Angular (maintained by Google). Each framework has distinct advantages - React for flexibility, Vue.js for ease of learning, and Angular for enterprise applications.',
      'default': 'Based on the document content, I can provide information about web development frameworks, performance optimization, Progressive Web Apps, and related technologies. What specific aspect would you like to know more about?'
    }
    
    const query = chatQuery.toLowerCase()
    let response = mockResponses.default
    
    for (const [key, value] of Object.entries(mockResponses)) {
      if (key !== 'default' && query.includes(key)) {
        response = value
        break
      }
    }
    
    setChatResponse(response || 'No response available')
    setChatLoading(false)
    setChatQuery('')
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PDF Intelligence Demo
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Experience our advanced PDF processing and AI analysis capabilities. See how we extract content, 
          generate embeddings, and enable intelligent document search.
        </p>
      </div>

      {/* Demo Control */}
      <div className="text-center">
        <Button 
          onClick={runDemo} 
          disabled={processing}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8 py-6"
        >
          {processing ? (
            <>
              <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-3" />
              Run Demo Processing
            </>
          )}
        </Button>
      </div>

      {/* Processing Progress */}
      {processing && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing PDF...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-gray-600 text-center">
                Extracting content and generating AI insights
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Results */}
      {demoResults && (
        <div className="space-y-6">
          {/* Processing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Processing Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{demoResults.pages}</div>
                  <div className="text-sm text-gray-600">Pages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{demoResults.textChunks}</div>
                  <div className="text-sm text-gray-600">Text Chunks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{demoResults.images}</div>
                  <div className="text-sm text-gray-600">Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{demoResults.processingTime}</div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Generated Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{demoResults.summary}</p>
              </CardContent>
            </Card>

            {/* Key Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Extracted Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {demoResults.topics.map((topic: string) => (
                    <Badge key={topic} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Entities */}
            <Card>
              <CardHeader>
                <CardTitle>Key Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoResults.entities.map((entity: string) => (
                    <div key={entity} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      {entity}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extracted Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Extracted Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoResults.extractedImages.map((img: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Page {img.page}</span>
                          <Badge variant="outline" className="text-xs">{img.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{img.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Chat Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI Document Chat Demo
              </CardTitle>
              <CardDescription>
                Try asking questions about the processed document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Ask about React, performance, frameworks, etc."
                  onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleChatQuery()}
                  disabled={chatLoading}
                />
                <Button onClick={handleChatQuery} disabled={!chatQuery.trim() || chatLoading}>
                  {chatLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              
              {chatResponse && (
                <Alert>
                  <Brain className="w-4 h-4" />
                  <AlertDescription>
                    <strong>AI Response:</strong> {chatResponse}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-gray-500">
                <p><strong>Try asking:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>"What does the document say about React?"</li>
                  <li>"How do the frameworks compare in terms of performance?"</li>
                  <li>"What are the main topics covered?"</li>
                  <li>"Tell me about Progressive Web Apps"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">Process PDFs in seconds with our optimized pipeline</p>
            </Card>
            
            <Card className="text-center p-6">
              <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-600">Extract insights, topics, and entities automatically</p>
            </Card>
            
            <Card className="text-center p-6">
              <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Semantic Search</h3>
              <p className="text-sm text-gray-600">Find information using natural language queries</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}