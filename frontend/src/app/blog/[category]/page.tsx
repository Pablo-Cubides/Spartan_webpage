import { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import { generateCollectionPageSchema } from "@/lib/blog/schema-generator";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await prisma.blogCategory.findUnique({
    where: { slug: params.category },
  });

  if (!category) {
    return {};
  }

  return {
    title: category.meta_title || `${category.name_display} | Spartan Club`,
    description: (category.meta_description) ?? undefined,
    openGraph: {
      title: category.meta_title || category.name_display,
      description: (category.meta_description) ?? undefined,
      type: "website",
      url: `https://spartanclub.co/blog/${category.slug}/`,
      images: category.featured_image ? [{ url: category.featured_image }] : [],
    },
    alternates: {
      canonical: `https://spartanclub.co/blog/${category.slug}/`,
    },
  };
}

export async function generateStaticParams() {
  const categories = await prisma.blogCategory.findMany({
    where: { is_active: true },
    select: { slug: true },
  });

  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

const POSTS_PER_PAGE = 12;

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await prisma.blogCategory.findUnique({
    where: { slug: params.category },
  });

  if (!category || !category.is_active) {
    notFound();
  }

  const page = parseInt(searchParams.page || "1");
  const skip = (page - 1) * POSTS_PER_PAGE;

  // Obtener total de posts
  const total = await prisma.blogPost.count({
    where: { category_id: category.id, is_published: true },
  });

  const posts = await prisma.blogPost.findMany({
    where: { category_id: category.id, is_published: true },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      cover_image: true,
      reading_time_minutes: true,
      published_at: true,
      author: {
        select: { name: true },
      },
    },
    orderBy: { published_at: "desc" },
    skip,
    take: POSTS_PER_PAGE,
  });

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  // Generar schema
  const postsWithRelations = await prisma.blogPost.findMany({
    where: { category_id: category.id, is_published: true },
    include: {
      author: true,
    },
    orderBy: { published_at: "desc" },
  });

  const schema = generateCollectionPageSchema(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postsWithRelations as any,
    {
      baseUrl: "https://spartanclub.co",
      siteName: "Spartan Club",
    }
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="category-main">
        {/* Breadcrumbs */}
        <nav className="breadcrumb" aria-label="breadcrumb">
          <ol>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link href="/blog/">Blog</Link>
            </li>
            <li aria-current="page">{category.name_display}</li>
          </ol>
        </nav>

        {/* Header */}
        <section className="category-header">
          {category.featured_image && (
            <div className="header-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.featured_image}
                alt={category.name_display}
                loading="lazy"
              />
            </div>
          )}
          <div className="header-content">
            <h1>{category.name_display}</h1>
            {category.description && <p>{category.description}</p>}
            <p className="post-count">
              {total} artículo{total !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="posts-section">
          {posts.length > 0 ? (
            <div className="posts-grid">
              {posts.map((post) => (
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
                      <span>{post.reading_time_minutes || 5} min de lectura</span>
                      {post.published_at && (
                        <span>
                          {new Date(post.published_at).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      )}
                    </div>
                    <h3>
                      <Link href={`/blog/${category.slug}/${post.slug}/`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p>{post.excerpt}</p>
                    <div className="post-footer">
                      {post.author.name && (
                        <span className="author">Por {post.author.name}</span>
                      )}
                      <Link
                        href={`/blog/${category.slug}/${post.slug}/`}
                        className="read-more"
                      >
                        Leer más →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-posts">
              <p>No hay artículos publicados en esta categoría todavía.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 && (
                <Link
                  href={`/blog/${category.slug}/?page=${page - 1}`}
                  className="page-link prev"
                >
                  ← Anterior
                </Link>
              )}

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 1 && p <= page + 1)
                  )
                  .map((p, idx, arr) => (
                    <div key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="page-ellipsis">...</span>
                      )}
                      {p === page ? (
                        <span className="page-current">{p}</span>
                      ) : (
                        <Link
                          href={`/blog/${category.slug}/?page=${p}`}
                          className="page-link"
                        >
                          {p}
                        </Link>
                      )}
                    </div>
                  ))}
              </div>

              {page < totalPages && (
                <Link
                  href={`/blog/${category.slug}/?page=${page + 1}`}
                  className="page-link next"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .category-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .breadcrumb {
          margin-bottom: 40px;
        }

        .breadcrumb ol {
          display: flex;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 14px;
        }

        .breadcrumb li {
          display: flex;
          align-items: center;
        }

        .breadcrumb li:not(:last-child)::after {
          content: "/";
          margin-left: 8px;
          color: #ccc;
        }

        .breadcrumb a {
          color: #d4af37;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .category-header {
          margin-bottom: 60px;
        }

        .header-image {
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .header-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-content {
          text-align: center;
        }

        .category-header h1 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
        }

        .category-header p {
          font-size: 16px;
          color: #666;
          margin-bottom: 12px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .post-count {
          color: #d4af37 !important;
          font-weight: 600;
        }

        .posts-section {
          margin-bottom: 60px;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .post-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
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
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .post-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 12px;
          color: #999;
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

        .post-content > p {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .author {
          font-size: 12px;
          color: #999;
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

        .no-posts {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .page-link {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          color: #1a1a1a;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .page-link:hover {
          border-color: #d4af37;
          color: #d4af37;
        }

        .page-current {
          padding: 8px 12px;
          border: 1px solid #d4af37;
          border-radius: 4px;
          color: #d4af37;
          font-weight: 600;
        }

        .page-numbers {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .page-numbers div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-ellipsis {
          color: #999;
        }

        @media (max-width: 768px) {
          .category-header h1 {
            font-size: 32px;
          }

          .header-image {
            height: 250px;
          }

          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
