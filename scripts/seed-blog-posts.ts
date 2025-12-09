import * as dotenv from '../frontend/node_modules/dotenv';
dotenv.config({ path: '../frontend/.env.local' });
import { PrismaClient } from '../frontend/node_modules/@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.frvswvnrlysamwtyywwi:E_@@Rgcu3Fae24H@aws-1-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
});

async function seedBlogPosts() {
  try {
    // Read markdown files
    const postsDir = path.join(process.cwd(), '..', 'blog-posts');
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
      const lines = content.split('\n');

      // Parse frontmatter
      let title = '';
      let categorySlug = '';
      let excerpt = '';
      let metaTitle = '';
      let metaDescription = '';
      let keywords: string[] = [];
      let body = '';

      let inFrontmatter = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('# ')) {
          title = line.replace('# ', '');
        } else if (line.includes('**Categoría:**')) {
          // Extract category slug from link
          const match = line.match(/blog\/([^)]+)\)/);
          if (match) categorySlug = match[1];
        } else if (line.includes('**Meta Title:**')) {
          metaTitle = line.replace('**Meta Title:** ', '');
        } else if (line.includes('**Meta Description:**')) {
          metaDescription = line.replace('**Meta Description:** ', '');
        } else if (line.includes('**Keywords:**')) {
          keywords = line.replace('**Keywords:** ', '').split(', ');
        } else if (line === '---') {
          if (!inFrontmatter) {
            inFrontmatter = true;
          } else {
            body = lines.slice(i + 1).join('\n');
            break;
          }
        } else if (inFrontmatter && line.startsWith('**')) {
          // Skip frontmatter lines
        } else if (!inFrontmatter) {
          if (!excerpt && line.trim()) {
            excerpt = line.trim();
          }
        }
      }

      // Find category slug from content
      if (content.includes('estilo-y-presencia')) {
        categorySlug = 'estilo-y-presencia';
      } else if (content.includes('mentalidad-y-disciplina')) {
        categorySlug = 'mentalidad-y-disciplina';
      } else if (content.includes('entrenamiento-y-energia-fisica')) {
        categorySlug = 'entrenamiento-y-energia-fisica';
      } else if (content.includes('productividad-y-gestion-del-tiempo')) {
        categorySlug = 'productividad-y-gestion-del-tiempo';
      }

      // Find or create author
      let author = await prisma.user.findFirst({
        where: { name: 'Spartan Club' },
      });

      if (!author) {
        author = await prisma.user.create({
          data: {
            uid: 'spartan-club-admin',
            name: 'Spartan Club',
            email: 'admin@spartanclub.com',
            avatar_id: '/logo.png',
          },
        });
      }

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Create post
      await prisma.blogPost.upsert({
        where: { slug },
        update: {
          title,
          content: body,
          excerpt,
          category_slug: categorySlug,
          meta_title: metaTitle,
          meta_description: metaDescription,
          keywords,
          cover_image: '/Hero.png', // Default image
          is_published: true,
          published_at: new Date(),
        },
        create: {
          title,
          slug,
          content: body,
          excerpt,
          category_slug: categorySlug,
          meta_title: metaTitle,
          meta_description: metaDescription,
          keywords,
          cover_image: '/Hero.png',
          author_id: author.id,
          is_published: true,
          published_at: new Date(),
        },
      });

      console.log(`Seeded post: ${title}`);
    }

    console.log('Blog posts seeded successfully!');
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBlogPosts();