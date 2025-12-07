import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

/**
 * GET /api/blog/categories
 * Retorna todas las categorías de blog activas
 */
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
      select: {
        id: true,
        name_display: true,
        slug: true,
        description: true,
        meta_title: true,
        meta_description: true,
        featured_image: true,
        sort_order: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
