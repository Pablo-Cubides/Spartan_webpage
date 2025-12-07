import { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import {
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
} from "@/lib/blog/schema-generator";
import Link from "next/link";
import { notFound } from "next/navigation";
import { shouldShowUpdatedDate, formatDate } from "@/lib/blog/utils";

interface Props {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug: params.slug,
      is_published: true,
      category: { slug: params.category },
    },
  });

  if (!post) {
    return {};
  }

  return {
    title: post.meta_title || post.title,
    description: (post.meta_description || post.excerpt) ?? undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: (post.meta_description || post.excerpt) ?? undefined,
      type: "article",
      url: `https://spartanclub.co/blog/${params.category}/${params.slug}/`,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      publishedTime: post.published_at
        ? new Date(post.published_at).toISOString()
        : undefined,
      authors: [],
    },
    alternates: {
      canonical:
        post.slug_canonical ||
        `https://spartanclub.co/blog/${params.category}/${params.slug}/`,
    },
  };
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { is_published: true },
    select: { slug: true, category: { select: { slug: true } } },
  });

  return posts.map((post) => ({
    category: post.category.slug,
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug: params.slug,
      is_published: true,
      category: { slug: params.category },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          bio: true,
          avatar_id: true,
          email: true,
          social_links: true,
        },
      },
      category: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Breadcrumbs para schema
  const breadcrumbs = [
    { label: "Inicio", url: "/" },
    { label: "Blog", url: "/blog/" },
    { label: post.category.name_display, url: `/blog/${post.category.slug}/` },
    { label: post.title, url: `/blog/${post.category.slug}/${post.slug}/` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs, {
    baseUrl: "https://spartanclub.co",
  });

  const postingSchema = generateBlogPostingSchema(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post as any, {
    baseUrl: "https://spartanclub.co",
    siteName: "Spartan Club",
    siteImage: "https://spartanclub.co/og-image.png",
  });

  // Obtener posts relacionados
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      id: { not: post.id },
      is_published: true,
      category_id: post.category_id,
    },
    include: {
      category: true,
    },
    orderBy: { published_at: "desc" },
    take: 3,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="blog-post-container">
        {/* Breadcrumbs */}
        <nav className="breadcrumb" aria-label="breadcrumb">
          <ol>
            {breadcrumbs.slice(0, -1).map((crumb) => (
              <li key={crumb.url}>
                <Link href={crumb.url}>{crumb.label}</Link>
              </li>
            ))}
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {/* Post Header */}
        <header className="post-header">
          <div className="post-meta-top">
            <Link href={`/blog/${post.category.slug}/`} className="category-link">
              {post.category.name_display}
            </Link>
            <span className="reading-time">
              {post.reading_time_minutes || 5} min de lectura
            </span>
          </div>

          <h1>{post.title}</h1>

          <div className="post-meta-info">
            {post.published_at && (
              <span className="publish-date">
                {formatDate(new Date(post.published_at))}
              </span>
            )}
            {post.updated_at &&
              shouldShowUpdatedDate(
                post.published_at || post.created_at,
                post.updated_at
              ) && (
                <span className="update-date">
                  Actualizado: {formatDate(new Date(post.updated_at))}
                </span>
              )}
          </div>
        </header>

        {/* Featured Image */}
        {post.cover_image && (
          <div className="post-featured-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.cover_image_alt || post.title}
              loading="lazy"
            />
          </div>
        )}

        {/* Post Content */}
        <main className="post-content">
          <div className="post-body">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="prose"
            />
          </div>

          {/* Author Bio */}
          {post.author && (
            <aside className="author-section">
              <h3>Sobre el autor</h3>
              <div className="author-card">
                {post.author.avatar_id && (
                  <div className="author-avatar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.author.avatar_id}
                      alt={post.author.name || "Autor"}
                    />
                  </div>
                )}
                <div className="author-info">
                  <h4>{post.author.name || "Spartan Club"}</h4>
                  {post.author.bio && <p>{post.author.bio}</p>}
                  {post.author.social_links && post.author.social_links.length > 0 && (
                    <div className="social-links">
                      {post.author.social_links.map(
                        (link: { id: number; platform: string; url: string }) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={link.platform}
                        >
                          {link.platform}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <aside className="related-posts">
              <h3>Artículos relacionados</h3>
              <div className="related-grid">
                {relatedPosts.map((relPost) => (
                  <div key={relPost.slug} className="related-card">
                    {relPost.cover_image && (
                      <div className="related-image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={relPost.cover_image}
                          alt={relPost.title}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="related-content">
                      <h4>
                        <Link
                          href={`/blog/${relPost.category.slug}/${relPost.slug}/`}
                        >
                          {relPost.title}
                        </Link>
                      </h4>
                      <p>{relPost.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </main>
      </article>

      <style jsx>{`
        .blog-post-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .breadcrumb {
          margin-bottom: 30px;
        }

        .breadcrumb ol {
          display: flex;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 14px;
          flex-wrap: wrap;
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

        .post-header {
          margin-bottom: 40px;
        }

        .post-meta-top {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .category-link {
          color: #d4af37;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
        }

        .category-link:hover {
          text-decoration: underline;
        }

        .reading-time {
          color: #999;
          font-size: 14px;
        }

        .post-header h1 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .post-meta-info {
          display: flex;
          gap: 20px;
          font-size: 14px;
          color: #999;
          flex-wrap: wrap;
        }

        .publish-date,
        .update-date {
          display: flex;
          gap: 6px;
        }

        .post-featured-image {
          width: 100%;
          height: 500px;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 40px;
          background: #f5f5f5;
        }

        .post-featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-content {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }

        .post-body {
          font-size: 16px;
          line-height: 1.7;
          color: #333;
        }

        .post-body :global(h2) {
          font-size: 28px;
          font-weight: 700;
          margin: 40px 0 20px;
          color: #1a1a1a;
        }

        .post-body :global(h3) {
          font-size: 22px;
          font-weight: 600;
          margin: 30px 0 16px;
          color: #1a1a1a;
        }

        .post-body :global(p) {
          margin-bottom: 16px;
        }

        .post-body :global(ul),
        .post-body :global(ol) {
          margin-bottom: 16px;
          margin-left: 24px;
        }

        .post-body :global(li) {
          margin-bottom: 8px;
        }

        .post-body :global(a) {
          color: #d4af37;
          text-decoration: none;
        }

        .post-body :global(a:hover) {
          text-decoration: underline;
        }

        .post-body :global(blockquote) {
          border-left: 4px solid #d4af37;
          padding: 16px 24px;
          margin: 24px 0;
          background: #f9f9f9;
          font-style: italic;
          color: #666;
        }

        .post-body :global(code) {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          color: #d4af37;
        }

        .post-body :global(pre) {
          background: #1a1a1a;
          padding: 16px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 16px 0;
        }

        .post-body :global(pre code) {
          background: none;
          padding: 0;
          color: #0f0;
        }

        .author-section {
          border-top: 2px solid #f0f0f0;
          padding-top: 40px;
        }

        .author-section h3,
        .related-posts h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #1a1a1a;
        }

        .author-card {
          display: flex;
          gap: 24px;
          background: #f9f9f9;
          padding: 24px;
          border-radius: 8px;
        }

        .author-avatar {
          flex-shrink: 0;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          background: #e0e0e0;
        }

        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .author-info {
          flex: 1;
        }

        .author-info h4 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .author-info p {
          color: #666;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-links a {
          padding: 6px 12px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          color: #d4af37;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .social-links a:hover {
          border-color: #d4af37;
          background: #d4af37;
          color: white;
        }

        .related-posts {
          border-top: 2px solid #f0f0f0;
          padding-top: 40px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .related-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .related-card:hover {
          border-color: #d4af37;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1);
        }

        .related-image {
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .related-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .related-content {
          padding: 16px;
        }

        .related-content h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .related-content h4 a {
          color: #1a1a1a;
          text-decoration: none;
        }

        .related-content h4 a:hover {
          color: #d4af37;
        }

        .related-content p {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .blog-post-container {
            padding: 16px;
          }

          .post-header h1 {
            font-size: 32px;
          }

          .post-featured-image {
            height: 300px;
          }

          .author-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .author-avatar {
            width: 100px;
            height: 100px;
          }

          .related-grid {
            grid-template-columns: 1fr;
          }

          .post-body {
            font-size: 15px;
          }

          .post-body :global(h2) {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}
