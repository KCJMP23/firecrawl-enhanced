/**
 * Select Component - Production Ready
 * Accessible select with keyboard navigation and custom styling
 */

'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined)

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

export function Select({
  value,
  defaultValue = '',
  onValueChange,
  children,
  disabled
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const currentValue = value ?? internalValue
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  useEffect(() => {
    if (disabled) {
      setOpen(false)
    }
  }, [disabled])

  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange, 
      open: open && !disabled, 
      setOpen: disabled ? () => {} : setOpen 
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  placeholder?: string
}

export function SelectTrigger({ children, className, placeholder }: SelectTriggerProps) {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('SelectTrigger must be used within Select')
  }

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={context.open}
      aria-haspopup="listbox"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <span className={cn("block truncate", !context.value && "text-white/40")}>
        {context.value ? children : placeholder}
      </span>
      <ChevronDown className={cn(
        "h-4 w-4 opacity-50 transition-transform",
        context.open && "rotate-180"
      )} />
    </button>
  )
}

export interface SelectValueProps {
  placeholder?: string
  className?: string
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('SelectValue must be used within Select')
  }

  return (
    <span className={className}>
      {context.value || placeholder}
    </span>
  )
}

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
  position?: 'bottom' | 'top'
}

export function SelectContent({ children, className, position = 'bottom' }: SelectContentProps) {
  const context = useContext(SelectContext)
  const contentRef = useRef<HTMLDivElement>(null)

  if (!context) {
    throw new Error('SelectContent must be used within Select')
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        context.setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        context.setOpen(false)
      }
    }

    if (context.open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [context.open, context])

  if (!context.open) return null

  return (
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-white/20 bg-black/90 backdrop-blur-sm p-1 shadow-md animate-in fade-in-0 zoom-in-95",
        position === 'bottom' ? "top-full mt-1" : "bottom-full mb-1",
        className
      )}
    >
      {children}
    </div>
  )
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function SelectItem({ value, children, className, disabled }: SelectItemProps) {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('SelectItem must be used within Select')
  }

  const isSelected = context.value === value

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => !disabled && context.onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-white/10 focus:bg-white/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-white/10",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-white" />}
      </span>
      <span className="text-white">{children}</span>
    </button>
  )
}

export interface SelectSeparatorProps {
  className?: string
}

export function SelectSeparator({ className }: SelectSeparatorProps) {
  return (
    <div className={cn("mx-1 my-1 h-px bg-white/20", className)} />
  )
}