import React from 'react';
import { LayoutDashboard, FolderKanban, BookOpen, Settings, Sparkles, Database, ShieldAlert } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  activeTab: 'dashboard' | 'projects' | 'articles' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'articles' | 'settings') => void;
  onNewProject: () => void;
  onNewArticle: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewProject,
  onNewArticle,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#FEFAF9]/90 backdrop-blur-md border-b border-[#E8E3E1] px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#000000] text-[#FEFAF9] flex items-center justify-center font-serif font-bold text-xl tracking-tighter group-hover:bg-[#a52f18] transition-colors">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#000000] tracking-wider text-xs uppercase font-sans">Craft Studio</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#a52f18]/10 text-[#a52f18] border border-[#a52f18]/20 font-bold">CRM</span>
              </div>
              <p className="text-[11px] text-[#666666] font-serif italic">Panel de Control & Editorial</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 bg-[#F5EFEF] p-1 rounded-xl border border-[#E8E3E1]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#000000] shadow-sm border border-[#E8E3E1] font-semibold'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#a52f18]" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-white text-[#000000] shadow-sm border border-[#E8E3E1] font-semibold'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-white/60'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#a52f18]" />
              Proyectos
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'articles'
                  ? 'bg-white text-[#000000] shadow-sm border border-[#E8E3E1] font-semibold'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#a52f18]" />
              Craft Lab
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-[#000000] shadow-sm border border-[#E8E3E1] font-semibold'
                  : 'text-[#666666] hover:text-[#000000] hover:bg-white/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-[#a52f18]" />
              Ajustes SQL
            </button>
          </nav>
        </div>

        {/* Status & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Backend Status Badge */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`hidden lg:flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
            title={isSupabaseConfigured ? 'Conectado a Supabase' : 'Modo local activo (LocalStorage)'}
          >
            {isSupabaseConfigured ? (
              <>
                <Database className="w-3 h-3 text-emerald-600" />
                <span className="font-medium">Supabase Conectado</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                <span className="font-medium">Modo Local Activo</span>
              </>
            )}
          </button>

          {/* Quick Create & Logout Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a52f18] hover:bg-[#8b2612] text-[#FEFAF9] rounded-xl text-xs font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Proyecto</span>
            </button>
            <button
              onClick={onNewArticle}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#F5EFEF] text-[#000000] rounded-xl text-xs font-medium border border-[#E8E3E1] transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span>+ Artículo</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-[#a52f18] text-white rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm cursor-pointer border border-transparent"
              >
                Salir
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Nav Links */}
      <div className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-[#E8E3E1] text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-[#000000] text-[#FEFAF9] font-medium' : 'text-[#666666]'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'projects' ? 'bg-[#000000] text-[#FEFAF9] font-medium' : 'text-[#666666]'}`}
        >
          Proyectos
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'articles' ? 'bg-[#000000] text-[#FEFAF9] font-medium' : 'text-[#666666]'}`}
        >
          Craft Lab
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1 rounded-lg ${activeTab === 'settings' ? 'bg-[#000000] text-[#FEFAF9] font-medium' : 'text-[#666666]'}`}
        >
          Ajustes
        </button>
      </div>
    </header>
  );
};
