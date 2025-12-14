// Final attempt - very aggressive background removal
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputImage = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1765521687303.png';
const outputDir = path.join(__dirname, 'src/assets/icons');

const icons = [
  { name: 'network_switch', col: 0, row: 0 },
  { name: 'router', col: 1, row: 0 },
  { name: 'f5_waf', col: 2, row: 0 },
  { name: 'fortigate_firewall', col: 3, row: 0 },
  { name: 'cisco_ftd_firewall', col: 4, row: 0 },
  { name: 'internet_cloud', col: 0, row: 1 },
  { name: 'esxi_server', col: 1, row: 1 },
  { name: 'fujitsu_san_switch', col: 2, row: 1 },
  { name: 'fujitsu_backup_server', col: 3, row: 1 },
  { name: 'fujitsu_storage_system', col: 4, row: 1 },
];

async function extractAndClean() {
  try {
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    
    console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
    
    const cols = 5;
    const rows = 2;
    const iconWidth = Math.floor(metadata.width / cols);
    const rowHeight = Math.floor(metadata.height / rows);
    
    // Crop more tightly - remove more from edges and bottom
    const padding = 10;
    const labelHeight = 70; // More aggressive label removal
    const iconHeight = rowHeight - labelHeight;
    
    console.log(`Processing with VERY aggressive background removal...`);
    
    for (const icon of icons) {
      const left = icon.col * iconWidth + padding;
      const top = icon.row * rowHeight + padding;
      const width = iconWidth - (padding * 2);
      const height = iconHeight - padding;
      
      // Extract the icon region
      const extractedBuffer = await sharp(inputImage)
        .extract({
          left: left,
          top: top,
          width: width,
          height: height
        })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const { data, info } = extractedBuffer;
      const pixels = Buffer.alloc(data.length);
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // More aggressive detection
        const maxChannel = Math.max(r, g, b);
        const minChannel = Math.min(r, g, b);
        const colorDiff = maxChannel - minChannel;
        const brightness = (r + g + b) / 3;
        
        // Remove:
        // 1. Dark gray background (checkered pattern)
        // 2. Any grayish pixel with brightness < 110
        // 3. Very dark pixels that might be shadows/borders
        const isBackground = 
          (colorDiff < 40 && brightness < 110) || // Gray background
          (brightness < 50); // Very dark pixels
        
        if (isBackground) {
          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = 0; // Make transparent
        } else {
          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = a;
        }
      }
      
      const outputPath = path.join(outputDir, `${icon.name}.png`);
      
      await sharp(pixels, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4
        }
      })
        .png()
        .toFile(outputPath);
      
      console.log(`Processed: ${icon.name}.png`);
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

extractAndClean();
