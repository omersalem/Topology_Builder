import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fixCiscoRouter() {
  const inputPath = path.join(__dirname, 'devices/ciscoRouter.png');
  const outputPath = path.join(__dirname, 'src/assets/icons/devices/ciscoRouter.png');
  
  // Just simple trim - don't modify pixel colors
  await sharp(inputPath)
    .trim()  // Simple trim using default settings
    .toFile(outputPath);
  
  const meta = await sharp(outputPath).metadata();
  console.log(`Trimmed Cisco Router: ${meta.width}x${meta.height}`);
}

fixCiscoRouter().catch(console.error);
