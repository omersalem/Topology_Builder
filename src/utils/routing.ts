import type { Point } from './geometry';
import type { Device, Port } from '../types/topology';

/**
 * Generate a straight line path between two points
 */
export function straightPath(from: Point, to: Point): Point[] {
  return [from, to];
}

/**
 * Generate an orthogonal (Manhattan-style) path between two points
 * Simple implementation that creates a two-segment path
 */
export function orthogonalPath(from: Point, to: Point): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // If points are aligned horizontally or vertically, return straight line
  if (Math.abs(dx) < 1) {
    return [from, to];
  }
  if (Math.abs(dy) < 1) {
    return [from, to];
  }

  // Create a simple two-segment orthogonal path
  // Choose the midpoint based on which dimension is larger
  const midPoint: Point =
    Math.abs(dx) > Math.abs(dy)
      ? { x: from.x + dx / 2, y: from.y }
      : { x: from.x, y: from.y + dy / 2 };

  const secondMidPoint: Point =
    Math.abs(dx) > Math.abs(dy)
      ? { x: from.x + dx / 2, y: to.y }
      : { x: to.x, y: from.y + dy / 2 };

  return [from, midPoint, secondMidPoint, to];
}

/**
 * Generate a bezier curve path
 */
export function bezierPath(from: Point, to: Point, controlPoints?: Point[]): string {
  if (!controlPoints || controlPoints.length === 0) {
    // Default control points for a smooth curve
    const dx = to.x - from.x;
    // dy could be used for vertical offset calculation in future enhancements
    // const dy = to.y - from.y;
    const offset = Math.abs(dx) * 0.3;

    const cp1: Point = { x: from.x + offset, y: from.y };
    const cp2: Point = { x: to.x - offset, y: to.y };

    return `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;
  }

  if (controlPoints.length === 1) {
    // Quadratic bezier
    return `M ${from.x} ${from.y} Q ${controlPoints[0].x} ${controlPoints[0].y}, ${to.x} ${to.y}`;
  }

  // Cubic bezier
  const cp1 = controlPoints[0];
  const cp2 = controlPoints[1];
  return `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;
}

/**
 * Get the absolute position of a port on a device
 */
export function getPortPosition(device: Device, port: Port): Point {
  const portX = device.x + device.width * port.x;
  const portY = device.y + device.height * port.y;
  
  return { x: portX, y: portY };
}

/**
 * Find the nearest port on a device to a given point
 */
export function findNearestPort(device: Device, point: Point, maxDistance: number = 30): Port | null {
  let nearestPort: Port | null = null;
  let minDistance = maxDistance;

  for (const port of device.ports) {
    const portPos = getPortPosition(device, port);
    const dx = portPos.x - point.x;
    const dy = portPos.y - point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDistance) {
      minDistance = dist;
      nearestPort = port;
    }
  }

  return nearestPort;
}

/**
 * Get the edge point of a device based on the direction to another point
 */
export function getDeviceEdgePoint(device: Device, targetPoint: Point): Point {
  const centerX = device.x + device.width / 2;
  const centerY = device.y + device.height / 2;

  const dx = targetPoint.x - centerX;
  const dy = targetPoint.y - centerY;

  // Calculate intersection with device rectangle
  const halfWidth = device.width / 2;
  const halfHeight = device.height / 2;

  if (Math.abs(dx / halfWidth) > Math.abs(dy / halfHeight)) {
    // Intersects with left or right edge
    const x = dx > 0 ? device.x + device.width : device.x;
    const y = centerY + (dy / Math.abs(dx)) * halfWidth;
    return { x, y };
  } else {
    // Intersects with top or bottom edge
    const x = centerX + (dx / Math.abs(dy)) * halfHeight;
    const y = dy > 0 ? device.y + device.height : device.y;
    return { x, y };
  }
}

/**
 * Calculate points for an arrow head
 */
export function getArrowPoints(from: Point, to: Point, arrowSize: number = 10): Point[] {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const arrowAngle = Math.PI / 6; // 30 degrees

  const p1: Point = {
    x: to.x - arrowSize * Math.cos(angle - arrowAngle),
    y: to.y - arrowSize * Math.sin(angle - arrowAngle),
  };

  const p2: Point = {
    x: to.x - arrowSize * Math.cos(angle + arrowAngle),
    y: to.y - arrowSize * Math.sin(angle + arrowAngle),
  };

  return [p1, to, p2];
}

/**
 * Get a point along a path at a specific percentage (0-1)
 * Useful for positioning labels along links
 */
export function getPointOnPath(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  // Calculate total length
  let totalLength = 0;
  const segments: number[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const length = Math.sqrt(dx * dx + dy * dy);
    segments.push(length);
    totalLength += length;
  }

  // Find the segment
  const targetLength = totalLength * t;
  let currentLength = 0;

  for (let i = 0; i < segments.length; i++) {
    if (currentLength + segments[i] >= targetLength) {
      const segmentT = (targetLength - currentLength) / segments[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      
      return {
        x: p1.x + (p2.x - p1.x) * segmentT,
        y: p1.y + (p2.y - p1.y) * segmentT,
      };
    }
    currentLength += segments[i];
  }

  return points[points.length - 1];
}
