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

// LocalStorage storage keys (solo se usan en modo local, sin Supabase configurado)
const LOCAL_STORAGE_PROJECTS_KEY = 'craftstudio_crm_projects';
const LOCAL_STORAGE_ARTICLES_KEY = 'craftstudio_crm_articles';

// Initialize LocalStorage with seed data if empty (solo modo local)
const initLocalStorage = () => {
  if (!localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
  }
};

if (!isSupabaseConfigured) {
  initLocalStorage();
}

export type SaveResult<T> = {
  success: boolean;
  error?: string;
  /** true cuando el registro cambió en la base desde que se abrió el editor */
  conflict?: boolean;
  /** Registro tal como quedó guardado en la base (con su nuevo updated_at) */
  saved?: T;
};

const SAVE_TIMEOUT_MS = 20000;

const CONFLICT_MESSAGE =
  'No se guardó para no pisar cambios más nuevos: este contenido fue modificado desde otra pestaña, otro dispositivo u otra persona después de que lo abriste. Copiá lo que necesites, volvé al listado y abrilo de nuevo para editar la versión actual.';

const SESSION_EXPIRED_MESSAGE =
  'Tu sesión expiró, así que no se guardó nada. Cerrá sesión, volvé a entrar y repetí el cambio.';

const NO_PERMISSION_MESSAGE =
  'La base de datos rechazó el cambio (sin permisos). Cerrá sesión, volvé a entrar y repetí el cambio.';

const TIMEOUT_MESSAGE =
  'La conexión tardó demasiado y no se pudo confirmar el guardado. Volvé al listado y abrilo de nuevo para ver si el cambio quedó guardado.';

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(TIMEOUT_MESSAGE)), ms);
    Promise.resolve(promise).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function getSessionError(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? null : SESSION_EXPIRED_MESSAGE;
}

function sortBySlugOrder<T extends { slug: string }>(items: T[], customOrder: string[]) {
  items.sort((a, b) => {
    const idxA = customOrder.indexOf(a.slug);
    const idxB = customOrder.indexOf(b.slug);
    const posA = idxA === -1 ? 99999 : idxA;
    const posB = idxB === -1 ? 99999 : idxB;
    return posA - posB;
  });
}

// ==========================================
// PROJECTS API
// ==========================================

function mapProjectRow(item: any): WorkCase {
  let titleStyle = undefined;
  let clientStyle = undefined;
  let summaryStyle = undefined;
  let featured = false;
  try {
    if (item.description && item.description.trim().startsWith('{')) {
      const parsed = JSON.parse(item.description);
      titleStyle = parsed.titleStyle;
      clientStyle = parsed.clientStyle;
      summaryStyle = parsed.summaryStyle;
      featured = parsed.featured || false;
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
    clientStyle,
    summaryStyle,
    featured,
  };
}

function buildProjectPayload(project: WorkCase) {
  return {
    slug: project.slug,
    client: project.client,
    title: project.title || '',
    category: project.category,
    year: project.year,
    summary: project.summary,
    description: JSON.stringify({
      titleStyle: project.titleStyle,
      clientStyle: project.clientStyle,
      summaryStyle: project.summaryStyle,
      featured: project.featured || false,
    }),
    scope: project.scope || [],
    cover: project.cover || { publicId: '', alt: '' },
    blocks: project.blocks || [],
    updated_at: new Date().toISOString(),
  };
}

/**
 * Con Supabase configurado, la base es la ÚNICA fuente de verdad: si la lectura
 * falla se lanza un error en vez de mostrar una copia vieja guardada en el navegador.
 */
export async function fetchProjects(): Promise<WorkCase[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
    }

    const rows = data || [];
    const settingsRow = rows.find((item) => item.slug === '__settings__');
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

    const mappedProjects = rows.filter((item) => item.slug !== '__settings__').map(mapProjectRow);
    if (customOrder.length > 0) {
      sortBySlugOrder(mappedProjects, customOrder);
    }
    return mappedProjects;
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
  const projects: WorkCase[] = raw ? JSON.parse(raw) : INITIAL_PROJECTS;

  const orderRaw = localStorage.getItem('craftstudio_crm_projects_order');
  if (orderRaw) {
    try {
      sortBySlugOrder(projects, JSON.parse(orderRaw) as string[]);
    } catch (e) {
      // Ignore
    }
  }

  return projects.filter((p) => p.slug !== '__settings__');
}

