/**
 * Dialog Component - Production Ready
 * A modal dialog component for displaying content above the main UI
 */

'use client'

import React, { forwardRef, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  )
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, children, onClick, asChild = false, ...props }, ref) => {
    const context = useContext(DialogContext)
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      context?.onOpenChange(true)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          const childProps = (children as any).props
          childProps?.onClick?.(e)
          handleClick(e as React.MouseEvent<HTMLButtonElement>)
        }
      })
    }

    return (
      <button
        ref={ref}
        className={cn("cursor-pointer", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

DialogTrigger.displayName = 'DialogTrigger'

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(DialogContext)

    if (!context?.open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-200">
        {/* Enhanced Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-200"
          onClick={() => context.onOpenChange(false)}
        />
        
        {/* Content with enhanced styling */}
        <div
          ref={ref}
          className={cn(
            "relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-lg w-full m-4 max-h-[90vh] overflow-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-200",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* Enhanced Close button */}
          <button
            className="absolute right-4 top-4 p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm opacity-70 hover:opacity-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
            onClick={() => context.onOpenChange(false)}
          >
            <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
            <span className="sr-only">Close</span>
          </button>
          
          {children}
        </div>
      </div>
    )
  }
)

DialogContent.displayName = 'DialogContent'

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 text-center sm:text-left p-6 pb-4 border-b border-white/10", className)}
      {...props}
    />
  )
)

DialogHeader.displayName = 'DialogHeader'

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-bold leading-tight tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent", className)}
      {...props}
    />
  )
)

DialogTitle.displayName = 'DialogTitle'

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600 dark:text-gray-400 leading-relaxed", className)}
      {...props}
    />
  )
)

DialogDescription.displayName = 'DialogDescription'

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 p-6 pt-4 border-t border-white/10 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl", className)}
      {...props}
    />
  )
)

DialogFooter.displayName = 'DialogFooter'

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
}