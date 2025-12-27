/**
 * Production Logging Configuration
 * Enterprise-grade logging with multiple transports and structured output
 */

import { logSecureError } from './secure-logger'
import { performanceMonitor } from './monitoring'

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Log metadata interface
interface LogMetadata {
  timestamp: string
  level: string
  service: string
  environment: string
  hostname: string
  pid: number
  requestId?: string
  userId?: string
  correlationId?: string
  duration?: number
  [key: string]: any
}

// Log entry interface
interface LogEntry {
  message: string
  metadata: LogMetadata
  context?: Record<string, any>
  error?: Error
  stack?: string
}

// Transport interface for different logging destinations
interface LogTransport {
  name: string
  log(entry: LogEntry): void | Promise<void>
}

// Console transport for development
class ConsoleTransport implements LogTransport {
  name = 'console'
  private useColors = process.env.NODE_ENV !== 'production'

  log(entry: LogEntry): void {
    const { level, message, metadata, error } = entry
    const timestamp = new Date(metadata.timestamp).toISOString()
    
    if (this.useColors) {
      const color = this.getColor(level)
      console.log(`${color}[${timestamp}] [${level}]${this.reset()} ${message}`)
    } else {
      console.log(`[${timestamp}] [${level}] ${message}`)
    }

    if (metadata.context) {
      console.log('Context:', JSON.stringify(metadata.context, null, 2))
    }

    if (error) {
      console.error('Error:', error)
    }
  }

  private getColor(level: string): string {
    switch (level) {
      case 'ERROR': return '\x1b[31m'  // Red
      case 'WARN': return '\x1b[33m'   // Yellow
      case 'INFO': return '\x1b[36m'   // Cyan
      case 'DEBUG': return '\x1b[35m'  // Magenta
      case 'TRACE': return '\x1b[90m'  // Gray
      default: return '\x1b[37m'       // White
    }
  }

  private reset(): string {
    return '\x1b[0m'
  }
}

// JSON transport for production (structured logging)
class JSONTransport implements LogTransport {
  name = 'json'

  log(entry: LogEntry): void {
    const output = {
      ...entry.metadata,
      message: entry.message,
      context: entry.context,
      error: entry.error ? {
        message: entry.error.message,
        name: entry.error.name,
        stack: entry.error.stack
      } : undefined
    }
    
    console.log(JSON.stringify(output))
  }
}

// File transport for persistent logging
class FileTransport implements LogTransport {
  name = 'file'
  private fs: any
  private path: any
  private logPath: string
  private maxFileSize = 10 * 1024 * 1024  // 10MB
  private maxFiles = 10
  private currentStream: any

  constructor(logDir: string = '/var/log/webclone-pro') {
    if (typeof window === 'undefined') {
      this.fs = require('fs')
      this.path = require('path')
      this.ensureLogDirectory(logDir)
      this.logPath = this.path.join(logDir, this.getLogFileName())
      this.openStream()
    }
  }

  private ensureLogDirectory(dir: string): void {
    if (!this.fs.existsSync(dir)) {
      this.fs.mkdirSync(dir, { recursive: true })
    }
  }

  private getLogFileName(): string {
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    return `app-${dateStr}.log`
  }

  private openStream(): void {
    if (this.currentStream) {
      this.currentStream.end()
    }
    
    this.currentStream = this.fs.createWriteStream(this.logPath, { flags: 'a' })
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.currentStream) return

    const logLine = JSON.stringify({
      ...entry.metadata,
      message: entry.message,
      context: entry.context,
      error: entry.error ? {
        message: entry.error.message,
        name: entry.error.name,
        stack: entry.error.stack
      } : undefined
    }) + '\n'

    this.currentStream.write(logLine)

    // Check file size and rotate if necessary
    const stats = await this.fs.promises.stat(this.logPath)
    if (stats.size > this.maxFileSize) {
      await this.rotateLog()
    }
  }

  private async rotateLog(): Promise<void> {
    this.currentStream.end()
    
    // Rename current log file
    const timestamp = Date.now()
    const rotatedPath = `${this.logPath}.${timestamp}`
    await this.fs.promises.rename(this.logPath, rotatedPath)
    
    // Open new stream
    this.openStream()
    
    // Clean up old files
    await this.cleanupOldLogs()
  }

  private async cleanupOldLogs(): Promise<void> {
    const dir = this.path.dirname(this.logPath)
    const files = await this.fs.promises.readdir(dir)
    const logFiles = files
      .filter((f: string) => f.startsWith('app-') && f.endsWith('.log'))
      .sort()
      .reverse()

    if (logFiles.length > this.maxFiles) {
      const filesToDelete = logFiles.slice(this.maxFiles)
      for (const file of filesToDelete) {
        await this.fs.promises.unlink(this.path.join(dir, file))
      }
    }
  }
}

// External service transport (e.g., CloudWatch, Datadog)
class ExternalTransport implements LogTransport {
  name = 'external'
  private endpoint: string
  private apiKey: string
  private batchSize = 100
  private flushInterval = 5000  // 5 seconds
  private buffer: LogEntry[] = []
  private timer: NodeJS.Timeout | null = null

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint
    this.apiKey = apiKey
    this.startFlushTimer()
  }

  async log(entry: LogEntry): Promise<void> {
    this.buffer.push(entry)
    
    if (this.buffer.length >= this.batchSize) {
      await this.flush()
    }
  }

  private startFlushTimer(): void {
    this.timer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const batch = this.buffer.splice(0, this.batchSize)
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ logs: batch })
      })

      if (!response.ok) {
        console.error('Failed to send logs to external service:', response.statusText)
        // Re-add to buffer for retry
        this.buffer.unshift(...batch)
      }
    } catch (error) {
      console.error('Error sending logs to external service:', error)
      // Re-add to buffer for retry
      this.buffer.unshift(...batch)
    }
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.flush()  // Final flush
  }
}

