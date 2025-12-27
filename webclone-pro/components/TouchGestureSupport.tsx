'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Hand,
  Move,
  RotateCcw,
  Maximize,
  Navigation,
  ZoomIn,
  ZoomOut,
  Repeat,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointer,
  Smartphone,
  Settings,
  Play,
  Pause,
  Target,
  Activity,
  Fingerprint,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface GestureConfig {
  id: string
  name: string
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'long-press' | 'multi-touch'
  description: string
  action: string
  sensitivity: number
  enabled: boolean
  element: string
  icon: React.ReactNode
  fingers: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

interface GestureEvent {
  id: string
  type: string
  timestamp: Date
  element: string
  coordinates: { x: number; y: number }
  properties: Record<string, any>
  success: boolean
}

interface TouchArea {
  id: string
  name: string
  element: string
  x: number
  y: number
  width: number
  height: number
  minSize: number
  currentSize: number
  status: 'optimal' | 'small' | 'large'
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
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = 
    variant === 'outline' ? 'border border-white/20 bg-transparent hover:bg-white/10 text-white' :
    variant === 'ghost' ? 'hover:bg-white/10 text-white' :
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

function GestureConfigCard({ gesture, onToggle, onSensitivityChange }: {
  gesture: GestureConfig
  onToggle: (gestureId: string) => void
  onSensitivityChange: (gestureId: string, sensitivity: number) => void
}) {
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      gesture.enabled 
        ? 'border-blue-500/30 bg-blue-500/10' 
        : 'border-white/10 bg-white/5'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${gesture.enabled ? 'bg-blue-500/20' : 'bg-white/10'}`}>
            <div className={gesture.enabled ? 'text-blue-400' : 'text-white/40'}>
              {gesture.icon}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-white">{gesture.name}</h4>
            <p className="text-sm text-white/60">{gesture.description}</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(gesture.id)}
          className={`relative w-12 h-6 rounded-full transition-all ${
            gesture.enabled ? 'bg-blue-500' : 'bg-white/20'
          }`}
        >
          <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
            gesture.enabled ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-white/60">Action:</span>
          <span className="text-white ml-2">{gesture.action}</span>
        </div>
        <div>
          <span className="text-white/60">Element:</span>
          <span className="text-white ml-2">{gesture.element}</span>
        </div>
        <div>
          <span className="text-white/60">Fingers:</span>
          <span className="text-white ml-2">{gesture.fingers}</span>
        </div>
        {gesture.direction && (
          <div>
            <span className="text-white/60">Direction:</span>
            <span className="text-white ml-2 capitalize">{gesture.direction}</span>
          </div>
        )}
      </div>

      {gesture.enabled && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Sensitivity</span>
            <span className="text-sm text-white">{gesture.sensitivity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={gesture.sensitivity}
            onChange={(e) => onSensitivityChange(gesture.id, parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${gesture.sensitivity}%, rgba(255,255,255,0.1) ${gesture.sensitivity}%)`
            }}
          />
        </div>
      )}
    </div>
  )
}

