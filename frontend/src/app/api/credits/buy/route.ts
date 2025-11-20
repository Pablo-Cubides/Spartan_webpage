import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const idToken = auth.split('Bearer ')[1]
    const decoded = await verifyIdToken(idToken)
    const uid = decoded.uid

    const body = await request.json()
    const packageId = body.package_id
    const back_urls = body.back_urls || { success: '', failure: '' }

    const pack = await prisma.creditPackage.findUnique({ where: { id: packageId } })
    if (!pack) return NextResponse.json({ error: 'package_not_found' }, { status: 404 })

    // Create purchase record (pending)
    const user = await prisma.user.findUnique({ where: { uid } })
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })

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

    // Call internal preference creation route
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/payments/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ title: pack.name, quantity: 1, unit_price: pack.price }],
        back_urls,
        external_reference: String(purchase.id),
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: 'preference_error', details: data }, { status: 502 })
    }

    // Try to update purchase with payment id
    const preference = data.preference || {}
    const paymentId = preference.id || preference.response?.id || null
    if (paymentId) {
      await prisma.purchase.update({ where: { id: purchase.id }, data: { payment_id: String(paymentId) } })
    }

    return NextResponse.json({ purchase, preference })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'internal_error', details: (err as Error).message }, { status: 500 })
  }
}
