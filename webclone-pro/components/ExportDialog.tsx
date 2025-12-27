'use client'

import { useState } from 'react'
import {
  Download,
  X,
  Code,
  FileZip,
  Globe,
  Sparkles,
  Check
} from 'lucide-react'

interface ExportDialogProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
}

const exportFormats = [
  {
    id: 'zip',
    name: 'Static HTML/CSS/JS',
    description: 'Complete website files ready to deploy',
    icon: <FileZip className="w-6 h-6" />,
    recommended: true
  },
  {
    id: 'react',
    name: 'React App',
    description: 'Convert to a React component-based application',
    icon: <Code className="w-6 h-6" />,
    recommended: false
  },
  {
    id: 'nextjs',
    name: 'Next.js Project',
    description: 'Full-stack Next.js application with routing',
    icon: <Globe className="w-6 h-6" />,
    recommended: false
  },
  {
    id: 'vue',
    name: 'Vue.js App',
    description: 'Vue 3 single-page application',
    icon: <Sparkles className="w-6 h-6" />,
    recommended: false
  }
]

export default function ExportDialog({ projectId, projectName, isOpen, onClose }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('zip')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          format: selectedFormat
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob from the response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}_${selectedFormat}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setExportComplete(true)
      setTimeout(() => {
        setExportComplete(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Export Project</h2>
            <p className="text-white/60">Choose a format to export "{projectName}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-4 mb-8">
          {exportFormats.map(format => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                selectedFormat === format.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${
                  selectedFormat === format.id
                    ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30'
                    : 'bg-white/10'
                }`}>
                  <div className={selectedFormat === format.id ? 'text-blue-400' : 'text-white/60'}>
                    {format.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white">{format.name}</h3>
                    {format.recommended && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">{format.description}</p>
                </div>
                {selectedFormat === format.id && (
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Check className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Export Details */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-white/60 mb-3">Export includes:</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-400 mr-2" />
              All HTML pages and content
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-400 mr-2" />
              CSS styles and animations
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-400 mr-2" />
              JavaScript functionality
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-400 mr-2" />
              Images and media assets
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-400 mr-2" />
              README and documentation
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : exportComplete ? (
              <>
                <Check className="w-5 h-5" />
                <span>Export Complete!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export Project</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}