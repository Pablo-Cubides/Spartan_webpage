import { NextResponse } from 'next/server'

type Item = { title: string; quantity: number; unit_price: number }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items: Item[] = body.items || []
    const back_urls = body.back_urls || {}
    const external_reference = body.external_reference

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!mpToken) {
      return NextResponse.json({ error: 'MercadoPago token not configured' }, { status: 500 })
    }

    const preferencePayload = {
      items: items.map(i => ({ title: i.title, quantity: i.quantity, unit_price: i.unit_price })),
      back_urls,
      external_reference,
    }

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpToken}`,
      },
      body: JSON.stringify(preferencePayload),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: 'MercadoPago error', details: data }, { status: 502 })
    }

    return NextResponse.json({ preference: data })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'internal_error', details: (err as Error).message }, { status: 500 })
  }
}
