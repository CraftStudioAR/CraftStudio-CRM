import { createClient } from '@supabase/supabase-js';
import { WorkCase, CraftLabArticle } from '../types';
import { INITIAL_PROJECTS, INITIAL_ARTICLES } from '../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') &&
  !supabaseUrl.includes('your-supabase-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage Fallback Storage Keys
const LOCAL_STORAGE_PROJECTS_KEY = 'craftstudio_crm_projects';
const LOCAL_STORAGE_ARTICLES_KEY = 'craftstudio_crm_articles';

// Initialize LocalStorage with seed data if empty
const initLocalStorage = () => {
  if (!localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
  }
};

initLocalStorage();

// ==========================================
// PROJECTS API
// ==========================================

export async function fetchProjects(): Promise<WorkCase[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const settingsRow = data.find((item) => item.slug === '__settings__');
        let customOrder: string[] = [];
        try {
          if (settingsRow && settingsRow.description) {
            const parsed = JSON.parse(settingsRow.description);
            if (Array.isArray(parsed.customOrder)) {
              customOrder = parsed.customOrder;
            }
          }
        } catch (e) {
          // Ignore
        }

        const projectsOnly = data.filter((item) => item.slug !== '__settings__');

        const mappedProjects = projectsOnly.map((item) => {
          let titleStyle = undefined;
          try {
            if (item.description && item.description.trim().startsWith('{')) {
              const parsed = JSON.parse(item.description);
              titleStyle = parsed.titleStyle;
            }
          } catch (e) {
            // Ignore
          }
          return {
            ...item,
            scope: typeof item.scope === 'string' ? JSON.parse(item.scope) : item.scope,
            cover: typeof item.cover === 'string' ? JSON.parse(item.cover) : item.cover,
            blocks: typeof item.blocks === 'string' ? JSON.parse(item.blocks) : item.blocks,
            titleStyle,
          };
        });

        if (customOrder.length > 0) {
          mappedProjects.sort((a, b) => {
            const idxA = customOrder.indexOf(a.slug);
            const idxB = customOrder.indexOf(b.slug);
            const posA = idxA === -1 ? 99999 : idxA;
            const posB = idxB === -1 ? 99999 : idxB;
            return posA - posB;
          });
        }

        return mappedProjects;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to LocalStorage', e);
    }
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
  const projects: WorkCase[] = raw ? JSON.parse(raw) : INITIAL_PROJECTS;

  const orderRaw = localStorage.getItem('craftstudio_crm_projects_order');
  if (orderRaw) {
    try {
      const customOrder = JSON.parse(orderRaw) as string[];
      projects.sort((a, b) => {
        const idxA = customOrder.indexOf(a.slug);
        const idxB = customOrder.indexOf(b.slug);
        const posA = idxA === -1 ? 99999 : idxA;
        const posB = idxB === -1 ? 99999 : idxB;
        return posA - posB;
      });
    } catch (e) {
      // Ignore
    }
  }

  return projects.filter((p) => p.slug !== '__settings__');
}

export async function saveProject(project: WorkCase): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        slug: project.slug,
        client: project.client,
        title: project.title || '',
        category: project.category,
        year: project.year,
        summary: project.summary,
        description: project.titleStyle ? JSON.stringify({ titleStyle: project.titleStyle }) : '',
        scope: project.scope || [],
        cover: project.cover || null,
        blocks: project.blocks || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .upsert(payload, { onConflict: 'slug' });

      if (error) {
        console.error('Supabase save error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de conexión con Supabase' };
    }
  }

  // Fallback to LocalStorage update
  const projects = await fetchProjects();
  const index = projects.findIndex((p) => p.slug === project.slug);

  if (index >= 0) {
    projects[index] = { ...project, updated_at: new Date().toISOString() };
  } else {
    projects.unshift({ ...project, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }

  localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  return { success: true };
}

export async function deleteProject(slug: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('projects').delete().eq('slug', slug);
      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de conexión' };
    }
  }

  const projects = await fetchProjects();
  const filtered = projects.filter((p) => p.slug !== slug);
  localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(filtered));
  return { success: true };
}

// ==========================================
// CRAFT LAB ARTICLES API
// ==========================================

