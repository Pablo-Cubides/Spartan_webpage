/**
 * Seed Blog Categories
 * Creates the 4 main blog categories with epic names and SEO data
 */

const dotenv = require('dotenv');
dotenv.config({ path: 'frontend/.env.local', override: true });

const { PrismaClient } = require('../frontend/node_modules/@prisma/client');

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

const CATEGORIES = [
    {
        slug: 'entrenamiento-y-energia-fisica',
        epic_name: 'Cuerpo Espartano',
        description: 'Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio inteligente y consejos para ganar músculo y salud sin vivir en el gym.',
        meta_title: 'Cuerpo Espartano – Entrenamiento y Energía Física para Hombres | Spartan Club',
        meta_description: 'Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio inteligente y consejos para ganar músculo.',
        icon: 'dumbbell',
        cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=630',
        order: 1,
    },
    {
        slug: 'estilo-y-presencia',
        epic_name: 'Estilo Espartano',
        description: 'Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen sin perder tu esencia.',
        meta_title: 'Estilo Espartano – Estilo y Presencia Masculina | Spartan Club',
        meta_description: 'Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen.',
        icon: 'shirt',
        cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&h=630',
        order: 2,
    },
    {
        slug: 'mentalidad-y-disciplina',
        epic_name: 'Mentalidad Espartana',
        description: 'Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos que te llevan a tus metas.',
        meta_title: 'Mentalidad Espartana – Disciplina y Hábitos para Hombres | Spartan Club',
        meta_description: 'Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos.',
        icon: 'brain',
        cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&h=630',
        order: 3,
    },
    {
        slug: 'productividad-y-gestion-del-tiempo',
        epic_name: 'Productividad Espartana',
        description: 'Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados en estudio, trabajo y proyectos personales.',
        meta_title: 'Productividad Espartana – Gestión del Tiempo para Hombres | Spartan Club',
        meta_description: 'Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados.',
        icon: 'clock',
        cover_image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&h=630',
        order: 4,
    },
];

async function main() {
    console.log('📂 Seeding blog categories...');

    for (const category of CATEGORIES) {
        const result = await prisma.blogCategory.upsert({
            where: { slug: category.slug },
            update: {
                epic_name: category.epic_name,
                description: category.description,
                meta_title: category.meta_title,
                meta_description: category.meta_description,
                icon: category.icon,
                cover_image: category.cover_image,
                order: category.order,
            },
            create: category,
        });
        console.log(`✅ Category: ${result.epic_name} (${result.slug})`);
    }

    console.log('🎉 Categories seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding categories:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
