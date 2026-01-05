const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Get columns of users table
        const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);

        console.log('=== USERS TABLE STRUCTURE ===');
        columns.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
        });

        // Get columns of accounts table
        const accountsCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'accounts'
      ORDER BY ordinal_position
    `);

        console.log('\n=== ACCOUNTS TABLE STRUCTURE ===');
        accountsCols.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}`);
        });

        // Get a sample user
        const users = await prisma.$queryRawUnsafe(`SELECT * FROM users LIMIT 1`);
        console.log('\n=== SAMPLE USER ===');
        if (users.length > 0) {
            Object.entries(users[0]).forEach(([key, value]) => {
                const val = value === null ? 'null' : (typeof value === 'object' ? JSON.stringify(value) : String(value).substring(0, 50));
                console.log(`  ${key}: ${val}`);
            });
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