// Main logger class
class Logger {
  private level: LogLevel
  private transports: LogTransport[] = []
  private defaultMetadata: Partial<LogMetadata>
  private requestIdGenerator: () => string

  constructor() {
    this.level = this.getLogLevel()
    this.defaultMetadata = {
      service: 'webclone-pro',
      environment: process.env.NODE_ENV || 'development',
      hostname: typeof window === 'undefined' ? require('os').hostname() : 'browser',
      pid: typeof process !== 'undefined' ? process.pid : 0
    }
    this.requestIdGenerator = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setupTransports()
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase()
    switch (level) {
      case 'ERROR': return LogLevel.ERROR
      case 'WARN': return LogLevel.WARN
      case 'INFO': return LogLevel.INFO
      case 'DEBUG': return LogLevel.DEBUG
      case 'TRACE': return LogLevel.TRACE
      default: return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
    }
  }

  private setupTransports(): void {
    if (process.env.NODE_ENV === 'production') {
      // Production: JSON output for structured logging
      this.addTransport(new JSONTransport())
      
      // File logging if running on server
      if (typeof window === 'undefined') {
        this.addTransport(new FileTransport())
      }
      
      // External service if configured
      if (process.env.LOG_ENDPOINT && process.env.LOG_API_KEY) {
        this.addTransport(new ExternalTransport(
          process.env.LOG_ENDPOINT,
          process.env.LOG_API_KEY
        ))
      }
    } else {
      // Development: Console output with colors
      this.addTransport(new ConsoleTransport())
    }
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name)
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level
  }

  private createMetadata(level: string, additionalMetadata?: Partial<LogMetadata>): LogMetadata {
    return {
      ...this.defaultMetadata,
      timestamp: new Date().toISOString(),
      level,
      ...additionalMetadata
    } as LogMetadata
  }

  private async logToTransports(entry: LogEntry): Promise<void> {
    for (const transport of this.transports) {
      try {
        await transport.log(entry)
      } catch (error) {
        console.error(`Error in transport ${transport.name}:`, error)
      }
    }
  }

  // Public logging methods
  error(message: string, error?: Error, context?: Record<string, any>, metadata?: Partial<LogMetadata>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const entry: LogEntry = {
      message,
      metadata: this.createMetadata('ERROR', metadata),
      context,
      error
    }

    // Track error in monitoring
    if (error) {
      logSecureError(error, context || {}, { message })
    }

    this.logToTransports(entry)
  }

  warn(message: string, context?: Record<string, any>, metadata?: Partial<LogMetadata>): void {
    if (!this.shouldLog(LogLevel.WARN)) return

    const entry: LogEntry = {
      message,
      metadata: this.createMetadata('WARN', metadata),
      context
    }

    this.logToTransports(entry)
  }

  info(message: string, context?: Record<string, any>, metadata?: Partial<LogMetadata>): void {
    if (!this.shouldLog(LogLevel.INFO)) return

    const entry: LogEntry = {
      message,
      metadata: this.createMetadata('INFO', metadata),
      context
    }

    this.logToTransports(entry)
  }

  debug(message: string, context?: Record<string, any>, metadata?: Partial<LogMetadata>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return

    const entry: LogEntry = {
      message,
      metadata: this.createMetadata('DEBUG', metadata),
      context
    }

    this.logToTransports(entry)
  }

  trace(message: string, context?: Record<string, any>, metadata?: Partial<LogMetadata>): void {
    if (!this.shouldLog(LogLevel.TRACE)) return

    const entry: LogEntry = {
      message,
      metadata: this.createMetadata('TRACE', metadata),
      context
    }

    this.logToTransports(entry)
  }

  // Create child logger with additional metadata
  child(metadata: Partial<LogMetadata>): Logger {
    const childLogger = Object.create(this)
    childLogger.defaultMetadata = {
      ...this.defaultMetadata,
      ...metadata
    }
    return childLogger
  }

  // Performance logging
  startTimer(label: string): () => void {
    const start = Date.now()
    performanceMonitor.startTimer(label)
    
    return () => {
      const duration = Date.now() - start
      performanceMonitor.endTimer(label)
      this.debug(`Timer ${label} completed`, { duration })
    }
  }

  // Request logging middleware
  requestLogger() {
    return (req: any, res: any, next: any) => {
      const requestId = this.requestIdGenerator()
      const start = Date.now()
      
      // Attach request ID to request
      req.requestId = requestId
      
      // Log request
      this.info('Incoming request', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query,
        ip: req.ip
      }, { requestId })
      
      // Log response
      const originalSend = res.send
      res.send = function(data: any) {
        const duration = Date.now() - start
        
        logger.info('Request completed', {
          statusCode: res.statusCode,
          duration
        }, { requestId, duration })
        
        originalSend.call(this, data)
      }
      
      next()
    }
  }
}

// Create singleton logger instance
export const logger = new Logger()

// Export for use in other modules
export default logger

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, flushing logs...')
    // Flush any buffered logs
    for (const transport of logger['transports']) {
      if ('destroy' in transport) {
        (transport as any).destroy()
      }
    }
  })
}