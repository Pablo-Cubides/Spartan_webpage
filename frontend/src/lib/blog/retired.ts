// Articulos retirados o renombrados el 2026-10-19 (Page Review profundo + Search Console).
// El generador viejo publico el mismo articulo 2-3 veces, una con la tilde convertida en guion
// ("c-mo-vestir-bien"). Cada copia redirige con 301 a la version que se conserva, para no perder
// el ranking ni dejar enlaces rotos. Los articulos estaticos (static-*) no se pueden pausar desde la API:
// salen de las listas y del sitemap por estar aqui.

export const ARTICLE_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  {
    from: "/blog/entrenamiento-y-energia-fisica/rutina-corta-de-ejercicios-para-hombres-sin-tiempo-20-minutos",
    to: "/blog/entrenamiento-y-energia-fisica/rutina-corta-ejercicios-hombres-sin-tiempo",
  },
  {
    from: "/blog/entrenamiento-y-energia-fisica/mejores-suplementos-gimnasio-hombres-principiantes-creatina-y-proteina",
    to: "/blog/entrenamiento-y-energia-fisica/mejores-suplementos-gimnasio-hombres-principiantes",
  },
  {
    from: "/blog/entrenamiento-y-energia-fisica/mejores-suplementos-gimnasio-hombres-principiantes-creatina-y-prote-na",
    to: "/blog/entrenamiento-y-energia-fisica/mejores-suplementos-gimnasio-hombres-principiantes",
  },
  {
    from: "/blog/estilo-y-presencia/como-vestir-bien-para-la-oficina-con-solo-7-prendas-basicas-armario-capsula-hombre",
    to: "/blog/estilo-y-presencia/ropa-oficina-hombre-casual-elegante",
  },
  {
    from: "/blog/estilo-y-presencia/c-mo-vestir-bien-para-la-oficina-con-solo-7-prendas-b-sicas-armario-c-psula-hombre",
    to: "/blog/estilo-y-presencia/ropa-oficina-hombre-casual-elegante",
  },
  {
    from: "/blog/mentalidad-y-disciplina/rutina-de-manana-para-hombres-exitosos",
    to: "/blog/mentalidad-y-disciplina/como-construir-una-rutina-de-manana-masculina-en-5-pasos-que-si-puedas-cumplir",
  },
  {
    from: "/blog/mentalidad-y-disciplina/c-mo-construir-una-rutina-de-ma-ana-masculina-en-5-pasos-que-s-puedas-cumplir",
    to: "/blog/mentalidad-y-disciplina/como-construir-una-rutina-de-manana-masculina-en-5-pasos-que-si-puedas-cumplir",
  },
  {
    from: "/blog/estilo-y-presencia/zapatillas-blancas-y-traje-se-puede-3-reglas-para-no-verte-rid-culo",
    to: "/blog/estilo-y-presencia/zapatillas-blancas-y-traje-se-puede-3-reglas-para-no-verte-ridiculo",
  },
  {
    from: "/blog/productividad-y-gestion-del-tiempo/URL",
    to: "/blog/productividad-y-gestion-del-tiempo/como-usar-chatgpt-o-ia-para-hacer-tu-trabajo-aburrido-en-la-mitad-de-tiempo",
  },
  {
    from: "/blog/productividad-y-gestion-del-tiempo/c-mo-usar-chatgpt-o-ia-para-hacer-tu-trabajo-aburrido-en-la-mitad-de-tiempo",
    to: "/blog/productividad-y-gestion-del-tiempo/como-usar-chatgpt-o-ia-para-hacer-tu-trabajo-aburrido-en-la-mitad-de-tiempo",
  },
  {
    from: "/blog/productividad-y-gestion-del-tiempo/herramientas-inteligencia-artificial-productividad-trabajo",
    to: "/blog/productividad-y-gestion-del-tiempo/como-usar-chatgpt-o-ia-para-hacer-tu-trabajo-aburrido-en-la-mitad-de-tiempo",
  },
  {
    from: "/blog/productividad-y-gestion-del-tiempo/trabajo-profundo-deep-work-c-mo-lograr-en-2-horas-lo-que-antes-hac-as-en-8",
    to: "/blog/productividad-y-gestion-del-tiempo/trabajo-profundo-deep-work-como-lograr-en-2-horas-lo-que-antes-hacias-en-8",
  },
  {
    from: "/blog/productividad-y-gestion-del-tiempo/tecnicas-de-concentracion-para-estudiar-y-trabajar",
    to: "/blog/productividad-y-gestion-del-tiempo/trabajo-profundo-deep-work-como-lograr-en-2-horas-lo-que-antes-hacias-en-8",
  },
  {
    from: "/blog/productividad-y-gestion-del-tiempo/rutina-de-noche-para-dormir-mejor-hombres",
    to: "/blog/productividad-y-gestion-del-tiempo/rutina-de-noche-para-dormir-mejor-el-protocolo-para-apagar-tu-cerebro",
  },
  {
    from: "/blog/mentalidad-y-disciplina/la-regla-de-los-5-segundos-para-controlar-la-ira-y-el-estr-s-en-el-trabajo",
    to: "/blog/mentalidad-y-disciplina/la-regla-de-los-5-segundos-para-controlar-la-ira-y-el-estres-en-el-trabajo",
  },
  {
    from: "/blog/mentalidad-y-disciplina/ejercicios-estoicismo-control-emociones",
    to: "/blog/mentalidad-y-disciplina/la-regla-de-los-5-segundos-para-controlar-la-ira-y-el-estres-en-el-trabajo",
  },
  {
    from: "/blog/entrenamiento-y-energia-fisica/entrenamiento-de-fuerza-hombres-40-a-os-gu-a-para-ganar-m-sculo-sin-lesionarte",
    to: "/blog/entrenamiento-y-energia-fisica/entrenamiento-de-fuerza-hombres-40-anos-guia-para-ganar-musculo-sin-lesionarte",
  },
  {
    from: "/blog/mentalidad-y-disciplina/el-sistema-spartan-de-disciplina-c-mo-ser-constante-cuando-se-acaba-la-motivaci-n",
    to: "/blog/mentalidad-y-disciplina/el-sistema-spartan-de-disciplina-como-ser-constante-cuando-se-acaba-la-motivacion",
  },
  {
    from: "/blog/estilo-y-presencia/barba-de-3-d-as-vs-barba-completa-cu-l-te-favorece-seg-n-tu-tipo-de-cara",
    to: "/blog/estilo-y-presencia/barba-de-3-dias-vs-barba-completa-cual-te-favorece-segun-tu-tipo-de-cara",
  },
  {
    from: "/blog/estilo-y-presencia/asesora-de-vestimenta-personalizada-gua-completa-con-ia-para-hombres-modernos-",
    to: "/blog/estilo-y-presencia/asesora-de-vestimenta-personalizada-guia-completa-con-ia-para-hombres-modernos",
  },
  {
    from: "/blog/estilo-y-presencia/el-corte-perfecto-cmo-elegir-cabello-y-barba-segn-tu-forma-facial-con-ia-",
    to: "/blog/estilo-y-presencia/el-corte-perfecto-como-elegir-cabello-y-barba-segun-tu-forma-facial-con-ia",
  },
  {
    from: "/blog/mentalidad-y-disciplina/entrena-tu-mente-como-un-guerrero-coaching-ia-para-disciplina-y-resiliencia-masculina-",
    to: "/blog/mentalidad-y-disciplina/entrena-tu-mente-como-un-guerrero-coaching-ia-para-disciplina-y-resiliencia-masculina",
  },
  {
    from: "/blog/mentalidad-y-disciplina/la-soledad-masculina-por-qu-necesitas-un-c-rculo-de-hierro-y-c-mo-crearlo",
    to: "/blog/mentalidad-y-disciplina/la-soledad-masculina-por-que-necesitas-un-circulo-de-hierro-y-como-crearlo",
  },
  {
    from: "/blog/estilo-y-presencia/asesoria-vestimenta-personalizada-guia-ia-hombres-modernos",
    to: "/blog/estilo-y-presencia/asesora-de-vestimenta-personalizada-guia-completa-con-ia-para-hombres-modernos",
  },
  {
    from: "/blog/estilo-y-presencia/corte-perfecto-cabello-barba-forma-facial-ia",
    to: "/blog/estilo-y-presencia/el-corte-perfecto-como-elegir-cabello-y-barba-segun-tu-forma-facial-con-ia",
  },
  {
    from: "/blog/mentalidad-y-disciplina/entrena-mente-guerrero-coaching-ia-disciplina-resiliencia",
    to: "/blog/mentalidad-y-disciplina/entrena-tu-mente-como-un-guerrero-coaching-ia-para-disciplina-y-resiliencia-masculina",
  },
  {
    from: "/blog/entrenamiento-y-energia-fisica/duchas-frias-beneficios-hombre",
    to: "/blog/entrenamiento-y-energia-fisica",
  },
];

export const TOOL_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  {
    from: "/herramientas/coach-espartano",
    to: "/herramientas/couch_triarvono",
  },
  {
    from: "/herramientas/mentalidad-espartana",
    to: "/herramientas/couch_triarvono",
  },
  {
    from: "/herramientas/mentalidad-espartano",
    to: "/herramientas/couch_triarvono",
  },
];

const RETIRED_SLUGS = new Set(
  ARTICLE_REDIRECTS.map(
    (entry) => entry.from.split("/").filter(Boolean).pop() as string,
  ),
);

/** true si el slug es una copia retirada que no debe listarse ni entrar al sitemap. */
export function isRetiredSlug(slug: string): boolean {
  return RETIRED_SLUGS.has(slug);
}
