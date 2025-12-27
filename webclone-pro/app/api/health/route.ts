/**
 * Production Health Check Endpoint
 * Comprehensive monitoring for production deployment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCacheHealth } from '@/lib/cache'
import { logSecureError } from '@/lib/secure-logger'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  service: string
  version: string
  environment: string
  uptime: number
  memory: NodeJS.MemoryUsage
  checks: {
    database: HealthCheck
    cache: HealthCheck
    storage: HealthCheck
    rateLimit: HealthCheck
    filesystem: HealthCheck
  }
  metrics?: {
    responseTime: number
    requestsPerMinute?: number
    errorRate?: number
  }
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn'
  message: string
  responseTime?: number
  details?: any
}

// Track application metrics
const startTime = Date.now()
let requestCount = 0
let errorCount = 0

export async function GET(request: NextRequest) {
  requestCount++
  const checkStart = Date.now()
  
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WebClone Pro',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: { status: 'pass', message: 'Database healthy' },
      cache: { status: 'pass', message: 'Cache operational' },
      storage: { status: 'pass', message: 'Storage available' },
      rateLimit: { status: 'pass', message: 'Rate limiting active' },
      filesystem: { status: 'pass', message: 'Filesystem accessible' }
    }
  }

  try {
    // Database health check
    const dbStart = Date.now()
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('projects').select('count').limit(1)
      
      if (error && !error.message.includes('does not exist')) {
        throw error
      }
      
      health.checks.database.responseTime = Date.now() - dbStart
    } catch (dbError) {
      health.checks.database = {
        status: 'fail',
        message: 'Database connection failed',
        responseTime: Date.now() - dbStart,
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }
      health.status = 'unhealthy'
      errorCount++
    }

    // Cache health check
    const cacheStart = Date.now()
    try {
      const cacheHealth = await getCacheHealth()
      health.checks.cache = {
        status: cacheHealth.status === 'healthy' ? 'pass' : 
               cacheHealth.status === 'degraded' ? 'warn' : 'fail',
        message: `Cache ${cacheHealth.status}`,
        responseTime: Date.now() - cacheStart,
        details: cacheHealth.stats
      }
      
      if (cacheHealth.status === 'down') {
        health.status = 'degraded'
      }
    } catch (cacheError) {
      health.checks.cache = {
        status: 'warn',
        message: 'Cache degraded, using fallback',
        responseTime: Date.now() - cacheStart
      }
      health.status = 'degraded'
    }

    // Storage health check
    const storageStart = Date.now()
    try {
      const supabase = await createClient()
      const { error } = await supabase.storage.listBuckets()
      
      if (error) throw error
      
      health.checks.storage.responseTime = Date.now() - storageStart
    } catch (storageError) {
      health.checks.storage = {
        status: 'warn',
        message: 'Storage degraded',
        responseTime: Date.now() - storageStart
      }
      health.status = 'degraded'
    }

    // Rate limiting check (verify it's configured)
    if (process.env.RATE_LIMIT_ENABLED === 'true') {
      health.checks.rateLimit = {
        status: 'pass',
        message: 'Rate limiting enabled',
        details: {
          windowMs: process.env.RATE_LIMIT_WINDOW_MS,
          maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS
        }
      }
    } else if (process.env.NODE_ENV === 'production') {
      health.checks.rateLimit = {
        status: 'warn',
        message: 'Rate limiting disabled in production'
      }
      health.status = 'degraded'
    }

    // Filesystem check (temp directory writable)
    const fsStart = Date.now()
    try {
      const fs = await import('fs/promises')
      const os = await import('os')
      const path = await import('path')
      
      const testFile = path.join(os.tmpdir(), `health-${Date.now()}.tmp`)
      await fs.writeFile(testFile, 'test')
      await fs.unlink(testFile)
      
      health.checks.filesystem.responseTime = Date.now() - fsStart
    } catch (fsError) {
      health.checks.filesystem = {
        status: 'fail',
        message: 'Filesystem not writable',
        responseTime: Date.now() - fsStart
      }
      health.status = 'unhealthy'
      errorCount++
    }

    // Calculate metrics
    const runtime = Date.now() - startTime
    health.metrics = {
      responseTime: Date.now() - checkStart,
      requestsPerMinute: Math.round((requestCount / runtime) * 60000),
      errorRate: requestCount > 0 ? (errorCount / requestCount) * 100 : 0
    }

    // Determine final status
    const failedChecks = Object.values(health.checks).filter(c => c.status === 'fail').length
    const warnChecks = Object.values(health.checks).filter(c => c.status === 'warn').length
    
    if (failedChecks > 0) {
      health.status = 'unhealthy'
    } else if (warnChecks > 0) {
      health.status = 'degraded'
    }

    // Return with appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503

    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    errorCount++
    logSecureError(
      error as Error,
      { endpoint: '/api/health' },
      { context: 'Health check critical failure' }
    )

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'WebClone Pro',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      error: 'Health check failed',
      checks: health.checks
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}