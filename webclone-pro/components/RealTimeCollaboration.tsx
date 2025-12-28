'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Users,
  MessageSquare,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share,
  Edit3,
  Eye,
  Clock,
  Activity,
  Settings,
  UserPlus,
  Crown,
  Shield,
  Zap,
  FileText,
  Code,
  Image as ImageIcon,
  Layout,
  Palette,
  CheckCircle,
  AlertCircle,
  Bell,
  BellOff,
  MoreHorizontal,
  Copy,
  Download,
  RefreshCw,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  AtSign,
  Phone,
  PhoneOff,
  Monitor,
  Smartphone,
  MousePointer,
  Send
} from 'lucide-react'

interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  currentView: string
  cursor: {
    x: number
    y: number
    color: string
  }
  isTyping: boolean
  permissions: {
    edit: boolean
    comment: boolean
    share: boolean
    admin: boolean
  }
}

interface ChangeEvent {
  id: string
  type: 'edit' | 'comment' | 'share' | 'view' | 'join' | 'leave'
  user: CollaborationUser
  timestamp: Date
  description: string
  target?: string
  oldValue?: string
  newValue?: string
  location: string
}

interface ChatMessage {
  id: string
  userId: string
  content: string
  timestamp: Date
  type: 'text' | 'system' | 'file' | 'mention'
  attachments?: {
    type: 'image' | 'file' | 'code'
    url: string
    name: string
    size?: number
  }[]
  mentions?: string[]
  reactions?: {
    emoji: string
    users: string[]
  }[]
}

interface VideoCall {
  id: string
  participants: string[]
  isActive: boolean
  startTime: Date
  duration: number
  isRecording: boolean
  settings: {
    video: boolean
    audio: boolean
    screenshare: boolean
  }
}

