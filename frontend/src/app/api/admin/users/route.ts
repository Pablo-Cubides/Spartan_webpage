import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyAdmin } from '@/lib/server/auth'

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({ orderBy: { created_at: 'desc' } })
    return NextResponse.json({ users })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'internal_error', details: (err as Error).message }, { status: 500 })
  }
}
