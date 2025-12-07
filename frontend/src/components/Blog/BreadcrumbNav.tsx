import React from "react";
import Link from "next/link";
import { BlogBreadcrumb } from "@/types/blog";

interface BreadcrumbNavProps {
  items: BlogBreadcrumb[];
  schema?: Record<string, unknown>; // Schema JSON-LD
}

/**
 * Navegación de breadcrumbs para SEO y UX
 * Muestra ruta completa: Inicio > Blog > Categoría > Artículo
 * Incluye schema.org BreadcrumbList automático
 */
export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  items,
  schema,
}) => {
  return (
    <>
      <nav
        aria-label="breadcrumb"
        className="breadcrumb-nav"
      >
        <ol className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {item.active ? (
                <span className="active">{item.label}</span>
              ) : (
                <Link href={item.url}>{item.label}</Link>
              )}
              {index < items.length - 1 && (
                <span className="separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <style jsx>{`
        .breadcrumb-nav {
          margin-bottom: 2rem;
        }

        .breadcrumb-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.9rem;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .breadcrumb-item a {
          color: #2563eb;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb-item a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .breadcrumb-item span.active {
          color: #6b7280;
          font-weight: 600;
        }

        .separator {
          color: #d1d5db;
        }

        @media (max-width: 640px) {
          .breadcrumb-list {
            font-size: 0.8rem;
            gap: 0.25rem;
          }

          .separator {
            margin: 0 0.25rem;
          }
        }
      `}</style>
    </>
  );
};
