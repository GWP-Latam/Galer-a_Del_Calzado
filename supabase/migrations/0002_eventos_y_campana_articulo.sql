-- Extiende campana para soportar su propia pagina de articulo (slug,
-- concepto en parrafos, galeria de imagenes) y agrega la tabla eventos,
-- con soporte de periodo (fecha_inicio/fecha_fin), no solo un dia.

alter table campana
  add column if not exists slug text not null default 'temporada',
  add column if not exists concepto text[] not null default '{}',
  add column if not exists imagenes text[] not null default '{}';

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  descripcion text not null default '',
  fecha_inicio date not null,
  fecha_fin date not null,
  imagen_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  constraint eventos_rango_valido check (fecha_fin >= fecha_inicio)
);

alter table eventos enable row level security;

create policy "public read eventos activos" on eventos for select using (activo);
create policy "super_admin all eventos" on eventos for all using (is_super_admin()) with check (is_super_admin());
