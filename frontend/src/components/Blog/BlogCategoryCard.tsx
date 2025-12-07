import React from "react";
import Link from "next/link";
import { BlogCategory } from "@/types/blog";

interface BlogCategoryCardProps {
  category: BlogCategory;
}

/**
 * Tarjeta de categoría del blog para mostrar en listados
 * Muestra: nombre épico, descripción breve, enlace a categoría
 */
export const BlogCategoryCard: React.FC<BlogCategoryCardProps> = ({
  category,
}) => {
  return (
    <article className="blog-category-card">
      {category.featured_image && (
        <div className="category-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.featured_image}
            alt={`Imagen de la categoría ${category.name_display}`}
            loading="lazy"
          />
        </div>
      )}

      <div className="category-content">
        <h2>
          <Link href={`/blog/${category.slug}/`}>
            {category.name_display}
          </Link>
        </h2>

        {category.description && (
          <p className="category-description">{category.description}</p>
        )}

        <Link
          href={`/blog/${category.slug}/`}
          className="read-more"
          aria-label={`Ver artículos de ${category.name_display}`}
        >
          Ver artículos →
        </Link>
      </div>

      <style jsx>{`
        .blog-category-card {
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .blog-category-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }

        .category-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .category-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        h2 a {
          color: inherit;
          text-decoration: none;
        }

        h2 a:hover {
          color: #2563eb;
        }

        .category-description {
          margin: 0;
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.5;
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
