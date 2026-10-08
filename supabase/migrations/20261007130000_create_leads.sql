-- BAYONA · lead capture
-- Ejecutar en un proyecto Supabase antes de configurar VITE_SUPABASE_URL
-- y VITE_SUPABASE_ANON_KEY. El cliente anónimo puede insertar, pero nunca
-- seleccionar, actualizar ni borrar leads.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  contact text not null check (char_length(trim(contact)) between 3 and 254),
  source text not null default 'lead-magnet',
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "public_can_insert_leads" on public.leads;
create policy "public_can_insert_leads"
on public.leads
for insert
to anon, authenticated
with check (
  source = 'lead-magnet'
  and char_length(trim(name)) between 2 and 120
  and char_length(trim(contact)) between 3 and 254
);

-- Deliberadamente no existe policy SELECT para anon/authenticated.
-- La lectura de leads debe hacerse desde el panel seguro de Supabase o desde
-- un backend con service_role; esa clave nunca debe llegar al navegador.

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_source_created_at_idx
  on public.leads (source, created_at desc);
