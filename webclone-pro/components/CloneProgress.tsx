'use client'

import { useEffect, useState } from 'react'
import { wsManager, CloneProgress, WebSocketMessage } from '@/lib/websocket'
import { 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download,
  FileText,
  Image,
  Video,
  Code,
  Loader2
} from 'lucide-react'

interface CloneProgressProps {
  projectId: string
  onComplete?: () => void
}

export default function CloneProgressComponent({ projectId, onComplete }: CloneProgressProps) {
  const [progress, setProgress] = useState<CloneProgress>({
    projectId,
    status: 'pending',
    progress: 0,
    currentTask: 'Initializing...'
  })
  const [logs, setLogs] = useState<string[]>([])
  const [assets, setAssets] = useState({
    html: 0,
    css: 0,
    js: 0,
    images: 0,
    videos: 0,
    other: 0
  })

  useEffect(() => {
    const unsubscribe = wsManager.subscribe(projectId, (message: WebSocketMessage) => {
      if (message.type === 'progress') {
        setProgress(message.data)
      } else if (message.type === 'log') {
        setLogs(prev => [...prev.slice(-99), message.data.message])
      } else if (message.type === 'completed') {
        setProgress(prev => ({ ...prev, status: 'completed', progress: 100 }))
        onComplete?.()
      } else if (message.type === 'error') {
        setProgress(prev => ({ 
          ...prev, 
          status: 'failed', 
          errors: [...(prev.errors || []), message.data.error]
        }))
      }
    })

    // Connect WebSocket
    wsManager.connect()

    return () => {
      unsubscribe()
    }
  }, [projectId, onComplete])

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed': return 'text-green-400 bg-green-400/20'
      case 'failed': return 'text-red-400 bg-red-400/20'
      case 'cloning': return 'text-blue-400 bg-blue-400/20'
      case 'processing': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-yellow-400 bg-yellow-400/20'
    }
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />
      case 'failed': return <AlertCircle className="w-5 h-5" />
      case 'cloning':
      case 'processing': return <Loader2 className="w-5 h-5 animate-spin" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Clone Progress</h3>
            <p className="text-sm text-white/60 capitalize">{progress.status}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{Math.round(progress.progress)}%</div>
          {progress.estimatedTimeRemaining && (
            <div className="text-sm text-white/60">
              ~{formatTime(progress.estimatedTimeRemaining)} remaining
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out relative"
            style={{ width: `${progress.progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/60">{progress.currentTask}</span>
          {progress.totalPages && (
            <span className="text-xs text-white/60">
              {progress.pagesCompleted || 0} / {progress.totalPages} pages
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">{assets.html}</span>
          </div>
          <div className="text-xs text-white/60">HTML Pages</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Image className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">{assets.images}</span>
          </div>
          <div className="text-xs text-white/60">Images</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <Code className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">{assets.js + assets.css}</span>
          </div>
          <div className="text-xs text-white/60">Scripts & Styles</div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="border-t border-white/10 pt-4">
        <h4 className="text-sm font-medium text-white/60 mb-3">Activity Log</h4>
        <div className="bg-black/30 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
          {logs.slice(-5).map((log, index) => (
            <div key={index} className="text-xs text-white/60 font-mono">
              <span className="text-white/40">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-xs text-white/40 italic">Waiting for activity...</div>
          )}
        </div>
      </div>

      {/* Errors */}
      {progress.errors && progress.errors.length > 0 && (
        <div className="border-t border-white/10 pt-4 mt-4">
          <h4 className="text-sm font-medium text-red-400 mb-3">Errors</h4>
          <div className="bg-red-500/10 rounded-lg p-3 space-y-1">
            {progress.errors.map((error, index) => (
              <div key={index} className="text-xs text-red-400">
                • {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {progress.status === 'completed' && (
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Clone completed successfully!</span>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}