import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { credits, amount } = body // credits: number of credits, amount: price in cents

    if (!credits || !amount) {
      return NextResponse.json({ error: 'Credits and amount are required' }, { status: 400 })
    }

    // Validate credit packages
    const validPackages = [
      { credits: 1000, amount: 2900 },   // $29.00
      { credits: 5000, amount: 9900 },   // $99.00 (save $46)
      { credits: 15000, amount: 19900 }  // $199.00 (save $236)
    ]

    const isValidPackage = validPackages.some(pkg => 
      pkg.credits === credits && pkg.amount === amount
    )

    if (!isValidPackage) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 })
    }

    // Get user profile for customer info
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', session.user.id)
      .single()

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: session.user.email || profile?.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${credits.toLocaleString()} AI Credits`,
              description: 'WebClone Pro AI Credits for advanced features',
              images: ['https://your-domain.com/credits-icon.png']
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: session.user.id,
        credits: credits.toString(),
        type: 'credit_purchase'
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true&credits=${credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`
    })

    // Log the purchase attempt
    await supabase
      .from('credit_purchases')
      .insert({
        user_id: session.user.id,
        credits_amount: credits,
        price_amount: amount,
        stripe_session_id: checkoutSession.id,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Purchase failed' },
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

    // Get user's purchase history
    const { data: purchases, error } = await supabase
      .from('credit_purchases')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Purchase history error:', error)
      return NextResponse.json({ error: 'Failed to fetch purchase history' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      purchases
    })

  } catch (error) {
    console.error('Purchase history error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch purchase history' },
      { status: 500 }
    )
  }
}