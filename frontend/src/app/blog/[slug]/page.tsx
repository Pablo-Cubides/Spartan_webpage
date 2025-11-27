import React from "react";
import BlogPostLayout from "@/components/BlogPostLayout";
import PostInteractiveLoader from "@/components/PostInteractiveLoader";
import { findPostBySlug, findRelatedPosts } from "@/lib/blog/posts";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  const post = findPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Post no encontrado</h2>
          <p className="mt-4 text-[#D1D5DB]">No se encontró el post solicitado.</p>
        </div>
      </div>
    );
  }
  // compute related posts using helper
  const related = findRelatedPosts(post.slug, 3);

  return (
    <BlogPostLayout title={post.title} date={post.date} category={post.category} heroImage={post.heroImage} related={related}>
      {post.content}
      {/* Client components: ShareButton and Comments */}
      <div className="mt-8">
        <PostInteractiveLoader slug={post.slug} title={post.title} />
      </div>
    </BlogPostLayout>
  );
}
