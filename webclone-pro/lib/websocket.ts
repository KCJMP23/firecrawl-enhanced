import { createClient } from '@/lib/supabase/client'

export interface CloneProgress {
  projectId: string
  status: 'pending' | 'cloning' | 'processing' | 'completed' | 'failed'
  progress: number
  currentTask: string
  totalPages?: number
  pagesCompleted?: number
  errors?: string[]
  startTime?: Date
  estimatedTimeRemaining?: number
}

export interface WebSocketMessage {
  type: 'progress' | 'completed' | 'error' | 'log'
  data: CloneProgress | any
  timestamp: Date
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  
  connect(url: string = 'ws://localhost:8001/ws') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.notifyListeners(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.attemptReconnect()
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)
      
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
    }
  }
  
  subscribe(projectId: string, callback: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set())
    }
    this.listeners.get(projectId)?.add(callback)
    
    // Send subscription message to server
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        projectId
      }))
    }
    
    return () => {
      this.unsubscribe(projectId, callback)
    }
  }
  
  unsubscribe(projectId: string, callback: (message: WebSocketMessage) => void) {
    const listeners = this.listeners.get(projectId)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.listeners.delete(projectId)
        
        // Send unsubscribe message to server
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            projectId
          }))
        }
      }
    }
  }
  
  private notifyListeners(message: WebSocketMessage) {
    // Check if message has projectId
    const projectId = message.data?.projectId
    if (projectId) {
      const listeners = this.listeners.get(projectId)
      if (listeners) {
        listeners.forEach(callback => callback(message))
      }
    }
    
    // Also notify global listeners (projectId = '*')
    const globalListeners = this.listeners.get('*')
    if (globalListeners) {
      globalListeners.forEach(callback => callback(message))
    }
  }
  
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Singleton instance
export const wsManager = new WebSocketManager()

// Hook for React components
export function useWebSocket(projectId: string, onMessage: (message: WebSocketMessage) => void) {
  // Auto-connect on first use
  if (typeof window !== 'undefined') {
    wsManager.connect()
  }
  
  return {
    subscribe: () => wsManager.subscribe(projectId, onMessage),
    unsubscribe: () => wsManager.subscribe(projectId, onMessage),
    send: (data: any) => wsManager.send(data)
  }
}

// Supabase real-time fallback
export async function subscribeToProjectUpdates(
  projectId: string,
  onUpdate: (data: any) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'clones',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}