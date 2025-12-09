/**
 * Generador de schemas JSON-LD para SEO
 * Google usa estos schemas para entender el contenido
 */

import { BlogBreadcrumb } from "@/types/blog";

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
  post: Record<string, unknown>, // Post object with author included
  options: SchemaOptions
) {
  const typedPost = post as Record<string, unknown>;
  const postUrl = `${options.baseUrl}/blog/${typedPost.category_slug}/${typedPost.slug}/`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: typedPost.meta_title || typedPost.title,
    description: typedPost.meta_description || typedPost.excerpt,
    image: typedPost.cover_image ? [typedPost.cover_image] : [],
    datePublished: ((typedPost.published_at as Date | null) || (typedPost.created_at as Date)).toISOString(),
    dateModified: (typedPost.updated_at as Date).toISOString(),
    ...((typedPost.author as Record<string, unknown> | null) && {
      author: {
        "@type": "Person",
        name: ((typedPost.author as Record<string, unknown>).name as string | null) || "Spartan Club",
        url: `${options.baseUrl}/autor/${((typedPost.author as Record<string, unknown>).name as string | null)?.toLowerCase().replace(/\s+/g, "-")}`,
        image: (typedPost.author as Record<string, unknown>).avatar_id
          ? { "@type": "ImageObject", url: (typedPost.author as Record<string, unknown>).avatar_id as string }
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
    keywords: (typedPost.expertise_areas as string[] | null)?.join(", ") || (typedPost.tags as string[] | null)?.join(", "),
    wordCount: Math.ceil((typedPost.content as string).split(/\s+/).length),
    timeRequired: `PT${(typedPost.reading_time_minutes as number | null) || 5}M`,
    inLanguage: "es-ES",
    isAccessibleForFree: true,
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
 * Genera schema CollectionPage para categorías de blog
 */
export function generateCollectionPageSchema(
  posts: Record<string, unknown>[], // Array of posts with authors included
  options: SchemaOptions & { collectionName: string; collectionUrl: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.collectionName,
    url: options.collectionUrl,
    description: `Artículos en la categoría ${options.collectionName}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => {
        const typedPost = post as Record<string, unknown>;
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "BlogPosting",
            headline: typedPost.title,
            url: `${options.baseUrl}/blog/${typedPost.category_slug}/${typedPost.slug}`,
            datePublished: ((typedPost.published_at as Date | null) || (typedPost.created_at as Date)).toISOString(),
            author: {
              "@type": "Person",
              name: ((typedPost.author as Record<string, unknown> | null)?.name as string | null) || "Spartan Club",
            },
          },
        };
      }),
    },
    publisher: {
      "@type": "Organization",
      name: options.siteName || "Spartan Club",
      logo: {
        "@type": "ImageObject",
        url: options.siteImage || `${options.baseUrl}/logo.png`,
      },
    },
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
