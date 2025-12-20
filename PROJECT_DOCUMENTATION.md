# Network Topology Builder - Project Documentation

## Overview

**Network Topology Builder** is a web-based visual diagram editor for creating professional network topology diagrams. It allows users to drag-and-drop network devices, create connections between them, organize devices into lanes for data flow visualization, and export diagrams in various formats.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite
- **Canvas:** react-konva (Konva.js wrapper for React)
- **Styling:** TailwindCSS + CSS Variables for theming
- **State Management:** React Context + useReducer pattern
- **Persistence:** localStorage autosave

---

## Project Structure

```
src/
├── assets/
│   ├── builtInAssets.ts      # Device icon definitions and categories
│   └── icons/devices/        # PNG device icons (Cisco, Fujitsu, etc.)
├── components/
│   ├── Canvas/
│   │   ├── Stage.tsx         # Main canvas with Konva Stage, all rendering
│   │   ├── DeviceNode.tsx    # Individual device component (unused, inline in Stage)
│   │   ├── LinkConnector.tsx # Link rendering (unused, inline in Stage)
│   │   └── GroupNode.tsx     # Group/zone component
│   ├── Inspector/
│   │   └── PropertyInspector.tsx  # Right panel for editing selected items
│   ├── Palette/
│   │   ├── DevicePalette.tsx # Left panel with device icons
│   │   └── AssetItem.tsx     # Individual device in palette
│   ├── Toolbar/
│   │   ├── TopToolbar.tsx    # Main toolbar with all actions
│   │   └── LinkCreator.tsx   # Link creation modal
│   └── Modals/
│       └── Modal.tsx         # Reusable modal component
├── context/
│   ├── TopologyContext.tsx   # Main state management (topology, selection, dispatch)
│   └── ThemeContext.tsx      # Dark/light theme management
├── types/
│   └── topology.ts           # TypeScript interfaces for all data structures
├── utils/
│   ├── geometry.ts           # Math utilities, ID generation
│   ├── routing.ts            # Link path calculation (orthogonal, bezier)
│   ├── exporters.ts          # Export to JSON, SVG, PNG
│   ├── importers.ts          # Import from JSON
│   └── imageProcessing.ts    # Image utilities
├── constants/
│   └── ports.ts              # Default port positions for devices
├── App.tsx                   # Main layout (Toolbar + Palette + Canvas + Inspector)
└── main.tsx                  # React entry point
```

---

## Core Data Structures

### Topology (Main State)
```typescript
interface Topology {
  meta: TopologyMeta;           // Title, dates, version
  canvas: CanvasConfig;         // Width, height, grid, background, pan mode
  assets: Asset[];              // Custom uploaded assets
  devices: Device[];            // All devices on canvas
  links: Link[];                // Connections between devices
  groups: Group[];              // Grouping zones
  shapes: Shape[];              # Zone shapes (rectangles, ellipses)
  texts: TextAnnotation[];      // Text labels
  lanes: Lane[];                // Data flow lanes (horizontal bands)
}
```

### Device
```typescript
interface Device {
  id: string;
  assetId: string;              // References builtInAssets or custom asset
  type: string;                 // Category: Network, Security, Servers, etc.
  label: string;
  x: number; y: number;
  width: number; height: number;
  rotation: number;
  ports: Port[];                // Connection points
  style: { opacity, labelColor, labelSize, ... };
}
```

### Link
```typescript
interface Link {
  id: string;
  from: { deviceId: string; portId?: string };
  to: { deviceId: string; portId?: string };
  pathType: 'straight' | 'orthogonal' | 'bezier';
  label?: string;
  style: { color, width, dash: number[], arrowType };
  controlPoints?: { x, y }[];   // Waypoints for custom paths
}
```

### Lane (Data Flow)
```typescript
interface Lane {
  id: string;
  title: string;                // e.g., "LANE 1 — Inbound Web Traffic"
  y: number;                    // Vertical position
  height: number;               // 50-300 pixels
  color: string;                // Background with transparency
  labelColor?: string;
  visible?: boolean;
}
```

### Selection
```typescript
interface Selection {
  deviceIds: string[];
  linkIds: string[];
  groupIds: string[];
  shapeIds: string[];
  textIds: string[];
  laneIds: string[];
}
```

---

## Key Components

