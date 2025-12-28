'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Github, 
  Chrome,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Zap,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FadeIn, 
  FadeInUp, 
  ScaleIn, 
  BlurIn, 
  TextReveal, 
  Glow,
  Float,
  StaggerContainer,
  StaggerItem,
  LoadingDots
} from '@/components/animations/motion-components'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate auth delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success message briefly
      if (mode === 'signup') {
        setSuccess('Account created successfully!')
        await new Promise(resolve => setTimeout(resolve, 800))
      } else {
        setSuccess('Welcome back!')
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      
      // For demo, just redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Simulate social auth
      setSuccess(`Connecting to ${provider === 'github' ? 'GitHub' : 'Google'}...`)
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/dashboard')
    } catch (err) {
      setError('Social authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center">
        <LoadingDots className="text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-10" />
        
        {/* Floating Elements */}
        <Float duration={8}>
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
        </Float>
        <Float duration={12} className="delay-1000">
          <div className="absolute bottom-1/3 right-1/6 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        </Float>
        <Float duration={10} className="delay-2000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />
        </Float>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      {/* Main Auth Container */}
      <FadeInUp className="relative w-full max-w-md z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <ScaleIn delay={0.2}>
            <Link href="/" className="inline-flex items-center justify-center mb-6 group">
              <Glow color="rgba(139, 92, 246, 0.4)" className="rounded-xl">
                <div className="w-14 h-14 rounded-xl gradient-brand flex items-center justify-center transition-transform group-hover:scale-110">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </Glow>
            </Link>
          </ScaleIn>
          
          <TextReveal delay={0.3}>
            <h1 className="text-display text-gradient-purple mb-3">
              {mode === 'signin' ? 'Welcome Back' : 'Join WebClone Pro'}
            </h1>
          </TextReveal>
          
          <FadeIn delay={0.4}>
            <p className="text-muted-foreground text-lg">
              {mode === 'signin' 
                ? 'Sign in to continue building amazing websites' 
                : 'Start creating professional websites in minutes'}
            </p>
          </FadeIn>
        </div>

        {/* Auth Form */}
        <BlurIn delay={0.5}>
          <div className="glass-card rounded-3xl p-8 card-shadow-hover border-gradient">
            {/* Social Auth Buttons */}
            <StaggerContainer className="space-y-3 mb-6">
              <StaggerItem>
                <motion.button
                  onClick={() => handleSocialAuth('github')}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-6 bg-card/50 hover:bg-card/80 border border-border/50 hover:border-primary/30 rounded-xl text-foreground font-medium transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Github className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  Continue with GitHub
                </motion.button>
              </StaggerItem>
              
              <StaggerItem>
                <motion.button
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-6 bg-card/50 hover:bg-card/80 border border-border/50 hover:border-primary/30 rounded-xl text-foreground font-medium transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chrome className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  Continue with Google
                </motion.button>
              </StaggerItem>
            </StaggerContainer>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full divider"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-card text-muted-foreground font-medium">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-foreground/90 mb-3">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required={mode === 'signup'}
                        className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border/50 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-semibold text-foreground/90 mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border/50 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground/90 mb-3">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={8}
                    className="w-full pl-12 pr-12 py-4 bg-background/50 border border-border/50 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>

              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-3 h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20" 
                    />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <Link 
                    href="/auth/reset" 
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-destructive font-medium">{error}</span>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start"
                  >
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full py-4 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center glow-sm hover:glow-md group relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingDots className="text-white mr-3" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Account' : 'Create Free Account'}</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
              </motion.button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <span className="text-muted-foreground">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <motion.button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                  setError('')
                  setSuccess('')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {mode === 'signin' ? 'Sign up for free' : 'Sign in instead'}
              </motion.button>
            </div>
          </div>
        </BlurIn>

        {/* Features Banner */}
        <FadeInUp delay={0.6} className="mt-8">
          <div className="glass-card rounded-2xl p-6 border-gradient overflow-hidden relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-purple opacity-5" />
            
            <div className="relative">
              <div className="flex items-center justify-center mb-4">
                <Glow color="rgba(236, 72, 153, 0.3)">
                  <Sparkles className="w-6 h-6 text-primary mr-3" />
                </Glow>
                <span className="text-base font-bold text-gradient-purple">
                  {mode === 'signup' ? 'Free Trial - No Credit Card Required' : 'Welcome to WebClone Pro'}
                </span>
              </div>
              
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <StaggerItem className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-foreground/80">Unlimited website clones</span>
                </StaggerItem>
                
                <StaggerItem className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <Zap className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-foreground/80">AI-powered generation</span>
                </StaggerItem>
                
                <StaggerItem className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-foreground/80">Enterprise-grade security</span>
                </StaggerItem>
                
                <StaggerItem className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <span className="text-foreground/80">Premium support</span>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </FadeInUp>
        
        {/* Footer */}
        <FadeIn delay={0.8} className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </FadeIn>
      </FadeInUp>
    </div>
  )
}