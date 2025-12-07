import { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog Spartan Club",
  description: "Artículos sobre desarrollo masculino",
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
      },
      orderBy: { published_at: "desc" },
      take: 12,
    });

    // Agregar información del autor
    posts = await Promise.all(
      postsData.map(async (post) => {
        const author = await prisma.user.findUnique({
          where: { id: post.author_id },
          select: { name: true },
        });
        return { ...post, author };
      })
    );
  } catch {
    posts = [];
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Blog Spartan Club</h1>
        <p className="text-xl text-gray-600">
          Artículos sobre entrenamiento, estilo, mentalidad y productividad
        </p>
      </section>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: BlogPostWithAuthor) => (
            <article key={post.slug} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              {post.cover_image && (
                <div className="h-48 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  <Link href={`/blog/${post.slug}/`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                {post.published_at && (
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(post.published_at).toLocaleDateString("es-ES")}
                  </p>
                )}
                <p className="text-gray-700 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  {post.author && (
                    <span className="text-sm text-gray-600">
                      Por {post.author.name}
                    </span>
                  )}
                  <Link
                    href={`/blog/${post.slug}/`}
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
  );
}
