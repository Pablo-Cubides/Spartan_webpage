# Blog Spartan Club - Guía de Arquitectura SEO e Implementación

## 1. Estructura de Categorías

### 1.1 Las 4 Categorías Principales

#### Categoría 1: Cuerpo Espartano
- **Nombre visible**: Cuerpo Espartano
- **Slug**: `entrenamiento-y-energia-fisica`
- **URL**: `/blog/entrenamiento-y-energia-fisica/`
- **Meta Title**: `Cuerpo Espartano – Entrenamiento y energía física | Spartan Club`
- **Meta Description**: `Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio inteligente y consejos para ganar músculo.`
- **Keywords primarias**: entrenamiento, fuerza, resistencia, ganar músculo, rutinas
- **Tipos de contenido**: rutinas, ejercicios, nutrición básica, energía

#### Categoría 2: Estilo Espartano
- **Nombre visible**: Estilo Espartano
- **Slug**: `estilo-y-presencia`
- **URL**: `/blog/estilo-y-presencia/`
- **Meta Title**: `Estilo Espartano – Guías de estilo y presencia | Spartan Club`
- **Meta Description**: `Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen sin perder tu esencia.`
- **Keywords primarias**: estilo, moda, grooming, presencia, comunicación no verbal
- **Tipos de contenido**: moda, grooming, accesorios, comunicación

#### Categoría 3: Mentalidad Espartana
- **Nombre visible**: Mentalidad Espartana
- **Slug**: `mentalidad-y-disciplina`
- **URL**: `/blog/mentalidad-y-disciplina/`
- **Meta Title**: `Mentalidad Espartana – Disciplina y resiliencia masculina | Spartan Club`
- **Meta Description**: `Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos que te llevan a tus metas.`
- **Keywords primarias**: mentalidad, disciplina, hábitos, resiliencia, carácter
- **Tipos de contenido**: psicología, hábitos, autoestima, propósito

#### Categoría 4: Productividad Espartana
- **Nombre visible**: Productividad Espartana
- **Slug**: `productividad-y-gestion-del-tiempo`
- **URL**: `/blog/productividad-y-gestion-del-tiempo/`
- **Meta Title**: `Productividad Espartana – Gestión de tiempo y rendimiento | Spartan Club`
- **Meta Description**: `Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados en estudio, trabajo y proyectos personales.`
- **Keywords primarias**: productividad, gestión del tiempo, eficiencia, foco
- **Tipos de contenido**: técnicas de estudio, organización, herramientas, balance

---

## 2. Arquitectura de URLs

### 2.1 Estructura Jerárquica

```
/blog/                                    # Blog principal
├── /blog/[category]/                      # Páginas de categoría (hubs)
│   ├── /blog/entrenamiento-y-energia-fisica/
│   ├── /blog/estilo-y-presencia/
│   ├── /blog/mentalidad-y-disciplina/
│   └── /blog/productividad-y-gestion-del-tiempo/
│
├── /blog/[category]/[slug]/               # Artículos individuales (spokes)
│   └── /blog/mentalidad-y-disciplina/como-ser-mas-disciplinado-en-la-vida/
│
├── /blog/[category]/page/[number]/       # Paginación de categorías
│   └── /blog/mentalidad-y-disciplina/page/2/
│
├── /blog/tag/[tag]/                      # Archivos de tags (opcional)
│   └── /blog/tag/habitos/
│
└── /blog/tag/[tag]/page/[number]/        # Paginación de tags
    └── /blog/tag/habitos/page/2/
```

### 2.2 Reglas de Slugs

1. **Longitud**: Máx 50-60 caracteres
2. **Caracteres**: Solo minúsculas, números y guiones
3. **Palabras clave**: Incluir la keyword principal
4. **Stopwords**: Evitar "el", "la", "de", "para" innecesarios
5. **Fechas**: NO incluir fechas en URLs

