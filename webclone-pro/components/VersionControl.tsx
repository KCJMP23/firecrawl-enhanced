'use client'

import { useState } from 'react'
import {
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Clock,
  User,
  FileText,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Save,
  Copy,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface Version {
  id: string
  version: string
  message: string
  author: string
  timestamp: Date
  changes: {
    added: number
    modified: number
    deleted: number
  }
  hash: string
  parent?: string
  branch: string
  tags: string[]
}

interface Branch {
  name: string
  isActive: boolean
  ahead: number
  behind: number
  lastCommit: Date
}

interface VersionControlProps {
  projectId: string
  projectName: string
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
  size?: 'default' | 'sm' | 'icon'
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

function VersionCard({ version, isActive, onRestore, onCompare }: {
  version: Version
  isActive: boolean
  onRestore: (versionId: string) => void
  onCompare: (versionId: string) => void
}) {
  const getChangeColor = (type: 'added' | 'modified' | 'deleted') => {
    switch (type) {
      case 'added': return 'text-green-400'
      case 'modified': return 'text-yellow-400'
      case 'deleted': return 'text-red-400'
    }
  }

  return (
    <div className={`relative flex items-start space-x-4 p-4 rounded-lg transition-all ${
      isActive ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' : 'hover:bg-white/5'
    }`}>
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
          isActive ? 'bg-blue-500' : 'bg-white/20'
        }`}>
          {isActive && <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
        <div className="w-0.5 h-full bg-white/10 mt-2"></div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-white">{version.version}</span>
              {isActive && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Current
                </span>
              )}
              {version.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-white/80">{version.message}</p>
          </div>
          
          {!isActive && (
            <div className="flex items-center space-x-2">
              <SimpleButton variant="outline" size="sm" onClick={() => onCompare(version.id)}>
                Compare
              </SimpleButton>
              <SimpleButton variant="ghost" size="sm" onClick={() => onRestore(version.id)}>
                <RotateCcw className="w-4 h-4" />
              </SimpleButton>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 text-xs text-white/60">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{version.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(version.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitCommit className="w-3 h-3" />
            <span className="font-mono">{version.hash}</span>
          </div>
        </div>

        {/* Changes */}
        <div className="flex items-center space-x-4 mt-2">
          <span className={`flex items-center space-x-1 text-xs ${getChangeColor('added')}`}>
            <ArrowUpRight className="w-3 h-3" />
            <span>+{version.changes.added}</span>
          </span>
          <span className={`flex items-center space-x-1 text-xs ${getChangeColor('modified')}`}>
            <ArrowUpRight className="w-3 h-3" />
            <span>~{version.changes.modified}</span>
          </span>
          <span className={`flex items-center space-x-1 text-xs ${getChangeColor('deleted')}`}>
            <ArrowDownRight className="w-3 h-3" />
            <span>-{version.changes.deleted}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function BranchSelector({ branches, activeBranch, onBranchChange }: {
  branches: Branch[]
  activeBranch: string
  onBranchChange: (branchName: string) => void
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [showNewBranch, setShowNewBranch] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
      >
        <GitBranch className="w-4 h-4" />
        <span className="text-white">{activeBranch}</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-90' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-64 bg-black/90 border border-white/10 rounded-lg shadow-lg z-10">
          <div className="p-2">
            {branches.map(branch => (
              <button
                key={branch.name}
                onClick={() => {
                  onBranchChange(branch.name)
                  setShowDropdown(false)
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors ${
                  branch.isActive ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-white/60" />
                    <span className="text-white">{branch.name}</span>
                    {branch.isActive && (
                      <Check className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                  {(branch.ahead > 0 || branch.behind > 0) && (
                    <div className="flex items-center space-x-2 text-xs">
                      {branch.ahead > 0 && (
                        <span className="text-green-400">↑{branch.ahead}</span>
                      )}
                      {branch.behind > 0 && (
                        <span className="text-red-400">↓{branch.behind}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="border-t border-white/10 p-2">
            {showNewBranch ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  // Create new branch
                  setNewBranchName('')
                  setShowNewBranch(false)
                  setShowDropdown(false)
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Branch name..."
                  className="flex-1 px-3 py-1 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <SimpleButton type="submit" size="sm">
                  <Check className="w-4 h-4" />
                </SimpleButton>
                <SimpleButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewBranch(false)}
                >
                  <X className="w-4 h-4" />
                </SimpleButton>
              </form>
            ) : (
              <button
                onClick={() => setShowNewBranch(true)}
                className="w-full text-left px-3 py-2 text-blue-400 hover:bg-white/10 rounded transition-colors"
              >
                + Create new branch
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VersionControl({ projectId, projectName }: VersionControlProps) {
  const [activeBranch, setActiveBranch] = useState('main')
  const [commitMessage, setCommitMessage] = useState('')
  const [showCompare, setShowCompare] = useState(false)
  const [compareVersion, setCompareVersion] = useState<string | null>(null)

  const branches: Branch[] = [
    { name: 'main', isActive: true, ahead: 0, behind: 0, lastCommit: new Date() },
    { name: 'develop', isActive: false, ahead: 3, behind: 1, lastCommit: new Date('2024-12-23') },
    { name: 'feature/redesign', isActive: false, ahead: 7, behind: 4, lastCommit: new Date('2024-12-22') }
  ]

  const versions: Version[] = [
    {
      id: '1',
      version: 'v1.3.0',
      message: 'Updated navigation and improved performance',
      author: 'John Doe',
      timestamp: new Date('2024-12-24T10:00:00'),
      changes: { added: 12, modified: 8, deleted: 3 },
      hash: 'a3f4b2c',
      branch: 'main',
      tags: ['latest', 'production']
    },
    {
      id: '2',
      version: 'v1.2.1',
      message: 'Fixed responsive issues on mobile',
      author: 'Sarah Smith',
      timestamp: new Date('2024-12-23T14:30:00'),
      changes: { added: 3, modified: 15, deleted: 0 },
      hash: 'b7e9d1a',
      parent: 'a3f4b2c',
      branch: 'main',
      tags: []
    },
    {
      id: '3',
      version: 'v1.2.0',
      message: 'Added new hero section with animations',
      author: 'Mike Johnson',
      timestamp: new Date('2024-12-22T09:15:00'),
      changes: { added: 25, modified: 10, deleted: 8 },
      hash: 'c5f2e8b',
      parent: 'b7e9d1a',
      branch: 'main',
      tags: ['milestone']
    },
    {
      id: '4',
      version: 'v1.1.0',
      message: 'Implemented dark mode support',
      author: 'Lisa Chen',
      timestamp: new Date('2024-12-20T16:45:00'),
      changes: { added: 18, modified: 32, deleted: 5 },
      hash: 'd8a3f6c',
      parent: 'c5f2e8b',
      branch: 'main',
      tags: []
    },
    {
      id: '5',
      version: 'v1.0.0',
      message: 'Initial clone from apple.com',
      author: 'System',
      timestamp: new Date('2024-12-15T10:00:00'),
      changes: { added: 156, modified: 0, deleted: 0 },
      hash: 'e1b4c9d',
      parent: null,
      branch: 'main',
      tags: ['initial']
    }
  ]

  const handleCommit = () => {
    if (!commitMessage.trim()) return
    
    // Create new version
    console.log('Creating new version:', commitMessage)
    setCommitMessage('')
  }

  const handleRestore = (versionId: string) => {
    console.log('Restoring version:', versionId)
  }

  const handleCompare = (versionId: string) => {
    setCompareVersion(versionId)
    setShowCompare(true)
  }

  return (
    <div className="bg-black/50 backdrop-blur-lg rounded-lg border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Version Control</h3>
          <p className="text-sm text-white/60">Track and manage changes to your project</p>
        </div>
        
        <BranchSelector
          branches={branches}
          activeBranch={activeBranch}
          onBranchChange={setActiveBranch}
        />
      </div>

      {/* Commit Section */}
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <GitCommit className="w-5 h-5 text-blue-400 mt-1" />
          <div className="flex-1">
            <h4 className="font-medium text-white mb-2">Save Current State</h4>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Describe your changes..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
              <SimpleButton onClick={handleCommit} disabled={!commitMessage.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Commit
              </SimpleButton>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-white/40">
              <span>3 files changed</span>
              <span>+45 additions</span>
              <span>-12 deletions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="space-y-2">
        <h4 className="font-medium text-white mb-3">Version History</h4>
        <div className="space-y-1">
          {versions.filter(v => v.branch === activeBranch).map((version, index) => (
            <VersionCard
              key={version.id}
              version={version}
              isActive={index === 0}
              onRestore={handleRestore}
              onCompare={handleCompare}
            />
          ))}
        </div>
      </div>

      {/* Compare Modal */}
      {showCompare && compareVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Compare Versions</h2>
              <button
                onClick={() => setShowCompare(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-white mb-3">Current Version</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <pre className="text-sm text-green-400">
                    + New navigation menu
                    + Improved animations
                    + Performance optimizations
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-white mb-3">Previous Version</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <pre className="text-sm text-red-400">
                    - Old navigation style
                    - Basic animations
                    - Unoptimized images
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <SimpleButton variant="outline" onClick={() => setShowCompare(false)}>
                Close
              </SimpleButton>
              <SimpleButton>
                <GitMerge className="w-4 h-4 mr-2" />
                Merge Changes
              </SimpleButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}