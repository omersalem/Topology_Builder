import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source image
const sourceImage = 'C:/Users/User/.gemini/antigravity/brain/987148e1-66f6-43d0-bbc7-9fdbf6e4421c/uploaded_image_1765954095182.png';

// Output directory
const outputDir = path.join(__dirname, 'extracted_devices');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Device locations (approximate x, y, width, height based on image analysis)
// Image appears to be roughly 1024x640
const devices = [
  { name: '01_cisco_switch', x: 28, y: 195, w: 140, h: 65 },
  { name: '02_f5_big_ip', x: 180, y: 145, w: 100, h: 75 },
  { name: '03_fortigate_601e_left', x: 370, y: 75, w: 70, h: 50 },
  { name: '04_fortigate_601e_center', x: 450, y: 75, w: 100, h: 60 },
  { name: '05_fortigate_601e_right', x: 560, y: 75, w: 70, h: 50 },
  { name: '06_cucm_server', x: 220, y: 230, w: 70, h: 90 },
  { name: '07_voip_router', x: 200, y: 330, w: 85, h: 80 },
  { name: '08_legacy_dmz', x: 135, y: 400, w: 90, h: 100 },
  { name: '09_fujitsu_core_switch', x: 340, y: 170, w: 200, h: 220 },
  { name: '10_cisco_ftd_3105', x: 770, y: 130, w: 150, h: 120 },
  { name: '11_backup_server', x: 710, y: 280, w: 140, h: 110 },
  { name: '12_esxi_blade', x: 870, y: 290, w: 90, h: 70 },
  { name: '13_tape_library', x: 400, y: 450, w: 130, h: 100 },
  { name: '14_archive_unit', x: 530, y: 440, w: 80, h: 70 },
  { name: '15_brocade_san_switch', x: 610, y: 430, w: 120, h: 55 },
  { name: '16_fujitsu_af250_storage', x: 770, y: 410, w: 160, h: 120 },
];

async function extractDevices() {
  console.log('Extracting devices from image...');
  
  // Get image metadata
  const metadata = await sharp(sourceImage).metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}`);
  
  // Scale factor if image is larger than expected
  const scaleX = metadata.width / 1024;
  const scaleY = metadata.height / 640;
  
  console.log(`Scale factors: x=${scaleX.toFixed(2)}, y=${scaleY.toFixed(2)}`);
  
  for (const device of devices) {
    try {
      // Scale coordinates
      const x = Math.round(device.x * scaleX);
      const y = Math.round(device.y * scaleY);
      const w = Math.round(device.w * scaleX);
      const h = Math.round(device.h * scaleY);
      
      // Ensure we don't exceed image bounds
      const safeX = Math.max(0, Math.min(x, metadata.width - w));
      const safeY = Math.max(0, Math.min(y, metadata.height - h));
      const safeW = Math.min(w, metadata.width - safeX);
      const safeH = Math.min(h, metadata.height - safeY);
      
      const outputPath = path.join(outputDir, `${device.name}.png`);
      
      await sharp(sourceImage)
        .extract({ left: safeX, top: safeY, width: safeW, height: safeH })
        .png({ quality: 100 })
        .toFile(outputPath);
      
      console.log(`Extracted: ${device.name} (${safeW}x${safeH})`);
    } catch (err) {
      console.error(`Failed to extract ${device.name}:`, err.message);
    }
  }
  
  console.log(`\nDone! Extracted devices saved to: ${outputDir}`);
}

extractDevices().catch(console.error);
