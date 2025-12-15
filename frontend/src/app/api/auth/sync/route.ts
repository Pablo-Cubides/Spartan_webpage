import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyIdToken } from '@/lib/server/firebaseAdmin'
import { withErrorHandler, AuthenticationError } from '@/lib/api/error-handler'

/**
 * POST /api/auth/sync
 * Sincroniza el usuario de Firebase con la base de datos Prisma.
 * Si el usuario no existe, lo crea. Si existe, actualiza el email si cambió.
 */
const postHandler = async (request: NextRequest) => {
  const auth = request.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header')
  }

  const idToken = auth.split('Bearer ')[1]
  let decoded
  try {
    decoded = await verifyIdToken(idToken)
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new AuthenticationError('Invalid or expired token')
  }

  const { uid, email, name, picture } = decoded

  if (!uid || !email) {
    throw new AuthenticationError('Invalid token: missing uid or email')
  }

  // Upsert: crear si no existe, actualizar si existe
  const user = await prisma.user.upsert({
    where: { uid },
    update: {
      email: email,
      name: name || undefined,
      avatar_id: picture || undefined,
      updated_at: new Date(),
    },
    create: {
      uid,
      email,
      name: name || email.split('@')[0],
      avatar_id: picture || '/icono spartan club - sin fondo.png',
      role: 'user',
      credits: 0,
      is_active: true,
    },
  })

  console.log(`✅ User synced: ${user.email} (uid: ${user.uid})`)

  return NextResponse.json({ 
    success: true, 
    user: {
      id: user.id,
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
    }
  })
}

export const POST = withErrorHandler(postHandler)
