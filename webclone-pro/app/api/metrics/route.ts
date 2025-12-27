import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector, healthChecker } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const since = searchParams.get('since')
    const format = searchParams.get('format') || 'json'

    // Get specific metric
    if (metric) {
      const sinceDate = since ? new Date(since) : undefined
      const history = metricsCollector.getMetricHistory(metric, sinceDate)
      
      if (format === 'prometheus') {
        // Return Prometheus format
        const currentValue = metricsCollector.getCurrentValue(metric) || 0
        const prometheusMetric = `# HELP ${metric} System metric\n# TYPE ${metric} gauge\n${metric} ${currentValue}\n`
        
        return new Response(prometheusMetric, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        })
      }
      
      return NextResponse.json({
        metric,
        history,
        currentValue: metricsCollector.getCurrentValue(metric)
      })
    }

    // Get all metrics
    const metricNames = metricsCollector.getMetricNames()
    const systemHealth = await healthChecker.runHealthChecks()
    const currentMetrics: Record<string, number | null> = {}
    
    for (const name of metricNames) {
      currentMetrics[name] = metricsCollector.getCurrentValue(name)
    }

    if (format === 'prometheus') {
      // Return all metrics in Prometheus format
      let prometheusOutput = ''
      
      for (const [name, value] of Object.entries(currentMetrics)) {
        if (value !== null) {
          prometheusOutput += `# HELP ${name} System metric\n`
          prometheusOutput += `# TYPE ${name} gauge\n`
          prometheusOutput += `${name} ${value}\n`
        }
      }
      
      // Add health status
      prometheusOutput += `# HELP system_health Overall system health status\n`
      prometheusOutput += `# TYPE system_health gauge\n`
      prometheusOutput += `system_health{status="${systemHealth.status}"} ${systemHealth.status === 'healthy' ? 1 : 0}\n`
      
      return new Response(prometheusOutput, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      })
    }

    return NextResponse.json({
      metrics: currentMetrics,
      metricNames,
      systemHealth,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })

  } catch (error) {
    console.error('Metrics API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metric, value, tags } = body

    if (!metric || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data. Required: metric (string), value (number)' },
        { status: 400 }
      )
    }

    // Record the custom metric
    metricsCollector.recordMetric(metric, value, tags)

    return NextResponse.json({
      success: true,
      metric,
      value,
      tags,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Metrics POST error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to record metric',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}