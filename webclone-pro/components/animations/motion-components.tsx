'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import * as animations from '@/lib/animations'

interface AnimatedProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  animation?: keyof typeof animations
  delay?: number
  duration?: number
  className?: string
}

// Fade In Component
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Fade In Up Component
export function FadeInUp({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  ...props 
}: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Scale In Component
export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.4,
  className = '',
  ...props 
}: AnimatedProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Slide In Component
export function SlideIn({ 
  children, 
  direction = 'left',
  delay = 0, 
  duration = 0.4,
  className = '',
  ...props 
}: AnimatedProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const variants = {
    left: { x: '-100%' },
    right: { x: '100%' },
    up: { y: '-100%' },
    down: { y: '100%' }
  }
  
  return (
    <motion.div
      initial={variants[direction]}
      animate={{ x: 0, y: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger Container Component
export function StaggerContainer({ 
  children,
  staggerDelay = 0.1,
  className = '',
  ...props
}: AnimatedProps & { staggerDelay?: number }) {
  return (
    <motion.div
      variants={animations.staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger Item Component
export function StaggerItem({ 
  children,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      variants={animations.staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Floating Component
export function Float({ 
  children,
  duration = 6,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Pulse Component
export function Pulse({ 
  children,
  duration = 1,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Glow Component
export function Glow({ 
  children,
  color = 'rgba(139, 92, 246, 0.5)',
  className = '',
  ...props
}: AnimatedProps & { color?: string }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${color.replace('0.5', '0.3')}`,
          `0 0 40px ${color}`,
          `0 0 20px ${color.replace('0.5', '0.3')}`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Blur In Component
export function BlurIn({ 
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Text Reveal Component
export function TextReveal({ 
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        clipPath: 'inset(100% 0% 0% 0%)'
      }}
      animate={{
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)'
      }}
      transition={{ 
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Parallax Component
export function Parallax({ 
  children,
  offset = 50,
  className = '',
  ...props
}: AnimatedProps & { offset?: number }) {
  return (
    <motion.div
      initial={{ y: -offset, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Card Hover Component
export function CardHover({ 
  children,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Rotate In Component
export function RotateIn({ 
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      initial={{ rotate: -180, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Flip In Component
export function FlipIn({ 
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Wave Component
export function Wave({ 
  children,
  className = '',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      animate={{
        rotate: [0, 14, -8, 14, -4, 10, 0],
      }}
      transition={{
        duration: 2.5,
        ease: 'easeInOut',
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 1
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Loading Dots Component
export function LoadingDots({ 
  count = 3,
  className = '',
  dotClassName = 'w-2 h-2 bg-current rounded-full'
}: { 
  count?: number
  className?: string
  dotClassName?: string 
}) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={dotClassName}
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}

// Skeleton Loading Component
export function Skeleton({ 
  className = 'h-4 bg-muted rounded',
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
      {...props}
    />
  )
}

// Typing Effect Component
export function TypingEffect({ 
  text,
  delay = 0,
  duration = 2,
  className = '',
  ...props
}: { text: string } & AnimatedProps) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{
        delay,
        duration,
        ease: 'steps(20, end)'
      }}
      className={`overflow-hidden whitespace-nowrap ${className}`}
      {...props}
    >
      {text}
    </motion.div>
  )
}

// Generic Animated Component
export function Animated({ 
  children,
  animation = 'fadeInUp',
  className = '',
  ...props
}: AnimatedProps) {
  const selectedAnimation = animations[animation] || animations.fadeInUp
  
  return (
    <motion.div
      variants={selectedAnimation}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Export all components
export const AnimationComponents = {
  FadeIn,
  FadeInUp,
  ScaleIn,
  SlideIn,
  StaggerContainer,
  StaggerItem,
  Float,
  Pulse,
  Glow,
  BlurIn,
  TextReveal,
  Parallax,
  CardHover,
  RotateIn,
  FlipIn,
  Wave,
  LoadingDots,
  Skeleton,
  TypingEffect,
  Animated
}

export default AnimationComponents