import { Metadata } from "next";
import Link from "next/link";
import { Dumbbell, Shirt, Brain, Clock } from "lucide-react";
import {
  categories as staticCategories,
  getAllPosts,
} from "@/lib/blog/static-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

// Helper to map icon string names back to components
const getIconComponent = (categorySlug: string) => {
  switch (categorySlug) {
    case "entrenamiento-y-energia-fisica":
      return Dumbbell;
    case "estilo-y-presencia":
      return Shirt;
    case "mentalidad-y-disciplina":
      return Brain;
    case "productividad-y-gestion-del-tiempo":
      return Clock;
    default:
      return Dumbbell;
  }
};

export const metadata: Metadata = {
  title: "Blog Spartan Club | Desarrollo Masculino, Entrenamiento y Estilo",
  description:
    "Artículos expertos sobre entrenamiento físico, estilo masculino, mentalidad y productividad. Consejos prácticos para hombres que buscan la excelencia.",
  keywords: [
    "blog masculino",
    "entrenamiento hombres",
    "estilo masculino",
    "mentalidad disciplina",
    "productividad personal",
    "desarrollo personal masculino",
  ],
  openGraph: {
    title: "Blog Spartan Club | Desarrollo Masculino",
    description:
      "Artículos sobre entrenamiento, estilo, mentalidad y productividad para hombres.",
    type: "website",
    url: `${BASE_URL}/blog`,
    images: [
      {
        url: `${BASE_URL}/Hero.png`,
        width: 1200,
        height: 630,
        alt: "Spartan Club Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Spartan Club",
    description: "Desarrollo masculino integral",
    images: [`${BASE_URL}/Hero.png`],
  },
  alternates: { canonical: `${BASE_URL}/blog` },
};

export default async function BlogPage() {
  // Use static data instead of database
  const categories = staticCategories.map((cat) => ({
    slug: cat.slug,
    epic_name: cat.name,
    description: cat.description,
    icon: null,
    gradient: cat.gradient,
    cover_image: cat.cover_image,
  }));

  const latestPosts = getAllPosts()
    .slice(0, 6)
    .map((post) => ({
      slug: post.slug,
      category_slug: post.category_slug,
      title: post.title,
      excerpt: post.excerpt,
      cover_image: post.cover_image,
      published_at: new Date(post.published_at),
      category: {
        epic_name:
          staticCategories.find((c) => c.slug === post.category_slug)?.name ||
          "",
      },
    }));

  // Schema.org
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blog Spartan Club",
    description: "Artículos sobre desarrollo masculino integral",
    url: `${BASE_URL}/blog`,
  };

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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 px-4">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center gap-2 text-sm text-gray-400 mb-8">
              <Link href="/" className="hover:text-white transition">
                Inicio
              </Link>
              <span>/</span>
              <span className="text-red-500">Blog</span>
            </nav>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Blog{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Spartan
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Artículos sobre{" "}
              <strong className="text-white">entrenamiento</strong>,{" "}
              <strong className="text-white">estilo</strong>,
              <strong className="text-white"> mentalidad</strong> y{" "}
              <strong className="text-white">productividad</strong> para hombres
              que buscan la excelencia.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-red-600 rounded-full" />
              Explora por Categoría
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const Icon = getIconComponent(cat.slug);
                return (
                  <Link
                    key={cat.slug}
                    href={`/blog/${cat.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-900/20"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.cover_image || ""}
                        alt={cat.epic_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative p-8 flex items-center gap-6">
                      <div
                        className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                          {cat.epic_name}
                        </h3>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                          {cat.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-gray-500 group-hover:text-red-500 group-hover:translate-x-2 transition-all duration-300">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Latest Posts */}
        {latestPosts.length > 0 && (
          <section className="px-4 pb-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-1 bg-red-600 rounded-full" />
                Últimos Artículos
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.category_slug}/${post.slug}`}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-red-500/50 hover:bg-white/10"
                  >
                    {/* Image */}
                    <div className="aspect-video overflow-hidden bg-gray-900">
                      {post.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-gray-900 flex items-center justify-center">
                          <span className="text-4xl">📖</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Category badge */}
                      {post.category_slug && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-red-400 bg-red-500/10 rounded-full mb-3">
                          {post.category?.epic_name || post.category_slug}
                        </span>
                      )}

                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}

                      {post.published_at && (
                        <time className="text-xs text-gray-400">
                          {new Date(post.published_at).toLocaleDateString(
                            "es-ES",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </time>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
