'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Heart,
  Globe,
  Zap,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Code,
  Palette,
  ShoppingBag,
  FileText,
  Play,
  ChevronRight,
  Check
} from 'lucide-react'
import { SimpleButton } from '@/components/ui'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  author: string
  authorAvatar?: string
  downloads: number
  views: number
  likes: number
  rating: number
  price: number | 'free'
  tags: string[]
  features: string[]
  demoUrl?: string
  createdAt: Date
  updatedAt: Date
  isPremium: boolean
  isNew: boolean
  isTrending: boolean
}


function SimpleBadge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'new' | 'trending' | 'premium' }) {
  const variantClasses = 
    variant === 'new' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    variant === 'trending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
    variant === 'premium' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
    'bg-blue-500/20 text-blue-400 border-blue-500/30'
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variantClasses}`}>
      {children}
    </span>
  )
}

function TemplateCard({ template, onUse }: { template: Template; onUse: (templateId: string) => void }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="group relative rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-blue-600/20 to-purple-600/20 overflow-hidden">
        {template.thumbnail ? (
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-16 h-16 text-white/20" />
          </div>
        )}
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center space-x-3">
            <SimpleButton size="sm" onClick={() => onUse(template.id)}>
              <Zap className="w-4 h-4 mr-2" />
              Use Template
            </SimpleButton>
            {template.demoUrl && (
              <SimpleButton variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </SimpleButton>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {template.isNew && <SimpleBadge variant="new">New</SimpleBadge>}
          {template.isTrending && <SimpleBadge variant="trending">Trending</SimpleBadge>}
          {template.isPremium && <SimpleBadge variant="premium">Premium</SimpleBadge>}
        </div>

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-white/60 mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center space-x-2 mt-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xs text-white">
            {template.author.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-white/60">by {template.author}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-white/60 mb-3">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>{template.downloads.toLocaleString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{template.views.toLocaleString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span>{template.rating.toFixed(1)}</span>
            </span>
          </div>
          <div className="font-semibold text-white">
            {template.price === 'free' ? 'Free' : `$${template.price}`}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-white/40">
              +{template.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [priceFilter, setPriceFilter] = useState('all')

  const categories = [
    { id: 'all', name: 'All Templates', icon: <Globe className="w-4 h-4" /> },
    { id: 'landing', name: 'Landing Pages', icon: <FileText className="w-4 h-4" /> },
    { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'saas', name: 'SaaS', icon: <Zap className="w-4 h-4" /> },
    { id: 'portfolio', name: 'Portfolio', icon: <Users className="w-4 h-4" /> },
    { id: 'blog', name: 'Blog', icon: <FileText className="w-4 h-4" /> },
    { id: 'dashboard', name: 'Dashboard', icon: <Code className="w-4 h-4" /> },
    { id: 'healthcare', name: 'Healthcare', icon: <Heart className="w-4 h-4" /> }
  ]

  const templates: Template[] = [
    {
      id: '1',
      name: 'SaaS Landing Pro',
      description: 'Modern SaaS landing page with pricing, features, and testimonials',
      category: 'saas',
      thumbnail: '',
      author: 'WebClone Team',
      downloads: 12453,
      views: 45632,
      likes: 892,
      rating: 4.8,
      price: 'free',
      tags: ['saas', 'landing', 'modern', 'responsive'],
      features: ['Hero Section', 'Pricing Tables', 'Feature Grid', 'Testimonials'],
      demoUrl: 'https://demo.webclonepro.com/saas',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-20'),
      isPremium: false,
      isNew: false,
      isTrending: true
    },
    {
      id: '2',
      name: 'Healthcare Portal',
      description: 'HIPAA-compliant healthcare patient portal with appointment booking',
      category: 'healthcare',
      thumbnail: '',
      author: 'MedTech Pro',
      downloads: 3421,
      views: 15234,
      likes: 445,
      rating: 4.9,
      price: 49,
      tags: ['healthcare', 'medical', 'HIPAA', 'portal'],
      features: ['Patient Dashboard', 'Appointment System', 'Medical Records', 'Secure Messaging'],
      demoUrl: 'https://demo.webclonepro.com/healthcare',
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-12-22'),
      isPremium: true,
      isNew: true,
      isTrending: false
    },
    {
      id: '3',
      name: 'E-commerce Ultimate',
      description: 'Complete e-commerce solution with cart, checkout, and admin panel',
      category: 'ecommerce',
      thumbnail: '',
      author: 'ShopMaster',
      downloads: 8976,
      views: 32145,
      likes: 723,
      rating: 4.7,
      price: 29,
      tags: ['ecommerce', 'shop', 'cart', 'checkout'],
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'Admin Dashboard'],
      demoUrl: 'https://demo.webclonepro.com/ecommerce',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-12-15'),
      isPremium: true,
      isNew: false,
      isTrending: true
    },
    {
      id: '4',
      name: 'Creative Portfolio',
      description: 'Stunning portfolio for designers, photographers, and artists',
      category: 'portfolio',
      thumbnail: '',
      author: 'DesignHub',
      downloads: 6543,
      views: 28976,
      likes: 612,
      rating: 4.6,
      price: 'free',
      tags: ['portfolio', 'creative', 'gallery', 'minimal'],
      features: ['Gallery Grid', 'Project Showcase', 'About Section', 'Contact Form'],
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-12-10'),
      isPremium: false,
      isNew: false,
      isTrending: false
    },
    {
      id: '5',
      name: 'Dashboard Pro',
      description: 'Advanced analytics dashboard with charts and real-time data',
      category: 'dashboard',
      thumbnail: '',
      author: 'DataViz',
      downloads: 4321,
      views: 19876,
      likes: 389,
      rating: 4.8,
      price: 39,
      tags: ['dashboard', 'analytics', 'charts', 'admin'],
      features: ['Real-time Charts', 'Data Tables', 'User Management', 'Reports'],
      createdAt: new Date('2024-10-20'),
      updatedAt: new Date('2024-12-18'),
      isPremium: true,
      isNew: true,
      isTrending: false
    },
    {
      id: '6',
      name: 'Blog Master',
      description: 'Clean and modern blog template with multiple layouts',
      category: 'blog',
      thumbnail: '',
      author: 'ContentPro',
      downloads: 7890,
      views: 31234,
      likes: 567,
      rating: 4.5,
      price: 'free',
      tags: ['blog', 'content', 'writing', 'minimal'],
      features: ['Article Layouts', 'Category Pages', 'Author Profiles', 'Comments'],
      createdAt: new Date('2024-04-15'),
      updatedAt: new Date('2024-11-30'),
      isPremium: false,
      isNew: false,
      isTrending: true
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'free' && template.price === 'free') ||
                        (priceFilter === 'paid' && template.price !== 'free')
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.downloads - a.downloads
      case 'newest': return b.createdAt.getTime() - a.createdAt.getTime()
      case 'rating': return b.rating - a.rating
      default: return 0
    }
  })

  const handleUseTemplate = (templateId: string) => {
    // Navigate to project creation with template
    console.log('Using template:', templateId)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Template Marketplace</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Start your project with professionally designed templates. Clone, customize, and deploy in minutes.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-blue-500 w-full lg:w-64"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:border-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
            </select>
            
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Only</option>
              <option value="paid">Premium Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm text-white/60">
            <span>{sortedTemplates.length} templates found</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="lg:w-64">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-2 border-blue-500'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className={selectedCategory === category.id ? 'text-blue-400' : 'text-white/60'}>
                    {category.icon}
                  </span>
                  <span className={selectedCategory === category.id ? 'text-white' : 'text-white/80'}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Featured Section */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-white/10">
              <h4 className="font-semibold text-white mb-2">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Premium Templates
              </h4>
              <p className="text-sm text-white/60 mb-3">
                Get access to exclusive premium templates with advanced features
              </p>
              <SimpleButton size="sm" className="w-full">
                Upgrade to Pro
              </SimpleButton>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>

            {sortedTemplates.length === 0 && (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
                <p className="text-white/60">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}