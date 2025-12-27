'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  RotateClockwise,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Clock,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bluetooth,
  Settings,
  Maximize,
  Minimize,
  RefreshCw,
  Share,
  Download,
  Eye,
  Grid,
  Layers,
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  Camera
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface Device {
  id: string
  name: string
  width: number
  height: number
  pixelRatio: number
  userAgent: string
  type: 'phone' | 'tablet' | 'desktop'
  icon: React.ReactNode
  bezel?: boolean
  orientation: 'portrait' | 'landscape'
}

interface PreviewSettings {
  showStatusBar: boolean
  showBezel: boolean
  enableTouch: boolean
  networkCondition: 'fast' | 'slow' | 'offline'
  darkMode: boolean
  showGrid: boolean
  showRuler: boolean
  zoom: number
}

interface NetworkCondition {
  id: string
  name: string
  downloadSpeed: string
  uploadSpeed: string
  latency: string
  description: string
}


function DeviceFrame({ device, settings, children }: {
  device: Device
  settings: PreviewSettings
  children: React.ReactNode
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getDeviceStyles = () => {
    const { width, height, orientation } = device
    const actualWidth = orientation === 'landscape' ? height : width
    const actualHeight = orientation === 'landscape' ? width : height
    
    return {
      width: actualWidth * (settings.zoom / 100),
      height: actualHeight * (settings.zoom / 100)
    }
  }

  const renderStatusBar = () => (
    <div className="flex items-center justify-between px-4 py-1 bg-black text-white text-xs">
      <div className="flex items-center space-x-1">
        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Signal className="w-3 h-3" />
        {settings.networkCondition === 'offline' ? (
          <WifiOff className="w-3 h-3" />
        ) : (
          <Wifi className="w-3 h-3" />
        )}
        <Battery className="w-4 h-3" />
        <span>87%</span>
      </div>
    </div>
  )

  return (
    <div className="flex items-center justify-center p-8">
      <div
        ref={frameRef}
        className={`relative bg-black rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
          settings.showBezel && device.bezel ? 'p-4' : ''
        }`}
        style={getDeviceStyles()}
      >
        {/* Device Bezel */}
        {settings.showBezel && device.bezel && (
          <div className="absolute inset-0 bg-gray-800 rounded-lg" />
        )}

        {/* Screen Container */}
        <div className={`relative w-full h-full ${settings.showBezel && device.bezel ? 'rounded' : 'rounded-lg'} overflow-hidden bg-white`}>
          {/* Status Bar */}
          {settings.showStatusBar && device.type !== 'desktop' && renderStatusBar()}
          
          {/* Grid Overlay */}
          {settings.showGrid && (
            <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
              <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} />
            </div>
          )}

          {/* Ruler */}
          {settings.showRuler && (
            <>
              <div className="absolute top-0 left-0 right-0 h-4 bg-gray-700 flex items-center text-xs text-white z-10">
                {Array.from({ length: Math.floor(device.width / 50) }, (_, i) => (
                  <div key={i} className="absolute text-xs" style={{ left: i * 50 }}>
                    {i * 50}
                  </div>
                ))}
              </div>
              <div className="absolute top-0 bottom-0 left-0 w-4 bg-gray-700 flex flex-col justify-center text-xs text-white z-10">
                {Array.from({ length: Math.floor(device.height / 50) }, (_, i) => (
                  <div key={i} className="absolute" style={{ top: i * 50 }}>
                    {i * 50}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Content */}
          <div className={`w-full h-full ${settings.showStatusBar && device.type !== 'desktop' ? 'pt-6' : ''} ${settings.showRuler ? 'pl-4 pt-4' : ''}`}>
            {children}
          </div>
        </div>

        {/* Device Controls (Home button, etc.) */}
        {settings.showBezel && device.type === 'phone' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function NetworkSimulator({ condition, onConditionChange }: {
  condition: string
  onConditionChange: (condition: string) => void
}) {
  const conditions: NetworkCondition[] = [
    {
      id: 'fast',
      name: 'Fast 4G',
      downloadSpeed: '8.75 MB/s',
      uploadSpeed: '1.25 MB/s',
      latency: '150ms',
      description: 'High-speed mobile connection'
    },
    {
      id: 'slow',
      name: 'Slow 3G',
      downloadSpeed: '400 KB/s',
      uploadSpeed: '200 KB/s',
      latency: '2000ms',
      description: 'Poor mobile connection'
    },
    {
      id: 'offline',
      name: 'Offline',
      downloadSpeed: '0 KB/s',
      uploadSpeed: '0 KB/s',
      latency: '∞',
      description: 'No network connection'
    }
  ]

  const currentCondition = conditions.find(c => c.id === condition)

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-white">Network Conditions</h4>
      
      <div className="space-y-2">
        {conditions.map(cond => (
          <button
            key={cond.id}
            onClick={() => onConditionChange(cond.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              condition === cond.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white">{cond.name}</span>
              {condition === cond.id && (
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
              )}
            </div>
            <div className="text-sm text-white/60 mb-1">{cond.description}</div>
            <div className="flex items-center space-x-4 text-xs text-white/40">
              <span>↓ {cond.downloadSpeed}</span>
              <span>↑ {cond.uploadSpeed}</span>
              <span>{cond.latency}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MobilePreviewSystem() {
  const [selectedDevice, setSelectedDevice] = useState('iphone-13')
  const [isRecording, setIsRecording] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('/')
  
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'iphone-13',
      name: 'iPhone 13',
      width: 390,
      height: 844,
      pixelRatio: 3,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      type: 'phone',
      icon: <Smartphone className="w-4 h-4" />,
      bezel: true,
      orientation: 'portrait'
    },
    {
      id: 'pixel-7',
      name: 'Pixel 7',
      width: 393,
      height: 851,
      pixelRatio: 2.75,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7)',
      type: 'phone',
      icon: <Smartphone className="w-4 h-4" />,
      bezel: true,
      orientation: 'portrait'
    },
    {
      id: 'ipad-air',
      name: 'iPad Air',
      width: 820,
      height: 1180,
      pixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)',
      type: 'tablet',
      icon: <Tablet className="w-4 h-4" />,
      bezel: true,
      orientation: 'portrait'
    },
    {
      id: 'desktop',
      name: 'Desktop',
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      type: 'desktop',
      icon: <Monitor className="w-4 h-4" />,
      bezel: false,
      orientation: 'landscape'
    }
  ])

  const [settings, setSettings] = useState<PreviewSettings>({
    showStatusBar: true,
    showBezel: true,
    enableTouch: true,
    networkCondition: 'fast',
    darkMode: false,
    showGrid: false,
    showRuler: false,
    zoom: 50
  })

  const currentDevice = devices.find(d => d.id === selectedDevice) || devices[0]

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId)
  }

  const toggleOrientation = () => {
    setDevices(prev => prev.map(device => 
      device.id === selectedDevice
        ? { ...device, orientation: device.orientation === 'portrait' ? 'landscape' : 'portrait' }
        : device
    ))
  }

  const updateSetting = (key: keyof PreviewSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setTimeout(() => setIsRecording(false), 10000) // Auto-stop after 10 seconds
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Mobile Preview System</h2>
          <p className="text-white/60">Test your designs across multiple devices and conditions</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="url"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="Enter URL to preview..."
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
          <SimpleButton variant="outline">
            <RefreshCw className="w-4 h-4" />
          </SimpleButton>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Controls Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Device Selector */}
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Device Selection</h3>
            <div className="space-y-2">
              {devices.map(device => (
                <button
                  key={device.id}
                  onClick={() => handleDeviceChange(device.id)}
                  className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    selectedDevice === device.id
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className={selectedDevice === device.id ? 'text-blue-400' : 'text-white/60'}>
                    {device.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium">{device.name}</div>
                    <div className="text-xs text-white/60">
                      {device.orientation === 'portrait' ? device.width : device.height}×
                      {device.orientation === 'portrait' ? device.height : device.width}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </SimpleCard>

          {/* Preview Settings */}
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Preview Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Status Bar</span>
                <button
                  onClick={() => updateSetting('showStatusBar', !settings.showStatusBar)}
                  className={`relative w-10 h-5 rounded-full transition-all ${
                    settings.showStatusBar ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute w-3 h-3 rounded-full bg-white top-1 transition-all ${
                    settings.showStatusBar ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Device Bezel</span>
                <button
                  onClick={() => updateSetting('showBezel', !settings.showBezel)}
                  className={`relative w-10 h-5 rounded-full transition-all ${
                    settings.showBezel ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute w-3 h-3 rounded-full bg-white top-1 transition-all ${
                    settings.showBezel ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Grid Overlay</span>
                <button
                  onClick={() => updateSetting('showGrid', !settings.showGrid)}
                  className={`relative w-10 h-5 rounded-full transition-all ${
                    settings.showGrid ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute w-3 h-3 rounded-full bg-white top-1 transition-all ${
                    settings.showGrid ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">Zoom</span>
                  <span className="text-white text-sm">{settings.zoom}%</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="100"
                  value={settings.zoom}
                  onChange={(e) => updateSetting('zoom', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </SimpleCard>

          {/* Network Simulation */}
          <SimpleCard>
            <NetworkSimulator
              condition={settings.networkCondition}
              onConditionChange={(condition) => updateSetting('networkCondition', condition)}
            />
          </SimpleCard>

          {/* Actions */}
          <SimpleCard>
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <SimpleButton className="w-full justify-start" onClick={toggleOrientation}>
                <RotateClockwise className="w-4 h-4 mr-2" />
                Rotate Device
              </SimpleButton>
              
              <SimpleButton 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleStartRecording}
                disabled={isRecording}
              >
                {isRecording ? (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </SimpleButton>
              
              <SimpleButton variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Screenshot
              </SimpleButton>
              
              <SimpleButton variant="outline" className="w-full justify-start">
                <Share className="w-4 h-4 mr-2" />
                Share Preview
              </SimpleButton>
            </div>
          </SimpleCard>
        </div>

        {/* Preview Area */}
        <div className="xl:col-span-3">
          <SimpleCard className="p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="text-blue-400">
                  {currentDevice.icon}
                </div>
                <div>
                  <div className="text-white font-medium">{currentDevice.name}</div>
                  <div className="text-sm text-white/60">
                    {currentDevice.orientation === 'portrait' 
                      ? `${currentDevice.width}×${currentDevice.height}` 
                      : `${currentDevice.height}×${currentDevice.width}`
                    } • {currentDevice.pixelRatio}x
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                  settings.networkCondition === 'fast' ? 'bg-green-500/20 text-green-400' :
                  settings.networkCondition === 'slow' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {settings.networkCondition === 'offline' ? (
                    <WifiOff className="w-3 h-3" />
                  ) : (
                    <Wifi className="w-3 h-3" />
                  )}
                  <span className="capitalize">{settings.networkCondition}</span>
                </div>
                
                {isRecording && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span>Recording</span>
                  </div>
                )}
              </div>
            </div>

            <DeviceFrame device={currentDevice} settings={settings}>
              <iframe
                src={previewUrl}
                className="w-full h-full border-none"
                title={`Preview - ${currentDevice.name}`}
              />
            </DeviceFrame>
          </SimpleCard>
        </div>
      </div>
    </div>
  )
}