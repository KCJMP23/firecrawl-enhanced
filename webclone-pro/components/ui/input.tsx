/**
 * Input Component - Production Ready
 * Accessible input with validation states and proper styling
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success'
  inputSize?: 'sm' | 'default' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', inputSize = 'default', type, ...props }, ref) => {
    const variantClasses = {
      default: 'border-white/20 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10',
      error: 'border-red-400 focus:border-red-500 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10',
      success: 'border-green-400 focus:border-green-500 focus:ring-green-500/20 focus:shadow-lg focus:shadow-green-500/10'
    }

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm rounded-lg',
      default: 'h-10 px-4 py-2 rounded-xl',
      lg: 'h-12 px-5 py-3 text-lg rounded-xl'
    }

    return (
      <input
        type={type}
        className={cn(
          // Base classes with enhanced styling
          "flex w-full border bg-white/5 backdrop-blur-sm text-white placeholder:text-white/50 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-4 focus:ring-offset-0 focus:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/10 hover:border-white/30",
          // Variant classes
          variantClasses[variant],
          // Size classes
          sizeClasses[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'border-white/20 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10',
      error: 'border-red-400 focus:border-red-500 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10',
      success: 'border-green-400 focus:border-green-500 focus:ring-green-500/20 focus:shadow-lg focus:shadow-green-500/10'
    }

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-0 focus:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 resize-none hover:bg-white/10 hover:border-white/30",
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }

// Label component for forms
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-white/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  )
)

Label.displayName = 'Label'

export { Label }

// Form field wrapper
export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}