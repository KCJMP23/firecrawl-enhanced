'use client'

import { useState, useEffect, useRef } from 'react'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Globe, 
  Brain, 
  Rocket, 
  Users, 
  TrendingUp, 
  Check,
  Code2,
  Palette,
  DollarSign,
  Clock,
  Shield,
  Infinity,
  Play,
  ChevronRight,
  Download,
  Star,
  Command,
  Layers,
  GitBranch,
  Cpu,
  Lightning,
  Crown,
  Diamond,
  Flame,
  Target,
  Award,
  Activity,
  BarChart3,
  CheckCircle,
  Package,
  Database,
  FileText,
  Video,
  Music,
  BookOpen,
  ArrowUpRight,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Menu,
  X,
  MousePointer2,
  Wand2,
  Boxes,
  Workflow,
  Bot,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Grid3x3,
  Columns3,
  PanelLeft,
  Copy,
  Share2,
  Heart,
  MessageSquare,
  Send,
  Search,
  Filter,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  PauseCircle,
  StopCircle,
  SkipForward,
  Volume2,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Watch,
  Headphones,
  Camera,
  Mic,
  Wifi,
  Bluetooth,
  Battery,
  BatteryCharging,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  Map,
  Navigation,
  MapPin,
  Flag,
  Home,
  Building,
  Building2,
  Store,
  ShoppingCart,
  ShoppingBag,
  Gift,
  CreditCard,
  Wallet,
  Receipt,
  Percent,
  Calculator,
  TrendingDown,
  PieChart,
  LineChart,
  AreaChart,
  Gauge,
  Signal,
  WifiOff,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Edit,
  Edit2,
  Edit3,
  Eraser,
  Trash,
  Trash2,
  Archive,
  Inbox,
  Send as SendIcon,
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Voicemail,
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  Bookmark,
  BookmarkPlus,
  BookmarkMinus,
  BookmarkCheck,
  BookmarkX,
  Tag,
  Tags,
  Hash,
  AtSign,
  Link,
  Link2,
  Unlink,
  Anchor,
  Paperclip,
  Eye as EyeIcon,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  RotateCw,
  RotateCcw,
  RefreshCcw,
  RefreshCw as RefreshIcon,
  Loader,
  Loader2,
  Server,
  Wifi as WifiIcon,
  HardDrive,
  Save,
  Upload,
  DownloadIcon,
  FolderOpen,
  Folder,
  FolderPlus,
  FolderMinus,
  FolderCheck,
  FolderX,
  File,
  FilePlus,
  FileMinus,
  FileCheck,
  FileX,
  FileCode,
  FileCode2,
  Terminal,
  TerminalSquare,
  Bug,
  BugOff,
  TestTube,
  TestTube2,
  Microscope,
  Telescope,
  Satellite,
  Radio,
  Podcast,
  Megaphone,
  Tv2,
  Projector,
  Presentation,
  Lightbulb,
  LightbulbOff,
  Lamp,
  Flashlight,
  FlashlightOff,
  Candle,
  Flame as FlameIcon,
  FireExtinguisher,
  Snowflake,
  Cloud,
  CloudOff,
  CloudDownload,
  CloudUpload,
  CloudCheck,
  CloudX,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  Rainbow,
  Umbrella,
  UmbrellaOff,
  Zap as ZapIcon,
  ZapOff,
  Sparkle,
  Stars,
  MoonStar,
  SunMoon,
  SunMedium,
  SunDim,
  Eclipse,
  Orbit,
  Atom,
  Binary,
  Braces,
  Brackets,
  Code,
  CodeSquare,
  FileJson,
  FileJson2,
  Variable,
  Function,
  Regex,
  Component,
  Box,
  Package2,
  PackageOpen,
  PackageCheck,
  PackageX,
  PackagePlus,
  PackageMinus,
  PackageSearch,
  Puzzle,
  Gamepad,
  Gamepad2,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Dices,
  Trophy,
  Medal,
  Award as AwardIcon,
  Crown as CrownIcon,
  Gem,
  Diamond as DiamondIcon,
  Coins,
  Banknote,
  PiggyBank,
  Vault,
  HandCoins,
  Landmark,
  Scale,
  Gavel,
  Briefcase,
  Briefcase2,
  Backpack,
  Luggage,
  Plane,
  Train,
  Car,
  Bus,
  Truck,
  Ship,
  Anchor as AnchorIcon,
  Sailboat,
  Bike,
  Mountain,
  Trees,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  Cherry,
  Grape,
  Apple,
  Carrot,
  Pizza,
  Coffee,
  Beer,
  Wine,
  Milk,
  IceCream,
  IceCream2,
  Cake,
  Cookie,
  Sandwich,
  Soup,
  Salad,
  Popcorn,
  Candy,
  Lollipop,
  Donut,
  Croissant,
  Baguette,
  Egg,
  EggFried,
  Bacon,
  Beef,
  Fish,
  Drumstick,
  Apple as AppleIcon,
  Banana,
  Cherry as CherryIcon,
  Citrus,
  Grape as GrapeIcon,
  Melon
} from 'lucide-react'

