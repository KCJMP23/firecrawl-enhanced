import { NextRequest, NextResponse } from 'next/server'
import { getCacheHealth, projectCache, analyticsCache, templateCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const key = searchParams.get('key')
    const cacheType = searchParams.get('type') || 'projects'

    // Get cache manager based on type
    const getCacheManager = (type: string) => {
      switch (type) {
        case 'analytics': return analyticsCache
        case 'templates': return templateCache
        default: return projectCache
      }
    }

    switch (action) {
      case 'health':
        const health = await getCacheHealth()
        return NextResponse.json(health)

      case 'stats':
        const allStats = {
          projects: projectCache.getStats(),
          analytics: analyticsCache.getStats(),
          templates: templateCache.getStats()
        }
        return NextResponse.json(allStats)

      case 'get':
        if (!key) {
          return NextResponse.json(
            { error: 'Key parameter is required for get action' },
            { status: 400 }
          )
        }
        
        const cache = getCacheManager(cacheType)
        const value = await cache.get(key)
        
        return NextResponse.json({
          key,
          value,
          found: value !== null,
          cacheType
        })

      case 'exists':
        if (!key) {
          return NextResponse.json(
            { error: 'Key parameter is required for exists action' },
            { status: 400 }
          )
        }
        
        const cacheExists = getCacheManager(cacheType)
        const exists = await cacheExists.exists(key)
        
        return NextResponse.json({
          key,
          exists,
          cacheType
        })

      default:
        // Default: return cache overview
        const overview = {
          status: 'operational',
          caches: {
            projects: {
              stats: projectCache.getStats(),
              name: 'Project Cache'
            },
            analytics: {
              stats: analyticsCache.getStats(),
              name: 'Analytics Cache'
            },
            templates: {
              stats: templateCache.getStats(),
              name: 'Template Cache'
            }
          },
          timestamp: new Date().toISOString()
        }

        return NextResponse.json(overview, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        })
    }
  } catch (error) {
    console.error('Cache API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Cache operation failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, cacheType = 'projects', key, value, ttl } = body

    const getCacheManager = (type: string) => {
      switch (type) {
        case 'analytics': return analyticsCache
        case 'templates': return templateCache
        default: return projectCache
      }
    }

    const cache = getCacheManager(cacheType)

    switch (action) {
      case 'set':
        if (!key || value === undefined) {
          return NextResponse.json(
            { error: 'Key and value are required for set action' },
            { status: 400 }
          )
        }

        const success = await cache.set(key, value, ttl)
        return NextResponse.json({
          success,
          key,
          cacheType,
          ttl: ttl || 3600,
          timestamp: new Date().toISOString()
        })

      case 'delete':
        if (!key) {
          return NextResponse.json(
            { error: 'Key is required for delete action' },
            { status: 400 }
          )
        }

        const deleted = await cache.delete(key)
        return NextResponse.json({
          deleted,
          key,
          cacheType,
          timestamp: new Date().toISOString()
        })

      case 'clear':
        const cleared = await cache.clear()
        return NextResponse.json({
          cleared,
          cacheType,
          timestamp: new Date().toISOString()
        })

      case 'warm':
        // Cache warming logic
        if (cacheType === 'templates') {
          // Warm template cache with common data
          await templateCache.set('public:list', [
            { id: '1', name: 'E-commerce Store', category: 'business' },
            { id: '2', name: 'Portfolio', category: 'personal' },
            { id: '3', name: 'Blog', category: 'content' }
          ])
        }
        
        return NextResponse.json({
          warmed: true,
          cacheType,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: set, delete, clear, warm' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Cache POST error:', error)
    
    return NextResponse.json(
      { 
        error: 'Cache operation failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}