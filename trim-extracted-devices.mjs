import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source and destination directories
const sourceDir = path.join(__dirname, 'extracted_devices');
const destDir = path.join(__dirname, 'src/assets/icons/devices');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function trimAndCopyDevice(filename) {
  const sourcePath = path.join(sourceDir, filename);
  
  // Clean up filename - remove @2x, @3x, numbers prefix, and convert to snake_case
  let cleanName = filename
    .replace(/@\d+x/g, '') // Remove @2x, @3x
    .replace(/^\d+_/, '') // Remove number prefix like "01_"
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase();
  
  // Add "_alt" suffix to indicate alternative version
  const baseName = cleanName.replace('.png', '');
  const destFilename = `${baseName}_alt.png`;
  const destPath = path.join(destDir, destFilename);
  
  try {
    // Read the image and get metadata
    const image = sharp(sourcePath);
    const metadata = await image.metadata();
    
    console.log(`Processing: ${filename} (${metadata.width}x${metadata.height})`);
    
    // Trim transparent/white borders
    await sharp(sourcePath)
      .trim({
        threshold: 10, // Tolerance for considering pixels as background
      })
      .toFile(destPath);
    
    // Get the new dimensions
    const trimmedMeta = await sharp(destPath).metadata();
    console.log(`  -> Saved as: ${destFilename} (${trimmedMeta.width}x${trimmedMeta.height})`);
    
    return {
      original: filename,
      saved: destFilename,
      varName: baseName.replace(/[^a-z0-9_]/g, '_'),
      width: trimmedMeta.width,
      height: trimmedMeta.height
    };
  } catch (err) {
    console.error(`  Error processing ${filename}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Trimming and copying extracted devices...\n');
  
  // Get all PNG files in source directory
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));
  
  console.log(`Found ${files.length} device images to process\n`);
  
  const results = [];
  
  for (const file of files) {
    const result = await trimAndCopyDevice(file);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n--- Import statements for builtInAssets.ts ---\n');
  results.forEach(r => {
    console.log(`import ${r.varName}_alt from './icons/devices/${r.saved}';`);
  });
  
  console.log('\n--- Asset entries for builtInAssets.ts ---\n');
  results.forEach(r => {
    const displayName = r.varName
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    console.log(`  {
    id: '${r.varName}_alt',
    name: '${displayName} Alt',
    type: 'png',
    src: ${r.varName}_alt,
    category: 'Network',
    defaultWidth: ${Math.min(r.width, 150)},
    defaultHeight: ${Math.min(r.height, 100)},
  },`);
  });
  
  console.log('\nDone! Copy the above code snippets to builtInAssets.ts');
}

main().catch(console.error);
