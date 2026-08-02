import Image from "next/image";

interface BlogCategoryLayoutProps {
  category: { slug: string; name?: string };
  posts: Array<{
    id: number;
    title: string;
    excerpt?: string | null;
    cover_image?: string | null;
    category_slug?: string | null;
    slug: string;
    author?: { name?: string | null };
    published_at?: Date | null;
  }>;
}

export default function BlogCategoryLayout({
  category,
  posts,
}: BlogCategoryLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {category.name ||
            category.slug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
        </h1>
        <p className="text-gray-600">
          Artículos en la categoría {category.name || category.slug}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {post.cover_image && (
              <Image
                src={post.cover_image}
                alt={post.title}
                width={400}
                height={240}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                <a
                  href={`/blog/${post.category_slug}/${post.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.title}
                </a>
              </h2>
              <p className="text-gray-300 mb-4">{post.excerpt}</p>
              <div className="flex items-center text-sm text-gray-400">
                <span>Por {post.author?.name || "Triarvon Club"}</span>
                <span className="mx-2">•</span>
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
