import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/static-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Static pages
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      // Blog categories (hubs)
      {
        url: `${BASE_URL}/blog/entrenamiento-y-energia-fisica`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/blog/estilo-y-presencia`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/blog/mentalidad-y-disciplina`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/blog/productividad-y-gestion-del-tiempo`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/herramientas`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/herramientas/asesor-estilo`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/herramientas/asesor-forma-cara`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/herramientas/couch_spartano`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/nosotros`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/politica-de-privacidad`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/terminos-y-condiciones`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];

    // Dynamic blog posts from static data (ADR 003)
    const blogPosts = getAllPosts();

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.category_slug}/${post.slug}`,
      lastModified: new Date(post.published_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return at least static routes if DB fails
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}
