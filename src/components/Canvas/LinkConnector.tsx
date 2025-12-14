import { Arrow, Text } from 'react-konva';
import type { Link, Device } from '../../types/topology';
import { straightPath, orthogonalPath, getPortPosition, getDeviceEdgePoint, getPointOnPath } from '../../utils/routing';

interface LinkConnectorProps {
  link: Link;
  devices: Device[];
  isSelected: boolean;
  onSelect: () => void;
}

export default function LinkConnector({ link, devices, isSelected, onSelect }: LinkConnectorProps) {
  const fromDevice = devices.find((d) => d.id === link.from.deviceId);
  const toDevice = devices.find((d) => d.id === link.to.deviceId);

  if (!fromDevice || !toDevice) {
    return null;
  }

  // Calculate start and end points
  let startPoint;
  let endPoint;

  if (link.from.portId) {
    const port = fromDevice.ports.find((p) => p.id === link.from.portId);
    if (port) {
      startPoint = getPortPosition(fromDevice, port);
    } else {
      startPoint = { x: fromDevice.x + fromDevice.width / 2, y: fromDevice.y + fromDevice.height / 2 };
    }
  } else {
    const deviceCenter = { x: toDevice.x + toDevice.width / 2, y: toDevice.y + toDevice.height / 2 };
    startPoint = getDeviceEdgePoint(fromDevice, deviceCenter);
  }

  if (link.to.portId) {
    const port = toDevice.ports.find((p) => p.id === link.to.portId);
    if (port) {
      endPoint = getPortPosition(toDevice, port);
    } else {
      endPoint = { x: toDevice.x + toDevice.width / 2, y: toDevice.y + toDevice.height / 2 };
    }
  } else {
    endPoint = getDeviceEdgePoint(toDevice, startPoint);
  }

  // Generate path based on type
  let points: number[] = [];

  if (link.pathType === 'straight') {
    const path = straightPath(startPoint, endPoint);
    points = path.flatMap((p) => [p.x, p.y]);
  } else if (link.pathType === 'orthogonal') {
    const path = orthogonalPath(startPoint, endPoint);
    points = path.flatMap((p) => [p.x, p.y]);
  }

  // Calculate label position (midpoint)
  const pathPoints = link.pathType === 'straight' 
    ? straightPath(startPoint, endPoint)
    : orthogonalPath(startPoint, endPoint);
  
  const labelPos = getPointOnPath(pathPoints, 0.5);

  return (
    <>
      <Arrow
        points={points}
        stroke={link.style.color}
        strokeWidth={link.style.width}
        dash={link.style.dash}
        onClick={onSelect}
        onTap={onSelect}
        pointerLength={10}
        pointerWidth={10}
        fill={link.style.color}
        opacity={isSelected ? 1 : 0.9}
        shadowBlur={isSelected ? 10 : 0}
        shadowColor={link.style.color}
      />

      {/* Link Label */}
      {link.label && (
        <Text
          text={link.label}
          x={labelPos.x - 20}
          y={labelPos.y - 10}
          fontSize={10}
          fill={link.style.color}
          padding={4}
          align="center"
        />
      )}
    </>
  );
}
