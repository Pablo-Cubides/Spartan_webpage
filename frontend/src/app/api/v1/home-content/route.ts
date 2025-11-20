import { NextResponse } from 'next/server';

type Post = { imageUrl: string; title: string; description?: string };
type Tool = { imageUrl?: string; title: string; description?: string };

export async function GET() {
  // Minimal default content used for local development and preview.
  const defaultContent = {
    hero: { backgroundImageUrl: '/default-hero.jpg', title: 'Spartan Market', subtitle: 'Bienvenido' },
    featuredPost: { imageUrl: '/default-post.jpg', category: 'General', title: 'Bienvenido a Spartan', description: 'Contenido de ejemplo' },
    posts: [] as Post[],
    tools: [] as Tool[],
  };

  return NextResponse.json(defaultContent);
}
