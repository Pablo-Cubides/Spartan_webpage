import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";

/**
 * GET /api/blog/posts
 * Retorna posts publicados, opcionalmente filtrados por categoría
 * Query params:
 *   - category: slug de categoría (opcional)
 *   - page: número de página (default: 1)
 *   - limit: posts por página (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    // Validar paginación
    if (page < 1) {
      return NextResponse.json(
        { success: false, error: "Page must be >= 1" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Filtro por categoría
    const categoryFilter = categorySlug
      ? { category: { slug: categorySlug } }
      : undefined;

    // Contar total de posts
    const total = await prisma.blogPost.count({
      where: {
        is_published: true,
        ...categoryFilter,
      },
    });

    // Obtener posts
    const posts = await prisma.blogPost.findMany({
      where: {
        is_published: true,
        ...categoryFilter,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        cover_image: true,
        cover_image_alt: true,
        reading_time_minutes: true,
        published_at: true,
        created_at: true,
        view_count: true,
        category: {
          select: {
            id: true,
            slug: true,
            name_display: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            avatar_id: true,
          },
        },
      },
      orderBy: { published_at: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
