import { TopologyProvider } from './context/TopologyContext';
import { ThemeProvider } from './context/ThemeContext';
import CanvasStage from './components/Canvas/Stage';
import DevicePalette from './components/Palette/DevicePalette';
import TopToolbar from './components/Toolbar/TopToolbar';
import PropertyInspector from './components/Inspector/PropertyInspector';

function App() {
  return (
    <ThemeProvider>
      <TopologyProvider>
        <div style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }} className="h-screen w-screen flex flex-col overflow-hidden transition-colors duration-200">
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
    </ThemeProvider>
  );
}

export default App;
