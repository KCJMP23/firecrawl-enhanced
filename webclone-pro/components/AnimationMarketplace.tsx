'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  TrendingUp,
  Star,
  Download,
  Upload,
  Filter,
  Search,
  Heart,
  ShoppingCart,
  Eye,
  Code2,
  Zap,
  Trophy,
  Users,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCw,
  Copy,
  Share2,
  MessageSquare,
  ThumbsUp,
  Award,
  Gem,
  Flame,
  ChevronRight,
  Grid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpRight,
  Wallet,
  CreditCard,
  TrendingDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExtractedAnimation, AnimationLibrary } from '@/lib/animation-extractor'

// Animation marketplace item
export interface MarketplaceAnimation {
  id: string
  name: string
  description: string
  category: AnimationCategory
  library: AnimationLibrary
  price: number
  creator: Creator
  stats: AnimationStats
  files: AnimationFiles
  preview: AnimationPreview
  tags: string[]
  license: LicenseType
  featured: boolean
  trending: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Creator {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  verified: boolean
  level: CreatorLevel
  earnings: number
  sales: number
  rating: number
  followers: number
  animations: number
}

export type CreatorLevel = 'beginner' | 'intermediate' | 'expert' | 'master' | 'legendary'

export interface AnimationStats {
  downloads: number
  views: number
  likes: number
  rating: number
  reviews: number
  revenue: number
  usedIn: number // Number of projects using this
}

export interface AnimationFiles {
  source: string // Original animation code
  variants: AnimationVariant[]
  documentation: string
  demo: string
}

export interface AnimationVariant {
  library: AnimationLibrary
  code: string
  size: number
  compatibility: number
}

export interface AnimationPreview {
  type: 'video' | 'live' | 'gif'
  url?: string
  component?: React.ComponentType
  duration: number
}

export type AnimationCategory = 
  | 'hero' 
  | 'loading' 
  | 'hover' 
  | 'scroll' 
  | 'transition' 
  | 'reveal' 
  | 'morph' 
  | '3d' 
  | 'particle' 
  | 'text' 
  | 'button' 
  | 'menu' 
  | 'card' 
  | 'form' 
  | 'chart'

export type LicenseType = 'free' | 'personal' | 'commercial' | 'extended'

// Community features
export interface AnimationCollection {
  id: string
  name: string
  description: string
  creator: Creator
  animations: MarketplaceAnimation[]
  followers: number
  public: boolean
  tags: string[]
}

export interface AnimationChallenge {
  id: string
  title: string
  description: string
  theme: string
  startDate: Date
  endDate: Date
  prizes: Prize[]
  submissions: ChallengeSubmission[]
  judges: Creator[]
  rules: string[]
  status: 'upcoming' | 'active' | 'judging' | 'completed'
}

export interface Prize {
  rank: number
  reward: string
  value: number
}

export interface ChallengeSubmission {
  id: string
  animation: MarketplaceAnimation
  creator: Creator
  votes: number
  rank?: number
  winner: boolean
}

export interface AnimationReview {
  id: string
  animation: MarketplaceAnimation
  reviewer: Creator
  rating: number
  title: string
  comment: string
  helpful: number
  createdAt: Date
}

interface AnimationMarketplaceProps {
  userCredits?: number
  userLevel?: CreatorLevel
  onPurchase?: (animation: MarketplaceAnimation) => void
  onUpload?: () => void
}

export default function AnimationMarketplace({
  userCredits = 100,
  userLevel = 'intermediate',
  onPurchase,
  onUpload
}: AnimationMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<AnimationCategory | 'all'>('all')
  const [selectedLibrary, setSelectedLibrary] = useState<AnimationLibrary | 'all'>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'price-low' | 'price-high' | 'rating'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAnimation, setSelectedAnimation] = useState<MarketplaceAnimation | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [cart, setCart] = useState<MarketplaceAnimation[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'marketplace' | 'collections' | 'challenges' | 'creators'>('marketplace')

  // Sample marketplace data
  const [animations] = useState<MarketplaceAnimation[]>([
    {
      id: '1',
      name: 'Quantum Morph Hero',
      description: 'Stunning morphing animation with particle effects for hero sections',
      category: 'hero',
      library: 'gsap',
      price: 29,
      creator: {
        id: 'creator1',
        username: 'animaster',
        displayName: 'Animation Master',
        avatar: '👨‍🎨',
        bio: 'Creating stunning animations since 2020',
        verified: true,
        level: 'master',
        earnings: 50000,
        sales: 1500,
        rating: 4.9,
        followers: 5000,
        animations: 127
      },
      stats: {
        downloads: 2547,
        views: 15420,
        likes: 892,
        rating: 4.8,
        reviews: 156,
        revenue: 73863,
        usedIn: 892
      },
      files: {
        source: '// GSAP animation code...',
        variants: [
          { library: 'gsap', code: '...', size: 12500, compatibility: 100 },
          { library: 'framer-motion', code: '...', size: 15200, compatibility: 95 },
          { library: 'css', code: '...', size: 8900, compatibility: 80 }
        ],
        documentation: 'https://docs.example.com',
        demo: 'https://demo.example.com'
      },
      preview: {
        type: 'live',
        duration: 3000
      },
      tags: ['hero', 'morph', 'particles', 'premium'],
      license: 'commercial',
      featured: true,
      trending: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      name: 'Smooth Scroll Reveal',
      description: 'Elegant scroll-triggered reveal animations for any element',
      category: 'scroll',
      library: 'framer-motion',
      price: 15,
      creator: {
        id: 'creator2',
        username: 'motionpro',
        displayName: 'Motion Pro',
        avatar: '🎯',
        bio: 'Framer Motion specialist',
        verified: true,
        level: 'expert',
        earnings: 25000,
        sales: 800,
        rating: 4.7,
        followers: 2500,
        animations: 64
      },
      stats: {
        downloads: 1823,
        views: 9876,
        likes: 567,
        rating: 4.6,
        reviews: 89,
        revenue: 27345,
        usedIn: 567
      },
      files: {
        source: '// Framer Motion code...',
        variants: [],
        documentation: '',
        demo: ''
      },
      preview: {
        type: 'video',
        url: 'https://example.com/preview.mp4',
        duration: 2000
      },
      tags: ['scroll', 'reveal', 'smooth'],
      license: 'commercial',
      featured: false,
      trending: true,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-12-10')
    },
    {
      id: '3',
      name: 'Neon Button Pack',
      description: 'Collection of 20+ glowing neon button hover animations',
      category: 'button',
      library: 'css',
      price: 0,
      creator: {
        id: 'creator3',
        username: 'csswizard',
        displayName: 'CSS Wizard',
        avatar: '🧙‍♂️',
        bio: 'Pure CSS magic',
        verified: false,
        level: 'intermediate',
        earnings: 0,
        sales: 0,
        rating: 4.5,
        followers: 1000,
        animations: 32
      },
      stats: {
        downloads: 5432,
        views: 25678,
        likes: 1234,
        rating: 4.5,
        reviews: 234,
        revenue: 0,
        usedIn: 1234
      },
      files: {
        source: '/* CSS animations */',
        variants: [],
        documentation: '',
        demo: ''
      },
      preview: {
        type: 'live',
        duration: 1000
      },
      tags: ['button', 'neon', 'hover', 'free'],
      license: 'free',
      featured: true,
      trending: false,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-11-25')
    }
  ])

  const [collections] = useState<AnimationCollection[]>([
    {
      id: 'col1',
      name: 'Ultimate Hero Animations',
      description: 'Best hero section animations for modern websites',
      creator: animations[0]?.creator || { 
        id: 'default', 
        username: 'default', 
        displayName: 'Default Creator', 
        avatar: '', 
        bio: '', 
        verified: false, 
        level: 'beginner' as CreatorLevel, 
        earnings: 0, 
        sales: 0, 
        rating: 0, 
        followers: 0, 
        animations: 0 
      },
      animations: animations.length > 0 && animations[0] ? [animations[0]] : [],
      followers: 2500,
      public: true,
      tags: ['hero', 'premium', 'trending']
    }
  ])

  const [challenges] = useState<AnimationChallenge[]>([
    {
      id: 'challenge1',
      title: 'Winter Animation Challenge',
      description: 'Create the most magical winter-themed animation',
      theme: 'Winter Magic',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      prizes: [
        { rank: 1, reward: '$1000 + Pro License', value: 1500 },
        { rank: 2, reward: '$500 + Pro License', value: 800 },
        { rank: 3, reward: '$250 + Pro License', value: 450 }
      ],
      submissions: [],
      judges: animations[0]?.creator ? [animations[0].creator] : [],
      rules: ['Original work only', 'Max 10KB size', 'Any animation library'],
      status: 'active'
    }
  ])

  const categories: { value: AnimationCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🎨' },
    { value: 'hero', label: 'Hero', icon: '🚀' },
    { value: 'loading', label: 'Loading', icon: '⏳' },
    { value: 'hover', label: 'Hover', icon: '👆' },
    { value: 'scroll', label: 'Scroll', icon: '📜' },
    { value: 'transition', label: 'Transition', icon: '➡️' },
    { value: 'reveal', label: 'Reveal', icon: '👁️' },
    { value: 'morph', label: 'Morph', icon: '🔄' },
    { value: '3d', label: '3D', icon: '🎮' },
    { value: 'particle', label: 'Particle', icon: '✨' },
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'button', label: 'Button', icon: '🔘' },
    { value: 'menu', label: 'Menu', icon: '☰' },
    { value: 'card', label: 'Card', icon: '🃏' },
    { value: 'form', label: 'Form', icon: '📋' },
    { value: 'chart', label: 'Chart', icon: '📊' }
  ]

