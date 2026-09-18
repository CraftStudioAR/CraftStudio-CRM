import React, { useState, useEffect } from 'react';
import { WorkCase, CraftLabArticle } from './types';
import { 
  fetchProjects,
  fetchProjectBySlug,
  saveProject,
  deleteProject,
  fetchArticles,
  fetchArticleBySlug,
  saveArticle, 
  deleteArticle,
  saveProjectsOrder,
  saveArticlesOrder,
  supabase,
  isSupabaseConfigured
} from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ProjectsManager } from './pages/ProjectsManager';
import { ProjectEditor } from './pages/ProjectEditor';
import { ArticlesManager } from './pages/ArticlesManager';
import { ArticleEditor } from './pages/ArticleEditor';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Loader2, AlertCircle } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'articles' | 'settings' | 'project-editor' | 'article-editor'>('dashboard');
  
  const [projects, setProjects] = useState<WorkCase[]>([]);
  const [articles, setArticles] = useState<CraftLabArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editingProject, setEditingProject] = useState<WorkCase | null>(null);
  const [editingArticle, setEditingArticle] = useState<CraftLabArticle | null>(null);

  // Check login session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('craftstudio_crm_session');
          setIsAuthenticated(false);
        }
      } else {
        const session = localStorage.getItem('craftstudio_crm_session');
        if (session === 'active') {
          setIsAuthenticated(true);
        }
      }
    };
    checkSession();
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [pList, aList] = await Promise.all([fetchProjects(), fetchArticles()]);
      setProjects(pList);
      setArticles(aList);
      setLoadError(null);
    } catch (err: any) {
      // Nunca mostramos datos viejos del navegador: si la base no responde, lo decimos.
      setLoadError(err?.message || 'No se pudo conectar con la base de datos.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Project
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setActiveTab('project-editor');
  };

  const handleSaveProjectsOrder = async (slugs: string[]) => {
    const res = await saveProjectsOrder(slugs);
    if (res.success) {
      await loadData(true);
    }
    return res;
  };

  // El editor siempre arranca con la versión actual de la base, no con la del listado
  // (que puede tener horas si la pestaña quedó abierta).
  const handleOpenEditProject = async (project: WorkCase) => {
    try {
      const fresh = await fetchProjectBySlug(project.slug);
      setEditingProject(fresh);
      setActionError(null);
      setActiveTab('project-editor');
    } catch (err: any) {
      setActionError(err?.message || 'No se pudo abrir el proyecto.');
    }
  };

  const handleSaveProject = async (project: WorkCase) => {
    const res = await saveProject(project);
    if (res.success && res.saved) {
      setEditingProject(res.saved);
      await loadData(true);
    }
    return res;
  };

  const handleDeleteProject = async (slug: string) => {
    const res = await deleteProject(slug);
    if (!res.success) setActionError(res.error || 'No se pudo eliminar el proyecto.');
    await loadData(true);
  };

  const handleDuplicateProject = async (project: WorkCase) => {
    try {
      const fresh = await fetchProjectBySlug(project.slug);
      const { id, created_at, updated_at, ...rest } = JSON.parse(JSON.stringify(fresh));
      const duplicated: WorkCase = {
        ...rest,
        slug: `${fresh.slug}-copia`,
        client: `${fresh.client} (Copia)`,
      };
      const res = await saveProject(duplicated);
      if (!res.success) setActionError(res.error || 'No se pudo duplicar el proyecto.');
    } catch (err: any) {
      setActionError(err?.message || 'No se pudo duplicar el proyecto.');
    }
    await loadData(true);
  };

  const handleToggleFeatured = async (slug: string, featured: boolean) => {
    try {
      const fresh = await fetchProjectBySlug(slug);
      const res = await saveProject({ ...fresh, featured });
      if (!res.success) setActionError(res.error || 'No se pudo actualizar el destacado.');
    } catch (err: any) {
      setActionError(err?.message || 'No se pudo actualizar el destacado.');
    }
    await loadData(true);
  };

  // Handlers for Articles
  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setActiveTab('article-editor');
  };

  const handleOpenEditArticle = async (article: CraftLabArticle) => {
    try {
      const fresh = await fetchArticleBySlug(article.slug);
      setEditingArticle(fresh);
      setActionError(null);
      setActiveTab('article-editor');
    } catch (err: any) {
      setActionError(err?.message || 'No se pudo abrir el artículo.');
    }
  };

  const handleSaveArticle = async (article: CraftLabArticle) => {
    const res = await saveArticle(article);
    if (res.success && res.saved) {
      setEditingArticle(res.saved);
      await loadData(true);
    }
    return res;
  };

  const handleSaveArticlesOrder = async (slugs: string[], sortMode: 'date' | 'custom') => {
    const res = await saveArticlesOrder(slugs, sortMode);
    if (res.success) {
      await loadData();
    }
    return res;
  };

  const handleDeleteArticle = async (idOrSlug: string) => {
    const res = await deleteArticle(idOrSlug);
    if (!res.success) setActionError(res.error || 'No se pudo eliminar el artículo.');
    await loadData();
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('craftstudio_crm_session');
    localStorage.removeItem('craftstudio_crm_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#FEFAF9] text-[#000000] font-sans flex flex-col selection:bg-[#a52f18] selection:text-[#FEFAF9]">
      {/* Analog Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={
          activeTab === 'project-editor' ? 'projects' :
          activeTab === 'article-editor' ? 'articles' :
          activeTab
        }
        setActiveTab={(tab) => {
          setEditingProject(null);
          setEditingArticle(null);
          setActiveTab(tab);
        }}
        onNewProject={handleOpenNewProject}
        onNewArticle={handleOpenNewArticle}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        
        {(loadError || actionError) && !loading && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="flex-1 leading-relaxed">{actionError || loadError}</p>
            {loadError && !actionError ? (
              <button
                onClick={() => loadData()}
                className="shrink-0 rounded-lg border border-red-200 bg-white px-2.5 py-1 font-semibold hover:bg-red-100"
              >
                Reintentar
              </button>
            ) : (
              <button
                onClick={() => setActionError(null)}
                className="shrink-0 rounded-lg border border-red-200 bg-white px-2.5 py-1 font-semibold hover:bg-red-100"
              >
                Cerrar
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-[#a52f18] animate-spin" />
            <p className="text-xs text-[#666666] font-mono">Cargando portafolio y contenidos...</p>
          </div>
        ) : loadError && projects.length === 0 && articles.length === 0 ? null : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                projects={projects}
                articles={articles}
                onSelectProject={handleOpenEditProject}
                onSelectArticle={handleOpenEditArticle}
                onNewProject={handleOpenNewProject}
                onNewArticle={handleOpenNewArticle}
                onGoToSettings={() => setActiveTab('settings')}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsManager
                projects={projects}
                onEditProject={handleOpenEditProject}
                onNewProject={handleOpenNewProject}
                onDeleteProject={handleDeleteProject}
                onDuplicateProject={handleDuplicateProject}
                onSaveOrder={handleSaveProjectsOrder}
                onToggleFeatured={handleToggleFeatured}
              />
            )}

            {activeTab === 'project-editor' && (
              <ProjectEditor
                initialProject={editingProject}
                onSave={handleSaveProject}
                onBack={() => setActiveTab('projects')}
              />
            )}

            {activeTab === 'articles' && (
              <ArticlesManager
                articles={articles}
                onEditArticle={handleOpenEditArticle}
                onNewArticle={handleOpenNewArticle}
                onDeleteArticle={handleDeleteArticle}
                onSaveOrder={handleSaveArticlesOrder}
              />
            )}

            {activeTab === 'article-editor' && (
              <ArticleEditor
                initialArticle={editingArticle}
                onSave={handleSaveArticle}
                onBack={() => setActiveTab('articles')}
              />
            )}

            {activeTab === 'settings' && (
              <Settings onRefreshData={loadData} />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E3E1] bg-[#FEFAF9] py-6 text-center text-xs text-[#666666]">
        <p>Craft Studio CRM & Content Manager • Diseñado para gestión independiente de proyectos y publicaciones</p>
      </footer>

    </div>
  );
}
