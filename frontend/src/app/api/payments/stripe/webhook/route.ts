import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { stripe, verifyWebhookSignature } from '@/lib/server/stripe'
import sendTemplateEmail from '@/lib/server/email'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripe) {
      console.error('[Stripe Webhook] Stripe not configured')
      return NextResponse.json({ error: 'stripe_not_configured' }, { status: 500 })
    }

    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event: Stripe.Event | null = null

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      event = verifyWebhookSignature(body, signature, webhookSecret)

      if (!event) {
        console.warn('[Stripe Webhook] Invalid signature')
        return NextResponse.json({ error: 'invalid_signature' }, { status: 403 })
      }
    } else {
      // In development/testing, parse without verification
      // WARNING: Do not do this in production!
      console.warn('[Stripe Webhook] No webhook secret configured - skipping signature verification')
      try {
        event = JSON.parse(body) as Stripe.Event
      } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
      }
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('[Stripe Webhook] Checkout session completed:', session.id)

        // Get metadata
        const purchaseId = session.metadata?.purchase_id
        const credits = session.metadata?.credits

        if (!purchaseId) {
          console.error('[Stripe Webhook] No purchase_id in metadata')
          return NextResponse.json({ error: 'missing_purchase_id' }, { status: 400 })
        }

        // Find the purchase
        const purchase = await prisma.purchase.findUnique({
          where: { id: Number(purchaseId) },
          include: { user: true }
        })

        if (!purchase) {
          console.error('[Stripe Webhook] Purchase not found:', purchaseId)
          return NextResponse.json({ error: 'purchase_not_found' }, { status: 404 })
        }

        // Only process if not already completed
        if (purchase.status !== 'completed') {
          // Update purchase status
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'completed',
              completed_at: new Date(),
              payment_id: session.id,
            }
          })

          // Add credits to user
          if (purchase.user_id && purchase.credits_received > 0) {
            await prisma.user.update({
              where: { id: purchase.user_id },
              data: { credits: { increment: purchase.credits_received } }
            })
            console.log(`[Stripe Webhook] Added ${purchase.credits_received} credits to user ${purchase.user_id}`)
          }

          // Send confirmation email
          if (purchase.user?.email) {
            try {
              await sendTemplateEmail(
                purchase.user.email,
                1, // Template ID for purchase confirmation
                {
                  name: purchase.user.name || 'Usuario',
                  amount: purchase.amount_paid,
                  credits: credits || String(purchase.credits_received),
                }
              )
            } catch (emailErr) {
              console.error('[Stripe Webhook] Failed to send email:', emailErr)
              // Don't fail the webhook for email errors
            }
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('[Stripe Webhook] Payment failed:', paymentIntent.id)

        // Try to find and update the purchase
        const purchase = await prisma.purchase.findFirst({
          where: { payment_id: paymentIntent.id }
        })

        if (purchase && purchase.status !== 'completed') {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { status: 'failed' }
          })
        }

        break
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error('[Stripe Webhook] Error:', err)
    return NextResponse.json(
      { error: 'webhook_error', details: (err as Error).message },
      { status: 500 }
    )
  }
}
