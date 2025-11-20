import { NextResponse } from 'next/server';

type Post = { imageUrl: string; title: string; description?: string };
type Tool = { imageUrl?: string; title: string; description?: string };

export async function GET() {
  // Mirror of /api/v1/home-content — keep minimal default content for dev.
  const defaultContent = {
    hero: { backgroundImageUrl: '', title: 'Spartan Market', subtitle: 'Bienvenido' },
    featuredPost: { imageUrl: '', category: 'General', title: 'Bienvenido a Spartan', description: 'Contenido de ejemplo' },
    posts: [] as Post[],
    tools: [] as Tool[],
  };

  return NextResponse.json(defaultContent);
}
