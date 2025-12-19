import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function processDevice() {
  const inputPath = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1765958596352.png';
  const outputPath = path.join(__dirname, 'src/assets/icons/devices/fujitsu_core_switch.png');
  
  // Get original metadata
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
  
  // Find bounding box of non-transparent/non-white pixels
  let minX = width, minY = height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const alpha = pixels[idx + 3];
      
      // Check if pixel is visible (not transparent and not white)
      const isWhite = r > 250 && g > 250 && b > 250;
      const isVisible = alpha > 20 && !isWhite;
      
      if (isVisible) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  console.log(`Content bounds: x=${minX}-${maxX}, y=${minY}-${maxY}`);
  
  // Add small padding (2px)
  const padding = 2;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);
  
  const newWidth = maxX - minX + 1;
  const newHeight = maxY - minY + 1;
  
  // Extract and save
  await sharp(inputPath)
    .extract({ left: minX, top: minY, width: newWidth, height: newHeight })
    .toFile(outputPath);
  
  console.log(`Saved: ${newWidth}x${newHeight} -> ${outputPath}`);
}

processDevice().catch(console.error);
