import { NextResponse, NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/error-handler';

type Post = { imageUrl: string; title: string; description?: string };
type Tool = { imageUrl?: string; title: string; description?: string };

const getHandler = async (request: NextRequest) => {
  // Minimal default content used for local development and preview.
  const defaultContent = {
    hero: { backgroundImageUrl: '/default-hero.jpg', title: 'Spartan Market', subtitle: 'Bienvenido' },
    featuredPost: { imageUrl: '/default-post.jpg', category: 'General', title: 'Bienvenido a Spartan', description: 'Contenido de ejemplo' },
    posts: [] as Post[],
    tools: [] as Tool[],
  };

  return NextResponse.json(defaultContent);
}

export const GET = withErrorHandler(getHandler);
