import Konva from 'konva';
import type { Topology } from '../types/topology';

/**
 * Export topology to JSON string
 */
export function exportToJSON(topology: Topology): string {
  const exportData = {
    ...topology,
    meta: {
      ...topology.meta,
      updatedAt: new Date().toISOString(),
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export stage to PNG
 */
export async function exportToPNG(
  stage: Konva.Stage,
  scale: number = 1
): Promise<Blob> {
  const dataURL = stage.toDataURL({
    pixelRatio: scale,
    mimeType: 'image/png',
  });

  const response = await fetch(dataURL);
  return response.blob();
}

/**
 * Export topology to SVG
 * Note: This is a simplified SVG export that converts the topology data to SVG markup
 */
export function exportToSVG(topology: Topology): string {
  const { canvas, devices, links, groups, shapes, texts } = topology;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <rect width="100%" height="100%" fill="${canvas.backgroundColor}"/>
`;

  // Export groups (background zones)
  for (const group of groups) {
    svg += `  <g id="${group.id}">
    <rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}"
          fill="${group.style.fill}" stroke="${group.style.stroke}" 
          opacity="${group.style.opacity}"/>
    <text x="${group.x + 10}" y="${group.y + 20}" fill="#fff" font-size="14" font-weight="bold">
      ${escapeXml(group.label)}
    </text>
  </g>
`;
  }

  // Export shapes
  for (const shape of shapes) {
    if (shape.type === 'rectangle' || shape.type === 'roundedRect') {
      const rx = shape.type === 'roundedRect' ? shape.cornerRadius || 0 : 0;
      svg += `  <rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"
          fill="${shape.style.fill}" stroke="${shape.style.stroke}" 
          stroke-width="${shape.style.strokeWidth}" opacity="${shape.style.opacity}"
          rx="${rx}" transform="rotate(${shape.rotation} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})"/>
`;
    } else if (shape.type === 'circle') {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      const r = shape.radius || Math.min(shape.width, shape.height) / 2;
      svg += `  <circle cx="${cx}" cy="${cy}" r="${r}"
          fill="${shape.style.fill}" stroke="${shape.style.stroke}" 
          stroke-width="${shape.style.strokeWidth}" opacity="${shape.style.opacity}"/>
`;
    }
  }

  // Export devices
  for (const device of devices) {
    const asset = topology.assets.find((a) => a.id === device.assetId);
    if (asset) {
      svg += `  <g id="${device.id}" transform="translate(${device.x}, ${device.y}) rotate(${device.rotation} ${device.width / 2} ${device.height / 2})">
    <image href="${asset.src}" x="0" y="0" width="${device.width}" height="${device.height}" opacity="${device.style.opacity}"/>
    <text x="${device.width / 2}" y="${device.height + 15}" text-anchor="middle" fill="#fff" font-size="12">
      ${escapeXml(device.label)}
    </text>
  </g>
`;
    }
  }

  // Export links
  for (const link of links) {
    const fromDevice = devices.find((d) => d.id === link.from.deviceId);
    const toDevice = devices.find((d) => d.id === link.to.deviceId);

    if (fromDevice && toDevice) {
      const fromX = fromDevice.x + fromDevice.width / 2;
      const fromY = fromDevice.y + fromDevice.height / 2;
      const toX = toDevice.x + toDevice.width / 2;
      const toY = toDevice.y + toDevice.height / 2;

      const dashArray = link.style.dash.length > 0 ? link.style.dash.join(',') : 'none';

      svg += `  <line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}"
          stroke="${link.style.color}" stroke-width="${link.style.width}" 
          stroke-dasharray="${dashArray}"/>
`;

      if (link.label) {
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        svg += `  <text x="${midX}" y="${midY}" text-anchor="middle" fill="${link.style.color}" font-size="10">
      ${escapeXml(link.label)}
    </text>
`;
      }
    }
  }

  // Export text annotations
  for (const text of texts) {
    svg += `  <text x="${text.x}" y="${text.y}" fill="${text.color}" 
          font-size="${text.fontSize}" font-family="${text.fontFamily}" 
          text-anchor="${text.align}" transform="rotate(${text.rotation} ${text.x} ${text.y})">
    ${escapeXml(text.text)}
  </text>
`;
  }

  svg += `</svg>`;

  return svg;
}

/**
 * Download a file with the given content
 */
export function downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob 
    ? content 
    : new Blob([content], { type: mimeType || 'text/plain' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
