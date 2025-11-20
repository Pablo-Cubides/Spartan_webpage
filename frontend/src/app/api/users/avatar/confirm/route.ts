import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'
import { withErrorHandler, AuthenticationError, NotFoundError, ValidationError } from '@/lib/api/error-handler'

const postHandler = async (request: NextRequest) => {
  const body = await request.json()
  const object_key = body.object_key
  if (!object_key) {
    throw new ValidationError('Missing object_key', { object_key: 'Required field' });
  }

  const auth = request.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }
  const idToken = auth.split('Bearer ')[1]

  const decoded = await verifyIdToken(idToken)
  const uid = decoded.uid as string

  // Update user's avatar_id in DB
  const user = await prisma.user.findUnique({ where: { uid } })
  if (!user) {
    throw new NotFoundError('User');
  }

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
}

export const POST = withErrorHandler(postHandler)