### 1. Stage.tsx (Canvas)
The heart of the application - renders everything on the Konva canvas:
- **Grid rendering** - configurable grid lines
- **LaneStripe** - horizontal data flow lanes with drag/resize
- **ZoneShape** - rectangle/ellipse zones with transform
- **DeviceNode** - devices with image, label, ports, transform
- **Links** - arrows with labels, waypoints, auto-offset for parallel links
- **TextNode** - text annotations
- **Selection rectangle** - rubber band multi-select
- **Pan/zoom** - mouse wheel zoom, pan mode for navigation

### 2. TopToolbar.tsx
Main toolbar with actions:
- New, Import, Export (JSON, SVG, PNG, Clipboard)
- Undo/Redo (history management)
- Reset view, zoom controls
- Grid toggle, Snap toggle
- Add Lane, Add Text, Add Zone buttons
- Pan mode (Move button)

### 3. DevicePalette.tsx (Left Panel)
- Search/filter devices by name
- Category tabs: All, Network, Security, Servers, Storage, Cloud, Other
- Drag-and-drop or click to add devices
- Resizable panel width
- Shows device count on canvas

### 4. PropertyInspector.tsx (Right Panel)
Context-sensitive properties panel:
- **Device selected:** Label, position, size, rotation, label color/size, ports
- **Link selected:** Path type, color, width, dash style, arrow type, label
- **Lane selected:** Title, band color, label color, height, Y position
- **Multi-select:** Group/Ungroup actions, delete selected
- Resizable panel width

### 5. TopologyContext.tsx (State Management)
- `topologyReducer` handles all state mutations
- Actions: ADD/UPDATE/REMOVE for devices, links, groups, shapes, texts, lanes
- SET_TOPOLOGY for loading, UPDATE_CANVAS for settings
- UNDO/REDO with history stack
- Autosave to localStorage every 2 seconds

---

## Issues Faced & Solutions

### Issue 1: White Screen After Loading Old Saved Data
**Problem:** After adding the lanes feature, loading old autosaved topologies (without `lanes` array) caused a crash because the code tried to call `.map()` on `undefined`.

**Solution:** Added defensive fallbacks throughout the codebase:
```typescript
// In Stage.tsx
{(topology.lanes || []).map(lane => ...)}

// In PropertyInspector.tsx  
(selection.laneIds || []).includes(lane.id)
```

### Issue 2: Panel Resize Affecting Other Panel
**Problem:** When resizing the left DevicePalette, the right PropertyInspector would shrink (and vice versa) because both were in a flex container.

**Solution:** Added `flexShrink: 0` to both panel containers so they maintain independent widths:
```typescript
style={{ ..., flexShrink: 0 }}
```

### Issue 3: PropertyInspector Resize Not Working Correctly
**Problem:** The resize calculation used `window.innerWidth - e.clientX` which was inaccurate.

**Solution:** Changed to delta-based calculation that tracks starting mouse position and width:
```typescript
const startX = useRef(0);
const startWidth = useRef(288);

const handleResizeMove = (e: MouseEvent) => {
  const delta = startX.current - e.clientX;
  const newWidth = Math.min(500, Math.max(200, startWidth.current + delta));
  setPanelWidth(newWidth);
};

const handleResizeStart = (e: React.MouseEvent) => {
  startX.current = e.clientX;
  startWidth.current = panelWidth;
  // ... add event listeners
};
```

### Issue 4: Content Overflow in PropertyInspector
**Problem:** When panel was resized narrower, text content would overflow horizontally and disappear.

**Solution:** Added overflow handling and word-wrap:
```typescript
<div className="flex-1 overflow-y-auto overflow-x-hidden p-4" 
     style={{ wordBreak: 'break-word' }}>
```

### Issue 5: Lane Blocking Pan Mode
**Problem:** When lanes were on canvas, the Move/Pan button didn't work because lane elements captured all click/drag events.

**Solution:** Added `isPanMode` prop to LaneStripe and disabled interactivity when panning:
```typescript
<Group
  draggable={!isPanMode}
  listening={!isPanMode}
  ...
>
  <Rect ... listening={false} />  // Background always non-interactive
```

### Issue 6: Lane Title Position Overlapping Devices
**Problem:** Lane title was positioned at center-vertical (`y={lane.height / 2 - 10}`), overlapping with devices placed in the lane.

