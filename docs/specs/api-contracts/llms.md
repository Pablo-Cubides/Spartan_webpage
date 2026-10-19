# API Contract — llms.txt

---

## GET /llms.txt — Mapa del sitio para modelos de lenguaje

```
Method:     GET
Path:       /llms.txt
Auth:       None (public)
Rate:       none (cached, revalidate 3600 s)
Idempotent: yes
```

Implementation: `frontend/src/app/llms.txt/route.ts` (contenido en `frontend/src/lib/seo/llms.ts`)

Lista las herramientas, las cuatro categorias del blog y cada articulo publicado (titulo, enlace y resumen corto), generado
desde `getPublicBlogArticles()`. Reemplaza al archivo fijo `public/llms.txt`, que listaba solo 4 de 56 articulos.

### Response — Success

```
Status: 200
Content-Type: text/plain; charset=utf-8
```

---

## GET /llms-full.txt — Version extendida

```
Method:     GET
Path:       /llms-full.txt
Auth:       None (public)
Rate:       none (cached, revalidate 3600 s)
Idempotent: yes
```

Implementation: `frontend/src/app/llms-full.txt/route.ts`

Igual que `/llms.txt` con resumenes de hasta 400 caracteres por articulo.

### Response — Success

```
Status: 200
Content-Type: text/plain; charset=utf-8
```
