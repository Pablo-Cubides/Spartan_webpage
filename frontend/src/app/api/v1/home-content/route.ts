import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/error-handler';

type Post = { imageUrl: string; title: string; description?: string };
type Tool = { imageUrl?: string; title: string; description?: string };

const getHandler = async () => {
  // Minimal default content used for local development and preview.
  const defaultContent = {
    hero: { backgroundImageUrl: '/default-hero.jpg', title: 'Spartan Club', subtitle: 'Welcome' },
    featuredPost: { imageUrl: '/default-post.jpg', category: 'General', title: 'Welcome to Spartan Club', description: 'Example content' },
    posts: [] as Post[],
    tools: [] as Tool[],
  };

  return NextResponse.json(defaultContent);
}

export const GET = withErrorHandler(getHandler);
