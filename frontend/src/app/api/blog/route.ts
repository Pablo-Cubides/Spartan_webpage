

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { withErrorHandler, ValidationError } from "@/lib/api/error-handler";

const getHandler = async (request: NextRequest) => {
  // Extract pagination params from query string
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Validate pagination params
  if (isNaN(page) || page < 1) {
    throw new ValidationError('Invalid page parameter', { page: 'Must be >= 1' });
  }
  if (isNaN(limit) || limit < 1 || limit > 50) {
    throw new ValidationError('Invalid limit parameter', { limit: 'Must be between 1 and 50' });
  }

  const skip = (page - 1) * limit;

  // Get total count of published posts
  const total = await prisma.blogPost.count({
    where: {
      is_published: true,
      published_at: {
        lte: new Date(),
      },
    },
  });

  // Get paginated posts
  const posts = await prisma.blogPost.findMany({
    where: {
      is_published: true,
      published_at: {
        lte: new Date(),
      },
    },
    skip,
    take: limit,
    orderBy: { published_at: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      cover_image: true,
      published_at: true,
      author: {
        select: { name: true },
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

export const GET = withErrorHandler(getHandler);