// Fallback component for Hero3D
const FallbackHero = () => (
  <div className="absolute inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
    <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div className="absolute top-40 right-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
  </div>
)

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => <FallbackHero />,
})

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const { scrollYProgress } = useScroll()
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -200])
  const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const features = [
    {
      icon: <Lightning className="w-6 h-6" />,
      title: "Lightning Fast Extraction",
      description: "Clone any website in under 10 seconds with perfect accuracy",
      gradient: "from-yellow-600 to-orange-600",
      stats: "10x faster"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Remixing",
      description: "Transform designs with GPT-4 Vision and Claude 3 Opus",
      gradient: "from-purple-600 to-pink-600",
      stats: "98% accuracy"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Animation Magic",
      description: "Capture GSAP, Framer Motion, Lottie animations flawlessly",
      gradient: "from-blue-600 to-cyan-600",
      stats: "100+ effects"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Multi-Framework Export",
      description: "Export to React, Vue, Angular, Svelte, and 20+ frameworks",
      gradient: "from-green-600 to-emerald-600",
      stats: "25 frameworks"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "SOC2 compliant, GDPR ready, end-to-end encryption",
      gradient: "from-red-600 to-rose-600",
      stats: "Bank-level"
    },
    {
      icon: <Infinity className="w-6 h-6" />,
      title: "Unlimited Everything",
      description: "No limits on clones, exports, or team members",
      gradient: "from-indigo-600 to-purple-600",
      stats: "∞ projects"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at TechStart",
      avatar: "SC",
      content: "WebClone Pro saved us 6 months of development time. The AI remixing is pure magic!",
      rating: 5,
      gradient: "from-purple-600 to-pink-600"
    },
    {
      name: "Marcus Johnson",
      role: "Lead Designer at Creative Co",
      avatar: "MJ",
      content: "Finally, a tool that understands animations! This is the future of web development.",
      rating: 5,
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      name: "Emily Rodriguez",
      role: "Founder of WebFlow Agency",
      avatar: "ER",
      content: "We've 10x'd our output. Every agency needs this tool yesterday!",
      rating: 5,
      gradient: "from-green-600 to-emerald-600"
    }
  ]

  const plans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for indie hackers',
      features: [
        '10 extractions/month',
        'Basic AI remixing',
        '5 framework exports',
        'Community support',
        '1 user',
        'Public projects only'
      ],
      popular: false,
      gradient: 'from-gray-600 to-gray-700'
    },
    {
      name: 'Professional',
      price: 99,
      description: 'For serious builders',
      features: [
        'Unlimited extractions',
        'Advanced AI with GPT-4',
        'All framework exports',
        'Animation extraction',
        'Priority support',
        '5 team members',
        'Private projects',
        'Chrome extension',
        'API access',
        'White-label exports'
      ],
      popular: true,
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      name: 'Enterprise',
      price: 499,
      description: 'For large teams',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Custom AI models',
        'Dedicated support',
        'SLA guarantee',
        'On-premise option',
        'Custom integrations',
        'Training & onboarding',
        'Legal compliance',
        'Custom contracts'
      ],
      popular: false,
      gradient: 'from-blue-600 to-cyan-600'
    },
  ]

  const stats = [
    { value: '2M+', label: 'Websites Cloned', icon: <Globe className="w-5 h-5" /> },
    { value: '150K+', label: 'Active Users', icon: <Users className="w-5 h-5" /> },
    { value: '99.99%', label: 'Uptime SLA', icon: <Activity className="w-5 h-5" /> },
    { value: '4.9/5', label: 'User Rating', icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Mouse follower gradient */}
      <div 
        className="pointer-events-none fixed w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl transition-all duration-1000 ease-out z-10"
        style={{
          left: `${mousePosition.x - 300}px`,
          top: `${mousePosition.y - 300}px`,
        }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/90 backdrop-blur-2xl border-b border-gray-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  WebClone Pro
                </span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-600/30">
                  v3.0
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</Link>
              <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Reviews</Link>
              
              <div className="flex items-center gap-3">
                <Link href="/auth">
                  <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-600/30 font-medium">
                    Start Free Trial
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-2xl border-b border-gray-800 lg:hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <Link href="#features" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="block text-gray-400 hover:text-white transition-colors">How it Works</Link>
              <Link href="#pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="#testimonials" className="block text-gray-400 hover:text-white transition-colors">Reviews</Link>
              <div className="pt-4 space-y-3 border-t border-gray-800">
                <Link href="/auth" className="block">
                  <button className="w-full px-4 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth" className="block">
                  <button className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-medium">
                    Start Free Trial
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <FallbackHero />
        
        <motion.div 
          style={{ y: parallaxY, scale: scaleProgress, opacity: opacityProgress }}
          className="relative z-20 text-center max-w-6xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-600/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">AI-Powered Web Extraction Platform</span>
            <span className="px-2 py-0.5 bg-purple-600/30 rounded-full text-xs text-purple-300">NEW</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            Clone Any Website
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-300">
              In 10 Seconds Flat
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Extract designs, animations, and components from any website. 
            <span className="text-white"> Remix with AI.</span>
            <span className="text-purple-400"> Export to any framework.</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/dashboard/new">
              <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl shadow-purple-600/30 font-semibold text-lg flex items-center gap-3">
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Start Cloning Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="group px-8 py-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700 text-white rounded-xl hover:bg-gray-700/50 transition-all font-semibold text-lg flex items-center gap-3">
              <CirclePlay className="w-5 h-5" />
              Watch Demo
              <span className="text-xs px-2 py-0.5 bg-green-600/30 rounded-full text-green-400 border border-green-600/30">2 min</span>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="p-4 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800">
                <div className="flex justify-center mb-2 text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-600/30 mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">Revolutionary Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Why We're Different
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              While others limit you with tokens and credits, we give you unlimited power to create
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-30 transition duration-300 blur-lg`}></div>
                <div className="relative p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-gray-700 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      {feature.icon}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-600/20 text-green-400 border border-green-600/30">
                      {feature.stats}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 relative bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-600/30 mb-6">
              <Workflow className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Simple 3-Step Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter URL',
                description: 'Paste any website URL or use our Chrome extension',
                icon: <Link2 className="w-8 h-8" />,
                gradient: 'from-purple-600 to-pink-600'
              },
              {
                step: '02',
                title: 'AI Extraction',
                description: 'Our AI analyzes and extracts everything in seconds',
                icon: <Brain className="w-8 h-8" />,
                gradient: 'from-blue-600 to-cyan-600'
              },
              {
                step: '03',
                title: 'Export & Ship',
                description: 'Export to your framework and deploy instantly',
                icon: <Rocket className="w-8 h-8" />,
                gradient: 'from-green-600 to-emerald-600'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="mb-6 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
                    <span className={`text-3xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                      {item.step}
                    </span>
                  </div>
                  <div className={`mb-6 mx-auto w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 text-gray-700">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full border border-yellow-600/30 mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">Loved by 150,000+ Developers</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Success Stories
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic">&ldquo;{testimonial.content}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 relative bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full border border-green-600/30 mb-6">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Simple, Transparent Pricing</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Start free, upgrade when you need more power. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'md:scale-110' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className={`relative h-full p-8 rounded-2xl border ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-purple-900/20 to-pink-900/20 border-purple-600/50' 
                    : 'bg-gray-900/50 border-gray-800'
                } backdrop-blur-xl`}>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>
                  
                  <Link href="/auth">
                    <button className={`w-full py-3 rounded-xl font-semibold transition-all mb-8 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                        : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                    }`}>
                      {plan.popular ? 'Start Free Trial' : 'Get Started'}
                    </button>
                  </Link>
                  
                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl border border-purple-600/30 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> 10x Your Dev Speed?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join 150,000+ developers who ship faster with WebClone Pro. 
                Start cloning in seconds, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/new">
                  <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl shadow-purple-600/30 font-semibold text-lg flex items-center gap-3">
                    <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Start Free Trial
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="px-8 py-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700 text-white rounded-xl hover:bg-gray-700/50 transition-all font-semibold text-lg">
                  Book a Demo
                </button>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  WebClone Pro
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                The future of web development. Clone, remix, ship faster than ever before.
              </p>
              <div className="flex gap-3">
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Github className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Twitter className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Youtube className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                <li><Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/tutorials" className="hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors flex items-center gap-2">
                  Careers 
                  <span className="px-2 py-0.5 bg-green-600/30 rounded-full text-xs text-green-400 border border-green-600/30">
                    Hiring
                  </span>
                </Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 WebClone Pro. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        .bg-300 {
          background-size: 300% 300%;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  )
}