/** Lee la versión actual de un proyecto directo de la base (para abrir el editor siempre fresco). */
export async function fetchProjectBySlug(slug: string): Promise<WorkCase> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).maybeSingle();
    if (error) {
      throw new Error(`No se pudo cargar el proyecto: ${error.message}`);
    }
    if (!data) {
      throw new Error(`El proyecto "${slug}" ya no existe en la base de datos.`);
    }
    return mapProjectRow(data);
  }

  const projects = await fetchProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`El proyecto "${slug}" no existe.`);
  return project;
}

/**
 * Guarda un proyecto.
 * - Proyecto existente (tiene id + updated_at): UPDATE condicionado a que updated_at siga
 *   siendo el que se leyó al abrir el editor. Si alguien lo modificó mientras tanto, no se
 *   pisa nada y se devuelve conflict.
 * - Proyecto nuevo: INSERT (falla si el slug ya existe, nunca sobrescribe).
 */
export async function saveProject(project: WorkCase): Promise<SaveResult<WorkCase>> {
  if (!isSupabaseConfigured || !supabase) {
    return saveProjectLocal(project);
  }

  try {
    const sessionError = await getSessionError();
    if (sessionError) return { success: false, error: sessionError };

    const payload = buildProjectPayload(project);

    if (project.id && project.updated_at) {
      const { data, error } = await withTimeout(
        supabase
          .from('projects')
          .update(payload)
          .eq('id', project.id)
          .eq('updated_at', project.updated_at)
          .select(),
        SAVE_TIMEOUT_MS
      );

      if (error) {
        return { success: false, error: `Error al guardar en Supabase: ${error.message}` };
      }

      if (!data || data.length === 0) {
        // No se actualizó ninguna fila: o cambió en la base (conflicto) o RLS lo bloqueó.
        const { data: current } = await supabase
          .from('projects')
          .select('updated_at')
          .eq('id', project.id)
          .maybeSingle();

        if (!current) {
          return { success: false, error: 'Este proyecto ya no existe en la base de datos (¿fue eliminado?).' };
        }
        if (current.updated_at !== project.updated_at) {
          return { success: false, conflict: true, error: CONFLICT_MESSAGE };
        }
        return { success: false, error: NO_PERMISSION_MESSAGE };
      }

      return { success: true, saved: mapProjectRow(data[0]) };
    }

    const { data, error } = await withTimeout(
      supabase.from('projects').insert(payload).select(),
      SAVE_TIMEOUT_MS
    );

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `Ya existe un proyecto con el slug "${project.slug}". Elegí otro slug.` };
      }
      return { success: false, error: `Error al guardar en Supabase: ${error.message}` };
    }
    if (!data || data.length === 0) {
      return { success: false, error: NO_PERMISSION_MESSAGE };
    }

    return { success: true, saved: mapProjectRow(data[0]) };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

function saveProjectLocal(project: WorkCase): SaveResult<WorkCase> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    const projects: WorkCase[] = raw ? JSON.parse(raw) : INITIAL_PROJECTS;
    const index = projects.findIndex((p) => p.slug === project.slug);
    const saved = { ...project, updated_at: new Date().toISOString() };

    if (index >= 0) {
      projects[index] = saved;
    } else {
      saved.created_at = saved.updated_at;
      projects.unshift(saved);
    }

    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    return { success: true, saved };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al guardar localmente' };
  }
}

