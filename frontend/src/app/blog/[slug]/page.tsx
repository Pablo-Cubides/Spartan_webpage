"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  author: {
    name: string;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;
  if (!post) return <div className="text-white text-center py-20">Post not found</div>;

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#181111] dark group/design-root overflow-x-hidden"
      style={{
        fontFamily: 'Newsreader, "Noto Sans", sans-serif',
      }}
    >
      <div className="flex flex-col h-full layout-container grow">
        {/* SIN HEADER */}

        <div className="flex justify-center flex-1 gap-1 px-6 py-5">
          {/* Main post content */}
          <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 p-4">
              <a className="text-[#ba9c9c] text-base font-medium leading-normal" href="/blog">Blog</a>
              <span className="text-[#ba9c9c] text-base font-medium leading-normal">/</span>
              <span className="text-base font-medium leading-normal text-white">{post.title}</span>
            </div>
            {/* Title */}
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
              {post.title}
            </h2>
            {/* Metadata */}
            <p className="text-[#ba9c9c] text-sm font-normal leading-normal pb-3 pt-1 px-4">
              Publicado el {new Date(post.published_at).toLocaleDateString()} | Autor: {post.author.name || 'Admin'}
            </p>
            {/* Main image */}
            {post.cover_image && (
              <div className="@container">
                <div className="@[480px]:px-4 @[480px]:py-3">
                  <div
                    className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#181111] @[480px]:rounded-xl min-h-80"
                    style={{
                      backgroundImage: `url("${post.cover_image}")`
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="px-4 pt-1 pb-3 text-base font-normal leading-normal text-white whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Botones */}
            <div className="flex justify-stretch">
              <div className="flex flex-wrap justify-start flex-1 gap-3 px-4 py-3">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#c20909] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
