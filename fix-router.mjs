import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fixCiscoRouter() {
  const inputPath = path.join(__dirname, 'devices/ciscoRouter.png');
  const outputPath = path.join(__dirname, 'src/assets/icons/devices/ciscoRouter.png');
  
  // Get original metadata
  const metadata = await sharp(inputPath).metadata();
  console.log(`Original: ${metadata.width}x${metadata.height}`);
  
  // More aggressive trimming - remove near-white pixels too
  await sharp(inputPath)
    .trim({ threshold: 50 }) // Higher threshold to catch light backgrounds
    .toFile(outputPath);
  
  const newMetadata = await sharp(outputPath).metadata();
  console.log(`Trimmed: ${newMetadata.width}x${newMetadata.height}`);
  
  console.log('Done!');
}

fixCiscoRouter().catch(console.error);
