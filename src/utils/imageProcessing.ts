/**
 * Image processing utilities for asset management
 */

/**
 * Convert a File to base64 data URL
 */
export async function imageToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Load an image from a data URL
 */
export async function loadImage(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    img.src = dataURL;
  });
}

/**
 * Remove solid background from an image (simple implementation)
 * Detects the most common edge color and makes it transparent
 */
export async function removeBackground(dataURL: string): Promise<string> {
  const img = await loadImage(dataURL);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Sample corner pixels to determine background color
  const corners = [
    [0, 0],
    [canvas.width - 1, 0],
    [0, canvas.height - 1],
    [canvas.width - 1, canvas.height - 1],
  ];
  
  const bgColor = getMostCommonColor(corners, data, canvas.width);
  
  // Make background color transparent
  if (bgColor) {
    const tolerance = 30; // Color matching tolerance
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (
        Math.abs(r - bgColor.r) < tolerance &&
        Math.abs(g - bgColor.g) < tolerance &&
        Math.abs(b - bgColor.b) < tolerance
      ) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Compress an image to reduce file size
 */
export async function compressImage(
  dataURL: string,
  maxWidth: number = 512,
  maxHeight: number = 512,
  quality: number = 0.8
): Promise<string> {
  const img = await loadImage(dataURL);
  
  let { width, height } = img;
  
  // Calculate new dimensions while maintaining aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = width * ratio;
    height = height * ratio;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // Use better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toDataURL('image/png', quality);
}

/**
 * Crop an image to a specific region
 */
export async function cropImage(
  dataURL: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  const img = await loadImage(dataURL);
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  
  return canvas.toDataURL('image/png');
}

/**
 * Get dimensions of an image
 */
export async function getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
  const img = await loadImage(dataURL);
  return { width: img.width, height: img.height };
}

/**
 * Helper: Get most common color from corner pixels
 */
function getMostCommonColor(
  corners: number[][],
  data: Uint8ClampedArray,
  width: number
): { r: number; g: number; b: number } | null {
  const colors: Map<string, number> = new Map();
  
  for (const [x, y] of corners) {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${r},${g},${b}`;
    
    colors.set(key, (colors.get(key) || 0) + 1);
  }
  
  let maxCount = 0;
  let maxColor: string | null = null;
  
  for (const [color, count] of colors) {
    if (count > maxCount) {
      maxCount = count;
      maxColor = color;
    }
  }
  
  if (maxColor) {
    const [r, g, b] = maxColor.split(',').map(Number);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Validate if a file is an image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
  return validTypes.includes(file.type);
}

/**
 * Get file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
