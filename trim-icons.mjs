import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Icons that need trimming
const iconsToTrim = [
  'ciscoSwitch.png',
  'ciscoRouter.png', 
  'wifi.png',
  'cisco_ftd_firewall.png',
  'network_switch-C8bXqsBJ.png',
  'server_rack-CtkQ6ao6.png',
  'secure_enclosure-Dtjd50qL.png',
  'server_blade-So6LCGC8.png',
];

const iconsDir = path.join(__dirname, 'src/assets/icons/devices');

async function trimIcons() {
  for (const iconName of iconsToTrim) {
    const iconPath = path.join(iconsDir, iconName);
    
    if (!fs.existsSync(iconPath)) {
      console.log(`Skipping ${iconName} - file not found`);
      continue;
    }
    
    try {
      // Read image, trim transparent/white edges, and overwrite
      const trimmed = await sharp(iconPath)
        .trim({
          background: { r: 255, g: 255, b: 255, alpha: 0 },
          threshold: 10
        })
        .toBuffer();
      
      await sharp(trimmed).toFile(iconPath);
      
      const metadata = await sharp(iconPath).metadata();
      console.log(`Trimmed: ${iconName} -> ${metadata.width}x${metadata.height}`);
    } catch (err) {
      console.error(`Failed to trim ${iconName}:`, err.message);
    }
  }
  
  console.log('Done trimming icons!');
}

trimIcons().catch(console.error);
