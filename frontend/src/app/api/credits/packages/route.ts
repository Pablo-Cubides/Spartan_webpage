import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { withErrorHandler } from '@/lib/api/error-handler'

const getHandler = async (request: NextRequest) => {
  const packages = await prisma.creditPackage.findMany({ orderBy: { created_at: 'desc' } })
  return NextResponse.json({ packages })
}

export const GET = withErrorHandler(getHandler)
