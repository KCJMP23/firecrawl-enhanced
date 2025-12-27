// Monitoring and observability utilities for WebClone Pro 2026

export interface MetricData {
  timestamp: number
  value: number
  tags?: Record<string, string>
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  services: ServiceStatus[]
  uptime: number
  lastCheck: Date
}

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  errorRate: number
  lastError?: string
}

export class MetricsCollector {
  private metrics: Map<string, MetricData[]> = new Map()
  private readonly maxDataPoints = 1000

  // Collect system metrics
  async collectSystemMetrics(): Promise<Record<string, number>> {
    const usage = process.memoryUsage()
    const uptime = process.uptime()
    
    return {
      'memory.heap.used': usage.heapUsed,
      'memory.heap.total': usage.heapTotal,
      'memory.external': usage.external,
      'memory.rss': usage.rss,
      'process.uptime': uptime,
      'process.pid': process.pid
    }
  }

  // Record a metric
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metricData = this.metrics.get(name)!
    metricData.push({
      timestamp: Date.now(),
      value,
      tags
    })

    // Keep only the last N data points
    if (metricData.length > this.maxDataPoints) {
      metricData.shift()
    }
  }

  // Get metric history
  getMetricHistory(name: string, since?: Date): MetricData[] {
    const metricData = this.metrics.get(name) || []
    
    if (since) {
      const sinceTimestamp = since.getTime()
      return metricData.filter(point => point.timestamp >= sinceTimestamp)
    }
    
    return metricData
  }

  // Get current value for a metric
  getCurrentValue(name: string): number | null {
    const metricData = this.metrics.get(name)
    if (!metricData || metricData.length === 0) {
      return null
    }
    
    return metricData[metricData.length - 1].value
  }

  // Get all metric names
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys())
  }
}

export class HealthChecker {
  private checks: Map<string, () => Promise<ServiceStatus>> = new Map()

  // Register a health check
  registerCheck(name: string, checkFn: () => Promise<ServiceStatus>) {
    this.checks.set(name, checkFn)
  }

  // Run all health checks
  async runHealthChecks(): Promise<SystemHealth> {
    const services: ServiceStatus[] = []
    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy'

    for (const [name, checkFn] of this.checks.entries()) {
      try {
        const serviceStatus = await checkFn()
        services.push(serviceStatus)

        if (serviceStatus.status === 'down') {
          overallStatus = 'down'
        } else if (serviceStatus.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded'
        }
      } catch (error) {
        services.push({
          name,
          status: 'down',
          responseTime: 0,
          errorRate: 100,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        })
        overallStatus = 'down'
      }
    }

    return {
      status: overallStatus,
      services,
      uptime: process.uptime(),
      lastCheck: new Date()
    }
  }
}

export class AlertManager {
  private rules: Map<string, AlertRule> = new Map()
  private callbacks: Map<string, AlertCallback[]> = new Map()

  // Add an alert rule
  addRule(rule: AlertRule) {
    this.rules.set(rule.id, rule)
  }

  // Add alert callback
  onAlert(severity: AlertSeverity, callback: AlertCallback) {
    if (!this.callbacks.has(severity)) {
      this.callbacks.set(severity, [])
    }
    this.callbacks.get(severity)!.push(callback)
  }

  // Check metric against rules
  checkMetric(name: string, value: number) {
    for (const rule of this.rules.values()) {
      if (rule.metric === name && rule.enabled) {
        const triggered = this.evaluateRule(rule, value)
        
        if (triggered) {
          this.triggerAlert(rule, value)
        }
      }
    }
  }

  private evaluateRule(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
      case 'greater_than':
        return value > rule.threshold
      case 'less_than':
        return value < rule.threshold
      case 'equals':
        return Math.abs(value - rule.threshold) < 0.001
      default:
        return false
    }
  }

  private triggerAlert(rule: AlertRule, value: number) {
    const alert: Alert = {
      id: `${rule.id}_${Date.now()}`,
      rule: rule.id,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      severity: rule.severity,
      timestamp: new Date(),
      message: rule.description
    }

    // Call registered callbacks
    const callbacks = this.callbacks.get(rule.severity) || []
    callbacks.forEach(callback => callback(alert))

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 Alert triggered: ${alert.message}`, alert)
    }
  }
}

// Types
export interface AlertRule {
  id: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals'
  threshold: number
  severity: AlertSeverity
  enabled: boolean
  description: string
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Alert {
  id: string
  rule: string
  metric: string
  value: number
  threshold: number
  severity: AlertSeverity
  timestamp: Date
  message: string
}

export type AlertCallback = (alert: Alert) => void

// Global instances
export const metricsCollector = new MetricsCollector()
export const healthChecker = new HealthChecker()
export const alertManager = new AlertManager()

// Setup default health checks
healthChecker.registerCheck('database', async (): Promise<ServiceStatus> => {
  // This would be replaced with actual database health check
  const startTime = Date.now()
  
  try {
    // Simulate database ping
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
    const responseTime = Date.now() - startTime
    
    return {
      name: 'database',
      status: 'healthy',
      responseTime,
      errorRate: 0
    }
  } catch (error) {
    return {
      name: 'database',
      status: 'down',
      responseTime: 0,
      errorRate: 100,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

healthChecker.registerCheck('redis', async (): Promise<ServiceStatus> => {
  // This would be replaced with actual Redis health check
  const startTime = Date.now()
  
  try {
    // Simulate Redis ping
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
    const responseTime = Date.now() - startTime
    
    return {
      name: 'redis',
      status: 'healthy',
      responseTime,
      errorRate: 0
    }
  } catch (error) {
    return {
      name: 'redis',
      status: 'down',
      responseTime: 0,
      errorRate: 100,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// Setup default alert rules
alertManager.addRule({
  id: 'high_memory_usage',
  metric: 'memory.heap.used',
  condition: 'greater_than',
  threshold: 500 * 1024 * 1024, // 500MB
  severity: 'high',
  enabled: true,
  description: 'Memory usage is high'
})

alertManager.addRule({
  id: 'critical_memory_usage',
  metric: 'memory.heap.used',
  condition: 'greater_than',
  threshold: 1000 * 1024 * 1024, // 1GB
  severity: 'critical',
  enabled: true,
  description: 'Memory usage is critical'
})

// Setup metric collection interval
if (typeof window === 'undefined') {
  // Server-side metric collection
  setInterval(async () => {
    const systemMetrics = await metricsCollector.collectSystemMetrics()
    
    for (const [metric, value] of Object.entries(systemMetrics)) {
      metricsCollector.recordMetric(metric, value)
      alertManager.checkMetric(metric, value)
    }
  }, 10000) // Collect metrics every 10 seconds
}