import type { Metadata } from "next";

const BASE_URL = "https://spartanclub.vercel.app";

export interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  path: string;
  canonical?: string;
}

export function generatePageMetadata(config: PageMetadataConfig): Metadata {
  const canonical = config.canonical || `${BASE_URL}${config.path}`;
  const ogImage = config.ogImage || `${BASE_URL}/og-image-default.png`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: config.author ? [{ name: config.author }] : undefined,

    openGraph: {
      title: config.title,
      description: config.description,
      type: config.ogType || "website",
      url: canonical,
      siteName: "Triarvon",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      ...(config.ogType === "article" && {
        publishedTime: config.articlePublishedTime,
        modifiedTime: config.articleModifiedTime,
        authors: config.articleAuthor ? [config.articleAuthor] : [],
        section: config.articleSection,
      }),
    },

    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [ogImage],
      creator: "@triarvon",
    },

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

// Helper for blog articles
export function generateArticleMetadata(config: {
  title: string;
  description: string;
  ogImage: string;
  publishedTime: string;
  modifiedTime: string;
  author: string;
  section: string;
  keywords: string[];
  path: string;
}): Metadata {
  return generatePageMetadata({
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    author: config.author,
    ogImage: config.ogImage,
    ogType: "article",
    articlePublishedTime: config.publishedTime,
    articleModifiedTime: config.modifiedTime,
    articleAuthor: config.author,
    articleSection: config.section,
    path: config.path,
  });
}
