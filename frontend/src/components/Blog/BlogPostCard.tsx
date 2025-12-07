import React from "react";
import Link from "next/link";
import { BlogPost, BlogCategory } from "@/types/blog";

interface BlogPostCardProps {
  post: BlogPost;
  category: BlogCategory;
  showExcerpt?: boolean;
}

/**
 * Tarjeta de artículo del blog para listados de categoría
 * Muestra: título, fecha, extracto, link a leer más
 */
export const BlogPostCard: React.FC<BlogPostCardProps> = ({
  post,
  category,
  showExcerpt = true,
}) => {
  const postUrl = `/blog/${category.slug}/${post.slug}/`;

  return (
    <article className="blog-post-card">
      {post.cover_image && (
        <div className="post-image">
          <Link href={postUrl}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.cover_image_alt || `Portada del artículo ${post.title}`}
              loading="lazy"
            />
          </Link>
        </div>
      )}

      <div className="post-content">
        <h3>
          <Link href={postUrl}>{post.title}</Link>
        </h3>

        <div className="post-meta">
          <time dateTime={new Date(post.published_at || post.created_at).toISOString()}>
            {new Date(post.published_at || post.created_at).toLocaleDateString(
              "es-ES",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </time>

          {post.reading_time_minutes && (
            <span className="reading-time">
              {post.reading_time_minutes} min de lectura
            </span>
          )}
        </div>

        {showExcerpt && post.excerpt && (
          <p className="post-excerpt">{post.excerpt}</p>
        )}

        <Link href={postUrl} className="read-more">
          Leer más →
        </Link>
      </div>

      <style jsx>{`
        .blog-post-card {
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .blog-post-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }

        .post-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .blog-post-card:hover .post-image img {
          transform: scale(1.05);
        }

        .post-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
        }

        h3 a {
          color: inherit;
          text-decoration: none;
        }

        h3 a:hover {
          color: #2563eb;
        }

        .post-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        time {
          display: block;
        }

        .reading-time {
          display: block;
        }

        .post-excerpt {
          margin: 0;
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.6;
          flex: 1;
        }

        .read-more {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
          align-self: flex-start;
        }

        .read-more:hover {
          color: #1d4ed8;
        }
      `}</style>
    </article>
  );
};
