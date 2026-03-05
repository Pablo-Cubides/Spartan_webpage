import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}
const prisma = new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString: databaseUrl })),
});

async function main() {
    const postsDir = path.resolve(__dirname, '../../blog-posts');
    console.log(`Leyendo posts desde: ${postsDir}`);

    if (!fs.existsSync(postsDir)) {
        console.error('La carpeta de posts no existe.');
        return;
    }

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    console.log(`Encontrados ${files.length} archivos.`);

    // Get admin user
    const admin = await prisma.user.findFirst({
        where: { role: 'admin' },
        orderBy: { id: 'asc' }
    });

    if (!admin) {
        console.error('No se encontró un usuario administrador para asignar como autor.');
        return;
    }

    console.log(`Usando como autor: ${admin.name} (ID: ${admin.id})`);

    for (const file of files) {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse frontmatter (simple regex for YAML between ---)
        const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (!match) {
            console.warn(`Saltando ${file}: No se encontró frontmatter válido.`);
            continue;
        }

        const yaml = match[1];
        const content = match[2].trim();

        const metadata = {};
        yaml.split('\n').forEach(line => {
            const idx = line.indexOf(':');
            if (idx !== -1) {
                const key = line.substring(0, idx).trim();
                let val = line.substring(idx + 1).trim();
                // Remove quotes if present
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.substring(1, val.length - 1);
                }
                metadata[key] = val;
            }
        });

        const slug = metadata.slug || file.replace('.md', '');
        const title = metadata.title || 'Sin Título';
        const excerpt = metadata.description || content.substring(0, 160).replace(/[#*`]/g, '') + '...';
        const cover_image = metadata.featuredImage || null;
        const category_slug = metadata.category || null;
        const published_at = metadata.date ? new Date(metadata.date) : new Date();

        console.log(`Procesando: ${title} (${slug})`);

        await prisma.blogPost.upsert({
            where: { slug: slug },
            update: {
                title,
                content,
                excerpt,
                cover_image,
                category_slug,
                author_id: admin.id,
                is_published: true,
                published_at,
                updated_at: new Date(),
            },
            create: {
                slug,
                title,
                content,
                excerpt,
                cover_image,
                category_slug,
                author_id: admin.id,
                is_published: true,
                published_at,
            },
        });
    }

    console.log('¡Siembra de posts completada con éxito!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
