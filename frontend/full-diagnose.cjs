const { PrismaClient } = require('@prisma/client');

async function diagnose() {
    console.log('='.repeat(60));
    console.log('DIAGNÓSTICO COMPLETO DE BASE DE DATOS');
    console.log('='.repeat(60));

    // Check DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || '';
    console.log('\n📌 DATABASE_URL Configuration:');

    // Extract parts safely
    const portMatch = dbUrl.match(/:(\d+)\//);
    const hostMatch = dbUrl.match(/@([^:]+):/);
    const projectMatch = dbUrl.match(/postgres\.([^:]+):/);

    console.log('  - Port:', portMatch ? portMatch[1] : 'unknown');
    console.log('  - Host:', hostMatch ? hostMatch[1] : 'unknown');
    console.log('  - Project Ref:', projectMatch ? projectMatch[1] : 'unknown');

    // Connect and query
    const prisma = new PrismaClient();

    try {
        console.log('\n🔌 Connecting to database...');

        // List ALL tables in public schema
        const tables = await prisma.$queryRawUnsafe(`
      SELECT tablename, tableowner 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

        console.log('\n📋 TABLES IN PUBLIC SCHEMA:');
        console.log('-'.repeat(40));
        if (tables.length === 0) {
            console.log('  ⚠️  NO TABLES FOUND!');
        } else {
            tables.forEach(t => {
                const isExpected = ['User', 'BlogPost', 'BlogCategory', 'users', 'accounts'].includes(t.tablename);
                console.log(`  ${isExpected ? '✓' : '•'} ${t.tablename} (owner: ${t.tableowner})`);
            });
        }

        // Check for Prisma expected tables
        console.log('\n🔍 CHECKING PRISMA EXPECTED TABLES:');
        const expectedTables = ['User', 'BlogPost', 'BlogCategory', 'CreditPackage', 'Purchase', 'CreditUsage'];

        for (const tableName of expectedTables) {
            try {
                const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count FROM "${tableName}"
        `);
                console.log(`  ✅ ${tableName}: EXISTS (${result[0].count} rows)`);
            } catch (e) {
                if (e.message.includes('does not exist')) {
                    console.log(`  ❌ ${tableName}: DOES NOT EXIST`);
                } else {
                    console.log(`  ⚠️  ${tableName}: ERROR - ${e.message.substring(0, 50)}`);
                }
            }
        }

        // Check snake_case alternatives
        console.log('\n🔍 CHECKING SNAKE_CASE ALTERNATIVES:');
        const snakeCaseTables = ['users', 'blog_posts', 'blog_categories', 'credit_packages', 'purchases'];

        for (const tableName of snakeCaseTables) {
            try {
                const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count FROM "${tableName}"
        `);
                console.log(`  ✅ ${tableName}: EXISTS (${result[0].count} rows)`);
            } catch (e) {
                if (e.message.includes('does not exist')) {
                    console.log(`  ❌ ${tableName}: DOES NOT EXIST`);
                } else {
                    console.log(`  ⚠️  ${tableName}: ERROR`);
                }
            }
        }

        // Check current database name
        console.log('\n📊 DATABASE INFO:');
        const dbInfo = await prisma.$queryRawUnsafe(`SELECT current_database(), current_user, version()`);
        console.log('  - Database:', dbInfo[0].current_database);
        console.log('  - User:', dbInfo[0].current_user);

    } catch (e) {
        console.error('\n❌ CONNECTION ERROR:', e.message);
        if (e.message.includes('SASL')) {
            console.log('  → Authentication failed. Check password.');
        }
        if (e.message.includes('timeout') || e.message.includes('connect')) {
            console.log('  → Connection failed. Database might be paused or URL is wrong.');
        }
    } finally {
        await prisma.$disconnect();
    }

    console.log('\n' + '='.repeat(60));
}

diagnose();
