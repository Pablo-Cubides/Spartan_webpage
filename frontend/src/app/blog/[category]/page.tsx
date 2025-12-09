import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/server/prisma';
import { generateCollectionPageSchema } from '@/lib/blog/schema-generator';
import BlogCategoryLayout from '@/components/BlogCategoryLayout';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

const BASE_URL = 'https://spartanclub.com';

const categoryMeta: Record<string, { title: string; description: string; keywords: string[] }> = {
  'entrenamiento-y-energia-fisica': {
    title: 'Cuerpo Espartano – Entrenamiento y energía física | Spartan Club',
    description: 'Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio inteligente y consejos para ganar músculo.',
    keywords: ['entrenamiento', 'fuerza', 'resistencia', 'ganar músculo', 'rutinas'],
  },
  'estilo-y-presencia': {
    title: 'Estilo Espartano – Guías de estilo y presencia | Spartan Club',
    description: 'Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen sin perder tu esencia.',
    keywords: ['estilo', 'moda', 'grooming', 'presencia', 'comunicación no verbal'],
  },
  'mentalidad-y-disciplina': {
    title: 'Mentalidad Espartana – Disciplina y resiliencia masculina | Spartan Club',
    description: 'Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos que te llevan a tus metas.',
    keywords: ['mentalidad', 'disciplina', 'hábitos', 'resiliencia', 'carácter'],
  },
  'productividad-y-gestion-del-tiempo': {
    title: 'Productividad Espartana – Gestión de tiempo y rendimiento | Spartan Club',
    description: 'Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados en estudio, trabajo y proyectos personales.',
    keywords: ['productividad', 'gestión del tiempo', 'eficiencia', 'foco'],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const meta = categoryMeta[category];

  if (!meta) {
    return {
      title: 'Categoría no encontrada | Spartan Club',
    };
  }

  const categoryUrl = `${BASE_URL}/blog/${category}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: categoryUrl,
      type: 'website',
      siteName: 'Spartan Club',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: categoryUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  try {
    // For now, just check if category exists by slug
    const { category: categorySlug } = await params;
    const validCategories = ['entrenamiento-y-energia-fisica', 'estilo-y-presencia', 'mentalidad-y-disciplina', 'productividad-y-gestion-del-tiempo'];
    
    if (!validCategories.includes(categorySlug)) {
      notFound();
    }

    const posts = await prisma.blogPost.findMany({
      where: {
        category_slug: categorySlug,
        is_published: true,
      },
      include: {
        author: true,
      },
      orderBy: { published_at: 'desc' },
      take: 12, // Pagination later
    });

    // Generate schema
    const schema = generateCollectionPageSchema(posts, {
      baseUrl: BASE_URL,
      siteName: 'Spartan Club',
      siteImage: `${BASE_URL}/logo.png`,
      collectionName: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      collectionUrl: `${BASE_URL}/blog/${categorySlug}`,
    });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
        <BlogCategoryLayout
          category={{ slug: categorySlug, name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
          posts={posts}
        />
      </>
    );
  } catch (error) {
    console.error('Error loading blog category:', error);
    notFound();
  }
}