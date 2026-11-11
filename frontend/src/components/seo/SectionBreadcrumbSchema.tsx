"use client";

import React from "react";
import { usePathname } from "next/navigation";

const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.triarvon.com"
).replace(/\/$/, "");

// Solo las paginas que no declaran su propia ruta de navegacion (los articulos y las
// categorias del blog ya emiten BreadcrumbList).
const LABELS: Record<string, string> = {
  "/links": "Enlaces",
  "/politica-de-privacidad": "Política de privacidad",
  "/terminos-y-condiciones": "Términos y condiciones",
  "/autor": "Autores",
  "/autor/andres-guerrero": "Andrés Guerrero",
};

export default function SectionBreadcrumbSchema() {
  const pathname = (usePathname() || "").replace(/\/$/, "");
  if (!LABELS[pathname]) return null;
  const items = [{ name: "Inicio", url: SITE }];
  let current = "";
  for (const part of pathname.split("/").filter(Boolean)) {
    current += `/${part}`;
    // /autor no es una pagina: no entra como escalon enlazable.
    if (current === "/autor") continue;
    items.push({ name: LABELS[current] ?? part, url: `${SITE}${current}` });
  }
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
