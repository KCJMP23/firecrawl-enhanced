'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CollaborativeEditor } from '@/components/CollaborativeEditor'
import { CollaborativeCanvas } from '@/components/CollaborativeCanvas'
import { CollaborativeCodeEditor } from '@/components/CollaborativeCodeEditor'
import {
  ArrowLeft,
  Eye,
  Code,
  Palette,
  Sparkles,
  Download,
  Share2,
  Users,
  Layers,
  MousePointer,
  MessageSquare,
  Video,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface CollaborativeEditorPageProps {
  params: Promise<{ id: string }>
}

export default function CollaborativeEditorPage(props: CollaborativeEditorPageProps) {
  const params = use(props.params)
  const projectId = params.id
  const [viewMode, setViewMode] = useState<'canvas' | 'code' | 'preview'>('canvas')
  const router = useRouter()

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/editor/${projectId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Collaboration link copied! Share it with your team.')
  }

  const handleExport = async () => {
    toast.info('Exporting project...')
    // Export logic here
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Collaborative Editor</h1>
                <p className="text-xs text-gray-500">Project #{projectId}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'canvas' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('canvas')}
                className="rounded"
              >
                <Palette className="w-4 h-4 mr-2" />
                Canvas
              </Button>
              <Button
                variant={viewMode === 'code' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('code')}
                className="rounded"
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('preview')}
                className="rounded"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            {/* Action Buttons */}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <CollaborativeEditor projectId={projectId}>
          {viewMode === 'canvas' && (
            <CollaborativeCanvas
              projectId={projectId}
              initialElements={[
                {
                  id: 'hero-section',
                  type: 'rectangle',
                  position: { x: 100, y: 100 },
                  size: { width: 800, height: 400 },
                  styles: {
                    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px'
                  },
                  visible: true,
                  zIndex: 0
                },
                {
                  id: 'hero-text',
                  type: 'text',
                  position: { x: 150, y: 200 },
                  size: { width: 700, height: 100 },
                  content: 'Build Together in Real-Time',
                  styles: {
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center'
                  },
                  visible: true,
                  zIndex: 1
                }
              ]}
              onExport={(elements) => {
                console.log('Exporting elements:', elements)
                toast.success('Canvas exported successfully')
              }}
            />
          )}

          {viewMode === 'code' && (
            <CollaborativeCodeEditor
              projectId={projectId}
              initialCode={`// Welcome to Collaborative Coding!
// Multiple users can edit this code simultaneously

import React from 'react';
import { motion } from 'framer-motion';

export default function CollaborativeWebsite() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600"
    >
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white text-center">
          Build Together in Real-Time
        </h1>
        <p className="text-xl text-white/80 text-center mt-4">
          Experience the power of collaborative web development
        </p>
      </div>
    </motion.div>
  );
}`}
              onSave={(code) => {
                console.log('Saving code:', code)
                toast.success('Code saved successfully')
              }}
              onRun={(code) => {
                console.log('Running code:', code)
                toast.info('Code execution started')
              }}
            />
          )}

          {viewMode === 'preview' && (
            <div className="w-full h-full bg-white dark:bg-gray-900">
              <iframe
                src={`/preview/${projectId}`}
                className="w-full h-full border-0"
                title="Preview"
              />
            </div>
          )}
        </CollaborativeEditor>
      </div>

      {/* Collaboration Features Showcase */}
      {viewMode === 'canvas' && (
        <div className="absolute bottom-4 left-4 space-y-2">
          <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Live cursors enabled</span>
            </div>
          </Card>
          
          <Card className="p-3 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Click to add comments</span>
            </div>
          </Card>
          
          <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-green-600" />
              <span className="text-sm">Voice & video available</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}