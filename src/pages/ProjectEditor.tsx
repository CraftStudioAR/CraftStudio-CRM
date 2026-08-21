import React, { useState, useEffect } from 'react';
import { WorkCase, ProjectBlock } from '../types';
import { BlockBuilder } from '../components/BlockBuilder';
import { ProjectPreview, CoverCardPreview } from '../components/ProjectPreview';
import { ImageUploader } from '../components/ImageUploader';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit, 
  FolderOpen, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';


interface ProjectEditorProps {
  initialProject?: WorkCase | null;
  onSave: (project: WorkCase) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  initialProject,
  onSave,
  onBack,
}) => {
  const [formData, setFormData] = useState<WorkCase>({
    slug: '',
    client: '',
    title: '',
    category: 'Shift Program',
    year: '2025',
    summary: '',
    scope: [],
    cover: { publicId: '', alt: '' },
    blocks: [],
    titleStyle: {
      bold: false,
      italic: true,
      sizeDesktop: 'text-[9rem]',
      sizeTablet: 'text-8xl',
      sizeMobile: 'text-6xl',
      tracking: 'tracking-tight',
      leading: 'leading-[0.95]'
    }
  });

  const [newScopeTag, setNewScopeTag] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialProject) {
      const data = JSON.parse(JSON.stringify(initialProject));
      if (!data.titleStyle) {
        data.titleStyle = {
          bold: false,
          italic: true,
          sizeDesktop: 'text-[9rem]',
          sizeTablet: 'text-8xl',
          sizeMobile: 'text-6xl',
          tracking: 'tracking-tight',
          leading: 'leading-[0.95]'
        };
      }
      setFormData(data);
    }
  }, [initialProject]);

  const handleClientChange = (clientName: string) => {
    setFormData((prev) => {
      const generatedSlug = prev.slug || clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { ...prev, client: clientName, slug: generatedSlug };
    });
  };

  const handleAddScopeTag = () => {
    if (!newScopeTag.trim()) return;
    const scope = [...(formData.scope || []), newScopeTag.trim()];
    setFormData({ ...formData, scope });
    setNewScopeTag('');
  };

  const handleRemoveScopeTag = (index: number) => {
    const scope = (formData.scope || []).filter((_, i) => i !== index);
    setFormData({ ...formData, scope });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || !formData.slug) {
      setFeedback({ type: 'error', message: 'El cliente y el slug son obligatorios.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const res = await onSave(formData);
    setSaving(false);

    if (res.success) {
      setFeedback({ type: 'success', message: '¡Proyecto guardado exitosamente!' });
      setTimeout(() => {
        setFeedback(null);
        onBack();
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al guardar el proyecto' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Editor Header Bar */}
      <div className="sticky top-[106px] md:top-[65px] z-40 bg-[#FEFAF9]/95 backdrop-blur-md py-4 border-b border-[#E8E3E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl border border-[#E8E3E1] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-serif text-[#000000] font-normal">
              {initialProject ? `Editar Proyecto: ${initialProject.client}` : 'Nuevo Proyecto'}
            </h1>
            <p className="text-xs text-[#666666]">Configurá la portada, detalles y bloques dinámicos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F5EFEF] p-1 rounded-xl border border-[#E8E3E1] text-xs font-medium">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'editor' ? 'bg-white text-[#000000] shadow-sm font-semibold' : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              <Edit className="w-3.5 h-3.5 text-[#a52f18]" />
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'preview' ? 'bg-white text-[#000000] shadow-sm font-semibold' : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#a52f18]" />
              Vista Previa
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Proyecto'}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-3 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Live Preview Pane */}
      {activeTab === 'preview' ? (
        <div className="space-y-6">
          {/* Device Switcher */}
          <div className="flex justify-center items-center gap-2 mb-2 bg-[#F5EFEF] p-1 rounded-xl border border-[#E8E3E1] max-w-xs mx-auto shadow-xs">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewDevice === 'desktop' ? 'bg-white text-[#a52f18] shadow-xs' : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              💻 Escritorio
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewDevice === 'tablet' ? 'bg-white text-[#a52f18] shadow-xs' : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              📋 Tablet
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewDevice === 'mobile' ? 'bg-white text-[#a52f18] shadow-xs' : 'text-[#666666] hover:text-[#000000]'
              }`}
            >
              📱 Móvil
            </button>
          </div>

          <div className="w-full overflow-x-auto py-6 flex justify-center bg-[#F5EFEF] rounded-2xl border border-[#E8E3E1]">
            <div
              className={`transition-all duration-300 bg-[#FEFAF9] text-[#000000] border border-[#E8E3E1] shadow-2xl relative ${
                previewDevice === 'mobile'
                  ? 'w-[375px] h-[667px] rounded-3xl overflow-y-auto outline-[12px] outline-solid outline-black/90 outline-offset-0 ring-1 ring-black/10'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] h-[1024px] rounded-2xl overflow-y-auto outline-[8px] outline-solid outline-black/85 outline-offset-0 ring-1 ring-black/10'
                  : 'w-full max-w-5xl rounded-2xl p-6 md:p-12'
              }`}
            >
              {/* Device Screen Frame Simulators */}
              {previewDevice !== 'desktop' && (
                <div className="sticky top-0 z-30 w-full py-1 text-center bg-black/90 text-white font-mono text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 select-none mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                  Vista previa {previewDevice === 'mobile' ? 'móvil' : 'tablet'} activa
                </div>
              )}
              
              <div className={`${previewDevice !== 'desktop' ? 'p-4' : ''}`}>
                <ProjectPreview project={formData} device={previewDevice} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#000000] border-b border-[#E8E3E1] pb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#a52f18]" />
              Información Principal del Proyecto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Nombre del Cliente / Marca *</label>
                <input
                  type="text"
                  required
                  value={formData.client}
                  onChange={(e) => handleClientChange(e.target.value)}
                  placeholder="ej: Yokoo Studio"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] focus:border-[#a52f18] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej: yokoo-studio"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] font-mono focus:border-[#a52f18] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Título / Subtítulo del Proyecto</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej: Reposicionamiento de Comunicación"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] focus:border-[#a52f18] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Categoría / Modalidad *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] focus:border-[#a52f18] outline-none"
                >
                  <option value="Build Program">Build Program</option>
                  <option value="Shift Program">Shift Program</option>
                  <option value="Refresh Program">Refresh Program</option>
                  <option value="Brand Partnership">Brand Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Año / Periodo</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="ej: 2022-2025"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] focus:border-[#a52f18] outline-none"
                />
              </div>

              {/* Cover Image Picker */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Inputs */}
                  <div className="flex-1 space-y-2">
                    <ImageUploader
                      value={formData.cover?.publicId || ''}
                      onChange={(newId) => setFormData({
                        ...formData,
                        cover: { publicId: newId, alt: formData.cover?.alt || formData.client }
                      })}
                      label="Imagen de Portada (Cover)"
                    />
                    <input
                      type="text"
                      value={formData.cover?.alt || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        cover: { publicId: formData.cover?.publicId || '', alt: e.target.value }
                      })}
                      placeholder="Texto alternativo de la portada..."
                      className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2 text-xs text-[#000000] outline-none focus:border-[#a52f18]"
                    />
                    <p className="text-[11px] text-[#999]">
                      Esta imagen aparece como hero en el proyecto y como miniatura en la grilla del portafolio.
                    </p>
                  </div>
                  {/* Live card preview */}
                  <div className="flex-shrink-0">
                    <p className="text-[11px] text-[#999] mb-2 font-mono uppercase tracking-wide">Vista previa tarjeta</p>
                    <CoverCardPreview project={formData} />
                  </div>
                </div>
              </div>

            </div>

            {/* Summaries & Description */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Resumen Corto (Para tarjetas y lista) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Síntesis concisa del trabajo realizado..."
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] outline-none resize-y"
                />
              </div>

              {/* Estilos del Título del Caso */}
              <div className="bg-[#F5EFEF]/50 border border-[#E8E3E1] rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#a52f18] rounded-full" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#000000]">Estilos del Título (Detalle del Caso)</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {/* Negrita & Cursiva */}
                  <div className="flex items-center gap-6 bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-4 py-2.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#666666]">
                      <input 
                        type="checkbox"
                        checked={formData.titleStyle?.bold || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          titleStyle: {
                            ...(formData.titleStyle || {}),
                            bold: e.target.checked
                          }
                        })}
                        className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                      />
                      Negrita (Bold)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#666666]">
                      <input 
                        type="checkbox"
                        checked={formData.titleStyle?.italic !== false}
                        onChange={(e) => setFormData({
                          ...formData,
                          titleStyle: {
                            ...(formData.titleStyle || {}),
                            italic: e.target.checked
                          }
                        })}
                        className="rounded border-[#E8E3E1] text-[#a52f18] focus:ring-[#a52f18] w-4 h-4 cursor-pointer"
                      />
                      Itálica
                    </label>
                  </div>

                  {/* Interletrado (Tracking) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Interletrado (Tracking)</label>
                    <select
                      value={formData.titleStyle?.tracking || 'tracking-tight'}
                      onChange={(e) => setFormData({
                        ...formData,
                        titleStyle: {
                          ...(formData.titleStyle || {}),
                          tracking: e.target.value
                        }
                      })}
                      className="bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] outline-none w-full"
                    >
                      <option value="tracking-tighter">Muy Ajustado</option>
                      <option value="tracking-tight">Ajustado</option>
                      <option value="tracking-normal">Normal</option>
                      <option value="tracking-wide">Ancho</option>
                      <option value="tracking-wider">Más Ancho</option>
                      <option value="tracking-widest">Expandido</option>
                    </select>
                  </div>

                  {/* Interlineado (Leading) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Interlineado (Leading)</label>
                    <select
                      value={formData.titleStyle?.leading || 'leading-[0.95]'}
                      onChange={(e) => setFormData({
                        ...formData,
                        titleStyle: {
                          ...(formData.titleStyle || {}),
                          leading: e.target.value
                        }
                      })}
                      className="bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] outline-none w-full"
                    >
                      <option value="leading-none">Ninguno (1.0)</option>
                      <option value="leading-[0.95]">Compacto (0.95)</option>
                      <option value="leading-tight">Ajustado (1.25)</option>
                      <option value="leading-snug">Cómodo (1.375)</option>
                      <option value="leading-normal">Normal (1.5)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Tamaño Mobile */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Tamaño Mobile</label>
                    <select
                      value={formData.titleStyle?.sizeMobile || 'text-6xl'}
                      onChange={(e) => setFormData({
                        ...formData,
                        titleStyle: {
                          ...(formData.titleStyle || {}),
                          sizeMobile: e.target.value
                        }
                      })}
                      className="bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] outline-none w-full"
                    >
                      <option value="text-3xl">3XL</option>
                      <option value="text-4xl">4XL</option>
                      <option value="text-5xl">5XL</option>
                      <option value="text-6xl">6XL</option>
                      <option value="text-7xl">7XL</option>
                      <option value="text-8xl">8XL</option>
                    </select>
                  </div>

                  {/* Tamaño Tablet */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Tamaño Tablet</label>
                    <select
                      value={formData.titleStyle?.sizeTablet || 'text-8xl'}
                      onChange={(e) => setFormData({
                        ...formData,
                        titleStyle: {
                          ...(formData.titleStyle || {}),
                          sizeTablet: e.target.value
                        }
                      })}
                      className="bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] outline-none w-full"
                    >
                      <option value="text-5xl">5XL</option>
                      <option value="text-6xl">6XL</option>
                      <option value="text-7xl">7XL</option>
                      <option value="text-8xl">8XL</option>
                      <option value="text-9xl">9XL</option>
                      <option value="text-[9rem]">9rem</option>
                    </select>
                  </div>

                  {/* Tamaño Desktop */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#888] uppercase tracking-wide">Tamaño Desktop</label>
                    <select
                      value={formData.titleStyle?.sizeDesktop || 'text-[9rem]'}
                      onChange={(e) => setFormData({
                        ...formData,
                        titleStyle: {
                          ...(formData.titleStyle || {}),
                          sizeDesktop: e.target.value
                        }
                      })}
                      className="bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] outline-none w-full"
                    >
                      <option value="text-6xl">6XL</option>
                      <option value="text-7xl">7XL</option>
                      <option value="text-8xl">8XL</option>
                      <option value="text-9xl">9XL</option>
                      <option value="text-[9rem]">9rem</option>
                      <option value="text-[10rem]">10rem</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Scope Tags */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-[#666666]">Servicios / Alcance (Scope Tags)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newScopeTag}
                  onChange={(e) => setNewScopeTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddScopeTag(); } }}
                  placeholder="ej: Estrategia de comunicación, Growth Marketing..."
                  className="flex-1 bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2 text-xs text-[#000000] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddScopeTag}
                  className="px-3 py-2 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl text-xs font-medium border border-[#E8E3E1]"
                >
                  <Plus className="w-4 h-4 text-[#a52f18]" />
                </button>
              </div>

              {formData.scope && formData.scope.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  {formData.scope.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEFAF9] border border-[#E8E3E1] text-xs text-[#000000]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveScopeTag(idx)}
                        className="text-[#666666] hover:text-[#a52f18]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Dynamic Blocks Section */}
          <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 shadow-sm">
            <BlockBuilder
              blocks={formData.blocks || []}
              onChange={(blocks: ProjectBlock[]) => setFormData({ ...formData, blocks })}
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl text-xs font-medium border border-[#E8E3E1]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
