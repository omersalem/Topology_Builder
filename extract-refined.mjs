// Refine icon extraction with tighter bounds to avoid merging
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const image0 = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_0_1765526962685.jpg';
const image1 = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1_1765526962685.jpg';
const outputDir = path.join(__dirname, 'src/assets/icons/extra');

// Helper to extract with safe bounds
async function safeExtract(imgDetails, options) {
    const { image, left, top, width, height, output } = options;
    const safeLeft = Math.max(0, left);
    const safeTop = Math.max(0, top);
    const safeWidth = Math.min(width, imgDetails.width - safeLeft);
    const safeHeight = Math.min(height, imgDetails.height - safeTop);
    
    if (safeWidth <= 0 || safeHeight <= 0) return;

    await sharp(image)
        .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
        .png()
        .toFile(output);
    console.log(`Extracted ${path.basename(output)}`);
}

async function extractIcons() {
  try {
    // Image 0: 4x3 grid
    // Row 2 contained Biometric Reader merging with Speaker
    const img0 = sharp(image0);
    const meta0 = await img0.metadata();
    
    // Reduce cell width usage to 80% and center it to avoid bleed
    const colW0 = Math.floor(meta0.width / 4);
    const rowH0 = Math.floor(meta0.height / 3);
    const cropW0 = Math.floor(colW0 * 0.85); // Use only 85% of width
    const cropH0 = Math.floor(rowH0 * 0.85);
    const paddingX0 = Math.floor((colW0 - cropW0) / 2);
    const paddingY0 = Math.floor((rowH0 - cropH0) / 2);

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
      { name: 'pc_tower', col: 3, row: 2 },
    ];

    for (const icon of icons0) {
      await safeExtract(meta0, {
          image: image0,
          left: (icon.col * colW0) + paddingX0,
          top: (icon.row * rowH0) + paddingY0,
          width: cropW0,
          height: cropH0,
          output: path.join(outputDir, `${icon.name}.png`)
      });
    }

    // Image 1
    // Row 3 contained VoIP phone merging with Router
    const img1 = sharp(image1);
    const meta1 = await img1.metadata();
    
    const rowH1 = Math.floor(meta1.height / 3);
    const colW1_3 = Math.floor(meta1.width / 3);
    
    // Tighter crop for Top 2 rows (3 cols)
    const cropW1_3 = Math.floor(colW1_3 * 0.85);
    const cropH1 = Math.floor(rowH1 * 0.85);
    const paddingX1_3 = Math.floor((colW1_3 - cropW1_3) / 2);
    const paddingY1 = Math.floor((rowH1 - cropH1) / 2);

    const icons1_top = [
      { name: 'wifi_ap', col: 0, row: 0 },
      { name: 'managed_switch', col: 1, row: 0 },
      { name: 'security_box', col: 2, row: 0 },
      
      { name: 'secure_enclosure', col: 0, row: 1 },
      { name: 'nas_drive', col: 1, row: 1 },
      { name: 'automation_plc', col: 2, row: 1 },
    ];

    for (const icon of icons1_top) {
       await safeExtract(meta1, {
          image: image1,
          left: (icon.col * colW1_3) + paddingX1_3,
          top: (icon.row * rowH1) + paddingY1,
          width: cropW1_3,
          height: cropH1,
          output: path.join(outputDir, `${icon.name}.png`)
      });
    }

    // Row 3 (4 cols): Tower, Phone, Camera, DVR
    // VoIP Phone was merging with left neighbor
    const colW1_4 = Math.floor(meta1.width / 4);
    const cropW1_4 = Math.floor(colW1_4 * 0.80); // Even tighter crop (80%) for bottom row
    const paddingX1_4 = Math.floor((colW1_4 - cropW1_4) / 2);
    
    const icons1_bot = [
      { name: 'tower_server_2', col: 0 },
      { name: 'voip_phone', col: 1 }, 
      { name: 'security_camera', col: 2 },
      { name: 'dvr_system', col: 3 },
    ];
    
    const row3Top = rowH1 * 2;
    
    for (const icon of icons1_bot) {
       await safeExtract(meta1, {
          image: image1,
          left: (icon.col * colW1_4) + paddingX1_4,
          top: row3Top + paddingY1,
          width: cropW1_4,
          height: cropH1,
          output: path.join(outputDir, `${icon.name}.png`)
      });
    }

    console.log('Done extraction with tighter bounds');
  } catch (error) {
    console.error('Error:', error);
  }
}

extractIcons();
