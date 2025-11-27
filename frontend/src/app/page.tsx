// Server component: fetches home content server-side
import Link from 'next/link';
import Image from 'next/image';
import POSTS from '@/lib/blog/posts';
import NewsletterForm from '@/components/NewsletterForm';

export default async function Home() {
  // Use real posts for articles section
  const posts = POSTS || [];

  return (
    <div className="bg-spartan-dark text-spartan-text font-sans selection:bg-spartan-red selection:text-white">
      <main>
        {/* HERO SECTION */}
        <section id="hero" className="relative w-full flex items-center justify-center overflow-visible md:min-h-[60vh] min-h-[420px] py-12">
          <div className="absolute inset-0 z-0">
            <Image
              src={'/Hero.png'}
              alt={posts[0]?.title || 'Spartan Club'}
              layout="fill"
              objectFit="cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#0a0a0a]"></div>
          </div>

          {/* header provides branding; no duplicate logo inside hero */}

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-wider mb-6 leading-tight drop-shadow-lg">
              Unleash Your <span className="text-spartan-red">Spartan</span> Potential
            </h1>
            <p className="font-sans text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Forge your best version. Become the man you are destined to be: strong, disciplined, and with an unwavering purpose.
            </p>
            <Link href="/blog" className="inline-block">
              <button className="bg-spartan-red hover:bg-red-700 text-white font-display font-bold py-3 px-8 rounded-sm tracking-widest uppercase transition-all duration-300 transform hover:scale-105 border border-red-800 shadow-[0_0_20px_rgba(217,35,35,0.4)]">
                Start Your Transformation
              </button>
            </Link>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </section>

        {/* MISSION SECTION */}
        <section id="mision" className="py-24 bg-spartan-dark">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2">
                <h2 className="font-display text-4xl font-bold text-white uppercase mb-8 tracking-wide border-l-4 border-spartan-red pl-6">Our Mission</h2>
                <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
                  <p>At Spartan Club, we believe every man possesses unlimited potential. Our mission is to provide you with the knowledge, tools, and community to overcome your limits.</p>
                  <p>We guide you on the path to physical, mental, and spiritual excellence, based on the timeless principles of discipline, honor, and resilience.</p>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-2xl">
                  <Image src="/Logo spartan club.png" alt="Spartan" layout="fill" objectFit="contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ARTICLES SECTION */}
        <section id="articulos" className="py-24 bg-[#1a1a1a] relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-white uppercase tracking-wide inline-block relative pb-2">Featured Articles</h2>
              <p className="mt-4 text-gray-400">Knowledge and strategies for your personal growth arsenal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((p) => (
                <article key={p.slug} className="bg-spartan-dark rounded-md overflow-hidden border border-gray-800 hover:border-spartan-red/50 transition-all duration-300 group hover:-translate-y-2 shadow-lg">
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all z-10"></div>
                    <Image src={p.cover} alt={p.title} layout="fill" objectFit="cover" className="transform group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-white uppercase mb-3 leading-snug min-h-[3.5rem]">{p.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">{p.excerpt}</p>
                    <Link href={`/blog/${p.slug}`} className="inline-block text-spartan-red text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">Read More &rarr;</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ARSENAL SECTION */}
        <section id="arsenal" className="relative py-32 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-7xl mx-auto overflow-hidden rounded-md">
              <Image src="/Herramientas/Hero_herramientas_spartan.jpg" alt="Arsenal" layout="fill" objectFit="cover" />
            </div>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-spartan-red/10 to-black/40" />
            <div className="absolute inset-0 z-20 bg-black/20" />
          </div>
          <div className="relative z-30 container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto border border-spartan-red/30 bg-black/40 backdrop-blur-sm p-12 rounded-sm relative">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white uppercase mb-6 tracking-wide drop-shadow-lg">Weapons For Your Arsenal</h2>
              <p className="text-gray-300 text-lg mb-10 leading-relaxed">Access our collection of exclusive resources designed to accelerate your progress and help you conquer your goals.</p>
              <Link href="/herramientas" className="bg-spartan-red hover:bg-red-600 text-white font-display font-bold py-3 px-8 rounded-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-red-900/50">Explore Tools</Link>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section id="unete" className="py-24 bg-spartan-dark flex justify-center items-center">
          <div className="container mx-auto px-6">
            <div className="bg-[#1f1f1f] rounded-lg p-8 md:p-12 max-w-4xl mx-auto border border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-spartan-red to-transparent"></div>
              <div className="relative z-10 text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white uppercase mb-4">Join the Legion</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Receive weekly strategies, inspiration, and exclusive content directly in your email. No spam, just value.</p>
                <NewsletterForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
