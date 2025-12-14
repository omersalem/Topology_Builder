import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconsDir = join(__dirname, 'src/assets/icons');

// Recursively find all PNG files
function findPngFiles(dir, files = []) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            findPngFiles(fullPath, files);
        } else if (extname(entry).toLowerCase() === '.png') {
            files.push(fullPath);
        }
    }
    return files;
}

async function trimAllImages() {
    const pngFiles = findPngFiles(iconsDir);
    console.log(`Found ${pngFiles.length} PNG files to process...\n`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const filePath of pngFiles) {
        const relativePath = filePath.replace(__dirname, '');
        try {
            // Read original image metadata
            const originalMeta = await sharp(filePath).metadata();
            const originalSize = `${originalMeta.width}x${originalMeta.height}`;

            // Trim the image
            const trimmedBuffer = await sharp(filePath)
                .trim()
                .toBuffer();

            // Get trimmed metadata
            const trimmedMeta = await sharp(trimmedBuffer).metadata();
            const trimmedSize = `${trimmedMeta.width}x${trimmedMeta.height}`;

            // Only save if dimensions changed significantly (more than 5% reduction)
            const originalArea = originalMeta.width * originalMeta.height;
            const trimmedArea = trimmedMeta.width * trimmedMeta.height;
            const reduction = ((originalArea - trimmedArea) / originalArea) * 100;

            if (reduction > 5) {
                await sharp(trimmedBuffer).toFile(filePath);
                console.log(`✓ ${relativePath}`);
                console.log(`  ${originalSize} → ${trimmedSize} (${reduction.toFixed(1)}% smaller)`);
                processed++;
            } else {
                console.log(`○ ${relativePath} - already optimized`);
                skipped++;
            }
        } catch (error) {
            console.error(`✗ ${relativePath} - Error: ${error.message}`);
            errors++;
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Summary: ${processed} trimmed, ${skipped} already optimized, ${errors} errors`);
}

trimAllImages();
