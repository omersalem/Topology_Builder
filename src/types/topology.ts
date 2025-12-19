// Core data models for the Network Topology Builder

export interface Asset {
  id: string;
  name: string;
  type: 'svg' | 'png' | 'builtin';
  src: string; // base64 data URL or file path
  category?: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface Port {
  id: string;
  name: string;
  x: number; // relative position 0-1
  y: number; // relative position 0-1
  orientation: 'left' | 'right' | 'top' | 'bottom';
}

export interface Device {
  id: string;
  groupId?: string; // Logical group ID
  assetId: string;
  type: string; // switch, router, firewall, server, etc.
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  ports: Port[];
  style: {
    opacity: number;
    labelColor?: string; // Label text color
    labelSize?: number; // Label font size in pixels
    labelOffsetX?: number; // Label X offset from default position
    labelOffsetY?: number; // Label Y offset from default position
  };
  zIndex?: number;
}

export interface LinkEndpoint {
  deviceId: string;
  portId?: string; // optional - if not specified, connects to device edge
}

export interface Link {
  id: string;
  from: LinkEndpoint;
  to: LinkEndpoint;
  pathType: 'straight' | 'orthogonal' | 'bezier';
  label?: string;
  style: {
    color: string;
    width: number;
    dash: number[]; // e.g., [5, 5] for dashed
    curveOffset?: number; // offset for parallel links
    arrowType?: 'none' | 'end' | 'both'; // arrow head style
  };
  controlPoints?: { x: number; y: number }[]; // for manual bezier editing
}

export interface Group {
  id: string;
  groupId?: string; // Nested groups if needed
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: {
    fill: string;
    stroke: string;
    opacity: number;
  };
  zIndex?: number;
}

export interface TextAnnotation {
  id: string;
  groupId?: string; // Logical group ID
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  width?: number;
  align: 'left' | 'center' | 'right';
  fontStyle?: string; // 'normal', 'bold', 'italic', etc.
  backgroundColor?: string;
  padding?: number;
}

export interface Shape {
  id: string;
  groupId?: string; // Logical group ID
  type: 'rectangle' | 'circle' | 'roundedRect' | 'polygon' | 'path';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  };
  points?: number[]; // for polygon and path
  radius?: number; // for circle
  cornerRadius?: number; // for rounded rect
}

export interface CanvasConfig {
  width: number;
  height: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  backgroundColor: string;
  panMode?: boolean; // Enable canvas panning mode
}

export interface TopologyMeta {
  title: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface Topology {
  meta: TopologyMeta;
  canvas: CanvasConfig;
  assets: Asset[];
  devices: Device[];
  links: Link[];
  groups: Group[];
  shapes: Shape[];
  texts: TextAnnotation[];
}

// Selection and UI state
export interface Selection {
  deviceIds: string[];
  linkIds: string[];
  groupIds: string[];
  shapeIds: string[];
  textIds: string[];
}

export type SelectedItemType = 'device' | 'link' | 'group' | 'shape' | 'text' | null;

export interface EditorState {
  tool: 'select' | 'pan' | 'link' | 'text' | 'rectangle' | 'circle' | 'polygon' | 'stamp';
  isDrawing: boolean;
  isPanning: boolean;
  linkInProgress?: {
    fromDevice: string;
    fromPort?: string;
  };
  defaultDeviceSize: {
    width: number;
    height: number;
  };
  stampAsset?: {
    id: string;
    name: string;
    category: string;
    src: string;
  };
}

// Command pattern for undo/redo
export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export interface HistoryState {
  past: Command[];
  future: Command[];
}

// Context action types
export type TopologyAction =
  | { type: 'SET_TOPOLOGY'; payload: Topology }
  | { type: 'ADD_ASSET'; payload: Asset }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'ADD_DEVICE'; payload: Device }
  | { type: 'UPDATE_DEVICE'; payload: { id: string; updates: Partial<Device> } }
  | { type: 'REMOVE_DEVICE'; payload: string }
  | { type: 'ADD_LINK'; payload: Link }
  | { type: 'UPDATE_LINK'; payload: { id: string; updates: Partial<Link> } }
  | { type: 'REMOVE_LINK'; payload: string }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: { id: string; updates: Partial<Group> } }
  | { type: 'REMOVE_GROUP'; payload: string }
  | { type: 'ADD_SHAPE'; payload: Shape }
  | { type: 'UPDATE_SHAPE'; payload: { id: string; updates: Partial<Shape> } }
  | { type: 'REMOVE_SHAPE'; payload: string }
  | { type: 'ADD_TEXT'; payload: TextAnnotation }
  | { type: 'UPDATE_TEXT'; payload: { id: string; updates: Partial<TextAnnotation> } }
  | { type: 'REMOVE_TEXT'; payload: string }
  | { type: 'SET_SELECTION'; payload: Selection }
  | { type: 'UPDATE_CANVAS'; payload: Partial<CanvasConfig> }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// Viewport state for pan/zoom
export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}
