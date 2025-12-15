import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured - Stripe payments will not work')
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      typescript: true,
    })
  : null

export type CheckoutItem = {
  name: string
  description?: string
  amount: number // Amount in cents (for USD) or smallest currency unit
  quantity: number
  currency: string
}

export type CheckoutUrls = {
  success: string
  cancel: string
}

/**
 * Create a Stripe Checkout Session for credit purchase
 */
export async function createCheckoutSession(
  items: CheckoutItem[],
  urls: CheckoutUrls,
  metadata: Record<string, string>
): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
    price_data: {
      currency: item.currency,
      product_data: {
        name: item.name,
        description: item.description,
      },
      unit_amount: item.amount,
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: urls.success,
    cancel_url: urls.cancel,
    metadata,
  })

  return session
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return null
  }
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  try {
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('Failed to retrieve checkout session:', err)
    return null
  }
}

/**
 * Convert COP to USD cents
 * Using approximate exchange rate (can be made dynamic later)
 */
export function copToUsdCents(copAmount: number): number {
  const exchangeRate = 4000 // 1 USD = ~4000 COP (approximate)
  const usdAmount = copAmount / exchangeRate
  return Math.round(usdAmount * 100) // Convert to cents
}

/**
 * Get display price in USD from COP
 */
export function copToUsdDisplay(copAmount: number): string {
  const usdAmount = copAmount / 4000
  return usdAmount.toFixed(2)
}
