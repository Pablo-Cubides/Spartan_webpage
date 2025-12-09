/**
 * Seed Coach Espartano blog post
 */

const dotenv = require('dotenv');
dotenv.config({ path: '../frontend/.env.local', override: true });

const { PrismaClient } = require('../frontend/node_modules/@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('📝 Seeding Coach Espartano blog post...');

    // Find or create author
    let author = await prisma.user.findFirst({
      where: { name: 'Spartan Club' },
    });

    if (!author) {
      author = await prisma.user.create({
        data: {
          uid: 'spartan-club-admin',
          name: 'Spartan Club',
          email: 'admin@spartanclub.co',
          avatar_id: '/logo.png',
        },
      });
      console.log('✅ Created author: Spartan Club');
    }

    // Read markdown file
    const filePath = path.join(__dirname, '..', 'blog-posts', 'coach-espartano-ia-coaching-personalizado-transformacion-masculina.md');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract title (first # heading)
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Coach Espartano: Entrenador Personal con IA';

    // Extract excerpt (first paragraph after headers)
    const lines = content.split('\n');
    let excerpt = '';
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('**') && !line.startsWith('---')) {
        excerpt = line.trim().slice(0, 200);
        break;
      }
    }

    // Generate slug
    const slug = 'coach-espartano-ia-coaching-personalizado-transformacion-masculina';

    // Categories: all main categories (since it's a general post)
    const categories = [
      'mentalidad-y-disciplina',
      'estilo-y-presencia',
      'entrenamiento-y-energia-fisica',
      'productividad-y-gestion-del-tiempo'
    ];

    // Create or update post for each category
    for (const categorySlug of categories) {
      const postSlug = `${slug}-${categorySlug}`;
      
      const existing = await prisma.blogPost.findUnique({
        where: { slug: postSlug },
      });

      if (existing) {
        console.log(`⏭️  Post already exists for ${categorySlug}: ${postSlug}`);
        continue;
      }

      await prisma.blogPost.create({
        data: {
          slug: postSlug,
          title: `${title} | ${categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
          content,
          excerpt: excerpt || 'El Coach Espartano es la herramienta de coaching con IA más completa para transformación masculina. 5 coaches especializados disponibles 24/7.',
          category_slug: categorySlug,
          meta_title: 'Coach Espartano con IA | Coaching Personal Masculino 24/7 | Spartan Club',
          meta_description: '5 coaches especializados con inteligencia artificial para transformación masculina completa: Cuerpo, Estilo, Mentalidad, Productividad. Coaching personalizado 24/7.',
          keywords: [
            'coach espartano',
            'coaching con inteligencia artificial',
            'coach personal IA',
            'entrenador virtual masculino',
            'coaching transformación masculina',
            'desarrollo personal hombres',
            categorySlug.replace(/-/g, ' ')
          ],
          author_id: author.id,
          is_published: true,
          published_at: new Date('2025-12-09'),
        },
      });

      console.log(`✅ Created post: ${postSlug}`);
    }

    console.log('🎉 Done! Coach Espartano posts seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
