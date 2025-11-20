import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const object_key = body.object_key
    if (!object_key) return NextResponse.json({ error: 'missing_object_key' }, { status: 400 })

    const auth = request.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const idToken = auth.split('Bearer ')[1]

    const decoded = await verifyIdToken(idToken)
    const uid = decoded.uid as string

    // Update user's avatar_id in DB
    const user = await prisma.user.findUnique({ where: { uid } })
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })

    await prisma.user.update({ where: { uid }, data: { avatar_id: object_key, updated_at: new Date() } })

    // Build a public avatar URL if possible
    const r2Endpoint = process.env.R2_ENDPOINT || ''
    const bucket = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || ''
    let avatar_url = ''
    if (r2Endpoint && bucket) {
      const endpoint = r2Endpoint.replace(/\/$/, '')
      avatar_url = `${endpoint}/${bucket}/${object_key}`
    }

    return NextResponse.json({ avatar_id: object_key, avatar_url })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'confirm_error', details: (err as Error).message }, { status: 500 })
  }
}
