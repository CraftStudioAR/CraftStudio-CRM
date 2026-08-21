import React, { useState } from 'react';
import {
  ProjectBlock,
  ProjectImage,
  Stat,
  AspectRatioOption,
  ColumnSplit,
  TextAlign,
} from '../types';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Image as ImageIcon,
  Grid,
  LayoutList,
  FileText,
  Tag,
  Quote,
  BarChart3,
  MessageSquare,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Move,
} from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';
import { ImageUploader } from './ImageUploader';
import { CustomSelect } from './CustomSelect';

interface BlockBuilderProps {
  blocks: ProjectBlock[];
  onChange: (blocks: ProjectBlock[]) => void;
}

// =========================================================
// MINI UI HELPERS
// =========================================================

const ToggleGroup = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
}) => (
  <div>
    <label className="block text-[11px] font-medium text-[#888] mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
            value === opt.value
              ? 'bg-[#a52f18] text-white border-[#a52f18] shadow-sm'
              : 'bg-white text-[#444] border-[#E8E3E1] hover:border-[#a52f18]/40 hover:bg-[#FEFAF9]'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const FieldInput = ({
  label,
  value,
  onChange,
  placeholder,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) => (
  <div>
    <label className="block text-[11px] font-medium text-[#888] mb-1 uppercase tracking-wide">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2 text-xs text-[#000] focus:border-[#a52f18] outline-none transition-colors ${
        mono ? 'font-mono' : ''
      }`}
    />
  </div>
);

const ImageInputGroup = ({
  label,
  image,
  onChange,
}: {
  label: string;
  image: ProjectImage;
  onChange: (img: ProjectImage) => void;
}) => (
  <div className="space-y-2">
    <ImageUploader
      value={image.publicId}
      onChange={(newId) => onChange({ ...image, publicId: newId })}
      label={label}
    />
    <input
      type="text"
      value={image.alt}
      onChange={(e) => onChange({ ...image, alt: e.target.value })}
      placeholder="Texto alternativo de la imagen (alt)..."
      className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2 text-xs text-[#000000] outline-none focus:border-[#a52f18]"
    />
  </div>
);

// Visual selectors
const ASPECT_OPTIONS: { value: AspectRatioOption; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16' },
];

const SPLIT_OPTIONS: { value: ColumnSplit; label: string }[] = [
  { value: '30/70', label: '30/70' },
  { value: '40/60', label: '40/60' },
  { value: '50/50', label: '50/50' },
  { value: '60/40', label: '60/40' },
  { value: '70/30', label: '70/30' },
  { value: '66/34', label: '66/34' },
  { value: '34/66', label: '34/66' },
];

const ALIGN_OPTIONS: { value: TextAlign; icon: React.ReactNode }[] = [
  { value: 'left', icon: <AlignLeft className="w-3.5 h-3.5" /> },
  { value: 'center', icon: <AlignCenter className="w-3.5 h-3.5" /> },
  { value: 'right', icon: <AlignRight className="w-3.5 h-3.5" /> },
];

// =========================================================
// SECTION DIVIDER
// =========================================================
const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 pt-1">
    <div className="h-px bg-[#E8E3E1] flex-1" />
    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa]">{label}</span>
    <div className="h-px bg-[#E8E3E1] flex-1" />
  </div>
);

// =========================================================
// MAIN BLOCK BUILDER
// =========================================================
export const BlockBuilder: React.FC<BlockBuilderProps> = ({ blocks, onChange }) => {
  const [activeEditingIndex, setActiveEditingIndex] = useState<number | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onChange(newBlocks);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    onChange(newBlocks);
  };

  const handleDelete = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
    if (activeEditingIndex === index) setActiveEditingIndex(null);
  };

  const handleDuplicate = (index: number) => {
    const newBlocks = [...blocks];
    const cloned = JSON.parse(JSON.stringify(newBlocks[index]));
    newBlocks.splice(index + 1, 0, cloned);
    onChange(newBlocks);
  };

  const handleAddBlock = (type: ProjectBlock['type']) => {
    let newBlock: ProjectBlock;
    switch (type) {
      case 'text':
        newBlock = {
          type: 'text',
          text: '',
          align: 'left',
        };
        break;
      case 'image':
        newBlock = { type: 'image', image: { publicId: '', alt: '' }, aspect: 'auto', size: 'full' };
        break;
      case 'imagePair':
        newBlock = {
          type: 'imagePair',
          mobileLayout: 'pair',
          split: '50/50',
          images: [
            { publicId: '', alt: 'Imagen 1' },
            { publicId: '', alt: 'Imagen 2' },
          ],
        };
        break;
      case 'imageFeature':
        newBlock = {
          type: 'imageFeature',
          mainSide: 'left',
          main: { publicId: '', alt: 'Imagen Principal' },
          stacked: [
            { publicId: '', alt: 'Imagen Secundaria 1' },
            { publicId: '', alt: 'Imagen Secundaria 2' },
          ],
        };
        break;
      case 'imageText':
        newBlock = {
          type: 'imageText',
          imagePosition: 'left',
          layout: '50/50',
          textAlign: 'left',
          heightFrom: 'image',
          image: { publicId: '', alt: '' },
          text: 'Describí la imagen o contá la historia detrás...',
        };
        break;
      case 'keywords':
        newBlock = { type: 'keywords', items: ['CONCEPTO', 'ESTRATEGIA', 'DISEÑO'], align: 'center', style: 'outline' };
        break;
      case 'quote':
        newBlock = {
          type: 'quote',
          image: { publicId: '', alt: '' },
          quote: 'Una frase que defina el espíritu del proyecto...',
          textColor: 'light',
          textAlign: 'center',
        };
        break;
      case 'stats':
        newBlock = {
          type: 'stats',
          title: 'Resultados',
          items: [
            { value: 100, prefix: '+', suffix: '%', label: 'Alcance orgánico' },
            { value: 50, suffix: 'K', label: 'Interacciones' },
          ],
          highlight: { value: 250, prefix: '+', suffix: '%', label: 'Crecimiento total' },
        };
        break;
      case 'testimonial':
        newBlock = {
          type: 'testimonial',
          quote: 'Craft Studio superó todas nuestras expectativas...',
          author: 'Nombre del Cliente',
          role: 'Puesto / Empresa',
        };
        break;
    }
    const updated = [...blocks, newBlock!];
    onChange(updated);
    setActiveEditingIndex(updated.length - 1);
  };

  const handleUpdateBlock = (index: number, updatedBlock: ProjectBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#000000]">Bloques de Contenido</h3>
          <p className="text-xs text-[#666666]">Construí el cuerpo del proyecto con imágenes, textos y diseño libre</p>
        </div>
        <span className="text-xs font-mono text-[#000000] bg-[#FEFAF9] px-2.5 py-1 rounded-lg border border-[#E8E3E1]">
          {blocks.length} {blocks.length === 1 ? 'bloque' : 'bloques'}
        </span>
      </div>

      {/* Block list */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="border border-dashed border-[#E8E3E1] rounded-2xl p-8 text-center bg-[#FEFAF9]">
            <LayoutList className="w-8 h-8 text-[#a52f18] mx-auto mb-2 opacity-60" />
            <p className="text-sm text-[#000000] font-medium">Aún no hay bloques</p>
            <p className="text-xs text-[#666666] mt-1 max-w-md mx-auto">
              Seleccioná un tipo de bloque abajo para comenzar a construir el proyecto.
            </p>
          </div>
        ) : (
          blocks.map((block, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                activeEditingIndex === idx
                  ? 'bg-white border-[#a52f18] shadow-md'
                  : 'bg-white border-[#E8E3E1] hover:border-[#a52f18]/40'
              }`}
            >
              {/* Block header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#FEFAF9] border-b border-[#E8E3E1]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#aaa]">#{idx + 1}</span>
                  <BlockTypeBadge type={block.type} />
                  <BlockLayoutSummary block={block} />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 text-[#666666] hover:text-[#000000] hover:bg-[#F5EFEF] rounded disabled:opacity-30"
                    title="Mover arriba"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === blocks.length - 1}
                    className="p-1.5 text-[#666666] hover:text-[#000000] hover:bg-[#F5EFEF] rounded disabled:opacity-30"
                    title="Mover abajo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(idx)}
                    className="p-1.5 text-[#666666] hover:text-[#000000] hover:bg-[#F5EFEF] rounded"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEditingIndex(activeEditingIndex === idx ? null : idx)}
                    className="px-2.5 py-1 text-xs text-[#000000] hover:bg-[#F5EFEF] bg-white rounded-lg border border-[#E8E3E1] ml-1 font-medium shadow-sm"
                  >
                    {activeEditingIndex === idx ? 'Cerrar' : 'Editar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded ml-1"
                    title="Eliminar bloque"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsed preview */}
              {activeEditingIndex !== idx && (
                <div className="px-4 py-3 flex items-center gap-4 text-xs text-[#666666]">
                  <BlockSummaryPreview block={block} />
                </div>
              )}

              {/* Editing form */}
              {activeEditingIndex === idx && (
                <div className="p-5 bg-white space-y-5">
                  <BlockEditorForm
                    block={block}
                    onChange={(updated) => handleUpdateBlock(idx, updated)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add block palette */}
      <div className="pt-2">
        <p className="text-xs text-[#666666] mb-2.5 font-medium">Añadir bloque:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <AddBlockButton icon={AlignLeft} label="Texto Solo" sub="Párrafo normal" onClick={() => handleAddBlock('text')} />
          <AddBlockButton icon={ImageIcon} label="Imagen Única" sub="Full width" onClick={() => handleAddBlock('image')} />
          <AddBlockButton icon={Grid} label="Par de Imágenes" sub="Díptico" onClick={() => handleAddBlock('imagePair')} />
          <AddBlockButton icon={LayoutList} label="Feature (1+2)" sub="Grande + apiladas" onClick={() => handleAddBlock('imageFeature')} />
          <AddBlockButton icon={FileText} label="Imagen + Texto" sub="Columnas libres" onClick={() => handleAddBlock('imageText')} />
          <AddBlockButton icon={Tag} label="Palabras Clave" sub="Tags" onClick={() => handleAddBlock('keywords')} />
          <AddBlockButton icon={Quote} label="Cita Visual" sub="Con fondo" onClick={() => handleAddBlock('quote')} />
          <AddBlockButton icon={BarChart3} label="Métricas" sub="Stats" onClick={() => handleAddBlock('stats')} />
          <AddBlockButton icon={MessageSquare} label="Testimonio" sub="Cliente" onClick={() => handleAddBlock('testimonial')} />
        </div>
      </div>
    </div>
  );
};

// =========================================================
// LAYOUT SUMMARY BADGE (inline in header)
// =========================================================
const BlockLayoutSummary: React.FC<{ block: ProjectBlock }> = ({ block }) => {
  const parts: string[] = [];
  if (block.type === 'image') {
    if (block.aspect && block.aspect !== 'auto') parts.push(block.aspect);
    if (block.size === 'contained') parts.push('Contenida');
  }
  if (block.type === 'imagePair') {
    if (block.split) parts.push(block.split);
  }
  if (block.type === 'imageFeature') {
    if (block.mainSide) parts.push(`Principal ${block.mainSide === 'left' ? '←' : '→'}`);
  }
  if (block.type === 'imageText') {
    if (block.imagePosition) parts.push(`Img ${block.imagePosition === 'left' ? '←' : '→'}`);
    if (block.layout) parts.push(block.layout);
  }
  if (parts.length === 0) return null;
  return (
    <span className="text-[10px] text-[#888] font-mono bg-[#E8E3E1] px-1.5 py-0.5 rounded">
      {parts.join(' · ')}
    </span>
  );
};

// =========================================================
// BLOCK TYPE BADGE
// =========================================================
const BlockTypeBadge: React.FC<{ type: ProjectBlock['type'] }> = ({ type }) => {
  const configs: Record<ProjectBlock['type'], { label: string; color: string; icon: any }> = {
    text: { label: 'Texto Solo', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: AlignLeft },
    image: { label: 'Imagen', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: ImageIcon },
    imagePair: { label: 'Díptico', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Grid },
    imageFeature: { label: 'Feature (1+2)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: LayoutList },
    imageText: { label: 'Imagen + Texto', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FileText },
    keywords: { label: 'Keywords', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Tag },
    quote: { label: 'Cita Visual', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: Quote },
    stats: { label: 'Métricas', color: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: BarChart3 },
    testimonial: { label: 'Testimonio', color: 'bg-[#a52f18]/10 text-[#a52f18] border-[#a52f18]/20', icon: MessageSquare },
  };

  const config = configs[type] || { label: type, color: 'bg-gray-50 text-gray-700 border-gray-200', icon: LayoutList };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// =========================================================
// ADD BLOCK BUTTON
// =========================================================
const AddBlockButton: React.FC<{
  icon: any;
  label: string;
  sub: string;
  onClick: () => void;
}> = ({ icon: Icon, label, sub, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-start p-3 rounded-xl bg-white border border-[#E8E3E1] hover:border-[#a52f18] hover:bg-[#FEFAF9] text-[#000000] transition-all shadow-sm group"
  >
    <Icon className="w-4 h-4 text-[#a52f18] mb-1.5 group-hover:scale-110 transition-transform" />
    <span className="text-xs font-medium leading-tight">{label}</span>
    <span className="text-[10px] text-[#999] mt-0.5">{sub}</span>
  </button>
);

// =========================================================
// COLLAPSED SUMMARY PREVIEW
// =========================================================
const BlockSummaryPreview: React.FC<{ block: ProjectBlock }> = ({ block }) => {
  const imgThumb = (publicId: string, alt: string) => (
    <img
      src={getImageUrl(publicId)}
      alt={alt}
      className="w-9 h-9 object-cover rounded-lg bg-[#FEFAF9] border border-[#E8E3E1] flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );

  switch (block.type) {
    case 'text':
      return (
        <div className="flex items-center gap-2 text-[#666666] truncate max-w-lg">
          <AlignLeft className="w-4 h-4 text-[#a52f18] shrink-0" />
          <span className="truncate italic">"{block.text || '(Sin texto)'}"</span>
        </div>
      );
    case 'image':
      return (
        <div className="flex items-center gap-3">
          {imgThumb(block.image.publicId, block.image.alt)}
          <div className="truncate">
            <p className="font-mono text-[#000000] text-xs truncate">{block.image.publicId || '(Sin ID)'}</p>
            <p className="text-[#666666] text-[11px]">{block.aspect || 'auto'} · {block.size || 'full'}</p>
          </div>
        </div>
      );
    case 'imagePair':
      return (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {block.images.map((img, i) => imgThumb(img?.publicId, `Img ${i + 1}`))}
          </div>
          <span className="text-xs text-[#000000]">
            {block.images.length} imágenes · {block.mobileLayout === 'stack' ? 'Apiladas en mobile' : 'Fila en mobile'}
          </span>
        </div>
      );
    case 'imageFeature':
      return (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {imgThumb(block.main?.publicId, 'Principal')}
            {imgThumb(block.stacked?.[0]?.publicId, 'Stacked 1')}
          </div>
          <span className="text-xs text-[#000000]">
            Principal {block.mainSide === 'right' ? '→ derecha' : '← izquierda'}
          </span>
        </div>
      );
    case 'imageText':
      return (
        <div className="flex items-center gap-3">
          {imgThumb(block.image.publicId, block.image.alt)}
          <div className="truncate">
            <p className="text-[#000000] text-xs font-medium">
              Img {block.imagePosition === 'right' ? '→' : '←'} · {block.layout || '50/50'}
            </p>
            <p className="text-[#666666] text-[11px] truncate italic">"{block.text}"</p>
          </div>
        </div>
      );
    case 'keywords':
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {block.items.map((kw, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-[#FEFAF9] text-[#000000] text-[11px] font-mono border border-[#E8E3E1]">
              {kw}
            </span>
          ))}
        </div>
      );
    case 'stats':
      return (
        <div className="flex items-center gap-2">
          <span className="text-[#000000] font-medium text-xs">{block.title || 'Métricas'}</span>
          <span className="text-[#666666] text-[11px]">({block.items.length} ítems)</span>
        </div>
      );
    case 'quote':
      return <p className="text-[#000000] font-serif italic truncate text-xs">"{block.quote}"</p>;
    case 'testimonial':
      return (
        <p className="text-[#000000] text-xs truncate">
          "{block.quote}" — <strong>{block.author}</strong>
        </p>
      );
    default:
      return <span className="text-xs text-[#666]">Bloque de contenido</span>;
  }
};
const SIZE_PRESETS = [
  { value: 'text-xs', label: 'XS' },
  { value: 'text-sm', label: 'SM' },
  { value: 'text-base', label: 'Base' },
  { value: 'text-lg', label: 'LG' },
  { value: 'text-xl', label: 'XL' },
  { value: 'text-2xl', label: '2XL' },
  { value: 'text-3xl', label: '3XL' },
  { value: 'text-4xl', label: '4XL' },
  { value: 'text-5xl', label: '5XL' },
  { value: 'text-6xl', label: '6XL' },
  { value: 'text-7xl', label: '7XL' },
  { value: 'text-8xl', label: '8XL' },
  { value: 'text-9xl', label: '9XL' },
  { value: '10rem', label: '10rem' },
];

const SizeInputWithPresets: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ej: text-2xl o 8.5rem"
          className="flex-1 h-[34px] bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 text-xs text-[#000000] font-sans font-medium outline-none focus:border-[#a52f18]/30 transition-all"
        />
        <div className="w-[110px]">
          <CustomSelect
            value={SIZE_PRESETS.some(p => p.value === value) ? value : ''}
            onChange={(val) => {
              if (val) onChange(val);
            }}
            options={[
              { value: '', label: 'Presets...' },
              ...SIZE_PRESETS
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// =========================================================
// BLOCK EDITOR FORM
// =========================================================
const BlockEditorForm: React.FC<{
  block: ProjectBlock;
  onChange: (block: ProjectBlock) => void;
}> = ({ block, onChange }) => {
  switch (block.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#888] mb-1.5 uppercase tracking-wide">
              Contenido del Párrafo (Soporta saltos de línea)
            </label>
            <textarea
              rows={6}
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Escribí el cuerpo del texto aquí..."
              className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] outline-none font-serif text-sm leading-relaxed resize-y"
            />
          </div>
          
          <SectionDivider label="Diseño & Formato" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5EFEF]/40 border border-[#E8E3E1] rounded-2xl p-4">
            {/* Aspectos de texto: Negrita, Cursiva, Familia de Fuente, Caja */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Formato de Texto</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={block.bold || false}
                    onChange={(e) => onChange({ ...block, bold: e.target.checked })}
                    className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                  />
                  Negrita (Bold)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={block.italic || false}
                    onChange={(e) => onChange({ ...block, italic: e.target.checked })}
                    className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                  />
                  Itálica (Italic)
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Estructura</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={block.fontFamily === 'sans'}
                    onChange={(e) => onChange({ ...block, fontFamily: e.target.checked ? 'sans' : 'serif' })}
                    className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                  />
                  Fuente Sans (p. ej. Instrument Sans)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={block.hasContainer || false}
                    onChange={(e) => onChange({ ...block, hasContainer: e.target.checked })}
                    className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                  />
                  Con Contenedor (Caja Gris)
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <ToggleGroup
              label="Alineación"
              value={block.align || 'left'}
              options={[
                { value: 'left', label: 'Izquierda', icon: <AlignLeft className="w-3 h-3" /> },
                { value: 'center', label: 'Centro', icon: <AlignCenter className="w-3 h-3" /> },
                { value: 'right', label: 'Derecha', icon: <AlignRight className="w-3 h-3" /> },
              ]}
              onChange={(v) => onChange({ ...block, align: v as any })}
            />

            <CustomSelect
              label="Ancho del Bloque"
              value={block.widthMode || 'standard'}
              options={[
                { value: 'standard', label: 'Centrado (max-w-3xl)' },
                { value: 'full', label: 'Ancho Completo (w-full)' },
                { value: 'auto', label: 'Auto (Ajustado al texto)' },
              ]}
              onChange={(v) => onChange({ ...block, widthMode: v as any })}
            />

            <CustomSelect
              label="Interletrado (Tracking)"
              value={block.tracking || 'tracking-normal'}
              options={[
                { value: 'tracking-tighter', label: 'Muy Ajustado' },
                { value: 'tracking-tight', label: 'Ajustado' },
                { value: 'tracking-normal', label: 'Normal' },
                { value: 'tracking-wide', label: 'Ancho' },
                { value: 'tracking-wider', label: 'Más Ancho' },
                { value: 'tracking-widest', label: 'Expandido' },
              ]}
              onChange={(v) => onChange({ ...block, tracking: v })}
            />

            <CustomSelect
              label="Interlineado (Leading)"
              value={block.leading || 'leading-relaxed'}
              options={[
                { value: 'leading-none', label: 'Ninguno (1.0)' },
                { value: 'leading-tight', label: 'Ajustado (1.25)' },
                { value: 'leading-snug', label: 'Cómodo (1.375)' },
                { value: 'leading-normal', label: 'Normal (1.5)' },
                { value: 'leading-relaxed', label: 'Relajado (1.625)' },
                { value: 'leading-loose', label: 'Suelto (2.0)' },
              ]}
              onChange={(v) => onChange({ ...block, leading: v })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E8E3E1] pt-4">
            <SizeInputWithPresets
              label="Tamaño Mobile"
              value={block.sizeMobile || 'text-lg'}
              onChange={(v) => onChange({ ...block, sizeMobile: v })}
            />

            <SizeInputWithPresets
              label="Tamaño Tablet"
              value={block.sizeTablet || 'text-xl'}
              onChange={(v) => onChange({ ...block, sizeTablet: v })}
            />

            <SizeInputWithPresets
              label="Tamaño Desktop"
              value={block.sizeDesktop || 'text-2xl'}
              onChange={(v) => onChange({ ...block, sizeDesktop: v })}
            />
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-4">
          <ImageInputGroup
            label="Imagen"
            image={block.image}
            onChange={(img) => onChange({ ...block, image: img })}
          />
          <SectionDivider label="Diseño" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleGroup
              label="Proporción / Aspecto"
              value={block.aspect || 'auto'}
              options={ASPECT_OPTIONS}
              onChange={(v) => onChange({ ...block, aspect: v })}
            />
            <ToggleGroup
              label="Ancho"
              value={block.size || 'full'}
              options={[
                { value: 'full', label: 'Full width' },
                { value: 'contained', label: 'Contenida' },
              ]}
              onChange={(v) => onChange({ ...block, size: v as 'full' | 'contained' })}
            />
          </div>
        </div>
      );

    case 'imagePair': {
      const imagesCount = block.images?.length || 2;
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ToggleGroup
              label="Cantidad de imágenes"
              value={String(imagesCount)}
              options={[
                { value: '2', label: '2 imágenes' },
                { value: '3', label: '3 imágenes' },
                { value: '4', label: '4 imágenes' },
              ]}
              onChange={(v) => {
                const newCount = parseInt(v);
                const currentImages = [...(block.images || [])];
                if (currentImages.length < newCount) {
                  while (currentImages.length < newCount) {
                    currentImages.push({ publicId: '', alt: '' });
                  }
                } else if (currentImages.length > newCount) {
                  currentImages.splice(newCount);
                }
                onChange({ ...block, images: currentImages });
              }}
            />
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-${imagesCount} gap-3`}>
            {block.images.map((img, i) => (
              <ImageInputGroup
                key={i}
                label={i === 0 ? 'Imagen Izquierda' : i === 1 ? 'Imagen Derecha' : `Imagen ${i + 1}`}
                image={img}
                onChange={(newImg) => {
                  const imgs = [...block.images];
                  imgs[i] = newImg;
                  onChange({ ...block, images: imgs });
                }}
              />
            ))}
          </div>
          <SectionDivider label="Diseño" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToggleGroup
              label="Proporción de columnas"
              value={block.split || '50/50'}
              options={SPLIT_OPTIONS}
              onChange={(v) => onChange({ ...block, split: v })}
            />
            <ToggleGroup
              label="Aspecto de imágenes"
              value={block.aspect || 'auto'}
              options={ASPECT_OPTIONS}
              onChange={(v) => onChange({ ...block, aspect: v })}
            />
            <ToggleGroup
              label="Mobile"
              value={block.mobileLayout || 'pair'}
              options={[
                { value: 'pair', label: 'En fila' },
                { value: 'stack', label: 'Apiladas' },
              ]}
              onChange={(v) => onChange({ ...block, mobileLayout: v as 'pair' | 'stack' })}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#444] cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={Boolean(block.matchHeight)}
              onChange={(e) => onChange({ ...block, matchHeight: e.target.checked })}
              className="rounded border-[#E8E3E1] accent-[#a52f18]"
            />
            Igualar altura de ambas imágenes (matchHeight)
          </label>
        </div>
      );
    }

    case 'imageFeature':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ImageInputGroup
              label="Imagen Principal (grande)"
              image={block.main}
              onChange={(img) => onChange({ ...block, main: img })}
            />
            <ImageInputGroup
              label="Apilada Superior"
              image={block.stacked[0]}
              onChange={(img) => {
                const stacked = [...block.stacked] as [ProjectImage, ProjectImage];
                stacked[0] = img;
                onChange({ ...block, stacked });
              }}
            />
            <ImageInputGroup
              label="Apilada Inferior"
              image={block.stacked[1]}
              onChange={(img) => {
                const stacked = [...block.stacked] as [ProjectImage, ProjectImage];
                stacked[1] = img;
                onChange({ ...block, stacked });
              }}
            />
          </div>
          <SectionDivider label="Diseño" />
          <ToggleGroup
            label="Posición de la imagen principal"
            value={block.mainSide || 'left'}
            options={[
              { value: 'left', label: '← Izquierda' },
              { value: 'right', label: '→ Derecha' },
            ]}
            onChange={(v) => onChange({ ...block, mainSide: v as 'left' | 'right' })}
          />
        </div>
      );

    case 'imageText':
      return (
        <div className="space-y-4">
          <ImageInputGroup
            label="Imagen"
            image={block.image}
            onChange={(img) => onChange({ ...block, image: img })}
          />
          <div>
            <label className="block text-[11px] font-medium text-[#888] mb-1 uppercase tracking-wide">
              Texto descriptivo
            </label>
            <textarea
              rows={4}
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Desarrollá la historia o descripción de esta imagen..."
              className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] outline-none resize-y focus:border-[#a52f18] transition-colors"
            />
          </div>

          <SectionDivider label="Orden y Posición" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleGroup
              label="Posición de la imagen (Desktop)"
              value={block.imagePosition || 'left'}
              options={[
                { value: 'left', label: '← Izquierda' },
                { value: 'right', label: '→ Derecha' },
              ]}
              onChange={(v) => onChange({ ...block, imagePosition: v as 'left' | 'right' })}
            />
            <ToggleGroup
              label="Orden al apilar (Mobile / Tablet)"
              value={block.mobileOrder || 'imageFirst'}
              options={[
                { value: 'imageFirst', label: 'Imagen primero' },
                { value: 'textFirst', label: 'Texto primero' },
              ]}
              onChange={(v) => onChange({ ...block, mobileOrder: v as 'imageFirst' | 'textFirst' })}
            />
          </div>

          <SectionDivider label="Layout y Proporciones" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ToggleGroup
              label="Proporción img / texto (Desktop)"
              value={block.layout || '50/50'}
              options={SPLIT_OPTIONS}
              onChange={(v) => onChange({ ...block, layout: v })}
            />
            <ToggleGroup
              label="Altura del bloque determinada por"
              value={block.heightFrom || 'image'}
              options={[
                { value: 'image', label: 'Imagen' },
                { value: 'text', label: 'Texto' },
              ]}
              onChange={(v) => onChange({ ...block, heightFrom: v as 'text' | 'image' })}
            />
          </div>

          <SectionDivider label="Formato y Estilo de Texto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5EFEF]/40 border border-[#E8E3E1] rounded-2xl p-4">
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Formato de Texto</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={block.bold || false}
                    onChange={(e) => onChange({ ...block, bold: e.target.checked })}
                    className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                  />
                  Negrita (Bold)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={block.italic || false}
                    onChange={(e) => onChange({ ...block, italic: e.target.checked })}
                    className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                  />
                  Itálica (Italic)
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Familia de Fuente</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    checked={block.fontFamily === 'sans'}
                    onChange={(e) => onChange({ ...block, fontFamily: e.target.checked ? 'sans' : 'serif' })}
                    className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                  />
                  Fuente Sans (p. ej. Instrument Sans)
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToggleGroup
              label="Alineación"
              value={block.textAlign || 'left'}
              options={[
                { value: 'left', label: 'Izquierda', icon: <AlignLeft className="w-3 h-3" /> },
                { value: 'center', label: 'Centro', icon: <AlignCenter className="w-3 h-3" /> },
                { value: 'right', label: 'Derecha', icon: <AlignRight className="w-3 h-3" /> },
              ]}
              onChange={(v) => onChange({ ...block, textAlign: v as any })}
            />

            <CustomSelect
              label="Interletrado (Tracking)"
              value={block.tracking || 'tracking-normal'}
              options={[
                { value: 'tracking-tighter', label: 'Muy Ajustado' },
                { value: 'tracking-tight', label: 'Ajustado' },
                { value: 'tracking-normal', label: 'Normal' },
                { value: 'tracking-wide', label: 'Ancho' },
                { value: 'tracking-wider', label: 'Más Ancho' },
                { value: 'tracking-widest', label: 'Expandido' },
              ]}
              onChange={(v) => onChange({ ...block, tracking: v })}
            />

            <CustomSelect
              label="Interlineado (Leading)"
              value={block.leading || 'leading-relaxed'}
              options={[
                { value: 'leading-none', label: 'Ninguno (1.0)' },
                { value: 'leading-tight', label: 'Ajustado (1.25)' },
                { value: 'leading-snug', label: 'Cómodo (1.375)' },
                { value: 'leading-normal', label: 'Normal (1.5)' },
                { value: 'leading-relaxed', label: 'Relajado (1.625)' },
                { value: 'leading-loose', label: 'Suelto (2.0)' },
              ]}
              onChange={(v) => onChange({ ...block, leading: v })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E8E3E1] pt-4">
            <SizeInputWithPresets
              label="Tamaño Mobile"
              value={block.sizeMobile || 'text-sm'}
              onChange={(v) => onChange({ ...block, sizeMobile: v })}
            />

            <SizeInputWithPresets
              label="Tamaño Tablet"
              value={block.sizeTablet || 'text-base'}
              onChange={(v) => onChange({ ...block, sizeTablet: v })}
            />

            <SizeInputWithPresets
              label="Tamaño Desktop"
              value={block.sizeDesktop || 'text-base'}
              onChange={(v) => onChange({ ...block, sizeDesktop: v })}
            />
          </div>
        </div>
      );

    case 'keywords':
      return (
        <div className="space-y-4">
          <FieldInput
            label="Palabras clave (separadas por coma)"
            value={block.items.join(', ')}
            onChange={(v) =>
              onChange({ ...block, items: v.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="LIBERTAD, MUNDO INTERIOR, ESPERANZA"
            mono
          />
          <SectionDivider label="Diseño" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleGroup
              label="Alineación"
              value={block.align || 'center'}
              options={[
                { value: 'left', label: 'Izquierda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Derecha' },
              ]}
              onChange={(v) => onChange({ ...block, align: v as TextAlign })}
            />
            <ToggleGroup
              label="Estilo de tags"
              value={block.style || 'outline'}
              options={[
                { value: 'filled', label: 'Rellenos' },
                { value: 'outline', label: 'Contorno' },
                { value: 'minimal', label: 'Mínimo' },
              ]}
              onChange={(v) => onChange({ ...block, style: v as 'filled' | 'outline' | 'minimal' })}
            />
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-4">
          <ImageInputGroup
            label="Imagen de fondo"
            image={block.image}
            onChange={(img) => onChange({ ...block, image: img })}
          />
          <div>
            <label className="block text-[11px] font-medium text-[#888] mb-1 uppercase tracking-wide">
              Frase / Cita destacada
            </label>
            <textarea
              rows={2}
              value={block.quote}
              onChange={(e) => onChange({ ...block, quote: e.target.value })}
              placeholder="Hope is the thing with feathers..."
              className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2 text-sm text-[#000000] font-serif italic outline-none focus:border-[#a52f18]"
            />
          </div>
          <SectionDivider label="Diseño" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleGroup
              label="Color del texto"
              value={block.textColor || 'light'}
              options={[
                { value: 'light', label: 'Claro (blanco)' },
                { value: 'dark', label: 'Oscuro (negro)' },
              ]}
              onChange={(v) => onChange({ ...block, textColor: v as 'light' | 'dark' })}
            />
            <ToggleGroup
              label="Alineación del texto"
              value={block.textAlign || 'center'}
              options={[
                { value: 'left', label: 'Izquierda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Derecha' },
              ]}
              onChange={(v) => onChange({ ...block, textAlign: v as TextAlign })}
            />
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className="space-y-4">
          <FieldInput
            label="Título de la sección"
            value={block.title || ''}
            onChange={(v) => onChange({ ...block, title: v })}
            placeholder="ej: Resultados Instagram 2024"
          />

          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-[#888] uppercase tracking-wide">
              Métricas ({block.items.length})
            </label>
            {block.items.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#FEFAF9] p-2.5 rounded-xl border border-[#E8E3E1]">
                <input
                  type="text"
                  placeholder="+, x"
                  value={stat.prefix || ''}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = { ...items[idx], prefix: e.target.value };
                    onChange({ ...block, items });
                  }}
                  className="w-12 bg-white border border-[#E8E3E1] rounded-lg px-2 py-1.5 text-xs text-[#000] text-center"
                />
                <input
                  type="number"
                  placeholder="Valor"
                  value={stat.value}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = { ...items[idx], value: parseFloat(e.target.value) || 0 };
                    onChange({ ...block, items });
                  }}
                  className="w-20 bg-white border border-[#E8E3E1] rounded-lg px-2 py-1.5 text-xs text-[#000]"
                />
                <input
                  type="text"
                  placeholder="%, M, K"
                  value={stat.suffix || ''}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = { ...items[idx], suffix: e.target.value };
                    onChange({ ...block, items });
                  }}
                  className="w-16 bg-white border border-[#E8E3E1] rounded-lg px-2 py-1.5 text-xs text-[#000]"
                />
                <input
                  type="text"
                  placeholder="Etiqueta / descripción"
                  value={stat.label}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = { ...items[idx], label: e.target.value };
                    onChange({ ...block, items });
                  }}
                  className="flex-1 bg-white border border-[#E8E3E1] rounded-lg px-2 py-1.5 text-xs text-[#000]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const items = block.items.filter((_, i) => i !== idx);
                    onChange({ ...block, items });
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const items = [...block.items, { value: 0, label: 'Nueva métrica' }];
                onChange({ ...block, items });
              }}
              className="px-3 py-1.5 text-xs bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl border border-[#E8E3E1] font-medium transition-colors"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Añadir métrica
            </button>
          </div>

          {/* Highlight stat */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <label className="block text-[11px] font-semibold text-amber-700 mb-2 uppercase tracking-wide">
              Métrica Destacada (opcional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Prefijo"
                value={block.highlight?.prefix || ''}
                onChange={(e) => onChange({ ...block, highlight: { ...(block.highlight || { value: 0, label: '' }), prefix: e.target.value } })}
                className="w-12 bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                placeholder="Valor"
                value={block.highlight?.value || 0}
                onChange={(e) => onChange({ ...block, highlight: { ...(block.highlight || { label: '' }), value: parseFloat(e.target.value) || 0 } })}
                className="w-20 bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-xs"
              />
              <input
                type="text"
                placeholder="Sufijo"
                value={block.highlight?.suffix || ''}
                onChange={(e) => onChange({ ...block, highlight: { ...(block.highlight || { value: 0, label: '' }), suffix: e.target.value } })}
                className="w-16 bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-xs"
              />
              <input
                type="text"
                placeholder="Etiqueta"
                value={block.highlight?.label || ''}
                onChange={(e) => onChange({ ...block, highlight: { ...(block.highlight || { value: 0 }), label: e.target.value } })}
                className="flex-1 bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>
      );

    case 'testimonial':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#888] mb-1 uppercase tracking-wide">
              Cita del testimonio
            </label>
            <textarea
              rows={3}
              value={block.quote}
              onChange={(e) => onChange({ ...block, quote: e.target.value })}
              placeholder="Craft Studio superó todas nuestras expectativas..."
              className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2 text-xs text-[#000000] outline-none resize-y focus:border-[#a52f18]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldInput
              label="Autor / Cliente"
              value={block.author}
              onChange={(v) => onChange({ ...block, author: v })}
              placeholder="Nombre del cliente"
            />
            <FieldInput
              label="Rol / Empresa"
              value={block.role}
              onChange={(v) => onChange({ ...block, role: v })}
              placeholder="CEO / Empresa"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};
