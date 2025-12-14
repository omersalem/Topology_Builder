# Network Topology Builder

A powerful, responsive web application for visually creating network topologies with drag-and-drop device placement, customizable links, and comprehensive import/export capabilities.

![Network Topology Builder](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Konva](https://img.shields.io/badge/Konva-9-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## Features

### Core Functionality
- **Interactive Canvas**: Pan and zoom with mouse/wheel controls
- **Device Library**: Built-in icons for routers, switches, firewalls, servers, and cloud services
- **Custom Assets**: Upload your own device images (PNG, JPG) with automatic background removal
- **Visual Editing**: Drag-and-drop devices, resize, rotate with transform handles
- **Smart Linking**: Create connections between devices with multiple path types (straight, orthogonal, bezier)
- **Port Management**: Add and configure connection ports on devices
- **Background Zones**: Create labeled zones to organize topology areas
- **Grid System**: Toggle grid display and snap-to-grid for precise alignment

### Import/Export
- **JSON Export/Import**: Save and load topologies with complete fidelity
- **PNG Export**: Render high-quality images at configurable scale
- **SVG Export**: Vector graphics for scalable diagrams
- **Auto-Save**: Local storage persistence for work-in-progress

### UI/UX
- **Property Inspector**: Real-time editing of device, link, and group properties
- **Device Palette**: Searchable, categorized library with custom upload
- **Keyboard Shortcuts**: Delete, Undo, Redo support
- **Selection System**: Click to select, delete to remove
- **Responsive Design**: Optimized for desktop workflows

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone or download the project
cd Network Topology Builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Usage Guide

### Creating Your First Topology

1. **Add Devices**:
   - Click on any device in the left palette to add it to the center of the canvas
   - Or drag a device from the palette and drop it anywhere on the canvas

2. **Position and Configure**:
   - Click and drag devices to reposition them
   - Select a device to see transform handles for resizing and rotation
   - Use the Property Inspector (right panel) to edit labels, position, and size

3. **Add Ports** (Optional):
   - Select a device
   - In the Property Inspector, click "Add Port"
   - Ports appear as green circles on the device

4. **Create Links**:
   - Currently, links must be created via the Property Inspector
   - Future update will include click-to-link functionality

5. **Organize with Zones**:
   - Background zones can be added to group related devices
   - Edit zone properties in the Inspector

6. **Save Your Work**:
   - Click "Export" > "JSON" to download your topology
   - Work is auto-saved to browser localStorage

### Uploading Custom Devices

1. Click "Upload Device Image" in the palette
2. Select an image file (PNG or JPG)
3. Optionally enable "Remove white background"
4. Click "Process Image" to optimize
5. Enter a name and category
6. Click "Add to Palette"

### Keyboard Shortcuts

- **Delete/Backspace**: Remove selected items
- **Mouse Wheel**: Zoom in/out
- **Click + Drag** (on empty canvas): Pan view

### Viewing Controls

- **Zoom In/Out**: Use toolbar buttons or mouse wheel
- **Reset Zoom**: Click "100%" button
- **Grid Toggle**: Show/hide alignment grid
- **Snap Toggle**: Enable/disable snap-to-grid

## Project Structure

```
src/
├── components/
│   ├── Canvas/          # Konva stage and rendering
│   ├── Palette/         # Device library and uploader
│   ├── Inspector/       # Property editor
│   └── Toolbar/         # Top controls
├── context/             # Global state management
├── types/               # TypeScript definitions
├── utils/               # Helper functions
│   ├── geometry.ts      # Math utilities
│   ├── routing.ts       # Link path algorithms
│   ├── exporters.ts     # Export functionality
│   ├── importers.ts     # Import validation
│   └── imageProcessing.ts  # Asset processing
└── assets/              # Built-in icons
```

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Konva.js**: High-performance canvas rendering
- **react-konva**: React bindings for Konva
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server

## Data Model

Topologies are stored as JSON with the following schema:

```typescript
{
  meta: { title, createdAt, updatedAt, version },
  canvas: { width, height, gridSize, snapToGrid, showGrid },
  assets: [{ id, name, type, src, category }],
  devices: [{ id, assetId, label, x, y, width, height, ports, style }],
  links: [{ id, from, to, pathType, label, style }],
  groups: [{ id, label, x, y, width, height, style }],
  shapes: [],
  texts: []
}
```

## Sample Files

Check the `public/` directory for:
- `sample-datacenter.json` - Example datacenter topology

Load these via Import button to see example configurations.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Notes

- Optimized for topologies with 100+ devices
- Grid rendering is viewport-aware for better performance
- Image assets are automatically compressed

## Troubleshooting

### Images not loading
- Ensure images are valid PNG/JPG files
- Check browser console for errors
- Try processing with "Remove white background" enabled

### Canvas not responding
- Refresh the page
- Check browser console for JavaScript errors
- Clear localStorage: `localStorage.clear()`

### Export not working
- Ensure modern browser with Blob support
- Check pop-up blockers
- For PNG export, wait for all images to load

## Future Enhancements

Planned features:
- Interactive link creation (click-to-connect)
- Undo/redo with full history panel
- Shape tools (rectangle, circle, text annotations)
- Multi-select and grouping
- Alignment tools
- Auto-layout algorithms
- Real-time collaboration
- Backend persistence with user accounts

## Contributing

Contributions are welcome! Areas for improvement:
- Additional device icons
- Better link routing algorithms
- More shape primitives
- Enhanced export formats (PDF)
- Accessibility improvements

## License

MIT License - feel free to use in your projects!

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review sample files for examples
3. Check browser console for error messages

---

**Built with ❤️ using React, TypeScript, and Konva.js**
