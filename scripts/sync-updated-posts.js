/**
 * Sync updated blog posts from blog-posts-reimported to database
 */

const dotenv = require('dotenv');
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
        console.log('📝 Syncing updated blog posts...');

        // Directory with updated markdown files
        const blogPostsDir = path.join(__dirname, '..', 'blog-posts-reimported');

        if (!fs.existsSync(blogPostsDir)) {
            console.error('❌ blog-posts-reimported directory not found');
            return;
        }

        const files = fs.readdirSync(blogPostsDir).filter(f => f.endsWith('.md'));

        console.log(`Found ${files.length} markdown files to sync`);

        for (const file of files) {
            const filePath = path.join(blogPostsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data: frontmatter, content } = matter(fileContent);

            const slug = frontmatter.slug || file.replace('.md', '');

            // Try to find existing post by slug
            const existingPost = await prisma.blogPost.findFirst({
                where: { slug }
            });

            if (existingPost) {
                // Update existing post
                await prisma.blogPost.update({
                    where: { id: existingPost.id },
                    data: {
                        title: frontmatter.title || existingPost.title,
                        content: content.trim(),
                        excerpt: frontmatter.description || existingPost.excerpt,
                        meta_title: frontmatter.metaTitle || frontmatter.title,
                        meta_description: frontmatter.description,
                        cover_image: frontmatter.featuredImage || existingPost.cover_image,
                        category_slug: frontmatter.category || existingPost.category_slug,
                    }
                });
                console.log(`✅ Updated: ${slug}`);
            } else {
                // Create new post - need author
                let author = await prisma.user.findFirst({
                    where: { name: 'Spartan Club' }
                });

                if (!author) {
                    author = await prisma.user.upsert({
                        where: { uid: 'spartan-club-admin' },
                        update: {},
                        create: {
                            uid: 'spartan-club-admin',
                            name: 'Spartan Club',
                            email: 'admin@spartanclub.co',
                        }
                    });
                }

                await prisma.blogPost.create({
                    data: {
                        slug,
                        title: frontmatter.title,
                        content: content.trim(),
                        excerpt: frontmatter.description,
                        meta_title: frontmatter.metaTitle || frontmatter.title,
                        meta_description: frontmatter.description,
                        cover_image: frontmatter.featuredImage,
                        category_slug: frontmatter.category,
                        author_id: author.id,
                        is_published: true,
                        published_at: new Date(frontmatter.date || Date.now()),
                    }
                });
                console.log(`✅ Created: ${slug}`);
            }
        }

        console.log('🎉 Done! All blog posts synced successfully.');

    } catch (error) {
        console.error('❌ Error syncing posts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
