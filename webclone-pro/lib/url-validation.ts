/**
 * URL Security Validation Utility
 * Prevents SSRF attacks by validating URLs against security policies
 */

import { URL } from 'url'
import { isIP, isIPv4, isIPv6 } from 'net'

interface ValidationResult {
  isValid: boolean
  reason?: string
}

// Private IP ranges (RFC 1918, RFC 3927, RFC 4193, etc.)
const PRIVATE_IP_RANGES = [
  // IPv4 private ranges
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./,     // 172.16.0.0/12
  /^192\.168\./,                    // 192.168.0.0/16
  /^169\.254\./,                    // 169.254.0.0/16 (link-local)
  /^127\./,                         // 127.0.0.0/8 (loopback)
  /^0\./,                           // 0.0.0.0/8
  
  // IPv6 private ranges
  /^::1$/,                          // loopback
  /^::/,                           // unspecified
  /^fe80:/i,                       // link-local
  /^fc00:/i,                       // unique local
  /^fd00:/i,                       // unique local
]

// Blocked hostnames and domains
const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',  // AWS, GCP, Azure metadata
  'metadata.azure.com',
  'metadata.amazonaws.com',
]

// Allowed protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:']

// Blocked ports
const BLOCKED_PORTS = [
  22,    // SSH
  23,    // Telnet
  25,    // SMTP
  53,    // DNS
  110,   // POP3
  143,   // IMAP
  993,   // IMAPS
  995,   // POP3S
  1433,  // MSSQL
  1521,  // Oracle
  3306,  // MySQL
  3389,  // RDP
  5432,  // PostgreSQL
  5984,  // CouchDB
  6379,  // Redis
  8086,  // InfluxDB
  9200,  // Elasticsearch
  27017, // MongoDB
]

/**
 * Check if an IP address is private/internal
 */
function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_RANGES.some(range => range.test(ip))
}

/**
 * Check if a hostname is blocked
 */
function isBlockedHostname(hostname: string): boolean {
  return BLOCKED_HOSTNAMES.some(blocked => 
    hostname.toLowerCase() === blocked.toLowerCase() ||
    hostname.toLowerCase().endsWith(`.${blocked.toLowerCase()}`)
  )
}

/**
 * Resolve hostname to IP and check if it's private
 * Note: This is a simplified check - in production, you might want to use DNS resolution
 */
function isPrivateHostname(hostname: string): boolean {
  // Check for localhost variations
  if (hostname.toLowerCase() === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname === '::1') {
    return true
  }
  
  // Check for obvious internal hostnames
  const internalPatterns = [
    /^localhost$/i,
    /^.*\.local$/i,
    /^.*\.internal$/i,
    /^.*\.lan$/i,
    /^.*\.intranet$/i,
  ]
  
  return internalPatterns.some(pattern => pattern.test(hostname))
}

/**
 * Comprehensive URL validation to prevent SSRF attacks
 */
export function validateURLSecurity(urlString: string): ValidationResult {
  let url: URL
  
  try {
    url = new URL(urlString)
  } catch (error) {
    return { isValid: false, reason: 'Invalid URL format' }
  }
  
  // Check protocol
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    return { 
      isValid: false, 
      reason: `Protocol ${url.protocol} is not allowed. Only HTTP and HTTPS are permitted.` 
    }
  }
  
  // Check for blocked ports
  const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80)
  if (BLOCKED_PORTS.includes(port)) {
    return { 
      isValid: false, 
      reason: `Port ${port} is blocked for security reasons` 
    }
  }
  
  // Check hostname
  const hostname = url.hostname.toLowerCase()
  
  // Check if hostname is blocked
  if (isBlockedHostname(hostname)) {
    return { 
      isValid: false, 
      reason: `Hostname ${hostname} is not allowed` 
    }
  }
  
  // Check if hostname is an IP address
  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      return { 
        isValid: false, 
        reason: 'Access to private IP addresses is not allowed' 
      }
    }
  } else {
    // Check for private hostname patterns
    if (isPrivateHostname(hostname)) {
      return { 
        isValid: false, 
        reason: 'Access to internal hostnames is not allowed' 
      }
    }
  }
  
  // Check for suspicious URL patterns
  if (url.pathname.includes('..')) {
    return { 
      isValid: false, 
      reason: 'Path traversal patterns are not allowed' 
    }
  }
  
  // Additional checks for cloud metadata services
  if (hostname === '169.254.169.254' || 
      hostname.includes('metadata') ||
      hostname.includes('internal')) {
    return { 
      isValid: false, 
      reason: 'Access to metadata services is not allowed' 
    }
  }
  
  return { isValid: true }
}

/**
 * Validate and sanitize URL for safe external requests
 */
export function sanitizeExternalURL(urlString: string): { url: string | null; error?: string } {
  const validation = validateURLSecurity(urlString)
  
  if (!validation.isValid) {
    return { url: null, error: validation.reason }
  }
  
  try {
    const url = new URL(urlString)
    
    // Normalize the URL
    url.hash = '' // Remove fragment
    
    // Basic URL length limit
    if (url.toString().length > 2048) {
      return { url: null, error: 'URL is too long' }
    }
    
    return { url: url.toString() }
  } catch (error) {
    return { url: null, error: 'Failed to sanitize URL' }
  }
}

/**
 * Additional security headers and options for external requests
 */
export function getSecureRequestOptions(): {
  headers: Record<string, string>
  timeout: number
  redirect: RequestRedirect
  maxRedirects: number
} {
  return {
    headers: {
      'User-Agent': 'WebClone-Pro/1.0 (Security Scanner)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
    },
    timeout: 30000, // 30 second timeout
    redirect: 'follow' as RequestRedirect,
    maxRedirects: 5,
  }
}