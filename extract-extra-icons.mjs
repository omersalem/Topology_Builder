// Extract icons from the two new images
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const image0 = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_0_1765526962685.jpg';
const image1 = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1_1765526962685.jpg';
const outputDir = path.join(__dirname, 'src/assets/icons/extra');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function extractIcons() {
  try {
    // Process Image 0 (4 cols x 3 rows)
    const img0 = sharp(image0);
    const meta0 = await img0.metadata();
    console.log(`Image 0 dimensions: ${meta0.width}x${meta0.height}`);
    
    // Grid 0: 4x3
    const colW0 = Math.floor(meta0.width / 4);
    const rowH0 = Math.floor(meta0.height / 3);
    
    const icons0 = [
      { name: 'server_blade', col: 0, row: 0 },
      { name: 'vpn_gateway', col: 1, row: 0 },
      { name: 'sfp_module', col: 2, row: 0 },
      { name: 'media_converter', col: 3, row: 0 },
      
      { name: 'docking_station', col: 0, row: 1 },
      { name: 'biometric_reader', col: 1, row: 1 },
      { name: 'smart_speaker', col: 2, row: 1 },
      { name: 'wireless_charger', col: 3, row: 1 },
      
      { name: 'pdu_strip', col: 0, row: 2 },
      { name: 'serial_device', col: 1, row: 2 },
      { name: 'wifi_router', col: 2, row: 2 },
      { name: 'pc_tower', col: 3, row: 2 }, // Actually looks like a Tape Drive maybe?
    ];

    for (const icon of icons0) {
      const padding = 10;
      const left = (icon.col * colW0) + padding;
      const top = (icon.row * rowH0) + padding;
      const width = colW0 - (padding * 2);
      const height = rowH0 - (padding * 2);
      
      await sharp(image0)
        .extract({ left, top, width, height })
        .png()
        .toFile(path.join(outputDir, `${icon.name}.png`));
      console.log(`Extracted ${icon.name}`);
    }

    // Process Image 1 (3 cols x 3 rows - approximately, bottom row might have 4)
    // Looking at the second image descriptions: 
    // Row 1: 3 items (WiFi, Switch, Box)
    // Row 2: 3 items (Lockbox, NAS, Industrial)
    // Row 3: 4 items (Tower, Router, Phone, Camera, DVR) - Wait, looks like 4 items in last row possibly?
    // Let's assume 3x3 grid as base but check if bottom row needs 4 cols split
    
    const img1 = sharp(image1);
    const meta1 = await img1.metadata();
    console.log(`Image 1 dimensions: ${meta1.width}x${meta1.height}`);
    
    // Rows seem consistent height (~3)
    const rowH1 = Math.floor(meta1.height / 3);
    
    // Row 1 & 2: 3 Cols
    const colW1_3 = Math.floor(meta1.width / 3);
    
    // Row 3: Looks like 4 items? (Server, Router, Phone, Camera) + 1 (DVR)?
    // Let's stick to a safe 3-col logic first multiple items might be small
    // Actually standard generation usually does 3x3 or 4x3. 
    // Let's try 3x3 first for top 2 rows.
    
    const icons1_top = [
      { name: 'wifi_ap', col: 0, row: 0 },
      { name: 'managed_switch', col: 1, row: 0 },
      { name: 'security_box', col: 2, row: 0 },
      
      { name: 'secure_enclosure', col: 0, row: 1 },
      { name: 'nas_drive', col: 1, row: 1 },
      { name: 'automation_plc', col: 2, row: 1 },
    ];
    
    for (const icon of icons1_top) {
      const padding = 10;
      const left = (icon.col * colW1_3) + padding;
      const top = (icon.row * rowH1) + padding;
      const width = colW1_3 - (padding * 2);
      const height = rowH1 - (padding * 2);
      
      await sharp(image1)
        .extract({ left, top, width, height })
        .png()
        .toFile(path.join(outputDir, `${icon.name}.png`));
      console.log(`Extracted ${icon.name}`);
    }
    
    // Row 3 special handling - assuming 4 items
    const colW1_4 = Math.floor(meta1.width / 4);
    const row3Top = rowH1 * 2;
    const row3Height = rowH1;
    
    const icons1_bot = [
      { name: 'tower_server_2', col: 0 },
      { name: 'voip_phone', col: 1 }, // Assuming phone is 2nd
      { name: 'security_camera', col: 2 },
      { name: 'dvr_system', col: 3 },
    ];
    
    for (const icon of icons1_bot) {
      const padding = 5;
      const left = (icon.col * colW1_4) + padding;
      const top = row3Top + padding;
      const width = colW1_4 - (padding * 2);
      const height = row3Height - (padding * 2);
      
      // Ensure bounds
      const safeWidth = Math.min(width, meta1.width - left);
      
      if (safeWidth > 10) {
         await sharp(image1)
          .extract({ left, top, width: safeWidth, height: row3Height - 10 })
          .png()
          .toFile(path.join(outputDir, `${icon.name}.png`));
         console.log(`Extracted ${icon.name}`);
      }
    }

    console.log('Done extraction');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

extractIcons();
