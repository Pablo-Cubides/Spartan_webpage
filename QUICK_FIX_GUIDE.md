# 🚀 GUÍA DE IMPLEMENTACIÓN RÁPIDA - SEO FIXES

## Soluciones Listas para Copiar y Pegar

---

## 1️⃣ CREAR robots.txt

**Archivo:** `frontend/public/robots.txt`

```
# Spartan Club - robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /private
Disallow: /*.json$
Disallow: /_next/
Disallow: /public/

# Sitemaps
Sitemap: https://spartanclub.co/sitemap.xml

# Crawl delay
Crawl-delay: 0.5

# Specific rules
User-agent: AdsBot-Google
Disallow: /admin

User-agent: Googlebot
Allow: /
Crawl-delay: 0.5
```

---

## 2️⃣ CREAR sitemap.ts

**Archivo:** `frontend/src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/server/prisma';

const BASE_URL = 'https://spartanclub.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Static pages
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/herramientas`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/herramientas/asesor-estilo`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/herramientas/asesor-forma-cara`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/nosotros`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/politica-de-privacidad`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/terminos-y-condiciones`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ];

    // Dynamic blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { is_published: true },
      select: {
        slug: true,
        updated_at: true,
        created_at: true,
        category: {
          select: { slug: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.category.slug}/${post.slug}`,
      lastModified: post.updated_at || post.created_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least static routes if DB fails
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
```

---

## 3️⃣ MEJORAR layout.tsx

**Archivo:** `frontend/src/app/layout.tsx`

```tsx
import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Inter, Noto_Sans } from 'next/font/google';
import { assertEnvironment } from '@/lib/config/validate-env';
import type { Metadata } from 'next';

// Validate environment at startup
if (
  process.env.NODE_ENV === 'production' &&
  typeof window === 'undefined' &&
  !process.env.NEXT_PHASE?.includes('build')
) {
  assertEnvironment();
}

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-noto-sans' });

const BASE_URL = 'https://spartanclub.co';

export const metadata: Metadata = {
  // ==================== Basic ====================
  title: {
    template: '%s | Spartan Club',
    default: 'Spartan Club - Forja tu Potencial de Guerrero Espartano',
  },
  description:
    'Plataforma de desarrollo personal masculino. Accede a herramientas de IA, artículos sobre entrenamiento, estilo y mentalidad. Únete a la comunidad de hombres disciplinados en su búsqueda de excelencia.',
  keywords: [
    'desarrollo masculino',
    'autoayuda',
    'entrenamiento',
    'estilo de vida',
    'mentalidad',
    'comunidad',
    'asesor de estilo',
    'hombre spartano',
  ],
  
  // ==================== Metadata ====================
  authors: [{ name: 'Spartan Club', url: BASE_URL }],
  creator: 'Spartan Club',
  publisher: 'Spartan Club',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },

  // ==================== Robots & Indexing ====================
  robots: {
    index: true,
    follow: true,
    nocache: false,
    nosnippet: false,
    noarchive: false,
    noimageindex: false,
    maxSnippet: -1,
    maxImagePreview: 'large',
    maxVideoPreview: -1,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ==================== Open Graph ====================
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['en_US'],
    url: BASE_URL,
    siteName: 'Spartan Club',
    title: 'Spartan Club - Forja tu Potencial de Guerrero Espartano',
    description:
      'Herramientas de IA y comunidad para tu desarrollo personal masculino.',
    images: [
      {
        url: `${BASE_URL}/og-image-default.png`,
        width: 1200,
        height: 630,
        alt: 'Spartan Club - Forja tu Potencial',
        type: 'image/png',
      },
      {
        url: `${BASE_URL}/og-image-square.png`,
        width: 800,
        height: 800,
        alt: 'Spartan Club Logo',
        type: 'image/png',
      },
    ],
  },

  // ==================== Twitter/X ====================
  twitter: {
    card: 'summary_large_image',
    title: 'Spartan Club',
    description: 'Plataforma de desarrollo personal masculino',
    images: [`${BASE_URL}/twitter-image.png`],
    creator: '@spartanclub',
    site: '@spartanclub',
  },

  // ==================== Icons & Theme ====================
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'icon',
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Spartan Club',
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],

  // ==================== Viewport ====================
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },

  // ==================== Verification ====================
  verification: {
    google: 'YOUR-GOOGLE-SITE-VERIFICATION-CODE',
    // yandex: 'YOUR-YANDEX-CODE',
    // me: ['example@domain.com'],
  },

  // ==================== Alternates ====================
  alternates: {
    canonical: BASE_URL,
    languages: {
      es: BASE_URL,
      en: `${BASE_URL}/en`,
    },
  },

  // ==================== App Links ====================
  appLinks: {
    ios: {
      url: 'https://apps.apple.com/app/spartan-club/id123456789',
      app_store_id: '123456789',
    },
    android: {
      package: 'com.spartanclub.android',
      app_name: 'Spartan Club',
    },
  },
};

