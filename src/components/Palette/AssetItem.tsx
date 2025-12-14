import { type DragEvent } from 'react';
import type { Asset } from '../../types/topology';
import { useTopology } from '../../context/TopologyContext';
import { generateId } from '../../utils/geometry';
import type { Device } from '../../types/topology';

interface AssetItemProps {
  asset: Asset;
}

export default function AssetItem({ asset }: AssetItemProps) {
  const { dispatch } = useTopology();

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    // Store asset data for drop
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = () => {
    // Add device to center of canvas
    const newDevice: Device = {
      id: generateId('dev'),
      assetId: asset.id,
      type: asset.category || 'Device',
      label: asset.name,
      x: 200,
      y: 200,
      width: asset.defaultWidth || 80,
      height: asset.defaultHeight || 80,
      rotation: 0,
      ports: [],
      style: { opacity: 1 },
    };

    dispatch({ type: 'ADD_DEVICE', payload: newDevice });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="rounded-xl p-3 cursor-pointer transition-all transform hover:scale-105 hover:shadow-2xl group"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.2) 100%)',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
      title="Click to add to canvas"
    >
      <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-2 flex items-center justify-center overflow-hidden p-2 group-hover:from-blue-900/50 group-hover:to-blue-800/50 transition-all">
        <img
          src={asset.src}
          alt={asset.name}
          className="max-w-full max-h-full object-contain drop-shadow-lg"
          draggable={false}
        />
      </div>
      <div className="text-white text-sm font-bold text-center truncate group-hover:text-cyan-300 transition-colors">
        {asset.name}
      </div>
      <div className="text-blue-300 text-xs text-center mt-1 font-medium">
        {asset.category || 'Custom'}
      </div>
    </div>
  );
}