export async function deleteProject(slug: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('projects').delete().eq('slug', slug).select('slug');
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: NO_PERMISSION_MESSAGE };
    return { success: true };
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    const projects: WorkCase[] = raw ? JSON.parse(raw) : INITIAL_PROJECTS;
    const filtered = projects.filter((p) => p.slug !== slug);
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error al eliminar' };
  }
}

// ==========================================
// CRAFT LAB ARTICLES API
// ==========================================

function mapArticleRow(item: any): CraftLabArticle {
  return {
    ...item,
    blocks: typeof item.blocks === 'string' ? JSON.parse(item.blocks) : item.blocks || [],
  };
}

function sortArticles(articles: CraftLabArticle[], customOrder: string[], sortMode: 'date' | 'custom') {
  if (sortMode === 'custom' && customOrder.length > 0) {
    sortBySlugOrder(articles, customOrder);
  } else {
    articles.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.created_at || b.date || 0).getTime();
      return dateB - dateA;
    });
  }
}

export async function fetchArticles(): Promise<CraftLabArticle[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('craft_lab_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`No se pudieron cargar los artículos: ${error.message}`);
    }

    const rows = data || [];
    const settingsRow = rows.find((item) => item.slug === '__settings__');
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

    const mappedArticles = rows.filter((item) => item.slug !== '__settings__').map(mapArticleRow);
    sortArticles(mappedArticles, customOrder, sortMode);
    return mappedArticles;
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
  const articles: CraftLabArticle[] = raw ? JSON.parse(raw) : INITIAL_ARTICLES;

  const orderRaw = localStorage.getItem('craftstudio_crm_articles_order');
  if (orderRaw) {
    try {
      const parsed = JSON.parse(orderRaw);
      sortArticles(articles, parsed.customOrder as string[], parsed.sortMode as 'date' | 'custom');
    } catch (e) {
      // Ignore
    }
  }

  return articles.filter((a) => a.slug !== '__settings__');
}

/** Lee la versión actual de un artículo directo de la base (para abrir el editor siempre fresco). */
export async function fetchArticleBySlug(slug: string): Promise<CraftLabArticle> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('craft_lab_articles').select('*').eq('slug', slug).maybeSingle();
    if (error) {
      throw new Error(`No se pudo cargar el artículo: ${error.message}`);
    }
    if (!data) {
      throw new Error(`El artículo "${slug}" ya no existe en la base de datos.`);
    }
    return mapArticleRow(data);
  }

  const articles = await fetchArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) throw new Error(`El artículo "${slug}" no existe.`);
  return article;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Misma estrategia que saveProject: UPDATE condicionado por updated_at o INSERT si es nuevo. */
export async function saveArticle(article: CraftLabArticle): Promise<SaveResult<CraftLabArticle>> {
  if (!isSupabaseConfigured || !supabase) {
    return saveArticleLocal(article);
  }

  try {
    const sessionError = await getSessionError();
    if (sessionError) return { success: false, error: sessionError };

    const payload = {
      slug: article.slug,
      title: article.title,
      date: article.date,
      category: article.category,
      image: article.image,
      desc: article.desc,
      aspect: article.aspect || 'aspect-[4/5]',
      show_cover: article.show_cover !== false,
      content: article.content,
      blocks: article.blocks || [],
      updated_at: new Date().toISOString(),
    };

    if (article.id && UUID_RE.test(article.id) && article.updated_at) {
      const { data, error } = await withTimeout(
        supabase
          .from('craft_lab_articles')
          .update(payload)
          .eq('id', article.id)
          .eq('updated_at', article.updated_at)
          .select(),
        SAVE_TIMEOUT_MS
      );

      if (error) {
        return { success: false, error: `Error al guardar artículo en Supabase: ${error.message}` };
      }

      if (!data || data.length === 0) {
        const { data: current } = await supabase
          .from('craft_lab_articles')
          .select('updated_at')
          .eq('id', article.id)
          .maybeSingle();

        if (!current) {
          return { success: false, error: 'Este artículo ya no existe en la base de datos (¿fue eliminado?).' };
        }
        if (current.updated_at !== article.updated_at) {
          return { success: false, conflict: true, error: CONFLICT_MESSAGE };
        }
        return { success: false, error: NO_PERMISSION_MESSAGE };
      }

      return { success: true, saved: mapArticleRow(data[0]) };
    }

    const { data, error } = await withTimeout(
      supabase
        .from('craft_lab_articles')
        .insert({ ...payload, id: crypto.randomUUID() })
        .select(),
      SAVE_TIMEOUT_MS
    );

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `Ya existe un artículo con el slug "${article.slug}". Elegí otro slug.` };
      }
      return { success: false, error: `Error al guardar artículo en Supabase: ${error.message}` };
    }
    if (!data || data.length === 0) {
      return { success: false, error: NO_PERMISSION_MESSAGE };
    }

    return { success: true, saved: mapArticleRow(data[0]) };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