// Organization Schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Spartan Club',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    '@id': `${BASE_URL}/#logo`,
    url: `${BASE_URL}/Logo spartan club.png`,
    width: 512,
    height: 512,
    caption: 'Spartan Club',
  },
  image: {
    '@id': `${BASE_URL}/#logo`,
  },
  description:
    'Plataforma de desarrollo personal masculino con herramientas de IA y comunidad.',
  sameAs: [
    'https://twitter.com/spartanclub',
    'https://instagram.com/spartanclub',
    'https://youtube.com/@spartanclub',
    'https://linkedin.com/company/spartan-club',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    // email: 'support@spartanclub.co',
  },
  foundingDate: '2024',
  areaServed: {
    '@type': 'Country',
    name: 'CO',
  },
};

// WebSite Schema with SearchAction
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Spartan Club',
  description: 'Plataforma de desarrollo personal masculino',
  publisher: {
    '@id': `${BASE_URL}/#organization`,
  },
  potentialAction: [
    {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${notoSans.variable}`}>
      <head>
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="relative flex size-full min-h-screen flex-col bg-[#141414] text-white font-sans">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

---

## 4️⃣ MEJORAR /blog/page.tsx

**Archivo:** `frontend/src/app/blog/page.tsx`

```tsx
import { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import Link from "next/link";
import { generateWebSiteSchema } from "@/lib/blog/schema-generator";

const BASE_URL = "https://spartanclub.co";

export const metadata: Metadata = {
  title: "Blog | Spartan Club - Artículos de Desarrollo Masculino",
  description:
    "Explora nuestro blog con artículos expertos sobre entrenamiento, estilo de vida, mentalidad y productividad. Consejos prácticos para tu desarrollo personal como hombre.",
  keywords: [
    "blog",
    "entrenamiento",
    "estilo",
    "mentalidad",
    "productividad",
    "desarrollo personal",
  ],
  
  openGraph: {
    title: "Blog | Spartan Club",
    description:
      "Artículos sobre desarrollo masculino, entrenamiento y estilo de vida.",
    type: "website",
    url: `${BASE_URL}/blog`,
    images: [
      {
        url: `${BASE_URL}/og-blog.png`,
        width: 1200,
        height: 630,
        alt: "Spartan Club Blog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Blog | Spartan Club",
    description: "Artículos sobre desarrollo masculino",
    images: [`${BASE_URL}/og-blog.png`],
  },

  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
};

export default async function BlogPage() {
  type BlogPostWithAuthor = {
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image: string | null;
    published_at: Date | null;
    author_id: number;
    author?: { name: string | null } | null;
    meta_description?: string | null;
  };

  let posts: BlogPostWithAuthor[] = [];

  try {
    const postsData = await prisma.blogPost.findMany({
      where: { is_published: true },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        cover_image: true,
        published_at: true,
        author_id: true,
        meta_description: true,
      },
      orderBy: { published_at: "desc" },
      take: 12,
    });

    posts = await Promise.all(
      postsData.map(async (post) => {
        const author = await prisma.user.findUnique({
          where: { id: post.author_id },
          select: { name: true },
        });
        return { ...post, author };
      })
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    posts = [];
  }

  // Generate schema for blog collection
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Spartan Club Blog",
    description: "Artículos sobre desarrollo masculino",
    url: `${BASE_URL}/blog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 12).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
        image: post.cover_image,
        description: post.meta_description || post.excerpt,
        datePublished: post.published_at?.toISOString(),
        ...(post.author && {
          author: {
            "@type": "Person",
            name: post.author.name || "Spartan Club",
          },
        }),
      })),
    },
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="text-blue-600 hover:underline">Inicio</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">Blog</li>
          </ol>
        </nav>

        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-white">Blog Spartan Club</h1>
          <p className="text-xl text-gray-400">
            Artículos expertos sobre entrenamiento, estilo, mentalidad y productividad para tu desarrollo como hombre.
          </p>
        </section>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: BlogPostWithAuthor) => (
              <article
                key={post.slug}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition bg-[#1a1a1a]"
              >
                {post.cover_image && (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover_image}
                      alt={`${post.title} - Artículo de Spartan Club`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-white">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h2>
                  {post.published_at && (
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(post.published_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <p className="text-gray-400 mb-4">
                    {post.meta_description ||
                      post.excerpt ||
                      "Lee este artículo para obtener más información."}
                  </p>
                  <div className="flex justify-between items-center">
                    {post.author && (
                      <span className="text-sm text-gray-500">
                        Por {post.author.name}
                      </span>
                    )}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Leer más →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No hay artículos publicados aún. ¡Vuelve pronto!
            </p>
          </div>
        )}
      </main>
    </>
  );
}
```

---

## 5️⃣ CREAR public/manifest.json

**Archivo:** `frontend/public/manifest.json`

```json
{
  "name": "Spartan Club",
  "short_name": "Spartan",
  "description": "Plataforma de desarrollo personal masculino",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#141414",
  "theme_color": "#C62828",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/favicon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/favicon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-540x720.png",
      "sizes": "540x720",
      "type": "image/png"
    },
    {
      "src": "/screenshot-1080x1440.png",
      "sizes": "1080x1440",
      "type": "image/png"
    }
  ],
  "categories": ["lifestyle", "education"],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

---

## 6️⃣ CREAR lib/seo/metadata.ts

**Archivo:** `frontend/src/lib/seo/metadata.ts`

```typescript
import type { Metadata, ResolvingMetadata } from 'next';

const BASE_URL = 'https://spartanclub.co';

export interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
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
      type: config.ogType || 'website',
      url: canonical,
      siteName: 'Spartan Club',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      ...(config.ogType === 'article' && {
        publishedTime: config.articlePublishedTime,
        modifiedTime: config.articleModifiedTime,
        authors: config.articleAuthor ? [config.articleAuthor] : [],
        section: config.articleSection,
      }),
    },

    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [ogImage],
      creator: '@spartanclub',
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
    ogType: 'article',
    articlePublishedTime: config.publishedTime,
    articleModifiedTime: config.modifiedTime,
    articleAuthor: config.author,
    articleSection: config.section,
    path: config.path,
  });
}
```

---

## CHECKLIST DE IMPLEMENTACIÓN

```
FASE 1 (HOY):
- [ ] Crear robots.txt
- [ ] Crear sitemap.ts
- [ ] Actualizar layout.tsx con metadata mejorado
- [ ] Actualizar /blog/page.tsx con schemas

FASE 2 (ESTA SEMANA):
- [ ] Crear lib/seo/metadata.ts
- [ ] Mejorar descripciones en todas las pages
- [ ] Agregar canonical tags en todas las páginas
- [ ] Crear/actualizar Open Graph images

FASE 3 (PRÓXIMA SEMANA):
- [ ] Agregar breadcrumbs a todas las páginas
- [ ] Crear manifest.json
- [ ] Testing en Google Search Console
- [ ] Verificar en Mobile Friendly Test
```

---

## COMANDOS RÁPIDOS

```bash
# Build y test
npm run build

# Test en local
npm run dev

# Ver sitemap en local
curl http://localhost:3000/sitemap.xml

# Ver robots.txt en local
curl http://localhost:3000/robots.txt
```

---

## PRÓXIMOS PASOS DESPUÉS DE IMPLEMENTAR

1. **Google Search Console**
   - Agregar propiedad
   - Submit sitemap
   - Verificar robots.txt
   - Monitorear indexación

2. **Google Analytics 4**
   - Agregar GA4 tracking
   - Configurar eventos
   - Monitorear Core Web Vitals

3. **Testing**
   - Rich Results Test
   - Mobile Friendly Test
   - PageSpeed Insights
   - Lighthouse

4. **Monitoreo**
   - Check posiciones en keywords principales
   - Monitorear CTR
   - Analizar conversiones

