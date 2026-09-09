import { NextResponse, NextRequest } from "next/server";
import { verifyAdminOrAgentKey } from "@/lib/server/auth";
import {
  updateBlogArticle,
  deleteBlogArticle,
  getAllUnifiedArticles,
} from "@/lib/blog/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAdminOrAgentKey(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const articles = await getAllUnifiedArticles();
    const found = articles.find((a) => String(a.id) === id || a.slug === id);

    if (!found) {
      return NextResponse.json(
        { error: "Artículo no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(found);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAdminOrAgentKey(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updated = await updateBlogArticle(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Artículo no encontrado para actualizar" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Artículo actualizado (${updated.status})`,
      article: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAdminOrAgentKey(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteBlogArticle(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Artículo no encontrado para eliminar" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Artículo retirado correctamente.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
