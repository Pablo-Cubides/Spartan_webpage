import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import sendTemplateEmail from '@/lib/server/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // MercadoPago webhook: validate by fetching payment resource using access token
    const data = body?.data || body?.resource || body
    const paymentId = data?.id || data?.payment_id || body?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'missing_payment_id' }, { status: 400 })
    }

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!mpToken) return NextResponse.json({ error: 'mp_token_not_configured' }, { status: 500 })

    // Fetch payment details from MercadoPago to verify status
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    })
    const mpData = await mpRes.json()
    if (!mpRes.ok) {
      return NextResponse.json({ error: 'mp_verify_error', details: mpData }, { status: 502 })
    }

    const status = mpData.status || mpData.payment_status || mpData.status_detail
    const externalReference = mpData.external_reference

    let purchase = null
    if (externalReference) {
      purchase = await prisma.purchase.findUnique({
        where: { id: Number(externalReference) },
        include: { user: true }
      })
    }

    // Fallback: try to find by payment_id if external_reference didn't work
    if (!purchase) {
      purchase = await prisma.purchase.findFirst({
        where: { payment_id: String(paymentId) },
        include: { user: true }
      })
    }

    if (status === 'approved' || status === 'authorized' || status === 'paid') {
      if (purchase && purchase.status !== 'completed') {
        // Update purchase status
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { 
            status: 'completed', 
            completed_at: new Date(),
            payment_id: String(paymentId)
          }
        })

        // Add credits to user
        if (purchase.user_id && purchase.credits_received > 0) {
          await prisma.user.update({
            where: { id: purchase.user_id },
            data: { credits: { increment: purchase.credits_received } }
          })
        }
      }
    } else if (status === 'pending') {
      if (purchase) {
        await prisma.purchase.update({ 
          where: { id: purchase.id }, 
          data: { status: 'pending', payment_id: String(paymentId) } 
        })
      }
    } else {
      if (purchase) {
        await prisma.purchase.update({ 
          where: { id: purchase.id }, 
          data: { status: 'failed', payment_id: String(paymentId) } 
        })
      }
    }

    // Reload purchase to get latest data for email
    if (purchase) {
       purchase = await prisma.purchase.findUnique({ where: { id: purchase.id }, include: { user: true } })
    }

    if (purchase && purchase.user?.email && (status === 'approved' || status === 'paid')) {
      try {
        await sendTemplateEmail(purchase.user.email, 1, { name: purchase.user.name || 'Usuario', amount: purchase.amount_paid })
      } catch {
        // ignore send email errors
      }
    }

    return NextResponse.json({ ok: true, mp_status: status })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'webhook_error', details: (err as Error).message }, { status: 500 })
  }
}