export async function fetchArticles(): Promise<CraftLabArticle[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('craft_lab_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const settingsRow = data.find((item) => item.slug === '__settings__');
        let customOrder: string[] = [];
        let sortMode: 'date' | 'custom' = 'date';
        try {
          if (settingsRow && settingsRow.desc) {
            const parsed = JSON.parse(settingsRow.desc);
            if (Array.isArray(parsed.customOrder)) {
              customOrder = parsed.customOrder;
            }
            if (parsed.sortMode) {
              sortMode = parsed.sortMode;
            }
          }
        } catch (e) {
          // Ignore
        }

        const articlesOnly = data.filter((item) => item.slug !== '__settings__');

        const mappedArticles = articlesOnly.map((item) => ({
          ...item,
          blocks: typeof item.blocks === 'string' ? JSON.parse(item.blocks) : item.blocks || [],
        }));

        if (sortMode === 'custom' && customOrder.length > 0) {
          mappedArticles.sort((a, b) => {
            const idxA = customOrder.indexOf(a.slug);
            const idxB = customOrder.indexOf(b.slug);
            const posA = idxA === -1 ? 99999 : idxA;
            const posB = idxB === -1 ? 99999 : idxB;
            return posA - posB;
          });
        } else {
          mappedArticles.sort((a, b) => {
            const dateA = new Date(a.created_at || a.date || 0).getTime();
            const dateB = new Date(b.created_at || b.date || 0).getTime();
            return dateB - dateA;
          });
        }

        return mappedArticles;
      }
    } catch (e) {
      console.warn('Supabase fetch articles failed, falling back to LocalStorage', e);
    }
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
  const articles: CraftLabArticle[] = raw ? JSON.parse(raw) : INITIAL_ARTICLES;

  const orderRaw = localStorage.getItem('craftstudio_crm_articles_order');
  if (orderRaw) {
    try {
      const parsed = JSON.parse(orderRaw);
      const customOrder = parsed.customOrder as string[];
      const sortMode = parsed.sortMode as 'date' | 'custom';

      if (sortMode === 'custom' && customOrder.length > 0) {
        articles.sort((a, b) => {
          const idxA = customOrder.indexOf(a.slug);
          const idxB = customOrder.indexOf(b.slug);
          const posA = idxA === -1 ? 99999 : idxA;
          const posB = idxB === -1 ? 99999 : idxB;
          return posA - posB;
        });
      } else {
        articles.sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || 0).getTime();
          const dateB = new Date(b.created_at || b.date || 0).getTime();
          return dateB - dateA;
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  return articles.filter((a) => a.slug !== '__settings__');
}

export async function saveArticle(article: CraftLabArticle): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      let articleId = article.id;
      // Validar si es un UUID válido. Si no lo es (ej: un timestamp local), generamos un nuevo UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId)) {
        articleId = crypto.randomUUID();
      }

      const payload = {
        id: articleId,
        slug: article.slug,
        title: article.title,
        date: article.date,
        category: article.category,
        image: article.image,
        desc: article.desc,
        aspect: article.aspect || 'aspect-[4/5]',
        content: article.content,
        blocks: article.blocks || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('craft_lab_articles')
        .upsert(payload, { onConflict: 'slug' });

      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error' };
    }
  }

  const articles = await fetchArticles();
  const index = articles.findIndex((a) => a.slug === article.slug || a.id === article.id);

  if (index >= 0) {
    articles[index] = { ...article, updated_at: new Date().toISOString() };
  } else {
    articles.unshift({
      ...article,
      id: article.id || Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(articles));
  return { success: true };
}

export async function deleteArticle(slugOrId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('craft_lab_articles').delete().or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);
      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  const articles = await fetchArticles();
  const filtered = articles.filter((a) => a.slug !== slugOrId && a.id !== slugOrId);
  localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(filtered));
  return { success: true };
}

// Reset LocalStorage back to initial data
export function resetLocalData() {
  localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
}

