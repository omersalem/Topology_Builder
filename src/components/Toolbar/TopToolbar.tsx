import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTopology } from '../../context/TopologyContext';
import { generateId } from '../../utils/geometry';
import type { Link } from '../../types/topology';

export default function TopToolbar() {
  const { topology, dispatch, setViewport, viewport } = useTopology();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link creation state
  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkColor, setLinkColor] = useState('#22c55e');

  // Text creation state
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(16);

  const handleNew = () => {
    if (confirm('Create a new topology? All unsaved changes will be lost.')) {
      localStorage.removeItem('topology-autosave');
      window.location.reload();
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      dispatch({ type: 'SET_TOPOLOGY', payload: data });
      alert('Topology imported successfully!');
    } catch (err) {
      alert('Failed to import: Invalid JSON file');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(topology, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topology.meta.title.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPNG = async () => {
    const stage = (window as any).konvaStage;
    if (!stage) {
      alert('Canvas not ready');
      return;
    }
    try {
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${topology.meta.title.replace(/\s+/g, '-')}.png`;
      a.click();
      setShowExportMenu(false);
    } catch (err) {
      alert('Failed to export PNG');
    }
  };

  const handleCreateLink = () => {
    if (!linkFrom || !linkTo) {
      alert('Please select both devices');
      return;
    }

    // Allow multiple links between same devices (removed the linkFrom === linkTo check)
    const newLink: Link = {
      id: generateId('link'),
      from: { deviceId: linkFrom },
      to: { deviceId: linkTo },
      pathType: 'straight',
      label: linkLabel || undefined,
      style: {
        color: linkColor,
        width: 2,
        dash: [],
      },
    };

    dispatch({ type: 'ADD_LINK', payload: newLink });
    setShowLinkModal(false);
    setLinkFrom('');
    setLinkTo('');
    setLinkLabel('');
  };

  const handleAddText = () => {
    if (!newText.trim()) {
      alert('Please enter some text');
      return;
    }

    const textAnnotation = {
      id: generateId('text'),
      text: newText,
      x: 300,
      y: 200,
      fontSize: textSize,
      fontFamily: 'Arial',
      color: textColor,
      rotation: 0,
      align: 'left' as const,
    };

    dispatch({ type: 'ADD_TEXT', payload: textAnnotation });
    setShowTextModal(false);
    setNewText('');
  };

  const handleZoomIn = () => setViewport({ scale: Math.min(viewport.scale * 1.2, 5) });
  const handleZoomOut = () => setViewport({ scale: Math.max(viewport.scale / 1.2, 0.1) });
  const handleResetZoom = () => setViewport({ scale: 1, x: 0, y: 0 });

  const toggleGrid = () => {
    dispatch({
      type: 'UPDATE_CANVAS',
      payload: { showGrid: !topology.canvas.showGrid },
    });
  };

  const toggleSnap = () => {
    dispatch({
      type: 'UPDATE_CANVAS',
      payload: { snapToGrid: !topology.canvas.snapToGrid },
    });
  };

  // Modal styles
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    width: '400px',
    maxWidth: '90vw',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #475569',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#334155',
    color: '#ffffff',
    border: '1px solid #475569',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#94a3b8',
  };

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  };

  const toolbarBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#94a3b8',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const iconBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    color: '#94a3b8',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  return (
    <>
      <div style={{
        height: '56px',
        background: 'linear-gradient(180deg, #1a1f2e 0%, #0f1319 100%)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 50,
      }}>
        {/* Left section - Logo & File Operations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>
              NetTopo
            </span>
          </div>

          {/* File Group */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button onClick={handleNew} style={{...toolbarBtnStyle, minWidth: '60px'}}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            <button onClick={handleImport} style={{...toolbarBtnStyle, minWidth: '70px'}}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                style={{...toolbarBtnStyle, minWidth: '75px'}}
              >
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
                <svg style={{ width: '10px', height: '10px', marginLeft: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '6px',
                  background: 'linear-gradient(180deg, #252d3d 0%, #1a2030 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  minWidth: '150px',
                }}>
                  <button onClick={handleExportJSON} style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    textAlign: 'left',
                    color: '#cbd5e1',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    📄 Export as JSON
                  </button>
                  <button onClick={handleExportPNG} style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    textAlign: 'left',
                    color: '#cbd5e1',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }} onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    🖼️ Export as PNG
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '28px', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)', margin: '0 12px' }} />

          {/* Zoom Group */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '4px 8px',
            border: '1px solid rgba(255,255,255,0.06)',
            gap: '4px',
          }}>
            <button onClick={handleZoomOut} style={{...iconBtnStyle}}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span style={{ 
              color: '#94a3b8', 
              fontSize: '12px', 
              fontWeight: 600,
              minWidth: '42px', 
              textAlign: 'center',
              background: 'rgba(0,0,0,0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
            }}>{Math.round(viewport.scale * 100)}%</span>
            <button onClick={handleZoomIn} style={{...iconBtnStyle}}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <button onClick={handleResetZoom} style={{
              padding: '4px 8px',
              fontSize: '11px',
              color: '#64748b',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              fontWeight: 500,
            }} onMouseOver={e => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}} onMouseOut={e => {e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'}}>
              Reset
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '28px', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)', margin: '0 12px' }} />

          {/* Canvas Options */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <button 
              onClick={toggleGrid} 
              style={{
                ...toolbarBtnStyle,
                background: topology.canvas.showGrid ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: topology.canvas.showGrid ? '#fff' : '#94a3b8',
                boxShadow: topology.canvas.showGrid ? '0 2px 8px rgba(59,130,246,0.4)' : 'none',
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 9h16 M4 13h16 M4 17h16 M9 4v16 M13 4v16 M17 4v16" />
              </svg>
              Grid
            </button>
            <button 
              onClick={toggleSnap} 
              style={{
                ...toolbarBtnStyle,
                background: topology.canvas.snapToGrid ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: topology.canvas.snapToGrid ? '#fff' : '#94a3b8',
                boxShadow: topology.canvas.snapToGrid ? '0 2px 8px rgba(59,130,246,0.4)' : 'none',
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Snap
            </button>
          </div>
        </div>

        {/* Right section - Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setShowLinkModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.5)'}}
            onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(16, 185, 129, 0.35)'}}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Add Link
          </button>
          <button 
            onClick={() => setShowTextModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(139, 92, 246, 0.35)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.5)'}}
            onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(139, 92, 246, 0.35)'}}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Add Text
          </button>
        </div>

        {/* Right section - Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Devices:</span>
            <span className="text-white font-medium">{topology.devices.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Links:</span>
            <span className="text-white font-medium">{topology.links.length}</span>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Link Creation Modal - Using Portal */}
      {showLinkModal && createPortal(
        <div style={modalOverlayStyle} onClick={() => setShowLinkModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '20px' }}>
              Create Link
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>From Device</label>
                <select 
                  value={linkFrom} 
                  onChange={(e) => setLinkFrom(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select device...</option>
                  {topology.devices.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>To Device</label>
                <select 
                  value={linkTo} 
                  onChange={(e) => setLinkTo(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select device...</option>
                  {topology.devices.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Label (optional)</label>
                <input 
                  type="text" 
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="e.g., 10Gbps"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Color</label>
                <input 
                  type="color" 
                  value={linkColor}
                  onChange={(e) => setLinkColor(e.target.value)}
                  style={{ ...inputStyle, height: '44px', cursor: 'pointer' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setShowLinkModal(false)}
                style={{ ...buttonStyle, backgroundColor: '#475569', color: '#e2e8f0' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateLink}
                style={{ ...buttonStyle, backgroundColor: '#16a34a', color: '#ffffff' }}
              >
                Create Link
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Text Creation Modal - Using Portal */}
      {showTextModal && createPortal(
        <div style={modalOverlayStyle} onClick={() => setShowTextModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '20px' }}>
              Add Text
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Text</label>
                <textarea 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter text..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Size</label>
                  <input 
                    type="number" 
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    min={8}
                    max={72}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Color</label>
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    style={{ ...inputStyle, height: '44px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setShowTextModal(false)}
                style={{ ...buttonStyle, backgroundColor: '#475569', color: '#e2e8f0' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddText}
                style={{ ...buttonStyle, backgroundColor: '#9333ea', color: '#ffffff' }}
              >
                Add Text
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
