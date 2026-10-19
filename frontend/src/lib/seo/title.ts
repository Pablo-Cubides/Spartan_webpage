// Title SEO de un articulo: maximo 60 caracteres (Google corta mas alla). El titular largo se queda en el H1 y en el
// schema; aqui solo se acorta lo que va en <title> y en la tarjeta de busqueda.

export const SEO_TITLE_MAX = 60;

export function fitTitle(title: string, max: number = SEO_TITLE_MAX): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  // 1) Cortar en el primer separador natural si deja un titulo con sentido (">= 25" caracteres)
  for (const separator of [": ", " - ", " — ", " (", " | ", "? ", "! "]) {
    const index = clean.indexOf(separator);
    if (index >= 25 && index <= max) {
      const head = clean
        .slice(0, index + (separator === "? " || separator === "! " ? 1 : 0))
        .trim();
      if (head.length >= 25) return head;
    }
  }

  // 2) Cortar en la ultima palabra completa que entre
  const cut = clean.slice(0, max + 1);
  const space = cut.lastIndexOf(" ");
  let head = (space > 25 ? cut.slice(0, space) : clean.slice(0, max)).replace(
    /[\s,;:.\-–—(]+$/,
    "",
  );
  // no terminar en una palabra suelta ("... cientificos y")
  const dangling =
    /\s(y|e|o|u|de|del|la|el|los|las|un|una|en|con|para|por|a|al|que|se|su|sus)$/i;
  while (dangling.test(head))
    head = head.replace(dangling, "").replace(/[\s,;:.\-–—(]+$/, "");
  return head;
}