function TouchAreaOverlay({ touchAreas }: { touchAreas: TouchArea[] }) {
  return (
    <div className="relative">
      <SimpleCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Touch Target Analysis</h3>
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-green-400"></div>
              <span>Optimal</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-yellow-400"></div>
              <span>Small</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-red-400"></div>
              <span>Too Large</span>
            </div>
          </div>
        </div>

        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          {/* Mock Mobile Screen */}
          <div className="absolute inset-4 bg-white rounded-lg">
            {touchAreas.map(area => {
              const getAreaColor = () => {
                switch (area.status) {
                  case 'optimal': return 'bg-green-400/30 border-green-400'
                  case 'small': return 'bg-yellow-400/30 border-yellow-400'
                  case 'large': return 'bg-red-400/30 border-red-400'
                }
              }

              return (
                <div
                  key={area.id}
                  className={`absolute border-2 border-dashed rounded ${getAreaColor()}`}
                  style={{
                    left: `${area.x}%`,
                    top: `${area.y}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`
                  }}
                >
                  <div className="absolute -top-6 left-0 text-xs text-white bg-black/80 rounded px-2 py-1">
                    {area.name} ({area.currentSize}px)
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {touchAreas.map(area => (
            <div key={area.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded ${
                  area.status === 'optimal' ? 'bg-green-400' :
                  area.status === 'small' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white text-sm">{area.name}</span>
              </div>
              <div className="text-right text-sm">
                <div className="text-white">{area.currentSize}px</div>
                <div className="text-white/60">min: {area.minSize}px</div>
              </div>
            </div>
          ))}
        </div>
      </SimpleCard>
    </div>
  )
}

function GestureEventLog({ events }: { events: GestureEvent[] }) {
  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Gesture Events</h3>
        <span className="text-sm text-white/60">{events.length} events logged</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-1 rounded ${event.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {event.success ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{event.type}</div>
                <div className="text-white/60 text-xs">{event.element}</div>
              </div>
            </div>
            <div className="text-right text-xs text-white/40">
              <div>{event.coordinates.x}, {event.coordinates.y}</div>
              <div>{event.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>
    </SimpleCard>
  )
}

export default function TouchGestureSupport() {
  const [isTestMode, setIsTestMode] = useState(false)
  const [gestures, setGestures] = useState<GestureConfig[]>([
    {
      id: '1',
      name: 'Tap to Navigate',
      type: 'tap',
      description: 'Single tap to click buttons and links',
      action: 'click',
      sensitivity: 80,
      enabled: true,
      element: 'button, a, .clickable',
      icon: <MousePointer className="w-4 h-4" />,
      fingers: 1
    },
    {
      id: '2',
      name: 'Swipe Navigation',
      type: 'swipe',
      description: 'Swipe left/right to navigate between pages',
      action: 'navigate',
      sensitivity: 60,
      enabled: true,
      element: '.carousel, .slider',
      icon: <Navigation className="w-4 h-4" />,
      fingers: 1,
      direction: 'left'
    },
    {
      id: '3',
      name: 'Pinch to Zoom',
      type: 'pinch',
      description: 'Pinch gesture for zooming images and content',
      action: 'zoom',
      sensitivity: 70,
      enabled: true,
      element: '.zoomable, img',
      icon: <ZoomIn className="w-4 h-4" />,
      fingers: 2
    },
    {
      id: '4',
      name: 'Pull to Refresh',
      type: 'swipe',
      description: 'Pull down to refresh page content',
      action: 'refresh',
      sensitivity: 50,
      enabled: false,
      element: 'body',
      icon: <RotateCcw className="w-4 h-4" />,
      fingers: 1,
      direction: 'down'
    },
    {
      id: '5',
      name: 'Long Press Menu',
      type: 'long-press',
      description: 'Long press to show context menu',
      action: 'contextmenu',
      sensitivity: 90,
      enabled: true,
      element: '.menu-trigger',
      icon: <Hand className="w-4 h-4" />,
      fingers: 1
    },
    {
      id: '6',
      name: 'Two-Finger Scroll',
      type: 'multi-touch',
      description: 'Two-finger scroll for content areas',
      action: 'scroll',
      sensitivity: 40,
      enabled: true,
      element: '.scrollable',
      icon: <Move className="w-4 h-4" />,
      fingers: 2
    }
  ])

  const touchAreas: TouchArea[] = [
    {
      id: '1',
      name: 'Primary Button',
      element: '.btn-primary',
      x: 20,
      y: 80,
      width: 60,
      height: 8,
      minSize: 44,
      currentSize: 48,
      status: 'optimal'
    },
    {
      id: '2',
      name: 'Menu Icon',
      element: '.menu-icon',
      x: 85,
      y: 5,
      width: 10,
      height: 6,
      minSize: 44,
      currentSize: 32,
      status: 'small'
    },
    {
      id: '3',
      name: 'Navigation Link',
      element: '.nav-link',
      x: 10,
      y: 50,
      width: 30,
      height: 6,
      minSize: 44,
      currentSize: 44,
      status: 'optimal'
    },
    {
      id: '4',
      name: 'Close Button',
      element: '.close-btn',
      x: 75,
      y: 20,
      width: 15,
      height: 10,
      minSize: 44,
      currentSize: 56,
      status: 'large'
    }
  ]

  const [gestureEvents, setGestureEvents] = useState<GestureEvent[]>([
    {
      id: '1',
      type: 'tap',
      timestamp: new Date(Date.now() - 30000),
      element: '.btn-primary',
      coordinates: { x: 200, y: 400 },
      properties: { duration: 120 },
      success: true
    },
    {
      id: '2',
      type: 'swipe',
      timestamp: new Date(Date.now() - 60000),
      element: '.carousel',
      coordinates: { x: 150, y: 300 },
      properties: { direction: 'left', distance: 120 },
      success: true
    },
    {
      id: '3',
      type: 'pinch',
      timestamp: new Date(Date.now() - 90000),
      element: 'img',
      coordinates: { x: 300, y: 250 },
      properties: { scale: 1.5 },
      success: false
    }
  ])

  const handleGestureToggle = (gestureId: string) => {
    setGestures(prev => prev.map(gesture =>
      gesture.id === gestureId
        ? { ...gesture, enabled: !gesture.enabled }
        : gesture
    ))
  }

  const handleSensitivityChange = (gestureId: string, sensitivity: number) => {
    setGestures(prev => prev.map(gesture =>
      gesture.id === gestureId
        ? { ...gesture, sensitivity }
        : gesture
    ))
  }

  const enabledGestures = gestures.filter(g => g.enabled)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Touch Gesture Support</h2>
          <p className="text-white/60">Configure and test touch interactions for mobile devices</p>
        </div>
        <div className="flex items-center space-x-3">
          <SimpleButton variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </SimpleButton>
          <SimpleButton onClick={() => setIsTestMode(!isTestMode)}>
            {isTestMode ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Testing
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Testing
              </>
            )}
          </SimpleButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{enabledGestures.length}</div>
              <div className="text-white/60 text-sm">Active Gestures</div>
            </div>
            <Hand className="w-8 h-8 text-blue-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{touchAreas.filter(t => t.status === 'optimal').length}</div>
              <div className="text-white/60 text-sm">Optimal Touch Areas</div>
            </div>
            <Target className="w-8 h-8 text-green-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{gestureEvents.filter(e => e.success).length}</div>
              <div className="text-white/60 text-sm">Successful Events</div>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </SimpleCard>
        
        <SimpleCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">44px</div>
              <div className="text-white/60 text-sm">Min Touch Size</div>
            </div>
            <Fingerprint className="w-8 h-8 text-yellow-400" />
          </div>
        </SimpleCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gesture Configuration */}
        <div className="space-y-6">
          <SimpleCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Gesture Configuration</h3>
              <div className="flex items-center space-x-2">
                <SimpleButton variant="outline" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Configure
                </SimpleButton>
              </div>
            </div>

            <div className="space-y-4">
              {gestures.map(gesture => (
                <GestureConfigCard
                  key={gesture.id}
                  gesture={gesture}
                  onToggle={handleGestureToggle}
                  onSensitivityChange={handleSensitivityChange}
                />
              ))}
            </div>
          </SimpleCard>

          <GestureEventLog events={gestureEvents} />
        </div>

        {/* Touch Areas and Testing */}
        <div className="space-y-6">
          <TouchAreaOverlay touchAreas={touchAreas} />

          {/* Quick Actions */}
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Optimize Touch Areas</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <Smartphone className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Test on Device</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <Fingerprint className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Accessibility Check</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center">
                <div>
                  <Activity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white text-sm">Performance Test</div>
                </div>
              </button>
            </div>
          </SimpleCard>
        </div>
      </div>
    </div>
  )
}