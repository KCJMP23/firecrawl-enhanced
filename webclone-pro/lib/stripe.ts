import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Pricing configuration - our competitive edge
export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    interval: 'month',
    features: [
      'Unlimited website clones',
      'Basic AI customization',
      '20+ framework exports',
      'Animation extraction',
      'Design DNA extraction',
      '$50 bundled backend credits',
      'Community support',
      '5 team members'
    ],
    limits: {
      teamMembers: 5,
      concurrentClones: 2,
      storageGB: 10,
      bundledCredits: 50
    },
    highlighted: false
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    interval: 'month',
    features: [
      'Everything in Starter',
      'Advanced AI models (Claude 3.5, GPT-4)',
      'Priority processing',
      'Affiliate site builder',
      'Animation marketplace access',
      '$100 bundled backend credits',
      'Priority support',
      '20 team members',
      'Real-time collaboration',
      'Chrome extension included'
    ],
    limits: {
      teamMembers: 20,
      concurrentClones: 5,
      storageGB: 50,
      bundledCredits: 100
    },
    highlighted: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    interval: 'month',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Dedicated infrastructure',
      'White-label options',
      'API priority access',
      '$150 bundled backend credits',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security features',
      'Custom AI model training'
    ],
    limits: {
      teamMembers: -1, // Unlimited
      concurrentClones: 20,
      storageGB: 500,
      bundledCredits: 150
    },
    highlighted: false
  }
}

// Create or retrieve a customer
export async function createOrRetrieveCustomer({
  email,
  userId,
  name
}: {
  email: string
  userId: string
  name?: string
}) {
  // First, try to retrieve existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId
    }
  })
}

// Create a checkout session for subscription
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId,
  planId
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  userId: string
  planId: string
}) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId
    },
    subscription_data: {
      trial_period_days: 14, // 14-day free trial
      metadata: {
        userId,
        planId
      }
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    tax_id_collection: {
      enabled: true
    }
  })
}

// Create a billing portal session
export async function createBillingPortalSession({
  customerId,
  returnUrl
}: {
  customerId: string
  returnUrl: string
}) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer']
  })
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  })
}

// Resume subscription
export async function resumeSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  })
}

// Update subscription
export async function updateSubscription({
  subscriptionId,
  newPriceId
}: {
  subscriptionId: string
  newPriceId: string
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId
      }
    ],
    proration_behavior: 'create_prorations'
  })
}

// Check if customer has active subscription
export async function hasActiveSubscription(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1
  })

  return subscriptions.data.length > 0
}

// Get usage for metered billing (for future implementation)
export async function reportUsage({
  subscriptionItemId,
  quantity,
  timestamp
}: {
  subscriptionItemId: string
  quantity: number
  timestamp?: number
}) {
  return await stripe.subscriptionItems.createUsageRecord(
    subscriptionItemId,
    {
      quantity,
      timestamp: timestamp || Math.floor(Date.now() / 1000)
    }
  )
}

// Validate webhook signature
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// Get customer's payment methods
export async function getPaymentMethods(customerId: string) {
  return await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card'
  })
}

// Set default payment method
export async function setDefaultPaymentMethod({
  customerId,
  paymentMethodId
}: {
  customerId: string
  paymentMethodId: string
}) {
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  })
}