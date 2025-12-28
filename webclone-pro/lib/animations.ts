import { Variants } from 'framer-motion'

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

// Scale animations
export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
}

export const scaleUp: Variants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  }
}

// Slide animations
export const slideInLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

export const slideInTop: Variants = {
  hidden: { y: '-100%' },
  visible: { 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

export const slideInBottom: Variants = {
  hidden: { y: '100%' },
  visible: { 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

// Stagger children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

// Rotate animations
export const rotateIn: Variants = {
  hidden: { rotate: -180, opacity: 0 },
  visible: { 
    rotate: 0, 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

// Flip animations
export const flipIn: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: { 
    rotateY: 0, 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

// Bounce animation
export const bounce: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 1],
      ease: ['easeIn', 'easeOut', 'easeIn']
    }
  }
}

// Pulse animation
export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Shake animation
export const shake: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
}

// Glow animation
export const glow: Variants = {
  hidden: { 
    boxShadow: '0 0 0 rgba(139, 92, 246, 0)' 
  },
  visible: {
    boxShadow: [
      '0 0 20px rgba(139, 92, 246, 0.3)',
      '0 0 40px rgba(139, 92, 246, 0.5)',
      '0 0 20px rgba(139, 92, 246, 0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Float animation
export const float: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Blur in animation
export const blurIn: Variants = {
  hidden: { 
    opacity: 0,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

// Text reveal animation
export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    clipPath: 'inset(100% 0% 0% 0%)'
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { 
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeInOut' }
}

// Modal animations
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
}

export const modalContent: Variants = {
  hidden: { 
    scale: 0.95, 
    opacity: 0,
    y: 20
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
}

// Drawer animations
export const drawerSlide: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
}

// Tab animations
export const tabContent: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

// Card hover animations
export const cardHover = {
  rest: { 
    scale: 1,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

// Button animations
export const buttonTap = {
  tap: { scale: 0.95 },
  transition: { duration: 0.1 }
}

// Loading animations
export const loadingDots: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.1,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      duration: 0.6
    }
  })
}

// Skeleton loading
export const skeleton: Variants = {
  hidden: { opacity: 0.5 },
  visible: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Path drawing animation
export const pathDraw = {
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: 'easeInOut' },
      opacity: { duration: 0.5 }
    }
  }
}

// Typing animation
export const typing: Variants = {
  hidden: { width: 0 },
  visible: {
    width: '100%',
    transition: {
      duration: 2,
      ease: 'steps(20, end)'
    }
  }
}

// Parallax effect
export const parallax = (offset: number = 50) => ({
  hidden: {
    y: -offset,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  }
})

// 3D card flip
export const cardFlip: Variants = {
  hidden: { rotateY: 180 },
  visible: { 
    rotateY: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

// Notification slide
export const notificationSlide: Variants = {
  hidden: { x: 400, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  },
  exit: { 
    x: 400, 
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

// Accordion animations
export const accordionContent: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: 'auto', 
    opacity: 1,
    transition: { 
      height: { duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.2, delay: 0.1 }
    }
  }
}

// Spotlight effect
export const spotlight = {
  hidden: { 
    backgroundPosition: '200% 200%',
    backgroundSize: '0% 0%'
  },
  visible: { 
    backgroundPosition: '0% 0%',
    backgroundSize: '200% 200%',
    transition: { duration: 1, ease: 'easeOut' }
  }
}

// Wave animation
export const wave: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: [0, 14, -8, 14, -4, 10, 0],
    transition: {
      duration: 2.5,
      ease: 'easeInOut',
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 1
    }
  }
}

// Export animation presets
export const animationPresets = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleUp,
  slideInLeft,
  slideInRight,
  slideInTop,
  slideInBottom,
  staggerContainer,
  staggerItem,
  rotateIn,
  flipIn,
  bounce,
  pulse,
  shake,
  glow,
  float,
  blurIn,
  textReveal,
  pageTransition,
  modalOverlay,
  modalContent,
  drawerSlide,
  tabContent,
  cardHover,
  buttonTap,
  loadingDots,
  skeleton,
  pathDraw,
  typing,
  parallax,
  cardFlip,
  notificationSlide,
  accordionContent,
  spotlight,
  wave
}

// Animation hooks helpers
export const useScrollAnimation = (threshold = 0.1) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: threshold }
})

export const useHoverAnimation = () => ({
  initial: 'rest',
  whileHover: 'hover',
  whileTap: 'tap'
})

export const useDelayedAnimation = (delay: number) => ({
  initial: 'hidden',
  animate: 'visible',
  transition: { delay }
})

// Export default for easy importing
export default animationPresets