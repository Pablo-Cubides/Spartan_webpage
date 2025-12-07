import { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";

const BASE_URL = "https://spartanclub.co";

export const metadata: Metadata = {
  title: "Blog | Spartan Club - Artículos de Desarrollo Masculino",
  description:
    "Explora nuestro blog con artículos expertos sobre entrenamiento, estilo de vida, mentalidad y productividad. Consejos prácticos para tu desarrollo personal como hombre.",
  keywords: [
    "blog",
    "entrenamiento",
    "estilo",
    "mentalidad",
    "productividad",
    "desarrollo personal",
  ],
  
  openGraph: {
    title: "Blog | Spartan Club",
    description:
      "Artículos sobre desarrollo masculino, entrenamiento y estilo de vida.",
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
    title: "Blog | Spartan Club",
    description: "Artículos sobre desarrollo masculino",
    images: [`${BASE_URL}/Hero.png`],
  },

  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
};

export default async function BlogPage() {
  type BlogPostWithAuthor = {
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image: string | null;
    published_at: Date | null;
    author_id: number;
    author?: { name: string | null } | null;
    meta_description?: string | null;
  };

  let posts: BlogPostWithAuthor[] = [];

  try {
    const postsData = await prisma.blogPost.findMany({
      where: { is_published: true },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        cover_image: true,
        published_at: true,
        author_id: true,
        meta_description: true,
      },
      orderBy: { published_at: "desc" },
      take: 12,
    });

    posts = await Promise.all(
      postsData.map(async (post) => {
        const author = await prisma.user.findUnique({
          where: { id: post.author_id },
          select: { name: true },
        });
        return { ...post, author };
      })
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    posts = [];
  }

  // Generate schema for blog collection
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Spartan Club Blog",
    description: "Artículos sobre desarrollo masculino",
    url: `${BASE_URL}/blog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 12).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
        image: post.cover_image,
        description: post.meta_description || post.excerpt,
        datePublished: post.published_at?.toISOString(),
        ...(post.author && {
          author: {
            "@type": "Person",
            name: post.author.name || "Spartan Club",
          },
        }),
      })),
    },
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: BASE_URL,
      },
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

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Inicio', href: '/' },
          { label: 'Blog', href: '/blog', current: true },
        ]} />

        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-white">Blog Spartan Club</h1>
          <p className="text-xl text-gray-400">
            Artículos expertos sobre entrenamiento, estilo, mentalidad y productividad para tu desarrollo como hombre.
          </p>
        </section>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: BlogPostWithAuthor) => (
              <article
                key={post.slug}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-[#1a1a1a]"
              >
                {post.cover_image && (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover_image}
                      alt={`${post.title} - Artículo de Spartan Club`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-white">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h2>
                  {post.published_at && (
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(post.published_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <p className="text-gray-400 mb-4">
                    {post.meta_description ||
                      post.excerpt ||
                      "Lee este artículo para obtener más información."}
                  </p>
                  <div className="flex justify-between items-center">
                    {post.author && (
                      <span className="text-sm text-gray-500">
                        Por {post.author.name}
                      </span>
                    )}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Leer más →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No hay artículos publicados aún. ¡Vuelve pronto!
            </p>
          </div>
        )}
      </main>
    </>
  );
}
                {post.published_at && (
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(post.published_at).toLocaleDateString("es-ES")}
                  </p>
                )}
                <p className="text-gray-700 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  {post.author && (
                    <span className="text-sm text-gray-600">
                      Por {post.author.name}
                    </span>
                  )}
                  <Link
                    href={`/blog/${post.slug}/`}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Leer más →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No hay artículos publicados aún. ¡Vuelve pronto!
          </p>
        </div>
      )}
    </main>
  );
}
