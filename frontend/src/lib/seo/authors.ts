// Firma de los articulos de Triarvon. Google y los asistentes de IA confian mas en una persona identificable que en
// "Agente IA": cada articulo se firma con el autor de la marca y enlaza a su pagina (/autor/<slug>) con schema Person.

export const AUTHOR_SLUG = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export interface AuthorProfile {
  name: string;
  /** Texto breve que escribe el propio autor; vacio = solo se muestra lo que escribe en el sitio. */
  bio: string;
}

export const AUTHORS: Record<string, AuthorProfile> = {
  "andres-guerrero": {
    name: "Andrés Guerrero",
    bio: "Escribe y revisa los artículos de Triarvon sobre entrenamiento de fuerza, estilo, mentalidad y productividad para hombres de habla hispana.",
  },
};
