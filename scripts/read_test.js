const fs = require('fs');
const path = require('path');

const files = [
    'Articulos categoria 1 Spartan.txt',
    'Articulos categoria 2 Spartan.txt',
    'Articulos categoria 3 Spartan.txt',
    'Articulos categoria 4 Spartan.txt'
];

const dir = 'frontend/public/Blog';

files.forEach(file => {
    const filePath = path.join(process.cwd(), dir, file);
    if (fs.existsSync(filePath)) {
        console.log(`\n\n=== FILE: ${file} ===\n`);
        const content = fs.readFileSync(filePath, 'latin1');
        const lines = content.split(/\r?\n/);
        console.log(`Total lines: ${lines.length}`);
        for (let i = 50; i < 90 && i < lines.length; i++) {
            console.log(`Line ${i}: ${JSON.stringify(lines[i])}`);
        }

    } else {
        console.log(`File not found: ${filePath}`);
    }
});
