const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        console.log('DATABASE_URL port:', process.env.DATABASE_URL?.includes(':5432') ? '5432 (direct)' : '6543 (pooler)');

        // List all tables in public schema
        const tables = await prisma.$queryRawUnsafe(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);

        console.log('\n=== PUBLIC TABLES ===');
        if (tables.length === 0) {
            console.log('⚠️ NO TABLES FOUND IN PUBLIC SCHEMA!');
        } else {
            tables.forEach(t => console.log('- ' + t.tablename));
        }

        // Check _prisma_migrations
        try {
            const migrations = await prisma.$queryRawUnsafe(`
        SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5
      `);
            console.log('\n=== RECENT MIGRATIONS ===');
            migrations.forEach(m => console.log(`- ${m.migration_name} (${m.finished_at})`));
        } catch (e) {
            console.log('\n_prisma_migrations table not found (using db push, not migrate)');
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.message.includes('SASL')) {
            console.log('\n🔑 This might be an authentication issue. Check DATABASE_URL credentials.');
        }
        if (e.message.includes('connect')) {
            console.log('\n🌐 Connection issue. Database might be paused or URL is wrong.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
