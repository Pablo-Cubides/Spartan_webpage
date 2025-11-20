
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyAdmin } from '@/lib/server/auth';

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
