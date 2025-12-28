'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useStorage, useMutation, useOthers, useMyPresence } from '@/lib/liveblocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code, 
  FileCode, 
  FolderOpen, 
  Save, 
  Play, 
  Copy, 
  Download,
  Share2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import { generateUserColor } from '@/lib/liveblocks'

interface CollaborativeCodeEditorProps {
  projectId: string
  initialCode?: string
  language?: string
  onSave?: (code: string) => void
  onRun?: (code: string) => void
}

interface FileTab {
  id: string
  name: string
  language: string
  content: string
  locked?: boolean
  lockedBy?: string
}

export function CollaborativeCodeEditor({
  projectId,
  initialCode = '',
  language = 'javascript',
  onSave,
  onRun
}: CollaborativeCodeEditorProps) {
  const [activeTab, setActiveTab] = useState('index.js')
  const [files, setFiles] = useState<FileTab[]>([
    { id: 'index.js', name: 'index.js', language: 'javascript', content: initialCode },
    { id: 'styles.css', name: 'styles.css', language: 'css', content: '' },
    { id: 'index.html', name: 'index.html', language: 'html', content: '' }
  ])
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [conflicts, setConflicts] = useState<string[]>([])
  
  const editorRef = useRef<any>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const bindingRef = useRef<MonacoBinding | null>(null)
  
  const others = useOthers()
  const [myPresence, updateMyPresence] = useMyPresence()
  
  // Initialize Yjs for collaborative editing
  useEffect(() => {
    if (typeof window === 'undefined') return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    // Create WebSocket provider for real-time sync
    const provider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL || 'ws://localhost:1234',
      `project-${projectId}`,
      ydoc
    )
    providerRef.current = provider

    // Set user awareness
    provider.awareness.setLocalStateField('user', {
      name: myPresence.user.name,
      color: myPresence.user.color || generateUserColor(myPresence.user.id)
    })

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy()
      }
      provider.disconnect()
      ydoc.destroy()
    }
  }, [projectId, myPresence])

  // Lock/unlock file for editing
  const toggleFileLock = useMutation(
    ({ storage }, fileId: string, lock: boolean) => {
      const codeChanges = storage.get('codeChanges')
      const file = codeChanges.get(fileId)
      
      if (file) {
        const updatedFile = {
          ...file,
          lockedBy: lock ? myPresence.user.id : undefined
        }
        codeChanges.set(fileId, updatedFile)
      }
    },
    [myPresence.user.id]
  )

  // Handle file save
  const handleSave = useCallback(async () => {
    setSaving(true)
    
    try {
      const activeFile = files.find(f => f.id === activeTab)
      if (activeFile && onSave) {
        await onSave(activeFile.content)
        toast.success(`${activeFile.name} saved successfully`)
      }
    } catch (error) {
      toast.error('Failed to save file')
    } finally {
      setSaving(false)
    }
  }, [files, activeTab, onSave])

  // Handle code execution
  const handleRun = useCallback(async () => {
    setRunning(true)
    
    try {
      const activeFile = files.find(f => f.id === activeTab)
      if (activeFile && onRun) {
        await onRun(activeFile.content)
        toast.success('Code executed successfully')
      }
    } catch (error) {
      toast.error('Execution failed')
    } finally {
      setRunning(false)
    }
  }, [files, activeTab, onRun])

  // Auto-save with conflict detection
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for conflicts
      const activeFile = files.find(f => f.id === activeTab)
      if (activeFile?.locked && activeFile.lockedBy !== myPresence.user.id) {
        setConflicts(prev => [...new Set([...prev, activeTab])])
      } else {
        setConflicts(prev => prev.filter(id => id !== activeTab))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [files, activeTab, myPresence.user.id])

  // Render active users in current file
  const activeUsers = others.filter(other => 
    other.presence.selectedElement === activeTab
  )

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            <span className="font-semibold">Collaborative Code Editor</span>
          </div>
          
          {/* File tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {files.map(file => (
                <TabsTrigger key={file.id} value={file.id} className="relative">
                  <span className="flex items-center gap-2">
                    {file.name}
                    {file.locked && (
                      <Lock className="w-3 h-3 text-yellow-500" />
                    )}
                    {conflicts.includes(file.id) && (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          {/* Active collaborators */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="text-sm">{activeUsers.length} editing</span>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map(({ connectionId, info }) => (
                  <div
                    key={connectionId}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: generateUserColor(info.email) }}
                  >
                    {info.name[0]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File lock toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const file = files.find(f => f.id === activeTab)
              if (file) {
                const shouldLock = !file.locked || file.lockedBy !== myPresence.user.id
                toggleFileLock(activeTab, shouldLock)
                setFiles(prev => prev.map(f => 
                  f.id === activeTab 
                    ? { ...f, locked: shouldLock, lockedBy: shouldLock ? myPresence.user.id : undefined }
                    : f
                ))
                toast(shouldLock ? 'File locked for editing' : 'File unlocked')
              }
            }}
          >
            {files.find(f => f.id === activeTab)?.locked ? 
              <Unlock className="w-4 h-4" /> : 
              <Lock className="w-4 h-4" />
            }
          </Button>

          {/* Save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>

          {/* Run button */}
          <Button
            variant="default"
            size="sm"
            onClick={handleRun}
            disabled={running}
          >
            <Play className="w-4 h-4 mr-2" />
            {running ? 'Running...' : 'Run'}
          </Button>

          {/* Share button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(
                files.find(f => f.id === activeTab)?.content || ''
              )
              toast.success('Code copied to clipboard')
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Code editor area */}
      <div className="flex-1 relative">
        {conflicts.includes(activeTab) && (
          <div className="absolute top-2 right-2 z-10">
            <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">
                  This file is being edited by another user
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Monaco Editor would be integrated here */}
        <div className="w-full h-full bg-gray-900 text-gray-100 p-4 font-mono text-sm">
          <pre>
            <code>
              {files.find(f => f.id === activeTab)?.content || '// Start coding...'}
            </code>
          </pre>
        </div>

        {/* Collaborative cursors and selections would appear here */}
        {activeUsers.map(({ connectionId, presence, info }) => (
          <div
            key={connectionId}
            className="absolute pointer-events-none"
            style={{
              left: 100, // Would be actual cursor position
              top: 100,  // Would be actual cursor position
              opacity: 0.8
            }}
          >
            <div
              className="px-2 py-1 rounded text-xs text-white"
              style={{ backgroundColor: generateUserColor(info.email) }}
            >
              {info.name}
            </div>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t text-sm">
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {files.find(f => f.id === activeTab)?.language || 'plain'}
          </Badge>
          <span className="text-gray-500">Line 1, Column 1</span>
          <span className="text-gray-500">UTF-8</span>
        </div>

        <div className="flex items-center gap-2">
          {conflicts.length > 0 ? (
            <Badge variant="destructive">
              {conflicts.length} conflicts
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              In sync
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}