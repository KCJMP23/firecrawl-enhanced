import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with subscription details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, credits_balance, credits_used_this_month, subscription_reset_date')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Profile query error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Get subscription tier details
    const tierLimits = {
      starter: { monthlyCredits: 1000, price: 29 },
      pro: { monthlyCredits: 5000, price: 79 },
      enterprise: { monthlyCredits: 15000, price: 199 }
    }

    const tier = profile?.subscription_tier || 'starter'
    const tierInfo = tierLimits[tier as keyof typeof tierLimits]
    
    // Calculate current month usage
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    
    const { data: monthlyUsage, error: usageError } = await supabase
      .from('usage_analytics')
      .select('credits_used')
      .eq('user_id', session.user.id)
      .gte('created_at', `${currentMonth}-01`)
      .lt('created_at', `${currentMonth}-32`)

    if (usageError) {
      console.error('Usage query error:', usageError)
    }

    const totalCreditsUsed = monthlyUsage?.reduce((sum, record) => sum + (record.credits_used || 0), 0) || 0
    const remainingCredits = Math.max(0, tierInfo.monthlyCredits - totalCreditsUsed)
    
    // Calculate reset date (first day of next month)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)
    nextMonth.setHours(0, 0, 0, 0)

    const balance = {
      tier,
      totalCredits: tierInfo.monthlyCredits,
      usedCredits: totalCreditsUsed,
      remainingCredits,
      resetDate: nextMonth.toISOString(),
      purchasedCredits: profile?.credits_balance || 0,
      monthlyPrice: tierInfo.price
    }

    return NextResponse.json({
      success: true,
      balance
    })

  } catch (error) {
    console.error('Credit balance error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch credit balance' },
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
    const { amount, operation } = body // operation: 'add' | 'deduct'

    if (!amount || !operation) {
      return NextResponse.json({ error: 'Amount and operation are required' }, { status: 400 })
    }

    if (operation === 'add') {
      // Add credits (from purchase)
      // First get current balance
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', session.user.id)
        .single()

      const newBalance = (currentProfile?.credits_balance || 0) + amount
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          credits_balance: newBalance
        })
        .eq('id', session.user.id)
        .select('credits_balance')
        .single()

      if (error) {
        console.error('Credit addition error:', error)
        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        newBalance: data.credits_balance,
        message: `${amount} credits added successfully`
      })

    } else if (operation === 'deduct') {
      // Deduct credits (from usage)
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.credits_balance < amount) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          credits_balance: profile.credits_balance - amount
        })
        .eq('id', session.user.id)
        .select('credits_balance')
        .single()

      if (error) {
        console.error('Credit deduction error:', error)
        return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        newBalance: data.credits_balance,
        message: `${amount} credits deducted successfully`
      })
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })

  } catch (error) {
    console.error('Credit operation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Credit operation failed' },
      { status: 500 }
    )
  }
}