import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBlogArticles } from "@/lib/blog/service";
import { AUTHORS, AUTHOR_SLUG } from "@/lib/seo/authors";
import { fitTitle } from "@/lib/seo/title";

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function articlesBy(slug: string) {
  const all = await getPublicBlogArticles();
  return all.filter(
    (article) => AUTHOR_SLUG(article.author?.name || "") === slug,
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = AUTHORS[slug];
  const articles = await articlesBy(slug);
  if (!profile || !articles.length)
    return { title: "Autor no encontrado | Triarvon" };
  return {
    title: { absolute: fitTitle(`${profile.name}, autor en Triarvon`) },
    description:
      `${profile.bio} ${articles.length} artículos publicados.`.slice(0, 160),
    alternates: { canonical: `${BASE_URL}/autor/${slug}` },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = AUTHORS[slug];
  const articles = await articlesBy(slug);
  if (!profile || !articles.length) notFound();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: `${BASE_URL}/autor/${slug}`,
    description: profile.bio,
    worksFor: { "@type": "Organization", name: "Triarvon", url: BASE_URL },
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <h1 className="text-3xl font-bold">{profile.name}</h1>
      <p className="mt-3 text-gray-300">{profile.bio}</p>
      <h2 className="mt-10 text-xl font-semibold">
        Artículos de {profile.name}
      </h2>
      <ul className="mt-4 space-y-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              className="underline decoration-white/30 underline-offset-4 hover:text-red-400"
              href={`/blog/${article.category_slug}/${article.slug}`}
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
