import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";

/**
 * GET /api/blog/validate-slug
 * Valida si un slug ya existe en la BD
 * Query param:
 *   - slug: slug a validar
 *   - exclude_id: ID del post a excluir (para edición)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const excludeId = searchParams.get("exclude_id");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const whereClause: { slug: string; id?: { not: number } } = { slug };
    if (excludeId) {
      whereClause.id = { not: parseInt(excludeId) };
    }

    const existing = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      available: !existing,
      slug,
    });
  } catch (error) {
    console.error("Error validating slug:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate slug" },
      { status: 500 }
    );
  }
}
