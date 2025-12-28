import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const supabase = await createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        controller.enqueue(encoder.encode('data: {"error": "Unauthorized"}\n\n'))
        controller.close()
        return
      }

      // Send progress updates
      const updates = [
        { step: 1, status: 'connecting', message: 'Connecting to website...' },
        { step: 2, status: 'loading', message: 'Loading page content...' },
        { step: 3, status: 'extracting-colors', message: 'Extracting color palette...' },
        { step: 4, status: 'extracting-typography', message: 'Analyzing typography...' },
        { step: 5, status: 'extracting-layout', message: 'Capturing layout patterns...' },
        { step: 6, status: 'extracting-components', message: 'Identifying components...' },
        { step: 7, status: 'extracting-animations', message: 'Detecting animations...' },
        { step: 8, status: 'generating-screenshot', message: 'Generating screenshot...' },
        { step: 9, status: 'finalizing', message: 'Finalizing extraction...' },
        { step: 10, status: 'complete', message: 'Extraction complete!' }
      ]

      for (const update of updates) {
        const progress = (update.step / updates.length) * 100
        const data = JSON.stringify({
          ...update,
          progress,
          timestamp: new Date().toISOString()
        })
        
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      controller.close()
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}