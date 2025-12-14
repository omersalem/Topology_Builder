import { Rect, Text } from 'react-konva';
import type { Group } from '../../types/topology';

interface GroupNodeProps {
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
}

export default function GroupNode({ group, isSelected, onSelect }: GroupNodeProps) {
  return (
    <>
      <Rect
        x={group.x}
        y={group.y}
        width={group.width}
        height={group.height}
        fill={group.style.fill}
        stroke={group.style.stroke}
        strokeWidth={isSelected ? 3 : 1}
        opacity={group.style.opacity}
        onClick={onSelect}
        onTap={onSelect}
        cornerRadius={4}
      />
      <Text
        text={group.label}
        x={group.x + 10}
        y={group.y + 10}
        fontSize={14}
        fontStyle="bold"
        fill="#ffffff"
        onClick={onSelect}
        onTap={onSelect}
      />
    </>
  );
}
