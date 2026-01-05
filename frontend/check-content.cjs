const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Get one post and show its content
        const post = await prisma.blogPost.findFirst({
            where: { slug: 'mejores-suplementos-gimnasio-hombres-principiantes' },
            select: {
                title: true,
                slug: true,
                excerpt: true,
                content: true
            }
        });

        console.log('=== POST DATA ===');
        console.log('Title:', post?.title);
        console.log('Slug:', post?.slug);
        console.log('Excerpt length:', post?.excerpt?.length || 0);
        console.log('Content length:', post?.content?.length || 0);
        console.log('\n=== CONTENT PREVIEW ===');
        console.log(post?.content?.substring(0, 500) || '[EMPTY]');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
