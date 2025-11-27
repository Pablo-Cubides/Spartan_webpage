import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'
import { BuyCreditSchema } from '@/lib/validation/schemas'
import { withErrorHandler, AuthenticationError, NotFoundError, parseJsonBody } from '@/lib/api/error-handler'

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
  const body = await parseJsonBody(request, BuyCreditSchema)
  const packageId = body.package_id
  const back_urls = body.back_urls || { success: '', failure: '' }

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
      payment_method: 'mercadopago',
      status: 'pending',
    },
  })

  // Create preference directly using server library
  const { createPreference } = await import('@/lib/server/mercadopago');
  
  const preferenceData = await createPreference(
    [{ title: pack.name, quantity: 1, unit_price: pack.price }],
    back_urls,
    String(purchase.id)
  );

  // Try to update purchase with payment id
  const paymentId = preferenceData.id || preferenceData.response?.id || null
  if (paymentId) {
    await prisma.purchase.update({ where: { id: purchase.id }, data: { payment_id: String(paymentId) } })
  }

  return NextResponse.json({ purchase, preference: preferenceData })
}

export const POST = withErrorHandler(handler)
