import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateBlogPostingSchema } from "@/lib/blog/schema-generator";
import FAQSchema, { FAQItem } from "@/components/seo/FAQSchema";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import {
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
} from "@/lib/blog/static-data";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

// Category epic names lookup
const EPIC_NAMES: Record<string, string> = {
  "entrenamiento-y-energia-fisica": "Cuerpo Triarvon",
  "estilo-y-presencia": "Estilo Triarvon",
  "mentalidad-y-disciplina": "Mentalidad Triarvon",
  "productividad-y-gestion-del-tiempo": "Productividad Triarvon",
};

function extractFaqsFromContent(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const lines = content.split("\n");
  let currentQuestion = "";
  let currentAnswer: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+[?？].*)$/);
    if (headingMatch) {
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion.trim(),
          answer: currentAnswer
            .join(" ")
            .trim()
            .replace(/[#*`_]/g, ""),
        });
        currentAnswer = [];
      }
      currentQuestion = headingMatch[1].trim();
    } else if (currentQuestion) {
      if (line.startsWith("#")) {
        if (currentAnswer.length > 0) {
          faqs.push({
            question: currentQuestion.trim(),
            answer: currentAnswer
              .join(" ")
              .trim()
              .replace(/[#*`_]/g, ""),
          });
        }
        currentQuestion = "";
        currentAnswer = [];
      } else if (line.trim()) {
        currentAnswer.push(line.trim());
      }
    }
  }

  if (currentQuestion && currentAnswer.length > 0) {
    faqs.push({
      question: currentQuestion.trim(),
      answer: currentAnswer
        .join(" ")
        .trim()
        .replace(/[#*`_]/g, ""),
    });
  }

  return faqs;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || post.category_slug !== category) {
    return { title: "Artículo no encontrado | Triarvon Club" };
  }

  const postUrl = `${BASE_URL}/blog/${category}/${slug}`;

  return {
    title: `${post.title} | Triarvon Club`,
    description: post.excerpt || undefined,
    keywords: post.keywords || [],
    authors: [{ name: post.author?.name || "Triarvon Club" }],
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      url: postUrl,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author?.name || "Triarvon Club"],
      images: post.cover_image
        ? [{ url: post.cover_image, alt: post.title }]
        : [],
      siteName: "Triarvon Club",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image ? [post.cover_image] : [],
    },
    alternates: { canonical: postUrl },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    category: post.category_slug,
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { category, slug } = await params;

  const staticPost = getPostBySlug(slug);

  if (!staticPost || staticPost.category_slug !== category) {
    notFound();
  }

  // Transform to expected format
  const post = {
    ...staticPost,
    meta_title: staticPost.title,
    meta_description: staticPost.excerpt,
    published_at: new Date(staticPost.published_at),
    updated_at: new Date(staticPost.published_at),
    is_published: true,
    author: { name: staticPost.author.name, avatar_id: null },
  };

  // Get related posts
  const relatedPosts = getPostsByCategory(category)
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => ({ slug: p.slug, title: p.title, cover_image: p.cover_image }));

  // Generate schema
  const schema = generateBlogPostingSchema(post, {
    baseUrl: BASE_URL,
    siteName: "Triarvon Club",
    siteImage: `${BASE_URL}/Triarvon/triarvon-favicon-512.png`,
  });

  const faqs = extractFaqsFromContent(post.content);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: EPIC_NAMES[category] || category,
        item: `${BASE_URL}/blog/${category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: `${BASE_URL}/blog/${category}/${slug}`,
      },
    ],
  };

  const epicName = EPIC_NAMES[category] || category;
  const readingTime = Math.ceil(post.content.split(" ").length / 200);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqs.length > 0 && <FAQSchema items={faqs} />}

      <div className="min-h-screen bg-linear-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Image */}
          {post.cover_image && (
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image || ""}
                alt={`Portada del artículo: ${post.title}`}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/70 to-[#0a0a0a]" />
            </div>
          )}

          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
              <Link href="/" className="hover:text-white transition">
                Inicio
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition">
                Blog
              </Link>
              <span>/</span>
              <Link
                href={`/blog/${category}`}
                className="hover:text-white transition"
              >
                {epicName}
              </Link>
            </nav>

            {/* Category Badge */}
            <Link
              href={`/blog/${category}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold mb-6 hover:bg-red-500/30 transition"
            >
              {epicName}
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Answer-First direct content block for AI Engines & Users */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6 font-medium max-w-3xl border-l-4 border-red-600 pl-4 bg-white/5 py-2 rounded-r-md">
                {post.excerpt}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author?.name || "Triarvon Club"}</span>
              </div>
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time>
                    {new Date(post.published_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min de lectura</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <article className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-10 lg:p-12 shadow-2xl">
            {/* Table of Contents indicator */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <p className="text-white font-semibold">Artículo completo</p>
                <p className="text-sm text-gray-400">
                  {readingTime} minutos de lectura • Contenido de calidad
                </p>
              </div>
            </div>

            {/* Article body with premium styling */}
            <div className="article-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: "h2",
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* End CTA */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="bg-linear-to-r from-red-900/30 to-transparent p-6 rounded-xl border border-red-500/20">
                <p className="text-white font-bold text-lg mb-2">
                  ¿Te gustó este artículo?
                </p>
                <p className="text-gray-400 mb-4">
                  Compártelo con otros triarvons y sigue explorando más
                  contenido.
                </p>
                <Link
                  href={`/blog/${category}`}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Ver más en {epicName}
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* Share & Navigation */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-white/10">
            <Link
              href={`/blog/${category}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Volver a {epicName}</span>
            </Link>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition">
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-red-600 rounded-full" />
              Artículos Relacionados
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${category}/${related.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-red-500/50 hover:bg-white/10"
                >
                  <div className="aspect-video overflow-hidden bg-gray-900">
                    {related.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={related.cover_image}
                        alt={`Portada de ${related.title}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-red-900/50 to-gray-900" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
