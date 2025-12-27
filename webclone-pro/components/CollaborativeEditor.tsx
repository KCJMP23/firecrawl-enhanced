'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  RoomProvider,
  useMyPresence,
  useOthers,
  useBroadcastEvent,
  useEventListener,
  useStorage,
  useMutation,
  useRoom,
  useStatus
} from '@/lib/liveblocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import {
  Users,
  MousePointer,
  Edit3,
  Eye,
  Lock,
  Unlock,
  MessageSquare,
  Undo,
  Redo,
  Save,
  Share2,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Code,
  Palette,
  Layers,
  Sparkles
} from 'lucide-react'
import { generateUserColor, formatUserInitials, getPermissions, type Presence } from '@/lib/liveblocks'

interface CollaborativeEditorProps {
  projectId: string
  children: React.ReactNode
}

export function CollaborativeEditor({ projectId, children }: CollaborativeEditorProps) {
  const roomId = `project-${projectId}`

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selectedElement: null,
        user: {
          id: '',
          name: '',
          avatar: '',
          color: ''
        },
        isTyping: false,
        currentView: 'editor'
      }}
    >
      <CollaborativeWorkspace projectId={projectId}>
        {children}
      </CollaborativeWorkspace>
    </RoomProvider>
  )
}

function CollaborativeWorkspace({ projectId, children }: CollaborativeEditorProps) {
  const [myPresence, updateMyPresence] = useMyPresence()
  const others = useOthers()
  const room = useRoom()
  const status = useStatus()
  const broadcast = useBroadcastEvent()
  
  const [showCursors, setShowCursors] = useState(true)
  const [showActivity, setShowActivity] = useState(true)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [selectedTool, setSelectedTool] = useState<'select' | 'edit' | 'comment'>('select')

  // Track mouse movement for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (showCursors) {
        updateMyPresence({
          cursor: { x: e.clientX, y: e.clientY }
        })
      }
    }

    const handleMouseLeave = () => {
      updateMyPresence({ cursor: null })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [showCursors, updateMyPresence])

  // Listen for collaboration events
  useEventListener(({ event, user, connectionId }) => {
    switch (event.type) {
      case 'ELEMENT_SELECTED':
        toast(`${user.info.name} selected an element`, {
          icon: <MousePointer className="w-4 h-4" />
        })
        break
      case 'CODE_UPDATED':
        toast(`${user.info.name} updated the code`, {
          icon: <Code className="w-4 h-4" />
        })
        break
      case 'COMMENT_ADDED':
        toast(`${user.info.name} added a comment`, {
          icon: <MessageSquare className="w-4 h-4" />
        })
        break
      case 'AI_SUGGESTION':
        toast(`AI suggested: ${event.suggestion}`, {
          icon: <Sparkles className="w-4 h-4" />
        })
        break
    }
  })

  // Render other users' cursors
  const cursors = others.map(({ connectionId, presence, info }) => {
    if (!presence.cursor) return null

    return (
      <div
        key={connectionId}
        className="absolute pointer-events-none z-50"
        style={{
          left: presence.cursor.x,
          top: presence.cursor.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <MousePointer
          className="w-6 h-6"
          style={{ color: presence.user.color || generateUserColor(info.id) }}
        />
        <div
          className="absolute top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
          style={{ backgroundColor: presence.user.color || generateUserColor(info.id) }}
        >
          {info.name}
        </div>
      </div>
    )
  })

  const permissions = useMemo(() => {
    const self = room.getSelf()
    return self ? getPermissions(self.info.role) : null
  }, [room])

  return (
    <div className="relative w-full h-full">
      {/* Collaboration Toolbar */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {/* Active Users */}
        <Card className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div className="flex -space-x-2">
              {others.slice(0, 5).map(({ connectionId, info }) => (
                <TooltipProvider key={connectionId}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-800">
                        <AvatarImage src={info.avatar} />
                        <AvatarFallback
                          style={{ backgroundColor: generateUserColor(info.id) }}
                        >
                          {formatUserInitials(info.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <span>{info.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {info.role}
                        </Badge>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {others.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                  +{others.length - 5}
                </div>
              )}
            </div>
            <Badge variant={status === 'connected' ? 'default' : 'secondary'}>
              {status === 'connected' ? 'Live' : 'Connecting...'}
            </Badge>
          </div>
        </Card>

        {/* Collaboration Tools */}
        <Card className="px-2 py-2">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showCursors ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setShowCursors(!showCursors)}
                  >
                    <MousePointer className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showCursors ? 'Hide' : 'Show'} Cursors
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'edit' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('edit')}
                    disabled={!permissions?.canEdit}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'comment' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('comment')}
                    disabled={!permissions?.canComment}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Comment Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      broadcast({
                        type: 'AI_SUGGESTION',
                        suggestion: 'Consider using a grid layout here',
                        targetElement: 'hero-section'
                      })
                    }}
                    disabled={!permissions?.canUseAI}
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI Suggestions</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isVoiceEnabled ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  >
                    {isVoiceEnabled ? 
                      <Mic className="w-4 h-4" /> : 
                      <MicOff className="w-4 h-4" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isVideoEnabled ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? 
                      <Video className="w-4 h-4" /> : 
                      <VideoOff className="w-4 h-4" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Card>

        {/* Share Button */}
        <Button
          variant="default"
          className="bg-gradient-to-r from-primary to-purple-600"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Collaboration link copied!')
          }}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Live Activity Feed */}
      {showActivity && (
        <div className="absolute bottom-4 right-4 z-40 w-80">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Live Activity
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {others.map(({ connectionId, presence, info }) => (
                <div key={connectionId} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: generateUserColor(info.id) }}
                  />
                  <span className="font-medium">{info.name}</span>
                  <span className="text-gray-500">
                    {presence.isTyping ? 'is typing...' : 
                     presence.currentView === 'code' ? 'viewing code' :
                     presence.currentView === 'preview' ? 'in preview' :
                     'editing'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Render cursors */}
      {showCursors && cursors}

      {/* Main content */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  )
}