
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_DATA = [
    {
        slug: 'entrenamiento-y-energia-fisica',
        epic_name: 'Cuerpo Espartano',
        description: 'Rutinas, fuerza, resistencia y energía para hombres.',
        icon: 'Dumbbell', // Storing icon name as string
        gradient: 'from-red-600 to-orange-600',
        cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&h=600',
        order: 1,
    },
    {
        slug: 'estilo-y-presencia',
        epic_name: 'Estilo Espartano',
        description: 'Moda, cuidado personal y presencia masculina.',
        icon: 'Shirt',
        gradient: 'from-blue-600 to-indigo-600',
        cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=600',
        order: 2,
    },
    {
        slug: 'mentalidad-y-disciplina',
        epic_name: 'Mentalidad Espartana',
        description: 'Disciplina, hábitos y resiliencia masculina.',
        icon: 'Brain',
        gradient: 'from-purple-600 to-pink-600',
        cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&h=600',
        order: 3,
    },
    {
        slug: 'productividad-y-gestion-del-tiempo',
        epic_name: 'Productividad Espartana',
        description: 'Gestión del tiempo y máximo rendimiento.',
        icon: 'Clock',
        gradient: 'from-green-600 to-teal-600',
        cover_image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&h=600',
        order: 4,
    },
];

async function main() {
    console.log('🌱 Seeding Blog Categories...');

    for (const category of CATEGORY_DATA) {
        const upsertedCategory = await prisma.blogCategory.upsert({
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
        console.log(`Created/Updated category: ${upsertedCategory.epic_name}`);
    }

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
