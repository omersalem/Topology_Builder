import { useRef, useEffect, useState, type DragEvent } from 'react';
import { Stage, Layer, Rect, Line, Arrow, Text, Circle, Group, Image, Transformer, Ellipse, Label, Tag } from 'react-konva';
import Konva from 'konva';
import { useTopology } from '../../context/TopologyContext';
import { useTheme } from '../../context/ThemeContext';
import { generateId } from '../../utils/geometry';
import { DEFAULT_PORTS } from '../../constants/ports';
import { builtInAssets } from '../../assets/builtInAssets';

// Simple image cache
const imageCache: Record<string, HTMLImageElement> = {};

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache[src]) {
    return Promise.resolve(imageCache[src]);
  }
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Single Device component with Transformer for resize
function DeviceNode({
  device,
  isSelected,
  image,
  onSelect,
  onTransformEnd,
  onDragMove,
  onDragEnd,
  onPortClick,
  onPortMove,
  onLabelMove,
  linkingMode,
  defaultLabelColor,
}: {
  device: any;
  isSelected: boolean;
  image: HTMLImageElement | null;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
  onTransformEnd: (id: string, width: number, height: number, x: number, y: number) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onPortClick: (deviceId: string, portId: string) => void;
  onPortMove: (deviceId: string, portId: string, x: number, y: number) => void;
  onLabelMove: (deviceId: string, offsetX: number, offsetY: number) => void;
  linkingMode: boolean;
  defaultLabelColor: string;
}) {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [_isHovered, setIsHovered] = useState(false);
  const [hoveredPortId, setHoveredPortId] = useState<string | null>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Force transformer to recalculate after device dimensions change
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, device.width, device.height]);

  // Default ports for linking
  const displayPorts = device.ports?.length > 0 ? device.ports : DEFAULT_PORTS;
  // During linking mode, ALWAYS show ports on ALL devices so users can click target ports
  const showPorts = isSelected || linkingMode;

  return (
    <>
      <Group
        ref={shapeRef}
        id={device.id}
        x={device.x}
        y={device.y}
        width={device.width}
        height={device.height}
        draggable
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect(e);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect(e);
        }}
        onDragMove={(e) => {
          onDragMove(device.id, e.target.x(), e.target.y());
        }}
        onDragEnd={(e) => {
          onDragEnd(device.id, e.target.x(), e.target.y());
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Get absolute position on stage
            const absPos = node.absolutePosition();

            // Get the new dimensions
            const newWidth = Math.max(60, device.width * scaleX);
            const newHeight = Math.max(60, device.height * scaleY);

            // Reset node scale and local position
            node.scaleX(1);
            node.scaleY(1);
            node.x(0);
            node.y(0);

            // Use absolute position directly
            onTransformEnd(device.id, newWidth, newHeight, absPos.x, absPos.y);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Selection border only - no visible background */}
        {isSelected && (
          <Rect
            width={device.width}
            height={device.height}
            stroke="#3b82f6"
            strokeWidth={2}
            dash={[8, 4]}
            fill="transparent"
            cornerRadius={4}
          />
        )}

        {/* Device image - fills entire space */}
        {image && (
          <Image
            x={0}
            y={0}
            width={device.width}
            height={device.height - 22}
            image={image}
          />
        )}

        {/* Ports with hover labels - draggable to reposition */}
        {showPorts && displayPorts.map((port: any, index: number) => {
          const portX = device.width * port.x;
          const portY = device.height * port.y;
          const isDefaultPort = port.id.startsWith('port-');
          const isPortHovered = hoveredPortId === port.id;

          return (
            <Group key={port.id}>
              {/* Large hit area for easier clicking - uses near-invisible fill */}
              <Circle
                x={portX}
                y={portY}
                radius={25}
                fill="rgba(0, 0, 0, 0.01)"
                listening={true}
                onClick={(e) => {
                  e.cancelBubble = true;
                  onPortClick(device.id, port.id);
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  onPortClick(device.id, port.id);
                }}
                onMouseEnter={(e) => {
                  setHoveredPortId(port.id);
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  setHoveredPortId(null);
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'default';
                }}
              />
              {/* Visible port circle */}
              <Circle
                x={portX}
                y={portY}
                radius={isPortHovered ? 14 : (linkingMode ? 14 : 10)}
                fill={linkingMode ? '#22c55e' : (isPortHovered ? '#60a5fa' : '#3b82f6')}
                stroke="#ffffff"
                strokeWidth={2}
                shadowColor={linkingMode ? '#22c55e' : '#3b82f6'}
                shadowBlur={isPortHovered ? 15 : 10}
                draggable={isSelected && !isDefaultPort}
                onClick={(e) => {
                  e.cancelBubble = true;
                  onPortClick(device.id, port.id);
                }}
                onDragEnd={(e) => {
                  if (!isDefaultPort) {
                    const newX = Math.max(0, Math.min(1, e.target.x() / device.width));
                    const newY = Math.max(0, Math.min(1, e.target.y() / device.height));
                    e.target.position({ x: device.width * newX, y: device.height * newY });
                    onPortMove(device.id, port.id, newX, newY);
                  }
                }}
                onMouseEnter={(e) => {
                  setHoveredPortId(port.id);
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = isSelected && !isDefaultPort ? 'move' : 'pointer';
                }}
                onMouseLeave={(e) => {
                  setHoveredPortId(null);
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'default';
                }}
              />
              {/* Port label - only shown when hovering this specific port */}
              {isPortHovered && (
                <Text
                  x={portX - 30}
                  y={portY < 20 ? portY + 15 : portY - 22}
                  width={60}
                  text={port.name || `Port ${index + 1}`}
                  fontSize={11}
                  fill="#ffffff"
                  align="center"
                  fontStyle="bold"
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={1}
                />
              )}
            </Group>
          );
        })}
      </Group>

      {/* Transformer for resize - only when selected */}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          keepRatio={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 60 || newBox.height < 60) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={12}
          anchorCornerRadius={3}
          anchorFill="#3b82f6"
          anchorStroke="#ffffff"
          anchorStrokeWidth={2}
          borderStroke="#3b82f6"
          borderStrokeWidth={2}
          borderDash={[4, 4]}
        />
      )}

      {/* Device label - rendered outside Group so it doesn't affect Transformer bounds */}
      <Text
        x={device.x + (device.style?.labelOffsetX || 0)}
        y={device.y + device.height + 5 + (device.style?.labelOffsetY || 0)}
        width={device.width}
        text={device.label}
        fontSize={device.style?.labelSize || 12}
        fontFamily="Arial"
        fontStyle="bold"
        fill={device.style?.labelColor || defaultLabelColor}
        align="center"
        shadowColor="black"
        shadowBlur={4}
        draggable
        onDragEnd={(e) => {
          const newOffsetX = e.target.x() - device.x;
          const newOffsetY = e.target.y() - device.y - device.height - 5;
          onLabelMove(device.id, newOffsetX, newOffsetY);
        }}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'move';
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'default';
        }}
      />
    </>
  );
}

