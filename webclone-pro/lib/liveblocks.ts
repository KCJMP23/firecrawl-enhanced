import { createClient } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'
import { LiveObject, LiveList, LiveMap } from '@liveblocks/client'

// Define the presence state for each user
export type Presence = {
  cursor: { x: number; y: number } | null
  selectedElement: string | null
  user: {
    id: string
    name: string
    avatar: string
    color: string
  }
  isTyping: boolean
  currentView: 'editor' | 'preview' | 'code'
}

// Define the storage types for shared state
export type Storage = {
  projectData: LiveObject<{
    id: string
    name: string
    url: string
    lastModified: string
    version: number
  }>
  elements: LiveMap<string, {
    id: string
    type: string
    content: string
    styles: Record<string, any>
    position: { x: number; y: number }
    size: { width: number; height: number }
    locked: boolean
    lockedBy?: string
  }>
  annotations: LiveList<{
    id: string
    userId: string
    userName: string
    text: string
    position: { x: number; y: number }
    timestamp: string
    resolved: boolean
  }>
  codeChanges: LiveMap<string, {
    file: string
    content: string
    lastEditedBy: string
    lastEditedAt: string
  }>
}

// User meta information
export type UserMeta = {
  id: string
  info: {
    name: string
    email: string
    avatar: string
    role: 'owner' | 'editor' | 'viewer'
  }
}

// Events for broadcasting
export type RoomEvent = 
  | { type: 'ELEMENT_SELECTED'; elementId: string; userId: string }
  | { type: 'ELEMENT_LOCKED'; elementId: string; userId: string }
  | { type: 'ELEMENT_UNLOCKED'; elementId: string; userId: string }
  | { type: 'CODE_UPDATED'; file: string; userId: string }
  | { type: 'DEPLOY_INITIATED'; userId: string }
  | { type: 'EXPORT_COMPLETED'; format: string; userId: string }
  | { type: 'COMMENT_ADDED'; position: { x: number; y: number }; userId: string }
  | { type: 'AI_SUGGESTION'; suggestion: string; targetElement: string }

// Create the Liveblocks client
const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || 'demo-key',
  throttle: 16, // 60fps cursor updates
  
  // Note: In production, you would use authEndpoint instead of publicApiKey
  // authEndpoint: async (room) => {
  //   const response = await fetch('/api/collaboration/auth', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ room }),
  //   })
  //   return await response.json()
  // },
})

// Create room context with proper types
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useStorage,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useSelf,
  useStatus,
  useMutation,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)

// Helper functions for collaboration features
export function generateUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#FD79A8', '#A29BFE', '#6C5CE7', '#00B894', '#FDCB6E'
  ]
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length] ?? '#FF6B6B'
}

export function formatUserInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Collaboration features configuration
export const COLLABORATION_FEATURES = {
  maxCursorsVisible: 10,
  cursorSmoothingMs: 100,
  typingIndicatorTimeout: 3000,
  autoSaveInterval: 5000,
  maxAnnotations: 100,
  maxUndoHistory: 50,
  elementLockTimeout: 30000, // Auto-unlock after 30 seconds of inactivity
  presenceColors: {
    owner: '#FFD93D',
    editor: '#6BCF7F', 
    viewer: '#92A8D1'
  }
}

// Real-time activity types
export type ActivityType = 
  | 'joined'
  | 'left'
  | 'editing'
  | 'commenting'
  | 'deploying'
  | 'exporting'
  | 'ai_generating'

export interface Activity {
  id: string
  userId: string
  userName: string
  type: ActivityType
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Conflict resolution strategies
export enum ConflictResolution {
  LAST_WRITE_WINS = 'last_write_wins',
  MANUAL_MERGE = 'manual_merge',
  VERSION_CONTROL = 'version_control'
}

// Export collaboration session data
export interface CollaborationSession {
  roomId: string
  projectId: string
  participants: UserMeta[]
  startTime: Date
  endTime?: Date
  changes: number
  conflicts: number
  resolutionStrategy: ConflictResolution
}

// Permissions for collaboration
export interface CollaborationPermissions {
  canEdit: boolean
  canComment: boolean
  canDeploy: boolean
  canExport: boolean
  canInvite: boolean
  canDelete: boolean
  canLockElements: boolean
  canUseAI: boolean
}

export function getPermissions(role: UserMeta['info']['role']): CollaborationPermissions {
  switch (role) {
    case 'owner':
      return {
        canEdit: true,
        canComment: true,
        canDeploy: true,
        canExport: true,
        canInvite: true,
        canDelete: true,
        canLockElements: true,
        canUseAI: true
      }
    case 'editor':
      return {
        canEdit: true,
        canComment: true,
        canDeploy: false,
        canExport: true,
        canInvite: false,
        canDelete: false,
        canLockElements: true,
        canUseAI: true
      }
    case 'viewer':
      return {
        canEdit: false,
        canComment: true,
        canDeploy: false,
        canExport: false,
        canInvite: false,
        canDelete: false,
        canLockElements: false,
        canUseAI: false
      }
  }
}