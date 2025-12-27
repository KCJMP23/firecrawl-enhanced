/**
 * Secure Logging Utility
 * Sanitizes sensitive data before logging to prevent information disclosure
 */

import crypto from 'crypto'

interface SanitizedError {
  timestamp: string
  errorId: string
  message: string
  stack?: string
  context?: any
}

interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  endpoint?: string
  userAgent?: string
  ip?: string
}

// Sensitive fields to redact or mask
const SENSITIVE_FIELDS = [
  // Payment fields
  'card',
  'credit_card',
  'payment_method',
  'billing_details',
  'customer_details',
  'amount',
  'amount_received',
  'amount_capturable',
  'receipt_email',
  'receipt_number',
  
  // Personal information
  'email',
  'phone',
  'address',
  'name',
  'first_name',
  'last_name',
  'ssn',
  'social_security_number',
  
  // Authentication
  'password',
  'token',
  'api_key',
  'secret',
  'private_key',
  'access_token',
  'refresh_token',
  'session_token',
  'authorization',
  'signature',
  
  // Stripe specific
  'client_secret',
  'publishable_key',
  'stripe_account',
  'account_id',
  'transfer_data',
  'application_fee'
]

/**
 * Recursively sanitize an object by redacting sensitive fields
 */
function sanitizeObject(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[MAX_DEPTH_REACHED]'
  }
  
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1))
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()
      
      // Check if this is a sensitive field
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = maskSensitiveValue(value)
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1)
      }
    }
    
    return sanitized
  }
  
  return obj
}

/**
 * Mask sensitive string values while preserving some structure
 */
function maskSensitiveValue(value: any): string {
  if (value === null || value === undefined) {
    return '[REDACTED]'
  }
  
  const str = String(value)
  
  // Email masking
  if (str.includes('@')) {
    const [local, domain] = str.split('@')
    if (local.length > 2) {
      return `${local.substring(0, 2)}***@${domain}`
    }
    return `***@${domain}`
  }
  
  // Credit card number masking (if numeric)
  if (/^\d{13,19}$/.test(str)) {
    return `****-****-****-${str.slice(-4)}`
  }
  
  // Phone number masking
  if (/^\+?[\d\s\-\(\)]{10,}$/.test(str)) {
    return `***-***-${str.slice(-4)}`
  }
  
  // General string masking
  if (str.length > 4) {
    return `${str.substring(0, 2)}***${str.slice(-2)}`
  }
  
  return '[REDACTED]'
}

/**
 * Sanitize string content to remove potential sensitive data
 */
function sanitizeString(str: string): string {
  // Remove potential credit card numbers
  str = str.replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, '****-****-****-****')
  
  // Remove potential SSNs
  str = str.replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, '***-**-****')
  
  // Remove email addresses
  str = str.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
  
  // Remove potential API keys/tokens
  str = str.replace(/\b[A-Za-z0-9]{32,}\b/g, '[TOKEN_REDACTED]')
  
  return str
}

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
  return crypto.randomBytes(8).toString('hex')
}

/**
 * Securely log an error with sanitized data
 */
export function logSecureError(
  error: Error | any, 
  context: LogContext = {},
  additionalData: any = {}
): SanitizedError {
  const errorId = generateErrorId()
  
  const sanitizedError: SanitizedError = {
    timestamp: new Date().toISOString(),
    errorId,
    message: error?.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    context: sanitizeObject({
      ...context,
      ...additionalData
    })
  }
  
  // Log to console (in production, this would go to your logging service)
  console.error(`[ERROR:${errorId}]`, JSON.stringify(sanitizedError, null, 2))
  
  // In production, you would send this to your logging service
  // await sendToLoggingService(sanitizedError)
  
  return sanitizedError
}

/**
 * Log payment webhook events securely
 */
export function logPaymentEvent(
  eventType: string,
  eventId: string,
  sanitizedData: any,
  context: LogContext = {}
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'payment_webhook',
    eventType,
    eventId,
    data: sanitizeObject(sanitizedData),
    context: sanitizeObject(context)
  }
  
  console.log(`[PAYMENT_EVENT]`, JSON.stringify(logEntry, null, 2))
}

/**
 * Create sanitized stripe event data for logging
 */
export function sanitizeStripeEvent(event: any): any {
  return {
    id: event.id,
    type: event.type,
    created: event.created,
    livemode: event.livemode,
    object: sanitizeObject(event.data?.object),
    previousAttributes: event.data?.previous_attributes ? 
      sanitizeObject(event.data.previous_attributes) : undefined
  }
}

/**
 * Sanitize webhook error for safe logging
 */
export function sanitizeWebhookError(error: any, signature?: string): any {
  return {
    message: error?.message || 'Unknown webhook error',
    type: error?.constructor?.name || 'Error',
    hasSignature: !!signature,
    signaturePrefix: signature ? signature.substring(0, 10) + '...' : undefined,
    // Don't log the full signature or webhook body
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
  }
}