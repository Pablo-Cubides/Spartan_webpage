import { NextResponse } from 'next/server'
import { isOriginAllowed, getAllowedOriginsList, verifyFirebaseIdToken, checkApiKey } from '../../../../lib/security/uploadAuth'

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || ''
  if (!isOriginAllowed(origin)) return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })

  const authHeader = request.headers.get('authorization') || ''
  const apiKeyHeader = request.headers.get('x-api-key') || ''
  let authorized = false
  try {
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.split(' ')[1]
      await verifyFirebaseIdToken(token)
      authorized = true
    }
  } catch {
    // ignore and try api key
  }
  if (!authorized && apiKeyHeader) {
    if (checkApiKey(apiKeyHeader)) authorized = true
  }

  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ error: 'not_implemented', message: 'Avatar upload not implemented. Configure R2 credentials and I can add presigned URL support.' }, { status: 501 })
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowed = getAllowedOriginsList()
  const allowOrigin = allowed.length ? (allowed.includes(origin) ? origin : '') : '*'
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-KEY',
    },
  })
}
