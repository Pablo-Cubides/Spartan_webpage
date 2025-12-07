import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";

/**
 * GET /api/blog/posts/[category]/[slug]
 * Retorna un post individual con todas sus relaciones
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string; slug: string } }
) {
  try {
    const { category, slug } = params;

    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        is_published: true,
        category: { slug: category },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar_id: true,
            email: true,
            social_links: true,
          },
        },
        category: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Incrementar contador de vistas
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { view_count: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
