'use client'

import { useState, useEffect, Suspense, use } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  Html,
  Float,
  Box,
  Plane
} from '@react-three/drei'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SimpleButton } from '@/components/ui'
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Eye,
  Code,
  Palette,
  Layers,
  Sparkles,
  Download,
  Share2,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Move3D,
  Grid3X3,
  Zap,
  Brain
} from 'lucide-react'

interface EditorPageProps {
  params: Promise<{ id: string }>
}


function WebsiteFrame({ url, scale = 1 }: { url: string; scale?: number }) {
  // Simplified for build compatibility
  return (
    <div style={{ transform: `scale(${scale})` }}>
      <iframe 
        src={url} 
        style={{ 
          width: '100%', 
          height: '400px', 
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }} 
      />
    </div>
  )
}

function Editor3D({ projectId, viewMode }: { projectId: string; viewMode: string }) {
  // Simplified for build compatibility - Three.js components commented out
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>3D Editor (under development)</p>
      {/* Three.js components commented out for build compatibility */}
      
      {viewMode === '3d' && (
        <div>
          <WebsiteFrame url={`http://localhost:3001`} />
        </div>
      )}
      
      {viewMode === 'grid' && (
        <div>
          <WebsiteFrame url={`http://localhost:3001`} scale={0.5} />
          <WebsiteFrame url={`http://localhost:3001`} scale={0.5} />
          <WebsiteFrame url={`http://localhost:3001`} scale={0.5} />
          <WebsiteFrame url={`http://localhost:3001`} scale={0.5} />
        </div>
      )}
      
      {viewMode === 'layers' && (
        <div>
          <WebsiteFrame url={`http://localhost:3001`} scale={0.8} />
          {/* Box components simplified for build compatibility */}
          <div style={{ background: '#2a2a2a', opacity: 0.5, width: '200px', height: '100px', margin: '10px auto' }}></div>
          <div style={{ background: '#3a3a3a', opacity: 0.3, width: '180px', height: '80px', margin: '10px auto' }}></div>
        </div>
      )}
      
      {/* OrbitControls simplified for build compatibility */}
    </div>
  )
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id: projectId } = use(params)
  const [viewMode, setViewMode] = useState<'3d' | 'grid' | 'layers' | 'preview'>('3d')
  const [showSidebar, setShowSidebar] = useState(true)
  const [selectedTool, setSelectedTool] = useState<string>('move')
  const [fullscreen, setFullscreen] = useState(false)
  const router = useRouter()

  const tools = [
    { id: 'move', icon: <Move3D className="w-4 h-4" />, label: 'Move' },
    { id: 'edit', icon: <Code className="w-4 h-4" />, label: 'Edit' },
    { id: 'style', icon: <Palette className="w-4 h-4" />, label: 'Style' },
    { id: 'layers', icon: <Layers className="w-4 h-4" />, label: 'Layers' },
    { id: 'ai', icon: <Brain className="w-4 h-4" />, label: 'AI Remix' }
  ]

  const viewModes = [
    { id: '3d', icon: <Move3D className="w-4 h-4" />, label: '3D View' },
    { id: 'grid', icon: <Grid3X3 className="w-4 h-4" />, label: 'Grid View' },
    { id: 'layers', icon: <Layers className="w-4 h-4" />, label: 'Layers' },
    { id: 'preview', icon: <Eye className="w-4 h-4" />, label: 'Preview' }
  ]

  return (
    <div className={`min-h-screen bg-black text-white ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            {!fullscreen && (
              <Link href="/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">3D Editor</span>
            </div>
          </div>
          
          {/* View Mode Switcher */}
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            {viewModes.map(mode => (
              <SimpleButton
                key={mode.id}
                variant="ghost"
                size="sm"
                active={viewMode === mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className="px-3"
              >
                {mode.icon}
                <span className="ml-2 hidden md:inline">{mode.label}</span>
              </SimpleButton>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <SimpleButton variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </SimpleButton>
            <SimpleButton variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </SimpleButton>
            <SimpleButton variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </SimpleButton>
            <SimpleButton 
              variant="outline" 
              size="icon"
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </SimpleButton>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Toolbar */}
        <div className="w-16 bg-black/50 backdrop-blur-lg border-r border-white/10 flex flex-col items-center py-4 space-y-2">
          {tools.map(tool => (
            <SimpleButton
              key={tool.id}
              variant="ghost"
              size="icon"
              active={selectedTool === tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className="relative group"
            >
              {tool.icon}
              <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {tool.label}
              </span>
            </SimpleButton>
          ))}
        </div>
        
        {/* 3D Canvas Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {viewMode === 'preview' ? (
            <iframe
              src={`http://localhost:3001`}
              className="w-full h-full border-none"
            />
          ) : (
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading 3D Editor...</span>
                </div>
              </div>
            }>
              <Canvas>
                <Editor3D projectId={projectId} viewMode={viewMode} />
              </Canvas>
            </Suspense>
          )}
          
          {/* Floating Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/80 backdrop-blur-lg rounded-full px-6 py-3">
            <SimpleButton variant="ghost" size="icon">
              <Play className="w-4 h-4" />
            </SimpleButton>
            <div className="text-white/60 text-sm">Timeline</div>
            <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            </div>
            <SimpleButton variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </SimpleButton>
          </div>
        </div>
        
        {/* Properties Panel */}
        {showSidebar && selectedTool === 'ai' && (
          <div className="w-80 bg-black/50 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Brain className="w-6 h-6 mr-3 text-purple-400" />
              AI Remix Studio
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Quick Transformations</h3>
                <div className="space-y-2">
                  <button className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 hover:border-white/20 text-left transition-all">
                    <div className="font-medium text-white mb-1">Healthcare Theme</div>
                    <div className="text-xs text-white/60">Transform to medical/health design</div>
                  </button>
                  <button className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-white/10 hover:border-white/20 text-left transition-all">
                    <div className="font-medium text-white mb-1">E-commerce Style</div>
                    <div className="text-xs text-white/60">Add shopping features</div>
                  </button>
                  <button className="w-full p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-white/10 hover:border-white/20 text-left transition-all">
                    <div className="font-medium text-white mb-1">Minimalist</div>
                    <div className="text-xs text-white/60">Clean, simple design</div>
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">AI Chat</h3>
                <div className="bg-white/5 rounded-lg p-3 mb-3">
                  <p className="text-sm text-white/80">How can I help transform your website?</p>
                </div>
                <textarea
                  placeholder="Describe your changes..."
                  className="w-full h-20 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                />
                <SimpleButton className="w-full mt-3">
                  <Zap className="w-4 h-4 mr-2" />
                  Apply AI Changes
                </SimpleButton>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Style Controls</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60">Color Scheme</label>
                    <input type="range" className="w-full mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60">Typography</label>
                    <input type="range" className="w-full mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60">Spacing</label>
                    <input type="range" className="w-full mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showSidebar && selectedTool === 'style' && (
          <div className="w-80 bg-black/50 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Palette className="w-6 h-6 mr-3 text-blue-400" />
              Style Editor
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Colors</h3>
                <div className="grid grid-cols-5 gap-2">
                  {['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                    <button
                      key={color}
                      className="w-12 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Typography</h3>
                <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Poppins</option>
                  <option>Montserrat</option>
                </select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Effects</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-white/80">Glassmorphism</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-white/80">Shadows</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-white/80">Animations</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}