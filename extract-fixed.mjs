// Re-extract icons with corrected coordinates
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputImage = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1765525493967.jpg';
const outputDir = path.join(__dirname, 'src/assets/icons/premium');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function extractIcons() {
  try {
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    
    console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
    
    // Image is 1024x962
    // Looking at the image more carefully:
    // Row 1: 3 icons roughly equal, starting from y=0
    // Row 2: 3 icons, starting around y=310
    // Row 3: 5 smaller icons at bottom, starting around y=600
    
    const icons = [
      // Row 1 - 3 equal icons (341 each wide, ~280 tall)
      { name: 'network_switch', x: 20, y: 20, w: 300, h: 240 },
      { name: 'router', x: 360, y: 20, w: 300, h: 240 },
      { name: 'f5_waf', x: 700, y: 20, w: 300, h: 240 },
      
      // Row 2 - 3 icons
      { name: 'fortigate_firewall', x: 20, y: 300, w: 300, h: 240 },
      { name: 'cisco_ftd_firewall', x: 360, y: 320, w: 300, h: 220 },
      { name: 'internet_cloud', x: 700, y: 290, w: 300, h: 260 },
      
      // Row 3 - 5 smaller icons
      { name: 'cloud_small', x: 20, y: 600, w: 180, h: 200 },
      { name: 'esxi_server', x: 200, y: 660, w: 180, h: 160 },
      { name: 'fujitsu_san_switch', x: 400, y: 660, w: 180, h: 160 },
      { name: 'fujitsu_backup_server', x: 600, y: 660, w: 180, h: 160 },
      { name: 'fujitsu_storage_system', x: 830, y: 580, w: 180, h: 280 },
    ];
    
    for (const icon of icons) {
      // Ensure bounds are valid
      const left = Math.max(0, Math.min(icon.x, metadata.width - 10));
      const top = Math.max(0, Math.min(icon.y, metadata.height - 10));
      const width = Math.min(icon.w, metadata.width - left);
      const height = Math.min(icon.h, metadata.height - top);
      
      const outputPath = path.join(outputDir, `${icon.name}.png`);
      
      await sharp(inputImage)
        .extract({ left, top, width, height })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ ${icon.name}.png (${width}x${height}) from (${left},${top})`);
    }
    
    console.log('\nDone! All icons extracted.');
  } catch (error) {
    console.error('Error:', error);
  }
}

extractIcons();
