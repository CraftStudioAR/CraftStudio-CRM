import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Database, Check, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'id'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'kre7pjni';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  // Extract publicId if a full Cloudinary URL is pasted
  const cleanCloudinaryValue = (val: string) => {
    let cleanVal = val.trim();
    if (cleanVal.includes('res.cloudinary.com')) {
      const parts = cleanVal.split('/image/upload/');
      if (parts.length > 1) {
        // Remove transformations and get path after /upload/vXXXXXX/
        const afterUpload = parts[1];
        const pathParts = afterUpload.split('/');
        // Skip version folder (e.g. v12345678) if present
        if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
          cleanVal = pathParts.slice(1).join('/');
        } else {
          cleanVal = pathParts.join('/');
        }
        // Remove file extension
        const dotIndex = cleanVal.lastIndexOf('.');
        if (dotIndex !== -1) {
          cleanVal = cleanVal.substring(0, dotIndex);
        }
      }
    }
    return cleanVal;
  };

  const uploadToCloudinary = async (fileOrUrl: File | string) => {
    setLoading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', fileOrUrl);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.public_id) {
        onChange(data.public_id);
        setUploadSuccess(true);
        setUrlInput('');
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        console.error('Cloudinary upload error response:', data);
        setError(data.error?.message || 'Error al subir la imagen. Verifica que el Upload Preset sea correcto y no firmado.');
      }
    } catch (err: any) {
      console.error('Cloudinary upload connection error:', err);
      setError('Error de conexión con Cloudinary.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadToCloudinary(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadToCloudinary(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const cleaned = cleanCloudinaryValue(urlInput);
    if (urlInput.includes('res.cloudinary.com')) {
      // It's a Cloudinary URL, we can just extract the ID directly without re-uploading
      onChange(cleaned);
      setUploadSuccess(true);
      setUrlInput('');
      setTimeout(() => setUploadSuccess(false), 3000);
    } else {
      // It's a remote URL from elsewhere, upload it to Cloudinary
      uploadToCloudinary(urlInput.trim());
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const hasImage = Boolean(value);

  return (
    <div className={`space-y-3 p-4 bg-white border border-[#E8E3E1] rounded-2xl ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#000000] uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E8E3E1] text-[10px] uppercase font-bold tracking-wider text-[#666666] gap-4 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`pb-1 transition-all ${activeTab === 'upload' ? 'text-[#a52f18] border-b-2 border-[#a52f18]' : 'hover:text-[#000000]'}`}
        >
          Subir Archivo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`pb-1 transition-all ${activeTab === 'url' ? 'text-[#a52f18] border-b-2 border-[#a52f18]' : 'hover:text-[#000000]'}`}
        >
          Pegar Link
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('id')}
          className={`pb-1 transition-all ${activeTab === 'id' ? 'text-[#a52f18] border-b-2 border-[#a52f18]' : 'hover:text-[#000000]'}`}
        >
          ID Cloudinary
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-[11px] flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>¡Imagen cargada correctamente!</span>
        </div>
      )}

      {/* Tab Panels */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-2 rounded-xl">
            <Loader2 className="w-6 h-6 text-[#a52f18] animate-spin" />
            <p className="text-[10px] font-mono text-[#666666]">Subiendo a Cloudinary...</p>
          </div>
        )}

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${
              dragActive
                ? 'border-[#a52f18] bg-[#a52f18]/5 scale-[0.99]'
                : 'border-[#E8E3E1] bg-[#FEFAF9] hover:border-[#a52f18]/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Upload className="w-5 h-5 text-[#a52f18] mb-2" />
            <p className="text-xs font-medium text-[#000000]">Arrastrá tu imagen aquí o hacé clic</p>
            <p className="text-[10px] text-[#666666] mt-1">Soporta PNG, JPG, WEBP de forma directa</p>
          </div>
        )}

        {/* Tab 2: Remote URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Pegar link de imagen (e.g. https://...)"
              className="flex-1 bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2 text-xs text-[#000000] outline-none focus:border-[#a52f18]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-black hover:bg-[#a52f18] text-[#FEFAF9] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Importar
            </button>
          </form>
        )}

        {/* Tab 3: Direct ID */}
        {activeTab === 'id' && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(cleanCloudinaryValue(e.target.value))}
            placeholder="Ej: 8_am0iqp o pega el link completo..."
            className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] font-mono focus:border-[#a52f18] outline-none"
          />
        )}
      </div>

      {/* Image Preview & Current Value */}
      {hasImage && (
        <div className="flex items-center gap-3 p-2 bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl mt-2">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E8E3E1] bg-[#F5EFEF] flex-shrink-0">
            <img
              src={getImageUrl(value)}
              alt="Miniatura"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If it fails, show default thumbnail
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">Cloudinary ID activo</p>
            <p className="text-xs font-mono text-[#000000] truncate select-all">{value}</p>
          </div>
        </div>
      )}
    </div>
  );
};
