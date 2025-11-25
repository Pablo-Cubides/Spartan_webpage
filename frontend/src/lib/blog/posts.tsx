import React from "react";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date?: string;
  category?: string;
  heroImage?: string;
  featured?: boolean;
  tags?: string[];
  related?: string[];
  content: React.ReactNode;
};

const makeSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const POSTS: Post[] = [
  {
    id: "f1",
    slug: makeSlug("EL CAMINO DEL GUERRERO: DISCIPLINA Y RESILIENCIA"),
    title: "EL CAMINO DEL GUERRERO: DISCIPLINA Y RESILIENCIA",
    excerpt:
      "Descubre como la disciplina y la resiliencia son fundamentales para los males y superar los obstáculos de la vida.",
    cover:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80",
    date: "2024-07-15",
    category: "Mentalidad",
    tags: ["disciplina", "resiliencia"],
    featured: true,
    content: (
      <>
        <p>
          La disciplina sostenida y la resiliencia forman la base del progreso sostenido. En este artículo veremos
          ejercicios prácticos para incorporar hábitos diarios que te acerquen a tus objetivos.
        </p>
        <h3>Rutinas diarias</h3>
        <p>
          Establece bloques de trabajo, descanso y entrenamiento. La repetición y la medición permiten mejoras continuas.
        </p>
      </>
    ),
  },
  {
    id: "f2",
    slug: makeSlug("FORJANDO EL CARÁCTER: SUPERANDO OBSTÁCULOS"),
    title: "FORJANDO EL CARÁCTER: SUPERANDO OBSTÁCULOS",
    excerpt:
      "Aprende a convertir los obstáculos en oportunidades de crecimiento para forjar un carácter inquebrantable.",
    cover:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
    date: "2024-06-20",
    category: "Desarrollo",
    tags: ["caracter", "superacion"],
    featured: true,
    content: (
      <>
        <p>
          Superar obstáculos es una habilidad que puede entrenarse. Aquí verás estrategias prácticas para afrontar
          retos y convertirlos en palancas de crecimiento.
        </p>
        <h3>Enfoque y Prioridades</h3>
        <p>Aprende a priorizar tareas y gestionar energía para avanzar incluso en condiciones adversas.</p>
      </>
    ),
  },
  {
    id: "f3",
    slug: makeSlug("MENTE DE ACERO: ESTRATEGIAS PARA EL ÉXITO"),
    title: "MENTE DE ACERO: ESTRATEGIAS PARA EL ÉXITO",
    excerpt:
      "Domina tu mente y desarrolla estrategias ofensivas para alcanzar el éxito en todas las áreas de tu vida.",
    cover:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80",
    date: "2024-05-10",
    category: "Estrategia",
    tags: ["mente", "exito"],
    featured: true,
    content: (
      <>
        <p>
          Las estrategias mentales no son intuitivas: se aprenden. Exploraremos técnicas de visualización, hábitos de
          decisión y micro-rituales para fortalecer tu rendimiento diario.
        </p>
      </>
    ),
  },
  {
    id: "r1",
    slug: makeSlug("EL LEGADO DEL LÍDER: INSPIRANDO A OTROS"),
    title: "EL LEGADO DEL LÍDER: INSPIRANDO A OTROS",
    excerpt:
      "Inspirate como el líder inspira y las características que son fundamentales para alcanzar tus metas y superar tus desafíos de tu vida.",
    cover:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1920&q=80",
    date: "2024-04-01",
    category: "Liderazgo",
    tags: ["liderazgo", "inspiracion"],
    featured: false,
    content: (
      <>
        <p>
          El liderazgo efectivo deja huella. En este artículo planteamos prácticas para inspirar y elevar a tu equipo.
        </p>
      </>
    ),
  },
  {
    id: "r2",
    slug: makeSlug("FORJANDO EL CARÁCTER: SUPERANDO OBSTÁCULOS-2"),
    title: "FORJANDO EL CARÁCTER: SUPERANDO OBSTÁCULOS",
    excerpt:
      "Aprende a convertir los obstáculos en oportunidades de crecimiento y forjar un carácter inquebrantable.",
    cover:
      "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=1920&q=80",
    date: "2024-03-12",
    category: "Crecimiento",
    tags: ["caracter", "retos"],
    featured: false,
    content: (
      <>
        <p>
          Reflexiones y ejercicios para fortalecer el carácter a través de retos controlados y metas alcanzables.
        </p>
      </>
    ),
  },
];

export function findRelatedPosts(slug?: string | null, limit = 3) {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return [] as Post[];

  // 1) explicit related
  if (post.related && post.related.length > 0) {
    const explicit = post.related.map((rs) => POSTS.find((p) => p.slug === rs)).filter(Boolean) as Post[];
    if (explicit.length >= limit) return explicit.slice(0, limit);
  }

  // 2) by tags (score by matches)
  if (post.tags && post.tags.length > 0) {
    const scores = POSTS.filter((p) => p.slug !== post.slug).map((p) => {
      const shared = (p.tags || []).filter((t) => post.tags?.includes(t)).length;
      return { p, score: shared };
    });
    const byTags = scores.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || (b.p.date || "").localeCompare(a.p.date || "")).map((s) => s.p);
    if (byTags.length >= limit) return byTags.slice(0, limit);
    if (byTags.length > 0) return byTags.slice(0, limit);
  }

  // 3) by category
  if (post.category) {
    const byCat = POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, limit);
    if (byCat.length > 0) return byCat;
  }

  // 4) fallback recent
  return POSTS.filter((p) => p.slug !== post.slug).slice(0, limit);
}

export const findPostBySlug = (slug?: string | null) => POSTS.find((p) => p.slug === slug);

export default POSTS;
