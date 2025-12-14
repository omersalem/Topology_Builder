import { useTopology } from '../../context/TopologyContext';
import { generateId } from '../../utils/geometry';

export default function PropertyInspector() {
  const { topology, selection, dispatch, setSelection } = useTopology();

  // Get selected items
  const selectedDevice = topology.devices.find(d => selection.deviceIds.includes(d.id));
  const selectedLink = topology.links.find(l => selection.linkIds.includes(l.id));
  const selectedGroup = topology.groups.find(g => selection.groupIds.includes(g.id));
  const selectedText = topology.texts.find(t => selection.textIds.includes(t.id));

  const updateDevice = (updates: any) => {
    if (selectedDevice) {
      dispatch({ type: 'UPDATE_DEVICE', payload: { id: selectedDevice.id, updates } });
    }
  };

  const updateLink = (updates: any) => {
    if (selectedLink) {
      dispatch({ type: 'UPDATE_LINK', payload: { id: selectedLink.id, updates } });
    }
  };

  const updateText = (updates: any) => {
    if (selectedText) {
      dispatch({ type: 'UPDATE_TEXT', payload: { id: selectedText.id, updates } });
    }
  };

  const addPort = () => {
    if (selectedDevice) {
      // Cycle through port positions: top, right, bottom, left
      const portPositions = [
        { x: 0.5, y: 0, orientation: 'top' as const, name: 'Top' },
        { x: 1, y: 0.5, orientation: 'right' as const, name: 'Right' },
        { x: 0.5, y: 1, orientation: 'bottom' as const, name: 'Bottom' },
        { x: 0, y: 0.5, orientation: 'left' as const, name: 'Left' },
        { x: 0.25, y: 0, orientation: 'top' as const, name: 'Top-L' },
        { x: 0.75, y: 0, orientation: 'top' as const, name: 'Top-R' },
        { x: 1, y: 0.25, orientation: 'right' as const, name: 'Right-T' },
        { x: 1, y: 0.75, orientation: 'right' as const, name: 'Right-B' },
        { x: 0.25, y: 1, orientation: 'bottom' as const, name: 'Bottom-L' },
        { x: 0.75, y: 1, orientation: 'bottom' as const, name: 'Bottom-R' },
        { x: 0, y: 0.25, orientation: 'left' as const, name: 'Left-T' },
        { x: 0, y: 0.75, orientation: 'left' as const, name: 'Left-B' },
      ];
      
      const posIndex = selectedDevice.ports.length % portPositions.length;
      const pos = portPositions[posIndex];
      
      const newPort = {
        id: generateId('port'),
        name: `Port ${selectedDevice.ports.length + 1}`,
        x: pos.x,
        y: pos.y,
        orientation: pos.orientation,
      };
      updateDevice({ ports: [...selectedDevice.ports, newPort] });
    }
  };

  const removePort = (portId: string) => {
    if (selectedDevice) {
      updateDevice({ ports: selectedDevice.ports.filter(p => p.id !== portId) });
    }
  };

  const deleteSelected = () => {
    if (selectedDevice) {
      dispatch({ type: 'REMOVE_DEVICE', payload: selectedDevice.id });
    }
    if (selectedLink) {
      dispatch({ type: 'REMOVE_LINK', payload: selectedLink.id });
    }
    if (selectedText) {
      dispatch({ type: 'REMOVE_TEXT', payload: selectedText.id });
    }
    // Clear selection after delete
    setSelection({ deviceIds: [], linkIds: [], groupIds: [], shapeIds: [], textIds: [] });
  };

  // Empty state
  if (!selectedDevice && !selectedLink && !selectedGroup && !selectedText) {
    return (
      <div className="w-72 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 flex flex-col">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <h2 className="text-lg font-bold text-white">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="text-slate-500 text-sm">Select an item to view its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <h2 className="text-lg font-bold text-white">
          {selectedDevice ? 'Device Properties' : selectedLink ? 'Link Properties' : selectedText ? 'Text Properties' : 'Properties'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Device Properties */}
        {selectedDevice && (
          <>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Label</label>
              <input
                type="text"
                value={selectedDevice.label}
                onChange={(e) => updateDevice({ label: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedDevice.x)}
                  onChange={(e) => updateDevice({ x: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedDevice.y)}
                  onChange={(e) => updateDevice({ y: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Width</label>
                <input
                  type="number"
                  value={selectedDevice.width}
                  onChange={(e) => updateDevice({ width: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Height</label>
                <input
                  type="number"
                  value={selectedDevice.height}
                  onChange={(e) => updateDevice({ height: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Ports */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-400">Ports</label>
                <button
                  onClick={addPort}
                  className="text-xs px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                >
                  + Add Port
                </button>
              </div>
              <div className="space-y-2">
                {selectedDevice.ports.map((port) => (
                  <div key={port.id} className="flex items-center justify-between bg-slate-700/50 rounded px-2 py-1.5">
                    <span className="text-sm text-white">{port.name}</span>
                    <button
                      onClick={() => removePort(port.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Link Properties */}
        {selectedLink && (
          <>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Label</label>
              <input
                type="text"
                value={selectedLink.label || ''}
                onChange={(e) => updateLink({ label: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                placeholder="Optional label..."
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Color</label>
              <input
                type="color"
                value={selectedLink.style.color}
                onChange={(e) => updateLink({ style: { ...selectedLink.style, color: e.target.value } })}
                className="w-full h-10 bg-slate-700 rounded-lg border border-slate-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Width: {selectedLink.style.width}px</label>
              <input
                type="range"
                min="1"
                max="10"
                value={selectedLink.style.width}
                onChange={(e) => updateLink({ style: { ...selectedLink.style, width: Number(e.target.value) } })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">From</label>
              <div className="text-sm text-white bg-slate-700/50 rounded px-2 py-1.5">
                {topology.devices.find(d => d.id === selectedLink.from.deviceId)?.label || 'Unknown'}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">To</label>
              <div className="text-sm text-white bg-slate-700/50 rounded px-2 py-1.5">
                {topology.devices.find(d => d.id === selectedLink.to.deviceId)?.label || 'Unknown'}
              </div>
            </div>
          </>
        )}

        {/* Text Properties */}
        {selectedText && (
          <>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Text</label>
              <textarea
                value={selectedText.text}
                onChange={(e) => updateText({ text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Font Size</label>
              <input
                type="number"
                value={selectedText.fontSize}
                onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
                min="8"
                max="72"
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Color</label>
              <input
                type="color"
                value={selectedText.color}
                onChange={(e) => updateText({ color: e.target.value })}
                className="w-full h-10 bg-slate-700 rounded-lg border border-slate-600 cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={deleteSelected}
          className="w-full py-2 text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors font-medium text-sm"
        >
          Delete Selected
        </button>
      </div>
    </div>
  );
}