**Ejemplos válidos:**
- ✅ `/blog/mentalidad-y-disciplina/como-ser-mas-disciplinado/`
- ✅ `/blog/entrenamiento-y-energia-fisica/rutinas-fuerza-casa/`
- ❌ `/blog/mentalidad-y-disciplina/como-ser-mas-disciplinado-en-la-vida-diaria-todos-los-dias/`
- ❌ `/blog/2025-01-15-como-ser-disciplinado/`

### 2.3 Redirecciones 301

Si un slug cambia, mantener redirección permanente:

```javascript
// next.config.ts
const redirects = async () => [
  {
    source: '/blog/mentalidad-y-disciplina/viejo-slug',
    destination: '/blog/mentalidad-y-disciplina/nuevo-slug',
    permanent: true, // 301
  },
];
```

---

## 3. Metadatos en Cada Página

### 3.1 Página Principal del Blog (`/blog/`)

**HTML Head:**
```html
<title>Blog Spartan Club – Desarrollo personal, entrenamiento y estilo para hombres</title>
<meta name="description" content="Artículos sobre desarrollo personal masculino: entrenamiento físico, estilo, mentalidad y productividad. Consejos, rutinas y estrategias de Spartan Club.">
<meta property="og:title" content="Blog Spartan Club">
<meta property="og:description" content="Desarrollo personal para hombres: entrenamiento, estilo, disciplina y productividad.">
<meta property="og:image" content="https://spartan-club.com/blog-og-image.jpg">
<link rel="canonical" href="https://spartan-club.com/blog/">
```

**Schema.org:**
```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Blog Spartan Club",
  "description": "Artículos sobre desarrollo personal para hombres",
  "url": "https://spartan-club.com/blog/",
  "publisher": {
    "@type": "Organization",
    "name": "Spartan Club",
    "logo": "https://spartan-club.com/logo.png"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://spartan-club.com/blog/entrenamiento-y-energia-fisica/",
        "name": "Cuerpo Espartano"
      }
      // ... más categorías
    ]
  }
}
```

### 3.2 Páginas de Categoría (`/blog/[category]/`)

**HTML Head:**
```html
<title>Mentalidad Espartana – Hábitos y disciplina para hombres | Spartan Club</title>
<meta name="description" content="Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos.">
<meta property="og:title" content="Mentalidad Espartana">
<meta property="og:type" content="website">
<link rel="canonical" href="https://spartan-club.com/blog/mentalidad-y-disciplina/">
```

**Estructura HTML:**
```html
<h1>Mentalidad Espartana</h1>
<p>Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina...</p>

<!-- Listado de artículos -->
<article>
  <h2><a href="/blog/mentalidad-y-disciplina/como-ser-mas-disciplinado/">
    Cómo ser más disciplinado en la vida
  </a></h2>
  <time datetime="2025-01-15">15 de enero de 2025</time>
  <p>Resumen del artículo...</p>
</article>

<!-- Paginación -->
<nav aria-label="Paginación">
  <a href="/blog/mentalidad-y-disciplina/page/2/">Siguiente →</a>
</nav>
```

**Schema.org CollectionPage:**
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Mentalidad Espartana",
  "description": "Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina",
  "url": "https://spartan-club.com/blog/mentalidad-y-disciplina/",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://spartan-club.com/blog/mentalidad-y-disciplina/como-ser-mas-disciplinado/",
        "headline": "Cómo ser más disciplinado en la vida",
        "image": "https://...",
        "datePublished": "2025-01-15",
        "author": {
          "@type": "Person",
          "name": "Juan Pérez"
        }
      }
      // ... más artículos
    ]
  }
}
```

### 3.3 Artículos Individuales (`/blog/[category]/[slug]/`)

**HTML Head:**
```html
<title>Cómo ser más disciplinado en la vida | Spartan Club</title>
<meta name="description" content="Aprende las técnicas probadas para construir disciplina real en tu vida diaria. Desde hábitos simples hasta sistemas de accountability.">
<meta property="og:title" content="Cómo ser más disciplinado en la vida">
<meta property="og:type" content="article">
<meta property="og:image" content="https://..../featured-image.jpg">
<meta property="article:published_time" content="2025-01-15T10:00:00Z">
<meta property="article:modified_time" content="2025-01-20T15:30:00Z">
<meta property="article:author" content="Juan Pérez">
<meta property="article:section" content="Mentalidad y Disciplina">
<meta property="article:tag" content="hábitos">
<meta property="article:tag" content="disciplina">
<link rel="canonical" href="https://spartan-club.com/blog/mentalidad-y-disciplina/como-ser-mas-disciplinado/">
```

**Breadcrumbs Visibles:**
```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Inicio</a></li>
    <li><a href="/blog/">Blog</a></li>
    <li><a href="/blog/mentalidad-y-disciplina/">Mentalidad Espartana</a></li>
    <li>Cómo ser más disciplinado en la vida</li>
  </ol>
