const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');

const imagesToOptimize = [
  'Hero.png',
  'Logo triarvon club.png',
  'Logo triarvon club - sin fondo.png',
  'Icono triarvon club.png',
  'Herramientas/Seleccionar ropa tool.png'
];

async function optimizeImages() {
  for (const imgPath of imagesToOptimize) {
    const inputPath = path.join(publicDir, imgPath);
    if (!fs.existsSync(inputPath)) {
      console.error(`File not found: ${inputPath}`);
      continue;
    }

    const parsedPath = path.parse(inputPath);
    const outputPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);

    try {
      console.log(`Optimizing ${imgPath}...`);
      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);
      
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(2);
      
      console.log(`✅ Success! Saved ${savings}% (${(inputStats.size/1024/1024).toFixed(2)}MB -> ${(outputStats.size/1024/1024).toFixed(2)}MB)`);
    } catch (err) {
      console.error(`❌ Failed to optimize ${imgPath}:`, err);
    }
  }
}

optimizeImages();