// Seed local static projects & articles into Supabase
export async function seedSupabase(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado.' };
  }

  try {
    // 1. Upload Projects
    for (const project of INITIAL_PROJECTS) {
      const payload = {
        slug: project.slug,
        client: project.client,
        title: project.title || '',
        category: project.category,
        year: project.year,
        summary: project.summary,
        description: project.description || '',
        scope: project.scope || [],
        cover: project.cover || null,
        blocks: project.blocks || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .upsert(payload, { onConflict: 'slug' });

      if (error) {
        return { success: false, error: `Error cargando proyecto ${project.slug}: ${error.message}` };
      }
    }

    // 2. Upload Articles
    for (const article of INITIAL_ARTICLES) {
      const payload = {
        id: article.id || crypto.randomUUID(),
        slug: article.slug,
        title: article.title,
        date: article.date,
        category: article.category,
        image: article.image,
        desc: article.desc,
        aspect: article.aspect || 'aspect-[4/5]',
        content: article.content,
        blocks: (article as any).blocks || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('craft_lab_articles')
        .upsert(payload, { onConflict: 'slug' });

      if (error) {
        return { success: false, error: `Error cargando artículo ${article.slug}: ${error.message}` };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

export async function saveProjectsOrder(slugs: string[]): Promise<{ success: boolean; error?: string }> {
  let brandLogos: any[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('projects')
        .select('description')
        .eq('slug', '__settings__')
        .maybeSingle();
      if (data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed.brandLogos)) {
          brandLogos = parsed.brandLogos;
        }
      }
    } catch (e) {}
  } else {
    const logoRaw = localStorage.getItem('craftstudio_crm_brand_logos');
    if (logoRaw) {
      try {
        brandLogos = JSON.parse(logoRaw);
      } catch (e) {}
    }
  }

  const payload = {
    slug: '__settings__',
    client: 'Settings',
    title: 'Custom Order Settings',
    description: JSON.stringify({ customOrder: slugs, isCustomOrderActive: true, brandLogos }),
    category: 'Build Program',
    year: '2026',
    summary: 'System metadata row',
    scope: [],
    cover: null,
    blocks: [],
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('projects')
        .upsert(payload, { onConflict: 'slug' });

      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error updating order' };
    }
  }

  localStorage.setItem('craftstudio_crm_projects_order', JSON.stringify(slugs));
  return { success: true };
}

export async function saveArticlesOrder(slugs: string[], sortMode: 'date' | 'custom'): Promise<{ success: boolean; error?: string }> {
  const payload = {
    id: '00000000-0000-0000-0000-000000000000',
    slug: '__settings__',
    title: 'Custom Order Settings',
    date: '2026',
    category: 'Estrategia',
    image: '',
    desc: JSON.stringify({ customOrder: slugs, sortMode }),
    content: 'System metadata row',
    blocks: [],
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('craft_lab_articles')
        .upsert(payload, { onConflict: 'slug' });

      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error updating order' };
    }
  }

  localStorage.setItem('craftstudio_crm_articles_order', JSON.stringify({ customOrder: slugs, sortMode }));
  return { success: true };
}

export async function fetchBrandLogos(): Promise<Array<{ publicId: string; alt: string }>> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('description')
        .eq('slug', '__settings__')
        .maybeSingle();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed.brandLogos)) {
          return parsed.brandLogos;
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  const orderRaw = localStorage.getItem('craftstudio_crm_brand_logos');
  if (orderRaw) {
    try {
      return JSON.parse(orderRaw);
    } catch (e) {}
  }

  return [
    { publicId: 'yokoo_jdzsmb', alt: 'Yokoo Studio' },
    { publicId: 'sunkiss_l22ice', alt: 'Sunkiss' },
    { publicId: 'nomade_zhi6vi', alt: 'Nómade Café' },
  ];
}

export async function saveBrandLogos(logos: Array<{ publicId: string; alt: string }>): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      let customOrder: string[] = [];
      const { data } = await supabase
        .from('projects')
        .select('description')
        .eq('slug', '__settings__')
        .maybeSingle();
      
      if (data && data.description) {
        try {
          const parsed = JSON.parse(data.description);
          if (Array.isArray(parsed.customOrder)) {
            customOrder = parsed.customOrder;
          }
        } catch (e) {}
      }

      const payload = {
        slug: '__settings__',
        client: 'Settings',
        title: 'Custom Order Settings',
        description: JSON.stringify({ customOrder, isCustomOrderActive: customOrder.length > 0, brandLogos: logos }),
        category: 'Build Program',
        year: '2026',
        summary: 'System metadata row',
        scope: [],
        cover: null,
        blocks: [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .upsert(payload, { onConflict: 'slug' });

      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error updating logos' };
    }
  }

  localStorage.setItem('craftstudio_crm_brand_logos', JSON.stringify(logos));
  return { success: true };
}

