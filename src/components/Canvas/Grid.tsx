import { Line } from 'react-konva';
import type { ViewportState } from '../../types/topology';
import type { ReactElement } from 'react';

interface GridProps {
  width: number;
  height: number;
  gridSize: number;
  viewport: ViewportState;
}

export default function Grid({ width, height, gridSize, viewport }: GridProps) {
  const lines: ReactElement[] = [];

  // Calculate visible area based on viewport
  const startX = Math.floor(-viewport.x / viewport.scale / gridSize) * gridSize;
  const startY = Math.floor(-viewport.y / viewport.scale / gridSize) * gridSize;
  const endX = startX + (width / viewport.scale) + gridSize;
  const endY = startY + (height / viewport.scale) + gridSize;

  // Vertical lines
  for (let x = Math.max(0, startX); x <= Math.min(width, endX); x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, Math.max(0, startY), x, Math.min(height, endY)]}
        stroke="#2a2a2a"
        strokeWidth={1 / viewport.scale}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let y = Math.max(0, startY); y <= Math.min(height, endY); y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[Math.max(0, startX), y, Math.min(width, endX), y]}
        stroke="#2a2a2a"
        strokeWidth={1 / viewport.scale}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}
