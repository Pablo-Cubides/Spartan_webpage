import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'
import { UpdateUserProfileSchema } from '@/lib/validation/schemas'
import { withErrorHandler, AuthenticationError, NotFoundError, parseJsonBody } from '@/lib/api/error-handler'

const getHandler = async (request: NextRequest) => {
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

  const user = await prisma.user.findUnique({ where: { uid } })
  if (!user) {
    throw new NotFoundError('User')
  }

  return NextResponse.json({ user })
}

const putHandler = async (request: NextRequest) => {
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

  const body = await parseJsonBody(request, UpdateUserProfileSchema)

  console.log('[profile update] body received:', JSON.stringify(body))

  // Build update data - include fields if they are defined (even if empty string for name)
  const data: Record<string, string | undefined> = {}
  if (body.email !== undefined) data.email = body.email
  if (body.name !== undefined) data.name = body.name
  if (body.alias !== undefined) data.alias = body.alias
  if (body.avatar_id !== undefined) data.avatar_id = body.avatar_id

  console.log('[profile update] data to update:', JSON.stringify(data))

  const user = await prisma.user.update({
    where: { uid },
    data,
  })

  console.log('[profile update] user updated:', user.name, user.alias)

  return NextResponse.json({ user })
}

export const GET = withErrorHandler(getHandler)
export const PUT = withErrorHandler(putHandler)
