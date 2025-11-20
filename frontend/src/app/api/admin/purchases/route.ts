import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const idToken = auth.split('Bearer ')[1]
    const decoded = await verifyIdToken(idToken)

    const email = decoded.email || ''
    if (!email.endsWith('@spartan.com') && email !== 'admin@spartan.com') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const purchases = await prisma.purchase.findMany({ orderBy: { created_at: 'desc' }, include: { user: true, package: true } })
    return NextResponse.json({ purchases })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'internal_error', details: (err as Error).message }, { status: 500 })
  }
}
