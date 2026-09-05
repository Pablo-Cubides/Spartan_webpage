import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateBlogPostingSchema } from "@/lib/blog/schema-generator";
import FAQSchema, { FAQItem } from "@/components/seo/FAQSchema";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import {
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
} from "@/lib/blog/static-data";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

// Category epic names lookup
const EPIC_NAMES: Record<string, string> = {
  "entrenamiento-y-energia-fisica": "Cuerpo Triarvon",
  "estilo-y-presencia": "Estilo Triarvon",
  "mentalidad-y-disciplina": "Mentalidad Triarvon",
  "productividad-y-gestion-del-tiempo": "Productividad Triarvon",
};

function extractFaqsFromContent(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const lines = content.split("\n");
  let currentQuestion = "";
  let currentAnswer: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+[?？].*)$/);
    if (headingMatch) {
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion.trim(),
          answer: currentAnswer
            .join(" ")
            .trim()
            .replace(/[#*`_]/g, ""),
        });
        currentAnswer = [];
      }
      currentQuestion = headingMatch[1].trim();
    } else if (currentQuestion) {
      if (line.startsWith("#")) {
        if (currentAnswer.length > 0) {
          faqs.push({
            question: currentQuestion.trim(),
            answer: currentAnswer
              .join(" ")
              .trim()
              .replace(/[#*`_]/g, ""),
          });
        }
        currentQuestion = "";
        currentAnswer = [];
      } else if (line.trim()) {
        currentAnswer.push(line.trim());
      }
    }
  }

  if (currentQuestion && currentAnswer.length > 0) {
    faqs.push({
      question: currentQuestion.trim(),
      answer: currentAnswer
        .join(" ")
        .trim()
        .replace(/[#*`_]/g, ""),
    });
  }

  return faqs;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || post.category_slug !== category) {
    return { title: "Artículo no encontrado | Triarvon Club" };
  }

  const postUrl = `${BASE_URL}/blog/${category}/${slug}`;

  return {
    title: `${post.title} | Triarvon Club`,
    description: post.excerpt || undefined,
    keywords: post.keywords || [],
    authors: [{ name: post.author?.name || "Triarvon Club" }],
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      url: postUrl,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author?.name || "Triarvon Club"],
      images: post.cover_image
        ? [{ url: post.cover_image, alt: post.title }]
        : [],
      siteName: "Triarvon Club",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image ? [post.cover_image] : [],
    },
    alternates: { canonical: postUrl },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    category: post.category_slug,
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { category, slug } = await params;

  const staticPost = getPostBySlug(slug);

  if (!staticPost || staticPost.category_slug !== category) {
    notFound();
  }

  // Transform to expected format
  const post = {
    ...staticPost,
    meta_title: staticPost.title,
    meta_description: staticPost.excerpt,
    published_at: new Date(staticPost.published_at),
    updated_at: new Date(staticPost.published_at),
    is_published: true,
    author: { name: staticPost.author.name, avatar_id: null },
  };

  // Get related posts
  const relatedPosts = getPostsByCategory(category)
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => ({ slug: p.slug, title: p.title, cover_image: p.cover_image }));

  // Generate schema
  const schema = generateBlogPostingSchema(post, {
    baseUrl: BASE_URL,
    siteName: "Triarvon Club",
    siteImage: `${BASE_URL}/Triarvon/triarvon-favicon-512.png`,
  });

  const faqs = extractFaqsFromContent(post.content);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: EPIC_NAMES[category] || category,
        item: `${BASE_URL}/blog/${category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: `${BASE_URL}/blog/${category}/${slug}`,
      },
    ],
  };

  const epicName = EPIC_NAMES[category] || category;
  const readingTime = Math.ceil(post.content.split(" ").length / 200);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqs.length > 0 && <FAQSchema items={faqs} />}

      <div className="min-h-screen bg-linear-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Image */}
          {post.cover_image && (
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image || ""}
                alt={`Portada del artículo: ${post.title}`}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/70 to-[#0a0a0a]" />
            </div>
          )}

          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
              <Link href="/" className="hover:text-white transition">
                Inicio
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition">
                Blog
              </Link>
              <span>/</span>
              <Link
                href={`/blog/${category}`}
                className="hover:text-white transition"
              >
                {epicName}
              </Link>
            </nav>

            {/* Category Badge */}
            <Link
              href={`/blog/${category}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold mb-6 hover:bg-red-500/30 transition"
            >
              {epicName}
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Answer-First direct content block for AI Engines & Users */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6 font-medium max-w-3xl border-l-4 border-red-600 pl-4 bg-white/5 py-2 rounded-r-md">
                {post.excerpt}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author?.name || "Triarvon Club"}</span>
              </div>
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time>
                    {new Date(post.published_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min de lectura</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <article className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-10 lg:p-12 shadow-2xl">
            {/* Table of Contents indicator */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <p className="text-white font-semibold">Artículo completo</p>
                <p className="text-sm text-gray-400">
                  {readingTime} minutos de lectura • Contenido de calidad
                </p>
              </div>
            </div>

            {/* Article body with premium styling */}
            <div className="article-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: "h2",
                  img: ({ node: _node, ...props }) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...props}
                      alt={
                        props.alt && props.alt.trim().length > 0
                          ? props.alt
                          : `Ilustración editorial: ${post.title}`
                      }
                      loading="lazy"
                      className="rounded-xl my-6 border border-white/10 shadow-lg mx-auto max-w-full"
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Puntos Clave y Criterios de Aplicación */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-red-500">⚔️</span> Pautas de Aplicación
                Práctica
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                El conocimiento sin ejecución pierde su valor formativo. Para
                integrar eficazmente las lecciones de este artículo en tu rutina
                diaria, te recomendamos aplicar estos tres principios
                fundamentales de desarrollo masculino:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-red-400 mb-1">
                    1. Consistencia Progresiva
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Prioriza la repetición deliberada por encima de la
                    intensidad aislada. Ajusta tus hábitos gradualmente para
                    consolidar cambios que resistan la fricción diaria.
                  </p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-red-400 mb-1">
                    2. Registro y Medición
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Lo que se mide se puede optimizar. Evalúa semanalmente tu
                    nivel de energía, disciplina y enfoque para realizar ajustes
                    basados en resultados comprobados.
                  </p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-red-400 mb-1">
                    3. Integración Holística
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Ninguna dimensión prospera en solitario. Conecta tu esfuerzo
                    físico con el dominio mental, el descanso reparador y un
                    código ético inquebrantable.
                  </p>
                </div>
              </div>
            </div>

            {/* Metodología Editorial Triarvon */}
            <div className="mt-8 p-6 rounded-xl bg-white/[0.03] border border-white/10">
              <h4 className="text-base font-bold text-white mb-2">
                Metodología y Estándar Editorial Triarvon
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed mb-3">
                En Triarvon promovemos una filosofía de superación personal
                fundamentada en la autodisciplina, la claridad estratégica y la
                responsabilidad individual. Cada publicación es concebida para
                brindar orientación práctica a hombres comprometidos con elevar
                sus estándares físicos, cognitivos y profesionales.
              </p>
              <p className="text-gray-400 text-xs leading-relaxed italic">
                Aviso importante: El contenido de esta publicación tiene
                propósitos exclusivamente educativos e informativos sobre estilo
                de vida y bienestar masculino. No constituye diagnóstico ni
                reemplaza la asesoría médica, nutricional o psicológica
                profesional. Consulta siempre con especialistas antes de
                implementar modificaciones exigentes en tus hábitos de salud o
                ejercicio.
              </p>
            </div>

            {/* Fuentes de Autoridad y Referencias Académicas (GEO & E-E-A-T) */}
            <div className="mt-8 p-6 rounded-xl bg-white/[0.02] border border-white/10">
              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-red-500">📚</span> Fuentes y Referencias
                Académicas Consultadas
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed mb-4">
                En cumplimiento de nuestros estándares de rigor y verificación
                editorial, los conceptos abordados en esta publicación se
                sustentan y contrastan con literatura científica, registros
                enciclopédicos y fuentes académicas de acceso público:
              </p>
              <div className="space-y-3">
                {category === "entrenamiento-y-energia-fisica" && (
                  <>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://pubmed.ncbi.nlm.nih.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        National Institutes of Health (NIH / PubMed) ↗
                      </a>
                      <span className="text-gray-400 ml-1">(nih.gov)</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Base de datos biomédica oficial con ensayos clínicos
                        sobre hipertrofia, metabolismo y fisiología del
                        ejercicio.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://es.wikipedia.org/wiki/Entrenamiento_de_fuerza"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Wikipedia: Fundamentos del Entrenamiento de Fuerza ↗
                      </a>
                      <span className="text-gray-400 ml-1">
                        (es.wikipedia.org)
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Compendio enciclopédico sobre periodización,
                        reclutamiento neuromuscular y adaptación física.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://www.who.int/es/news-room/fact-sheets/detail/physical-activity"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Organización Mundial de la Salud (OMS / WHO) ↗
                      </a>
                      <span className="text-gray-400 ml-1">(who.int)</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Directrices globales sobre actividad física, salud
                        cardiovascular y prevención del sedentarismo.
                      </p>
                    </div>
                  </>
                )}
                {category === "estilo-y-presencia" && (
                  <>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://es.wikipedia.org/wiki/Moda_masculina"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Wikipedia: Historia y Códigos de Vestimenta Masculina ↗
                      </a>
                      <span className="text-gray-400 ml-1">
                        (es.wikipedia.org)
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Evolución histórica del vestir masculino, sastrería y
                        etiqueta contemporánea.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://www.britannica.com/topic/dress-clothing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Encyclopaedia Britannica: Fundamentos de Indumentaria y
                        Sastrería ↗
                      </a>
                      <span className="text-gray-400 ml-1">
                        (britannica.com)
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Tratado enciclopédico sobre proporciones, confección y
                        estética indumentaria.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://es.wikipedia.org/wiki/N%C3%BAmero_%C3%A1ureo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Wikipedia: Proporción Áurea y Antropometría Facial ↗
                      </a>
                      <span className="text-gray-400 ml-1">
                        (es.wikipedia.org)
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Geometría armónica aplicada al visagismo, corte de
                        cabello y estructura facial.
                      </p>
                    </div>
                  </>
                )}
                {category === "mentalidad-y-disciplina" && (
                  <>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://plato.stanford.edu/entries/stoicism/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Stanford Encyclopedia of Philosophy: Estoicismo ↗
                      </a>
                      <span className="text-gray-400 ml-1">(stanford.edu)</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Monografía académica de la Universidad de Stanford sobre
                        la ética estoica, el autocontrol y la virtud racional.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://es.wikipedia.org/wiki/Meditaciones"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Wikipedia: Meditaciones de Marco Aurelio ↗
                      </a>
                      <span className="text-gray-400 ml-1">
                        (es.wikipedia.org)
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Tratado clásico de introspección, fortaleza interior y
                        gestión de la adversidad.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://www.apa.org/topics/resilience"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        American Psychological Association (APA): Resiliencia y
                        Conducta ↗
                      </a>
                      <span className="text-gray-400 ml-1">(apa.org)</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Investigaciones científicas sobre formación de hábitos,
                        neuroplasticidad y resiliencia conductual.
                      </p>
                    </div>
                  </>
                )}
                {category === "productividad-y-gestion-del-tiempo" && (
                  <>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://es.wikipedia.org/wiki/Gesti%C3%B3n_del_tiempo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        Wikipedia: Metodologías de Gestión del Tiempo ↗
                      </a>
                      <span className="text-gray-400 ml-1">
                        (es.wikipedia.org)
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Sistemas estructurados de priorización, bloques de
                        enfoque y combate a la procrastinación.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://mitsloan.mit.edu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        MIT Sloan Management Review: Enfoque y Productividad ↗
                      </a>
                      <span className="text-gray-400 ml-1">(mit.edu)</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Estudios del Instituto Tecnológico de Massachusetts
                        sobre concentración y productividad ejecutiva.
                      </p>
                    </div>
                    <div className="text-xs text-gray-300 border-l-2 border-red-500/50 pl-3 py-1">
                      <a
                        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6751071/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 font-semibold underline inline-flex items-center gap-1"
                      >
                        National Center for Biotechnology Information (NCBI) ↗
                      </a>
                      <span className="text-gray-400 ml-1">
                        (ncbi.nlm.nih.gov)
                      </span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        Investigación científica oficial sobre ritmo circadiano,
                        arquitectura del sueño y eficiencia cognitiva.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* End CTA */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="bg-linear-to-r from-red-900/30 to-transparent p-6 rounded-xl border border-red-500/20">
                <p className="text-white font-bold text-lg mb-2">
                  ¿Te gustó este artículo?
                </p>
                <p className="text-gray-400 mb-4">
                  Compártelo con otros triarvons y sigue explorando más
                  contenido.
                </p>
                <Link
                  href={`/blog/${category}`}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Ver más en {epicName}
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* Share & Navigation */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-white/10">
            <Link
              href={`/blog/${category}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Volver a {epicName}</span>
            </Link>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition">
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-red-600 rounded-full" />
              Artículos Relacionados
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${category}/${related.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-red-500/50 hover:bg-white/10"
                >
                  <div className="aspect-video overflow-hidden bg-gray-900">
                    {related.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={related.cover_image}
                        alt={`Portada de ${related.title}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-red-900/50 to-gray-900" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
