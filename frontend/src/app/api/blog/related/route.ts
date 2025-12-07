import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";

/**
 * GET /api/blog/related
 * Retorna posts relacionados basado en categoría y tags
 * Query params:
 *   - post_id: ID del post actual
 *   - limit: número de posts relacionados (default: 3, max: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get("post_id") || "0");
    const limit = Math.min(parseInt(searchParams.get("limit") || "3"), 10);

    if (!postId || postId <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid post_id is required" },
        { status: 400 }
      );
    }

    // Obtener el post actual para saber su categoría y tags
    const currentPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { category_id: true, tags: true },
    });

    if (!currentPost) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Buscar posts en la misma categoría o con tags similares
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: postId },
        is_published: true,
        OR: [{ category_id: currentPost.category_id }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        cover_image: true,
        reading_time_minutes: true,
        published_at: true,
        category: {
          select: {
            slug: true,
            name_display: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { published_at: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: relatedPosts,
      total: relatedPosts.length,
    });
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch related posts" },
      { status: 500 }
    );
  }
}
