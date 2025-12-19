import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Icons with white/light background to remove
const iconsToFix = [
  { src: 'devices/ciscoRouter.png', dest: 'src/assets/icons/devices/ciscoRouter.png' },
  { src: 'devices/DVR.png', dest: 'src/assets/icons/devices/DVR.png' },
  { src: 'devices/fujitsu_storage_system-BlN8IipV.png', dest: 'src/assets/icons/devices/fujitsu_storage_system-BlN8IipV.png' },
];

async function removeWhiteBackground(inputPath, outputPath) {
  // Read image as raw pixels
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Process image: make near-white pixels transparent
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Create new buffer with transparency applied
  const pixels = new Uint8Array(data);
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Check if pixel is near-white (all channels > 240)
    if (r > 240 && g > 240 && b > 240) {
      pixels[i + 3] = 0; // Make transparent
    }
  }
  
  // Save with transparency
  await sharp(Buffer.from(pixels), {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .trim({ threshold: 20 })
  .png()
  .toFile(outputPath);
  
  const newMeta = await sharp(outputPath).metadata();
  console.log(`Fixed: ${path.basename(outputPath)} -> ${newMeta.width}x${newMeta.height}`);
}

async function main() {
  for (const icon of iconsToFix) {
    const inputPath = path.join(__dirname, icon.src);
    const outputPath = path.join(__dirname, icon.dest);
    
    try {
      await removeWhiteBackground(inputPath, outputPath);
    } catch (err) {
      console.error(`Failed ${icon.src}:`, err.message);
    }
  }
  console.log('Done!');
}

main();
