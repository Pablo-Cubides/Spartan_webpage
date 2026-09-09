import { NextResponse, NextRequest } from "next/server";
import { verifyAdminOrAgentKey } from "@/lib/server/auth";
import {
  getAllUnifiedArticles,
  getBlogMetrics,
  createBlogArticle,
  normalizeCategorySlug,
} from "@/lib/blog/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminOrAgentKey(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Admin role or BLOG_AGENT_API_KEY required." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let articles = await getAllUnifiedArticles();
    const metrics = await getBlogMetrics();

    if (category && category !== "all") {
      const normalized = normalizeCategorySlug(category);
      articles = articles.filter((a) => a.category_slug === normalized);
    }

    if (status && status !== "all") {
      articles = articles.filter((a) => a.status === status);
    }

    if (search) {
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.slug.toLowerCase().includes(search) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(search)),
      );
    }

    return NextResponse.json({
      articles,
      metrics,
      total: articles.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("GET /api/admin/blog/articles error:", error);
    return NextResponse.json(
      { error: "Error al obtener artículos", details: message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminOrAgentKey(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Se requiere autorización mediante cabecera 'Authorization: Bearer <BLOG_AGENT_API_KEY>' o sesión de administrador.",
        },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "El cuerpo de la petición debe ser un objeto JSON válido.",
        },
        { status: 400 },
      );
    }

    const {
      title,
      content,
      slug,
      excerpt,
      category_slug,
      category,
      cover_image,
      published_at,
      status,
      author_name,
      keywords,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "El campo 'title' es obligatorio (mínimo 5 caracteres).",
        },
        { status: 422 },
      );
    }

    if (!content || typeof content !== "string" || content.trim().length < 20) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message:
            "El campo 'content' en formato Markdown es obligatorio (mínimo 20 caracteres).",
        },
        { status: 422 },
      );
    }

    const targetCategory =
      category_slug || category || "entrenamiento-y-energia-fisica";

    const createdArticle = await createBlogArticle({
      title: title.trim(),
      content: content.trim(),
      slug: typeof slug === "string" ? slug.trim() : undefined,
      excerpt: typeof excerpt === "string" ? excerpt.trim() : undefined,
      category_slug: targetCategory,
      cover_image:
        typeof cover_image === "string" ? cover_image.trim() : undefined,
      published_at: published_at || null,
      status: status || "published",
      source: user.isAgent ? "agent" : "manual",
      author_name:
        author_name ||
        (user.isAgent ? "Agente IA Triarvon" : user.name || "Admin Triarvon"),
      keywords: Array.isArray(keywords) ? keywords : [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Artículo publicado exitosamente.",
        article: createdArticle,
        public_url: `/blog/${createdArticle.category_slug}/${createdArticle.slug}`,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("POST /api/admin/blog/articles error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 },
    );
  }
}
