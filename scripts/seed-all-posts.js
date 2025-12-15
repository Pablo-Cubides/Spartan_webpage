/**
 * Seed all blog posts from blog-posts directory
 */

const dotenv = require('dotenv');
// Fix path: we assume running from root D:\Empresas\Spartan\webpage
dotenv.config({ path: 'frontend/.env.local', override: true });

const { PrismaClient } = require('../frontend/node_modules/@prisma/client');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('📝 Seeding all blog posts...');

    // Find or create author safely
    let author = await prisma.user.upsert({
      where: { uid: 'spartan-club-admin' },
      update: {},
      create: {
        uid: 'spartan-club-admin',
        name: 'Spartan Club',
        email: 'admin@spartanclub.co',
        avatar_id: '/logo.png',
      },
    });

    console.log(`✅ Author confirmed: ${author.name}`);

    // Get all .md files from blog-posts directory
    const blogPostsDir = path.join(__dirname, '..', 'blog-posts');
    const files = fs.readdirSync(blogPostsDir).filter(file => file.endsWith('.md'));

    console.log(`Found ${files.length} blog post files`);

    for (const file of files) {
      const filePath = path.join(blogPostsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Parse frontmatter
      const { data: frontmatter, content: markdownContent } = matter(content);

      // Upsert the post
      const post = await prisma.blogPost.upsert({
        where: { slug: frontmatter.slug },
        update: {
          title: frontmatter.title,
          content: markdownContent,
          excerpt: frontmatter.description,
          category_slug: frontmatter.category,
          author_id: author.id,
          is_published: true,
          published_at: new Date(frontmatter.date),
          meta_title: frontmatter.metaTitle,
          meta_description: frontmatter.metaDescription,
          keywords: frontmatter.keywords,
          cover_image: frontmatter.featuredImage,
        },
        create: {
          title: frontmatter.title,
          content: markdownContent,
          excerpt: frontmatter.description,
          slug: frontmatter.slug,
          category_slug: frontmatter.category,
          author_id: author.id,
          is_published: true,
          published_at: new Date(frontmatter.date),
          meta_title: frontmatter.metaTitle,
          meta_description: frontmatter.metaDescription,
          keywords: frontmatter.keywords,
          cover_image: frontmatter.featuredImage,
        },
      });

      console.log(`✅ Created post: ${post.slug}`);
    }

    console.log('🎉 Done! All blog posts seeded successfully.');

  } catch (error) {
    console.error('❌ Error seeding posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();