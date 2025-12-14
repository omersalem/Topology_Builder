// Script to remove dark checkered background from extracted icons
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, 'src/assets/icons');

const iconFiles = [
  'network_switch.png',
  'router.png',
  'f5_waf.png',
  'fortigate_firewall.png',
  'cisco_ftd_firewall.png',
  'internet_cloud.png',
  'esxi_server.png',
  'fujitsu_san_switch.png',
  'fujitsu_backup_server.png',
  'fujitsu_storage_system.png',
];

async function removeBackground() {
  for (const iconFile of iconFiles) {
    const inputPath = path.join(iconsDir, iconFile);
    const outputPath = path.join(iconsDir, iconFile.replace('.png', '_clean.png'));
    
    try {
      // Read the image
      const image = sharp(inputPath);
      const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Process each pixel - make dark pixels transparent
      // The checkered background appears to be dark gray/black
      const pixels = new Uint8Array(data.length);
      
      for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = info.channels === 4 ? data[i + 3] : 255;
        
        // Check if pixel is part of dark checkered background
        // The checkered pattern appears to be around 30-50 gray
        const brightness = (r + g + b) / 3;
        const isCheckerDark = brightness < 60 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
        
        if (isCheckerDark) {
          // Make transparent
          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = 0; // Fully transparent
        } else {
          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = a;
        }
      }
      
      // Save the processed image
      await sharp(Buffer.from(pixels), {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4
        }
      })
        .png()
        .toFile(outputPath);
      
      // Replace original with clean version
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
      
      console.log(`Processed: ${iconFile}`);
    } catch (error) {
      console.error(`Error processing ${iconFile}:`, error.message);
    }
  }
  
  console.log('Done!');
}

removeBackground();
