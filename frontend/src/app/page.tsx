// Server component: fetches home content server-side
import Link from 'next/link';
import { Card } from '@/components/Card';
import { apiCall } from '@/lib/api';

type Post = { imageUrl: string; title: string; description?: string };
type Tool = { imageUrl?: string; title: string; description?: string };

type HomeContent = {
  hero: { backgroundImageUrl: string; title: string; subtitle: string };
  featuredPost: { imageUrl: string; category: string; title: string; description: string };
  posts: Post[];
  tools: Tool[];
};

async function getHomePageContent() {
  try {
    const data = await apiCall<HomeContent>('/api/v1/home-content');
    return data as HomeContent;
  } catch (error) {
    console.error('Failed to fetch home content:', error);
    // Provide a safe default so build/prerender doesn't fail when the API is not reachable
    const defaultContent: HomeContent = {
      hero: { backgroundImageUrl: '', title: 'Spartan Club', subtitle: 'Bienvenido' },
      featuredPost: { imageUrl: '', category: 'General', title: 'Bienvenido a Spartan', description: 'Contenido de ejemplo' },
      posts: [],
      tools: [],
    };
    return defaultContent;
  }
}

export default async function Home() {
  const content = await getHomePageContent();

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#141414] dark group/design-root overflow-x-hidden">
      <div className="flex flex-col h-full layout-container grow">
        <div className="flex justify-center flex-1 px-40 py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Hero Section */}
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.55) 100%), url(${encodeURI('/Hero.png')})`
                  }}
                >
                  {/* Hidden H1 for SEO/accessibility */}
                  <h1 className="sr-only">Spartan Club</h1>

                  {/* Centered logo optimized for multiple breakpoints */}
                  <div className="flex flex-col items-center justify-center gap-6">
                    <img
                      src={encodeURI('/Texto Spartan.png')}
                      alt="Spartan Club"
                      className="h-12 w-auto drop-shadow-2xl"
                    />

                    <div>
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#141414] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
                        <span className="truncate">Explorar el Blog</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Últimos Posts */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Últimos Posts del Blog</h2>
            <div className="p-4 @container">
              <div className="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover rounded-lg aspect-video"
                  style={{
                    backgroundImage: `url("${content.featuredPost.imageUrl}")`
                  }}
                ></div>
                <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
                  <p className="text-[#ababab] text-sm font-normal leading-normal">{content.featuredPost.category}</p>
                  <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    {content.featuredPost.title}
                  </p>
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-[#ababab] text-base font-normal leading-normal">
                      {content.featuredPost.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Grid de Posts */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {content.posts.map((post, index) => (
                <Card key={index} {...post} />
              ))}
            </div>
            {/* Nosotros */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Nosotros</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover rounded-lg aspect-video"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAWiAn1qUQaMU9qfqLHmsFJ1oa8V4v_b1X0ucbWpE1ylSNZSDL1QSCVfWQOwvNyrsYEa3kvxoc8LQKmNosCJJ19jQ2d8ZLL7zkwHZNGiltz3z17LJ_cf2qwYoVZULSh6q8hwK9C-H1kOFodk3VBQHCG4g20eyVk4m5XPNGw-Y-HXXdx1cAnr77NcLVxbFXAakC4d18Tmj7gsXpPKcK4PvQR7KzxuQSO3rYTFUO5PrjYSpGOdb6Qqtwz00nT-xERFp4osLAQLD-hJ_bi")`
                  }}
                ></div>
                <div>
                  <p className="text-base font-medium leading-normal text-white">Nuestra Misión</p>
                  <p className="text-[#ababab] text-sm font-normal leading-normal">
                    En Spartan Club, creemos en el poder transformador de la disciplina y la resiliencia. Nuestra misión es guiar a los hombres en su viaje hacia la automejora,
                    proporcionando las herramientas y el apoyo necesarios para alcanzar su máximo potencial.
                  </p>
                </div>
              </div>
            </div>
            {/* Herramientas */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Herramientas</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {content.tools.map((tool, index) => (
                tool.imageUrl ? (
                  <Card key={index} {...(tool as { imageUrl: string; title: string; description?: string })} />
                ) : (
                  <div key={index} className="flex flex-col gap-3 pb-3">
                    <div className="w-full aspect-[3/4] rounded-lg bg-gray-800" />
                    <p className="text-base font-medium leading-normal text-white">{tool.title}</p>
                    {tool.description && <p className="text-[#ababab] text-sm font-normal leading-normal">{tool.description}</p>}
                  </div>
                )
              ))}
            </div>
            {/* CTA Final */}
            <div className="@container">
              <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                <div className="flex flex-col gap-2 text-center">
                  <h2 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                    Desata tu Potencial Espartano
                  </h2>
                  <p className="text-white text-base font-normal leading-normal max-w-[720px]">
                    Inscríbete hoy y comienza tu viaje hacia una vida más disciplinada, resiliente y plena.
                  </p>
                </div>
                <div className="flex justify-center flex-1">
                  <div className="flex justify-center">
                    <Link
                      href="/herramientas"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#141414] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow"
                    >
                      <span className="truncate">Únete a la Transformación</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Fin contenido */}
          </div>
        </div>
      </div>
    </div>
  );
}
