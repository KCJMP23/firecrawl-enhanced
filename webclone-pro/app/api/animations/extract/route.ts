import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, projectId, options = {} } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract animations using our animation extraction engine
    const animations = await extractAnimations(url, options)

    // Store extracted animations
    if (projectId) {
      await supabase
        .from('project_animations')
        .insert({
          project_id: projectId,
          user_id: session.user.id,
          animations: animations,
          extracted_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      animations: animations,
      stats: {
        total: animations.length,
        byLibrary: groupAnimationsByLibrary(animations),
        complexity: calculateComplexity(animations)
      }
    })
  } catch (error) {
    console.error('Animation extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract animations' },
      { status: 500 }
    )
  }
}

async function extractAnimations(url: string, options: any) {
  // This would integrate with Puppeteer/Playwright for real extraction
  // For now, returning mock data showcasing our capabilities
  
  return [
    {
      id: 'anim_1',
      type: 'gsap',
      library: 'GSAP',
      name: 'Hero Timeline',
      duration: 2000,
      properties: ['opacity', 'transform', 'scale'],
      complexity: 'moderate',
      code: `gsap.timeline()
        .to('.hero', { opacity: 1, duration: 1 })
        .to('.hero-text', { y: 0, duration: 0.8 }, '-=0.5')`,
      convertible: ['framer-motion', 'css', 'anime-js']
    },
    {
      id: 'anim_2',
      type: 'css',
      library: 'CSS',
      name: 'Fade In Animation',
      duration: 500,
      properties: ['opacity'],
      complexity: 'simple',
      code: `@keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }`,
      convertible: ['all']
    },
    {
      id: 'anim_3',
      type: 'framer-motion',
      library: 'Framer Motion',
      name: 'Card Hover Effect',
      duration: 300,
      properties: ['scale', 'boxShadow'],
      complexity: 'simple',
      code: `whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}`,
      convertible: ['gsap', 'css', 'motion-one']
    },
    {
      id: 'anim_4',
      type: 'lottie',
      library: 'Lottie',
      name: 'Loading Animation',
      duration: 1500,
      properties: ['path', 'fill'],
      complexity: 'complex',
      code: 'lottie.json',
      convertible: ['css', 'gsap']
    }
  ]
}

function groupAnimationsByLibrary(animations: any[]) {
  return animations.reduce((acc, anim) => {
    acc[anim.library] = (acc[anim.library] || 0) + 1
    return acc
  }, {})
}

function calculateComplexity(animations: any[]) {
  const complexityScores = {
    simple: 1,
    moderate: 2,
    complex: 3
  }
  
  const avgScore = animations.reduce((sum, anim) => 
    sum + (complexityScores[anim.complexity as keyof typeof complexityScores] || 1), 0) / animations.length
  
  if (avgScore <= 1.5) return 'simple'
  if (avgScore <= 2.5) return 'moderate'
  return 'complex'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID is required' },
      { status: 400 }
    )
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_animations')
    .select('*')
    .eq('project_id', projectId)
    .single()
  
  if (error) {
    return NextResponse.json(
      { error: 'Animations not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    animations: data.animations,
    extractedAt: data.extracted_at
  })
}