import { useRef, useEffect, useState, type DragEvent } from 'react';
import { Stage, Layer, Rect, Line, Arrow, Text, Circle, Group, Image, Transformer } from 'react-konva';
import Konva from 'konva';
import { useTopology } from '../../context/TopologyContext';
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
  onDragEnd,
  onPortClick,
  onPortMove,
  linkingMode,
}: {
  device: any;
  isSelected: boolean;
  image: HTMLImageElement | null;
  onSelect: () => void;
  onTransformEnd: (id: string, width: number, height: number, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onPortClick: (deviceId: string, portId: string) => void;
  onPortMove: (deviceId: string, portId: string, x: number, y: number) => void;
  linkingMode: boolean;
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
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onDragEnd={(e) => {
          onDragEnd(device.id, e.target.x(), e.target.y());
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Get the new dimensions
            const newWidth = Math.max(60, device.width * scaleX);
            const newHeight = Math.max(60, device.height * scaleY);

            // Reset node scale and position immediately
            node.scaleX(1);
            node.scaleY(1);
            node.x(0);
            node.y(0);

            // Update dimensions only - keep position at device.x, device.y
            // Resize always anchors to top-left corner
            onTransformEnd(device.id, newWidth, newHeight, device.x, device.y);
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

        {/* Device label */}
        <Text
          x={0}
          y={device.height - 18}
          width={device.width}
          text={device.label}
          fontSize={12}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#ffffff"
          align="center"
          shadowColor="black"
          shadowBlur={4}
        />

        {/* Ports with hover labels - draggable to reposition */}
        {showPorts && displayPorts.map((port: any, index: number) => {
          const portX = device.width * port.x;
          const portY = device.height * port.y;
          const isDefaultPort = port.id.startsWith('port-');
          const isPortHovered = hoveredPortId === port.id;

          return (
            <Group key={port.id}>
              {/* Port circle - draggable if device is selected and not a default port */}
              <Circle
                x={portX}
                y={portY}
                radius={isPortHovered ? 12 : (linkingMode ? 12 : 8)}
                fill={linkingMode ? '#22c55e' : (isPortHovered ? '#60a5fa' : '#3b82f6')}
                stroke="#ffffff"
                strokeWidth={2}
                shadowColor={linkingMode ? '#22c55e' : '#3b82f6'}
                shadowBlur={isPortHovered ? 12 : 8}
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
    </>
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

  // Track drag start positions for multi-device move (used in future enhancement)
  const [_dragStartPositions, setDragStartPositions] = useState<Record<string, { x: number; y: number }>>({});

  const {
    topology,
    selection,
    setSelection,
    dispatch,
  } = useTopology();

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

  // Handle mouse down - start rubber band selection if on empty canvas
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Don't start selection if in linking mode - we're adding waypoints instead
    if (linkingMode) return;

    // Only start selection if clicking on the stage itself (not on a device)
    if (e.target === e.target.getStage()) {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

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
        });
      }
    }
  };

  // Handle mouse move - update selection rectangle
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
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
      // Find all devices within the selection rectangle
      const selectedDevices = topology.devices.filter(device => {
        const deviceRight = device.x + device.width;
        const deviceBottom = device.y + device.height;
        const rectRight = selectionRect.x + selectionRect.width;
        const rectBottom = selectionRect.y + selectionRect.height;

        // Check if device overlaps with selection rect
        return (
          device.x < rectRight &&
          deviceRight > selectionRect.x &&
          device.y < rectBottom &&
          deviceBottom > selectionRect.y
        );
      });

      if (selectedDevices.length > 0) {
        setSelection({
          deviceIds: selectedDevices.map(d => d.id),
          linkIds: [],
          groupIds: [],
          shapeIds: [],
          textIds: [],
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
  };

  // Handle stage click to deselect (only if not selecting)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() && !isSelecting) {
      // Click without drag - deselect all
      if (!selectionRect || (selectionRect.width < 5 && selectionRect.height < 5)) {
        setSelection({
          deviceIds: [],
          linkIds: [],
          groupIds: [],
          shapeIds: [],
          textIds: [],
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

    // Get the clicked target's name or check if it's part of a device
    const target = e.target;
    const targetName = target.name?.() || '';
    const parent = target.getParent();
    const parentName = parent?.name?.() || '';

    // Skip if clicking on a port circle (they have specific handling)
    // Ports are Circle elements within device Groups
    if (target.getClassName() === 'Circle' && parent?.getClassName() === 'Group') {
      return; // Let port click handler manage this
    }

    // Skip if clicking on a device (Group with device image)
    if (target.getClassName() === 'Group' ||
      parentName.includes('device') ||
      targetName.includes('device')) {
      return;
    }

    // For all other clicks (stage, grid lines, preview line, etc.) - add waypoint
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = (pos.x - position.x) / scale;
    const y = (pos.y - position.y) / scale;

    setPendingWaypoints(prev => [...prev, { x, y }]);
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
        });
      }

      // Delete or Backspace - Remove selected items
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selection.deviceIds.forEach(id => {
          dispatch({ type: 'REMOVE_DEVICE', payload: id });
        });
        selection.linkIds.forEach(id => {
          dispatch({ type: 'REMOVE_LINK', payload: id });
        });
        setSelection({
          deviceIds: [],
          linkIds: [],
          groupIds: [],
          shapeIds: [],
          textIds: [],
        });
      }

      // Escape - Cancel linking mode
      if (e.key === 'Escape') {
        setLinkingMode(false);
        setLinkSource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, dispatch, setSelection, topology.devices]);

  // Get link points
  const getLinkPoints = (link: any) => {
    const fromDevice = topology.devices.find(d => d.id === link.from.deviceId);
    const toDevice = topology.devices.find(d => d.id === link.to.deviceId);

    if (!fromDevice || !toDevice) return null;

    let fromX, fromY, toX, toY;

    // Calculate Source Point
    if (link.from.portId) {
      // Try to find the port in device ports or default ports
      const port = fromDevice.ports.find((p: any) => p.id === link.from.portId)
        || DEFAULT_PORTS.find(p => p.id === link.from.portId);

      if (port) {
        fromX = fromDevice.x + (fromDevice.width * port.x);
        fromY = fromDevice.y + (fromDevice.height * port.y);
      } else {
        // Fallback to center if port not found
        fromX = fromDevice.x + fromDevice.width / 2;
        fromY = fromDevice.y + fromDevice.height / 2;
      }
    } else {
      // Default to center if no port specified
      fromX = fromDevice.x + fromDevice.width / 2;
      fromY = fromDevice.y + fromDevice.height / 2;
    }

    // Calculate Target Point
    if (link.to.portId) {
      const port = toDevice.ports.find((p: any) => p.id === link.to.portId)
        || DEFAULT_PORTS.find(p => p.id === link.to.portId);

      if (port) {
        toX = toDevice.x + (toDevice.width * port.x);
        toY = toDevice.y + (toDevice.height * port.y);
      } else {
        toX = toDevice.x + toDevice.width / 2;
        toY = toDevice.y + toDevice.height / 2;
      }
    } else {
      toX = toDevice.x + toDevice.width / 2;
      toY = toDevice.y + toDevice.height / 2;
    }

    // Calculate distance and angle for shortening
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Shorten by port radius (approx 10-12px) plus a defined margin
    const padding = 12;

    if (distance > padding * 2) {
      const angle = Math.atan2(dy, dx);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      fromX = fromX + cos * padding;
      fromY = fromY + sin * padding;
      toX = toX - cos * padding;
      toY = toY - sin * padding;
    }

    return { fromX, fromY, toX, toY };
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
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
              stroke="rgba(71, 85, 105, 0.3)"
              strokeWidth={1}
            />
          ))}
          {topology.canvas.showGrid && Array.from({ length: 100 }).map((_, i) => (
            <Line
              key={`grid-h-${i}`}
              points={[0, i * 50, 5000, i * 50]}
              stroke="rgba(71, 85, 105, 0.3)"
              strokeWidth={1}
            />
          ))}

          {/* Devices */}
          {topology.devices.map(device => (
            <DeviceNode
              key={device.id}
              device={device}
              isSelected={selection.deviceIds.includes(device.id)}
              image={images[device.assetId] || null}
              onSelect={() => {
                setSelection({
                  deviceIds: [device.id],
                  linkIds: [],
                  groupIds: [],
                  shapeIds: [],
                  textIds: [],
                });
              }}
              onTransformEnd={(id, width, height, x, y) => {
                dispatch({
                  type: 'UPDATE_DEVICE',
                  payload: { id, updates: { width, height, x, y } },
                });
              }}
              onDragEnd={(id, x, y) => {
                dispatch({
                  type: 'UPDATE_DEVICE',
                  payload: { id, updates: { x, y } },
                });
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
              linkingMode={linkingMode}
            />
          ))}

          {/* Links */}
          {topology.links.map(link => {
            const points = getLinkPoints(link);
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
                  setSelection({
                    deviceIds: [],
                    linkIds: [link.id],
                    groupIds: [],
                    shapeIds: [],
                    textIds: [],
                  });
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
          })}

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
              </Group>
            );
          })()}

          {/* Text annotations */}
          {topology.texts.map(text => (
            <Text
              key={text.id}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.fontSize}
              fontFamily={text.fontFamily}
              fill={text.color}
              draggable
              onClick={(e) => {
                e.cancelBubble = true;
                setSelection({
                  deviceIds: [],
                  linkIds: [],
                  groupIds: [],
                  shapeIds: [],
                  textIds: [text.id],
                });
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
