"use client";
import React, { useMemo, useState, useEffect } from "react";
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
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog?limit=50');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // For now, we'll just take the first few as "featured" if we don't have a specific flag
  // or we could add a 'featured' flag to the DB later.
  const SAMPLE_FEATURED = posts.slice(0, 3);
  const SAMPLE_LIST = posts.slice(3);

  const filteredFeatured = useMemo(() => {
    if (!q) return SAMPLE_FEATURED;
    const term = q.toLowerCase();
    return SAMPLE_FEATURED.filter((p) => {
      const title = p.title || "";
      const excerpt = p.excerpt || "";
      return title.toLowerCase().includes(term) || excerpt.toLowerCase().includes(term);
    });
  }, [q, SAMPLE_FEATURED]);

  const filteredList = useMemo(() => {
    if (!q) return SAMPLE_LIST;
    const term = q.toLowerCase();
    return SAMPLE_LIST.filter((p) => {
      const title = p.title || "";
      const excerpt = p.excerpt || "";
      return title.toLowerCase().includes(term) || excerpt.toLowerCase().includes(term);
    });
  }, [q, SAMPLE_LIST]);

  return (
    <div className="min-h-screen bg-spartan-dark text-spartan-text font-sans selection:bg-spartan-red selection:text-white">
      <main>
        {/* HERO */}
        <div className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1920&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505]"></div>
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
            <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-white uppercase tracking-tight mb-4 drop-shadow-2xl">
              Blog de Transformación
            </h1>
            <p className="font-sans text-lg md:text-2xl text-gray-200 font-light tracking-wide mb-8">
              Transforma tu vida, Forja tu legado
            </p>
          </div>
        </div>

        {/* FEATURED GRID */}
        <section className="relative -mt-32 z-20 px-4 md:px-8 pb-16">
          <div className="container mx-auto">
            {loading ? (
               <div className="text-center py-12">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spartan-red mx-auto"></div>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatured.map((post) => (
                  <article
                    key={post.id}
                    className="group bg-spartan-card rounded-lg overflow-hidden shadow-2xl border border-neutral-800 hover:border-spartan-red/30 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                      <img src={post.cover_image || 'https://via.placeholder.com/800x600'} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-6 md:p-8">
                      <h3 className="font-display font-bold text-xl text-white mb-3 leading-tight uppercase">{post.title}</h3>
                      <p className="text-spartan-muted text-sm leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
                          <Link href={`/blog/${post.slug}`} className="inline-block">
                            <button className="font-display font-semibold transition-all duration-300 rounded uppercase tracking-wider bg-spartan-red hover:bg-red-700 text-white shadow-lg shadow-red-900/20 px-4 py-1.5 text-xs">
                              LEER MAS
                            </button>
                          </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SEARCH + LIST */}
        <section className="container mx-auto px-4 md:px-8 pb-24">
          <div className="relative max-w-4xl mx-auto mb-16">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Buscar en el blog"
              className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-full py-4 px-8 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-spartan-red focus:ring-1 focus:ring-spartan-red transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-spartan-red p-2.5 rounded-full text-white hover:bg-red-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {filteredList.map((post) => (
              <div key={post.id} className="flex flex-col md:flex-row bg-[#0a0a0a] rounded-xl overflow-hidden group hover:bg-[#121212] transition-colors duration-300 border border-transparent hover:border-neutral-800">
                <div className="md:w-1/3 h-64 md:h-auto overflow-hidden relative">
                  <img src={post.cover_image || 'https://via.placeholder.com/800x600'} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-3 uppercase">{post.title}</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="mt-auto">
                    <Link href={`/blog/${post.slug}`} className="text-spartan-red hover:text-red-400 font-display font-semibold uppercase text-sm">Leer más</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination (static placeholder) */}
          <div className="flex justify-center items-center mt-16 gap-4 font-display font-bold text-gray-500">
            <button className="hover:text-white transition-colors">{`<`}</button>
            <span className="w-8 h-8 flex items-center justify-center bg-neutral-800 text-white rounded-full">1</span>
            <span className="hover:text-white cursor-pointer transition-colors">2</span>
            <span>8</span>
            <span>..</span>
            <span>10</span>
            <button className="hover:text-white transition-colors">{`>`}</button>
          </div>
        </section>
      </main>
    </div>
  );
}
