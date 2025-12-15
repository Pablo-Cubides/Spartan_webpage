const fs = require('fs');
const path = require('path');

const CATEGORIES = {
    'Articulos categoria 1 Spartan.txt': 'entrenamiento-y-energia-fisica',
    'Articulos categoria 2 Spartan.txt': 'estilo-y-presencia',
    'Articulos categoria 3 Spartan.txt': 'mentalidad-y-disciplina',
    'Articulos categoria 4 Spartan.txt': 'productividad-y-gestion-del-tiempo',
};

const AUTHOR = 'Spartan Club';
// Default image if none found
const DEFAULT_IMAGE = '/Hero.png';

const IMAGE_MAP = {
    'rutina-corta': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&h=630',
    'entrenamiento-fuerza': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=630',
    'mejores-suplementos': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&h=630',
    'barba': 'https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?auto=format&fit=crop&w=1200&h=630',
    'combinar-zapatillas': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&h=630',
    'zapatillas-blancas': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&h=630',
    'vestir-bien': 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1200&h=630',
    'sistema-spartan': 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=1200&h=630',
    'regla-de-los-5': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&h=630',
    'soledad-masculina': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&h=630',
    'rutina-de-manana': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&h=630',
    'trabajo-profundo': 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&h=630',
    'rutina-de-noche': 'https://images.unsplash.com/photo-1531353826977-0941b4719a38?auto=format&fit=crop&w=1200&h=630',
    'chatgpt': 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=1200&h=630',
    'estilos-de-barba': 'https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?auto=format&fit=crop&w=1200&h=630'
};


