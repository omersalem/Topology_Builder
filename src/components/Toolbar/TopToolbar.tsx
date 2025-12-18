import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTopology } from '../../context/TopologyContext';
import { useTheme } from '../../context/ThemeContext';
import { generateId } from '../../utils/geometry';
import type { Link, Shape } from '../../types/topology';

export default function TopToolbar() {
  const { theme, toggleTheme } = useTheme();
  const { topology, dispatch, setViewport, viewport, undo, redo, canUndo, canRedo } = useTopology();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showZoneMenu, setShowZoneMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link creation state
  const [linkFrom, setLinkFrom] = useState('');
  const [linkTo, setLinkTo] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkColor, setLinkColor] = useState('#22c55e');
  const [linkWidth, setLinkWidth] = useState(2);
  const [linkStyle, setLinkStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [linkArrowType, setLinkArrowType] = useState<'none' | 'end' | 'both'>('end');
  const [linkCount, setLinkCount] = useState(1);

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

    const dashPatterns: Record<string, number[]> = {
      solid: [],
      dashed: [10, 5],
      dotted: [3, 3],
    };

    // Create multiple links based on linkCount
    for (let i = 0; i < linkCount; i++) {
      // Calculate offset for multiple links (so they don't overlap)
      // Center the links around the middle
      const curveOffset = linkCount > 1
        ? (i - (linkCount - 1) / 2) * 25 // Spread links by 25px each
        : 0;

      const newLink: Link = {
        id: generateId('link'),
        from: { deviceId: linkFrom },
        to: { deviceId: linkTo },
        pathType: 'straight',
        label: linkLabel ? (linkCount > 1 ? `${linkLabel} ${i + 1}` : linkLabel) : undefined,
        style: {
          color: linkColor,
          width: linkWidth,
          dash: dashPatterns[linkStyle] || [],
          curveOffset: curveOffset, // Store offset for rendering
          arrowType: linkArrowType,
        },
      };
      dispatch({ type: 'ADD_LINK', payload: newLink });
    }

    setShowLinkModal(false);
    setLinkFrom('');
    setLinkTo('');
    setLinkLabel('');
    setLinkWidth(2);
    setLinkStyle('solid');
    setLinkArrowType('end');
    setLinkCount(1);
  };

  const handleAddZone = (shapeType: 'rectangle' | 'circle' | 'roundedRect') => {
    const newShape: Shape = {
      id: generateId('zone'),
      type: shapeType,
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      rotation: 0,
      style: {
        fill: 'rgba(59, 130, 246, 0.1)',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
      },
      cornerRadius: shapeType === 'roundedRect' ? 20 : undefined,
    };

    dispatch({ type: 'ADD_SHAPE', payload: newShape });
    setShowZoneMenu(false);
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
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '12px',
    padding: '24px',
    width: '400px',
    maxWidth: '90vw',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--border-color)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: 'var(--text-muted)',
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
    color: 'var(--text-muted)',
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
    color: 'var(--text-muted)',
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
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 50,
        transition: 'background-color 0.2s',
      }}>
        {/* Left section - Logo & File Operations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
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
            <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>
              NetTopo
            </span>
          </div>

          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{
              marginRight: '15px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-item-hover)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          {/* File Group */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button onClick={handleNew} style={{ ...toolbarBtnStyle, minWidth: '60px' }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            <button onClick={handleImport} style={{ ...toolbarBtnStyle, minWidth: '70px' }}>
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{ ...toolbarBtnStyle, minWidth: '75px' }}
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

          {/* History Group */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginLeft: '12px'
          }}>
            <button
              onClick={undo}
              disabled={!canUndo}
              style={{
                ...toolbarBtnStyle,
                opacity: canUndo ? 1 : 0.5,
                cursor: canUndo ? 'pointer' : 'not-allowed'
              }}
              title="Undo (Ctrl+Z)"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              style={{
                ...toolbarBtnStyle,
                opacity: canRedo ? 1 : 0.5,
                cursor: canRedo ? 'pointer' : 'not-allowed'
              }}
              title="Redo (Ctrl+Y)"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
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
            <button onClick={handleZoomOut} style={{ ...iconBtnStyle }}>
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
            <button onClick={handleZoomIn} style={{ ...iconBtnStyle }}>
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
            }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }} onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}>
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
            <button
              onClick={() => {
                dispatch({
                  type: 'UPDATE_CANVAS',
                  payload: { panMode: !topology.canvas.panMode },
                });
              }}
              style={{
                ...toolbarBtnStyle,
                background: topology.canvas.panMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                color: topology.canvas.panMode ? '#fff' : '#94a3b8',
                boxShadow: topology.canvas.panMode ? '0 2px 8px rgba(245,158,11,0.4)' : 'none',
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              Move
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
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.5)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(16, 185, 129, 0.35)' }}
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
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.5)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(139, 92, 246, 0.35)' }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Add Text
          </button>

          {/* Zone Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowZoneMenu(!showZoneMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.35)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.5)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(6, 182, 212, 0.35)' }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
              Add Zone
              <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showZoneMenu && (
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
                minWidth: '160px',
                zIndex: 100,
              }}>
                <button onClick={() => handleAddZone('rectangle')} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  textAlign: 'left',
                  color: '#cbd5e1',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }} onMouseOver={e => e.currentTarget.style.background = 'rgba(6,182,212,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                  </svg>
                  Rectangle
                </button>
                <button onClick={() => handleAddZone('roundedRect')} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  textAlign: 'left',
                  color: '#cbd5e1',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }} onMouseOver={e => e.currentTarget.style.background = 'rgba(6,182,212,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} />
                  </svg>
                  Rounded Rect
                </button>
                <button onClick={() => handleAddZone('circle')} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  textAlign: 'left',
                  color: '#cbd5e1',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }} onMouseOver={e => e.currentTarget.style.background = 'rgba(6,182,212,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" strokeWidth={2} />
                  </svg>
                  Circle
                </button>
              </div>
            )}
          </div>
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
                {/* Glassy Color Presets */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
                      onClick={() => setLinkColor(preset.color)}
                      title={preset.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: linkColor === preset.color ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                        background: `linear-gradient(135deg, ${preset.color} 0%, ${preset.color}88 100%)`,
                        cursor: 'pointer',
                        boxShadow: `0 2px 8px ${preset.color}66`,
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={linkColor}
                  onChange={(e) => setLinkColor(e.target.value)}
                  style={{ ...inputStyle, height: '36px', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Line Width (px)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={linkWidth}
                  onChange={(e) => setLinkWidth(Math.max(1, Math.min(20, Number(e.target.value))))}
                  style={inputStyle}
                  placeholder="1-20"
                />
              </div>

              <div>
                <label style={labelStyle}>Line Style</label>
                <select
                  value={linkStyle}
                  onChange={(e) => setLinkStyle(e.target.value as 'solid' | 'dashed' | 'dotted')}
                  style={inputStyle}
                >
                  <option value="solid">Solid ─────</option>
                  <option value="dashed">Dashed ─ ─ ─</option>
                  <option value="dotted">Dotted ·····</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Arrow Type</label>
                <select
                  value={linkArrowType}
                  onChange={(e) => setLinkArrowType(e.target.value as 'none' | 'end' | 'both')}
                  style={inputStyle}
                >
                  <option value="none">None ────</option>
                  <option value="end">End ────→</option>
                  <option value="both">Both ←──→</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Number of Links</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={linkCount}
                  onChange={(e) => setLinkCount(Math.max(1, Math.min(10, Number(e.target.value))))}
                  style={inputStyle}
                  placeholder="1-10"
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
