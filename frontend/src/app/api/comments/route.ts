import { NextResponse } from "next/server";
import { verifyAdmin } from '@/lib/server/auth';
import { enforceSimpleRateLimit } from '@/lib/security/requestRateLimit';
import { prisma } from '@/lib/server/prisma';

function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const post = url.searchParams.get("post");

  const comments = await prisma.blogComment.findMany({
    where: {
      status: 'approved',
      ...(post ? { post_slug: post } : {}),
    },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      post_slug: true,
      name: true,
      content: true,
      created_at: true,
      status: true,
    },
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      postSlug: c.post_slug,
      name: c.name || undefined,
      content: c.content,
      createdAt: c.created_at.toISOString(),
      status: c.status,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const postRate = enforceSimpleRateLimit(`comments:post:${ip}`, 20, 10 * 60 * 1000);
    if (!postRate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const postSlug = sanitizeText((body?.postSlug || '').toString(), 160);
    const name = sanitizeText((body?.name || '').toString(), 80);
    const content = sanitizeText((body?.content || '').toString(), 1500);

    if (!postSlug || !content) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(postSlug)) {
      return NextResponse.json({ error: "Invalid postSlug" }, { status: 400 });
    }

    const comment = await prisma.blogComment.create({
      data: {
        post_slug: postSlug,
        name: name || null,
        content,
        status: 'pending',
      },
      select: {
        id: true,
        post_slug: true,
        name: true,
        content: true,
        created_at: true,
        status: true,
      },
    });

    return NextResponse.json({
      ok: true,
      comment: {
        id: comment.id,
        postSlug: comment.post_slug,
        name: comment.name || undefined,
        content: comment.content,
        createdAt: comment.created_at.toISOString(),
        status: comment.status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const modRate = enforceSimpleRateLimit(`comments:moderation:${ip}`, 60, 10 * 60 * 1000);
  if (!modRate.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;
    if (!id || !["approve", "reject"].includes(action)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const existing = await prisma.blogComment.findUnique({ where: { id: String(id) } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.blogComment.update({
      where: { id: String(id) },
      data: { status: action === 'approve' ? 'approved' : 'rejected' },
      select: {
        id: true,
        post_slug: true,
        name: true,
        content: true,
        created_at: true,
        status: true,
      },
    });

    return NextResponse.json({
      ok: true,
      comment: {
        id: updated.id,
        postSlug: updated.post_slug,
        name: updated.name || undefined,
        content: updated.content,
        createdAt: updated.created_at.toISOString(),
        status: updated.status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
