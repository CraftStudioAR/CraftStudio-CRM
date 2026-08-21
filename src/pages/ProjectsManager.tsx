import React, { useState, useEffect } from 'react';
import { WorkCase } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  FolderKanban, 
  Check,
  ArrowUpDown,
  GripVertical,
  Save,
  X,
  Star
} from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';

interface ProjectsManagerProps {
  projects: WorkCase[];
  onEditProject: (project: WorkCase) => void;
  onNewProject: () => void;
  onDeleteProject: (slug: string) => void;
  onDuplicateProject: (project: WorkCase) => void;
  onSaveOrder: (slugs: string[]) => Promise<{ success: boolean; error?: string }>;
  onToggleFeatured: (slug: string, featured: boolean) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onEditProject,
  onNewProject,
  onDeleteProject,
  onDuplicateProject,
  onSaveOrder,
  onToggleFeatured,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  
  // Custom Reordering State
  const [isReordering, setIsReordering] = useState(false);
  const [tempProjects, setTempProjects] = useState<WorkCase[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  // Sync tempProjects when projects props change or reordering is toggled
  useEffect(() => {
    setTempProjects(projects);
  }, [projects, isReordering]);

  const categories = ['Todos', 'Build Program', 'Shift Program', 'Refresh Program', 'Brand Partnership'];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    
    // Set a ghost image style or generic effect if supported
    const ghost = document.createElement('div');
    ghost.style.display = 'none';
    e.dataTransfer.setDragImage(ghost, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const list = [...tempProjects];
    const draggedItem = list[draggedIdx];
    list.splice(draggedIdx, 1);
    list.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setTempProjects(list);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSaveOrderClick = async () => {
    setSavingOrder(true);
    setOrderFeedback(null);
    const slugs = tempProjects.map((p) => p.slug);
    const res = await onSaveOrder(slugs);
    setSavingOrder(false);
    if (res.success) {
      setOrderFeedback('Orden guardado con éxito!');
      setTimeout(() => {
        setOrderFeedback(null);
        setIsReordering(false);
      }, 1500);
    } else {
      setOrderFeedback(`Error: ${res.error || 'No se pudo guardar'}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E3E1] pb-5">
        <div>
          <h1 className="text-2xl font-serif text-[#000000] font-normal flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#a52f18]" />
            Gestión de Proyectos ({projects.length})
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Administrá los casos de estudio publicados en el portafolio de Craft Studio
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Custom Reorder Button */}
          <button
            type="button"
            onClick={() => {
              setIsReordering(!isReordering);
              setSearchTerm('');
              setSelectedCategory('Todos');
            }}
            className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isReordering 
                ? 'bg-[#000000] border-[#000000] text-white' 
                : 'bg-white border-[#E8E3E1] text-[#000000] hover:bg-[#F5EFEF]'
            }`}
          >
            <ArrowUpDown className="w-4 h-4 text-[#a52f18]" />
            <span>{isReordering ? 'Salir de Reordenar' : 'Reordenar a Gusto'}</span>
          </button>

          <button
            onClick={onNewProject}
            disabled={isReordering}
            className="px-4 py-2 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-medium shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* REORDER WORKSPACE */}
      {isReordering ? (
        <div className="space-y-4 max-w-2xl mx-auto animate-fadeIn">
          <div className="bg-[#a52f18]/5 border border-[#a52f18]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-[#a52f18] uppercase tracking-wide">Orden de Portafolio Personalizado</h3>
              <p className="text-[11px] text-[#666666] mt-0.5">Arrastrá y soltá los proyectos a la posición que quieras para cambiar cómo se muestran en la web.</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {orderFeedback && (
                <span className="text-xs font-semibold text-emerald-700 mr-2">{orderFeedback}</span>
              )}
              <button
                type="button"
                onClick={handleSaveOrderClick}
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
            {tempProjects.map((project, idx) => {
              const isDragging = draggedIdx === idx;
              return (
                <div
                  key={project.slug}
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
                      src={getImageUrl(project.cover?.publicId)}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#000000] truncate">
                      {project.client}
                    </h4>
                    {project.title && (
                      <p className="text-[10px] text-[#666666] truncate font-serif italic mt-0.5">
                        {project.title}
                      </p>
                    )}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-md bg-[#FEFAF9] text-[10px] font-mono text-[#666666] border border-[#E8E3E1] shrink-0">
                    {project.category}
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
                placeholder="Buscar por cliente, título o resumen..."
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

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="border border-dashed border-[#E8E3E1] rounded-2xl p-12 text-center bg-white">
              <FolderKanban className="w-8 h-8 text-[#999999] mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-semibold text-[#000000]">No se encontraron proyectos</h3>
              <p className="text-xs text-[#666666] mt-1">Prueba cambiando el término de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.slug}
                  className="group bg-white border border-[#E8E3E1] rounded-2xl overflow-hidden hover:border-[#a52f18]/60 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  {/* Cover Image & Category */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F5EFEF]">
                    <img
                      src={getImageUrl(project.cover?.publicId)}
                      alt={project.client}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-[#FEFAF9]/90 backdrop-blur-md text-[11px] font-mono text-[#000000] border border-[#E8E3E1]">
                        {project.category}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-[#FEFAF9]/90 backdrop-blur-md text-[11px] font-mono text-[#666666] border border-[#E8E3E1]">
                        {project.year}
                      </span>
                    </div>

                    {/* Star Highlight Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFeatured(project.slug, !project.featured);
                      }}
                      className={`absolute top-3 right-3 p-1.5 rounded-lg border backdrop-blur-md transition-all active:scale-95 z-10 ${
                        project.featured
                          ? 'bg-[#a52f18] text-[#FEFAF9] border-[#a52f18] shadow-sm'
                          : 'bg-white/80 text-[#666666] border-[#E8E3E1] hover:text-[#a52f18] hover:bg-white'
                      }`}
                      title={project.featured ? "Quitar de destacados" : "Destacar en el Home"}
                    >
                      <Star className={`w-3.5 h-3.5 ${project.featured ? 'fill-[#FEFAF9]' : ''}`} />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif text-[#000000] font-normal group-hover:text-[#a52f18] transition-colors">
                        {project.client}
                      </h3>

                      {project.title && (
                        <p className="text-xs text-[#666666] italic font-serif mt-0.5">
                          {project.title}
                        </p>
                      )}

                      <p className="text-xs text-[#666666] leading-relaxed mt-2.5 line-clamp-3">
                        {project.summary}
                      </p>
                    </div>

                    {/* Scope Tags */}
                    {project.scope && project.scope.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {project.scope.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#FEFAF9] text-[#666666] border border-[#E8E3E1]">
                            {tag}
                          </span>
                        ))}
                        {project.scope.length > 3 && (
                          <span className="text-[10px] text-[#999999] font-mono">
                            +{project.scope.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action Bar */}
                  <div className="px-5 py-3.5 bg-[#FEFAF9] border-t border-[#E8E3E1] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#666666]">
                      {project.blocks?.length || 0} bloques
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicateProject(project)}
                        className="p-1.5 text-[#666666] hover:text-[#000000] hover:bg-[#F5EFEF] rounded transition-colors"
                        title="Duplicar proyecto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditProject(project)}
                        className="px-3 py-1 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-lg text-xs font-medium border border-[#E8E3E1] flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#a52f18]" />
                        Editar
                      </button>

                      {deleteConfirmSlug === project.slug ? (
                        <button
                          onClick={() => {
                            onDeleteProject(project.slug);
                            setDeleteConfirmSlug(null);
                          }}
                          className="px-2 py-1 bg-[#a52f18] text-[#FEFAF9] rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          ¿Borrar?
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmSlug(project.slug)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar proyecto"
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
