import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { verifyAdmin } from '@/lib/server/auth'
import { withErrorHandler, AuthorizationError, ValidationError } from '@/lib/api/error-handler'

const getHandler = async (request: NextRequest) => {
  const admin = await verifyAdmin(request);
  if (!admin) {
    throw new AuthorizationError('Admin access required');
  }

  // Extract pagination params from query string
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Validate pagination params
  if (isNaN(page) || page < 1) {
    throw new ValidationError('Invalid page parameter', { page: 'Must be >= 1' });
  }
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError('Invalid limit parameter', { limit: 'Must be between 1 and 100' });
  }

  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.purchase.count();

  // Get paginated purchases
  const purchases = await prisma.purchase.findMany({
    skip,
    take: limit,
    orderBy: { created_at: 'desc' },
    include: { user: true, package: true },
  })

  return NextResponse.json({
    purchases,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  })
}

export const GET = withErrorHandler(getHandler)
