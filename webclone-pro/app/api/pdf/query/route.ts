import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFProcessor } from '@/lib/pdf-processor'
import { AICostOptimizer } from '@/lib/ai-cost-optimizer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, documentIds } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (query.length > 1000) {
      return NextResponse.json({ error: 'Query too long (max 1000 characters)' }, { status: 400 })
    }

    // Check rate limiting
    const rateLimitKey = `query_${session.user.id}`
    // In a real implementation, you'd use Redis or similar for rate limiting

    // Get user tier for cost optimization
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single()

    const userTier = profile?.subscription_tier || 'starter'
    
    // Initialize cost optimizer
    const costOptimizer = new AICostOptimizer()
    
    const processor = new PDFProcessor(costOptimizer)
    const result = await processor.queryDocuments(query, session.user.id, documentIds)

    // Track usage and costs
    const resultWithUsage = result as any
    if (resultWithUsage.tokensUsed || resultWithUsage.cost) {
      await supabase
        .from('usage_analytics')
        .insert({
          user_id: session.user.id,
          feature: 'pdf-query',
          tokens_used: resultWithUsage.tokensUsed || 0,
          cost: resultWithUsage.cost || 0,
          credits_used: costOptimizer.convertCostToCredits(resultWithUsage.cost || 0, userTier as any),
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ 
      success: true,
      result: {
        answer: result.answer,
        sources: result.sources,
        relevanceScore: result.relevanceScore,
        chunksFound: result.chunks.length,
        tokensUsed: resultWithUsage.tokensUsed,
        cost: resultWithUsage.cost,
        creditsUsed: resultWithUsage.creditsUsed
      }
    })

  } catch (error) {
    console.error('PDF query error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 }
    )
  }
}