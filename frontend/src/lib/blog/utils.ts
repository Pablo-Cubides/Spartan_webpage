/**
 * Utilidades para blog y contenido
 */

/**
 * Calcula el tiempo de lectura basado en palabras
 * Estimación: 200 palabras por minuto
 */
export function calculateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}

/**
 * Genera un slug a partir de un título
 * Ejemplo: "Cómo ser más disciplinado" -> "como-ser-mas-disciplinado"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guión
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio/final
}

/**
 * Extrae los primeros N palabras de un contenido
 * Útil para generar excerpts automáticamente
 */
export function extractExcerpt(content: string, wordCount: number = 50): string {
  const words = content.split(/\s+/).slice(0, wordCount).join(" ");
  return words + (content.split(/\s+/).length > wordCount ? "..." : "");
}

/**
 * Valida si un slug es único en la base de datos
 */
export async function isSlugUnique(
  slug: string,
  excludeId?: number
): Promise<boolean> {
  try {
    const response = await fetch("/api/blog/validate-slug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, excludeId }),
    });

    if (!response.ok) throw new Error("Validation failed");

    const { isUnique } = await response.json();
    return isUnique;
  } catch (error) {
    console.error("Error validating slug:", error);
    return false;
  }
}

/**
 * Formatea una fecha al formato español
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" = "long"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return dateObj.toLocaleDateString("es-ES");
  }

  return dateObj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Determina si debe mostrarse fecha de actualización
 * Retorna true si la actualización fue más de 30 días después de publicación
 */
export function shouldShowUpdatedDate(
  publishedAt: Date | string,
  updatedAt?: Date | string
): boolean {
  if (!updatedAt) return false;

  const pubDate = typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;
  const updDate = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;

  const daysDifference = Math.floor(
    (updDate.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDifference > 30;
}

/**
 * Sanitiza HTML para prevenir XSS
 * (Usar con cuidado, idealmente confiar en el source)
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Obtiene el texto resumido de un HTML/Markdown compilado
 */
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * Genera array de tags a partir de string separado por comas
 */
export function parseTags(tagString?: string): string[] {
  if (!tagString) return [];
  return tagString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Valida que un contenido tenga cantidad mínima de palabras
 */
export function isContentLengthValid(content: string, minWords: number = 300): boolean {
  const wordCount = content.split(/\s+/).length;
  return wordCount >= minWords;
}

/**
 * Obtiene descripción validada para meta description
 * Asegura que esté entre 150-160 caracteres
 */
export function getValidMetaDescription(
  description: string,
  maxLength: number = 160
): string {
  if (!description) return "";

  if (description.length <= maxLength) {
    return description;
  }

  // Truncar en último espacio antes de límite
  return description.substring(0, maxLength).split(" ").slice(0, -1).join(" ") + "...";
}
