// Extract icons from the new high-quality image - NO background changes
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputImage = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1765525493967.jpg';
const outputDir = path.join(__dirname, 'src/assets/icons/premium');

// Create output directory if needed
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Icon positions based on the image layout (approximately)
// Image appears to be ~1024x1024 based on visual inspection
// Row 1: 3 icons, Row 2: 3 icons, Row 3: 5 icons
const icons = [
  // Row 1 - 3 icons across
  { name: 'network_switch', x: 0, y: 0, w: 340, h: 280 },
  { name: 'router', x: 340, y: 0, w: 340, h: 280 },
  { name: 'f5_waf', x: 680, y: 0, w: 340, h: 280 },
  
  // Row 2 - 3 icons across
  { name: 'fortigate_firewall', x: 0, y: 280, w: 340, h: 280 },
  { name: 'cisco_ftd_firewall', x: 340, y: 280, w: 340, h: 280 },
  { name: 'internet_cloud', x: 680, y: 280, w: 340, h: 280 },
  
  // Row 3 - 5 icons across (smaller)
  { name: 'cloud_small', x: 0, y: 560, w: 200, h: 250 },
  { name: 'esxi_server', x: 200, y: 600, w: 200, h: 210 },
  { name: 'fujitsu_san_switch', x: 400, y: 600, w: 200, h: 210 },
  { name: 'fujitsu_backup_server', x: 600, y: 600, w: 200, h: 210 },
  { name: 'fujitsu_storage_system', x: 800, y: 530, w: 220, h: 300 },
];

async function extractIcons() {
  try {
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    
    console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
    
    // Calculate scale factor if image isn't 1024
    const scaleX = metadata.width / 1024;
    const scaleY = metadata.height / 1024;
    
    console.log(`Scale factors: ${scaleX.toFixed(2)}x, ${scaleY.toFixed(2)}y`);
    
    for (const icon of icons) {
      const left = Math.floor(icon.x * scaleX);
      const top = Math.floor(icon.y * scaleY);
      const width = Math.floor(icon.w * scaleX);
      const height = Math.floor(icon.h * scaleY);
      
      // Ensure we don't exceed image bounds
      const safeWidth = Math.min(width, metadata.width - left);
      const safeHeight = Math.min(height, metadata.height - top);
      
      if (safeWidth <= 0 || safeHeight <= 0) {
        console.log(`Skipping ${icon.name} - out of bounds`);
        continue;
      }
      
      const outputPath = path.join(outputDir, `${icon.name}.png`);
      
      await sharp(inputImage)
        .extract({ left, top, width: safeWidth, height: safeHeight })
        .png({ quality: 100 })
        .toFile(outputPath);
      
      console.log(`Extracted: ${icon.name}.png (${safeWidth}x${safeHeight})`);
    }
    
    console.log('Done! All icons extracted with original quality.');
  } catch (error) {
    console.error('Error:', error);
  }
}

extractIcons();
