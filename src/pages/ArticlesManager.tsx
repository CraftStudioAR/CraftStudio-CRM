import React, { useState } from 'react';
import { CraftLabArticle } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Check, 
  Calendar 
} from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';

interface ArticlesManagerProps {
  articles: CraftLabArticle[];
  onEditArticle: (article: CraftLabArticle) => void;
  onNewArticle: () => void;
  onDeleteArticle: (idOrSlug: string) => void;
}

export const ArticlesManager: React.FC<ArticlesManagerProps> = ({
  articles,
  onEditArticle,
  onNewArticle,
  onDeleteArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = ['Todos', 'Estrategia', 'Diseño', 'Cultura', 'Arte'];

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || a.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

        <button
          onClick={onNewArticle}
          className="px-4 py-2 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-medium shadow-sm flex items-center gap-2 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Artículo</span>
        </button>
      </div>

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

    </div>
  );
};
