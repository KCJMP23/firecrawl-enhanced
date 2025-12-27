/**
 * SimpleCard Component
 * 
 * A reusable card component extracted from duplicated code across the application.
 * Provides consistent styling and layout for all simple card containers.
 */

import React from 'react'

interface SimpleCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient'
  padding?: 'none' | 'sm' | 'default' | 'lg'
  rounded?: 'none' | 'sm' | 'default' | 'lg' | 'xl'
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void
  [key: string]: any
}

export function SimpleCard({ 
  children, 
  className = '',
  variant = 'default',
  padding = 'default',
  rounded = 'default',
  ...props 
}: SimpleCardProps) {
  // Base classes for all cards
  const baseClasses = 'transition-all duration-200'
  
  // Variant-specific styling
  const variantClasses = {
    'default': 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    'elevated': 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
    'outlined': 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    'glass': 'border border-white/10 bg-white/5 backdrop-blur-sm',
    'gradient': 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700'
  }
  
  // Padding options
  const paddingClasses = {
    'none': 'p-0',
    'sm': 'p-3',
    'default': 'p-4',
    'lg': 'p-6'
  }
  
  // Border radius options
  const roundedClasses = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'default': 'rounded-lg',
    'lg': 'rounded-xl',
    'xl': 'rounded-2xl'
  }
  
  // Combine all classes
  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    roundedClasses[rounded],
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div 
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  )
}

// Additional card components for common patterns
export function SimpleCardHeader({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 pb-3 mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function SimpleCardTitle({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h3>
  )
}

export function SimpleCardContent({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  )
}

export function SimpleCardFooter({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 pt-3 mt-4 ${className}`}>
      {children}
    </div>
  )
}

// Export as default for easier importing
export default SimpleCard