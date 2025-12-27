'use client'

import { useState } from 'react'
import Link from 'next/link'
import AIModelSelection from '@/components/AIModelSelection'
import { ArrowLeft, Globe } from 'lucide-react'

function SimpleButton({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  ...props 
}: {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  [key: string]: any
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = variant === 'outline' 
    ? 'border border-white/20 bg-transparent hover:bg-white/10 text-white'
    : variant === 'ghost'
    ? 'hover:bg-white/10 text-white'
    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
  const sizeClasses = size === 'sm' ? 'h-8 px-3 text-sm' : size === 'lg' ? 'h-12 px-8 text-lg' : 'h-10 px-4 py-2'
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function AIModelsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  WebClone Pro
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-white/60 hover:text-white cursor-pointer transition-colors">Dashboard</Link>
                <span className="text-white font-medium">AI Models</span>
                <Link href="/templates" className="text-white/60 hover:text-white cursor-pointer transition-colors">Templates</Link>
                <Link href="/teams" className="text-white/60 hover:text-white cursor-pointer transition-colors">Teams</Link>
                <Link href="/analytics" className="text-white/60 hover:text-white cursor-pointer transition-colors">Analytics</Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <SimpleButton variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </SimpleButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Model Configuration</h1>
          <p className="text-white/60">Configure and manage your AI models for website cloning and remixing</p>
        </div>

        {/* AI Model Selection Component */}
        <AIModelSelection />
      </div>
    </div>
  )
}