</nav>
```

**Schema.org BlogPosting + BreadcrumbList:**
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Cómo ser más disciplinado en la vida",
  "description": "Aprende las técnicas probadas para construir disciplina real",
  "image": [
    "https://.../featured-image.jpg"
  ],
  "datePublished": "2025-01-15T10:00:00Z",
  "dateModified": "2025-01-20T15:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Juan Pérez",
    "url": "https://spartan-club.com/autores/juan-perez",
    "sameAs": [
      "https://linkedin.com/in/juan-perez",
      "https://twitter.com/juanperez"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Spartan Club",
    "logo": {
      "@type": "ImageObject",
      "url": "https://spartan-club.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://spartan-club.com/blog/mentalidad-y-disciplina/como-ser-mas-disciplinado/"
  },
  "articleSection": "Mentalidad y Disciplina",
  "keywords": "disciplina, hábitos, autodisciplina, rutinas",
  "wordCount": 2500,
  "timeRequired": "PT15M",
  "commentCount": 5,
  "inLanguage": "es-ES"
}
```

**BreadcrumbList Schema (adicional):**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://spartan-club.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://spartan-club.com/blog/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Mentalidad Espartana",
      "item": "https://spartan-club.com/blog/mentalidad-y-disciplina/"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Cómo ser más disciplinado en la vida",
      "item": "https://spartan-club.com/blog/mentalidad-y-disciplina/como-ser-mas-disciplinado/"
    }
  ]
}
```

---

## 4. Componentes React Necesarios

### 4.1 Estructura de Carpetas

```
src/
├── components/
│   └── Blog/
│       ├── BlogHeader.tsx           # Header del blog
│       ├── BlogCategoryCard.tsx     # Tarjeta de categoría
│       ├── BlogPostCard.tsx         # Tarjeta de artículo
│       ├── BlogPostLayout.tsx       # Layout principal de artículo
│       ├── AuthorBio.tsx            # Sección de autor con E-E-A-T
│       ├── BreadcrumbNav.tsx        # Navegación de breadcrumbs
│       ├── PostMetadata.tsx         # Metadata visible (fecha, lectura)
│       ├── RelatedPosts.tsx         # Artículos relacionados
│       └── BlogPagination.tsx       # Paginación
│
├── lib/
│   ├── blog/
│   │   ├── utils.ts                 # Funciones helper (reading time, etc)
│   │   ├── categories.ts            # Datos de categorías
│   │   ├── schema-generator.ts      # Generador de schemas JSON-LD
│   │   └── seo.ts                   # Utilidades SEO (metatags, etc)
│   └── validation/
│       └── blog-schemas.ts          # Zod schemas para blog
│
└── app/
    ├── blog/
    │   ├── page.tsx                 # /blog/
    │   ├── layout.tsx               # Layout general del blog
    │   ├── [category]/
    │   │   ├── page.tsx             # /blog/[category]/
    │   │   ├── layout.tsx           # Layout de categoría
    │   │   └── [slug]/
    │   │       ├── page.tsx         # /blog/[category]/[slug]/
    │   │       └── layout.tsx       # Layout de artículo
    │   └── tag/
    │       ├── [tag]/
    │       │   └── page.tsx         # /blog/tag/[tag]/ (opcional)
    │       └── [tag]/page/
    │           └── [number]/        # /blog/tag/[tag]/page/[number]/
