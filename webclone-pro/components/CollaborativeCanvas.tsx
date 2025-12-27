'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useStorage, useMutation, useOthers, useMyPresence, useBroadcastEvent } from '@/lib/liveblocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Move,
  Square,
  Type,
  Image,
  Palette,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Sparkles,
  Users,
  MessageSquare,
  MousePointer
} from 'lucide-react'
import { toast } from 'sonner'
import { generateUserColor } from '@/lib/liveblocks'

interface CanvasElement {
  id: string
  type: 'rectangle' | 'text' | 'image' | 'button' | 'input'
  position: { x: number; y: number }
  size: { width: number; height: number }
  styles: Record<string, any>
  content?: string
  locked?: boolean
  lockedBy?: string
  visible?: boolean
  zIndex?: number
}

interface CollaborativeCanvasProps {
  projectId: string
  initialElements?: CanvasElement[]
  onExport?: (elements: CanvasElement[]) => void
}

export function CollaborativeCanvas({
  projectId,
  initialElements = [],
  onExport
}: CollaborativeCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [tool, setTool] = useState<'select' | 'rectangle' | 'text' | 'image'>('select')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [elements, setElements] = useState<CanvasElement[]>(initialElements)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [annotations, setAnnotations] = useState<Array<{
    id: string
    position: { x: number; y: number }
    text: string
    userId: string
    userName: string
  }>>([])

  const others = useOthers()
  const [myPresence, updateMyPresence] = useMyPresence()
  const broadcast = useBroadcastEvent()

  // Update element position
  const updateElement = useMutation(
    ({ storage }, elementId: string, updates: Partial<CanvasElement>) => {
      const elementsMap = storage.get('elements')
      const element = elementsMap.get(elementId)
      
      if (element) {
        Object.entries(updates).forEach(([key, value]) => {
          element.set(key as any, value)
        })
      }
    },
    []
  )

  // Handle mouse events for drawing and selecting
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / (zoom / 100)
    const y = (e.clientY - rect.top) / (zoom / 100)

    if (tool === 'select') {
      // Check if clicking on an element
      const clickedElement = elements.find(el => 
        x >= el.position.x && x <= el.position.x + el.size.width &&
        y >= el.position.y && y <= el.position.y + el.size.height
      )

      if (clickedElement) {
        if (clickedElement.locked && clickedElement.lockedBy !== myPresence.user.id) {
          toast.error('This element is locked by another user')
          return
        }

        setSelectedElement(clickedElement.id)
        updateMyPresence({ selectedElement: clickedElement.id })
        broadcast({
          type: 'ELEMENT_SELECTED',
          elementId: clickedElement.id,
          userId: myPresence.user.id
        })

        setIsDragging(true)
        setDragStart({ x: e.clientX - clickedElement.position.x, y: e.clientY - clickedElement.position.y })
      }
    } else if (tool === 'rectangle') {
      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type: 'rectangle',
        position: { x, y },
        size: { width: 100, height: 100 },
        styles: {
          backgroundColor: '#3B82F6',
          borderRadius: '8px',
          border: '2px solid #1E40AF'
        },
        visible: true,
        zIndex: elements.length
      }

      setElements([...elements, newElement])
      broadcast({
        type: 'ELEMENT_SELECTED',
        elementId: newElement.id,
        userId: myPresence.user.id
      })
    } else if (tool === 'text') {
      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type: 'text',
        position: { x, y },
        size: { width: 200, height: 40 },
        content: 'Click to edit',
        styles: {
          fontSize: '16px',
          color: '#000000',
          fontFamily: 'Inter, sans-serif'
        },
        visible: true,
        zIndex: elements.length
      }

      setElements([...elements, newElement])
    }
  }, [tool, elements, zoom, myPresence, updateMyPresence, broadcast])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && selectedElement) {
      const element = elements.find(el => el.id === selectedElement)
      if (!element || (element.locked && element.lockedBy !== myPresence.user.id)) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = (e.clientX - rect.left - dragStart.x) / (zoom / 100)
      const y = (e.clientY - rect.top - dragStart.y) / (zoom / 100)

      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, position: { x, y } }
          : el
      ))

      updateElement(selectedElement, { position: { x, y } })
    }
  }, [isDragging, selectedElement, elements, dragStart, zoom, myPresence.user.id, updateElement])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Lock/unlock element
  const toggleElementLock = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    const shouldLock = !element.locked || element.lockedBy !== myPresence.user.id
    
    setElements(prev => prev.map(el => 
      el.id === elementId
        ? { ...el, locked: shouldLock, lockedBy: shouldLock ? myPresence.user.id : undefined }
        : el
    ))

    updateElement(elementId, { 
      locked: shouldLock, 
      lockedBy: shouldLock ? myPresence.user.id : undefined 
    })

    broadcast({
      type: shouldLock ? 'ELEMENT_LOCKED' : 'ELEMENT_UNLOCKED',
      elementId,
      userId: myPresence.user.id
    })

    toast(shouldLock ? 'Element locked' : 'Element unlocked')
  }, [elements, myPresence.user.id, updateElement, broadcast])

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (element?.locked && element.lockedBy !== myPresence.user.id) {
      toast.error('Cannot delete locked element')
      return
    }

    setElements(prev => prev.filter(el => el.id !== elementId))
    if (selectedElement === elementId) {
      setSelectedElement(null)
    }
  }, [elements, selectedElement, myPresence.user.id])

  // Add annotation
  const addAnnotation = useCallback((x: number, y: number, text: string) => {
    const newAnnotation = {
      id: `annotation-${Date.now()}`,
      position: { x, y },
      text,
      userId: myPresence.user.id,
      userName: myPresence.user.name
    }

    setAnnotations(prev => [...prev, newAnnotation])
    
    broadcast({
      type: 'COMMENT_ADDED',
      position: { x, y },
      userId: myPresence.user.id
    })
  }, [myPresence, broadcast])

  return (
    <div className="w-full h-full flex">
      {/* Toolbar */}
      <div className="w-16 border-r bg-white dark:bg-gray-900 p-2">
        <div className="flex flex-col gap-2">
          <Button
            variant={tool === 'select' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setTool('select')}
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          
          <Button
            variant={tool === 'rectangle' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setTool('rectangle')}
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            variant={tool === 'text' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setTool('text')}
          >
            <Type className="w-4 h-4" />
          </Button>
          
          <Button
            variant={tool === 'image' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setTool('image')}
          >
            <Image className="w-4 h-4" />
          </Button>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectedElement && toggleElementLock(selectedElement)}
            disabled={!selectedElement}
          >
            {elements.find(el => el.id === selectedElement)?.locked ? 
              <Unlock className="w-4 h-4" /> : 
              <Lock className="w-4 h-4" />
            }
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectedElement && deleteElement(selectedElement)}
            disabled={!selectedElement}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.min(zoom + 10, 200))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.max(zoom - 10, 50))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            backgroundImage: showGrid 
              ? 'linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)'
              : 'none',
            backgroundSize: '20px 20px'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Render elements */}
          {elements.map(element => (
            <div
              key={element.id}
              className={`absolute border-2 ${
                selectedElement === element.id 
                  ? 'border-blue-500' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                ...element.styles,
                display: element.visible ? 'block' : 'none',
                zIndex: element.zIndex,
                opacity: element.locked && element.lockedBy !== myPresence.user.id ? 0.5 : 1
              }}
            >
              {element.type === 'text' && (
                <div className="p-2">{element.content}</div>
              )}
              
              {element.locked && (
                <div className="absolute top-0 right-0 p-1 bg-yellow-500 rounded-bl">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Show who is editing this element */}
              {others
                .filter(other => other.presence.selectedElement === element.id)
                .map(({ connectionId, info }) => (
                  <div
                    key={connectionId}
                    className="absolute -top-8 left-0 px-2 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: generateUserColor(info.id) }}
                  >
                    {info.name} is editing
                  </div>
                ))
              }
            </div>
          ))}

          {/* Render annotations */}
          {annotations.map(annotation => (
            <div
              key={annotation.id}
              className="absolute"
              style={{
                left: annotation.position.x,
                top: annotation.position.y
              }}
            >
              <div className="relative">
                <MessageSquare className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <div className="absolute left-8 top-0 bg-white dark:bg-gray-800 border rounded-lg p-2 shadow-lg min-w-[200px]">
                  <div className="text-xs font-medium">{annotation.userName}</div>
                  <div className="text-sm">{annotation.text}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Render other users' cursors */}
          {others.map(({ connectionId, presence, info }) => {
            if (!presence.cursor) return null
            
            return (
              <div
                key={connectionId}
                className="absolute pointer-events-none"
                style={{
                  left: presence.cursor.x,
                  top: presence.cursor.y
                }}
              >
                <MousePointer
                  className="w-6 h-6"
                  style={{ color: generateUserColor(info.id) }}
                />
              </div>
            )
          })}
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4">
          <Card className="px-3 py-2">
            <span className="text-sm font-medium">{zoom}%</span>
          </Card>
        </div>

        {/* Selected element info */}
        {selectedElement && (
          <div className="absolute top-4 right-4">
            <Card className="p-4 w-64">
              <h3 className="font-semibold mb-2">Properties</h3>
              {(() => {
                const element = elements.find(el => el.id === selectedElement)
                if (!element) return null
                
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="secondary">{element.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Position:</span>
                      <span>{Math.round(element.position.x)}, {Math.round(element.position.y)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{element.size.width} × {element.size.height}</span>
                    </div>
                    {element.locked && (
                      <div className="flex justify-between">
                        <span>Locked by:</span>
                        <Badge variant="outline">
                          {element.lockedBy === myPresence.user.id ? 'You' : 'Another user'}
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })()}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}