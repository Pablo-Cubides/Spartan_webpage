/**
 * Debug script to check blog posts in database (ESM version)
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env.local'), override: true });

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    const user = await prisma.user.findFirst();
    console.log('✅ Connected to database');
    
    // Count posts
    const totalPosts = await prisma.blogPost.count();
    console.log(`\n📊 Total posts in database: ${totalPosts}`);
    
    // Get all posts
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        category_slug: true,
        is_published: true,
        published_at: true,
      },
    });
    
    console.log('\n📝 All posts:');
    posts.forEach(post => {
      console.log(`
  ID: ${post.id}
  Slug: ${post.slug}
  Title: ${post.title}
  Category: ${post.category_slug}
  Published: ${post.is_published}
  Date: ${post.published_at}
  ---`);
    });
    
    // Check by category
    const categories = ['entrenamiento-y-energia-fisica', 'estilo-y-presencia', 'mentalidad-y-disciplina', 'productividad-y-gestion-del-tiempo'];
    
    console.log('\n📂 Posts by category:');
    for (const cat of categories) {
      const count = await prisma.blogPost.count({
        where: { category_slug: cat, is_published: true }
      });
      console.log(`  ${cat}: ${count} posts`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
