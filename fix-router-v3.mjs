import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fixCiscoRouter() {
  const inputPath = path.join(__dirname, 'devices/ciscoRouter.png');
  const outputPath = path.join(__dirname, 'src/assets/icons/devices/ciscoRouter.png');
  
  // Read image as raw pixels
  const image = sharp(inputPath);
  
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const pixels = new Uint8Array(data);
  const width = info.width;
  const height = info.height;
  
  // Make all light/grayish pixels transparent
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Check if pixel is light colored (brightness > 180)
    const brightness = (r + g + b) / 3;
    
    // Make near-white and light gray pixels transparent
    if (brightness > 180) {
      pixels[i + 3] = 0;
    }
    
    // Also make very low alpha pixels fully transparent
    if (a < 20) {
      pixels[i + 3] = 0;
    }
  }
  
  // Find actual bounding box of non-transparent pixels
  let minX = width, minY = height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = pixels[idx + 3];
      
      if (alpha > 10) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  console.log(`Bounding box: (${minX},${minY}) to (${maxX},${maxY})`);
  
  const newWidth = maxX - minX + 1;
  const newHeight = maxY - minY + 1;
  
  // Create cropped image
  const croppedPixels = new Uint8Array(newWidth * newHeight * 4);
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcIdx = ((y + minY) * width + (x + minX)) * 4;
      const dstIdx = (y * newWidth + x) * 4;
      
      croppedPixels[dstIdx] = pixels[srcIdx];
      croppedPixels[dstIdx + 1] = pixels[srcIdx + 1];
      croppedPixels[dstIdx + 2] = pixels[srcIdx + 2];
      croppedPixels[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }
  
  // Save cropped image
  await sharp(Buffer.from(croppedPixels), {
    raw: {
      width: newWidth,
      height: newHeight,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);
  
  console.log(`Fixed Cisco Router: ${newWidth}x${newHeight}`);
}

fixCiscoRouter().catch(console.error);
