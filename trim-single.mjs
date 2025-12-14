import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, 'src/assets/icons/managed_switch_new.png');

async function trimImage() {
    try {
        console.log('Reading image from:', inputPath);

        // Get original metadata
        const originalMeta = await sharp(inputPath).metadata();
        console.log('Original size:', originalMeta.width, 'x', originalMeta.height);

        // Trim transparent/white edges
        const trimmedBuffer = await sharp(inputPath)
            .trim({
                background: { r: 255, g: 255, b: 255, alpha: 0 },
                threshold: 50
            })
            .toBuffer();

        // Get trimmed metadata
        const trimmedMeta = await sharp(trimmedBuffer).metadata();
        console.log('Trimmed size:', trimmedMeta.width, 'x', trimmedMeta.height);

        // Save trimmed image
        await sharp(trimmedBuffer).toFile(inputPath);
        console.log('Image trimmed and saved!');

    } catch (error) {
        console.error('Error:', error);
    }
}

trimImage();
