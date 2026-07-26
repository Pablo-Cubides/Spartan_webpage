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
 * Get current USD to COP exchange rate from environment or fallback default
 */
export function getUsdCopExchangeRate(): number {
  const envRate = parseFloat(process.env.USD_COP_EXCHANGE_RATE || '');
  return !isNaN(envRate) && envRate > 0 ? envRate : 4000;
}

/**
 * Convert COP to USD cents
 * Using configurable exchange rate (USD_COP_EXCHANGE_RATE)
 */
export function copToUsdCents(copAmount: number): number {
  const exchangeRate = getUsdCopExchangeRate();
  const usdAmount = copAmount / exchangeRate;
  return Math.round(usdAmount * 100); // Convert to cents
}

/**
 * Get display price in USD from COP
 */
export function copToUsdDisplay(copAmount: number): string {
  const exchangeRate = getUsdCopExchangeRate();
  const usdAmount = copAmount / exchangeRate;
  return usdAmount.toFixed(2);
}
