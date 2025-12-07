import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedBlogCategories() {
  console.log("🌱 Seeding blog categories...");

  const categories = [
    {
      name_display: "Cuerpo Espartano",
      slug: "entrenamiento-y-energia-fisica",
      description:
        "Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio inteligente y consejos para ganar músculo y salud sin vivir en el gym.",
      meta_title:
        "Cuerpo Espartano – Entrenamiento y energía física | Spartan Club",
      meta_description:
        "Artículos sobre entrenamiento físico, fuerza, resistencia y energía para hombres. Rutinas en casa, gimnasio, cardio inteligente y consejos para ganar músculo.",
      sort_order: 0,
    },
    {
      name_display: "Estilo Espartano",
      slug: "estilo-y-presencia",
      description:
        "Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen sin perder tu esencia.",
      meta_title:
        "Estilo Espartano – Guías de estilo y presencia masculina | Spartan Club",
      meta_description:
        "Guías de estilo y presencia para hombres: ropa, combinaciones, cuidado personal, lenguaje corporal y detalles que mejoran tu imagen.",
      sort_order: 1,
    },
    {
      name_display: "Mentalidad Espartana",
      slug: "mentalidad-y-disciplina",
      description:
        "Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos que te llevan a tus metas.",
      meta_title:
        "Mentalidad Espartana – Disciplina y hábitos para hombres | Spartan Club",
      meta_description:
        "Contenidos sobre mentalidad, disciplina, hábitos y resiliencia masculina. Cómo construir carácter, superar excusas y sostener hábitos.",
      sort_order: 2,
    },
    {
      name_display: "Productividad Espartana",
      slug: "productividad-y-gestion-del-tiempo",
      description:
        "Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados en estudio, trabajo y proyectos personales.",
      meta_title:
        "Productividad Espartana – Gestión de tiempo y rendimiento | Spartan Club",
      meta_description:
        "Estrategias y herramientas para que los hombres organicen mejor su tiempo, sean más productivos y consigan resultados en estudio, trabajo y proyectos.",
      sort_order: 3,
    },
  ];

  for (const category of categories) {
    const existing = await (prisma as any).blogCategory.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      await (prisma as any).blogCategory.create({ data: category });
      console.log(`✅ Created category: ${category.name_display}`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name_display}`);
    }
  }

  console.log("✅ Blog categories seeded successfully!\n");
}

async function main() {
  try {
    await seedBlogCategories();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
