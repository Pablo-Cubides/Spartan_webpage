import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/error-handler';

type Post = { imageUrl: string; title: string; description?: string };
type Tool = { imageUrl?: string; title: string; description?: string };

const getHandler = async () => {
  // Mirror of /api/v1/home-content — keep minimal default content for dev.
  const defaultContent = {
    hero: { backgroundImageUrl: '', title: 'Spartan Club', subtitle: 'Bienvenido' },
    featuredPost: { imageUrl: '', category: 'General', title: 'Bienvenido a Spartan Club', description: 'Contenido de ejemplo' },
    posts: [] as Post[],
    tools: [] as Tool[],
  };

  return NextResponse.json(defaultContent);
}

export const GET = withErrorHandler(getHandler);
