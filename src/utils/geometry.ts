// Geometry and math utility functions

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points in radians
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Calculate angle in degrees
 */
export function angleDegrees(p1: Point, p2: Point): number {
  return (angle(p1, p2) * 180) / Math.PI;
}

/**
 * Snap a point to grid
 */
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Check if two rectangles intersect
 */
export function rectsIntersect(r1: Rect, r2: Rect): boolean {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

/**
 * Check if a point is inside a rectangle
 */
export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Get the center point of a rectangle
 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/**
 * Calculate the closest point on a rectangle's edge to a given point
 */
export function closestPointOnRect(point: Point, rect: Rect): Point {
  const center = getRectCenter(rect);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  // Calculate which edge the point is closest to
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;

  if (Math.abs(dx / halfWidth) > Math.abs(dy / halfHeight)) {
    // Closer to left or right edge
    return {
      x: dx > 0 ? rect.x + rect.width : rect.x,
      y: center.y + (dy / Math.abs(dx)) * halfWidth,
    };
  } else {
    // Closer to top or bottom edge
    return {
      x: center.x + (dx / Math.abs(dy)) * halfHeight,
      y: dy > 0 ? rect.y + rect.height : rect.y,
    };
  }
}

/**
 * Rotate a point around a center
 */
export function rotatePoint(point: Point, center: Point, angleRad: number): Point {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Get bounding box for multiple rectangles
 */
export function getBoundingBox(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
