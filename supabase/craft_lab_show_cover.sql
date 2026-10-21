-- Permite ocultar la portada dentro de una nota de Craft Lab.
-- La portada se sigue usando en la grilla; las notas existentes quedan como estaban.
alter table public.craft_lab_articles
  add column if not exists show_cover boolean not null default true;
