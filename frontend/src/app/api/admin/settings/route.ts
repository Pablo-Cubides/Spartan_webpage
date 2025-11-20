

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyAdmin } from '@/lib/server/auth';
import { withErrorHandler, AuthorizationError } from '@/lib/api/error-handler';

const getHandler = async (request: NextRequest) => {
  const admin = await verifyAdmin(request);
  if (!admin) {
    throw new AuthorizationError('Admin access required');
  }

  const settings = await prisma.appSetting.findMany();
  const settingsMap: Record<string, string | number | boolean> = {};
  
  settings.forEach(s => {
    // Try to parse JSON values, otherwise keep as string
    try {
      settingsMap[s.key] = JSON.parse(s.value);
    } catch {
      settingsMap[s.key] = s.value;
    }
  });

  // Default values if not set
  const defaults = {
    creditCostAnalysis: 1,
    creditCostGeneration: 1,
    appEnabled: true,
    maintenanceMode: false,
  };

  return NextResponse.json({ ...defaults, ...settingsMap });
}

const postHandler = async (request: NextRequest) => {
  const admin = await verifyAdmin(request);
  if (!admin) {
    throw new AuthorizationError('Admin access required');
  }

  const body = await request.json();
  
  // Update each setting
  const updates = Object.entries(body).map(([key, value]) => {
    return prisma.appSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  });

  await prisma.$transaction(updates);

  return NextResponse.json({ success: true });
}

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);