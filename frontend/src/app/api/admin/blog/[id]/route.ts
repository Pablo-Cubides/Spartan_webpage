

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/auth";
import { UpdateBlogPostSchema } from "@/lib/validation/schemas";
import { AuthorizationError, NotFoundError, ValidationError, parseJsonBody, handleError } from "@/lib/api/error-handler";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      throw new AuthorizationError("Admin access required");
    }

    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID', { id: 'Must be a valid number' });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError("Blog post");
    }

    return NextResponse.json(post);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      throw new AuthorizationError("Admin access required");
    }

    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID', { id: 'Must be a valid number' });
    }

    const body = await parseJsonBody<Record<string, unknown>>(request, UpdateBlogPostSchema);

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: Object.entries(body).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key as keyof typeof acc] = value;
        }
        return acc;
      }, {} as Record<string, unknown>),
    });

    return NextResponse.json(post);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdmin(request);
    if (!user) {
      throw new AuthorizationError("Admin access required");
    }

    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID', { id: 'Must be a valid number' });
    }

    await prisma.blogPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}