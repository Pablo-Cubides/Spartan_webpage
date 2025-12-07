/**
 * Generador de schemas JSON-LD para SEO
 * Google usa estos schemas para entender el contenido
 */

import { BlogCategory, BlogBreadcrumb, BlogPostWithRelations } from "@/types/blog";

interface SchemaOptions {
  baseUrl: string;
  siteName?: string;
  siteImage?: string;
}

/**
 * Genera schema BlogPosting para un artículo
 * Incluye: headline, description, image, author, datePublished, dateModified
 */
export function generateBlogPostingSchema(
  post: BlogPostWithRelations,
  options: SchemaOptions
) {
  const postUrl = `${options.baseUrl}/blog/${post.category.slug}/${post.slug}/`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image ? [post.cover_image] : [],
    datePublished: (post.published_at || post.created_at).toISOString(),
    dateModified: post.updated_at.toISOString(),
    ...(post.author && {
      author: {
        "@type": "Person",
        name: post.author.name || "Spartan Club",
        url: `${options.baseUrl}/autor/${post.author.name?.toLowerCase().replace(/\s+/g, "-")}`,
        // sameAs con redes sociales del autor
        sameAs: post.author.socialLinks?.map((link) => link.url) || [],
        image: post.author.avatar_id
          ? { "@type": "ImageObject", url: post.author.avatar_id }
          : undefined,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: options.siteName || "Spartan Club",
      logo: {
        "@type": "ImageObject",
        url: options.siteImage || `${options.baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    articleSection: post.category.name_display,
    keywords: post.expertise_areas?.join(", ") || post.tags?.join(", "),
    wordCount: Math.ceil(post.content.split(/\s+/).length),
    timeRequired: `PT${post.reading_time_minutes || 5}M`,
    inLanguage: "es-ES",
    isAccessibleForFree: true,
  };
}

/**
 * Genera schema CollectionPage para páginas de categoría
 */
export function generateCollectionPageSchema(
  category: BlogCategory,
  posts: BlogPostWithRelations[],
  options: SchemaOptions
) {
  const categoryUrl = `${options.baseUrl}/blog/${category.slug}/`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name_display,
    description: category.meta_description || category.description,
    url: categoryUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${options.baseUrl}/blog/${category.slug}/${post.slug}/`,
        name: post.title,
        image: post.cover_image,
        description: post.excerpt,
        datePublished: (post.published_at || post.created_at).toISOString(),
        ...(post.author && {
          author: {
            "@type": "Person",
            name: post.author.name || "Spartan Club",
          },
        }),
      })),
    },
  };
}

/**
 * Genera schema BreadcrumbList para navegación
 */
export function generateBreadcrumbSchema(
  breadcrumbs: BlogBreadcrumb[],
  options: SchemaOptions
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.label,
      item: `${options.baseUrl}${breadcrumb.url}`,
    })),
  };
}

/**
 * Genera schema FAQPage si el artículo contiene FAQs
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Genera schema Organization para el sitio global
 */
export function generateOrganizationSchema(
  name: string,
  url: string,
  logo: string,
  socialProfiles: string[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    sameAs: socialProfiles,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-XXXXXXXXXX",
      contactType: "Customer Support",
    },
  };
}

/**
 * Genera schema WebSite con SearchAction
 * Permite búsqueda desde Google Search
 */
export function generateWebSiteSchema(
  url: string,
  options?: { siteName?: string; searchUrl?: string; siteImage?: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: options?.siteName || "Spartan Club",
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: options?.searchUrl || `${url}/blog/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Combina múltiples schemas en un array
 * Útil para inyectar varios schemas en una página
 */
export function combineSchemas(...schemas: Record<string, unknown>[]): Record<string, unknown>[] {
  return schemas.filter(Boolean);
}

/**
 * Genera Person schema para autor con E-E-A-T
 */
export function generatePersonSchema(
  author: {
    name: string;
    bio?: string;
    avatar?: string;
    expertise_areas?: string[];
    socialLinks?: { platform: string; url: string }[];
  },
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${baseUrl}/autor/${author.name.toLowerCase().replace(/\s+/g, "-")}`,
    image: author.avatar,
    description: author.bio,
    knowsAbout: author.expertise_areas || [],
    sameAs: author.socialLinks?.map((link) => link.url) || [],
  };
}
