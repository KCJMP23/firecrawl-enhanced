import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Liveblocks } from '@liveblocks/node'
import { generateUserColor } from '@/lib/liveblocks'

// Initialize Liveblocks server client
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { room } = await request.json()

    // Check if user has access to this room/project
    const projectId = room.replace('project-', '')
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, project_members!inner(*)')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      )
    }

    // Get user's role in the project
    const member = project.project_members.find(
      (m: any) => m.user_id === session.user.id
    )
    
    const role = member?.role || 'viewer'

    // Create Liveblocks session
    const liveblocksSession = liveblocks.prepareSession(session.user.id, {
      userInfo: {
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Anonymous',
        email: session.user.email || '',
        avatar: session.user.user_metadata?.avatar_url || '',
        role
      }
    })

    // Grant appropriate permissions based on role
    if (role === 'owner' || role === 'editor') {
      liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS)
    } else {
      // Viewers can only read and update presence
      liveblocksSession.allow(room, ['room:read', 'room:presence:write'])
    }

    const { body, status } = await liveblocksSession.authorize()
    
    return new Response(body, { status })
  } catch (error) {
    console.error('Collaboration auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}