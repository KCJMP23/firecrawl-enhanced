import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { validateWebhookSignature, PRICING_PLANS } from '@/lib/stripe'
import { logSecureError, logPaymentEvent, sanitizeStripeEvent, sanitizeWebhookError } from '@/lib/secure-logger'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    // Validate webhook signature
    const event = validateWebhookSignature(body, signature, webhookSecret) as Stripe.Event

    const supabase = await createClient()

    // Log the webhook event securely (without sensitive data)
    logPaymentEvent(
      event.type, 
      event.id, 
      sanitizeStripeEvent(event),
      {
        endpoint: '/api/stripe/webhook',
        userAgent: headersList.get('user-agent') || undefined
      }
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        try {
          const session = event.data.object as Stripe.Checkout.Session
          const { userId, planId } = session.metadata!

          if (!userId || !planId) {
            throw new Error('Missing required metadata in checkout session')
          }

          // Update user subscription in database
          const { error: subscriptionError } = await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan_id: planId,
            status: 'active',
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancel_at_period_end: false
          })

          if (subscriptionError) {
            throw new Error(`Failed to update subscription: ${subscriptionError.message}`)
          }

          // Update payment intent status
          const { error: paymentError } = await supabase
            .from('payment_intents')
            .update({ status: 'completed' })
            .eq('stripe_session_id', session.id)

          if (paymentError) {
            logSecureError(
              new Error('Failed to update payment intent'),
              { userId, sessionId: session.id },
              { error: paymentError.message }
            )
          }

          // Grant bundled credits based on plan
          const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS]
          if (plan) {
            const { error: creditsError } = await supabase.from('user_credits').upsert({
              user_id: userId,
              backend_credits: plan.limits.bundledCredits,
              credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            })

            if (creditsError) {
              logSecureError(
                new Error('Failed to grant credits'),
                { userId },
                { error: creditsError.message }
              )
            }
          }
        } catch (caseError) {
          logSecureError(
            caseError,
            {},
            { sessionId: event.data.object.id }
          )
        }
        
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000),
            current_period_end: new Date((subscription as any).current_period_end * 1000),
            cancel_at_period_end: (subscription as any).cancel_at_period_end
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date()
          })
          .eq('stripe_subscription_id', subscription.id)

        // Revoke credits
        await supabase
          .from('user_credits')
          .update({
            backend_credits: 0
          })
          .eq('user_id', userId)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string

        // Log successful payment
        await supabase.from('payment_history').insert({
          stripe_invoice_id: invoice.id,
          stripe_subscription_id: subscriptionId,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'paid',
          paid_at: new Date(invoice.status_transitions.paid_at! * 1000)
        })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string

        // Update subscription status
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due'
          })
          .eq('stripe_subscription_id', subscriptionId)

        // Log failed payment
        await supabase.from('payment_history').insert({
          stripe_invoice_id: invoice.id,
          stripe_subscription_id: subscriptionId,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          failed_at: new Date()
        })

        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        // Send trial ending notification (implement email service)
        console.log(`Trial ending soon for user ${userId}`)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    // Securely log the webhook error without exposing sensitive data
    const errorDetails = logSecureError(
      error,
      {
        endpoint: '/api/stripe/webhook',
        userAgent: (await headers()).get('user-agent') || undefined
      },
      {
        webhookError: sanitizeWebhookError(error, (await headers()).get('stripe-signature') || undefined)
      }
    )

    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        errorId: errorDetails.errorId // Include error ID for tracking
      },
      { status: 400 }
    )
  }
}

// Next.js 16+ doesn't need bodyParser config for Stripe webhooks
// The raw body is now automatically available