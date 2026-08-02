import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'
import { withErrorHandler, AuthenticationError, NotFoundError, parseJsonBody } from '@/lib/api/error-handler'
import { createCheckoutSession, copToUsdCents, copToUsdDisplay } from '@/lib/server/stripe'
import { z } from 'zod'

const BuyStripeSchema = z.object({
  package_id: z.number().int().positive(),
  back_urls: z.object({
    success: z.string().url(),
    cancel: z.string().url(),
  }),
})

const handler = async (request: NextRequest) => {
  // Verify authentication
  const auth = request.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header')
  }

  const idToken = auth.split('Bearer ')[1]
  let decoded
  try {
    decoded = await verifyIdToken(idToken)
  } catch {
    throw new AuthenticationError('Invalid or expired token')
  }

  const uid = decoded.uid

  // Parse and validate body
  const body = await parseJsonBody(request, BuyStripeSchema)
  const packageId = body.package_id
  const back_urls = body.back_urls

  // Fetch package
  const pack = await prisma.creditPackage.findUnique({ where: { id: packageId } })
  if (!pack) {
    throw new NotFoundError('Credit package')
  }

  // Fetch user
  const user = await prisma.user.findUnique({ where: { uid } })
  if (!user) {
    throw new NotFoundError('User')
  }

  // Create purchase record (pending)
  const purchase = await prisma.purchase.create({
    data: {
      user_id: user.id,
      package_id: pack.id,
      amount_paid: pack.price,
      credits_received: pack.credits,
      payment_method: 'stripe',
      status: 'pending',
    },
  })

  // Convert COP to USD cents for Stripe
  const amountInCents = copToUsdCents(pack.price)
  const usdDisplay = copToUsdDisplay(pack.price)

  // Create Stripe Checkout Session
  const session = await createCheckoutSession(
    [{
      name: pack.name,
      description: `${pack.credits} créditos para Triarvon Club (~$${usdDisplay} USD)`,
      amount: amountInCents,
      quantity: 1,
      currency: 'usd',
    }],
    {
      success: `${back_urls.success}?session_id={CHECKOUT_SESSION_ID}`,
      cancel: back_urls.cancel,
    },
    {
      purchase_id: String(purchase.id),
      user_id: String(user.id),
      package_id: String(pack.id),
      credits: String(pack.credits),
    }
  )

  if (!session) {
    throw new Error('Failed to create Stripe checkout session')
  }

  // Update purchase with Stripe session ID
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { payment_id: session.id },
  })

  return NextResponse.json({
    purchase,
    checkout_url: session.url,
    session_id: session.id,
  })
}

export const POST = withErrorHandler(handler)
