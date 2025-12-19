import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function analyzAndFix() {
  const inputPath = path.join(__dirname, 'devices/ciscoRouter.png');
  const outputPath = path.join(__dirname, 'src/assets/icons/devices/ciscoRouter.png');
  
  // Get original info
  const origMeta = await sharp(inputPath).metadata();
  console.log(`Original: ${origMeta.width}x${origMeta.height}`);
  
  // Read raw pixels to find actual content bounds
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const pixels = new Uint8Array(data);
  const width = info.width;
  const height = info.height;
  
  // Find bounding box of non-transparent pixels (alpha > 5)
  let minX = width, minY = height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = pixels[idx + 3];
      
      // Only count pixels with reasonable alpha
      if (alpha > 5) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  console.log(`Content bounds: x=${minX}-${maxX}, y=${minY}-${maxY}`);
  console.log(`Content size: ${maxX - minX + 1}x${maxY - minY + 1}`);
  
  // Extract just the content area
  await sharp(inputPath)
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    })
    .toFile(outputPath);
  
  const newMeta = await sharp(outputPath).metadata();
  console.log(`Output: ${newMeta.width}x${newMeta.height}`);
}

analyzAndFix().catch(console.error);
