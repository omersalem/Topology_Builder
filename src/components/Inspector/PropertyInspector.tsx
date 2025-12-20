import { useState, useRef, useCallback } from 'react';
import { useTopology } from '../../context/TopologyContext';
import { generateId } from '../../utils/geometry';

export default function PropertyInspector() {
  const { topology, selection, dispatch, setSelection } = useTopology();
  const [panelWidth, setPanelWidth] = useState(288);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(288);

  // Resize handlers - delta-based for accurate dragging
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const delta = startX.current - e.clientX;
    const newWidth = Math.min(500, Math.max(200, startWidth.current + delta));
    setPanelWidth(newWidth);
  }, []);

  const handleResizeEnd = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove, handleResizeEnd, panelWidth]);

  // Get selected items
  const selectedDevice = topology.devices.find(d => selection.deviceIds.includes(d.id));
  const selectedLink = topology.links.find(l => selection.linkIds.includes(l.id));
  const selectedLinks = topology.links.filter(l => selection.linkIds.includes(l.id)); // All selected links
  const selectedGroup = topology.groups.find(g => selection.groupIds.includes(g.id));
  const selectedText = topology.texts.find(t => selection.textIds.includes(t.id));
  const selectedLane = (topology.lanes || []).find(l => (selection.laneIds || []).includes(l.id));

  // Helper to update selected lane
  const updateLane = (updates: any) => {
    (selection.laneIds || []).forEach(laneId => {
      dispatch({ type: 'UPDATE_LANE', payload: { id: laneId, updates } });
    });
  };

  // Calculates selection count
  const selectionCount = selection.deviceIds.length + selection.textIds.length + selection.shapeIds.length + (selection.laneIds || []).length;

  // Check if any selected item is part of a group
  const hasGroupedItems = [selectedDevice, selectedText].some(item => item?.groupId);

  const handleGroup = () => {
    const newGroupId = generateId('group');
    selection.deviceIds.forEach(id => dispatch({ type: 'UPDATE_DEVICE', payload: { id, updates: { groupId: newGroupId } } }));
    selection.textIds.forEach(id => dispatch({ type: 'UPDATE_TEXT', payload: { id, updates: { groupId: newGroupId } } }));
    selection.shapeIds.forEach(id => dispatch({ type: 'UPDATE_SHAPE', payload: { id, updates: { groupId: newGroupId } } }));
  };

  const handleUngroup = () => {
    selection.deviceIds.forEach(id => dispatch({ type: 'UPDATE_DEVICE', payload: { id, updates: { groupId: undefined } } }));
    selection.textIds.forEach(id => dispatch({ type: 'UPDATE_TEXT', payload: { id, updates: { groupId: undefined } } }));
    selection.shapeIds.forEach(id => dispatch({ type: 'UPDATE_SHAPE', payload: { id, updates: { groupId: undefined } } }));
  };

  const updateDevice = (updates: any) => {
    // Update all selected devices (batch editing)
    selection.deviceIds.forEach(deviceId => {
      const device = topology.devices.find(d => d.id === deviceId);
      if (device) {
        // For style updates, merge with existing style
        const finalUpdates = updates.style 
          ? { ...updates, style: { ...device.style, ...updates.style } }
          : updates;
        dispatch({ type: 'UPDATE_DEVICE', payload: { id: deviceId, updates: finalUpdates } });
      }
    });
  };

  const updateLink = (updates: any) => {
    selectedLinks.forEach(link => {
      dispatch({ type: 'UPDATE_LINK', payload: { id: link.id, updates } });
    });
  };

  const updateText = (updates: any) => {
    // Update all selected texts (batch editing)
    selection.textIds.forEach(textId => {
      dispatch({ type: 'UPDATE_TEXT', payload: { id: textId, updates } });
    });
  };

  const addPort = () => {
    if (selectedDevice) {
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
    selectedLinks.forEach(link => {
      dispatch({ type: 'REMOVE_LINK', payload: link.id });
    });
    if (selectedText) {
      dispatch({ type: 'REMOVE_TEXT', payload: selectedText.id });
    }
    setSelection({ deviceIds: [], linkIds: [], groupIds: [], shapeIds: [], textIds: [], laneIds: [] });
  };

  if (!selectedDevice && !selectedLink && !selectedGroup && !selectedText && !selectedLane && selectionCount < 2) {
    return (
      <div style={{ width: `${panelWidth}px`, minWidth: '200px', maxWidth: '500px', height: '100%', backgroundColor: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', position: 'relative', flexShrink: 0 }}>
        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', cursor: 'col-resize', backgroundColor: 'transparent', zIndex: 10 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        />
        <div className="p-4" style={{ background: 'linear-gradient(135deg, #9333ea, #db2777)' }}>
          <h2 className="text-lg font-bold text-white">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select an item to view its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: `${panelWidth}px`,
      minWidth: '200px',
      maxWidth: '500px',
      height: '100%',
      backgroundColor: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'background-color 0.2s',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          backgroundColor: 'transparent',
          zIndex: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.5)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      />
      {/* Header */}
      <div className="p-4" style={{ background: 'linear-gradient(135deg, #9333ea, #db2777)' }}>
        <h2 className="text-lg font-bold text-[var(--text-main)]">
          {selectedDevice ? 'Device Properties' : selectedLink ? 'Link Properties' : selectedText ? 'Text Properties' : 'Properties'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4" style={{ wordBreak: 'break-word' }}>
        {/* Group Actions */}
        {(selectionCount > 1 || hasGroupedItems) && (
          <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border-color)] mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--text-main)] text-sm font-medium">{selectionCount} Items Selected</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGroup}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                disabled={selectionCount < 2}
                style={{ opacity: selectionCount < 2 ? 0.5 : 1 }}
              >
                Group
              </button>
              <button
                onClick={handleUngroup}
                className="flex-1 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors"
                disabled={!hasGroupedItems}
                style={{ opacity: !hasGroupedItems ? 0.5 : 1 }}
              >
                Ungroup
              </button>
            </div>
          </div>
        )}

        {/* Device Properties */}
        {selectedDevice && (
          <>
            {selection.deviceIds.length > 1 && (
              <div className="text-xs text-[var(--text-muted)] mb-2 bg-blue-600/10 px-2 py-1 rounded">
                🖥️ Editing {selection.deviceIds.length} devices
              </div>
            )}
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Label</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedDevice.label}
                  onChange={(e) => updateDevice({ label: e.target.value })}
                  className="flex-1 px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="Enter device label"
                />
                <button
                  onClick={() => updateDevice({ label: '' })}
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-[var(--text-main)] rounded-lg transition-colors text-sm font-bold"
                  title="Clear label"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Label Styling */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Label Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedDevice.style.labelColor || '#ffffff'}
                    onChange={(e) => updateDevice({ style: { ...selectedDevice.style, labelColor: e.target.value } })}
                    className="w-10 h-8 bg-[var(--bg-input)] rounded border border-[var(--border-color)] cursor-pointer"
                  />
                  <div className="flex gap-1">
                    {['#ffffff', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateDevice({ style: { ...selectedDevice.style, labelColor: color } })}
                        className="w-6 h-6 rounded border border-[var(--border-color)]"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Label Size</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={selectedDevice.style.labelSize || 12}
                    onChange={(e) => updateDevice({ style: { ...selectedDevice.style, labelSize: Number(e.target.value) } })}
                    className="flex-1"
                  />
                  <span className="text-sm text-[var(--text-main)] w-12 text-right font-bold">{selectedDevice.style.labelSize || 12}px</span>
                </div>
              </div>
            </div>

            {/* Label Style Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => updateDevice({ style: { ...selectedDevice.style, labelBold: !selectedDevice.style?.labelBold } })}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm font-bold ${selectedDevice.style?.labelBold
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                }`}
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() => updateDevice({ style: { ...selectedDevice.style, labelUnderline: !selectedDevice.style?.labelUnderline } })}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm ${selectedDevice.style?.labelUnderline
                  ? 'bg-blue-600 border-blue-600 text-white underline'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] underline'
                }`}
                title="Underline"
              >
                U
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedDevice.x)}
                  onChange={(e) => updateDevice({ x: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedDevice.y)}
                  onChange={(e) => updateDevice({ y: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Width</label>
                <input
                  type="number"
                  value={selectedDevice.width}
                  onChange={(e) => updateDevice({ width: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Height</label>
                <input
                  type="number"
                  value={selectedDevice.height}
                  onChange={(e) => updateDevice({ height: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Ports */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-[var(--text-muted)]">Ports</label>
                <button
                  onClick={addPort}
                  className="text-xs px-2 py-1 bg-green-600 hover:bg-green-500 text-[var(--text-main)] rounded transition-colors"
                >
                  + Add Port
                </button>
              </div>
              <div className="space-y-2">
                {selectedDevice.ports.map((port) => (
                  <div key={port.id} className="flex items-center justify-between bg-[var(--bg-input)]/50 rounded px-2 py-1.5">
                    <span className="text-sm text-[var(--text-main)]">{port.name}</span>
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
            {/* Multi-link selection indicator */}
            {selectedLinks.length > 1 && (
              <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-3 mb-3">
                <p className="text-blue-300 text-sm font-medium">
                  {selectedLinks.length} links selected
                </p>
                <p className="text-blue-400/70 text-xs mt-1">
                  Changes will apply to all selected links
                </p>
              </div>
            )}
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Label</label>
              <input
                type="text"
                value={selectedLinks.length > 1 ? '' : (selectedLink.label || '')}
                onChange={(e) => updateLink({ label: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                placeholder={selectedLinks.length > 1 ? "Set label for all..." : "Optional label..."}
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Color</label>
              {/* Glassy Color Presets */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {[
                  { color: '#00d4ff', name: 'Cyan Glow' },
                  { color: '#ff00ff', name: 'Magenta' },
                  { color: '#00ff88', name: 'Emerald' },
                  { color: '#ff6b35', name: 'Orange' },
                  { color: '#a855f7', name: 'Purple' },
                  { color: '#fbbf24', name: 'Gold' },
                  { color: '#ef4444', name: 'Red' },
                  { color: '#3b82f6', name: 'Blue' },
                  { color: '#22c55e', name: 'Green' },
                  { color: '#f472b6', name: 'Pink' },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => updateLink({ style: { ...selectedLink.style, color: preset.color } })}
                    title={preset.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      border: selectedLink.style.color === preset.color ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)',
                      background: `linear-gradient(135deg, ${preset.color} 0%, ${preset.color}88 100%)`,
                      cursor: 'pointer',
                      boxShadow: `0 2px 6px ${preset.color}55`,
                    }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedLink.style.color}
                onChange={(e) => updateLink({ style: { ...selectedLink.style, color: e.target.value } })}
                className="w-full h-8 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Width (px)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={selectedLink.style.width}
                  onChange={(e) => updateLink({ style: { ...selectedLink.style, width: Math.max(1, Math.min(20, Number(e.target.value))) } })}
                  className="w-16 px-2 py-1.5 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm text-center"
                />
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={selectedLink.style.width}
                  onChange={(e) => updateLink({ style: { ...selectedLink.style, width: Number(e.target.value) } })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Arrow Type</label>
              <select
                value={selectedLink.style.arrowType || 'end'}
                onChange={(e) => updateLink({ style: { ...selectedLink.style, arrowType: e.target.value } })}
                className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
              >
                <option value="none">None ────</option>
                <option value="end">End ────→</option>
                <option value="both">Both ←──→</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">From</label>
              <div className="text-sm text-[var(--text-main)] bg-[var(--bg-input)]/50 rounded px-2 py-1.5">
                {topology.devices.find(d => d.id === selectedLink.from.deviceId)?.label || 'Unknown'}
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">To</label>
              <div className="text-sm text-[var(--text-main)] bg-[var(--bg-input)]/50 rounded px-2 py-1.5">
                {topology.devices.find(d => d.id === selectedLink.to.deviceId)?.label || 'Unknown'}
              </div>
            </div>
          </>
        )}

        {/* Text Properties - show when any texts are selected */}
        {selection.textIds.length > 0 && (
          <>
            {selection.textIds.length > 1 && (
              <div className="text-xs text-[var(--text-muted)] mb-2 bg-blue-600/10 px-2 py-1 rounded">
                ✏️ Editing {selection.textIds.length} texts
              </div>
            )}
            {selectedText && (
              <>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Text</label>
                  <textarea
                    value={selectedText.text}
                    onChange={(e) => updateText({ text: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Font Size</label>
                    <input
                      type="number"
                      value={selectedText.fontSize}
                      onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
                      min="8"
                      max="72"
                      className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Style</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateText({ fontStyle: selectedText.fontStyle === 'bold' ? 'normal' : 'bold' })}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm font-bold ${selectedText.fontStyle === 'bold'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
                        }`}
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        onClick={() => updateText({ textDecoration: selectedText.textDecoration === 'underline' ? '' : 'underline' })}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors text-sm ${selectedText.textDecoration === 'underline'
                          ? 'bg-blue-600 border-blue-600 text-white underline'
                          : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] underline'
                        }`}
                        title="Underline"
                      >
                        U
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Text Color</label>
                    <input
                      type="color"
                      value={selectedText.color}
                      onChange={(e) => updateText({ color: e.target.value })}
                      className="w-full h-8 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Background</label>
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={selectedText.backgroundColor === 'transparent' ? '#ffffff' : (selectedText.backgroundColor || '#ffffff')}
                        onChange={(e) => updateText({ backgroundColor: e.target.value, padding: 5 })}
                        className="flex-1 h-8 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] cursor-pointer"
                        title="Background Color"
                      />
                      <button
                        onClick={() => updateText({
                          backgroundColor: selectedText.backgroundColor === 'transparent' ? '#ffffff' : 'transparent',
                          padding: selectedText.backgroundColor === 'transparent' ? 5 : 0
                        })}
                        className={`nav-btn px-2 rounded-lg border ${selectedText.backgroundColor !== 'transparent' && selectedText.backgroundColor
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-color)]'
                        }`}
                        title="Toggle Background"
                      >
                        T
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Rotation (°)</label>
                  <input
                    type="number"
                    value={Math.round(selectedText.rotation || 0)}
                    onChange={(e) => updateText({ rotation: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

        {/* Lane Properties */}
        {selectedLane && (
          <div className="p-4 space-y-3 border-t border-[var(--border-color)]">
            <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
              <span>🛤️</span> Lane Properties
            </h3>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Title</label>
              <input
                type="text"
                value={selectedLane.title}
                onChange={(e) => updateLane({ title: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Band Color</label>
                <input
                  type="color"
                  value={selectedLane.color?.startsWith('rgba') ? '#3b82f6' : (selectedLane.color || '#3b82f6')}
                  onChange={(e) => updateLane({ color: `${e.target.value}33` })}
                  className="w-full h-8 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Label Color</label>
                <input
                  type="color"
                  value={selectedLane.labelColor || '#ffffff'}
                  onChange={(e) => updateLane({ labelColor: e.target.value })}
                  className="w-full h-8 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Height: {selectedLane.height}px</label>
              <input
                type="range"
                min="50"
                max="300"
                value={selectedLane.height}
                onChange={(e) => updateLane({ height: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Y Position</label>
              <input
                type="number"
                value={Math.round(selectedLane.y)}
                onChange={(e) => updateLane({ y: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[var(--bg-input)] text-[var(--text-main)] rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <button
              onClick={() => {
                dispatch({ type: 'REMOVE_LANE', payload: selectedLane.id });
                setSelection({ ...selection, laneIds: selection.laneIds.filter(id => id !== selectedLane.id) });
              }}
              className="w-full py-2 text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors font-medium text-sm"
            >
              Delete Lane
            </button>
          </div>
        )}

      {/* Delete Button */}
      <div className="p-4 border-t border-[var(--border-color)]">
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
