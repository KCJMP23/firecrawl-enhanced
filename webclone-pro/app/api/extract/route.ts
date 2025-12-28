import { NextRequest, NextResponse } from 'next/server'
import { designExtractor } from '@/lib/scraper/design-extractor'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url, options } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check credits (mock for now)
    const creditsRequired = options?.extractionType === 'enterprise' ? 10 
                          : options?.extractionType === 'full-remix' ? 5
                          : options?.extractionType === 'animations' ? 3
                          : 1

    // Start extraction
    console.log(`📊 Starting extraction for: ${url}`)
    console.log(`📊 Extraction type: ${options?.extractionType || 'design-only'}`)
    console.log(`📊 Credits required: ${creditsRequired}`)

    // Initialize extractor
    await designExtractor.init()

    // Extract design system
    const designSystem = await designExtractor.extract(url)

    // Get screenshot
    const screenshot = await designExtractor.extractScreenshot(url)

    // Clean up
    await designExtractor.close()

    // Create project record (mock for now)
    const projectId = `project_${Date.now()}`
    const project = {
      id: projectId,
      name: new URL(url).hostname.replace('www.', '') + ' Design System',
      type: 'website' as const,
      original_url: url,
      design_system: designSystem,
      thumbnail: screenshot,
      status: 'ready' as const,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      owner_id: session.user.id,
      credits_used: creditsRequired
    }

    // In production, save to database:
    // const { data, error } = await supabase
    //   .from('projects')
    //   .insert(project)
    //   .select()
    //   .single()

    return NextResponse.json({
      success: true,
      project,
      designSystem,
      screenshot,
      creditsUsed: creditsRequired
    })

  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract design system', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      // Return list of projects (mock for now)
      const projects = [
        {
          id: '1',
          name: 'Apple.com Design System',
          type: 'website',
          original_url: 'https://www.apple.com',
          status: 'ready',
          created_at: new Date().toISOString(),
          credits_used: 5
        }
      ]
      
      return NextResponse.json({ projects })
    }

    // Return specific project (mock for now)
    const project = {
      id: projectId,
      name: 'Apple.com Design System',
      type: 'website',
      original_url: 'https://www.apple.com',
      design_system: {},
      status: 'ready',
      created_at: new Date().toISOString()
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}