// Zone Shape component with resize capability
function ZoneShape({
  shape,
  isSelected,
  onSelect,
  onTransformEnd,
  onDragEnd,
  onDelete,
}: {
  shape: any;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
  onTransformEnd: (id: string, width: number, height: number, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}) {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      const newWidth = Math.max(50, shape.width * scaleX);
      const newHeight = Math.max(50, shape.height * scaleY);

      // Get absolute position
      const absPos = node.absolutePosition();

      node.scaleX(1);
      node.scaleY(1);
      node.x(0);
      node.y(0);

      onTransformEnd(shape.id, newWidth, newHeight, absPos.x, absPos.y);
    }
  };

  return (
    <>
      <Group
        ref={shapeRef}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        draggable
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect(e);
        }}
        onDragEnd={(e) => {
          onDragEnd(shape.id, e.target.x(), e.target.y());
        }}
        onTransformEnd={handleTransformEnd}
      >
        {shape.type === 'circle' ? (
          <Ellipse
            x={shape.width / 2}
            y={shape.height / 2}
            radiusX={shape.width / 2}
            radiusY={shape.height / 2}
            fill={shape.style.fill}
            stroke={isSelected ? '#3b82f6' : shape.style.stroke}
            strokeWidth={isSelected ? 3 : shape.style.strokeWidth}
            opacity={shape.style.opacity}
          />
        ) : (
          <Rect
            width={shape.width}
            height={shape.height}
            fill={shape.style.fill}
            stroke={isSelected ? '#3b82f6' : shape.style.stroke}
            strokeWidth={isSelected ? 3 : shape.style.strokeWidth}
            opacity={shape.style.opacity}
            cornerRadius={shape.cornerRadius || 0}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          keepRatio={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={12}
          anchorCornerRadius={3}
          anchorFill="#06b6d4"
          anchorStroke="#ffffff"
          anchorStrokeWidth={2}
          borderStroke="#06b6d4"
          borderStrokeWidth={2}
          borderDash={[6, 3]}
        />
      )}

      {/* Delete button for selected zone */}
      {isSelected && (
        <Group
          x={shape.x + shape.width - 10}
          y={shape.y - 10}
          onClick={(e) => {
            e.cancelBubble = true;
            onDelete(shape.id);
          }}
        >
          <Circle
            radius={12}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={2}
            shadowColor="black"
            shadowBlur={4}
            shadowOpacity={0.3}
          />
          <Text
            x={-5}
            y={-6}
            text="✕"
            fontSize={12}
            fill="#ffffff"
            fontStyle="bold"
          />
        </Group>
      )}
    </>
  );
}

function TextNode({
  text,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd
}: {
  text: any;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<any>) => void;
  onTransformEnd: (id: string, updates: any) => void;
}) {
  const shapeRef = useRef<Konva.Label>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Label
        ref={shapeRef}
        x={text.x}
        y={text.y}
        rotation={text.rotation || 0}
        draggable
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect(e);
        }}
        onDragEnd={onDragEnd}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            // Reset scale and update font size if scaled? 
            // For now let's just handle rotation and position. 
            // Handling font size scaling requires more math. 
            // Let's just persist rotation and position.

            // Actually, if we want to support resizing text (font size), we should do it here.
            // But user asked for rotation.

            node.scaleX(1);
            node.scaleY(1);

            onTransformEnd(text.id, {
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              // If we wanted to handle scaling:
              // fontSize: text.fontSize * scaleX
            });
          }
        }}
      >
        <Tag
          fill={text.backgroundColor === 'transparent' ? undefined : text.backgroundColor}
          cornerRadius={4}
        />
        <Text
          text={text.text}
          fontSize={text.fontSize}
          fontFamily={text.fontFamily}
          fontStyle={text.fontStyle}
          fill={text.color}
          padding={text.padding || 0}
        />
      </Label>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} // Corner anchors for resize/rotate
        // If we want ONLY rotation, we could hide anchors or use centered rotation handle?
        // Default Transformer allows rotation via handle above top-center or corner rotating.
        />
      )}
    </>
  );
}

// Lane Stripe component for data flow scenarios
function LaneStripe({
  lane,
  isSelected,
  canvasWidth,
  onSelect,
  onDragEnd,
  onHeightChange,
  isPanMode,
}: {
  lane: any;
  isSelected: boolean;
  canvasWidth: number;
  onSelect: (e: Konva.KonvaEventObject<any>) => void;
  onDragEnd: (id: string, y: number) => void;
  onHeightChange: (id: string, height: number) => void;
  isPanMode?: boolean;
}) {
  const groupRef = useRef<Konva.Group>(null);

  if (lane.visible === false) return null;

  return (
    <Group
      ref={groupRef}
      y={lane.y}
      draggable={!isPanMode}
      listening={!isPanMode}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onDragEnd(lane.id, e.target.y())}
      dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
    >
      {/* Lane background - non-interactive for pan mode */}
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={lane.height}
        fill={lane.color || 'rgba(59, 130, 246, 0.15)'}
        stroke={isSelected ? '#3b82f6' : 'transparent'}
        strokeWidth={isSelected ? 2 : 0}
        listening={false}
      />
      {/* Lane title at top-left with background */}
      <Rect
        x={5}
        y={3}
        width={Math.min(lane.title?.length * 8 + 20 || 200, 400)}
        height={20}
        fill="rgba(0, 0, 0, 0.5)"
        cornerRadius={3}
        listening={false}
      />
      <Text
        x={10}
        y={5}
        text={lane.title || 'Unnamed Lane'}
        fontSize={12}
        fontFamily="Arial"
        fontStyle="bold"
        fill={lane.labelColor || '#f97316'}
        listening={false}
      />
      {/* Resize handle at bottom */}
      <Rect
        x={0}
        y={lane.height - 6}
        width={canvasWidth}
        height={6}
        fill="transparent"
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'ns-resize';
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = 'default';
        }}
        draggable
        dragBoundFunc={(pos) => ({ x: 0, y: pos.y })}
        onDragEnd={(e) => {
          const newHeight = Math.max(50, Math.min(300, e.target.y() + 6));
          e.target.y(newHeight - 6);
          onHeightChange(lane.id, newHeight);
        }}
      />
    </Group>
  );
}

