import React from 'react';
import { WorkCase, CraftLabArticle } from '../types';
import { 
  FolderKanban, 
  BookOpen, 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  Plus, 
  Database,
  CheckCircle2
} from 'lucide-react';
import { getImageUrl } from '../lib/cloudinary';

interface DashboardProps {
  projects: WorkCase[];
  articles: CraftLabArticle[];
  onSelectProject: (project: WorkCase) => void;
  onSelectArticle: (article: CraftLabArticle) => void;
  onNewProject: () => void;
  onNewArticle: () => void;
  onGoToSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  articles,
  onSelectProject,
  onSelectArticle,
  onNewProject,
  onNewArticle,
  onGoToSettings,
}) => {
  const categories = Array.from(new Set(projects.map((p) => p.category)));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-white border border-[#E8E3E1] p-6 md:p-10 overflow-hidden shadow-sm">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-[#a52f18]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEFAF9] border border-[#E8E3E1] text-xs font-mono text-[#a52f18]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gestión de Marca & Portafolio</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#000000] font-normal tracking-tight">
              Panel de Administración Craft Studio
            </h1>
            <p className="text-sm text-[#666666] leading-relaxed">
              Subí nuevos proyectos con sus bloques visuales dinámicos y publicá los ensayos de Craft Lab manteniendo la identidad clara de la marca.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNewProject}
              className="px-4 py-2.5 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </button>
            <button
              onClick={onNewArticle}
              className="px-4 py-2.5 bg-[#F5EFEF] hover:bg-[#E8E3E1] text-[#000000] rounded-xl text-xs font-medium border border-[#E8E3E1] transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nuevo Artículo
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E8E3E1] rounded-2xl p-5 space-y-3 shadow-sm hover:border-[#a52f18]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider font-sans">Total Proyectos</span>
            <div className="p-2 rounded-xl bg-[#a52f18]/10 text-[#a52f18]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#000000] font-mono">{projects.length}</div>
          <p className="text-xs text-[#666666] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Casos preservados e intactos</span>
          </p>
        </div>

        <div className="bg-white border border-[#E8E3E1] rounded-2xl p-5 space-y-3 shadow-sm hover:border-[#a52f18]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider font-sans">Artículos Craft Lab</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#000000] font-mono">{articles.length}</div>
          <p className="text-xs text-[#666666]">Publicaciones en Craft Lab</p>
        </div>

        <div className="bg-white border border-[#E8E3E1] rounded-2xl p-5 space-y-3 shadow-sm hover:border-[#a52f18]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider font-sans">Categorías Activas</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#000000] font-mono">{categories.length}</div>
          <p className="text-xs text-[#666666]">Programas & Partnerships</p>
        </div>

        <div className="bg-white border border-[#E8E3E1] rounded-2xl p-5 space-y-3 shadow-sm hover:border-[#a52f18]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider font-sans">Supabase & Img</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">Cloudinary Habilitado</div>
          <div>
            <button
              onClick={onGoToSettings}
              className="text-xs text-[#a52f18] hover:underline font-mono font-medium"
            >
              Ver ajustes de almacenamiento &gt;
            </button>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Projects */}
        <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E3E1] pb-4">
            <div>
              <h2 className="text-lg font-serif text-[#000000]">Proyectos Recientes</h2>
              <p className="text-xs text-[#666666]">Casos de estudio activos en la plataforma</p>
            </div>
            <button
              onClick={onNewProject}
              className="text-xs text-[#000000] hover:bg-[#F5EFEF] flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#E8E3E1] font-medium"
            >
              + Agregar
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project.slug}
                onClick={() => onSelectProject(project)}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-[#FEFAF9] border border-[#E8E3E1] hover:border-[#a52f18]/60 cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={getImageUrl(project.cover?.publicId)}
                    alt={project.client}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-[#E8E3E1] group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="text-sm font-serif text-[#000000] font-medium group-hover:text-[#a52f18] transition-colors">
                      {project.client}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#666666] mt-0.5">
                      <span>{project.category}</span>
                      <span>•</span>
                      <span>{project.year}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#666666] bg-white px-2 py-1 rounded border border-[#E8E3E1]">
                    {project.blocks?.length || 0} bloques
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#666666] group-hover:text-[#a52f18] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Craft Lab Articles */}
        <div className="bg-white border border-[#E8E3E1] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E3E1] pb-4">
            <div>
              <h2 className="text-lg font-serif text-[#000000]">Artículos de Craft Lab</h2>
              <p className="text-xs text-[#666666]">Publicaciones y ensayos de marca</p>
            </div>
            <button
              onClick={onNewArticle}
              className="text-xs text-[#000000] hover:bg-[#F5EFEF] flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#E8E3E1] font-medium"
            >
              + Agregar
            </button>
          </div>

          <div className="space-y-3">
            {articles.slice(0, 4).map((article) => (
              <div
                key={article.id || article.slug}
                onClick={() => onSelectArticle(article)}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-[#FEFAF9] border border-[#E8E3E1] hover:border-[#a52f18]/60 cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={getImageUrl(article.image)}
                    alt={article.title}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-[#E8E3E1] group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h4 className="text-sm font-serif text-[#000000] font-medium group-hover:text-[#a52f18] transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#666666] mt-0.5">
                      <span className="text-[#a52f18] font-medium">{article.category}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 text-[#666666] group-hover:text-[#a52f18] transition-colors" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
