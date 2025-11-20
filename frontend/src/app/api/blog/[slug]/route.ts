

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { NotFoundError, handleError } from "@/lib/api/error-handler";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundError('Blog post');
    }

    // Check if published
    const isPublished = post.is_published && post.published_at && new Date(post.published_at) <= new Date();

    if (!isPublished) {
      throw new NotFoundError('Blog post');
    }

    return NextResponse.json(post);
  } catch (error) {
    return handleError(error, request);
  }
}