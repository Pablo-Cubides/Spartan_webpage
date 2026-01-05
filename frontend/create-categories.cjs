const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Creating BlogCategory table manually...');

    try {
        // Check if BlogCategory already exists
        const exists = await prisma.$queryRawUnsafe(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'BlogCategory'
    `);

        if (exists.length > 0) {
            console.log('BlogCategory table already exists');
        } else {
            // Create the table
            await prisma.$executeRawUnsafe(`
        CREATE TABLE "BlogCategory" (
          "id" SERIAL PRIMARY KEY,
          "slug" TEXT UNIQUE NOT NULL,
          "name" TEXT NOT NULL,
          "epic_name" TEXT NOT NULL,
          "description" TEXT,
          "icon" TEXT,
          "gradient" TEXT,
          "cover_image" TEXT,
          "order" INTEGER DEFAULT 0,
          "is_active" BOOLEAN DEFAULT true,
          "created_at" TIMESTAMP DEFAULT NOW()
        )
      `);
            console.log('✅ Created BlogCategory table');
        }

        // Insert categories
        const categories = [
            { slug: 'entrenamiento-y-energia-fisica', name: 'Entrenamiento y Energía Física', epic_name: 'Cuerpo Espartano', gradient: 'from-red-600 to-orange-500', order: 1 },
            { slug: 'estilo-y-presencia', name: 'Estilo y Presencia', epic_name: 'Estilo Espartano', gradient: 'from-purple-600 to-pink-500', order: 2 },
            { slug: 'mentalidad-y-disciplina', name: 'Mentalidad y Disciplina', epic_name: 'Mentalidad Espartana', gradient: 'from-blue-600 to-cyan-500', order: 3 },
            { slug: 'productividad-y-gestion-del-tiempo', name: 'Productividad y Gestión del Tiempo', epic_name: 'Productividad Espartana', gradient: 'from-green-600 to-teal-500', order: 4 },
        ];

        for (const cat of categories) {
            try {
                await prisma.$executeRawUnsafe(`
          INSERT INTO "BlogCategory" (slug, name, epic_name, gradient, "order", is_active)
          VALUES ('${cat.slug}', '${cat.name}', '${cat.epic_name}', '${cat.gradient}', ${cat.order}, true)
          ON CONFLICT (slug) DO NOTHING
        `);
                console.log(`  ✅ Inserted category: ${cat.slug}`);
            } catch (e) {
                console.log(`  ⚠️ Category ${cat.slug}: ${e.message}`);
            }
        }

        // Now try to add the FK constraint
        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE "BlogPost" 
        ADD CONSTRAINT "BlogPost_category_slug_fkey" 
        FOREIGN KEY ("category_slug") REFERENCES "BlogCategory"("slug") 
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
            console.log('✅ Added foreign key constraint');
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('FK constraint already exists');
            } else {
                console.log('FK constraint skipped:', e.message.substring(0, 100));
            }
        }

        console.log('\nDone!');

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