**Solution:** Moved title to top-left corner with dark background for readability:
```typescript
// Title background
<Rect x={5} y={3} width={...} height={20} fill="rgba(0, 0, 0, 0.5)" />
// Title text
<Text x={10} y={5} text={lane.title} fontSize={12} ... />
```

### Issue 7: JSON Import Structure Mismatch
**Problem:** Created JSON used `source`/`target` for links, but app expected `from`/`to` with `deviceId` property.

**Solution:** Fixed JSON structure to match TypeScript interfaces:
```json
// Wrong
{"source": {"deviceId": "..."}, "target": {"deviceId": "..."}}

// Correct
{"from": {"deviceId": "..."}, "to": {"deviceId": "..."}, "pathType": "straight"}
```

### Issue 8: Missing Asset IDs in Import
**Problem:** JSON used non-existent asset IDs like `cloud`, `firewall`, causing devices to not render.

**Solution:** Updated JSON to use actual asset IDs from `builtInAssets.ts`:
- `cloud` → `internet`
- `firewall` → `fortigate-firewall` or `cisco-ftd-firewall`
- `storage` → `fujitsu_af250_storage_alt`
- `voip-phone` → `voip_phone_alt`
- etc.

---

## Available Asset IDs

### Network
- `cisco-switch`, `cisco-router`, `network-switch`, `managed-switch`
- `fujitsu-san-switch`, `wifi-router`, `fujitsu-core-switch`
- `cisco_switch_alt`, `fujitsu_core_switch_alt`, `voip_router_alt`

### Security
- `cisco-ftd-firewall`, `f5-waf`, `fortigate-firewall`
- `secure-enclosure`, `dvr-system`
- `f5_big_ip_alt`, `fortigate_601e_alt`, `cisco_ftd_3105_alt`, `legacy_dmz_alt`

### Servers
- `esxi-server`, `server-blade`, `server-rack`
- `cucm_server_alt`, `backup_server_alt`, `esxi_blade_alt`

### Storage
- `fujitsu-backup-server`, `fujitsu-storage-system`
- `tape_library_alt`, `brocade_san_switch_alt`, `fujitsu_af250_storage_alt`

### Cloud
- `internet`

### Other
- `personal_computer_alt`, `voip_phone_alt`

---

## Key Keyboard Shortcuts

- **Ctrl+A** - Select all devices
- **Ctrl+C** - Copy selected items
- **Ctrl+V** - Paste copied items
- **Delete** - Delete selected items
- **Escape** - Cancel linking mode or stamp mode
- **Mouse wheel** - Zoom in/out

---

## How to Add New Features

### Adding a New Device Type
1. Add icon to `src/assets/icons/devices/`
2. Import in `builtInAssets.ts`
3. Add entry to `builtInAssets` array with unique `id`, `name`, `category`, `src`

### Adding a New Property to Devices
1. Update `Device` interface in `topology.ts`
2. Add UI controls in `PropertyInspector.tsx`
3. Handle in `UPDATE_DEVICE` case in `topologyReducer`
4. Update rendering in `DeviceNode` section of `Stage.tsx`

### Adding a New Canvas Element Type
1. Define interface in `topology.ts`
2. Add to `Topology` interface
3. Add to `Selection` interface if selectable
4. Create component or add to `Stage.tsx`
5. Add reducer actions (ADD/UPDATE/REMOVE)
6. Add UI controls in PropertyInspector
7. Add creation button in TopToolbar

---

## Sample Topology Files

- `public/government-ministry-dataflow.json` - 10-lane data flow diagram with ~60 devices

---

## Future Improvements (TODO)

1. **Device-Lane Association** - Automatically place devices within lane boundaries
2. **Custom Device Upload** - Allow users to upload their own device icons
3. **Templates** - Pre-built topology templates
4. **Collaboration** - Real-time multi-user editing
5. **Version History** - Named save points, branching
6. **PDF Export** - High-quality PDF output
7. **Layer Management** - Show/hide layers, z-index control
8. **Search & Filter on Canvas** - Find devices by label/type
9. **Annotations** - Callouts, notes, legends
10. **Auto-Layout** - Automatic arrangement algorithms

---

## Running the Project

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

*Last updated: December 21, 2024*
