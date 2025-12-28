import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:shadow-md hover:from-blue-500 hover:to-purple-500',
        secondary:
          'border-transparent bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-sm hover:shadow-md dark:from-gray-800 dark:to-gray-700 dark:text-white',
        destructive:
          'border-transparent bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm hover:shadow-md hover:from-red-400 hover:to-pink-400',
        outline: 'text-foreground border-border hover:bg-accent/50',
        success: 'border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm hover:shadow-md hover:from-green-400 hover:to-emerald-400',
        warning: 'border-transparent bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:from-yellow-400 hover:to-orange-400',
        info: 'border-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm hover:shadow-md hover:from-cyan-400 hover:to-blue-400',
        gradient: 'border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md text-white shadow-lg hover:bg-white/20 hover:border-white/30',
        glow: 'border-transparent bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40',
        shine: 'border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
      },
      size: {
        default: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }