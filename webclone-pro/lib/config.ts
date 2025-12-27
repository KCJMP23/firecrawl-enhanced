/**
 * Production Configuration Management
 * 
 * Centralized configuration with environment validation
 * and type safety for production deployments
 */

interface EnvironmentConfig {
  // Application
  nodeEnv: 'development' | 'staging' | 'production'
  appName: string
  appVersion: string
  appUrl: string
  
  // Database
  databaseUrl: string
  databasePoolMax: number
  databaseSSL: boolean
  
  // Authentication
  nextAuthUrl: string
  nextAuthSecret: string
  jwtSecret: string
  
  // External APIs
  openaiApiKey: string
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  
  // Cache
  redisHost?: string
  redisPort?: number
  redisPassword?: string
  
  // Security
  corsOrigins: string[]
  cspEnabled: boolean
  secureHeaders: boolean
  
  // Rate Limiting
  rateLimitEnabled: boolean
  rateLimitWindowMs: number
  rateLimitMaxRequests: number
  
  // Feature Flags
  features: {
    aiModels: boolean
    templates: boolean
    collaboration: boolean
    analytics: boolean
  }
  
  // Logging
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  logFormat: 'pretty' | 'json'
  
  // Performance
  cache: {
    defaultTTL: number
    staticTTL: number
    apiTTL: number
  }
  
  // Limits
  maxFileSize: number
  maxProjectsPerUser: number
  maxApiRequestsPerDay: number
}

/**
 * Validate and parse environment variables
 */
function parseEnvironment(): EnvironmentConfig {
  const required = (key: string): string => {
    const value = process.env[key]
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    return value
  }

  const optional = (key: string, defaultValue: string): string => {
    return process.env[key] || defaultValue
  }

  const parseBoolean = (value: string): boolean => {
    return value.toLowerCase() === 'true'
  }

  const parseNumber = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  return {
    // Application
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
    appName: optional('NEXT_PUBLIC_APP_NAME', 'WebClone Pro'),
    appVersion: optional('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
    appUrl: required('NEXT_PUBLIC_APP_URL'),
    
    // Database
    databaseUrl: required('DATABASE_URL'),
    databasePoolMax: parseNumber(optional('DATABASE_POOL_MAX', '10'), 10),
    databaseSSL: parseBoolean(optional('DATABASE_SSL', 'false')),
    
    // Authentication
    nextAuthUrl: required('NEXTAUTH_URL'),
    nextAuthSecret: required('NEXTAUTH_SECRET'),
    jwtSecret: required('JWT_SECRET'),
    
    // External APIs
    openaiApiKey: required('OPENAI_API_KEY'),
    stripePublishableKey: required('STRIPE_PUBLISHABLE_KEY'),
    stripeSecretKey: required('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: required('STRIPE_WEBHOOK_SECRET'),
    
    // Cache
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT ? parseNumber(process.env.REDIS_PORT, 6379) : undefined,
    redisPassword: process.env.REDIS_PASSWORD,
    
    // Security
    corsOrigins: optional('CORS_ORIGINS', '').split(',').filter(Boolean),
    cspEnabled: parseBoolean(optional('CSP_ENABLED', 'false')),
    secureHeaders: parseBoolean(optional('SECURE_HEADERS', 'false')),
    
    // Rate Limiting
    rateLimitEnabled: parseBoolean(optional('RATE_LIMIT_ENABLED', 'true')),
    rateLimitWindowMs: parseNumber(optional('RATE_LIMIT_WINDOW_MS', '900000'), 900000),
    rateLimitMaxRequests: parseNumber(optional('RATE_LIMIT_MAX_REQUESTS', '100'), 100),
    
    // Feature Flags
    features: {
      aiModels: parseBoolean(optional('FEATURE_AI_MODELS', 'true')),
      templates: parseBoolean(optional('FEATURE_TEMPLATES', 'true')),
      collaboration: parseBoolean(optional('FEATURE_COLLABORATION', 'false')),
      analytics: parseBoolean(optional('FEATURE_ANALYTICS', 'true'))
    },
    
    // Logging
    logLevel: (optional('LOG_LEVEL', 'info') as any),
    logFormat: (optional('LOG_FORMAT', 'pretty') as any),
    
    // Performance
    cache: {
      defaultTTL: parseNumber(optional('CACHE_TTL_DEFAULT', '300'), 300),
      staticTTL: parseNumber(optional('CACHE_TTL_STATIC', '3600'), 3600),
      apiTTL: parseNumber(optional('CACHE_TTL_API', '180'), 180)
    },
    
    // Limits
    maxFileSize: parseNumber(optional('MAX_FILE_SIZE', '52428800'), 52428800), // 50MB
    maxProjectsPerUser: parseNumber(optional('MAX_PROJECTS_PER_USER', '100'), 100),
    maxApiRequestsPerDay: parseNumber(optional('MAX_API_REQUESTS_PER_DAY', '10000'), 10000)
  }
}

/**
 * Validate critical configuration
 */
function validateConfig(config: EnvironmentConfig): void {
  const errors: string[] = []

  // Validate secrets are not default values
  if (config.nextAuthSecret.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters')
  }

  if (config.jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters')
  }

  // Validate URLs
  try {
    new URL(config.appUrl)
    new URL(config.nextAuthUrl)
  } catch (error) {
    errors.push('Invalid URL configuration')
  }

  // Validate production environment
  if (config.nodeEnv === 'production') {
    if (config.appUrl.includes('localhost') || config.appUrl.includes('127.0.0.1')) {
      errors.push('Production environment cannot use localhost URLs')
    }

    if (!config.secureHeaders) {
      errors.push('Secure headers must be enabled in production')
    }

    if (!config.databaseSSL) {
      errors.push('Database SSL must be enabled in production')
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }
}

// Parse and validate configuration
let config: EnvironmentConfig

try {
  config = parseEnvironment()
  validateConfig(config)
} catch (error) {
  console.error('Configuration error:', error)
  process.exit(1)
}

export { config, type EnvironmentConfig }

/**
 * Runtime environment checks
 */
export const isProduction = config.nodeEnv === 'production'
export const isStaging = config.nodeEnv === 'staging'
export const isDevelopment = config.nodeEnv === 'development'

/**
 * Feature flag helpers
 */
export const features = {
  isEnabled: (feature: keyof typeof config.features): boolean => {
    return config.features[feature]
  },
  aiModels: config.features.aiModels,
  templates: config.features.templates,
  collaboration: config.features.collaboration,
  analytics: config.features.analytics
}

/**
 * Database configuration
 */
export const database = {
  url: config.databaseUrl,
  poolMax: config.databasePoolMax,
  ssl: config.databaseSSL
}

/**
 * Cache configuration
 */
export const cacheConfig = {
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  ttl: config.cache
}

/**
 * Security configuration
 */
export const security = {
  corsOrigins: config.corsOrigins,
  cspEnabled: config.cspEnabled,
  secureHeaders: config.secureHeaders,
  rateLimit: {
    enabled: config.rateLimitEnabled,
    windowMs: config.rateLimitWindowMs,
    maxRequests: config.rateLimitMaxRequests
  }
}

/**
 * Logging configuration
 */
export const logging = {
  level: config.logLevel,
  format: config.logFormat
}

/**
 * Application limits
 */
export const limits = {
  maxFileSize: config.maxFileSize,
  maxProjectsPerUser: config.maxProjectsPerUser,
  maxApiRequestsPerDay: config.maxApiRequestsPerDay
}