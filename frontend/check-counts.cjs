const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const counts = await prisma.blogPost.groupBy({
            by: ['category_slug'],
            _count: {
                id: true,
            },
        });
        console.log('Post counts per category:');
        counts.forEach(c => {
            console.log(`- ${c.category_slug}: ${c._count.id}`);
        });

        // Also list titles for manual verification
        const posts = await prisma.blogPost.findMany({
            select: { title: true, category_slug: true }
        });
        console.log('\nAll Post Titles:');
        posts.forEach(p => console.log(`[${p.category_slug}] ${p.title}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
