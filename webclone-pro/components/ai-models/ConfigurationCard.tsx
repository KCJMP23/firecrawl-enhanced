/**
 * ConfigurationCard Component
 * 
 * Displays individual model configuration with parameters, system prompt,
 * and management actions. Extracted from monolithic AIModelSelection.
 */

'use client'

import {
  Star,
  MoreHorizontal,
  Edit3,
  Copy,
  Download,
  Trash2
} from 'lucide-react'
import { SimpleButton } from '@/components/ui'

export interface ModelConfiguration {
  id: string
  modelId: string
  name: string
  description: string
  parameters: {
    temperature: number
    topP: number
    topK?: number
    maxTokens: number
    frequencyPenalty: number
    presencePenalty: number
  }
  systemPrompt: string
  isDefault: boolean
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

export interface ConfigurationCardProps {
  config: ModelConfiguration
  onAction: (action: string, configId: string) => void
}

export function ConfigurationCard({ config, onAction }: ConfigurationCardProps) {
  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-white">{config.name}</h4>
            {config.isDefault && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">{config.description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <SimpleButton variant="outline" size="sm" onClick={() => onAction('edit', config.id)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </SimpleButton>
          <div className="relative group">
            <SimpleButton variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('duplicate', config.id)}
                >
                  <Copy className="w-4 h-4 inline mr-2" />
                  Duplicate
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('export', config.id)}
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export
                </button>
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white"
                  onClick={() => onAction('set_default', config.id)}
                >
                  <Star className="w-4 h-4 inline mr-2" />
                  Set Default
                </button>
                <div className="border-t border-white/10 my-1" />
                <button 
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-red-400"
                  onClick={() => onAction('delete', config.id)}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-white/60 text-xs mb-1">Temperature</div>
          <div className="text-white/80">{config.parameters.temperature}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Top P</div>
          <div className="text-white/80">{config.parameters.topP}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Max Tokens</div>
          <div className="text-white/80">{config.parameters.maxTokens}</div>
        </div>
        <div>
          <div className="text-white/60 text-xs mb-1">Usage</div>
          <div className="text-white/80">{config.usageCount} times</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-white/60 text-xs mb-1">System Prompt</div>
        <div className="text-white/80 text-sm bg-black/30 rounded p-2 max-h-20 overflow-y-auto">
          {config.systemPrompt || 'No system prompt configured'}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-white/60">
        <span>Created {config.createdAt.toLocaleDateString()}</span>
        <span>
          Last used: {config.lastUsed ? config.lastUsed.toLocaleDateString() : 'Never'}
        </span>
      </div>
    </div>
  )
}

export default ConfigurationCard