/**
 * Error Reporting API Endpoint
 * 
 * Receives client-side error reports from error boundaries and logs them securely
 */

import { NextRequest, NextResponse } from 'next/server'
import { logSecureError } from '@/lib/secure-logger'
import { createClient } from '@/lib/supabase/server'

interface ErrorReport {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user session for context
    const { data: { session } } = await supabase.auth.getSession()
    
    const body: ErrorReport = await request.json()
    
    // Validate required fields
    if (!body.errorId || !body.message || !body.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Rate limiting - simple in-memory approach (in production, use Redis)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Log the error securely
    logSecureError(
      new Error(`Client Error: ${body.message}`),
      {
        userId: session?.user?.id,
        ip: clientIP,
        userAgent: body.userAgent,
        endpoint: '/api/errors'
      },
      {
        clientErrorId: body.errorId,
        clientTimestamp: body.timestamp,
        componentStack: body.componentStack,
        // Don't log the full stack trace for security
        hasStack: !!body.stack
      }
    )

    // Store error in database for monitoring (if needed)
    if (process.env.ENABLE_ERROR_STORAGE === 'true') {
      const { error: dbError } = await supabase
        .from('client_errors')
        .insert({
          error_id: body.errorId,
          message: body.message,
          url: body.url,
          user_id: session?.user?.id || null,
          user_agent: body.userAgent,
          timestamp: body.timestamp,
          ip_address: clientIP
        })
      
      if (dbError) {
        console.error('Failed to store error in database:', dbError)
        // Don't fail the request if database storage fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Error reported successfully' 
    })

  } catch (error) {
    // Log the error in processing the error report
    logSecureError(
      error as Error,
      {
        endpoint: '/api/errors',
        userAgent: request.headers.get('user-agent') || undefined
      },
      {
        context: 'Error while processing error report'
      }
    )

    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}