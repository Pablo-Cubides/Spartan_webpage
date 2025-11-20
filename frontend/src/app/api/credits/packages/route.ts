import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function GET() {
  try {
    const packages = await prisma.creditPackage.findMany({ orderBy: { created_at: 'desc' } })
    return NextResponse.json({ packages })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'db_error', details: (err as Error).message }, { status: 500 })
  }
}
