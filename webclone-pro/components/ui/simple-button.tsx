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
    'default': 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    'outline': 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    'ghost': 'text-foreground hover:bg-accent hover:text-accent-foreground',
    'primary': 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    'secondary': 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    'destructive': 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
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