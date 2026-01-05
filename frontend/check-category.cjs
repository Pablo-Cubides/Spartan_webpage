const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Get BlogCategory columns
        const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'BlogCategory'
      ORDER BY ordinal_position
    `);

        console.log('=== BlogCategory TABLE STRUCTURE ===');
        columns.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}`);
        });

        // Get rows
        const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "BlogCategory" LIMIT 5`);
        console.log('\n=== BlogCategory ROWS ===');
        console.log('Count:', rows.length);
        if (rows.length > 0) {
            console.log('Sample:', JSON.stringify(rows[0], null, 2));
        }

        // Get BlogPost sample to see category_slug values
        const posts = await prisma.$queryRawUnsafe(`SELECT DISTINCT category_slug FROM "BlogPost" LIMIT 10`);
        console.log('\n=== UNIQUE category_slug in BlogPost ===');
        posts.forEach(p => console.log('  -', p.category_slug));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