function SimpleButton({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false,
  ...props 
}: {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = 
    variant === 'outline' ? 'border border-white/20 bg-transparent hover:bg-white/10 text-white' :
    variant === 'ghost' ? 'hover:bg-white/10 text-white' :
    variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
    'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
  const sizeClasses = 
    size === 'sm' ? 'h-8 px-3 text-sm' : 
    size === 'lg' ? 'h-12 px-8 text-lg' :
    size === 'icon' ? 'h-10 w-10' :
    'h-10 px-4 py-2'
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

function SimpleCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 ${className}`}>
      {children}
    </div>
  )
}

function UserAvatar({ user, size = 'default', showStatus = true }: {
  user: CollaborationUser
  size?: 'sm' | 'default' | 'lg'
  showStatus?: boolean
}) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    default: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  const statusColors = {
    online: 'bg-green-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400',
    offline: 'bg-gray-400'
  }

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium`}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${statusColors[user.status]}`} />
      )}
    </div>
  )
}

function UserCard({ user, onUserAction }: {
  user: CollaborationUser
  onUserAction: (action: string, userId: string) => void
}) {
  const getRoleIcon = () => {
    switch (user.role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-400" />
      case 'admin': return <Shield className="w-4 h-4 text-purple-400" />
      case 'editor': return <Edit3 className="w-4 h-4 text-blue-400" />
      case 'viewer': return <Eye className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleColor = () => {
    switch (user.role) {
      case 'owner': return 'text-yellow-400 bg-yellow-400/20'
      case 'admin': return 'text-purple-400 bg-purple-400/20'
      case 'editor': return 'text-blue-400 bg-blue-400/20'
      case 'viewer': return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center space-x-3">
        <UserAvatar user={user} />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">{user.name}</span>
            {user.isTyping && (
              <div className="flex items-center space-x-1 text-blue-400">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/60">{user.email}</span>
            <span className="text-xs text-white/40">• {user.currentView}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
          <span className="flex items-center space-x-1">
            {getRoleIcon()}
            <span>{user.role}</span>
          </span>
        </span>
        
        <div className="relative group">
          <SimpleButton variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </SimpleButton>
          
          <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
            <div className="p-1">
              <button 
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                onClick={() => onUserAction('message', user.id)}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Send Message
              </button>
              <button 
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                onClick={() => onUserAction('follow', user.id)}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Follow View
              </button>
              <button 
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                onClick={() => onUserAction('call', user.id)}
              >
                <Video className="w-4 h-4 inline mr-2" />
                Video Call
              </button>
              <div className="border-t border-white/10 my-1" />
              <button 
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-red-400"
                onClick={() => onUserAction('remove', user.id)}
              >
                Remove Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChangeEventCard({ event }: { event: ChangeEvent }) {
  const getEventIcon = () => {
    switch (event.type) {
      case 'edit': return <Edit3 className="w-4 h-4 text-blue-400" />
      case 'comment': return <MessageSquare className="w-4 h-4 text-green-400" />
      case 'share': return <Share className="w-4 h-4 text-purple-400" />
      case 'view': return <Eye className="w-4 h-4 text-gray-400" />
      case 'join': return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case 'leave': return <ArrowDownRight className="w-4 h-4 text-red-400" />
    }
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
      <div className="p-1 rounded">
        {getEventIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <UserAvatar user={event.user} size="sm" showStatus={false} />
          <span className="text-white text-sm font-medium">{event.user.name}</span>
          <span className="text-white/60 text-xs">
            {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-white/80 text-sm">{event.description}</p>
        {event.location && (
          <p className="text-white/40 text-xs mt-1">in {event.location}</p>
        )}
      </div>
    </div>
  )
}

function ChatMessage({ message, currentUserId, onReaction }: {
  message: ChatMessage
  currentUserId: string
  onReaction: (messageId: string, emoji: string) => void
}) {
  const isOwn = message.userId === currentUserId

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-white/80">User {message.userId}</span>
            <span className="text-xs text-white/40">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        
        <div className={`rounded-lg px-4 py-2 ${
          isOwn 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-white/10 text-white/90'
        }`}>
          {message.type === 'text' && (
            <p className="text-sm">{message.content}</p>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white/10 rounded">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex space-x-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => onReaction(message.id, reaction.emoji)}
                className="px-2 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-colors"
              >
                {reaction.emoji} {reaction.users.length}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VideoCallPanel({ videoCall, onCallAction }: {
  videoCall: VideoCall
  onCallAction: (action: string) => void
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <SimpleCard className="border-green-500/30 bg-green-500/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <div>
            <h3 className="text-white font-medium">Video Call Active</h3>
            <p className="text-sm text-white/60">
              {videoCall.participants.length} participants • {formatDuration(videoCall.duration)}
            </p>
          </div>
        </div>
        
        {videoCall.isRecording && (
          <div className="flex items-center space-x-1 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-xs">Recording</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-2 mb-4">
        <SimpleButton 
          variant={videoCall.settings.audio ? 'default' : 'danger'} 
          size="icon"
          onClick={() => onCallAction('toggle-audio')}
        >
          {videoCall.settings.audio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </SimpleButton>
        
        <SimpleButton 
          variant={videoCall.settings.video ? 'default' : 'danger'} 
          size="icon"
          onClick={() => onCallAction('toggle-video')}
        >
          {videoCall.settings.video ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </SimpleButton>
        
        <SimpleButton 
          variant={videoCall.settings.screenshare ? 'default' : 'outline'} 
          size="icon"
          onClick={() => onCallAction('toggle-screenshare')}
        >
          <Monitor className="w-4 h-4" />
        </SimpleButton>
        
        <SimpleButton 
          variant="danger"
          onClick={() => onCallAction('end-call')}
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          End Call
        </SimpleButton>
      </div>

      <div className="text-center">
        <p className="text-sm text-white/60">
          Participants: {videoCall.participants.join(', ')}
        </p>
      </div>
    </SimpleCard>
  )
}

export default function RealTimeCollaboration() {
  const [selectedTab, setSelectedTab] = useState<'team' | 'activity' | 'chat' | 'settings'>('team')
  const [showNotifications, setShowNotifications] = useState(true)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [collaborationUsers] = useState<CollaborationUser[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      avatar: '',
      role: 'owner',
      status: 'online',
      lastSeen: new Date(),
      currentView: 'Dashboard',
      cursor: { x: 250, y: 150, color: '#3b82f6' },
      isTyping: false,
      permissions: { edit: true, comment: true, share: true, admin: true }
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      avatar: '',
      role: 'editor',
      status: 'online',
      lastSeen: new Date(),
      currentView: 'Templates',
      cursor: { x: 180, y: 320, color: '#10b981' },
      isTyping: true,
      permissions: { edit: true, comment: true, share: false, admin: false }
    },
    {
      id: '3',
      name: 'Lisa Wong',
      email: 'lisa@company.com',
      avatar: '',
      role: 'admin',
      status: 'away',
      lastSeen: new Date(Date.now() - 600000),
      currentView: 'Analytics',
      cursor: { x: 320, y: 240, color: '#8b5cf6' },
      isTyping: false,
      permissions: { edit: true, comment: true, share: true, admin: true }
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john@external.com',
      avatar: '',
      role: 'viewer',
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000),
      currentView: 'Dashboard',
      cursor: { x: 0, y: 0, color: '#f59e0b' },
      isTyping: false,
      permissions: { edit: false, comment: true, share: false, admin: false }
    }
  ])

  const [recentActivity] = useState<ChangeEvent[]>([
    {
      id: '1',
      type: 'edit',
      user: collaborationUsers[1]!,
      timestamp: new Date(Date.now() - 120000),
      description: 'Modified the hero section background color',
      location: 'Homepage Template',
      oldValue: '#1f2937',
      newValue: '#3b82f6'
    },
    {
      id: '2',
      type: 'comment',
      user: collaborationUsers[0]!,
      timestamp: new Date(Date.now() - 180000),
      description: 'Added feedback on the navigation design',
      location: 'Navigation Component'
    },
    {
      id: '3',
      type: 'join',
      user: collaborationUsers[2]!,
      timestamp: new Date(Date.now() - 300000),
      description: 'Joined the collaboration session',
      location: 'Project Workspace'
    },
    {
      id: '4',
      type: 'share',
      user: collaborationUsers[0]!,
      timestamp: new Date(Date.now() - 480000),
      description: 'Shared the project with john@external.com',
      location: 'Project Settings'
    },
    {
      id: '5',
      type: 'edit',
      user: collaborationUsers[2]!,
      timestamp: new Date(Date.now() - 600000),
      description: 'Updated the color palette for the brand theme',
      location: 'Design System'
    }
  ])

  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '1',
      content: 'Hey everyone! I just updated the hero section. What do you think?',
      timestamp: new Date(Date.now() - 900000),
      type: 'text'
    },
    {
      id: '2',
      userId: '2',
      content: 'Looks great! The blue gradient really makes it pop.',
      timestamp: new Date(Date.now() - 840000),
      type: 'text',
      reactions: [{ emoji: '👍', users: ['1', '3'] }]
    },
    {
      id: '3',
      userId: '3',
      content: 'I agree! Should we also update the button styles to match?',
      timestamp: new Date(Date.now() - 720000),
      type: 'text'
    },
    {
      id: '4',
      userId: '1',
      content: 'Good point @lisa. Let me share the design file',
      timestamp: new Date(Date.now() - 660000),
      type: 'text',
      mentions: ['3'],
      attachments: [{ type: 'file', url: '#', name: 'button-designs.fig', size: 2.5 }]
    }
  ])

  const [videoCall, setVideoCall] = useState<VideoCall>({
    id: '1',
    participants: ['Sarah Johnson', 'Mike Chen'],
    isActive: false,
    startTime: new Date(),
    duration: 0,
    isRecording: false,
    settings: {
      video: true,
      audio: true,
      screenshare: false
    }
  })

  useEffect(() => {
    if (isVideoCallActive) {
      const interval = setInterval(() => {
        setVideoCall(prev => ({
          ...prev,
          duration: prev.duration + 1
        }))
      }, 1000)
      
      return () => clearInterval(interval)
    }
    return undefined
  }, [isVideoCallActive])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleUserAction = (action: string, userId: string) => {
    console.log('User action:', action, userId)
    if (action === 'call') {
      setIsVideoCallActive(true)
      setVideoCall(prev => ({ ...prev, isActive: true }))
    }
  }

  const handleCallAction = (action: string) => {
    if (action === 'end-call') {
      setIsVideoCallActive(false)
      setVideoCall(prev => ({ ...prev, isActive: false, duration: 0 }))
    } else if (action === 'toggle-audio') {
      setVideoCall(prev => ({ ...prev, settings: { ...prev.settings, audio: !prev.settings.audio } }))
    } else if (action === 'toggle-video') {
      setVideoCall(prev => ({ ...prev, settings: { ...prev.settings, video: !prev.settings.video } }))
    } else if (action === 'toggle-screenshare') {
      setVideoCall(prev => ({ ...prev, settings: { ...prev.settings, screenshare: !prev.settings.screenshare } }))
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage)
      setChatMessage('')
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    console.log('Adding reaction:', messageId, emoji)
  }

  const onlineUsers = collaborationUsers.filter(user => user.status === 'online')
  const filteredUsers = searchTerm 
    ? collaborationUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : collaborationUsers

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Real-time Collaboration</h2>
          <p className="text-white/60">Work together seamlessly with your team</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map(user => (
                <UserAvatar key={user.id} user={user} size="sm" />
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs text-white">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
            <span className="text-sm text-white/60">{onlineUsers.length} online</span>
          </div>
          
          <SimpleButton variant="outline" onClick={() => setShowNotifications(!showNotifications)}>
            {showNotifications ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
            Notifications
          </SimpleButton>
          
          <SimpleButton onClick={() => setIsVideoCallActive(true)}>
            <Video className="w-4 h-4 mr-2" />
            Start Call
          </SimpleButton>
        </div>
      </div>

      {/* Video Call Panel */}
      {isVideoCallActive && (
        <VideoCallPanel videoCall={videoCall} onCallAction={handleCallAction} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{onlineUsers.length}</div>
              <div className="text-white/60 text-sm">Online Now</div>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{recentActivity.length}</div>
              <div className="text-white/60 text-sm">Recent Changes</div>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{chatMessages.length}</div>
              <div className="text-white/60 text-sm">Messages</div>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">42</div>
              <div className="text-white/60 text-sm">Shared Files</div>
            </div>
            <FileText className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
          { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
          { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SimpleCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Team Members</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <SimpleButton size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </SimpleButton>
                </div>
              </div>

              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onUserAction={handleUserAction}
                  />
                ))}
              </div>
            </SimpleCard>
          </div>

          <div className="space-y-6">
            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Live Cursors</h3>
              <div className="space-y-3">
                {onlineUsers.filter(user => user.isTyping || user.cursor.x > 0).map(user => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <UserAvatar user={user} size="sm" />
                    <div className="flex-1">
                      <div className="text-white text-sm">{user.name}</div>
                      <div className="text-white/60 text-xs">
                        {user.isTyping ? 'Typing...' : `${user.cursor.x}, ${user.cursor.y}`}
                      </div>
                    </div>
                    <MousePointer className="w-4 h-4" style={{ color: user.cursor.color }} />
                  </div>
                ))}
              </div>
            </SimpleCard>

            <SimpleCard>
              <h3 className="text-lg font-semibold text-white mb-4">Permission Summary</h3>
              <div className="space-y-3">
                {['edit', 'comment', 'share', 'admin'].map(permission => {
                  const count = collaborationUsers.filter(user => user.permissions[permission as keyof typeof user.permissions]).length
                  return (
                    <div key={permission} className="flex items-center justify-between">
                      <span className="text-white/80 capitalize">{permission}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${(count / collaborationUsers.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-sm">{count}/{collaborationUsers.length}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SimpleCard>
          </div>
        </div>
      )}

      {selectedTab === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <SimpleButton variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </SimpleButton>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map(event => (
                <ChangeEventCard key={event.id} event={event} />
              ))}
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Activity Analytics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Edits Today</span>
                  <span className="text-white font-medium">24</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Comments</span>
                  <span className="text-white font-medium">18</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Shares</span>
                  <span className="text-white font-medium">8</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Sessions</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </SimpleCard>
        </div>
      )}

      {selectedTab === 'chat' && (
        <SimpleCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Team Chat</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white/60">{onlineUsers.length} online</span>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="h-96 bg-white/5 rounded-lg p-4 mb-4 overflow-y-auto">
                {chatMessages.map(message => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    currentUserId="1"
                    onReaction={handleReaction}
                  />
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60">
                    <Hash className="w-4 h-4" />
                  </button>
                </div>
                <SimpleButton onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                  Send
                </SimpleButton>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">Online Users</h4>
                <div className="space-y-2">
                  {onlineUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <UserAvatar user={user} size="sm" />
                      <span className="text-white/80 text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 hover:bg-white/10 rounded text-sm text-white">
                    📎 Share File
                  </button>
                  <button className="w-full text-left p-2 hover:bg-white/10 rounded text-sm text-white">
                    📅 Schedule Meeting
                  </button>
                  <button className="w-full text-left p-2 hover:bg-white/10 rounded text-sm text-white">
                    🎯 Create Task
                  </button>
                  <button className="w-full text-left p-2 hover:bg-white/10 rounded text-sm text-white">
                    💡 Add Idea
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SimpleCard>
      )}

      {selectedTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Collaboration Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Default Role for New Users</label>
                <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="viewer" className="bg-gray-900">Viewer</option>
                  <option value="editor" className="bg-gray-900">Editor</option>
                  <option value="admin" className="bg-gray-900">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Notification Preferences</label>
                <div className="space-y-3">
                  {[
                    { key: 'edits', label: 'Content edits' },
                    { key: 'comments', label: 'New comments' },
                    { key: 'joins', label: 'User joins/leaves' },
                    { key: 'shares', label: 'File shares' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <span className="text-white/80">{setting.label}</span>
                      <button className="relative w-10 h-5 rounded-full bg-blue-500 transition-all">
                        <div className="absolute w-3 h-3 rounded-full bg-white top-1 left-6 transition-all" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Auto-save Interval</label>
                <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="30" className="bg-gray-900">30 seconds</option>
                  <option value="60" className="bg-gray-900">1 minute</option>
                  <option value="300" className="bg-gray-900">5 minutes</option>
                </select>
              </div>
            </div>
          </SimpleCard>

          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Security & Permissions</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Share Link Expiration</label>
                <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="7" className="bg-gray-900">7 days</option>
                  <option value="30" className="bg-gray-900">30 days</option>
                  <option value="never" className="bg-gray-900">Never</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Access Controls</label>
                <div className="space-y-3">
                  {[
                    { key: 'password', label: 'Require password for access' },
                    { key: 'domain', label: 'Restrict to company domain' },
                    { key: 'download', label: 'Allow file downloads' },
                    { key: 'export', label: 'Allow project export' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <span className="text-white/80">{setting.label}</span>
                      <button className="relative w-10 h-5 rounded-full bg-white/20 transition-all">
                        <div className="absolute w-3 h-3 rounded-full bg-white top-1 left-1 transition-all" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <SimpleButton variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Settings
                  </SimpleButton>
                  <SimpleButton variant="danger">
                    Reset to Defaults
                  </SimpleButton>
                </div>
              </div>
            </div>
          </SimpleCard>
        </div>
      )}
    </div>
  )
}