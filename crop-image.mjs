import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, 'src/assets/icons/server_rack.png');
const outputPath = join(__dirname, 'src/assets/icons/server_rack_trimmed.png');

async function trimImage() {
    try {
        console.log('Reading image from:', inputPath);

        // Read the image and trim transparent edges
        await sharp(inputPath)
            .trim() // Auto-trim transparent borders
            .toFile(outputPath);

        console.log('Trimmed image saved to:', outputPath);

        // Get info about the trimmed image
        const metadata = await sharp(outputPath).metadata();
        console.log('Trimmed image size:', metadata.width, 'x', metadata.height);

        // Replace original with trimmed version
        await sharp(outputPath)
            .toFile(inputPath.replace('.png', '_backup.png'));

        // Copy trimmed to original
        const fs = await import('fs/promises');
        await fs.copyFile(outputPath, inputPath);
        console.log('Replaced original with trimmed version');

    } catch (error) {
        console.error('Error:', error);
    }
}

trimImage();
