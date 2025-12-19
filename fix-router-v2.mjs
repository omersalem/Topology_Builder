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
  
  // More aggressive: remove light gray/white pixels
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Check if pixel is light (all channels > 200 and similar to each other = gray/white)
    const isLight = r > 200 && g > 200 && b > 200;
    const isGrayish = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;
    
    if (isLight && isGrayish) {
      pixels[i + 3] = 0; // Make transparent
    }
  }
  
  // Save with transparency and trim
  await sharp(Buffer.from(pixels), {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .trim({ threshold: 30 })
  .png()
  .toFile(outputPath);
  
  const newMeta = await sharp(outputPath).metadata();
  console.log(`Fixed Cisco Router: ${newMeta.width}x${newMeta.height}`);
}

fixCiscoRouter().catch(console.error);
