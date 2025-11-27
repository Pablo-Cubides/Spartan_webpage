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
    slug: makeSlug("THE WARRIOR'S PATH: DISCIPLINE AND RESILIENCE"),
    title: "THE WARRIOR'S PATH: DISCIPLINE AND RESILIENCE",
    excerpt:
      "Discover how discipline and resilience are fundamental for facing challenges and overcoming life's obstacles.",
    cover:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80",
    date: "2024-07-15",
    category: "Mindset",
    tags: ["discipline", "resilience"],
    featured: true,
    content: (
      <>
        <p>
          Sustained discipline and resilience form the foundation of sustained progress. In this article, we will look at practical exercises to incorporate daily habits that bring you closer to your goals.
        </p>
        <h3>Daily routines</h3>
        <p>
          Establish blocks for work, rest, and training. Repetition and measurement allow for continuous improvements.
        </p>
      </>
    ),
  },
  {
    id: "f2",
    slug: makeSlug("FORGING CHARACTER: OVERCOMING OBSTACLES"),
    title: "FORGING CHARACTER: OVERCOMING OBSTACLES",
    excerpt:
      "Learn to turn obstacles into growth opportunities to forge an unbreakable character.",
    cover:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
    date: "2024-06-20",
    category: "Development",
    tags: ["character", "overcoming"],
    featured: true,
    content: (
      <>
        <p>
          Overcoming obstacles is a skill that can be trained. Here you will see practical strategies to face
          challenges and turn them into levers for growth.
        </p>
        <h3>Focus and Priorities</h3>
        <p>Learn to prioritize tasks and manage energy to advance even in adverse conditions.</p>
      </>
    ),
  },
  {
    id: "f3",
    slug: makeSlug("STEEL MIND: STRATEGIES FOR SUCCESS"),
    title: "STEEL MIND: STRATEGIES FOR SUCCESS",
    excerpt:
      "Master your mind and develop offensive strategies to achieve success in all areas of your life.",
    cover:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80",
    date: "2024-05-10",
    category: "Strategy",
    tags: ["mind", "success"],
    featured: true,
    content: (
      <>
        <p>
          Mental strategies are not intuitive: they are learned. We will explore visualization techniques, decision-making habits, and micro-rituals to strengthen your daily performance.
        </p>
      </>
    ),
  },
  {
    id: "r1",
    slug: makeSlug("THE LEADER'S LEGACY: INSPIRING OTHERS"),
    title: "THE LEADER'S LEGACY: INSPIRING OTHERS",
    excerpt:
      "Be inspired by how the leader inspires and the fundamental characteristics to achieve your goals and overcome life's challenges.",
    cover:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1920&q=80",
    date: "2024-04-01",
    category: "Leadership",
    tags: ["leadership", "inspiration"],
    featured: false,
    content: (
      <>
        <p>
          Effective leadership leaves a mark. In this article, we propose practices to inspire and elevate your team.
        </p>
      </>
    ),
  },
  {
    id: "r2",
    slug: makeSlug("FORGING CHARACTER: OVERCOMING OBSTACLES-2"),
    title: "FORGING CHARACTER: OVERCOMING OBSTACLES",
    excerpt:
      "Learn to turn obstacles into growth opportunities and forge an unbreakable character.",
    cover:
      "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80",
    heroImage:
      "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=1920&q=80",
    date: "2024-03-12",
    category: "Growth",
    tags: ["character", "challenges"],
    featured: false,
    content: (
      <>
        <p>
          Reflections and exercises to strengthen character through controlled challenges and achievable goals.
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
