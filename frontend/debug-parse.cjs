const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'Blog', 'Articulos categoria 1 Spartan.txt');

try {
    const content = fs.readFileSync(filePath, 'latin1');
    console.log('File length:', content.length);
    console.log('--- START PREVIEW ---');
    console.log(content.substring(0, 1000));
    console.log('--- END PREVIEW ---');

    // Try to split
    // Looking for "Título SEO:" as a marker?
    const posts = content.split(/Título SEO:/i);
    console.log('Potential posts found:', posts.length - 1); // -1 because split creates an empty first element if it starts with pattern?

    posts.slice(1, 3).forEach((p, i) => {
        console.log(`\n\n--- POST ${i + 1} PREVIEW ---`);
        console.log('Título SEO:' + p.substring(0, 200) + '...');
    });

} catch (e) {
    console.error(e);
}
