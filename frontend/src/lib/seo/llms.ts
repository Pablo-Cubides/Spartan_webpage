import { getPublicBlogArticles } from "@/lib/blog/service";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com"
).replace(/\/+$/, "");

const CATEGORIES: Array<{ slug: string; name: string; description: string }> = [
  {
    slug: "entrenamiento-y-energia-fisica",
    name: "Entrenamiento y Energía Física",
    description: "Rutinas de fuerza, suplementación, nutrición e hipertrofia.",
  },
  {
    slug: "estilo-y-presencia",
    name: "Estilo y Presencia",
    description:
      "Cuidado personal, vestimenta masculina, higiene y lenguaje corporal.",
  },
  {
    slug: "mentalidad-y-disciplina",
    name: "Mentalidad y Disciplina",
    description:
      "Estoicismo, control emocional, desarrollo de hábitos y relaciones sociales.",
  },
  {
    slug: "productividad-y-gestion-del-tiempo",
    name: "Productividad y Gestión del Tiempo",
    description:
      "Optimización del trabajo, herramientas de IA y rutinas de rendimiento.",
  },
];

const TOOLS = [
  {
    name: "Coach Triarvon",
    path: "/herramientas/couch_triarvono",
    description:
      "Asistente de inteligencia artificial personal para entrenamiento, nutrición, mentalidad y productividad masculina.",
  },
  {
    name: "Asesor de Forma de Rostro",
    path: "/herramientas/asesor-forma-cara",
    description:
      "Herramienta de IA para analizar la estructura facial y recomendar cortes de cabello, barba y accesorios.",
  },
  {
    name: "Asesor Personal de Estilo",
    path: "/herramientas/asesor-estilo",
    description:
      "Recomendaciones de vestimenta y estilo masculino según tu morfología.",
  },
];

const oneLine = (text: string | undefined, max = 200) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/** llms.txt generado desde los articulos publicados: lo lista cada vez, asi nunca queda desactualizado. */
export async function buildLlmsTxt({
  full = false,
}: { full?: boolean } = {}): Promise<string> {
  const articles = await getPublicBlogArticles();
  const lines: string[] = [
    "# Triarvon",
    "",
    "> Triarvon es un blog y plataforma en español (con foco en Colombia y Latinoamérica) de desarrollo personal masculino: fuerza y entrenamiento, estilo y presencia, mentalidad y disciplina, y productividad.",
    "",
    "## Herramientas de IA",
    ...TOOLS.map(
      (tool) =>
        `- [${tool.name}](${BASE_URL}${tool.path}): ${tool.description}`,
    ),
    "",
  ];
  for (const category of CATEGORIES) {
    lines.push(`## ${category.name}`, `${category.description}`, "");
    const inCategory = articles.filter(
      (article) => article.category_slug === category.slug,
    );
    for (const article of inCategory) {
      lines.push(
        `- [${oneLine(article.title, 120)}](${BASE_URL}/blog/${article.category_slug}/${article.slug}): ${oneLine(article.excerpt, full ? 400 : 160)}`,
      );
    }
    lines.push("");
  }
  lines.push(
    "## Información",
    `- [Sobre Nosotros](${BASE_URL}/nosotros): Misión, visión y código de Triarvon.`,
    `- [Términos y Condiciones](${BASE_URL}/terminos-y-condiciones): Términos legales de uso.`,
    `- [Política de Privacidad](${BASE_URL}/politica-de-privacidad): Tratamiento de datos personales y cookies.`,
    "",
  );
  return lines.join("\n");
}
