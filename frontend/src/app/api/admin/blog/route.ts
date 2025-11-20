

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/auth";
import { CreateBlogPostSchema } from "@/lib/validation/schemas";
import { withErrorHandler, AuthorizationError, ConflictError, ValidationError, parseJsonBody } from "@/lib/api/error-handler";

const getHandler = async (request: NextRequest) => {
  const user = await verifyAdmin(request);
  if (!user) {
    throw new AuthorizationError("Admin access required");
  }

  // Extract pagination params from query string
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Validate pagination params
  if (isNaN(page) || page < 1) {
    throw new ValidationError('Invalid page parameter', { page: 'Must be >= 1' });
  }
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError('Invalid limit parameter', { limit: 'Must be between 1 and 100' });
  }

  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.blogPost.count();

  // Get paginated posts
  const posts = await prisma.blogPost.findMany({
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  });
}

const postHandler = async (request: NextRequest) => {
  const user = await verifyAdmin(request);
  if (!user) {
    throw new AuthorizationError("Admin access required");
  }

  const body = await parseJsonBody<Record<string, unknown>>(request, CreateBlogPostSchema);
  const { title, slug, content, excerpt, cover_image, is_published } = body;

  // Check if slug exists
  const existing = await prisma.blogPost.findUnique({ where: { slug: slug as string } });
  if (existing) {
    throw new ConflictError("Slug already exists");
  }

  const post = await prisma.blogPost.create({
    data: {
      title: title as string,
      slug: slug as string,
      content: content as string,
      excerpt: excerpt as string | undefined,
      cover_image: cover_image as string | undefined,
      is_published: (is_published as boolean) || false,
      author_id: user.id,
    },
  });

  return NextResponse.json(post);
}

export const GET = withErrorHandler(getHandler)
export const POST = withErrorHandler(postHandler)