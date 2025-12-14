import type { Topology } from '../types/topology';

/**
 * Import and validate topology from JSON
 */
export function importFromJSON(jsonString: string): Topology {
  try {
    const data = JSON.parse(jsonString);
    
    if (!validateTopology(data)) {
      throw new Error('Invalid topology format');
    }

    return data as Topology;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

/**
 * Validate topology data structure
 */
export function validateTopology(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required top-level properties
  if (!data.meta || !data.canvas || !data.assets || !data.devices || !data.links) {
    return false;
  }

  // Validate meta
  if (!data.meta.title || !data.meta.version) {
    return false;
  }

  // Validate canvas
  if (
    typeof data.canvas.width !== 'number' ||
    typeof data.canvas.height !== 'number' ||
    typeof data.canvas.gridSize !== 'number'
  ) {
    return false;
  }

  // Validate arrays
  if (
    !Array.isArray(data.assets) ||
    !Array.isArray(data.devices) ||
    !Array.isArray(data.links)
  ) {
    return false;
  }

  // Basic validation passed
  return true;
}

/**
 * Import topology from a file
 */
export async function importFromFile(file: File): Promise<Topology> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const topology = importFromJSON(content);
        resolve(topology);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
