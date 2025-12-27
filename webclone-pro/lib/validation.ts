/**
 * Input Validation System
 * 
 * Comprehensive validation schemas and utilities for API endpoints
 * using Zod for type-safe runtime validation
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'

// Common validation patterns
export const commonSchemas = {
  // URL validation with security checks
  url: z.string()
    .url('Invalid URL format')
    .min(1, 'URL is required')
    .max(2048, 'URL is too long')
    .refine((url) => {
      try {
        const parsed = new URL(url)
        // Block dangerous protocols
        return ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        return false
      }
    }, 'URL must use HTTP or HTTPS protocol'),

  // Email validation
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email is too long'),

  // UUID validation
  uuid: z.string()
    .uuid('Invalid UUID format'),

  // ID validation (UUID or numeric)
  id: z.string()
    .min(1, 'ID is required')
    .refine((val) => {
      return z.string().uuid().safeParse(val).success || 
             /^\d+$/.test(val)
    }, 'ID must be a valid UUID or number'),

  // Safe string validation
  safeString: z.string()
    .min(1, 'String cannot be empty')
    .max(1000, 'String is too long')
    .refine((str) => {
      // Block potential XSS and injection patterns
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /data:text\/html/i,
        /vbscript:/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /<meta/i
      ]
      return !dangerousPatterns.some(pattern => pattern.test(str))
    }, 'String contains potentially dangerous content'),

  // Name validation
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Name contains invalid characters'),

  // Description validation
  description: z.string()
    .max(2000, 'Description is too long')
    .optional(),

  // Pagination
  page: z.coerce.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page number too high')
    .default(1),

  limit: z.coerce.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),

  // File validation
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename is too long')
    .regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'Filename contains invalid characters')
    .refine((name) => {
      const dangerous = ['..', '/', '\\', '<', '>', ':', '"', '|', '?', '*']
      return !dangerous.some(char => name.includes(char))
    }, 'Filename contains dangerous characters')
}

// Clone API validation schemas
export const cloneSchemas = {
  create: z.object({
    url: commonSchemas.url,
    name: commonSchemas.name,
    description: commonSchemas.description,
    settings: z.object({
      includeImages: z.boolean().default(true),
      includeStyles: z.boolean().default(true),
      includeScripts: z.boolean().default(false),
      maxDepth: z.number().int().min(1).max(10).default(3),
      timeout: z.number().int().min(5000).max(60000).default(30000)
    }).optional()
  }),

  update: z.object({
    id: commonSchemas.uuid,
    name: commonSchemas.name.optional(),
    description: commonSchemas.description,
    settings: z.object({
      includeImages: z.boolean(),
      includeStyles: z.boolean(),
      includeScripts: z.boolean(),
      maxDepth: z.number().int().min(1).max(10),
      timeout: z.number().int().min(5000).max(60000)
    }).optional()
  })
}

// PDF upload validation schemas
export const pdfSchemas = {
  upload: z.object({
    filename: commonSchemas.filename,
    size: z.number()
      .int('File size must be an integer')
      .min(1, 'File cannot be empty')
      .max(50 * 1024 * 1024, 'File size cannot exceed 50MB'), // 50MB limit
    type: z.literal('application/pdf', {
      errorMap: () => ({ message: 'Only PDF files are allowed' })
    })
  }),

  metadata: z.object({
    id: commonSchemas.uuid,
    title: commonSchemas.name.optional(),
    description: commonSchemas.description,
    tags: z.array(
      z.string()
        .min(1, 'Tag cannot be empty')
        .max(50, 'Tag is too long')
        .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Tag contains invalid characters')
    ).max(10, 'Maximum 10 tags allowed').default([])
  })
}

// Analytics validation schemas
export const analyticsSchemas = {
  query: z.object({
    startDate: z.string()
      .datetime('Invalid start date format')
      .optional(),
    endDate: z.string()
      .datetime('Invalid end date format')
      .optional(),
    metric: z.enum(['views', 'clones', 'users', 'errors'], {
      errorMap: () => ({ message: 'Invalid metric type' })
    }).optional(),
    groupBy: z.enum(['day', 'week', 'month'], {
      errorMap: () => ({ message: 'Invalid groupBy value' })
    }).default('day')
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate)
    }
    return true
  }, 'Start date must be before end date')
}

// User profile validation schemas
export const userSchemas = {
  update: z.object({
    name: commonSchemas.name.optional(),
    email: commonSchemas.email.optional(),
    avatar: commonSchemas.url.optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'system']).default('system'),
      notifications: z.boolean().default(true),
      language: z.string().length(2, 'Language must be 2 characters').default('en')
    }).optional()
  })
}

// Request validation middleware
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' = 'body'
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    let rawData: any

    if (source === 'body') {
      const contentType = request.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        rawData = await request.json()
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        rawData = Object.fromEntries(formData.entries())
      } else {
        return {
          data: null,
          error: 'Unsupported content type. Expected application/json or multipart/form-data'
        }
      }
    } else {
      const url = new URL(request.url)
      rawData = Object.fromEntries(url.searchParams.entries())
    }

    const result = schema.safeParse(rawData)
    
    if (result.success) {
      return { data: result.data, error: null }
    } else {
      const errorMessage = result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      
      return { data: null, error: `Validation failed: ${errorMessage}` }
    }
  } catch (error) {
    return {
      data: null,
      error: `Failed to parse request: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// File validation with magic number checking
export function validateFileType(buffer: ArrayBuffer, expectedType: string): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 8))
  
  // Magic number signatures
  const signatures: Record<string, number[][]> = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
    'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // WEBP (partial)
    'application/zip': [[0x50, 0x4B, 0x03, 0x04]], // ZIP
    'text/plain': [] // Allow text files without specific signature
  }

  const typeSignatures = signatures[expectedType]
  if (!typeSignatures || typeSignatures.length === 0) {
    return true // Allow if no signature defined
  }

  return typeSignatures.some(signature => 
    signature.every((byte, index) => bytes[index] === byte)
  )
}

// Rate limiting helper
export function createRateLimitKey(
  request: NextRequest,
  endpoint: string,
  identifier?: string
): string {
  const ip = request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const id = identifier || `${ip}:${userAgent.slice(0, 50)}`
  
  return `rate_limit:${endpoint}:${id}`
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .slice(0, 1000) // Limit length
}

export default {
  commonSchemas,
  cloneSchemas,
  pdfSchemas,
  analyticsSchemas,
  userSchemas,
  validateRequest,
  validateFileType,
  createRateLimitKey,
  sanitizeInput
}