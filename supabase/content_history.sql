-- Historial automático de versiones para proyectos y artículos de Craft Lab.
--
-- Cada vez que una fila de `projects` o `craft_lab_articles` se modifica o se borra
-- (desde el CRM, un script o el dashboard), se guarda una copia de la versión ANTERIOR.
-- Si algún cambio se pisa, se puede recuperar desde acá.
--
-- Cómo instalarlo: Supabase → SQL Editor → pegar este archivo completo → Run.
-- Es idempotente: se puede correr más de una vez sin romper nada.

create table if not exists public.content_history (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id text,
  slug text,
  operation text not null,
  old_row jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by uuid default auth.uid()
);

create index if not exists content_history_slug_idx
  on public.content_history (table_name, slug, changed_at desc);

alter table public.content_history enable row level security;

-- Solo usuarios logueados pueden leer el historial. Nadie puede escribirlo desde la API:
-- lo llena exclusivamente el trigger.
drop policy if exists "authenticated can read history" on public.content_history;
create policy "authenticated can read history"
  on public.content_history for select to authenticated using (true);

create or replace function public.log_content_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.content_history (table_name, row_id, slug, operation, old_row)
  values (TG_TABLE_NAME, OLD.id::text, OLD.slug, TG_OP, to_jsonb(OLD));
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists projects_history on public.projects;
create trigger projects_history
  before update or delete on public.projects
  for each row execute function public.log_content_history();

drop trigger if exists craft_lab_articles_history on public.craft_lab_articles;
create trigger craft_lab_articles_history
  before update or delete on public.craft_lab_articles
  for each row execute function public.log_content_history();

-- ---------------------------------------------------------------------------
-- Consultas útiles
-- ---------------------------------------------------------------------------
--
-- Ver las versiones anteriores de un proyecto (la más reciente primero):
--   select id, changed_at, operation, old_row->'blocks' as blocks
--   from public.content_history
--   where table_name = 'projects' and slug = 'sunkiss'
--   order by changed_at desc;
--
-- Restaurar un proyecto a una versión del historial (reemplazar 123 por el id elegido):
--   update public.projects p
--   set blocks = h.old_row->'blocks',
--       description = h.old_row->>'description',
--       summary = h.old_row->>'summary',
--       updated_at = now()
--   from public.content_history h
--   where h.id = 123 and p.slug = h.slug;
