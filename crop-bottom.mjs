import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function cropBottom() {
  const inputPath = path.join(__dirname, 'src/assets/icons/devices/ciscoRouter.png');
  const tempPath = path.join(__dirname, 'src/assets/icons/devices/ciscoRouter_temp.png');
  
  const meta = await sharp(inputPath).metadata();
  console.log(`Current: ${meta.width}x${meta.height}`);
  
  // Crop 25 pixels from the bottom
  const cropAmount = 25;
  
  await sharp(inputPath)
    .extract({
      left: 0,
      top: 0,
      width: meta.width,
      height: meta.height - cropAmount
    })
    .toFile(tempPath);
  
  // Replace original
  const fs = await import('fs');
  fs.renameSync(tempPath, inputPath);
  
  const newMeta = await sharp(inputPath).metadata();
  console.log(`After crop: ${newMeta.width}x${newMeta.height}`);
}

cropBottom().catch(console.error);
