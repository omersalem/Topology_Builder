import { useRef, useEffect, useState } from 'react';
import { Group, Image, Text, Circle, Transformer } from 'react-konva';
import Konva from 'konva';
import type { Device, Asset } from '../../types/topology';

interface DeviceNodeProps {
  device: Device;
  asset?: Asset;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

export default function DeviceNode({
  device,
  asset,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
}: DeviceNodeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (asset) {
      const img = new window.Image();
      img.src = asset.src;
      img.onload = () => {
        setImage(img);
      };
    }
  }, [asset]);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    // Update device with new dimensions
    const newWidth = Math.max(device.width * scaleX, 20);
    const newHeight = Math.max(device.height * scaleY, 20);

    // This would dispatch an update - simplified for now
    console.log('Transform:', { width: newWidth, height: newHeight, rotation: node.rotation() });
  };

  if (!asset || !image) {
    return null;
  }

  return (
    <>
      <Group
        ref={groupRef}
        id={device.id}
        x={device.x}
        y={device.y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Device Image */}
        <Image
          image={image}
          width={device.width}
          height={device.height}
          opacity={device.style.opacity}
        />

        {/* Device Label */}
        <Text
          text={device.label}
          x={0}
          y={device.height + 5}
          width={device.width}
          fontSize={12}
          fill="#ffffff"
          align="center"
        />

        {/* Port Anchors */}
        {device.ports.map((port) => (
          <Circle
            key={port.id}
            x={device.width * port.x}
            y={device.height * port.y}
            radius={4}
            fill="#00ff00"
            stroke="#ffffff"
            strokeWidth={1}
            opacity={0.8}
          />
        ))}
      </Group>

      {/* Transformer for selected device */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          borderStroke="#00a0ff"
          borderStrokeWidth={2}
          anchorStroke="#00a0ff"
          anchorFill="#ffffff"
          anchorSize={8}
        />
      )}
    </>
  );
}
