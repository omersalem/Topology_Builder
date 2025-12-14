// Re-extract icons with BETTER centering
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
    
    // Better grid-based extraction
    // Row 1: 3 icons evenly spaced (each ~341 wide)
    // Row 2: 3 icons evenly spaced
    // Row 3: 5 icons
    
    const col3Width = Math.floor(metadata.width / 3);  // ~341
    const col5Width = Math.floor(metadata.width / 5);  // ~204
    const rowHeight = Math.floor(metadata.height / 3); // ~320
    
    const icons = [
      // Row 1 - 3 icons, centered in their cells
      { name: 'network_switch', col: 0, row: 0, cols: 3 },
      { name: 'router', col: 1, row: 0, cols: 3 },
      { name: 'f5_waf', col: 2, row: 0, cols: 3 },
      
      // Row 2 - 3 icons
      { name: 'fortigate_firewall', col: 0, row: 1, cols: 3 },
      { name: 'cisco_ftd_firewall', col: 1, row: 1, cols: 3 },
      { name: 'internet_cloud', col: 2, row: 1, cols: 3 },
      
      // Row 3 - 5 icons
      { name: 'cloud_small', col: 0, row: 2, cols: 5 },
      { name: 'esxi_server', col: 1, row: 2, cols: 5 },
      { name: 'fujitsu_san_switch', col: 2, row: 2, cols: 5 },
      { name: 'fujitsu_backup_server', col: 3, row: 2, cols: 5 },
      { name: 'fujitsu_storage_system', col: 4, row: 2, cols: 5 },
    ];
    
    for (const icon of icons) {
      const cellWidth = icon.cols === 3 ? col3Width : col5Width;
      const cellHeight = rowHeight;
      
      // Calculate cell position
      const cellX = icon.col * cellWidth;
      const cellY = icon.row * cellHeight;
      
      // Add small padding to avoid edge artifacts
      const padding = 5;
      const left = cellX + padding;
      const top = cellY + padding;
      const width = cellWidth - (padding * 2);
      const height = cellHeight - (padding * 2);
      
      // Ensure bounds
      const safeLeft = Math.max(0, left);
      const safeTop = Math.max(0, top);
      const safeWidth = Math.min(width, metadata.width - safeLeft);
      const safeHeight = Math.min(height, metadata.height - safeTop);
      
      const outputPath = path.join(outputDir, `${icon.name}.png`);
      
      await sharp(inputImage)
        .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ ${icon.name}.png (${safeWidth}x${safeHeight}) from cell (${icon.col},${icon.row})`);
    }
    
    console.log('\nDone! All icons extracted with proper centering.');
  } catch (error) {
    console.error('Error:', error);
  }
}

extractIcons();
