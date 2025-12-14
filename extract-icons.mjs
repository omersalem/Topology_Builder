// Script to extract icons from the uploaded image
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputImage = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1765521687303.png';
const outputDir = path.join(__dirname, 'src/assets/icons');

// Icon grid: 5 columns x 2 rows
const icons = [
  // Row 1
  { name: 'network_switch', col: 0, row: 0 },
  { name: 'router', col: 1, row: 0 },
  { name: 'f5_waf', col: 2, row: 0 },
  { name: 'fortigate_firewall', col: 3, row: 0 },
  { name: 'cisco_ftd_firewall', col: 4, row: 0 },
  // Row 2  
  { name: 'internet_cloud', col: 0, row: 1 },
  { name: 'esxi_server', col: 1, row: 1 },
  { name: 'fujitsu_san_switch', col: 2, row: 1 },
  { name: 'fujitsu_backup_server', col: 3, row: 1 },
  { name: 'fujitsu_storage_system', col: 4, row: 1 },
];

async function extractIcons() {
  try {
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    
    console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
    
    const cols = 5;
    const rows = 2;
    const iconWidth = Math.floor(metadata.width / cols);
    const rowHeight = Math.floor(metadata.height / rows);
    
    // Labels take about 40px at bottom of each icon
    const labelHeight = 50;
    const iconHeight = rowHeight - labelHeight;
    
    console.log(`Icon cell: ${iconWidth}x${rowHeight}, Icon area: ${iconWidth}x${iconHeight}`);
    
    for (const icon of icons) {
      const left = icon.col * iconWidth;
      const top = icon.row * rowHeight;
      
      const outputPath = path.join(outputDir, `${icon.name}.png`);
      
      await sharp(inputImage)
        .extract({
          left: left,
          top: top,
          width: iconWidth,
          height: iconHeight
        })
        .toFile(outputPath);
      
      console.log(`Extracted: ${icon.name}.png`);
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

extractIcons();