export default function CanvasStage() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Port-to-port linking state
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkSource, setLinkSource] = useState<{ deviceId: string; portId: string } | null>(null);

  // Waypoint linking state
  const [pendingWaypoints, setPendingWaypoints] = useState<Array<{ x: number; y: number }>>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Link hover state
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  // Multi-select rubber band state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);

  // Pan mode state (for canvas dragging)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  // Track drag start positions for multi-device move (used in future enhancement)
  const [_dragStartPositions, setDragStartPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<{
    devices: any[];
    links: any[];
  } | null>(null);

  const { theme } = useTheme();
  const {
    topology,
    selection,
    dispatch,
    setSelection,
    editorState,
    setEditorState,
  } = useTopology();

  // Theme-aware colors for canvas
  const canvasColors = theme === 'dark' ? {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    gridStroke: 'rgba(71, 85, 105, 0.3)',
    defaultLabelColor: '#22c55e', // Green in dark mode
  } : {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 50%, #f8fafc 100%)',
    gridStroke: 'rgba(100, 116, 139, 0.25)',
    defaultLabelColor: '#000000', // Black in light mode
  };

  // Helper to handle selection with grouping support
  const handleSelect = (
    id: string,
    type: 'device' | 'text' | 'shape',
    groupId: string | undefined,
    e: Konva.KonvaEventObject<any> | { evt: { ctrlKey: boolean, metaKey: boolean }, cancelBubble?: boolean }
  ) => {
    if ('cancelBubble' in e) e.cancelBubble = true;
    const isMultiSelect = e.evt?.ctrlKey || e.evt?.metaKey;

    // Find all items in the group if applicable
    let targetIds: { deviceIds: string[], textIds: string[], shapeIds: string[] } = {
      deviceIds: [], textIds: [], shapeIds: []
    };

    if (groupId) {
      targetIds.deviceIds = topology.devices.filter(d => d.groupId === groupId).map(d => d.id);
      targetIds.textIds = topology.texts.filter(t => t.groupId === groupId).map(t => t.id);
      targetIds.shapeIds = topology.shapes.filter(s => s.groupId === groupId).map(s => s.id);
    } else {
      if (type === 'device') targetIds.deviceIds = [id];
      if (type === 'text') targetIds.textIds = [id];
      if (type === 'shape') targetIds.shapeIds = [id];
    }

    if (isMultiSelect) {
      // Toggle logic
      const isSelected = (
        (type === 'device' && selection.deviceIds.includes(id)) ||
        (type === 'text' && selection.textIds.includes(id)) ||
        (type === 'shape' && selection.shapeIds.includes(id))
      );

      if (isSelected) {
        // Remove from selection
        setSelection({
          ...selection,
          deviceIds: selection.deviceIds.filter(dId => !targetIds.deviceIds.includes(dId)),
          textIds: selection.textIds.filter(tId => !targetIds.textIds.includes(tId)),
          shapeIds: selection.shapeIds.filter(sId => !targetIds.shapeIds.includes(sId)),
          groupIds: groupId ? selection.groupIds.filter(gId => gId !== groupId) : selection.groupIds
        });
      } else {
        // Add to selection
        setSelection({
          ...selection,
          deviceIds: [...new Set([...selection.deviceIds, ...targetIds.deviceIds])],
          textIds: [...new Set([...selection.textIds, ...targetIds.textIds])],
          shapeIds: [...new Set([...selection.shapeIds, ...targetIds.shapeIds])],
          groupIds: groupId ? [...new Set([...selection.groupIds, groupId])] : selection.groupIds
        });
      }
    } else {
      // Replace selection
      setSelection({
        deviceIds: targetIds.deviceIds,
        linkIds: [],
        groupIds: groupId ? [groupId] : [],
        shapeIds: targetIds.shapeIds,
        textIds: targetIds.textIds,
        laneIds: [],
      });
    }
  };

  // Helper to handle unified dragging
  const moveSelection = (deltaX: number, deltaY: number) => {
    // Move devices
    selection.deviceIds.forEach(id => {
      const item = topology.devices.find(d => d.id === id);
      if (item) {
        dispatch({ type: 'UPDATE_DEVICE', payload: { id: item.id, updates: { x: item.x + deltaX, y: item.y + deltaY } } });
      }
    });
    // Move texts
    selection.textIds.forEach(id => {
      const item = topology.texts.find(t => t.id === id);
      if (item) {
        dispatch({ type: 'UPDATE_TEXT', payload: { id: item.id, updates: { x: item.x + deltaX, y: item.y + deltaY } } });
      }
    });
    // Move shapes
    selection.shapeIds.forEach(id => {
      const item = topology.shapes.find(s => s.id === id);
      if (item) {
        dispatch({ type: 'UPDATE_SHAPE', payload: { id: item.id, updates: { x: item.x + deltaX, y: item.y + deltaY } } });
      }
    });
  };

  // Load images for all assets
  useEffect(() => {
    const allAssets = [...builtInAssets, ...topology.assets];
    allAssets.forEach(asset => {
      if (!images[asset.id] && asset.src) {
        loadImage(asset.src).then(img => {
          setImages(prev => ({ ...prev, [asset.id]: img }));
        }).catch(err => console.error('Failed to load image:', asset.name, err));
      }
    });
  }, [topology.assets]);

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Make stage available for export
  useEffect(() => {
    if (stageRef.current) {
      (window as any).konvaStage = stageRef.current;
    }
  }, []);

  // Handle wheel zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? scale / scaleBy : scale * scaleBy;
    setScale(Math.max(0.1, Math.min(newScale, 5)));
  };

  // Handle mouse down - start rubber band selection or panning if on empty canvas
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Don't start selection if in linking mode - we're adding waypoints instead
    if (linkingMode) return;

    // Only handle if clicking on the stage itself (not on a device)
    if (e.target === e.target.getStage()) {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // If pan mode is active, start panning
      if (topology.canvas.panMode) {
        setIsPanning(true);
        setPanStart({ x: pos.x - position.x, y: pos.y - position.y });
        return;
      }

      // Convert to canvas coordinates
      const x = (pos.x - position.x) / scale;
      const y = (pos.y - position.y) / scale;

      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionRect({ x, y, width: 0, height: 0 });

      // Clear selection if not holding Shift
      if (!e.evt.shiftKey) {
        setSelection({
          deviceIds: [],
          linkIds: [],
          groupIds: [],
          shapeIds: [],
          textIds: [],
          laneIds: [],
        });
      }
    }
  };

  // Handle mouse move - update selection rectangle or pan
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle panning
    if (isPanning && panStart) {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      setPosition({
        x: pos.x - panStart.x,
        y: pos.y - panStart.y,
      });
      return;
    }

    if (!isSelecting || !selectionStart) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = (pos.x - position.x) / scale;
    const y = (pos.y - position.y) / scale;

    setSelectionRect({
      x: Math.min(selectionStart.x, x),
      y: Math.min(selectionStart.y, y),
      width: Math.abs(x - selectionStart.x),
      height: Math.abs(y - selectionStart.y),
    });
  };

  // Handle mouse up - finalize selection
  const handleMouseUp = () => {
    if (isSelecting && selectionRect && selectionRect.width > 5 && selectionRect.height > 5) {
      const rectRight = selectionRect.x + selectionRect.width;
      const rectBottom = selectionRect.y + selectionRect.height;

      // Find all devices within the selection rectangle
      const selectedDevices = topology.devices.filter(device => {
        const deviceRight = device.x + device.width;
        const deviceBottom = device.y + device.height;

        // Check if device overlaps with selection rect
        return (
          device.x < rectRight &&
          deviceRight > selectionRect.x &&
          device.y < rectBottom &&
          deviceBottom > selectionRect.y
        );
      });

      // Find all links that pass through the selection rectangle
      const selectedLinks = topology.links.filter(link => {
        const points = getLinkPoints(link);
        if (!points) return false;

        // Check if line segment intersects with rectangle
        // Simplified: check if either endpoint or midpoint is in rect
        const midX = (points.fromX + points.toX) / 2;
        const midY = (points.fromY + points.toY) / 2;

        const pointInRect = (x: number, y: number) =>
          x >= selectionRect.x && x <= rectRight &&
          y >= selectionRect.y && y <= rectBottom;

        return pointInRect(points.fromX, points.fromY) ||
          pointInRect(points.toX, points.toY) ||
          pointInRect(midX, midY);
      });

      if (selectedDevices.length > 0 || selectedLinks.length > 0) {
        setSelection({
          deviceIds: selectedDevices.map(d => d.id),
          linkIds: selectedLinks.map(l => l.id),
          groupIds: [],
          shapeIds: [],
          textIds: [],
          laneIds: [],
        });

        // Store initial positions for multi-device drag
        const positions: Record<string, { x: number; y: number }> = {};
        selectedDevices.forEach(d => {
          positions[d.id] = { x: d.x, y: d.y };
        });
        setDragStartPositions(positions);
      }
    }

    setIsSelecting(false);
    setSelectionRect(null);
    setSelectionStart(null);
    // Stop panning
    setIsPanning(false);
    setPanStart(null);
  };

  // Handle stage click to deselect (only if not selecting)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle stamp tool - place device on click
    if (editorState.tool === 'stamp' && editorState.stampAsset) {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Convert to canvas coordinates accounting for zoom/pan
      const x = (pos.x - position.x) / scale;
      const y = (pos.y - position.y) / scale;

      const newDevice = {
        id: generateId('dev'),
        assetId: editorState.stampAsset.id,
        type: editorState.stampAsset.category || 'Device',
        label: editorState.stampAsset.name,
        x: x - (editorState.defaultDeviceSize?.width || 100) / 2,
        y: y - (editorState.defaultDeviceSize?.height || 100) / 2,
        width: editorState.defaultDeviceSize?.width || 100,
        height: editorState.defaultDeviceSize?.height || 100,
        rotation: 0,
        ports: [],
        style: { opacity: 1 },
      };
      dispatch({ type: 'ADD_DEVICE', payload: newDevice });
      return; // Don't deselect when stamping
    }

    if (e.target === e.target.getStage() && !isSelecting) {
      // Click without drag - deselect all
      if (!selectionRect || (selectionRect.width < 5 && selectionRect.height < 5)) {
        setSelection({
          deviceIds: [],
          linkIds: [],
          groupIds: [],
          shapeIds: [],
          textIds: [],
          laneIds: [],
        });
      }
      // Don't cancel linking mode here - let waypoint click handler manage it
      // User can press ESC to cancel linking
    }
  };

  // Handle port click for linking
  const handlePortClick = (deviceId: string, portId: string) => {
    if (!linkSource) {
      setLinkSource({ deviceId, portId });
      setLinkingMode(true);
      setPendingWaypoints([]);
    } else {
      if (linkSource.deviceId !== deviceId) {
        const newLink = {
          id: generateId('link'),
          from: { deviceId: linkSource.deviceId, portId: linkSource.portId },
          to: { deviceId, portId },
          pathType: pendingWaypoints.length > 0 ? 'bezier' as const : 'straight' as const,
          controlPoints: pendingWaypoints.length > 0 ? [...pendingWaypoints] : undefined,
          style: {
            color: '#22c55e',
            width: 2,
            dash: [],
          },
        };
        dispatch({ type: 'ADD_LINK', payload: newLink });
      }
      setLinkingMode(false);
      setLinkSource(null);
      setPendingWaypoints([]);
    }
  };

  // Handle canvas click during linking mode to add waypoint
  const handleCanvasClickForWaypoint = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!linkingMode || !linkSource) return;

    // Get click position in canvas coordinates
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const clickX = (pos.x - position.x) / scale;
    const clickY = (pos.y - position.y) / scale;

    // Check if click is near any port on any device
    const portClickRadius = 35; // Generous click radius for ports
    for (const device of topology.devices) {
      const ports = device.ports?.length > 0 ? device.ports : DEFAULT_PORTS;
      for (const port of ports) {
        const portX = device.x + (device.width * port.x);
        const portY = device.y + (device.height * port.y);
        const distance = Math.sqrt((clickX - portX) ** 2 + (clickY - portY) ** 2);

        if (distance < portClickRadius) {
          // Click is near a port - trigger port connection directly!
          e.cancelBubble = true;
          handlePortClick(device.id, port.id);
          return;
        }
      }
    }

    // Not near any port - add waypoint
    setPendingWaypoints(prev => [...prev, { x: clickX, y: clickY }]);
    e.cancelBubble = true;
  };

  // Handle right-click to remove last waypoint
  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    if (linkingMode && pendingWaypoints.length > 0) {
      setPendingWaypoints(prev => prev.slice(0, -1));
    }
  };

  // Track mouse position for preview line
  const handleMouseMoveForPreview = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (linkingMode) {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (pos) {
        setMousePosition({
          x: (pos.x - position.x) / scale,
          y: (pos.y - position.y) / scale,
        });
      }
    }
  };

  // Handle drop from palette
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const jsonData = e.dataTransfer.getData('application/json');
    if (!jsonData) return;

    try {
      const asset = JSON.parse(jsonData);
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const x = (e.clientX - containerRect.left - position.x) / scale;
      const y = (e.clientY - containerRect.top - position.y) / scale;

      const newDevice = {
        id: generateId('dev'),
        assetId: asset.id,
        type: asset.category || 'Device',
        label: asset.name,
        x: Math.max(0, x - (asset.defaultWidth || 80) / 2),
        y: Math.max(0, y - (asset.defaultHeight || 80) / 2),
        width: asset.defaultWidth || 120,
        height: asset.defaultHeight || 120,
        rotation: 0,
        ports: [],
        style: { opacity: 1 },
      };

      dispatch({ type: 'ADD_DEVICE', payload: newDevice });
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A - Select all devices
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelection({
          deviceIds: topology.devices.map(d => d.id),
          linkIds: [],
          groupIds: [],
          shapeIds: [],
          textIds: [],
          laneIds: [],
        });
      }

      // Ctrl+C - Copy selected devices and links
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        const selectedDevices = topology.devices.filter(d => selection.deviceIds.includes(d.id));
        const selectedLinks = topology.links.filter(l => selection.linkIds.includes(l.id));
        
        // Also include links that connect selected devices
        const linkedDeviceIds = new Set(selection.deviceIds);
        const autoIncludedLinks = topology.links.filter(l => 
          linkedDeviceIds.has(l.from.deviceId) && linkedDeviceIds.has(l.to.deviceId)
        );
        
        // Combine selected links and auto-included links (avoid duplicates)
        const allLinks = [...selectedLinks];
        autoIncludedLinks.forEach(link => {
          if (!allLinks.find(l => l.id === link.id)) {
            allLinks.push(link);
          }
        });

        if (selectedDevices.length > 0 || allLinks.length > 0) {
          setClipboard({ devices: selectedDevices, links: allLinks });
        }
      }

      // Ctrl+V - Paste from clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (!clipboard || (clipboard.devices.length === 0 && clipboard.links.length === 0)) return;

        // Create ID mapping for devices (old ID -> new ID)
        const idMap: Record<string, string> = {};
        const pasteOffset = 20;

        // Paste devices with new IDs and offset positions
        const newDevices = clipboard.devices.map(device => {
          const newId = generateId('dev');
          idMap[device.id] = newId;
          return {
            ...device,
            id: newId,
            x: device.x + pasteOffset,
            y: device.y + pasteOffset,
            label: device.label, // Keep same label
          };
        });

        // Paste links with new IDs and remapped device references
        const newLinks = clipboard.links.map(link => {
          // Only paste link if both connected devices were pasted
          const newFromId = idMap[link.from.deviceId];
          const newToId = idMap[link.to.deviceId];
          
          if (!newFromId || !newToId) return null;

          // Clear waypoints and control points - they have absolute coordinates
          // from the original location and won't work in the new paste location.
          // Links will draw directly between the pasted devices.
          return {
            ...link,
            id: generateId('link'),
            from: { ...link.from, deviceId: newFromId },
            to: { ...link.to, deviceId: newToId },
            waypoints: [], // Clear waypoints
            controlPoints: undefined, // Clear control points
            style: { ...link.style, curveOffset: 0 },
          };
        }).filter(Boolean);

        // Add all new devices
        newDevices.forEach(device => {
          dispatch({ type: 'ADD_DEVICE', payload: device });
        });

        // Add all new links
        newLinks.forEach(link => {
          if (link) dispatch({ type: 'ADD_LINK', payload: link });
        });

        // Select the pasted items
        setSelection({
          deviceIds: newDevices.map(d => d.id),
          linkIds: newLinks.filter(Boolean).map(l => l!.id),
          groupIds: [],
          shapeIds: [],
          textIds: [],
          laneIds: [],
        });
      }

      // Delete or Backspace - Remove selected items (but not when typing in input fields)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if user is typing in an input field
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable
        );

        if (isTyping) return; // Skip deletion when typing

        selection.deviceIds.forEach(id => {
          dispatch({ type: 'REMOVE_DEVICE', payload: id });
        });
        selection.linkIds.forEach(id => {
          dispatch({ type: 'REMOVE_LINK', payload: id });
        });
        selection.shapeIds.forEach(id => {
          dispatch({ type: 'REMOVE_SHAPE', payload: id });
        });
        setSelection({
          deviceIds: [],
          linkIds: [],
          groupIds: [],
          shapeIds: [],
          textIds: [],
          laneIds: [],
        });
      }

      // Escape - Cancel linking mode and stamp mode
      if (e.key === 'Escape') {
        setLinkingMode(false);
        setLinkSource(null);
        // Also exit stamp mode
        if (editorState.tool === 'stamp') {
          setEditorState({ tool: 'select', stampAsset: undefined });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, dispatch, setSelection, topology.devices, topology.links, editorState.tool, setEditorState, clipboard]);

  // Get link points
  const getLinkPoints = (link: any) => {
    const fromDevice = topology.devices.find(d => d.id === link.from.deviceId);
    const toDevice = topology.devices.find(d => d.id === link.to.deviceId);

    if (!fromDevice || !toDevice) return null;

    // Get port data
    const fromPort = link.from.portId ?
      (fromDevice.ports.find((p: any) => p.id === link.from.portId) ||
        DEFAULT_PORTS.find(p => p.id === link.from.portId)) : null;

    const toPort = link.to.portId ?
      (toDevice.ports.find((p: any) => p.id === link.to.portId) ||
        DEFAULT_PORTS.find(p => p.id === link.to.portId)) : null;

    // Calculate port positions
    let fromX = fromPort
      ? fromDevice.x + (fromDevice.width * fromPort.x)
      : fromDevice.x + fromDevice.width / 2;
    let fromY = fromPort
      ? fromDevice.y + (fromDevice.height * fromPort.y)
      : fromDevice.y + fromDevice.height / 2;

    let toX = toPort
      ? toDevice.x + (toDevice.width * toPort.x)
      : toDevice.x + toDevice.width / 2;
    let toY = toPort
      ? toDevice.y + (toDevice.height * toPort.y)
      : toDevice.y + toDevice.height / 2;

    // Calculate offset based on port position (exit perpendicular to edge)
    const portOffset = 15;

    if (fromPort) {
      // Determine exit direction based on port position
      if (fromPort.x === 0) fromX -= portOffset; // Left port - exit left
      else if (fromPort.x === 1) fromX += portOffset; // Right port - exit right
      else if (fromPort.y === 0) fromY -= portOffset; // Top port - exit up
      else if (fromPort.y === 1) fromY += portOffset; // Bottom port - exit down
    }

    if (toPort) {
      // Determine entry direction based on port position  
      if (toPort.x === 0) toX -= portOffset; // Left port - enter from left
      else if (toPort.x === 1) toX += portOffset; // Right port - enter from right
      else if (toPort.y === 0) toY -= portOffset; // Top port - enter from top
      else if (toPort.y === 1) toY += portOffset; // Bottom port - enter from bottom
    }

    // If no ports specified, calculate edge intersection (center-to-center line)
    if (!fromPort && !toPort) {
      const dx = toX - fromX;
      const dy = toY - fromY;

      // Find where line exits fromDevice
      let t = Infinity;
      if (dx > 0) t = Math.min(t, (fromDevice.x + fromDevice.width - fromX) / dx);
      else if (dx < 0) t = Math.min(t, (fromDevice.x - fromX) / dx);
      if (dy > 0) t = Math.min(t, (fromDevice.y + fromDevice.height - fromY) / dy);
      else if (dy < 0) t = Math.min(t, (fromDevice.y - fromY) / dy);
      if (t !== Infinity && t > 0) {
        fromX = fromX + dx * t;
        fromY = fromY + dy * t;
      }

      // Find where line enters toDevice (from opposite direction)
      t = Infinity;
      const toCenterX = toDevice.x + toDevice.width / 2;
      const toCenterY = toDevice.y + toDevice.height / 2;
      if (dx < 0) t = Math.min(t, (toDevice.x + toDevice.width - toCenterX) / (-dx));
      else if (dx > 0) t = Math.min(t, (toDevice.x - toCenterX) / (-dx));
      if (dy < 0) t = Math.min(t, (toDevice.y + toDevice.height - toCenterY) / (-dy));
      else if (dy > 0) t = Math.min(t, (toDevice.y - toCenterY) / (-dy));
      if (t !== Infinity && t > 0) {
        toX = toCenterX + (-dx) * t;
        toY = toCenterY + (-dy) * t;
      }
    }

    // Apply curveOffset for parallel links (perpendicular to line direction)
    const curveOffset = link.style?.curveOffset || 0;
    if (curveOffset !== 0) {
      // First, calculate where the CENTER line (no offset) would exit each device
      const fromCenterX = fromDevice.x + fromDevice.width / 2;
      const fromCenterY = fromDevice.y + fromDevice.height / 2;
      const toCenterX = toDevice.x + toDevice.width / 2;
      const toCenterY = toDevice.y + toDevice.height / 2;

      // Direction from center to center
      const dx = toCenterX - fromCenterX;
      const dy = toCenterY - fromCenterY;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > 0) {
        // Perpendicular unit vector
        const perpX = -dy / length;
        const perpY = dx / length;

        // Helper: find where a ray from center exits the rect
        const findEdgeExit = (cx: number, cy: number, dirX: number, dirY: number,
          rectX: number, rectY: number, rectW: number, rectH: number) => {
          let tMin = Infinity;
          // Check all 4 edges
          if (dirX > 0) { // Right edge
            const t = (rectX + rectW - cx) / dirX;
            if (t > 0 && t < tMin) tMin = t;
          } else if (dirX < 0) { // Left edge
            const t = (rectX - cx) / dirX;
            if (t > 0 && t < tMin) tMin = t;
          }
          if (dirY > 0) { // Bottom edge
            const t = (rectY + rectH - cy) / dirY;
            if (t > 0 && t < tMin) tMin = t;
          } else if (dirY < 0) { // Top edge
            const t = (rectY - cy) / dirY;
            if (t > 0 && t < tMin) tMin = t;
          }
          if (tMin === Infinity) return { x: cx, y: cy };
          return { x: cx + dirX * tMin, y: cy + dirY * tMin };
        };

        // Find edge exit points for the CENTER line
        const fromCenterEdge = findEdgeExit(
          fromCenterX, fromCenterY, dx, dy,
          fromDevice.x, fromDevice.y, fromDevice.width, fromDevice.height
        );
        const toCenterEdge = findEdgeExit(
          toCenterX, toCenterY, -dx, -dy,
          toDevice.x, toDevice.y, toDevice.width, toDevice.height
        );

        // Now apply perpendicular offset to the edge points
        fromX = fromCenterEdge.x + perpX * curveOffset;
        fromY = fromCenterEdge.y + perpY * curveOffset;
        toX = toCenterEdge.x + perpX * curveOffset;
        toY = toCenterEdge.y + perpY * curveOffset;
      }
    }

    return { fromX, fromY, toX, toY };
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{
        background: canvasColors.background,
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Linking mode indicator */}
      {linkingMode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
        }}>
          🔗 Click canvas to add waypoint • Click port to connect • ESC cancel • Right-click undo
        </div>
      )}

      {/* Empty state */}
      {topology.devices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 rounded-2xl bg-slate-800/50 border-2 border-dashed border-slate-600">
            <p className="text-slate-400 text-lg font-medium">Drag devices here</p>
            <p className="text-slate-500 text-sm mt-1">or click icons in the palette</p>
          </div>
        </div>
      )}

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onClick={(e) => {
          handleCanvasClickForWaypoint(e);
          handleStageClick(e);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleMouseMoveForPreview(e);
        }}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <Layer>
          {/* Grid */}
          {topology.canvas.showGrid && Array.from({ length: 100 }).map((_, i) => (
            <Line
              key={`grid-v-${i}`}
              points={[i * 50, 0, i * 50, 5000]}
              stroke={canvasColors.gridStroke}
              strokeWidth={1}
            />
          ))}
          {topology.canvas.showGrid && Array.from({ length: 100 }).map((_, i) => (
            <Line
              key={`grid-h-${i}`}
              points={[0, i * 50, 5000, i * 50]}
              stroke={canvasColors.gridStroke}
              strokeWidth={1}
            />
          ))}

          {/* Data Flow Lanes - rendered behind everything except grid */}
          {(topology.lanes || []).map(lane => (
            <LaneStripe
              key={lane.id}
              lane={lane}
              isSelected={(selection.laneIds || []).includes(lane.id)}
              canvasWidth={topology.canvas.width}
              isPanMode={topology.canvas.panMode}
              onSelect={(e) => {
                e.cancelBubble = true;
                if (e.evt.ctrlKey || e.evt.metaKey) {
                  const isCurrentlySelected = (selection.laneIds || []).includes(lane.id);
                  setSelection({
                    ...selection,
                    laneIds: isCurrentlySelected
                      ? (selection.laneIds || []).filter(id => id !== lane.id)
                      : [...(selection.laneIds || []), lane.id]
                  });
                } else {
                  setSelection({
                    deviceIds: [],
                    linkIds: [],
                    groupIds: [],
                    shapeIds: [],
                    textIds: [],
                    laneIds: [lane.id],
                  });
                }
              }}
              onDragEnd={(id, y) => {
                dispatch({ type: 'UPDATE_LANE', payload: { id, updates: { y } } });
              }}
              onHeightChange={(id, height) => {
                dispatch({ type: 'UPDATE_LANE', payload: { id, updates: { height } } });
              }}
            />
          ))}

          {/* Zone Shapes - rendered behind devices */}
          {topology.shapes.map(shape => {
            const isShapeSelected = selection.shapeIds.includes(shape.id);

            return (
              <ZoneShape
                key={shape.id}
                shape={shape}
                isSelected={isShapeSelected}
                onSelect={(e) => handleSelect(shape.id, 'shape', shape.groupId, e)}
                onTransformEnd={(id, width, height, x, y) => {
                  dispatch({
                    type: 'UPDATE_SHAPE',
                    payload: { id, updates: { width, height, x, y } },
                  });
                }}
                onDragEnd={(id, newX, newY) => {
                  const deltaX = newX - shape.x;
                  const deltaY = newY - shape.y;

                  if (selection.shapeIds.includes(id)) {
                    moveSelection(deltaX, deltaY);
                  } else {
                    dispatch({ type: 'UPDATE_SHAPE', payload: { id, updates: { x: newX, y: newY } } });
                  }
                }}
                onDelete={(id) => {
                  dispatch({ type: 'REMOVE_SHAPE', payload: id });
                  setSelection({
                    deviceIds: [],
                    linkIds: [],
                    groupIds: [],
                    shapeIds: [],
                    textIds: [],
                    laneIds: [],
                  });
                }}
              />
            );
          })}

          {/* Devices */}
          {topology.devices.map(device => (
            <DeviceNode
              key={device.id}
              device={device}
              isSelected={selection.deviceIds.includes(device.id)}
              image={images[device.assetId] || null}
              onSelect={(e) => handleSelect(device.id, 'device', device.groupId, e)}
              onTransformEnd={(id, width, height, x, y) => {
                dispatch({
                  type: 'UPDATE_DEVICE',
                  payload: { id, updates: { width, height, x, y } },
                });
              }}
              onDragMove={(_id, _newX, _newY) => {
                // No-op during drag - we'll update all at once on drag end
                // Real-time sync causes cumulative delta issues
              }}
              onDragEnd={(id, newX, newY) => {
                const deltaX = newX - device.x;
                const deltaY = newY - device.y;

                // Move all selected devices together by the same delta
                if (selection.deviceIds.length > 1 && selection.deviceIds.includes(id)) {
                  selection.deviceIds.forEach(deviceId => {
                    const dev = topology.devices.find(d => d.id === deviceId);
                    if (dev) {
                      dispatch({
                        type: 'UPDATE_DEVICE',
                        payload: {
                          id: deviceId,
                          updates: {
                            x: deviceId === id ? newX : dev.x + deltaX,
                            y: deviceId === id ? newY : dev.y + deltaY,
                          }
                        },
                      });
                    }
                  });
                } else {
                  dispatch({ type: 'UPDATE_DEVICE', payload: { id, updates: { x: newX, y: newY } } });
                }
              }}
              onPortClick={handlePortClick}
              onPortMove={(deviceId, portId, x, y) => {
                const device = topology.devices.find(d => d.id === deviceId);
                if (device) {
                  const updatedPorts = device.ports.map((p: any) =>
                    p.id === portId ? { ...p, x, y } : p
                  );
                  dispatch({
                    type: 'UPDATE_DEVICE',
                    payload: { id: deviceId, updates: { ports: updatedPorts } },
                  });
                }
              }}
              onLabelMove={(deviceId, offsetX, offsetY) => {
                const device = topology.devices.find(d => d.id === deviceId);
                if (device) {
                  dispatch({
                    type: 'UPDATE_DEVICE',
                    payload: {
                      id: deviceId,
                      updates: {
                        style: {
                          ...device.style,
                          labelOffsetX: offsetX,
                          labelOffsetY: offsetY
                        }
                      }
                    },
                  });
                }
              }}
              linkingMode={linkingMode}
              defaultLabelColor={canvasColors.defaultLabelColor}
            />
          ))}

          {/* Links */}
          {(() => {
            // Group links by device pair to calculate dynamic offsets
            const linkGroups: Record<string, typeof topology.links> = {};
            topology.links.forEach(link => {
              // Create a consistent key for the device pair (order doesn't matter)
              const ids = [link.from.deviceId, link.to.deviceId].sort();
              const key = `${ids[0]}-${ids[1]}`;
              if (!linkGroups[key]) linkGroups[key] = [];
              linkGroups[key].push(link);
            });

            // Calculate dynamic offset for each link
            const linkOffsets: Record<string, number> = {};
            Object.values(linkGroups).forEach(group => {
              const count = group.length;
              group.forEach((link, index) => {
                // Calculate offset: center the group around 0
                // For 5 links: -50, -25, 0, 25, 50
                const offset = count > 1
                  ? (index - (count - 1) / 2) * 25
                  : 0;
                linkOffsets[link.id] = offset;
              });
            });

            return topology.links.map(link => {
              // Use dynamic offset instead of stored curveOffset
              const dynamicOffset = linkOffsets[link.id] || 0;
              const linkWithDynamicOffset = {
                ...link,
                style: { ...link.style, curveOffset: dynamicOffset }
              };

              const points = getLinkPoints(linkWithDynamicOffset);
              if (!points) return null;

              const isLinkSelected = selection.linkIds.includes(link.id);

              // Build full path with waypoints
              const waypoints = link.controlPoints || [];
              const allPoints: number[] = [points.fromX, points.fromY];
              waypoints.forEach(wp => {
                allPoints.push(wp.x, wp.y);
              });
              allPoints.push(points.toX, points.toY);

              return (
                <Group
                  key={link.id}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    // Support Ctrl+click for multi-select
                    if (e.evt.ctrlKey || e.evt.metaKey) {
                      // Add to or remove from current selection
                      const isCurrentlySelected = selection.linkIds.includes(link.id);
                      setSelection({
                        ...selection,
                        linkIds: isCurrentlySelected
                          ? selection.linkIds.filter(id => id !== link.id) // Toggle off if already selected
                          : [...selection.linkIds, link.id] // Add to selection
                      });
                    } else {
                      // Replace selection
                      setSelection({
                        deviceIds: [],
                        linkIds: [link.id],
                        groupIds: [],
                        shapeIds: [],
                        textIds: [],
                        laneIds: [],
                      });
                    }
                  }}
                  onMouseEnter={(e) => {
                    setHoveredLinkId(link.id);
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    setHoveredLinkId(null);
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                  }}
                >
                  <Arrow
                    points={allPoints}
                    stroke={isLinkSelected ? '#3b82f6' : link.style.color}
                    strokeWidth={hoveredLinkId === link.id ? 5 : (isLinkSelected ? 4 : link.style.width)}
                    fill={isLinkSelected ? '#3b82f6' : link.style.color}
                    pointerLength={hoveredLinkId === link.id ? 14 : 10}
                    pointerWidth={hoveredLinkId === link.id ? 14 : 10}
                    pointerAtBeginning={link.style.arrowType === 'both'}
                    pointerAtEnding={link.style.arrowType !== 'none'}
                    shadowColor={link.style.color}
                    shadowBlur={hoveredLinkId === link.id ? 15 : 8}
                    shadowOpacity={hoveredLinkId === link.id ? 0.8 : 0.5}
                    hitStrokeWidth={15}
                  />
                  {/* Waypoint indicators for selected links */}
                  {isLinkSelected && waypoints.map((wp, i) => (
                    <Circle
                      key={i}
                      x={wp.x}
                      y={wp.y}
                      radius={6}
                      fill="#3b82f6"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                  {link.label && (
                    <Text
                      x={(points.fromX + points.toX) / 2 - 30}
                      y={(points.fromY + points.toY) / 2 - 10}
                      text={link.label}
                      fontSize={10}
                      fill="#ffffff"
                      padding={4}
                    />
                  )}
                </Group>
              );
            });
          })()}

          {/* Preview line during linking */}
          {linkingMode && linkSource && mousePosition && (() => {
            const sourceDevice = topology.devices.find(d => d.id === linkSource.deviceId);
            if (!sourceDevice) return null;

            const sourcePort = sourceDevice.ports.find((p: any) => p.id === linkSource.portId)
              || DEFAULT_PORTS.find(p => p.id === linkSource.portId);
            if (!sourcePort) return null;

            const startX = sourceDevice.x + (sourceDevice.width * sourcePort.x);
            const startY = sourceDevice.y + (sourceDevice.height * sourcePort.y);

            const previewPoints: number[] = [startX, startY];
            pendingWaypoints.forEach(wp => {
              previewPoints.push(wp.x, wp.y);
            });
            previewPoints.push(mousePosition.x, mousePosition.y);

            // Calculate angle from last point to mouse
            const lastX = pendingWaypoints.length > 0
              ? pendingWaypoints[pendingWaypoints.length - 1].x
              : startX;
            const lastY = pendingWaypoints.length > 0
              ? pendingWaypoints[pendingWaypoints.length - 1].y
              : startY;

            const dx = mousePosition.x - lastX;
            const dy = mousePosition.y - lastY;
            const angleRad = Math.atan2(dy, dx);
            let angleDeg = Math.round(angleRad * (180 / Math.PI));
            // Normalize to 0-360
            if (angleDeg < 0) angleDeg += 360;

            // Determine if angle is close to cardinal direction (±5°)
            const isCardinal = [0, 90, 180, 270, 360].some(
              card => Math.abs(angleDeg - card) <= 5 || Math.abs((angleDeg + 360) % 360 - card) <= 5
            );
            const is45 = [45, 135, 225, 315].some(
              diag => Math.abs(angleDeg - diag) <= 5
            );

            return (
              <Group>
                <Line
                  points={previewPoints}
                  stroke="#22c55e"
                  strokeWidth={2}
                  dash={[8, 4]}
                  opacity={0.8}
                />
                {/* Pending waypoint circles */}
                {pendingWaypoints.map((wp, i) => (
                  <Circle
                    key={i}
                    x={wp.x}
                    y={wp.y}
                    radius={8}
                    fill="#22c55e"
                    stroke="#fff"
                    strokeWidth={2}
                    opacity={0.9}
                  />
                ))}
                {/* Angle indicator */}
                <Group x={mousePosition.x + 20} y={mousePosition.y - 30}>
                  <Rect
                    x={-5}
                    y={-5}
                    width={55}
                    height={24}
                    fill={isCardinal ? 'rgba(34, 197, 94, 0.95)' : is45 ? 'rgba(59, 130, 246, 0.95)' : 'rgba(30, 41, 59, 0.95)'}
                    cornerRadius={6}
                    stroke={isCardinal ? '#22c55e' : is45 ? '#3b82f6' : '#64748b'}
                    strokeWidth={1}
                  />
                  <Text
                    x={0}
                    y={0}
                    text={`${angleDeg}°`}
                    fontSize={14}
                    fontFamily="monospace"
                    fontStyle="bold"
                    fill="#ffffff"
                  />
                </Group>
              </Group>
            );
          })()}

          {/* Text annotations */}
          {/* Text annotations */}
          {topology.texts.map(text => (
            <TextNode
              key={text.id}
              text={text}
              isSelected={selection.textIds.includes(text.id)}
              onSelect={(e) => handleSelect(text.id, 'text', text.groupId, e)}
              onTransformEnd={(id, updates) => {
                dispatch({ type: 'UPDATE_TEXT', payload: { id, updates } });
              }}
              onDragEnd={(e) => {
                const newX = e.target.x();
                const newY = e.target.y();
                const deltaX = newX - text.x;
                const deltaY = newY - text.y;

                if (selection.textIds.includes(text.id)) {
                  moveSelection(deltaX, deltaY);
                } else {
                  dispatch({ type: 'UPDATE_TEXT', payload: { id: text.id, updates: { x: newX, y: newY } } });
                }
              }}
            />
          ))}

          {/* Selection rectangle for multi-select */}
          {selectionRect && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth={2}
              dash={[6, 3]}
            />
          )}
        </Layer>
      </Stage>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <button
          onClick={() => setScale(Math.max(0.1, scale - 0.1))}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#475569',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          −
        </button>
        <span style={{ color: 'white', fontSize: '12px', width: '48px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.min(5, scale + 0.1))}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#475569',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          +
        </button>
        <button
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
          style={{
            padding: '0 12px',
            height: '32px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#94a3b8'
      }}>
        💡 Click device to select • Drag corners to resize • Click port to link
      </div>
    </div>
  );
}
