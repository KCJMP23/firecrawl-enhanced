import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateURLSecurity, sanitizeExternalURL, getSecureRequestOptions } from '@/lib/url-validation'
import { validateRequest, cloneSchemas } from '@/lib/validation'
import { logSecureError } from '@/lib/secure-logger'
import { withRateLimit, heavyOperationRateLimiter, dosProtection } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // DoS protection check
    const dosCheck = dosProtection.checkRequest(request)
    if (dosCheck.blocked) {
      return NextResponse.json(
        { error: 'Request blocked', reason: dosCheck.reason },
        { status: 403 }
      )
    }

    // Rate limiting check
    const rateLimitChecker = withRateLimit(heavyOperationRateLimiter)
    const { response: rateLimitResponse, info: rateLimitInfo } = rateLimitChecker.check(request)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Get the user from the session
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate request body with comprehensive input validation
    const { data: validatedData, error: validationError } = await validateRequest(
      request,
      cloneSchemas.create
    )

    if (validationError) {
      logSecureError(
        new Error(`Clone API validation failed: ${validationError}`),
        {
          userId: session.user.id,
          endpoint: '/api/clone',
          userAgent: request.headers.get('user-agent') || undefined
        },
        {
          validationError,
          hasBody: true
        }
      )
      
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationError 
      }, { status: 400 })
    }

    if (!validatedData) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    const { url, name, description, settings } = validatedData

    // Validate URL for security (prevent SSRF)
    const urlValidation = validateURLSecurity(url)
    if (!urlValidation.isValid) {
      return NextResponse.json({ 
        error: 'URL validation failed', 
        reason: urlValidation.reason 
      }, { status: 400 })
    }

    // Sanitize URL for external request
    const { url: sanitizedUrl, error: sanitizeError } = sanitizeExternalURL(url)
    if (!sanitizedUrl) {
      return NextResponse.json({ 
        error: 'URL sanitization failed', 
        reason: sanitizeError 
      }, { status: 400 })
    }

    // Create project in database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: session.user.id,
        name,
        description,
        original_url: sanitizedUrl,
        status: 'pending',
        progress: 0,
        clone_settings: settings || {}
      })
      .select()
      .single()

    if (projectError) {
      console.error('Database error:', projectError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Start the cloning process (integrate with WebHarvest backend)
    try {
      // Call our existing WebHarvest scraper with secure options
      const webharvest_url = process.env.WEBHARVEST_API_URL || 'http://localhost:8001'
      
      // Validate WebHarvest URL for security
      const webharvest_validation = validateURLSecurity(webharvest_url)
      if (!webharvest_validation.isValid) {
        console.error('WebHarvest URL validation failed:', webharvest_validation.reason)
        throw new Error('WebHarvest API URL is not secure')
      }
      
      const secureOptions = getSecureRequestOptions()
      
      const cloneResponse = await fetch(`${webharvest_url}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHARVEST_API_KEY}`,
          ...secureOptions.headers,
        },
        body: JSON.stringify({
          url: sanitizedUrl, // Use sanitized URL
          formats: ['markdown', 'html'],
          includeLinks: true,
          excludeTags: ['script', 'style'],
          includeTags: [],
          onlyMainContent: false,
          timeout: secureOptions.timeout,
          waitFor: 1000
        }),
        redirect: secureOptions.redirect
      })

      if (cloneResponse.ok) {
        // Update project status to cloning
        await supabase
          .from('projects')
          .update({ status: 'cloning', progress: 25 })
          .eq('id', project.id)

        const cloneData = await cloneResponse.json()
        
        // Create initial clone record
        await supabase
          .from('clones')
          .insert({
            project_id: project.id,
            name: `${name} v1`,
            version: 1,
            clone_data: cloneData,
            size_bytes: JSON.stringify(cloneData).length
          })

        // Update to completed status
        await supabase
          .from('projects')
          .update({ status: 'completed', progress: 100 })
          .eq('id', project.id)

      } else {
        // Update status to failed
        await supabase
          .from('projects')
          .update({ status: 'failed' })
          .eq('id', project.id)
      }
    } catch (error) {
      console.error('Cloning error:', error)
      
      // Update status to failed
      await supabase
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id)
    }

    const response = NextResponse.json({ 
      success: true, 
      project: {
        id: project.id,
        name: project.name,
        url: project.original_url,
        status: project.status
      }
    })

    // Add rate limit headers
    return rateLimitChecker.addHeaders(response, rateLimitInfo)

  } catch (error) {
    console.error('Clone API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}