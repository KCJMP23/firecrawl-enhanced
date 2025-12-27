import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFProcessor } from '@/lib/pdf-processor'
import { AICostOptimizer } from '@/lib/ai-cost-optimizer'
import { validateFileType, sanitizeInput } from '@/lib/validation'
import { logSecureError } from '@/lib/secure-logger'
import { withRateLimit, uploadRateLimiter, dosProtection } from '@/lib/rate-limiter'

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

    // Rate limiting check for file uploads
    const rateLimitChecker = withRateLimit(uploadRateLimiter)
    const { response: rateLimitResponse, info: rateLimitInfo } = rateLimitChecker.check(request)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Comprehensive file validation
    try {
      // 1. Basic file properties validation
      if (!file.name || file.name.length > 255) {
        return NextResponse.json({ 
          error: 'Invalid filename. Must be 1-255 characters long' 
        }, { status: 400 })
      }

      // 2. Sanitize filename to prevent path traversal
      const sanitizedFilename = sanitizeInput(file.name)
      if (sanitizedFilename !== file.name) {
        return NextResponse.json({ 
          error: 'Filename contains invalid characters' 
        }, { status: 400 })
      }

      // 3. Check file extension
      const allowedExtensions = ['.pdf']
      const fileExtension = file.name.toLowerCase().split('.').pop()
      if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
        return NextResponse.json({ 
          error: 'Invalid file extension. Only PDF files are allowed' 
        }, { status: 400 })
      }

      // 4. Validate MIME type
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ 
          error: 'Invalid file type. Only PDF files are allowed' 
        }, { status: 400 })
      }

      // 5. Check file size limits
      const maxSize = 50 * 1024 * 1024 // 50MB
      const minSize = 100 // 100 bytes minimum
      
      if (file.size < minSize) {
        return NextResponse.json({ 
          error: 'File is too small. Minimum size is 100 bytes' 
        }, { status: 400 })
      }
      
      if (file.size > maxSize) {
        return NextResponse.json({ 
          error: 'File is too large. Maximum size is 50MB' 
        }, { status: 400 })
      }

      // 6. Magic number validation (most critical security check)
      const buffer = await file.arrayBuffer()
      const isValidPDF = validateFileType(buffer, 'application/pdf')
      
      if (!isValidPDF) {
        // Log potential security threat
        logSecureError(
          new Error('File upload attempted with invalid PDF magic number'),
          {
            userId: session.user.id,
            endpoint: '/api/pdf/upload',
            userAgent: request.headers.get('user-agent') || undefined
          },
          {
            filename: sanitizedFilename,
            fileSize: file.size,
            mimeType: file.type,
            magicNumberValidation: 'failed'
          }
        )
        
        return NextResponse.json({ 
          error: 'File appears to be corrupted or is not a valid PDF' 
        }, { status: 400 })
      }

    } catch (validationError) {
      logSecureError(
        validationError as Error,
        {
          userId: session.user.id,
          endpoint: '/api/pdf/upload',
          userAgent: request.headers.get('user-agent') || undefined
        },
        {
          context: 'File validation error',
          filename: file.name,
          fileSize: file.size
        }
      )
      
      return NextResponse.json({ 
        error: 'File validation failed' 
      }, { status: 400 })
    }

    // Check user's plan limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', session.user.id)
      .single()

    const planLimits = {
      starter: 10, // 10 documents per month
      pro: 100,
      enterprise: 1000
    }

    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    const { data: monthlyUploads } = await supabase
      .from('pdf_documents')
      .select('id')
      .eq('userId', session.user.id)
      .gte('uploadedAt', `${currentMonth}-01`)
      .lt('uploadedAt', `${currentMonth}-32`)

    const uploadCount = monthlyUploads?.length || 0
    const limit = planLimits[profile?.plan as keyof typeof planLimits] || planLimits.starter

    if (uploadCount >= limit) {
      return NextResponse.json({
        error: `Monthly upload limit reached (${limit} documents). Please upgrade your plan.`
      }, { status: 429 })
    }

    // Get user tier for cost optimization
    const userTier = (profile as any)?.subscription_tier || 'starter'
    
    // Initialize cost optimizer
    const costOptimizer = new AICostOptimizer()
    
    // Process the PDF with cost optimization
    const processor = new PDFProcessor(costOptimizer)
    const document = await processor.processPDF(file, session.user.id)

    // Track usage and costs
    const documentWithUsage = document as any
    if (documentWithUsage.tokensUsed || documentWithUsage.cost) {
      await supabase
        .from('usage_analytics')
        .insert({
          user_id: session.user.id,
          feature: 'pdf-processing',
          tokens_used: documentWithUsage.tokensUsed || 0,
          cost: documentWithUsage.cost || 0,
          credits_used: costOptimizer.convertCostToCredits(documentWithUsage.cost || 0, userTier as any),
          created_at: new Date().toISOString()
        })
    }

    const response = NextResponse.json({ 
      success: true, 
      document: {
        id: document.id,
        filename: document.filename,
        status: document.status,
        uploadedAt: document.uploadedAt,
        tokensUsed: documentWithUsage.tokensUsed,
        cost: documentWithUsage.cost,
        creditsUsed: documentWithUsage.creditsUsed
      }
    })

    // Add rate limit headers
    return rateLimitChecker.addHeaders(response, rateLimitInfo)

  } catch (error) {
    // Securely log the error without exposing sensitive information
    const errorDetails = logSecureError(
      error as Error,
      {
        endpoint: '/api/pdf/upload',
        userAgent: request.headers.get('user-agent') || undefined
      },
      {
        context: 'PDF upload processing error'
      }
    )

    return NextResponse.json(
      { 
        error: 'Upload processing failed',
        errorId: errorDetails.errorId 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const processor = new PDFProcessor()
    const documents = await processor.getUserDocuments(session.user.id)

    return NextResponse.json({ documents })

  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}