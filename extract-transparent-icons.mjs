import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Icon grid configuration based on the uploaded image
// The image appears to have icons arranged in a grid pattern
const iconConfigs = [
  // Row 1
  { name: 'cisco_switch', x: 0, y: 0, w: 130, h: 85 },
  { name: 'f5_waf', x: 140, y: 5, w: 100, h: 60 },
  { name: 'fortigate_firewall', x: 255, y: 0, w: 130, h: 75 },
  { name: 'esxi_server_1', x: 395, y: 0, w: 110, h: 90 },
  { name: 'esxi_server_2', x: 510, y: 0, w: 110, h: 90 },
  { name: 'fujitsu_storage', x: 625, y: 0, w: 105, h: 90 },
  
  // Row 2
  { name: 'cisco_router', x: 0, y: 95, w: 135, h: 70 },
  { name: 'cisco_switch_24', x: 140, y: 95, w: 140, h: 70 },
  { name: 'managed_switch', x: 285, y: 95, w: 145, h: 70 },
  { name: 'cisco_server', x: 445, y: 95, w: 130, h: 80 },
  { name: 'tape_backup', x: 580, y: 95, w: 130, h: 80 },
  
  // Row 3
  { name: 'cisco_blade_server', x: 0, y: 175, w: 110, h: 100 },
  { name: 'server_rack', x: 115, y: 175, w: 95, h: 100 },
  { name: 'network_switch_stack', x: 215, y: 175, w: 130, h: 85 },
  { name: 'cisco_nexus', x: 360, y: 175, w: 130, h: 75 },
  { name: 'fujitsu_eternus_1', x: 500, y: 175, w: 130, h: 75 },
  { name: 'fujitsu_eternus_2', x: 640, y: 175, w: 130, h: 75 },
  
  // Row 4
  { name: 'cisco_ucs', x: 0, y: 275, w: 145, h: 65 },
  { name: 'fujitsu_primergy', x: 150, y: 275, w: 140, h: 65 },
  { name: 'switch_small', x: 295, y: 280, w: 130, h: 55 },
  { name: 'cisco_catalyst', x: 435, y: 275, w: 130, h: 70 },
  { name: 'cisco_switch_48', x: 575, y: 275, w: 145, h: 70 },
];

async function extractIcons() {
  const inputPath = path.join(__dirname, 'src/assets/icons/new_devices_sheet.png');
  const outputDir = path.join(__dirname, 'src/assets/icons/transparent');
  
  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}`);
  
  for (const config of iconConfigs) {
    try {
      const outputPath = path.join(outputDir, `${config.name}.png`);
      
      await sharp(inputPath)
        .extract({
          left: config.x,
          top: config.y,
          width: config.w,
          height: config.h,
        })
        .trim() // Remove transparent edges
        .toFile(outputPath);
      
      console.log(`Extracted: ${config.name}.png`);
    } catch (err) {
      console.error(`Failed to extract ${config.name}:`, err.message);
    }
  }
  
  console.log('Done extracting icons!');
}

extractIcons().catch(console.error);
