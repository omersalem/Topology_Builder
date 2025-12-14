import { useState, useMemo, type DragEvent } from 'react';
import { useTopology } from '../../context/TopologyContext';
import { builtInAssets, assetCategories } from '../../assets/builtInAssets';
import { generateId } from '../../utils/geometry';

export default function DevicePalette() {
  const { topology, dispatch } = useTopology();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Combine built-in and user assets
  const allAssets = useMemo(() => {
    return [...builtInAssets, ...topology.assets.filter((a: any) => a.type !== 'builtin')];
  }, [topology.assets]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allAssets, searchTerm, selectedCategory]);

  const handleAddToCanvas = (asset: any) => {
    const newDevice = {
      id: generateId('dev'),
      assetId: asset.id,
      type: asset.category || 'Device',
      label: asset.name,
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      width: asset.defaultWidth || 100,
      height: asset.defaultHeight || 100,
      rotation: 0,
      ports: [],
      style: { opacity: 1 },
    };
    dispatch({ type: 'ADD_DEVICE', payload: newDevice });
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, asset: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={{
      width: '280px',
      height: '100%',
      backgroundColor: '#1e293b',
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>📦 Device Palette</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 1, color: '#e2e8f0' }}>Click or drag to add devices</p>
      </div>

      {/* Search */}
      <div style={{ padding: '12px' }}>
        <input
          type="text"
          placeholder="🔍 Search devices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#334155',
            border: '1px solid #475569',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '0 12px 12px 12px',
        overflowX: 'auto',
        flexWrap: 'wrap'
      }}>
        {['All', ...assetCategories].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedCategory === category ? '#3b82f6' : '#475569',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Device Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        alignContent: 'start'
      }}>
        {filteredAssets.length === 0 ? (
          <div style={{
            gridColumn: 'span 2',
            textAlign: 'center',
            padding: '40px 0',
            color: '#64748b'
          }}>
            <p>No devices found</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => handleDragStart(e, asset)}
              onClick={() => handleAddToCanvas(asset)}
              style={{
                backgroundColor: '#334155',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'grab',
                border: '2px solid #475569',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.borderColor = '#60a5fa';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#334155';
                e.currentTarget.style.borderColor = '#475569';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                marginBottom: '6px',
              }}>
                <img
                  src={asset.src}
                  alt={asset.name}
                  draggable={false}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                />
              </div>
              <div style={{
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {asset.name}
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '10px',
                marginTop: '2px'
              }}>
                {asset.category}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #334155',
        backgroundColor: '#0f172a',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <span>{filteredAssets.length} devices</span>
        <span>{topology.devices.length} on canvas</span>
      </div>
    </div>
  );
}