```

### 4.2 Componentes Principales

#### BlogHeader.tsx
```typescript
// Mostrar H1, categorías, descripción general
interface BlogHeaderProps {
  title: string;
  description: string;
  categories: BlogCategory[];
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  title,
  description,
  categories,
}) => (
  <section className="blog-header">
    <h1>{title}</h1>
    <p>{description}</p>
    <div className="categories-grid">
      {categories.map((cat) => (
        <BlogCategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  </section>
);
```

#### AuthorBio.tsx (E-E-A-T)
```typescript
interface AuthorBioProps {
  author: User & { socialLinks: SocialLink[] };
  expertiseAreas?: string[];
}

export const AuthorBio: React.FC<AuthorBioProps> = ({
  author,
  expertiseAreas,
}) => (
  <aside className="author-bio">
    <img src={author.avatar_id} alt={author.name} />
    <h3>{author.name}</h3>
    <p>{author.bio}</p>
    {expertiseAreas && (
      <div className="expertise">
        <strong>Especialista en:</strong> {expertiseAreas.join(", ")}
      </div>
    )}
    <div className="social-links">
      {author.socialLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          rel="noopener noreferrer"
          title={link.platform}
        >
          {link.platform}
        </a>
      ))}
    </div>
  </aside>
);
```

#### PostMetadata.tsx
```typescript
interface PostMetadataProps {
  publishedAt: Date;
  updatedAt?: Date;
  readingTime?: number;
  category: BlogCategory;
}

export const PostMetadata: React.FC<PostMetadataProps> = ({
  publishedAt,
  updatedAt,
  readingTime,
  category,
}) => {
  const showUpdated =
    updatedAt &&
    (updatedAt.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24) > 30;

  return (
    <div className="post-metadata">
      <span className="published">
        Publicado: <time dateTime={publishedAt.toISOString()}>
          {publishedAt.toLocaleDateString("es-ES")}
        </time>
      </span>
      
      {showUpdated && (
        <span className="updated">
          Actualizado: <time dateTime={updatedAt!.toISOString()}>
            {updatedAt!.toLocaleDateString("es-ES")}
          </time>
        </span>
      )}

      {readingTime && (
        <span className="reading-time">
          {readingTime} min de lectura
        </span>
      )}

      <a href={`/blog/${category.slug}/`}>
        {category.name_display}
      </a>
    </div>
  );
};
```

#### BreadcrumbNav.tsx
```typescript
interface BreadcrumbItem {
  label: string;
  url: string;
  active?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  schema?: any; // Schema JSON-LD
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  items,
  schema,
}) => (
  <>
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li key={index}>
            {item.active ? (
              <span>{item.label}</span>
            ) : (
              <a href={item.url}>{item.label}</a>
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
  </>
);
```

---

## 5. API Routes Necesarias

### 5.1 GET `/api/blog/categories`

```typescript
// Obtener todas las categorías
interface GetCategoriesResponse {
  categories: BlogCategory[];
}

// Response
{
  "categories": [
    {
      "id": 1,
      "name_display": "Mentalidad Espartana",
      "slug": "mentalidad-y-disciplina",
      "description": "Contenidos sobre mentalidad...",
      "meta_title": "Mentalidad Espartana – ...",
      "meta_description": "Contenidos sobre mentalidad...",
      "is_active": true,
      "sort_order": 0
    }
  ]
}
```

### 5.2 GET `/api/blog/posts?category=[slug]&page=[number]`

```typescript
interface GetPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
}
```

### 5.3 GET `/api/blog/posts/[category]/[slug]`

```typescript
interface GetPostResponse {
  post: BlogPost & {
    author: User & { socialLinks: SocialLink[] };
    category: BlogCategory;
    relatedPosts?: BlogPost[];
  };
}
```

### 5.4 GET `/api/blog/reading-time?content=[string]`

```typescript
// Calcular tiempo de lectura basado en palabras
interface ReadingTimeResponse {
  minutes: number;
  words: number;
}
```

---

## 6. Funciones Auxiliares

### 6.1 lib/blog/utils.ts

```typescript
// Calcular tiempo de lectura (palabras / 200 palabras por minuto)
export function calculateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}

