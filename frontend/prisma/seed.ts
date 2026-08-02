import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}
const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: databaseUrl })),
});

async function seedBlogCategories() {
  console.log("🌱 Seeding blog categories...");

  const categories = [
    {
      slug: 'entrenamiento-y-energia-fisica',
      epic_name: 'Cuerpo Triarvon',
      description: 'Rutinas, fuerza, resistencia y energía para hombres.',
      icon: 'Dumbbell',
      gradient: 'from-red-600 to-orange-600',
      cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&h=600',
      order: 1,
    },
    {
      slug: 'estilo-y-presencia',
      epic_name: 'Estilo Triarvon',
      description: 'Moda, cuidado personal y presencia masculina.',
      icon: 'Shirt',
      gradient: 'from-blue-600 to-indigo-600',
      cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=600',
      order: 2,
    },
    {
      slug: 'mentalidad-y-disciplina',
      epic_name: 'Mentalidad Triarvon',
      description: 'Disciplina, hábitos y resiliencia masculina.',
      icon: 'Brain',
      gradient: 'from-purple-600 to-pink-600',
      cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&h=600',
      order: 3,
    },
    {
      slug: 'productividad-y-gestion-del-tiempo',
      epic_name: 'Productividad Triarvon',
      description: 'Gestión del tiempo y máximo rendimiento.',
      icon: 'Clock',
      gradient: 'from-green-600 to-teal-600',
      cover_image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&h=600',
      order: 4,
    },
  ];

  for (const category of categories) {
    const upserted = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: {
        epic_name: category.epic_name,
        description: category.description,
        icon: category.icon,
        gradient: category.gradient,
        cover_image: category.cover_image,
        order: category.order,
      },
      create: {
        slug: category.slug,
        epic_name: category.epic_name,
        description: category.description,
        icon: category.icon,
        gradient: category.gradient,
        cover_image: category.cover_image,
        order: category.order,
        is_active: true,
      },
    });
    console.log(`✅ Upserted category: ${upserted.epic_name}`);
  }

  console.log("✅ Blog categories seeded successfully!\n");
}


import * as fs from 'fs';
import * as path from 'path';

async function seedBlogPosts() {
  console.log("🌱 Seeding blog posts from text files...");

  // Clear existing posts to ensure clean state and remove duplicates
  await prisma.blogPost.deleteMany({});
  console.log("🗑️ Cleared existing blog posts.");

  const baseDir = path.join(process.cwd(), 'public', 'Blog');

  const categoryFiles = [
    { slug: 'entrenamiento-y-energia-fisica', filename: 'Articulos categoria 1 Triarvon.txt' },
    { slug: 'estilo-y-presencia', filename: 'Articulos categoria 2 Triarvon.txt' },
    { slug: 'mentalidad-y-disciplina', filename: 'Articulos categoria 3 Triarvon.txt' },
    { slug: 'productividad-y-gestion-del-tiempo', filename: 'Articulos categoria 4 Triarvon.txt' },
  ];

  for (const catFile of categoryFiles) {
    const filePath = path.join(baseDir, catFile.filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${catFile.filename}`);
      continue;
    }

    console.log(`Processing ${catFile.filename} for category ${catFile.slug}...`);

    // Read with UTF-8 encoding 
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Split by "Título SEO:" (handling accents) to separate posts. 
    const chunks = fileContent.split(/T[íi]tulo SEO:/i);

    // Skip chunk 0 if it doesn't contain post data
    for (let i = 1; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Extract title: everything before "Slug URL:" or "Slug:"
      const titleMatch = chunk.match(/^([\s\S]*?)(?=Slug(?: URL)?:)/i);
      const rawTitle = titleMatch ? titleMatch[1].trim() : chunk.split(/\r?\n/)[0].trim();

      // Extract Slug URL (the path part)
      const slugMatch = chunk.match(/Slug(?: URL)?:\s*\/?([^\s/]+\/[^\s]+)\s*(?:Meta|Palabras|Contenido|$)/i);
      let slug = '';
      if (slugMatch) {
        // Extract just the last segment of the path as slug
        const pathParts = slugMatch[1].replace(/\/$/, '').split('/');
        slug = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';
      }
      if (!slug) {
        slug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }

      // Extract Meta Descripción - it's on the same line, ends at newline
      const excerptMatch = chunk.match(/Meta Descripci[óo]n:\s*([^\r\n]+)/i);
      const excerpt = excerptMatch ? excerptMatch[1].trim() : '';

      // Content is everything AFTER the first line (containing all metadata)
      // The chunk structure is: "Title Slug URL: ... Meta Descripción: ...\n\n[ACTUAL CONTENT]"
      // Split by the first double newline or after the meta description line
      const lines = chunk.split(/\r?\n/);
      // Find the first non-empty line after the metadata line (line 0 has all metadata)
      let contentStartIndex = 1;
      while (contentStartIndex < lines.length && lines[contentStartIndex].trim() === '') {
        contentStartIndex++;
      }
      // Join remaining lines as content
      const content = lines.slice(contentStartIndex).join('\n').trim();

      // Keywords - try to extract from text patterns or leave empty
      const keywords: string[] = [];

      // Generate a random-ish date relative to now
      const date = new Date();
      date.setDate(date.getDate() - (i * 2) - (categoryFiles.indexOf(catFile) * 5));

      // Fallback images
      let coverImage = "";
      switch (catFile.slug) {
        case 'entrenamiento-y-energia-fisica': coverImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"; break;
        case 'estilo-y-presencia': coverImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"; break;
        case 'mentalidad-y-disciplina': coverImage = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"; break;
        case 'productividad-y-gestion-del-tiempo': coverImage = "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=80"; break;
      }

      if (slug) {
        try {
          // Since we force delete all, we just create
          await prisma.blogPost.create({
            data: {
              slug: slug,
              title: rawTitle,
              excerpt: excerpt,
              content: content,
              cover_image: coverImage,
              published_at: date,
              category_slug: catFile.slug,
              keywords: keywords,
              is_published: true,
              author_id: 1
            },
          });
          console.log(`✅ Created post: ${rawTitle.substring(0, 30)}...`);
        } catch (e) {
          console.error(`Error Creating ${slug}:`, e);
        }
      }
    }
  }
  console.log("✅ Blog posts seeded successfully!\n");
}

async function main() {
  try {
    await seedBlogCategories();
    // Check if user exists for author or create dummy admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@triarvon.com' },
      update: {},
      create: {
        email: 'admin@triarvon.com',
        uid: 'admin-seed-uid',
        name: 'Triarvon Admin',
        role: 'admin'
      }
    });

    // Now seed posts with admin author
    await seedBlogPosts();

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
