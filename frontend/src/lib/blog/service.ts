import fs from "fs";
import path from "path";
import {
  posts as staticPosts,
  categories as staticCategories,
} from "./static-data";
import { prisma } from "../server/prisma";
import { isRetiredSlug } from "./retired";

export interface BlogArticle {
  id: number | string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category_slug: string;
  category_name?: string;
  keywords: string[];
  author: {
    name: string;
    avatar?: string;
  };
  published_at: string;
  created_at: string;
  status: "published" | "scheduled" | "paused" | "draft";
  source: "agent" | "manual" | "static";
  reading_time: string;
}

export interface BlogMetrics {
  total: number;
  published: number;
  scheduled: number;
  paused: number;
  byAgent: number;
}

interface PrismaBlogPostDelegate {
  findMany: (
    args?: Record<string, unknown>,
  ) => Promise<Record<string, unknown>[]>;
  create: (args: { data: Record<string, unknown> }) => Promise<{ id: number }>;
  update: (args: {
    where: { id: number };
    data: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  delete: (args: { where: { id: number } }) => Promise<unknown>;
}

interface PrismaWithBlog {
  blogPost: PrismaBlogPostDelegate;
}

const prismaBlog = prisma as unknown as PrismaWithBlog;

const LOCAL_STORAGE_PATH = path.join(
  process.cwd(),
  "src/data/agent-articles.json",
);

// Helper to normalize category slugs (supports shortcuts like "cuerpo", "estilo", "mentalidad", "productividad")
export function normalizeCategorySlug(cat?: string): string {
  if (!cat) return "entrenamiento-y-energia-fisica";
  const lower = cat.toLowerCase().trim();

  if (
    lower.includes("cuerpo") ||
    lower.includes("entrenamiento") ||
    lower.includes("ejercicio") ||
    lower.includes("fitness")
  ) {
    return "entrenamiento-y-energia-fisica";
  }
  if (
    lower.includes("estilo") ||
    lower.includes("presencia") ||
    lower.includes("ropa") ||
    lower.includes("moda") ||
    lower.includes("barba")
  ) {
    return "estilo-y-presencia";
  }
  if (
    lower.includes("mentalidad") ||
    lower.includes("disciplina") ||
    lower.includes("estoicismo") ||
    lower.includes("habito")
  ) {
    return "mentalidad-y-disciplina";
  }
  if (
    lower.includes("productividad") ||
    lower.includes("tiempo") ||
    lower.includes("deep work") ||
    lower.includes("ia") ||
    lower.includes("chatgpt")
  ) {
    return "productividad-y-gestion-del-tiempo";
  }

  const matched = staticCategories.find((c) => c.slug === lower);
  return matched ? matched.slug : "entrenamiento-y-energia-fisica";
}

export function getCategoryEpicName(categorySlug: string): string {
  const cat = staticCategories.find((c) => c.slug === categorySlug);
  return cat ? cat.name : "Cuerpo Triarvon";
}

export function calculateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function extractExcerpt(
  content: string,
  maxLength: number = 180,
): string {
  const clean = content
    .replace(/#{1,6}\s+.+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + "...";
}

// Read from JSON fallback safely
function readLocalArticles(): BlogArticle[] {
  try {
    if (fs.existsSync(LOCAL_STORAGE_PATH)) {
      const data = fs.readFileSync(LOCAL_STORAGE_PATH, "utf-8");
      return JSON.parse(data || "[]");
    }
  } catch (err) {
    console.warn("Could not read local agent-articles.json:", err);
  }
  return [];
}

// Write to JSON fallback safely
function writeLocalArticles(articles: BlogArticle[]): void {
  try {
    const dir = path.dirname(LOCAL_STORAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      LOCAL_STORAGE_PATH,
      JSON.stringify(articles, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Failed to write to local agent-articles.json:", err);
  }
}

// Transform static posts to unified BlogArticle format
function getStaticArticles(): BlogArticle[] {
  return staticPosts.map((post) => ({
    id: `static-${post.id}`,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    category_slug: post.category_slug,
    category_name: getCategoryEpicName(post.category_slug),
    keywords: post.keywords || [],
    author: {
      name: post.author?.name || "Triarvon Club",
      avatar: post.author?.avatar,
    },
    published_at: post.published_at,
    created_at: post.published_at,
    status: "published",
    source: "static",
    reading_time: calculateReadingTime(post.content),
  }));
}

/**
 * Fetch dynamic articles either from PostgreSQL (Prisma) or fallback to JSON
 */
async function getDynamicArticles(): Promise<BlogArticle[]> {
  try {
    const dbPosts = await prismaBlog.blogPost.findMany({
      orderBy: { created_at: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    if (Array.isArray(dbPosts)) {
      return dbPosts.map((p: Record<string, unknown>) => {
        const publishedAtStr =
          typeof p.published_at === "string" || p.published_at instanceof Date
            ? new Date(p.published_at as string | Date)
            : null;
        const isScheduled = Boolean(
          publishedAtStr && publishedAtStr > new Date(),
        );
        const derivedStatus = p.status
          ? (p.status as BlogArticle["status"])
          : !p.is_published
            ? "paused"
            : isScheduled
              ? "scheduled"
              : "published";

        const categorySlug =
          (p.category_slug as string) || "entrenamiento-y-energia-fisica";
        const authorObj = p.author as
          { name?: string; email?: string } | undefined;
        const authorName =
          (p.author_name as string) || authorObj?.name || "Andrés Guerrero";
        const contentStr = (p.content as string) || "";
        const createdAtStr = p.created_at
          ? new Date(p.created_at as string | Date).toISOString()
          : new Date().toISOString();

        return {
          id: p.id as number | string,
          slug: (p.slug as string) || "",
          title: (p.title as string) || "",
          content: contentStr,
          excerpt: (p.excerpt as string) || extractExcerpt(contentStr),
          cover_image: p.cover_image as string | undefined,
          category_slug: categorySlug,
          category_name: getCategoryEpicName(categorySlug),
          keywords: Array.isArray(p.keywords) ? (p.keywords as string[]) : [],
          author: {
            name: authorName,
          },
          published_at: publishedAtStr
            ? publishedAtStr.toISOString()
            : createdAtStr,
          created_at: createdAtStr,
          status: derivedStatus,
          source: (p.source as string as BlogArticle["source"]) || "agent",
          reading_time:
            (p.reading_time as string) || calculateReadingTime(contentStr),
        };
      });
    }
  } catch (error: unknown) {
    console.error(
      "[BlogService:getDynamicArticles] Error al consultar artículos en PostgreSQL (Prisma):",
      error,
    );
    // Fallback to local json file if DB is offline in local dev
  }

  return readLocalArticles();
}

/**
 * Get ALL articles combined (Static + Dynamic) for Admin Dashboard
 */
export async function getAllUnifiedArticles(): Promise<BlogArticle[]> {
  const [staticList, dynamicList] = await Promise.all([
    Promise.resolve(getStaticArticles()),
    getDynamicArticles(),
  ]);

  // Combine and deduplicate by slug (dynamic overrides static if modified)
  const map = new Map<string, BlogArticle>();

  // Add static first
  for (const item of staticList) {
    map.set(item.slug, item);
  }

  // Add/override with dynamic
  for (const item of dynamicList) {
    map.set(item.slug, item);
  }

  const all = Array.from(map.values());
  // Sort: most recently published or created first
  return all.sort((a, b) => {
    const timeA = new Date(a.published_at || a.created_at).getTime();
    const timeB = new Date(b.published_at || b.created_at).getTime();
    return timeB - timeA;
  });
}

/**
 * Get PUBLIC articles (only status === 'published' and date <= NOW)
 */
export async function getPublicBlogArticles(
  categorySlug?: string,
): Promise<BlogArticle[]> {
  const all = await getAllUnifiedArticles();
  const now = new Date().getTime();

  return all.filter((article) => {
    // Copias retiradas (redirigen con 301 a la version que se conserva)
    if (isRetiredSlug(article.slug)) return false;

    // Status must be published
    if (article.status !== "published") return false;

    // Published date must be past or present
    const pubTime = new Date(article.published_at).getTime();
    if (pubTime > now) return false;

    // Optional category filter
    if (categorySlug && article.category_slug !== categorySlug) return false;

    return true;
  });
}

/**
 * Get a single public article by slug
 */
export async function getPublicBlogArticleBySlug(
  slug: string,
  categorySlug?: string,
): Promise<BlogArticle | null> {
  const all = await getAllUnifiedArticles();
  const found = all.find((p) => p.slug === slug);

  if (!found) return null;
  if (isRetiredSlug(found.slug)) return null;
  if (found.status !== "published") return null;

  const now = new Date().getTime();
  if (new Date(found.published_at).getTime() > now) return null;

  if (categorySlug && found.category_slug !== categorySlug) return null;

  return found;
}

/**
 * Get metrics for the Admin Dashboard
 */
export async function getBlogMetrics(): Promise<BlogMetrics> {
  const articles = await getAllUnifiedArticles();
  const now = new Date().getTime();

  let published = 0;
  let scheduled = 0;
  let paused = 0;
  let byAgent = 0;

  for (const art of articles) {
    const pubTime = new Date(art.published_at).getTime();
    if (art.status === "paused" || art.status === "draft") {
      paused++;
    } else if (art.status === "scheduled" || pubTime > now) {
      scheduled++;
    } else if (art.status === "published") {
      published++;
    }

    if (art.source === "agent") {
      byAgent++;
    }
  }

  return {
    total: articles.length,
    published,
    scheduled,
    paused,
    byAgent,
  };
}

/**
 * Create a new article (from Agent API or Manual Admin)
 */
export async function createBlogArticle(data: {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  category_slug?: string;
  cover_image?: string;
  published_at?: string | null;
  status?: "published" | "scheduled" | "paused" | "draft";
  source?: "agent" | "manual";
  author_name?: string;
  keywords?: string[];
}): Promise<BlogArticle> {
  const category_slug = normalizeCategorySlug(data.category_slug);
  const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
  const excerpt = data.excerpt || extractExcerpt(data.content);
  const reading_time = calculateReadingTime(data.content);
  const now = new Date();

  const published_at = data.published_at ? new Date(data.published_at) : now;
  let status = data.status || "published";

  if (published_at.getTime() > now.getTime() && status === "published") {
    status = "scheduled";
  }

  const newArticle: BlogArticle = {
    id: Date.now(),
    slug,
    title: data.title,
    content: data.content,
    excerpt,
    cover_image: data.cover_image || "/images/blog/blog_default_cover.png",
    category_slug,
    category_name: getCategoryEpicName(category_slug),
    keywords: data.keywords || [],
    author: {
      name: data.author_name || "Andrés Guerrero",
    },
    published_at: published_at.toISOString(),
    created_at: now.toISOString(),
    status,
    source: data.source || "agent",
    reading_time,
  };

  // Try saving to Prisma DB first
  try {
    const created = await prismaBlog.blogPost.create({
      data: {
        title: newArticle.title,
        slug: newArticle.slug,
        content: newArticle.content,
        excerpt: newArticle.excerpt,
        cover_image: newArticle.cover_image,
        category_slug: newArticle.category_slug,
        keywords: newArticle.keywords,
        author_name: newArticle.author.name,
        source: newArticle.source,
        status: newArticle.status,
        reading_time: newArticle.reading_time,
        is_published:
          newArticle.status === "published" ||
          newArticle.status === "scheduled",
        published_at: new Date(newArticle.published_at),
      },
    });
    newArticle.id = created.id;
    return newArticle;
  } catch (error: unknown) {
    console.error(
      "[BlogService:createBlogArticle] Error al crear artículo en PostgreSQL (Prisma):",
      error,
    );

    // En producción (o Vercel), el disco de las lambdas es efímero.
    // Fallar silenciosamente finge éxito pero destruye el artículo tras milisegundos.
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Error al persistir el artículo en la base de datos: ${errMsg}`,
      );
    }

    console.warn(
      "[BlogService:createBlogArticle] Entorno local: usando fallback en agent-articles.json",
    );
  }

  // Save to local JSON fallback
  const locals = readLocalArticles();
  const existingIdx = locals.findIndex((a) => a.slug === slug);
  if (existingIdx >= 0) {
    locals[existingIdx] = newArticle;
  } else {
    locals.unshift(newArticle);
  }
  writeLocalArticles(locals);

  return newArticle;
}

/**
 * Update an existing article (Toggle publish/pause, edit date, etc.)
 */
export async function updateBlogArticle(
  idOrSlug: string | number,
  updates: Partial<BlogArticle>,
): Promise<BlogArticle | null> {
  const idNum =
    typeof idOrSlug === "number" ? idOrSlug : parseInt(idOrSlug as string);

  // Try Prisma update
  if (!isNaN(idNum)) {
    try {
      const dataToUpdate: Record<string, unknown> = {};
      if (updates.status !== undefined) {
        dataToUpdate.status = updates.status;
        dataToUpdate.is_published =
          updates.status === "published" || updates.status === "scheduled";
      }
      if (updates.title !== undefined) dataToUpdate.title = updates.title;
      // Autor y slug editables por la API de agente (2026-10-19): firma de marca y slugs limpios
      const extra = updates as unknown as {
        author_name?: string;
        slug?: string;
      };
      if (typeof extra.author_name === "string" && extra.author_name.trim())
        dataToUpdate.author_name = extra.author_name.trim().slice(0, 120);
      if (
        typeof extra.slug === "string" &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(extra.slug)
      )
        dataToUpdate.slug = extra.slug;
      if (updates.content !== undefined) {
        dataToUpdate.content = updates.content;
        dataToUpdate.reading_time = calculateReadingTime(updates.content);
      }
      if (updates.excerpt !== undefined) dataToUpdate.excerpt = updates.excerpt;
      if (updates.cover_image !== undefined)
        dataToUpdate.cover_image = updates.cover_image;
      if (updates.category_slug !== undefined)
        dataToUpdate.category_slug = normalizeCategorySlug(
          updates.category_slug,
        );
      if (updates.published_at !== undefined)
        dataToUpdate.published_at = new Date(updates.published_at);

      const updated = await prismaBlog.blogPost.update({
        where: { id: idNum },
        data: dataToUpdate,
      });

      const updatedCategory =
        (updated.category_slug as string) || "entrenamiento-y-energia-fisica";
      const updatedContent = (updated.content as string) || "";
      const updatedPubAt = updated.published_at
        ? new Date(updated.published_at as string | Date).toISOString()
        : new Date().toISOString();
      const updatedCreatedAt = updated.created_at
        ? new Date(updated.created_at as string | Date).toISOString()
        : new Date().toISOString();

      return {
        id: updated.id as number | string,
        slug: (updated.slug as string) || "",
        title: (updated.title as string) || "",
        content: updatedContent,
        excerpt: (updated.excerpt as string) || extractExcerpt(updatedContent),
        cover_image: updated.cover_image as string | undefined,
        category_slug: updatedCategory,
        category_name: getCategoryEpicName(updatedCategory),
        keywords: Array.isArray(updated.keywords)
          ? (updated.keywords as string[])
          : [],
        author: { name: (updated.author_name as string) || "Andrés Guerrero" },
        published_at: updatedPubAt,
        created_at: updatedCreatedAt,
        status:
          (updated.status as BlogArticle["status"]) ||
          (updated.is_published ? "published" : "paused"),
        source: (updated.source as string as BlogArticle["source"]) || "manual",
        reading_time:
          (updated.reading_time as string) ||
          calculateReadingTime(updatedContent),
      };
    } catch (error: unknown) {
      console.error(
        "[BlogService:updateBlogArticle] Error al actualizar artículo en PostgreSQL (Prisma):",
        error,
      );
      if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Error al actualizar el artículo en la base de datos: ${errMsg}`,
        );
      }
      // Continuar a fallback local solo en desarrollo
    }
  }

  // Update in local JSON fallback
  const locals = readLocalArticles();
  const idx = locals.findIndex(
    (a) =>
      a.id === idOrSlug ||
      a.slug === idOrSlug ||
      String(a.id) === String(idOrSlug),
  );

  if (idx >= 0) {
    const current = locals[idx];
    const updated: BlogArticle = {
      ...current,
      ...updates,
      category_slug: updates.category_slug
        ? normalizeCategorySlug(updates.category_slug)
        : current.category_slug,
      category_name: updates.category_slug
        ? getCategoryEpicName(updates.category_slug)
        : current.category_name,
    };
    locals[idx] = updated;
    writeLocalArticles(locals);
    return updated;
  }

  // If it is a static article being toggled, create a dynamic override in local storage
  const statics = getStaticArticles();
  const foundStatic = statics.find(
    (s) => s.id === idOrSlug || s.slug === idOrSlug,
  );
  if (foundStatic) {
    const overridden: BlogArticle = {
      ...foundStatic,
      ...updates,
      id: `override-${foundStatic.id}`,
    };
    locals.unshift(overridden);
    writeLocalArticles(locals);
    return overridden;
  }

  return null;
}

/**
 * Delete an article
 */
export async function deleteBlogArticle(
  idOrSlug: string | number,
): Promise<boolean> {
  const idNum =
    typeof idOrSlug === "number" ? idOrSlug : parseInt(idOrSlug as string);

  if (!isNaN(idNum)) {
    try {
      await prismaBlog.blogPost.delete({
        where: { id: idNum },
      });
      return true;
    } catch (error: unknown) {
      console.error(
        "[BlogService:deleteBlogArticle] Error al eliminar artículo en PostgreSQL (Prisma):",
        error,
      );
      if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Error al eliminar el artículo de la base de datos: ${errMsg}`,
        );
      }
      // Fall through to local delete in development
    }
  }

  const locals = readLocalArticles();
  const initialLength = locals.length;
  const filtered = locals.filter(
    (a) =>
      a.id !== idOrSlug &&
      a.slug !== idOrSlug &&
      String(a.id) !== String(idOrSlug),
  );

  if (filtered.length !== initialLength) {
    writeLocalArticles(filtered);
    return true;
  }

  // If static, mark as paused/hidden
  const statics = getStaticArticles();
  const foundStatic = statics.find(
    (s) => s.id === idOrSlug || s.slug === idOrSlug,
  );
  if (foundStatic) {
    const hidden: BlogArticle = {
      ...foundStatic,
      id: `override-${foundStatic.id}`,
      status: "paused",
    };
    filtered.unshift(hidden);
    writeLocalArticles(filtered);
    return true;
  }

  return false;
}
