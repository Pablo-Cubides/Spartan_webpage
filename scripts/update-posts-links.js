/**
 * Update existing blog posts with internal links to Coach Espartano
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
    console.log('🔄 Updating blog posts with internal links...');

    const files = [
      'entrena-mente-guerrero-coaching-ia-disciplina-resiliencia.md',
      'corte-perfecto-cabello-barba-forma-facial-ia.md',
      'asesoria-vestimenta-personalizada-guia-ia-hombres-modernos.md'
    ];

    for (const file of files) {
      const filePath = path.join(__dirname, '..', 'blog-posts', file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Generate slug from filename
      const slug = file.replace('.md', '');

      // Find posts with this slug pattern
      const posts = await prisma.blogPost.findMany({
        where: {
          slug: {
            contains: slug
          }
        }
      });

      for (const post of posts) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content }
        });
        console.log(`✅ Updated: ${post.slug}`);
      }
    }

    console.log('🎉 Done! All posts updated with internal links.');
  } catch (error) {
    console.error('❌ Error updating posts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
