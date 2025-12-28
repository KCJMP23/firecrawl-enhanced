/**
 * ModelCard Component
 * 
 * Displays individual AI model information with performance metrics,
 * pricing details, and action buttons. Extracted from monolithic AIModelSelection.
 */

'use client'

import {
  Brain,
  Zap,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Code,
  FileText,
  Image,
  MessageSquare,
  Cpu,
  Award,
  Target,
  Shield,
  Globe,
  RefreshCw,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit3,
  Copy,
  Download,
  Timer,
  Gauge,
  Flame,
  Snowflake
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

export interface AIModel {
  id: string
  name: string
  provider: string
  version: string
  description: string
  category: 'text' | 'image' | 'code' | 'multimodal'
  status: 'available' | 'deprecated' | 'beta' | 'maintenance'
  capabilities: string[]
  performance: {
    speed: 'fast' | 'medium' | 'slow'
    quality: 'high' | 'medium' | 'low'
    costEfficiency: 'high' | 'medium' | 'low'
  }
  pricing: {
    input: number // per 1K tokens
    output: number // per 1K tokens
    currency: string
  }
  limits: {
    maxTokens: number
    contextWindow: number
    requestsPerMinute: number
  }
  metrics: {
    latencyP95: number // milliseconds
    throughput: number // tokens/second
    errorRate: number // percentage
    uptime: number // percentage
  }
  tags: string[]
  lastUpdated: string
}

export interface ModelCardProps {
  model: AIModel
  onAction: (action: string, modelId: string) => void
  isSelected?: boolean
}

export function ModelCard({ model, onAction, isSelected }: ModelCardProps) {
  const getStatusColor = () => {
    switch (model.status) {
      case 'available': return 'text-green-400 bg-green-400/20'
      case 'deprecated': return 'text-red-400 bg-red-400/20'
      case 'beta': return 'text-yellow-400 bg-yellow-400/20'
      case 'maintenance': return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getPerformanceIcon = () => {
    switch (model.performance.speed) {
      case 'fast': return <Zap className="w-4 h-4 text-green-400" />
      case 'medium': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'slow': return <Timer className="w-4 h-4 text-red-400" />
    }
  }

  const getQualityIcon = () => {
    switch (model.performance.quality) {
      case 'high': return <Star className="w-4 h-4 text-yellow-400" />
      case 'medium': return <Award className="w-4 h-4 text-blue-400" />
      case 'low': return <Target className="w-4 h-4 text-gray-400" />
    }
  }

  const getCostIcon = () => {
    switch (model.performance.costEfficiency) {
      case 'high': return <DollarSign className="w-4 h-4 text-green-400" />
      case 'medium': return <DollarSign className="w-4 h-4 text-yellow-400" />
      case 'low': return <DollarSign className="w-4 h-4 text-red-400" />
    }
  }

  const getCategoryIcon = () => {
    switch (model.category) {
      case 'text': return <FileText className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      case 'code': return <Code className="w-5 h-5" />
      case 'multimodal': return <Brain className="w-5 h-5" />
    }
  }

  return (
    <SimpleCard 
      className={`group hover:shadow-lg transition-all duration-200 border-l-4 ${
        isSelected 
          ? 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
          : 'border-l-transparent hover:border-l-blue-300'
      }`}
      variant="elevated"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              {getCategoryIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {model.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {model.provider} • v{model.version}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {model.status}
            </span>
            <SimpleButton
              variant="ghost"
              size="icon"
              onClick={() => onAction('menu', model.id)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </SimpleButton>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {model.description}
        </p>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            {getPerformanceIcon()}
            <div className="flex-1">
              <p className="text-xs text-gray-500">Speed</p>
              <p className="text-sm font-medium capitalize">{model.performance.speed}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getQualityIcon()}
            <div className="flex-1">
              <p className="text-xs text-gray-500">Quality</p>
              <p className="text-sm font-medium capitalize">{model.performance.quality}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getCostIcon()}
            <div className="flex-1">
              <p className="text-xs text-gray-500">Cost Efficiency</p>
              <p className="text-sm font-medium capitalize">{model.performance.costEfficiency}</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-500">Latency</span>
            </div>
            <p className="text-sm font-medium">{model.metrics?.latencyP95 || 0}ms</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Gauge className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-500">Uptime</span>
            </div>
            <p className="text-sm font-medium">{model.metrics?.uptime || 99.9}%</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Pricing per 1K tokens</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                ${model.pricing.input.toFixed(4)} in
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm font-medium">
                ${model.pricing.output.toFixed(4)} out
              </span>
            </div>
          </div>
          <DollarSign className="w-5 h-5 text-green-500" />
        </div>

        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
                +{model.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <SimpleButton
            variant={isSelected ? "primary" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => onAction(isSelected ? 'deselect' : 'select', model.id)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSelected ? 'Selected' : 'Select'}
          </SimpleButton>
          
          <SimpleButton
            variant="ghost"
            size="sm"
            onClick={() => onAction('view', model.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </SimpleButton>
          
          <SimpleButton
            variant="ghost"
            size="icon"
            onClick={() => onAction('test', model.id)}
          >
            <Play className="w-4 h-4" />
          </SimpleButton>
        </div>
      </div>
    </SimpleCard>
  )
}

export default ModelCard