import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createOrRetrieveCustomer, 
  createCheckoutSession,
  PRICING_PLANS 
} from '@/lib/stripe'

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

    const body = await request.json()
    const { planId } = body

    // Validate plan
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const customer = await createOrRetrieveCustomer({
      email: session.user.email!,
      userId: session.user.id,
      name: session.user.user_metadata?.full_name
    })

    // Create checkout session
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    if (!customer?.id) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }
    
    const checkoutSession = await createCheckoutSession({
      customerId: customer.id,
      priceId: plan.priceId,
      successUrl: `${origin}/dashboard?success=true&plan=${planId}`,
      cancelUrl: `${origin}/pricing?canceled=true`,
      userId: session.user.id,
      planId
    })

    // Store intent in database
    await supabase.from('payment_intents').insert({
      user_id: session.user.id,
      stripe_customer_id: customer.id,
      stripe_session_id: checkoutSession.id,
      plan_id: planId,
      status: 'pending'
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}