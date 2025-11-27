import React from "react";

type Props = {
  title: string;
  date?: string;
  category?: string;
  heroImage?: string;
  children: React.ReactNode;
  related?: Array<{ id: string; title: string; category?: string; cover?: string }>;
};

export default function BlogPostLayout({ title, date, category, heroImage, children, related = [] }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#121212] text-[#D1D5DB]">
      <main className="flex-1">
        <div className="w-full h-[50vh] min-h-[360px] max-h-[600px] overflow-hidden">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={title} className="w-full h-full object-cover" src={heroImage} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0b0b0b] to-[#151515]"></div>
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto -mt-20 md:-mt-24 relative z-10 bg-[#121212] p-6 md:p-10 text-center rounded-xl shadow-xl border border-neutral-800">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">{title}</h1>
            {date || category ? (
              <p className="mt-4 text-sm md:text-base text-[#D1D5DB]">{date ? `Published on ${date}` : ""} {category ? ` | Category: ${category}` : ""}</p>
            ) : null}
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:px-8 py-10 lg:grid-cols-3 lg:py-16">
          <article className="prose prose-invert max-w-none lg:col-span-2">
                    <div className="prose lg:prose-xl">{children}</div>
                    <div className="mt-8">
                      {/* Share and Comments area */}
                      <div className="flex items-center gap-4">
                        {/* ShareButton dynamically loaded in client bundle */}
                      </div>
                    </div>
            {/* Interactive controls (share / comment) are inserted by the page via children
                to avoid duplicate buttons. Use `PostInteractiveLoader` in the post page. */}
          </article>

          <aside className="space-y-8 lg:col-span-1">
            <div className="rounded-xl bg-[#222222] p-6">
              <h3 className="text-xl text-white font-bold">Related Articles</h3>
              <div className="mt-6 space-y-6">
                {related.length > 0 ? (
                  related.map((r) => (
                    <a key={r.id} className="group flex items-center gap-4" href={`/blog/${r.id}`}>
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={r.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" src={r.cover || "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=400&q=60"} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-base leading-tight uppercase text-white transition-colors group-hover:text-[#E02626]">{r.title}</h4>
                        <p className="mt-1 text-sm text-[#D1D5DB]">{r.category || "General"}</p>
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-[#D1D5DB]">No related articles.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