function saveArticleLocal(article: CraftLabArticle): SaveResult<CraftLabArticle> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
    const articles: CraftLabArticle[] = raw ? JSON.parse(raw) : INITIAL_ARTICLES;
    const index = articles.findIndex((a) => a.slug === article.slug || a.id === article.id);
    const now = new Date().toISOString();
    const saved: CraftLabArticle = { ...article, id: article.id || Date.now().toString(), updated_at: now };

    if (index >= 0) {
      articles[index] = saved;
    } else {
      saved.created_at = now;
      articles.unshift(saved);
    }

    localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(articles));
    return { success: true, saved };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al guardar localmente' };
  }
}

export async function deleteArticle(slugOrId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const filter = UUID_RE.test(slugOrId) ? `slug.eq.${slugOrId},id.eq.${slugOrId}` : `slug.eq.${slugOrId}`;
    const { data, error } = await supabase.from('craft_lab_articles').delete().or(filter).select('id');
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: NO_PERMISSION_MESSAGE };
    return { success: true };
  }

  const articles = await fetchArticles();
  const filtered = articles.filter((a) => a.slug !== slugOrId && a.id !== slugOrId);
  localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(filtered));
  return { success: true };
}

// Reset LocalStorage back to initial data (solo modo local)
export function resetLocalData() {
  localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
}

export async function saveProjectsOrder(slugs: string[]): Promise<{ success: boolean; error?: string }> {
  const defaultLogos = [
    { publicId: 'yokoo_jdzsmb', alt: 'Yokoo Studio' },
    { publicId: 'sunkiss_l22ice', alt: 'Sunkiss' },
    { publicId: 'nomade_zhi6vi', alt: 'Nómade Café' },
  ];
  let brandLogos: any[] = defaultLogos;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('projects')
        .select('description')
        .eq('slug', '__settings__')
        .maybeSingle();
      if (data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed.brandLogos) && parsed.brandLogos.length > 0) {
          brandLogos = parsed.brandLogos;
        }
      }
    } catch (e) {}
  } else {
    const logoRaw = localStorage.getItem('craftstudio_crm_brand_logos');
    if (logoRaw) {
      try {
        const parsed = JSON.parse(logoRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          brandLogos = parsed;
        }
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
    cover: { publicId: '', alt: '' },
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
  const defaultLogos = [
    { publicId: 'yokoo_jdzsmb', alt: 'Yokoo Studio' },
    { publicId: 'sunkiss_l22ice', alt: 'Sunkiss' },
    { publicId: 'nomade_zhi6vi', alt: 'Nómade Café' },
  ];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('description')
        .eq('slug', '__settings__')
        .maybeSingle();

      if (!error && data && data.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed.brandLogos) && parsed.brandLogos.length > 0) {
          return parsed.brandLogos;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch brand logos from Supabase', e);
    }
  }

  const orderRaw = localStorage.getItem('craftstudio_crm_brand_logos');
  if (orderRaw) {
    try {
      const parsed = JSON.parse(orderRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  return defaultLogos;
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
        cover: { publicId: '', alt: '' },
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

