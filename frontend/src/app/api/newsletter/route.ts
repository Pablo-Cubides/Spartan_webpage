import { NextResponse } from 'next/server';
import { brevoClient } from '@/lib/brevo/client';
import { isBrevoConfigured } from '@/lib/brevo/config';
import { verifyAdmin } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { enforceSimpleRateLimit } from '@/lib/security/requestRateLimit';

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const postRate = enforceSimpleRateLimit(`newsletter:post:${ip}`, 15, 10 * 60 * 1000);
    if (!postRate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    const name = (body?.name || '').toString().trim();
    
    if (!email || !validEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: true, already: true, message: 'Ya estás suscrito' });
    }

    if (isBrevoConfigured()) {
      try {
        await brevoClient.subscribeToNewsletter(email, name || undefined);
        console.log('✅ Subscriber added to Brevo:', email);
      } catch (brevoError) {
        console.error('⚠️ Brevo subscription failed:', brevoError);
        return NextResponse.json({ error: 'Subscription failed' }, { status: 502 });
      }
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
        source: 'web',
      },
    });

    return NextResponse.json({ 
      ok: true, 
      message: '¡Gracias por unirte a la legión!' 
    });
  } catch (e) {
    console.error('Newsletter subscription error:', e);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await prisma.newsletterSubscriber.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      email: true,
      created_at: true,
    },
  });

  return NextResponse.json({ 
    subscribers: data.map((s) => ({ 
      email: maskEmail(s.email),
      createdAt: s.created_at.toISOString() 
    })),
    count: data.length
  });
}
