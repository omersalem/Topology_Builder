import { useState, type ChangeEvent } from 'react';
import { useTopology } from '../../context/TopologyContext';
import {
  imageToDataURL,
  removeBackground,
  compressImage,
  isValidImage,
  formatFileSize,
} from '../../utils/imageProcessing';
import { generateId } from '../../utils/geometry';
import type { Asset } from '../../types/topology';

interface AssetUploaderProps {
  onClose: () => void;
}

export default function AssetUploader({ onClose }: AssetUploaderProps) {
  const { dispatch } = useTopology();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('Custom');
  const [isProcessing, setIsProcessing] = useState(false);
  const [removeWhiteBackground, setRemoveWhiteBackground] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!isValidImage(selectedFile)) {
      alert('Please select a valid image file (PNG, JPG, GIF, SVG)');
      return;
    }

    setFile(selectedFile);
    setAssetName(selectedFile.name.replace(/\.[^/.]+$/, ''));

    try {
      const dataURL = await imageToDataURL(selectedFile);
      setPreview(dataURL);
      setProcessedImage(dataURL);
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('Failed to load image');
    }
  };

  const handleProcess = async () => {
    if (!preview) return;

    setIsProcessing(true);
    try {
      let processed = preview;

      // Remove background if requested
      if (removeWhiteBackground) {
        processed = await removeBackground(processed);
      }

      // Compress image
      processed = await compressImage(processed, 512, 512, 0.9);

      setProcessedImage(processed);
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!processedImage || !assetName) {
      alert('Please provide a name for the asset');
      return;
    }

    const newAsset: Asset = {
      id: generateId('asset'),
      name: assetName,
      type: 'png',
      src: processedImage,
      category,
      defaultWidth: 80,
      defaultHeight: 80,
    };

    dispatch({ type: 'ADD_ASSET', payload: newAsset });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Upload Device Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-600 file:text-white
                hover:file:bg-primary-700
                cursor-pointer"
            />
            {file && (
              <p className="text-xs text-gray-400 mt-2">
                {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Original</h3>
                  <div className="bg-gray-900 rounded p-4 flex items-center justify-center h-48">
                    <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Processed</h3>
                  <div className="bg-gray-900 rounded p-4 flex items-center justify-center h-48">
                    <img src={processedImage} alt="Processed" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              </div>

              {/* Processing Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={removeWhiteBackground}
                    onChange={(e) => setRemoveWhiteBackground(e.target.checked)}
                    className="rounded"
                  />
                  Remove white background
                </label>

                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Process Image'}
                </button>
              </div>

              {/* Asset Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., Cisco Router"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="Network">Network</option>
                    <option value="Security">Security</option>
                    <option value="Compute">Compute</option>
                    <option value="Storage">Storage</option>
                    <option value="External">External</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!processedImage || !assetName}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Palette
          </button>
        </div>
      </div>
    </div>
  );
}
