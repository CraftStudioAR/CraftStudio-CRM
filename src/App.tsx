import React, { useState, useEffect } from 'react';
import { WorkCase, CraftLabArticle } from './types';
import { 
  fetchProjects, 
  saveProject, 
  deleteProject, 
  fetchArticles, 
  saveArticle, 
  deleteArticle,
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
import { Loader2 } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'articles' | 'settings' | 'project-editor' | 'article-editor'>('dashboard');
  
  const [projects, setProjects] = useState<WorkCase[]>([]);
  const [articles, setArticles] = useState<CraftLabArticle[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadData = async () => {
    setLoading(true);
    const [pList, aList] = await Promise.all([fetchProjects(), fetchArticles()]);
    setProjects(pList);
    setArticles(aList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Project
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setActiveTab('project-editor');
  };

  const handleOpenEditProject = (project: WorkCase) => {
    setEditingProject(project);
    setActiveTab('project-editor');
  };

  const handleSaveProject = async (project: WorkCase) => {
    const res = await saveProject(project);
    if (res.success) {
      await loadData();
    }
    return res;
  };

  const handleDeleteProject = async (slug: string) => {
    await deleteProject(slug);
    await loadData();
  };

  const handleDuplicateProject = async (project: WorkCase) => {
    const duplicated: WorkCase = {
      ...JSON.parse(JSON.stringify(project)),
      slug: `${project.slug}-copia`,
      client: `${project.client} (Copia)`,
    };
    await saveProject(duplicated);
    await loadData();
  };

  // Handlers for Articles
  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setActiveTab('article-editor');
  };

  const handleOpenEditArticle = (article: CraftLabArticle) => {
    setEditingArticle(article);
    setActiveTab('article-editor');
  };

  const handleSaveArticle = async (article: CraftLabArticle) => {
    const res = await saveArticle(article);
    if (res.success) {
      await loadData();
    }
    return res;
  };

  const handleDeleteArticle = async (idOrSlug: string) => {
    await deleteArticle(idOrSlug);
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
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-[#a52f18] animate-spin" />
            <p className="text-xs text-[#666666] font-mono">Cargando portafolio y contenidos...</p>
          </div>
        ) : (
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
