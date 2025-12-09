import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/server/prisma';
import { generateBlogPostingSchema } from '@/lib/blog/schema-generator';
import BlogPostLayout from '@/components/BlogPostLayout';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

const BASE_URL = 'https://spartanclub.com';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { category, slug } = await params;
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: slug,
        category_slug: category,
        is_published: true,
      },
      include: {
        author: true,
      },
    });

    if (!post) {
      return {
        title: 'Artículo no encontrado | Spartan Club',
      };
    }

    const postUrl = `${BASE_URL}/blog/${category}/${slug}`;

    return {
      title: post.meta_title || `${post.title} | Spartan Club`,
      description: post.meta_description || post.excerpt,
      keywords: post.keywords || [],
      authors: [{ name: post.author?.name || 'Spartan Club' }],
      openGraph: {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || undefined,
        url: postUrl,
        type: 'article',
        publishedTime: post.published_at?.toISOString(),
        modifiedTime: post.updated_at?.toISOString(),
        authors: [post.author?.name || 'Spartan Club'],
        images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : [],
        siteName: 'Spartan Club',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || undefined,
        images: post.cover_image ? [post.cover_image] : [],
      },
      alternates: {
        canonical: postUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error | Spartan Club',
    };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  try {
    const { category, slug } = await params;
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: slug,
        category_slug: category,
        is_published: true,
      },
      include: {
        author: true,
      },
    });

    if (!post) {
      notFound();
    }

    // Generate schema
    const schema = generateBlogPostingSchema(post, {
      baseUrl: BASE_URL,
      siteName: 'Spartan Club',
      siteImage: `${BASE_URL}/logo.png`,
    });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
        <BlogPostLayout
          title={post.title}
          date={post.published_at ? new Date(post.published_at).toLocaleDateString() : undefined}
          category={post.category_slug || undefined}
          heroImage={post.cover_image || undefined}
        >
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </BlogPostLayout>
      </>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}