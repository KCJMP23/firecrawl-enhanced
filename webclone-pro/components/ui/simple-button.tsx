/**
 * SimpleButton Component
 * 
 * A reusable button component extracted from duplicated code across the application.
 * Provides consistent styling and behavior for all simple buttons.
 */

import React from 'react'

interface SimpleButtonProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void
  [key: string]: any
}

export function SimpleButton({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false,
  type = 'button',
  ...props 
}: SimpleButtonProps) {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  // Variant-specific styling
  const variantClasses = {
    'default': 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    'outline': 'border border-white/20 bg-transparent hover:bg-white/10 text-white',
    'ghost': 'text-white hover:bg-white/10',
    'primary': 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    'secondary': 'bg-gray-600 text-white hover:bg-gray-700',
    'destructive': 'bg-red-600 text-white hover:bg-red-700'
  }
  
  // Size-specific styling
  const sizeClasses = {
    'xs': 'h-7 px-2 text-xs',
    'sm': 'h-8 px-3 text-sm', 
    'default': 'h-10 px-4 py-2',
    'lg': 'h-12 px-8 text-lg',
    'icon': 'h-10 w-10'
  }
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')
  
  return (
    <button 
      className={buttonClasses}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

// Export as default for easier importing
export default SimpleButton