"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  author: {
    name: string;
  };
}

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar búsqueda local o remota
    console.log("Buscando:", searchTerm);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#121416] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col h-full layout-container grow">
        {/* SIN HEADER */}

        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                Blog de Transformación
              </p>
            </div>

            {/* Hero Image/Carousel */}
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-[#121416] @[480px]:rounded-xl min-h-80"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCTIN_nTSSE1sTcrJLsIRVi4gX8DVE-fsObRwG6aaWWVIFlwOfbPIF-JlNz8pHxfPXr0WJfqZcXs5uvn16aqGDOt-QU2E2Oo7WVUhhk1ej9AIpIGT9SGrtLnp3vqibDkB3hlyhqsVhMJfxUBASPjnWTLSn_jSuAvAJkADJA7Fnsh5NcdRznJaQ6G9hGmqbJwrxZOE-06ghtjzgjqruDDq_ETDsKg75Smd0bksTHNkBSYCvq0sMlpPsT9DBhYORYwf6gtgpCmgNOqMxh")',
                  }}
                >
                  <div className="flex justify-center gap-2 p-5">
                    <div className="size-1.5 rounded-full bg-[#121416]"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                    <div className="size-1.5 rounded-full bg-[#121416] opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3">
              <form onSubmit={handleSearch}>
                <label className="flex flex-col w-full h-12 min-w-40">
                  <div className="flex items-stretch flex-1 w-full h-full rounded-xl">
                    <div className="text-[#a2aab3] flex border-none bg-[#2c3035] items-center justify-center pl-4 rounded-l-xl border-r-0">
                      {/* Lupa */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar en el blog"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#2c3035] focus:border-none h-full placeholder:text-[#a2aab3] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    />
                  </div>
                </label>
              </form>
            </div>

            {/* Destacados */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Artículos Recientes
            </h2>

            {/* Artículos */}
            <div className="p-4 space-y-4">
              {loading ? (
                <p className="text-white text-center">Cargando artículos...</p>
              ) : filteredPosts.length === 0 ? (
                <p className="text-gray-400 text-center">No se encontraron artículos.</p>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="flex items-stretch justify-between gap-4 rounded-xl">
                    <div className="flex flex-[2_2_0px] flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-bold leading-tight text-white">
                          {post.title}
                        </p>
                        <p className="text-[#a2aab3] text-sm font-normal leading-normal line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#2c3035] text-white text-sm font-medium leading-normal w-fit hover:bg-[#3c4045] transition-colors"
                      >
                        <span className="truncate">Leer más</span>
                      </Link>
                    </div>
                    <div
                      className="flex-1 w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl"
                      style={{
                        backgroundImage: `url("${post.cover_image || 'https://via.placeholder.com/300'}")`,
                      }}
                    ></div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center p-4">
              {/* Pagination logic can be added here later */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