// Generar slug a partir de título
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Extraer primeros N palabras
export function extractExcerpt(content: string, words: number = 50): string {
  return content.split(/\s+/).slice(0, words).join(" ") + "...";
}

// Validar si un slug es único
export async function isSlugUnique(slug: string, excludeId?: number): Promise<boolean> {
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  return !existing || (excludeId && existing.id === excludeId);
}
```

### 6.2 lib/blog/schema-generator.ts

```typescript
// Generar schema BlogPosting
export function generateBlogPostingSchema(post: any, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta_title || post.title,
    description: post.meta_description,
    image: post.cover_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author.name,
      sameAs: post.author.socialLinks.map((link: any) => link.url),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.category.slug}/${post.slug}/`,
    },
  };
}

// Generar schema BreadcrumbList
export function generateBreadcrumbSchema(items: any[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.url}`,
    })),
  };
}
```

---

## 7. Flujo de Creación de un Artículo

### 7.1 En el Admin CMS (futuro)

1. **Información básica**
   - Título (H1)
   - Categoría (requerida)
   - Slug (generado automáticamente, editable)

2. **SEO**
   - Meta Title (opcional, usa título + " | Spartan Club" por defecto)
   - Meta Description (editable, 150-160 caracteres)

3. **Contenido**
   - Imagen destacada (con alt text)
   - Contenido principal (Markdown o HTML)

4. **Metadatos adicionales**
   - Autor (dropdown de usuarios)
   - Tags (opcional, CSV o multi-select)
   - Áreas de expertise del autor
   - Artículos relacionados (opcional)

5. **Publicación**
   - Programar para futuro (scheduled)
   - Fecha de publicación
   - Visibilidad (draft, published)

### 7.2 Validación automática

- Slug único
- Mínimo 300 palabras
- Imagen destacada obligatoria
- Meta description entre 150-160 caracteres

---

## 8. SEO: Diferencia Nombre Épico vs Técnico

### 8.1 Cómo Implementarlo

```typescript
// En la base de datos (BlogCategory)
{
  name_display: "Mentalidad Espartana",        // Visible (H1)
  slug: "mentalidad-y-disciplina",             // URL
  meta_title: "Mentalidad Espartana – Disciplina y hábitos para hombres", // Title tag (SEO)
  meta_description: "Contenidos sobre mentalidad...",  // Meta desc
}

// En el template React
<h1>{category.name_display}</h1>  {/* "Mentalidad Espartana" */}

// En el <head> (via next/head)
<title>{category.meta_title}</title>
{/* "Mentalidad Espartana – Disciplina y hábitos para hombres | Spartan Club" */}

