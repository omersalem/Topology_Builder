import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function aggressiveTrim() {
  // Re-copy original from user's upload
  const originalPath = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1765869335743.png';
  const outputPath = path.join(__dirname, 'src/assets/icons/devices/ciscoRouter.png');
  
  // Read raw pixels
  const { data, info } = await sharp(originalPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const pixels = new Uint8Array(data);
  const width = info.width;
  const height = info.height;
  
  console.log(`Original: ${width}x${height}`);
  
  // Find bounding box with HIGH alpha threshold (50+) to ignore shadows
  let minX = width, minY = height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = pixels[idx + 3];
      
      // Only count pixels with alpha > 50 (ignore faint shadows)
      if (alpha > 50) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  console.log(`Content bounds (alpha>50): x=${minX}-${maxX}, y=${minY}-${maxY}`);
  console.log(`New size: ${maxX - minX + 1}x${maxY - minY + 1}`);
  
  // Extract just the content area
  await sharp(originalPath)
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    })
    .toFile(outputPath);
  
  console.log('Done!');
}

aggressiveTrim().catch(console.error);
