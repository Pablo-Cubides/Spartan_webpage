import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, Shirt, Brain, Clock } from 'lucide-react';
import { getPostsByCategory } from '@/lib/blog/static-data';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

const BASE_URL = 'https://spartanclub.co';

// Category configuration with epic names and metadata
const CATEGORIES: Record<string, {
  epicName: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  coverImage: string;
}> = {
  'entrenamiento-y-energia-fisica': {
    epicName: 'Cuerpo Espartano',
    description: 'Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio inteligente y consejos para ganar músculo y salud sin vivir en el gym.',
    metaTitle: 'Cuerpo Espartano – Entrenamiento y Energía Física | Spartan Club',
    metaDescription: 'Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio y consejos para ganar músculo.',
    keywords: ['entrenamiento hombres', 'rutinas gimnasio', 'ganar músculo', 'fuerza', 'cardio'],
    icon: Dumbbell,
    gradient: 'from-red-600 to-orange-600',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&h=600',
  },
  'estilo-y-presencia': {
    epicName: 'Estilo Espartano',
    description: 'Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen sin perder tu esencia.',
    metaTitle: 'Estilo Espartano – Estilo y Presencia Masculina | Spartan Club',
    metaDescription: 'Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen.',
    keywords: ['estilo masculino', 'moda hombre', 'grooming', 'presencia', 'cuidado personal'],
    icon: Shirt,
    gradient: 'from-blue-600 to-indigo-600',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&h=600',
  },
  'mentalidad-y-disciplina': {
    epicName: 'Mentalidad Espartana',
    description: 'Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos que te llevan a tus metas.',
    metaTitle: 'Mentalidad Espartana – Disciplina y Hábitos | Spartan Club',
    metaDescription: 'Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos.',
    keywords: ['mentalidad', 'disciplina', 'hábitos', 'resiliencia', 'desarrollo personal'],
    icon: Brain,
    gradient: 'from-purple-600 to-pink-600',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1920&h=600',
  },
  'productividad-y-gestion-del-tiempo': {
    epicName: 'Productividad Espartana',
    description: 'Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados en estudio, trabajo y proyectos personales.',
    metaTitle: 'Productividad Espartana – Gestión del Tiempo | Spartan Club',
    metaDescription: 'Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados.',
    keywords: ['productividad', 'gestión del tiempo', 'eficiencia', 'foco', 'rendimiento'],
    icon: Clock,
    gradient: 'from-green-600 to-teal-600',
    coverImage: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1920&h=600',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category];

  if (!cat) {
    return { title: 'Categoría no encontrada | Spartan Club' };
  }

  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    keywords: cat.keywords,
    openGraph: {
      title: cat.metaTitle,
      description: cat.metaDescription,
      url: `${BASE_URL}/blog/${category}`,
      type: 'website',
      images: [{ url: cat.coverImage, width: 1200, height: 630, alt: cat.epicName }],
    },
    twitter: { card: 'summary_large_image', title: cat.metaTitle, description: cat.metaDescription },
    alternates: { canonical: `${BASE_URL}/blog/${category}` },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const cat = CATEGORIES[categorySlug];

  if (!cat) {
    notFound();
  }

  const Icon = cat.icon;

  // Use static data instead of database
  const posts = getPostsByCategory(categorySlug).map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    published_at: new Date(post.published_at),
  }));

  // Schema.org
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: cat.epicName, item: `${BASE_URL}/blog/${categorySlug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cat.coverImage} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#0a0a0a]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-20">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
              <Link href="/" className="hover:text-white transition">Inicio</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition">Blog</Link>
              <span>/</span>
              <span className="text-red-500">{cat.epicName}</span>
            </nav>

            <div className="flex items-center gap-6 mb-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-2xl`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  {cat.epicName}
                </h1>
                <p className="text-lg text-gray-400 mt-2 max-w-2xl">
                  {cat.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-400">
              <span className="text-white font-bold">{posts.length}</span> artículos
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${categorySlug}/${post.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-red-500/50 hover:bg-white/10 hover:scale-[1.02]"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-gray-900">
                    {post.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-gray-900 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {post.published_at && (
                        <time>
                          {new Date(post.published_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-white/10 bg-white/5">
              <Icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Próximamente</h3>
              <p className="text-gray-400">Estamos preparando contenido increíble para esta categoría.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}