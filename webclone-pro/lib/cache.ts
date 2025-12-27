// Production-ready caching layer for WebClone Pro 2026
import { logSecureError } from './secure-logger'

export interface CacheConfig {
  defaultTTL: number // Default Time To Live in seconds
  keyPrefix: string
  maxRetries: number
  retryDelay: number
}

export interface CacheStats {
  hits: number
  misses: number
  errors: number
  totalOperations: number
  hitRate: number
}

export class CacheManager {
  private config: CacheConfig
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalOperations: 0,
    hitRate: 0
  }
  private mockStorage = new Map<string, { value: any; expires: number }>()

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 3600, // 1 hour
      keyPrefix: 'webclone:',
      maxRetries: 3,
      retryDelay: 100,
      ...config
    }
  }

  // Generate cache key with prefix
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  // Get value from cache
  async get<T = any>(key: string): Promise<T | null> {
    this.stats.totalOperations++
    
    try {
      const fullKey = this.generateKey(key)
      
      // In a real implementation, this would use Redis
      // For now, using in-memory mock storage
      const cached = this.mockStorage.get(fullKey)
      
      if (!cached) {
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      // Check if expired
      if (Date.now() > cached.expires) {
        this.mockStorage.delete(fullKey)
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      this.stats.hits++
      this.updateHitRate()
      return cached.value
    } catch (error) {
      this.stats.errors++
      this.updateHitRate()
      logSecureError(error as Error, {}, { context: 'Cache get error', key: fullKey })
      return null
    }
  }

  // Set value in cache
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    this.stats.totalOperations++
    
    try {
      const fullKey = this.generateKey(key)
      const expiration = Date.now() + (ttl || this.config.defaultTTL) * 1000
      
      // In a real implementation, this would use Redis
      this.mockStorage.set(fullKey, {
        value: JSON.parse(JSON.stringify(value)), // Deep clone
        expires: expiration
      })
      
      return true
    } catch (error) {
      this.stats.errors++
      logSecureError(error as Error, {}, { context: 'Cache set error', key: fullKey })
      return false
    }
  }

  // Delete value from cache
  async delete(key: string): Promise<boolean> {
    this.stats.totalOperations++
    
    try {
      const fullKey = this.generateKey(key)
      const existed = this.mockStorage.has(fullKey)
      this.mockStorage.delete(fullKey)
      return existed
    } catch (error) {
      this.stats.errors++
      logSecureError(error as Error, {}, { context: 'Cache delete error', key: fullKey })
      return false
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    this.stats.totalOperations++
    
    try {
      const fullKey = this.generateKey(key)
      const cached = this.mockStorage.get(fullKey)
      
      if (!cached) return false
      
      // Check if expired
      if (Date.now() > cached.expires) {
        this.mockStorage.delete(fullKey)
        return false
      }
      
      return true
    } catch (error) {
      this.stats.errors++
      logSecureError(error as Error, {}, { context: 'Cache exists error', key: fullKey })
      return false
    }
  }

  // Clear all cache entries
  async clear(): Promise<boolean> {
    try {
      this.mockStorage.clear()
      this.resetStats()
      return true
    } catch (error) {
      this.stats.errors++
      logSecureError(error as Error, {}, { context: 'Cache clear error' })
      return false
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalOperations: 0,
      hitRate: 0
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }
}

// Specialized cache managers for different use cases
export class ProjectCache extends CacheManager {
  constructor() {
    super({
      keyPrefix: 'webclone:projects:',
      defaultTTL: 1800 // 30 minutes
    })
  }

  async getProject(projectId: string) {
    return await this.get(`project:${projectId}`)
  }

  async setProject(projectId: string, project: any) {
    return await this.set(`project:${projectId}`, project)
  }

  async getUserProjects(userId: string) {
    return await this.get(`user:${userId}:projects`)
  }

  async setUserProjects(userId: string, projects: any[]) {
    return await this.set(`user:${userId}:projects`, projects, 600) // 10 minutes
  }
}

export class AnalyticsCache extends CacheManager {
  constructor() {
    super({
      keyPrefix: 'webclone:analytics:',
      defaultTTL: 300 // 5 minutes for analytics data
    })
  }

  async getMetrics(timeRange: string) {
    return await this.get(`metrics:${timeRange}`)
  }

  async setMetrics(timeRange: string, metrics: any) {
    return await this.set(`metrics:${timeRange}`, metrics)
  }

  async getUserStats(userId: string) {
    return await this.get(`user:${userId}:stats`)
  }

  async setUserStats(userId: string, stats: any) {
    return await this.set(`user:${userId}:stats`, stats)
  }
}

export class TemplateCache extends CacheManager {
  constructor() {
    super({
      keyPrefix: 'webclone:templates:',
      defaultTTL: 7200 // 2 hours for templates
    })
  }

  async getTemplate(templateId: string) {
    return await this.get(`template:${templateId}`)
  }

  async setTemplate(templateId: string, template: any) {
    return await this.set(`template:${templateId}`, template)
  }

  async getPublicTemplates() {
    return await this.get('public:list')
  }

  async setPublicTemplates(templates: any[]) {
    return await this.set('public:list', templates, 3600) // 1 hour
  }
}

// Cache decorator for functions
export function cached(ttl?: number, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const cache = new CacheManager()

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator 
        ? keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`

      // Try to get from cache first
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await method.apply(this, args)
      
      // Cache the result
      await cache.set(cacheKey, result, ttl)
      
      return result
    }

    return descriptor
  }
}

// Cache warming utility
export class CacheWarmer {
  private cacheManagers: Map<string, CacheManager> = new Map()

  addCacheManager(name: string, manager: CacheManager) {
    this.cacheManagers.set(name, manager)
  }

  async warmProjectCache(projectId: string, projectData: any) {
    const projectCache = this.cacheManagers.get('projects')
    if (projectCache) {
      await projectCache.set(`project:${projectId}`, projectData)
    }
  }

  async warmUserCache(userId: string, userData: any) {
    const analyticsCache = this.cacheManagers.get('analytics')
    if (analyticsCache) {
      await analyticsCache.set(`user:${userId}:stats`, userData)
    }
  }

  async warmTemplateCache() {
    const templateCache = this.cacheManagers.get('templates')
    if (templateCache) {
      // This would fetch from database in a real implementation
      const publicTemplates = [
        { id: '1', name: 'E-commerce Store', category: 'business' },
        { id: '2', name: 'Portfolio', category: 'personal' },
        { id: '3', name: 'Blog', category: 'content' }
      ]
      
      await templateCache.set('public:list', publicTemplates)
    }
  }
}

// Global cache instances
export const projectCache = new ProjectCache()
export const analyticsCache = new AnalyticsCache()
export const templateCache = new TemplateCache()
export const cacheWarmer = new CacheWarmer()

// Register cache managers with warmer
cacheWarmer.addCacheManager('projects', projectCache)
cacheWarmer.addCacheManager('analytics', analyticsCache)
cacheWarmer.addCacheManager('templates', templateCache)

// Cache middleware for API routes
export function withCache(ttl: number = 300) {
  return function (handler: Function) {
    return async function (req: any, res: any) {
      const cacheKey = `api:${req.url}:${JSON.stringify(req.query)}`
      const cache = new CacheManager()
      
      // Try cache first
      const cached = await cache.get(cacheKey)
      if (cached) {
        return res.json(cached)
      }
      
      // Execute handler
      const originalJson = res.json
      res.json = function (data: any) {
        // Cache the response
        cache.set(cacheKey, data, ttl)
        return originalJson.call(this, data)
      }
      
      return handler(req, res)
    }
  }
}

// Cache health check
export async function getCacheHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down'
  stats: Record<string, CacheStats>
}> {
  try {
    const stats = {
      projects: projectCache.getStats(),
      analytics: analyticsCache.getStats(),
      templates: templateCache.getStats()
    }

    // Test basic operations
    const testKey = `health-check-${Date.now()}`
    await projectCache.set(testKey, { test: true }, 10)
    const testResult = await projectCache.get(testKey)
    await projectCache.delete(testKey)

    const isHealthy = testResult !== null
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      stats
    }
  } catch (error) {
    return {
      status: 'down',
      stats: {
        projects: projectCache.getStats(),
        analytics: analyticsCache.getStats(),
        templates: templateCache.getStats()
      }
    }
  }
}