import { useState } from 'react';
import { useTopology } from '../../context/TopologyContext';
import { generateId } from '../../utils/geometry';
import type { Link } from '../../types/topology';

export default function LinkCreator() {
  const { topology, dispatch, selection } = useTopology();
  const [showModal, setShowModal] = useState(false);
  const [fromDevice, setFromDevice] = useState('');
  const [toDevice, setToDevice] = useState('');
  const [pathType, setPathType] = useState<'straight' | 'orthogonal' | 'bezier'>('straight');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#00a0ff');

  const handleCreateLink = () => {
    if (!fromDevice || !toDevice) {
      alert('Please select both devices');
      return;
    }

    if (fromDevice === toDevice) {
      alert('Cannot link a device to itself');
      return;
    }

    const newLink: Link = {
      id: generateId('link'),
      from: { deviceId: fromDevice },
      to: { deviceId: toDevice },
      pathType,
      label,
      style: {
        color,
        width: 3,
        dash: [],
      },
    };

    dispatch({ type: 'ADD_LINK', payload: newLink });
    setShowModal(false);
    setFromDevice('');
    setToDevice('');
    setLabel('');
  };

  // Quick link from selected device
  const createQuickLink = () => {
    if (selection.deviceIds.length !== 1) {
      setShowModal(true);
      return;
    }
    setFromDevice(selection.deviceIds[0]);
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={createQuickLink}
        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm transition-colors flex items-center gap-2"
        title="Create Link"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Add Link
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Create Link</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From Device</label>
                <select
                  value={fromDevice}
                  onChange={(e) => setFromDevice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Select device...</option>
                  {topology.devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To Device</label>
                <select
                  value={toDevice}
                  onChange={(e) => setToDevice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Select device...</option>
                  {topology.devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Path Type</label>
                <select
                  value={pathType}
                  onChange={(e) => setPathType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                >
                  <option value="straight">Straight</option>
                  <option value="orthogonal">Orthogonal</option>
                  <option value="bezier">Bezier</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Label (Optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., 10.0.0.0/24"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 bg-gray-700 rounded border border-gray-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