  const libraries: { value: AnimationLibrary | 'all'; label: string }[] = [
    { value: 'all', label: 'All Libraries' },
    { value: 'gsap', label: 'GSAP' },
    { value: 'framer-motion', label: 'Framer Motion' },
    { value: 'lottie', label: 'Lottie' },
    { value: 'css', label: 'CSS' },
    { value: 'three-js', label: 'Three.js' },
    { value: 'anime-js', label: 'Anime.js' },
    { value: 'motion-one', label: 'Motion One' }
  ]

  // Filter and sort animations
  const filteredAnimations = animations
    .filter(anim => {
      if (selectedCategory !== 'all' && anim.category !== selectedCategory) return false
      if (selectedLibrary !== 'all' && anim.library !== selectedLibrary) return false
      if (searchQuery && !anim.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !anim.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.stats.downloads - a.stats.downloads
        case 'new':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.stats.rating - a.stats.rating
        default:
          return 0
      }
    })

  const toggleFavorite = (animationId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(animationId)) {
      newFavorites.delete(animationId)
    } else {
      newFavorites.add(animationId)
    }
    setFavorites(newFavorites)
  }

  const addToCart = (animation: MarketplaceAnimation) => {
    if (!cart.find(item => item.id === animation.id)) {
      setCart([...cart, animation])
    }
  }

  const removeFromCart = (animationId: string) => {
    setCart(cart.filter(item => item.id !== animationId))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0)
  }

  const getCreatorBadge = (level: CreatorLevel) => {
    const badges = {
      beginner: { icon: '🌱', color: 'text-green-400' },
      intermediate: { icon: '⭐', color: 'text-blue-400' },
      expert: { icon: '💎', color: 'text-purple-400' },
      master: { icon: '👑', color: 'text-yellow-400' },
      legendary: { icon: '🔥', color: 'text-orange-400' }
    }
    return badges[level]
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Sparkles className="w-10 h-10 text-yellow-400 mr-3" />
              Animation Marketplace
            </h1>
            <p className="text-gray-400">
              Discover, share, and sell premium animations. Join the creative community.
            </p>
          </div>

          {/* User Stats */}
          <div className="flex items-center space-x-6">
            {/* Credits */}
            <div className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
              <Wallet className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white font-medium">{userCredits} Credits</span>
            </div>

            {/* Level */}
            <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 rounded-lg">
              <span className="text-2xl mr-2">{getCreatorBadge(userLevel).icon}</span>
              <span className="text-white font-medium capitalize">{userLevel}</span>
            </div>

            {/* Cart */}
            <button className="relative p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-white" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Upload */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Animation
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-white/10">
          {['marketplace', 'collections', 'challenges', 'creators'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-2 capitalize font-medium transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <>
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search animations..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="new">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-white/5 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-r-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
                {(selectedCategory !== 'all' || selectedLibrary !== 'all') && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500/30 rounded text-xs">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6">
                    {/* Categories */}
                    <div>
                      <h3 className="text-white font-medium mb-3">Category</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-3 py-2 rounded-lg border transition-all ${
                              selectedCategory === cat.value
                                ? 'bg-blue-500/20 border-blue-500 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            <span className="mr-2">{cat.icon}</span>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Libraries */}
                    <div>
                      <h3 className="text-white font-medium mb-3">Library</h3>
                      <div className="flex flex-wrap gap-2">
                        {libraries.map((lib) => (
                          <button
                            key={lib.value}
                            onClick={() => setSelectedLibrary(lib.value)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              selectedLibrary === lib.value
                                ? 'bg-purple-500/20 border-purple-500 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {lib.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(selectedCategory !== 'all' || selectedLibrary !== 'all') && (
                      <button
                        onClick={() => {
                          setSelectedCategory('all')
                          setSelectedLibrary('all')
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Animation Grid */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredAnimations.map((animation) => (
              <motion.div
                key={animation.id}
                whileHover={{ y: -4 }}
                className={`relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Featured/Trending Badges */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  {animation.featured && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-400 flex items-center">
                      <Trophy className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                  {animation.trending && (
                    <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full text-xs text-red-400 flex items-center">
                      <Flame className="w-3 h-3 mr-1" />
                      Trending
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(animation.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${
                    favorites.has(animation.id) ? 'text-red-500 fill-red-500' : 'text-white'
                  }`} />
                </button>

                {/* Preview */}
                <div className={`${viewMode === 'list' ? 'w-48' : 'h-48'} bg-gradient-to-br from-blue-600/10 to-purple-600/10 flex items-center justify-center`}>
                  {animation.preview.type === 'live' ? (
                    <div className="text-6xl animate-pulse">✨</div>
                  ) : (
                    <Play className="w-12 h-12 text-white/50" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  {/* Title and Price */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{animation.name}</h3>
                    <div className="text-right">
                      {animation.price === 0 ? (
                        <span className="text-green-400 font-bold">FREE</span>
                      ) : (
                        <span className="text-white font-bold">${animation.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {animation.description}
                  </p>

                  {/* Creator */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium mr-2">
                      {animation.creator.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm text-white">{animation.creator.displayName}</span>
                        {animation.creator.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-400 ml-1" />
                        )}
                        <span className="ml-2">{getCreatorBadge(animation.creator.level).icon}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {animation.stats.rating.toFixed(1)} ({animation.stats.reviews})
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {animation.stats.downloads.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {animation.stats.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {animation.stats.likes.toLocaleString()}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-400">
                      {animation.library}
                    </span>
                    {animation.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAnimation(animation)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                    {animation.price > 0 ? (
                      <button
                        onClick={() => addToCart(animation)}
                        disabled={cart.some(item => item.id === animation.id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                          cart.some(item => item.id === animation.id)
                            ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        }`}
                      >
                        {cart.some(item => item.id === animation.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    ) : (
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{collection.name}</h3>
                  <p className="text-gray-400 text-sm">{collection.description}</p>
                </div>
                {collection.public && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                    Public
                  </span>
                )}
              </div>

              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium mr-2">
                  {collection.creator.avatar}
                </div>
                <span className="text-sm text-white">{collection.creator.displayName}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{collection.animations.length} animations</span>
                <span>{collection.followers.toLocaleString()} followers</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {collection.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors">
                View Collection
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                    <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
                  </div>
                  <p className="text-gray-400">{challenge.description}</p>
                  <p className="text-purple-400 font-medium mt-2">Theme: {challenge.theme}</p>
                </div>

                <div className={`px-4 py-2 rounded-lg font-medium ${
                  challenge.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {challenge.status === 'active' ? 'Active Now' : challenge.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {challenge.prizes.map((prize) => (
                  <div key={prize.rank} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : '🥉'}
                      </span>
                      <span className="text-white font-bold">${prize.value}</span>
                    </div>
                    <p className="text-sm text-gray-400">{prize.reward}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Ends {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {challenge.submissions.length} submissions
                  </span>
                </div>

                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
                  Enter Challenge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creators Tab */}
      {activeTab === 'creators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from(new Set(animations.map(a => a.creator.id))).map((creatorId) => {
            const creator = animations.find(a => a.creator.id === creatorId)!.creator
            const badge = getCreatorBadge(creator.level)
            
            return (
              <div key={creator.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl mr-4">
                    {creator.avatar}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-white">{creator.displayName}</h3>
                      {creator.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-400 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm ${badge.color}`}>
                        {badge.icon} {creator.level}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{creator.bio}</p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{creator.animations}</p>
                    <p className="text-gray-400">Animations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{creator.sales.toLocaleString()}</p>
                    <p className="text-gray-400">Sales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{creator.followers.toLocaleString()}</p>
                    <p className="text-gray-400">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      {creator.rating.toFixed(1)}
                    </p>
                    <p className="text-gray-400">Rating</p>
                  </div>
                </div>

                <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors">
                  View Profile
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed right-6 bottom-6 w-96 bg-gray-900 border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cart.length})
              </h3>
              <button
                onClick={() => setCart([])}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{item.name}</p>
                    <p className="text-gray-400 text-xs">{item.library}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white font-bold mr-3">${item.price}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Total:</span>
                <span className="text-2xl font-bold text-white">${getTotalPrice()}</span>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Checkout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}