async function main() {
    const postsDir = path.join(process.cwd(), 'blog-posts-reimported');
    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir);
    }

    const baseDir = path.join(process.cwd(), 'frontend/public/Blog');

    for (const [filename, categorySlug] of Object.entries(CATEGORIES)) {
        const filePath = path.join(baseDir, filename);
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping missing file: ${filename}`);
            continue;
        }

        console.log(`Processing ${filename}...`);
        const content = fs.readFileSync(filePath, 'latin1');

        // Split by "Título SEO:" but keep the delimiter
        // The content is messy, so we normalize newlines first
        const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Split by "Título SEO:" but keep the text for regex matching
        // We'll use a regex global match to find each article block?
        // Using positive lookahead might be better, or just splitting.
        const chunks = normalized.split(/Título SEO:/i);

        for (let i = 1; i < chunks.length; i++) {
            let chunk = chunks[i];

            // title is at the start of the chunk (since we split by 'Título SEO:')
            // But "Slug" might be on the same line.
            let firstLineEnd = chunk.indexOf('\n');
            if (firstLineEnd === -1) firstLineEnd = chunk.length;

            let firstLine = chunk.substring(0, firstLineEnd).trim();
            let rest = chunk.substring(firstLineEnd);

            // Extract Title and Slug from first line if possible
            // Pattern: "Title text Slug" or "Title text Slug: value"
            let title = firstLine;
            let slug = '';

            // Check if "Slug" is in the first line
            const slugMatch = firstLine.match(/Slug/i);
            if (slugMatch) {
                title = firstLine.substring(0, slugMatch.index).trim();
                // Try to find slug value in the rest of the line or next lines
                // If the line was "Title Slug", the slug might be next line or buried.
            }

            // Search for Slug explicitly in the chunk if not found or empty
            const slugRegex = /Slug:?\s*([a-z0-9-]+)/i;
            const foundSlug = chunk.match(slugRegex);
            if (foundSlug) {
                slug = foundSlug[1].toLowerCase();
            }

            // If slug is "url" (placeholder) or empty, generate from title
            // Helper to normalize slug
            const normalizeSlug = (str) => {
                return str.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            };

            if (!slug || slug === 'url' || slug.length < 3) {
                // Remove "Slug" from title if it leaked
                if (title.endsWith('Slug')) title = title.substring(0, title.length - 4).trim();
                slug = normalizeSlug(title);
            } else {
                slug = normalizeSlug(slug);
            }

            const metaRegex = /Meta Description:?\s*([^(\r|\n)]+)/i;
            const foundMeta = chunk.match(metaRegex);
            let metaDesc = foundMeta ? foundMeta[1].trim() : '';

            // Body finding is tricky with all the garbage.
            // Let's assume body starts after "Meta Description" line or "Keywords" line.
            // We'll split by lines again.
            const lines = chunk.split('\n');
            let bodyStartIndex = -1;

            for (let j = 0; j < lines.length; j++) {
                const line = lines[j].trim();
                if (line.match(/^Meta Description/i) || line.match(/^Slug/i) || line.match(/^Palabras clave/i) || line.match(/^Keywords/i)) {
                    continue;
                }
                if (line.length > 0 && j > 0) {
                    // heuristic: first non-empty line after header stuff
                    // Check if it's not a garbage header
                    if (!line.includes('Título SEO')) { // Should not happen as we split by it
                        bodyStartIndex = j;
                        break;
                    }
                }
            }

            let body = bodyStartIndex !== -1 ? lines.slice(bodyStartIndex).join('\n').trim() : '';

            // Clean up body
            // Remove "?? Artículo X" lines
            body = body.replace(/^\?\? Artículo.*$/gm, '');

            // Clean up body
            // Remove trailing "Artículo X" or "?? Artículo X" or similar dividers
            body = body.split(/(\n|^)(\?\?|■|___).*?Art.culo/i)[0]
                .replace(/(\n|^)(\?\?|■).*$/gm, '') // Remove lines starting with ?? or similar
                .trim();

            // Remove repeated title at the beginning if it matches
            const firstLineBody = body.split('\n')[0].trim();
            if (firstLineBody.replace(/#/g, '').trim().toLowerCase() === title.toLowerCase()) {
                body = body.substring(firstLineBody.length).trim();
            }

            // Fix specific typos and internal notes
            body = body.replace(/VO\? m.x/g, 'VO₂ máx');
            body = body.replace(/Traffic Trigger.*$/gim, '');
            body = body.replace(/Referencia t.cnica:/gi, '**Referencia técnica:**');

            // Improve formatting
            // bold specific known headers or lists
            // If line starts with "1. ", "2. ", ensure it's on a new line.
            // Convert "1. Title" to "## 1. Title" if it looks like a section header (short line)
            body = body.replace(/^(\d+\. .+)$/gm, (match) => {
                if (match.length < 60) return `\n## ${match}\n`;
                return match;
            });

            // Fix lists: "* Item" -> "- Item"
            body = body.replace(/^\* /gm, '- ');

            // Fix links that might be plain text "(https://...)" -> "[Enlace](https://...)" or just make them clickable if they are references
            body = body.replace(/\((https?:\/\/[^\s)]+)\)/g, '($1)'); // ensure standard markdown link format if preceded by text text[](url) logic is complex, 
            // simple fix for "Referencia: (url)" -> "Referencia: [Link](url)"
            body = body.replace(/Referencia.*?: ?\((https?:\/\/[^\s)]+)\)/gi, 'Referencia: [Fuente]($1)');

            // If no slug found, generate from title
            if (!slug && title) {
                slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }

            // Determine image
            let featuredImage = DEFAULT_IMAGE;

            // Check IMAGE_MAP for slug partial match
            for (const [key, url] of Object.entries(IMAGE_MAP)) {
                if (slug.includes(key)) {
                    featuredImage = url;
                    break;
                }
            }

            // Construct Frontmatter
            const frontmatterLines = [
                '---',
                `title: "${title.replace(/"/g, '\\"')}"`,
                `description: "${(metaDesc || '').replace(/"/g, '\\"')}"`,
                `date: "2025-12-14"`,
                `category: "${categorySlug}"`,
                `slug: "${slug}"`,
                `author: "${AUTHOR}"`,
                `featuredImage: "${featuredImage}"`,
                '---',
                '',
                `# ${title}`,
                '',
                body
            ];

            const fileContent = frontmatterLines.join('\n');
            const outPath = path.join(postsDir, `${slug}.md`);

            console.log(`Generated: ${slug}.md (Title: ${title})`);
            fs.writeFileSync(outPath, fileContent, 'utf8');
        }
    }
}

main();
