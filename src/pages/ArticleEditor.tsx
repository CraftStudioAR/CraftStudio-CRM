import React, { useState, useEffect } from 'react';
import { CraftLabArticle } from '../types';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit, 
  Sparkles, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';
import { ImageUploader } from '../components/ImageUploader';
import { BlockBuilder } from '../components/BlockBuilder';
import { Block } from '../components/ProjectPreview';

interface ArticleEditorProps {
  initialArticle?: CraftLabArticle | null;
  onSave: (article: CraftLabArticle) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialArticle,
  onSave,
  onBack,
}) => {
  const [formData, setFormData] = useState<CraftLabArticle>({
    id: Date.now().toString(),
    slug: '',
    title: '',
    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase(),
    category: 'Estrategia',
    image: '/images/lab1.jpg',
    desc: '',
    aspect: 'aspect-[4/5]',
    content: '',
    blocks: [],
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialArticle) {
      setFormData(JSON.parse(JSON.stringify(initialArticle)));
    }
  }, [initialArticle]);

  const handleTitleChange = (titleText: string) => {
    setFormData((prev) => {
      const generatedSlug = prev.slug || titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { ...prev, title: titleText, slug: generatedSlug };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      setFeedback({ type: 'error', message: 'El título y el slug son obligatorios.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const res = await onSave(formData);
    setSaving(false);

    if (res.success) {
      setFeedback({ type: 'success', message: '¡Artículo de Craft Lab guardado con éxito!' });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Error al guardar el artículo' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3E1] pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl border border-[#E8E3E1] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-serif text-[#000000] font-normal">
              {initialArticle ? `Editar Artículo: ${initialArticle.title}` : 'Nuevo Artículo Craft Lab'}
            </h1>
            <p className="text-xs text-[#666666]">Escribí y formateá el contenido para la revista Craft Lab</p>
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
            {saving ? 'Guardando...' : 'Guardar Artículo'}
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

      {/* Live Article Preview */}
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
                  : 'w-full max-w-4xl rounded-2xl p-6 md:p-12 space-y-8 font-sans shadow-md'
              }`}
            >
              {/* Device Screen Frame Simulators */}
              {previewDevice !== 'desktop' && (
                <div className="sticky top-0 z-30 w-full py-1 text-center bg-black/90 text-white font-mono text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 select-none mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                  Vista previa {previewDevice === 'mobile' ? 'móvil' : 'tablet'} activa
                </div>
              )}

              <div className={`${previewDevice !== 'desktop' ? 'p-4 space-y-6 font-sans' : 'space-y-8'}`}>
                <div className="space-y-3 border-b border-[#E8E3E1] pb-6">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded bg-white text-[#a52f18] border border-[#a52f18]/20 font-bold uppercase">
                      {formData.category}
                    </span>
                    <span className="text-[#666666]">•</span>
                    <span className="text-[#666666]">{formData.date}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-serif font-normal text-[#000000] tracking-tight leading-tight">
                    {formData.title || 'Título del Artículo'}
                  </h1>
                  <p className="text-base text-[#666666] italic font-serif">
                    {formData.desc}
                  </p>
                </div>

                {formData.image && (
                  <div className="rounded-2xl overflow-hidden border border-[#E8E3E1]">
                    <img
                      src={getImageUrl(formData.image)}
                      alt={formData.title}
                      className="w-full max-h-[480px] object-cover"
                    />
                  </div>
                )}

                {formData.blocks && formData.blocks.length > 0 ? (
                  <div className="flex flex-col gap-6 md:gap-10 mt-8">
                    {formData.blocks.map((block, index) => (
                      <Block key={index} block={block} />
                    ))}
                  </div>
                ) : (
                  <div className="prose max-w-none text-[#000000] text-base md:text-lg leading-relaxed space-y-4 whitespace-pre-line font-serif">
                    {formData.content || 'El contenido del artículo aparecerá aquí...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 space-y-6 shadow-sm">
            
            <h3 className="text-sm font-semibold text-[#000000] border-b border-[#E8E3E1] pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#a52f18]" />
              Detalles de la Publicación Craft Lab
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Título del Artículo *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ej: La construcción de valor"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej: la-construccion-de-valor"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] outline-none"
                >
                  <option value="Estrategia">Estrategia</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Cultura">Cultura</option>
                  <option value="Arte">Arte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Fecha de Publicación</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="ej: 24 OCT"
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] uppercase font-mono outline-none"
                />
              </div>

              <div className="space-y-2">
                <ImageUploader
                  value={formData.image}
                  onChange={(newId) => setFormData({ ...formData, image: newId })}
                  label="Imagen de Portada (Public ID o URL)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">Proporción de Tarjeta (Aspect Ratio)</label>
                <select
                  value={formData.aspect || 'aspect-[4/5]'}
                  onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                  className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3 py-2.5 text-xs text-[#000000] font-mono outline-none"
                >
                  <option value="aspect-[4/5]">aspect-[4/5] (Vertical)</option>
                  <option value="aspect-[1/1]">aspect-[1/1] (Cuadrado)</option>
                  <option value="aspect-[3/4]">aspect-[3/4] (Vertical alto)</option>
                  <option value="aspect-[4/3]">aspect-[4/3] (Horizontal)</option>
                </select>
              </div>

            </div>

            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">Descripción Corta / Bajada *</label>
              <textarea
                rows={2}
                required
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                placeholder="Resumen del artículo que aparece en la grilla..."
                className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] outline-none resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">Contenido Completo del Artículo (Soporta párrafos) *</label>
              <textarea
                rows={12}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escribí aquí el cuerpo completo del ensayo..."
                className="w-full bg-[#FEFAF9] border border-[#E8E3E1] rounded-xl px-3.5 py-2.5 text-xs text-[#000000] outline-none font-serif text-base leading-relaxed resize-y"
              />
            </div>

            <div className="border-t border-[#E8E3E1] pt-6 space-y-4">
              <h4 className="text-sm font-semibold text-[#000000] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a52f18]" />
                Maquetador de Bloques del Artículo
              </h4>
              <p className="text-xs text-[#666666]">
                Agrega y ordena bloques visuales (imágenes destacadas, columnas, testimonios o citas) para diseñar la estructura interna del artículo.
              </p>
              <BlockBuilder
                blocks={formData.blocks || []}
                onChange={(newBlocks) => setFormData({ ...formData, blocks: newBlocks })}
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              {saving ? 'Guardando...' : 'Guardar Artículo'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
