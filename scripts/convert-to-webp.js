import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'fs';
import { join, extname, dirname, basename } from 'path';

const TARGET_DIR = './public/images/characters';

function getAllPngs(dir) {
    const results = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            results.push(...getAllPngs(full));
        } else if (extname(entry).toLowerCase() === '.png') {
            results.push(full);
        }
    }
    return results;
}

const pngs = getAllPngs(TARGET_DIR);
console.log(`Encontradas ${pngs.length} imágenes PNG\n`);

let converted = 0;
let errors = 0;

for (const pngPath of pngs) {
    const webpPath = join(dirname(pngPath), basename(pngPath, '.png') + '.webp');
    try {
        await sharp(pngPath)
            .webp({ quality: 85 })
            .toFile(webpPath);
        unlinkSync(pngPath); // eliminar el PNG original
        console.log(`✓ ${pngPath.replace(TARGET_DIR, '')}`);
        converted++;
    } catch (err) {
        console.error(`✗ Error en ${pngPath}: ${err.message}`);
        errors++;
    }
}

console.log(`\nCompletado: ${converted} convertidas, ${errors} errores`);
