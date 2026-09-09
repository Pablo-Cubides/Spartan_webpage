import fs from "fs";
import path from "path";
import {
  posts as staticPosts,
  categories as staticCategories,
  BlogPost as StaticBlogPost,
} from "./static-data";
import { prisma } from "../server/prisma";

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
    // Attempt Prisma query
    const dbPosts = await (prisma as any).blogPost.findMany({
      orderBy: { created_at: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    if (Array.isArray(dbPosts)) {
      return dbPosts.map((p: any) => {
        const isScheduled =
          p.published_at && new Date(p.published_at) > new Date();
        const derivedStatus = p.status
          ? (p.status as BlogArticle["status"])
          : !p.is_published
            ? "paused"
            : isScheduled
              ? "scheduled"
              : "published";

        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          content: p.content,
          excerpt: p.excerpt || extractExcerpt(p.content),
          cover_image: p.cover_image,
          category_slug: p.category_slug || "entrenamiento-y-energia-fisica",
          category_name: getCategoryEpicName(
            p.category_slug || "entrenamiento-y-energia-fisica",
          ),
          keywords: p.keywords || [],
          author: {
            name: p.author_name || p.author?.name || "Agente Triarvon",
          },
          published_at: p.published_at
            ? new Date(p.published_at).toISOString()
            : new Date(p.created_at).toISOString(),
          created_at: new Date(p.created_at).toISOString(),
          status: derivedStatus,
          source: (p.source as BlogArticle["source"]) || "agent",
          reading_time: p.reading_time || calculateReadingTime(p.content),
        };
      });
    }
  } catch (prismaError) {
    // Fallback to local json file
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

  let published_at = data.published_at ? new Date(data.published_at) : now;
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
      name:
        data.author_name ||
        (data.source === "manual" ? "Admin Triarvon" : "Agente Triarvon"),
    },
    published_at: published_at.toISOString(),
    created_at: now.toISOString(),
    status,
    source: data.source || "agent",
    reading_time,
  };

  // Try saving to Prisma DB first
  try {
    const created = await (prisma as any).blogPost.create({
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
  } catch (err) {
    // Fallback to local storage
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
      const dataToUpdate: any = {};
      if (updates.status !== undefined) {
        dataToUpdate.status = updates.status;
        dataToUpdate.is_published =
          updates.status === "published" || updates.status === "scheduled";
      }
      if (updates.title !== undefined) dataToUpdate.title = updates.title;
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

      const updated = await (prisma as any).blogPost.update({
        where: { id: idNum },
        data: dataToUpdate,
      });

      return {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        content: updated.content,
        excerpt: updated.excerpt,
        cover_image: updated.cover_image,
        category_slug: updated.category_slug,
        category_name: getCategoryEpicName(updated.category_slug),
        keywords: updated.keywords || [],
        author: { name: updated.author_name || "Admin Triarvon" },
        published_at:
          updated.published_at?.toISOString() || new Date().toISOString(),
        created_at:
          updated.created_at?.toISOString() || new Date().toISOString(),
        status:
          (updated.status as BlogArticle["status"]) ||
          (updated.is_published ? "published" : "paused"),
        source: (updated.source as BlogArticle["source"]) || "manual",
        reading_time:
          updated.reading_time || calculateReadingTime(updated.content),
      };
    } catch (err) {
      // Continue to local json update
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
      await (prisma as any).blogPost.delete({
        where: { id: idNum },
      });
      return true;
    } catch (err) {
      // Fall through to local delete
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