<meta name="description" content={category.meta_description} />
```

### 8.2 Fórmula de Meta Title para Categorías

```
{Nombre Épico} – {Descripción corta con keywords} | Spartan Club
```

**Ejemplos:**
- `Mentalidad Espartana – Disciplina y hábitos para hombres | Spartan Club`
- `Cuerpo Espartano – Entrenamiento y fuerza para hombres | Spartan Club`
- `Estilo Espartano – Moda y presencia masculina | Spartan Club`
- `Productividad Espartana – Gestión de tiempo y eficiencia | Spartan Club`

---

## 9. Checklist de Implementación

### Fase 1: Base de Datos
- [ ] Crear tabla `BlogCategory`
- [ ] Crear tabla `SocialLink`
- [ ] Agregar campos a `BlogPost` (meta_title, meta_description, category_id, etc)
- [ ] Agregar campos a `User` (bio)
- [ ] Ejecutar migración

### Fase 2: Estructura de Rutas y Componentes
- [ ] Crear `/app/blog/page.tsx` (blog principal)
- [ ] Crear `/app/blog/[category]/page.tsx` (categorías)
- [ ] Crear `/app/blog/[category]/[slug]/page.tsx` (artículos)
- [ ] Crear componentes (BlogHeader, AuthorBio, BreadcrumbNav, etc)

### Fase 3: API Routes
- [ ] GET `/api/blog/categories`
- [ ] GET `/api/blog/posts`
- [ ] GET `/api/blog/posts/[category]/[slug]`
- [ ] GET `/api/blog/reading-time`

### Fase 4: SEO e Schemas
- [ ] Implementar schema BlogPosting
- [ ] Implementar schema BreadcrumbList
- [ ] Implementar schema CollectionPage para categorías
- [ ] Agregar open graph tags
- [ ] Validar canonical URLs

### Fase 5: Datos Iniciales
- [ ] Crear las 4 categorías principales
- [ ] Migrar posts existentes a categorías
- [ ] Agregar author social links a usuarios

### Fase 6: Testing
- [ ] Verificar URLs y redirects
- [ ] Verificar schemas con Google Rich Results
- [ ] Verificar breadcrumbs
- [ ] Verificar paginación
- [ ] Test de performance (Core Web Vitals)

---

## 10. Información Adicional: E-E-A-T y Schema Person

### 10.1 Propiedad `sameAs` en Author Schema

En el schema `Person` del autor, es **obligatorio** incluir la propiedad `sameAs` con un array de URLs de redes sociales:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "author": {
    "@type": "Person",
    "name": "Juan Pérez",
    "url": "https://spartan-club.com/autores/juan-perez",
    "sameAs": [
      "https://linkedin.com/in/juan-perez",
      "https://twitter.com/juanperez",
      "https://github.com/juanperez"
    ]
  }
}
```

**Por qué es importante:** Google usa `sameAs` para verificar que el autor es una persona real y experta en su campo. Esto refuerza E-E-A-T.

### 10.2 Datos que Necesita cada Autor

En el perfil del autor agregar:
- Bio (texto corto, 150-300 caracteres)
- Foto de perfil (avatar)
- Redes sociales (LinkedIn, Twitter, etc)
- Áreas de expertise (tags: "Entrenador", "Psicólogo", "Coach", etc)

---

## 11. Mostrar Fecha de Actualización

### 11.1 Lógica Visual

- Si `dateModified` es más reciente que `datePublished` **por más de 30 días**, mostrar:
  ```
  Actualizado el: 20 de enero de 2025
  ```

- Si no, mostrar solo:
  ```
  Publicado: 15 de enero de 2025
  ```

### 11.2 Implementación

```typescript
export const PostMetadata: React.FC<PostMetadataProps> = ({
  publishedAt,
  updatedAt,
  readingTime,
  category,
}) => {
  const daysDifference = updatedAt
    ? Math.floor(
        (updatedAt.getTime() - publishedAt.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const showUpdated = daysDifference > 30;

  return (
    <div className="post-metadata">
      {showUpdated && updatedAt ? (
        <span className="updated">
          <strong>Actualizado:</strong>{" "}
          <time dateTime={updatedAt.toISOString()}>
            {updatedAt.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </span>
      ) : (
        <span className="published">
          <strong>Publicado:</strong>{" "}
          <time dateTime={publishedAt.toISOString()}>
            {publishedAt.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </span>
      )}

      {readingTime && (
        <span className="reading-time">{readingTime} min de lectura</span>
      )}

      <a href={`/blog/${category.slug}/`}>{category.name_display}</a>
    </div>
  );
};
```

### 11.3 En el Schema JSON-LD

```json
{
  "@type": "BlogPosting",
  "datePublished": "2025-01-15T10:00:00Z",
  "dateModified": "2025-01-20T15:30:00Z"
}
```

**Nota:** En el schema, SIEMPRE incluir ambas fechas, incluso si solo muestras una en el frontend.

---

## Siguiente Paso

Comenzar con **Fase 1** (Base de Datos) ejecutando la migración y luego proceder con la estructura de rutas.

