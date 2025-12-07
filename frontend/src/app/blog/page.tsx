import { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import { generateWebSiteSchema } from "@/lib/blog/schema-generator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog Spartan Club – Artículos sobre Desarrollo Masculino",
  description:
    "Descubre artículos sobre entrenamiento físico, estilo, mentalidad y productividad para hombres. Contenidos de calidad para tu desarrollo personal.",
  openGraph: {
    title: "Blog Spartan Club",
    description:
      "Artículos sobre cuerpo, estilo, mentalidad y productividad para hombres",
    type: "website",
    url: "https://spartanclub.co/blog/",
  },
  alternates: {
    canonical: "https://spartanclub.co/blog/",
  },
};

export default async function BlogPage() {
  const categories = await prisma.blogCategory.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
  });

  const allPosts = await prisma.blogPost.findMany({
    where: { is_published: true },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      cover_image: true,
      reading_time_minutes: true,
      published_at: true,
      category: {
        select: { slug: true, name_display: true },
      },
      author: {
        select: { name: true },
      },
    },
    orderBy: { published_at: "desc" },
    take: 9,
  });

  // Generar schemas
  const websiteSchema = generateWebSiteSchema("https://spartanclub.co", {
    siteName: "Spartan Club",
    siteImage: "https://spartanclub.co/og-image.png",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <main className="blog-main">
        {/* Header */}
        <section className="blog-header">
          <h1>Blog Spartan Club</h1>
          <p>
            Artículos sobre entrenamiento físico, estilo, mentalidad y
            productividad para tu desarrollo como hombre
          </p>
        </section>

        {/* Categorías */}
        <section className="blog-categories">
          <h2>Categorías</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                {category.featured_image && (
                  <div className="category-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.featured_image}
                      alt={`Categoría ${category.name_display}`}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="category-content">
                  <h3>
                    <Link href={`/blog/${category.slug}/`}>
                      {category.name_display}
                    </Link>
                  </h3>
                  <p>{category.description}</p>
                  <Link href={`/blog/${category.slug}/`} className="read-more">
                    Ver artículos →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Artículos destacados */}
        <section className="blog-featured">
          <h2>Últimos artículos</h2>
          <div className="posts-grid">
            {allPosts.map((post) => (
              <article key={post.slug} className="post-card">
                {post.cover_image && (
                  <div className="post-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="post-content">
                  <div className="post-meta">
                    <Link href={`/blog/${post.category.slug}/`}>
                      {post.category.name_display}
                    </Link>
                    <span>
                      {post.reading_time_minutes || 5} min de lectura
                    </span>
                  </div>
                  <h3>
                    <Link href={`/blog/${post.category.slug}/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p>{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.category.slug}/${post.slug}/`}
                    className="read-more"
                  >
                    Leer artículo →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        .blog-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .blog-header h1 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
        }

        .blog-header p {
          font-size: 18px;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .blog-categories {
          margin-bottom: 80px;
        }

        .blog-categories h2,
        .blog-featured h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 40px;
          color: #1a1a1a;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .category-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }

        .category-card:hover {
          border-color: #d4af37;
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.1);
        }

        .category-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .category-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-content {
          padding: 24px;
        }

        .category-content h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .category-content h3 a {
          color: #1a1a1a;
          text-decoration: none;
        }

        .category-content h3 a:hover {
          color: #d4af37;
        }

        .category-content p {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .read-more {
          color: #d4af37;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .read-more:hover {
          color: #1a1a1a;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }

        .post-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }

        .post-card:hover {
          border-color: #d4af37;
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.1);
        }

        .post-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-content {
          padding: 24px;
        }

        .post-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 12px;
          color: #999;
        }

        .post-meta a {
          color: #d4af37;
          text-decoration: none;
          font-weight: 600;
        }

        .post-content h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .post-content h3 a {
          color: #1a1a1a;
          text-decoration: none;
        }

        .post-content h3 a:hover {
          color: #d4af37;
        }

        .post-content p {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .blog-main {
            padding: 20px;
          }

          .blog-header h1 {
            font-size: 32px;
          }

          .blog-categories h2,
          .blog-featured h2 {
            font-size: 24px;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
