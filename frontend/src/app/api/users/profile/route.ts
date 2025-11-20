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
}

export const GET = withErrorHandler(getHandler)
export const PUT = withErrorHandler(putHandler)
