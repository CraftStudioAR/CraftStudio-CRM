import React, { useState, useEffect } from 'react';
import { CraftLabArticle } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Check, 
  Calendar,
  ArrowUpDown,
  GripVertical,
  Save,
  X
} from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';

interface ArticlesManagerProps {
  articles: CraftLabArticle[];
  onEditArticle: (article: CraftLabArticle) => void;
  onNewArticle: () => void;
  onDeleteArticle: (idOrSlug: string) => void;
  onSaveOrder: (slugs: string[], sortMode: 'date' | 'custom') => Promise<{ success: boolean; error?: string }>;
}

export const ArticlesManager: React.FC<ArticlesManagerProps> = ({
  articles,
  onEditArticle,
  onNewArticle,
  onDeleteArticle,
  onSaveOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sorting Mode & Custom Ordering State
  const [isReordering, setIsReordering] = useState(false);
  const [sortMode, setSortMode] = useState<'date' | 'custom'>(() => {
    try {
      const orderRaw = localStorage.getItem('craftstudio_crm_articles_order');
      if (orderRaw) {
        const parsed = JSON.parse(orderRaw);
        return parsed.sortMode || 'date';
      }
    } catch (e) {
      // Ignore
    }
    return 'date';
  });
  const [tempArticles, setTempArticles] = useState<CraftLabArticle[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  // Sync tempArticles when articles or reordering changes
  useEffect(() => {
    setTempArticles(articles);
  }, [articles, isReordering]);

  // Sync sortMode locally from localStorage order metadata on mount
  useEffect(() => {
    const checkOrderConfig = async () => {
      // Check if we can extract it from the local storage cache
      const orderRaw = localStorage.getItem('craftstudio_crm_articles_order');
      if (orderRaw) {
        try {
          const parsed = JSON.parse(orderRaw);
          if (parsed.sortMode) setSortMode(parsed.sortMode);
        } catch (e) {}
      }
    };
    checkOrderConfig();
  }, []);

  const categories = ['Todos', 'Estrategia', 'Diseño', 'Cultura', 'Arte'];

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || a.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    
    const ghost = document.createElement('div');
    ghost.style.display = 'none';
    e.dataTransfer.setDragImage(ghost, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const list = [...tempArticles];
    const draggedItem = list[draggedIdx];
    list.splice(draggedIdx, 1);
    list.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setTempArticles(list);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSaveOrderClick = async (newSortMode: 'date' | 'custom' = sortMode) => {
    setSavingOrder(true);
    setOrderFeedback(null);
    const slugs = tempArticles.map((a) => a.slug);
    const res = await onSaveOrder(slugs, newSortMode);
    setSavingOrder(false);
    if (res.success) {
      localStorage.setItem('craftstudio_crm_articles_order', JSON.stringify({ customOrder: slugs, sortMode: newSortMode }));
      setSortMode(newSortMode);
      setOrderFeedback('Configuración de orden guardada!');
      setTimeout(() => {
        setOrderFeedback(null);
        setIsReordering(false);
      }, 1500);
    } else {
      setOrderFeedback(`Error: ${res.error || 'No se pudo guardar'}`);
    }
  };

  const handleSortModeChange = async (mode: 'date' | 'custom') => {
    setSortMode(mode);
    // If user changes sorting mode to date, immediately persist it
    if (mode === 'date') {
      setSavingOrder(true);
      const slugs = articles.map((a) => a.slug);
      const res = await onSaveOrder(slugs, 'date');
      setSavingOrder(false);
      if (res.success) {
        localStorage.setItem('craftstudio_crm_articles_order', JSON.stringify({ customOrder: slugs, sortMode: 'date' }));
        setOrderFeedback('Ordenado por fecha de lanzamiento!');
        setTimeout(() => setOrderFeedback(null), 1500);
      }
    } else {
      // Toggle reordering layout to custom
      setIsReordering(true);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E3E1] pb-5">
        <div>
          <h1 className="text-2xl font-serif text-[#000000] font-normal flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#a52f18]" />
            Gestión de Craft Lab ({articles.length})
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Administrá y publicá ensayos, artículos y análisis de marca para Craft Lab
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Sort Mode Controls */}
          <div className="flex items-center bg-[#F5EFEF] p-1 rounded-xl border border-[#E8E3E1] text-xs font-medium">
            <button
              type="button"
              onClick={() => handleSortModeChange('date')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                sortMode === 'date' && !isReordering
                  ? 'bg-white text-[#a52f18] shadow-sm font-semibold'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
              title="Ordenar por fecha"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Por Fecha</span>
            </button>
            <button
              type="button"
              onClick={() => handleSortModeChange('custom')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                sortMode === 'custom' || isReordering
                  ? 'bg-white text-[#a52f18] shadow-sm font-semibold'
                  : 'text-[#666666] hover:text-[#000000]'
              }`}
              title="Ordenar a gusto (Arrastrar)"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Personalizado</span>
            </button>
          </div>

          <button
            onClick={onNewArticle}
            disabled={isReordering}
            className="px-4 py-2 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-medium shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* REORDER WORKSPACE */}
      {isReordering ? (
        <div className="space-y-4 max-w-2xl mx-auto animate-fadeIn">
          <div className="bg-[#a52f18]/5 border border-[#a52f18]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-[#a52f18] uppercase tracking-wide">Orden de Artículos Personalizado</h3>
              <p className="text-[11px] text-[#666666] mt-0.5">Arrastrá y soltá los artículos para cambiar cómo se muestran en la sección Craft Lab.</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {orderFeedback && (
                <span className="text-xs font-semibold text-emerald-700 mr-2">{orderFeedback}</span>
              )}
              <button
                type="button"
                onClick={() => handleSaveOrderClick('custom')}
                disabled={savingOrder}
                className="px-3.5 py-1.5 bg-[#a52f18] hover:bg-[#8b2612] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingOrder ? 'Guardando...' : 'Guardar Orden'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReordering(false)}
                className="px-3 py-1.5 bg-white border border-[#E8E3E1] text-[#666] hover:text-[#000000] rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {tempArticles.map((article, idx) => {
              const isDragging = draggedIdx === idx;
              return (
                <div
                  key={article.id || article.slug}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-200 select-none ${
                    isDragging
                      ? 'border-[#a52f18] bg-[#a52f18]/5 opacity-60 scale-[0.98] shadow-xs'
                      : 'border-[#E8E3E1] bg-white hover:border-[#a52f18]/30 cursor-grab active:cursor-grabbing shadow-xs'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-[#999999] shrink-0" />
                  
                  <div className="w-14 h-9 rounded-lg overflow-hidden bg-[#F5EFEF] border border-[#E8E3E1] shrink-0">
                    <img
                      src={getImageUrl(article.image)}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#000000] truncate">
                      {article.title}
                    </h4>
                    <p className="text-[10px] text-[#666666] truncate mt-0.5">
                      Slug: {article.slug}
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-md bg-[#FEFAF9] text-[10px] font-mono text-[#666666] border border-[#E8E3E1] shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#a52f18]" />
                    {article.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Controls: Search & Category Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#666666]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, categoría o contenido..."
                className="w-full bg-white border border-[#E8E3E1] rounded-xl pl-10 pr-4 py-2 text-xs text-[#000000] placeholder-[#999999] focus:border-[#a52f18] outline-none shadow-sm"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#000000] text-[#FEFAF9] shadow-sm font-semibold'
                      : 'text-[#666666] hover:text-[#000000] hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="border border-dashed border-[#E8E3E1] rounded-2xl p-12 text-center bg-white">
              <BookOpen className="w-8 h-8 text-[#999999] mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-semibold text-[#000000]">No se encontraron artículos</h3>
              <p className="text-xs text-[#666666] mt-1">Prueba cambiando el término de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id || article.slug}
                  className="group bg-white border border-[#E8E3E1] rounded-2xl overflow-hidden hover:border-[#a52f18]/60 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  {/* Cover & Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F5EFEF]">
                    <img
                      src={getImageUrl(article.image)}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#FEFAF9]/90 backdrop-blur-md text-[11px] font-medium text-[#a52f18] border border-[#a52f18]/20">
                        {article.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded bg-white/80 backdrop-blur-md text-[10px] font-mono text-[#666666] border border-[#E8E3E1] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#a52f18]" />
                        {article.date}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif text-[#000000] font-normal group-hover:text-[#a52f18] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-[#666666] leading-relaxed mt-2 line-clamp-3">
                        {article.desc}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3.5 bg-[#FEFAF9] border-t border-[#E8E3E1] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#666666]">
                      Slug: {article.slug}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditArticle(article)}
                        className="px-3 py-1 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-lg text-xs font-medium border border-[#E8E3E1] flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#a52f18]" />
                        Editar
                      </button>

                      {deleteConfirmId === (article.id || article.slug) ? (
                        <button
                          onClick={() => {
                            onDeleteArticle(article.id || article.slug);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-[#a52f18] text-[#FEFAF9] rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          ¿Borrar?
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(article.id || article.slug)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};
