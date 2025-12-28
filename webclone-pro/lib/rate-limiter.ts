/**
 * Rate Limiting System
 * 
 * Implements sliding window rate limiting with in-memory storage
 * In production, this should be replaced with Redis for distributed systems
 */

import { NextRequest } from 'next/server'
import { logSecureError } from './secure-logger'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

interface WindowData {
  requests: number[]
  totalRequests: number
}

// In-memory storage (replace with Redis in production)
const store = new Map<string, WindowData>()

// Cleanup interval to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  const cutoff = now - (24 * 60 * 60 * 1000) // 24 hours ago
  
  for (const [key, data] of store.entries()) {
    // Remove old requests
    data.requests = data.requests.filter(timestamp => timestamp > cutoff)
    data.totalRequests = data.requests.length
    
    // Remove empty entries
    if (data.requests.length === 0) {
      store.delete(key)
    } else {
      store.set(key, data)
    }
  }
}, 5 * 60 * 1000) // Clean every 5 minutes

/**
 * Default key generator based on IP and User-Agent
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.slice(0, 50)}`
}

/**
 * Sliding window rate limiter
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    message = 'Too many requests, please try again later.'
  } = config

  return {
    check: (request: NextRequest): { allowed: boolean; info: RateLimitInfo } => {
      const key = keyGenerator(request)
      const now = Date.now()
      const windowStart = now - windowMs
      
      // Get or create window data
      let windowData = store.get(key) || { requests: [], totalRequests: 0 }
      
      // Remove requests outside the current window
      windowData.requests = windowData.requests.filter(timestamp => timestamp > windowStart)
      windowData.totalRequests = windowData.requests.length
      
      // Calculate remaining requests
      const remaining = Math.max(0, maxRequests - windowData.totalRequests)
      const reset = windowStart + windowMs
      
      const info: RateLimitInfo = {
        limit: maxRequests,
        remaining,
        reset
      }
      
      if (windowData.totalRequests >= maxRequests) {
        // Calculate retry after (when the oldest request expires)
        const oldestRequest = Math.min(...windowData.requests)
        info.retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000)
        
        // Log rate limit hit
        logSecureError(
          new Error('Rate limit exceeded'),
          {
            endpoint: new URL(request.url).pathname,
            userAgent: request.headers.get('user-agent') || undefined,
            ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || undefined
          },
          {
            rateLimitKey: key,
            requestsInWindow: windowData.totalRequests,
            windowMs,
            maxRequests
          }
        )
        
        return { allowed: false, info }
      }
      
      // Add current request to the window
      windowData.requests.push(now)
      windowData.totalRequests++
      store.set(key, windowData)
      
      return { allowed: true, info }
    }
  }
}

/**
 * Predefined rate limiters for different use cases
 */

// General API endpoints (100 requests per minute)
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many API requests, please slow down.'
})

// Authentication endpoints (5 attempts per 15 minutes)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again in 15 minutes.'
})

// File upload endpoints (10 uploads per hour)
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Upload limit exceeded, please try again in an hour.'
})

// Heavy operations like cloning (5 requests per 10 minutes)
export const heavyOperationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5,
  message: 'Rate limit for intensive operations exceeded. Please wait before trying again.'
})

// Webhook endpoints (1000 requests per minute, more lenient)
export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000,
  keyGenerator: (request) => {
    // Rate limit by webhook source
    const signature = request.headers.get('stripe-signature') || 
                     request.headers.get('webhook-signature') ||
                     request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    return `webhook:${signature.slice(0, 20)}`
  },
  message: 'Webhook rate limit exceeded.'
})

// Search endpoints (30 requests per minute)
export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Search rate limit exceeded, please slow down.'
})

/**
 * Rate limit middleware factory
 */
export function withRateLimit(
  rateLimiter: ReturnType<typeof createRateLimiter>,
  options: {
    onExceeded?: (request: NextRequest, info: RateLimitInfo) => Response
    headers?: boolean
  } = {}
) {
  const { onExceeded, headers = true } = options

  return {
    check: (request: NextRequest): { response?: Response; info: RateLimitInfo } => {
      const { allowed, info } = rateLimiter.check(request)
      
      if (!allowed) {
        const response = onExceeded 
          ? onExceeded(request, info)
          : new Response(
              JSON.stringify({
                error: 'Rate limit exceeded',
                retryAfter: info.retryAfter
              }),
              {
                status: 429,
                headers: {
                  'Content-Type': 'application/json',
                  ...(headers && {
                    'X-RateLimit-Limit': info.limit.toString(),
                    'X-RateLimit-Remaining': info.remaining.toString(),
                    'X-RateLimit-Reset': info.reset.toString(),
                    'Retry-After': (info.retryAfter || 60).toString()
                  })
                }
              }
            )
        
        return { response, info }
      }
      
      return { info }
    },
    
    addHeaders: (response: Response, info: RateLimitInfo): Response => {
      if (!headers) return response
      
      response.headers.set('X-RateLimit-Limit', info.limit.toString())
      response.headers.set('X-RateLimit-Remaining', info.remaining.toString())
      response.headers.set('X-RateLimit-Reset', info.reset.toString())
      
      return response
    }
  }
}

/**
 * DoS protection middleware
 * Implements additional protection against denial-of-service attacks
 */
export class DoSProtection {
  private suspiciousIPs = new Map<string, { count: number; lastSeen: number }>()
  private blockedIPs = new Set<string>()
  
  // Cleanup suspicious IPs every hour
  constructor() {
    setInterval(() => {
      const now = Date.now()
      const hourAgo = now - (60 * 60 * 1000)
      
      for (const [ip, data] of this.suspiciousIPs.entries()) {
        if (data.lastSeen < hourAgo) {
          this.suspiciousIPs.delete(ip)
        }
      }
    }, 60 * 60 * 1000)
  }
  
  checkRequest(request: NextRequest): { blocked: boolean; reason?: string } {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const contentLength = parseInt(request.headers.get('content-length') || '0')
    
    // Check if IP is already blocked
    if (this.blockedIPs.has(ip)) {
      return { blocked: true, reason: 'IP temporarily blocked' }
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      // Empty or suspicious user agents
      !userAgent || userAgent.length < 10,
      // Extremely large request bodies (potential DDoS)
      contentLength > 100 * 1024 * 1024, // 100MB
      // Known bot patterns
      /bot|crawler|spider|scraper/i.test(userAgent) && !/googlebot|bingbot/i.test(userAgent),
      // Suspicious user agents
      /curl|wget|python|go-http|java/i.test(userAgent)
    ]
    
    if (suspiciousPatterns.some(Boolean)) {
      const suspicious = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: 0 }
      suspicious.count++
      suspicious.lastSeen = Date.now()
      this.suspiciousIPs.set(ip, suspicious)
      
      // Block IP after 10 suspicious requests
      if (suspicious.count >= 10) {
        this.blockedIPs.add(ip)
        // Auto-unblock after 24 hours
        setTimeout(() => this.blockedIPs.delete(ip), 24 * 60 * 60 * 1000)
        
        logSecureError(
          new Error('IP blocked for suspicious activity'),
          {
            ip,
            userAgent,
            endpoint: new URL(request.url).pathname
          },
          {
            suspiciousCount: suspicious.count,
            blockDuration: '24 hours'
          }
        )
        
        return { blocked: true, reason: 'Suspicious activity detected' }
      }
    }
    
    return { blocked: false }
  }
}

export const dosProtection = new DoSProtection()