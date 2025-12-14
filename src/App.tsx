import { TopologyProvider } from './context/TopologyContext';
import CanvasStage from './components/Canvas/Stage';
import DevicePalette from './components/Palette/DevicePalette';
import TopToolbar from './components/Toolbar/TopToolbar';
import PropertyInspector from './components/Inspector/PropertyInspector';

function App() {
  return (
    <TopologyProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-900">
        {/* Top Toolbar */}
        <TopToolbar />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Device Palette */}
          <DevicePalette />

          {/* Center - Canvas */}
          <div className="flex-1 relative">
            <CanvasStage />
          </div>

          {/* Right Sidebar - Property Inspector */}
          <PropertyInspector />
        </div>
      </div>
    </TopologyProvider>
  );
}

export default App;
