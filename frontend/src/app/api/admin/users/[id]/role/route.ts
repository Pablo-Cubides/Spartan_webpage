

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyAdmin } from '@/lib/server/auth';
import { UpdateUserRoleSchema } from '@/lib/validation/schemas';
import { AuthorizationError, ValidationError, handleError, parseJsonBody } from '@/lib/api/error-handler';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw new AuthorizationError('Admin access required');
    }

    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID', { userId: 'Must be a valid number' });
    }

    const body = await parseJsonBody<Record<string, unknown>>(request, UpdateUserRoleSchema);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: body.role as string },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleError(error, request);
  }
}