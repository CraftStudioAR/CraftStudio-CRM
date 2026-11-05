-- Permite elegir el tamaño de la bajada dentro de una nota de Craft Lab.
-- Las notas existentes quedan como estaban (lg es el tamaño que ya tenían).
alter table public.craft_lab_articles
  add column if not exists desc_size text not null default 'lg';
