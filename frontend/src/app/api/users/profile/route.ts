import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const idToken = auth.split('Bearer ')[1]
    const decoded = await verifyIdToken(idToken)
    const uid = decoded.uid

    const user = await prisma.user.findUnique({ where: { uid } })
    return NextResponse.json({ user })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'unauthorized', details: (err as Error).message }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const idToken = auth.split('Bearer ')[1]
    const decoded = await verifyIdToken(idToken)
    const uid = decoded.uid

    const body = await request.json()
    const data = {
      email: body.email,
      name: body.name,
      alias: body.alias,
      avatar_id: body.avatar_id,
    }

    const user = await prisma.user.upsert({
      where: { uid },
      update: data,
      create: { 
        uid, 
        ...data,
        credits: 2 // Give 2 free credits on first signup
      },
    })

    return NextResponse.json({ user })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'error_updating', details: (err as Error).message }, { status: 500 })
  }
}
