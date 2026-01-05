const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const posts = await prisma.blogPost.findMany({
        select: { id: true, slug: true, title: true, category_slug: true }
    });
    posts.forEach(p => console.log(JSON.stringify(p)));
    await prisma.$disconnect();
}

main();
