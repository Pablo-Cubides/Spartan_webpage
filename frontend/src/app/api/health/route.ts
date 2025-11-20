import { NextResponse, NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/api/error-handler'

const getHandler = async (request: NextRequest) => {
  return NextResponse.json({ status: 'ok', service: 'spartan-frontend-api' })
}

export const GET = withErrorHandler(getHandler)
