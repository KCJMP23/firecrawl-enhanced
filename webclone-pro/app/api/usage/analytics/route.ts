import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const feature = searchParams.get('feature')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    let query = supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (feature) {
      query = query.eq('feature', feature)
    }

    const { data: analytics, error } = await query

    if (error) {
      console.error('Analytics query error:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Aggregate data by day
    const dailyUsage = analytics.reduce((acc: any[], record) => {
      const date = record.created_at.split('T')[0]
      const existing = acc.find(item => item.date === date)
      
      if (existing) {
        existing.tokens += record.tokens_used
        existing.cost += record.cost
        existing.credits += record.credits_used
      } else {
        acc.push({
          date,
          tokens: record.tokens_used,
          cost: record.cost,
          credits: record.credits_used,
          feature: record.feature
        })
      }
      
      return acc
    }, [])

    // Calculate feature breakdown
    const featureBreakdown = analytics.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.feature]) {
        acc[record.feature] = {
          tokens: 0,
          cost: 0,
          credits: 0,
          count: 0
        }
      }
      
      acc[record.feature].tokens += record.tokens_used
      acc[record.feature].cost += record.cost
      acc[record.feature].credits += record.credits_used
      acc[record.feature].count += 1
      
      return acc
    }, {})

    // Calculate totals
    const totals = analytics.reduce((acc, record) => {
      acc.tokens += record.tokens_used
      acc.cost += record.cost
      acc.credits += record.credits_used
      return acc
    }, { tokens: 0, cost: 0, credits: 0 })

    return NextResponse.json({
      success: true,
      data: {
        dailyUsage,
        featureBreakdown,
        totals,
        period: parseInt(period),
        recordCount: analytics.length
      }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analytics failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { feature, tokens_used, cost, credits_used, metadata } = body

    if (!feature) {
      return NextResponse.json({ error: 'Feature is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('usage_analytics')
      .insert({
        user_id: session.user.id,
        feature,
        tokens_used: tokens_used || 0,
        cost: cost || 0,
        credits_used: credits_used || 0,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Usage tracking error:', error)
      return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Usage tracking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Usage tracking failed' },
      { status: 500 }
    )
  }
}