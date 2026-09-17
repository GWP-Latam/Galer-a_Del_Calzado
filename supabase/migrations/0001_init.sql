-- Galería del Calzado — esquema inicial del backend (Fase 2)
-- Mapea 1:1 el modelo de contenido que ya usa el frontend estático
-- (web/src/lib/content/types.ts) más las tablas nuevas para el panel de
-- administración: cuentas por locatario, solicitudes de promoción,
-- fotos de local, oportunidades y mensajes.

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('super_admin', 'locatario');
create type local_estado as enum ('ocupado', 'disponible');
create type amenidad_tipo as enum ('instalacion', 'servicio');
create type promocion_categoria as enum ('liquidacion', 'descuentos', 'rebajas', 'deportivo', 'lujo', 'casual');
create type promocion_estado as enum ('pendiente', 'aprobada', 'rechazada');
create type mensaje_origen as enum ('contacto', 'oportunidades', 'renta', 'empleo', 'publicidad');

-- ============================================================
-- CONTENIDO GENERAL DEL SITIO
-- ============================================================

-- Singleton: una sola fila, igual que plaza.json hoy.
create table plaza (
  id boolean primary key default true check (id),
  nombre text not null default 'Galería del Calzado',
  direccion text not null,
  geo_lat double precision not null,
  geo_lng double precision not null,
  telefono text not null,
  horarios jsonb not null default '[]'::jsonb, -- [{ "dias": "...", "horario": "..." }]
  redes jsonb not null default '{}'::jsonb,     -- { "facebook": "...", "instagram": "...", "tiktok": "..." }
  aviso_privacidad_url text,
  updated_at timestamptz not null default now()
);

create table niveles (
  id text primary key, -- 'sotano' | 'gc-piso'
  nombre text not null,
  plano_svg_url text,
  plano_raster_url text,
  ancho_ref integer not null,
  alto_ref integer not null,
  orden integer not null default 0
);

create table marcas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text not null default '',
  categorias_producto text[] not null default '{}',
  telefonos text[] not null default '{}',
  correo text not null default '',
  web text not null default '',
  tienda_en_linea text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  logo_url text,
  logo_generico boolean not null default true,
  activa boolean not null default true,
  revisar boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table amenidades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo amenidad_tipo not null,
  icono text not null default 'map-pin',
  local_numero text,
  nivel_id text references niveles(id),
  telefonos text[] not null default '{}',
  revisar boolean not null default false
);

-- Pines del mapa interactivo (un local físico, ocupado por una marca,
-- una amenidad, o disponible en renta).
create table locales (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  nivel_id text not null references niveles(id),
  x double precision not null,
  y double precision not null,
  estado local_estado not null default 'ocupado',
  marca_id uuid references marcas(id) on delete set null,
  amenidad_id uuid references amenidades(id) on delete set null
);

create table beneficios (
  id uuid primary key default gen_random_uuid(),
  icono text not null,
  titulo text not null,
  descripcion text not null,
  orden integer not null default 0
);

create table categorias_calzado (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  perfil text not null,
  imagen_url text,
  orden integer not null default 0
);

-- Singleton: banner editorial de temporada en el home.
create table campana (
  id boolean primary key default true check (id),
  activa boolean not null default false,
  titulo text not null default '',
  subtitulo text not null default '',
  imagen_url text,
  cta_label text not null default 'Conocer promociones',
  cta_href text not null default '/promociones',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CUENTAS (una por locatario, más el/los super_admin de la plaza)
-- ============================================================

-- Espejo de auth.users con el rol y, si aplica, la marca que administra.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'locatario',
  marca_id uuid references marcas(id) on delete set null,
  nombre_completo text,
  created_at timestamptz not null default now()
);

-- Al crear el usuario en Supabase Auth (desde el panel, vía Admin API),
-- se le pasa user_metadata: { role, marca_id, nombre_completo }. Este
-- trigger crea el perfil correspondiente automáticamente.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, marca_id, nombre_completo)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'locatario'),
    nullif(new.raw_user_meta_data ->> 'marca_id', '')::uuid,
    new.raw_user_meta_data ->> 'nombre_completo'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- FOTOS DE LOCAL ("mi-local")
-- ============================================================
create table fotos_local (
  id uuid primary key default gen_random_uuid(),
  marca_id uuid not null references marcas(id) on delete cascade,
  imagen_url text not null,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROMOCIONES (solicitudes que sube cada locatario)
-- ============================================================
create table promociones (
  id uuid primary key default gen_random_uuid(),
  marca_id uuid not null references marcas(id) on delete cascade,
  titulo text not null,
  descripcion text not null,
  imagen_url text,
  categorias promocion_categoria[] not null default '{}',
  vigente_desde date not null,
  vigente_hasta date not null,
  destacada boolean not null default false, -- la ÚNICA que el locatario elige mostrar en el home
  estado promocion_estado not null default 'pendiente',
  created_by uuid references profiles(id),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint vigencia_valida check (vigente_hasta > vigente_desde),
  constraint vigencia_maxima check (vigente_hasta <= vigente_desde + interval '6 months')
);

-- Un locatario puede tener varias solicitudes, pero solo UNA marcada
-- como destacada a la vez (respaldo a nivel de base de datos).
create unique index one_destacada_por_marca on promociones (marca_id) where destacada;

-- Si se marca una nueva como destacada, se desmarca la anterior sola,
-- en vez de que el usuario choque con el índice único de arriba.
create or replace function enforce_single_destacada()
returns trigger
language plpgsql
as $$
begin
  if new.destacada then
    update promociones set destacada = false
    where marca_id = new.marca_id and id <> new.id and destacada;
  end if;
  return new;
end;
$$;

create trigger promociones_single_destacada
  before insert or update on promociones
  for each row execute function enforce_single_destacada();

-- ============================================================
-- OPORTUNIDADES
-- ============================================================
create table locales_renta (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  m2 numeric,
  nivel_id text references niveles(id),
  servicios text[] not null default '{}',
  descripcion text not null default '',
  imagenes text[] not null default '{}',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table vacantes (
  id uuid primary key default gen_random_uuid(),
  puesto text not null,
  area text not null,
  tipo text not null,
  descripcion text not null default '',
  marca_id uuid references marcas(id) on delete set null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table espacios_publicitarios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  ubicacion text not null,
  dimensiones text not null,
  descripcion text not null default '',
  imagenes text[] not null default '{}',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NEWSLETTER + MENSAJES DE CONTACTO
-- ============================================================
create table suscriptores_newsletter (
  id uuid primary key default gen_random_uuid(),
  correo text unique not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  origen mensaje_origen not null default 'contacto',
  nombre text not null,
  correo text not null,
  telefono text,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNCIONES AUXILIARES DE RLS
-- ============================================================
create or replace function is_super_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function owns_marca(target_marca_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and marca_id = target_marca_id
  );
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger marcas_set_updated_at before update on marcas
  for each row execute function set_updated_at();
create trigger plaza_set_updated_at before update on plaza
  for each row execute function set_updated_at();
create trigger campana_set_updated_at before update on campana
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table plaza enable row level security;
alter table niveles enable row level security;
alter table marcas enable row level security;
alter table fotos_local enable row level security;
alter table amenidades enable row level security;
alter table locales enable row level security;
alter table beneficios enable row level security;
alter table categorias_calzado enable row level security;
alter table campana enable row level security;
alter table profiles enable row level security;
alter table promociones enable row level security;
alter table locales_renta enable row level security;
alter table vacantes enable row level security;
alter table espacios_publicitarios enable row level security;
alter table suscriptores_newsletter enable row level security;
alter table mensajes_contacto enable row level security;

-- ---- Lectura pública (para que el sitio web la consuma directamente) ----
create policy "public read plaza" on plaza for select using (true);
create policy "public read niveles" on niveles for select using (true);
create policy "public read marcas activas" on marcas for select using (activa);
create policy "public read amenidades" on amenidades for select using (true);
create policy "public read locales" on locales for select using (true);
create policy "public read beneficios" on beneficios for select using (true);
create policy "public read categorias" on categorias_calzado for select using (true);
create policy "public read campana activa" on campana for select using (activa);
create policy "public read promos aprobadas y vigentes" on promociones for select
  using (estado = 'aprobada' and vigente_desde <= current_date and vigente_hasta >= current_date);
create policy "public read locales_renta activos" on locales_renta for select using (activo);
create policy "public read vacantes activas" on vacantes for select using (activo);
create policy "public read espacios activos" on espacios_publicitarios for select using (activo);
create policy "public read fotos_local" on fotos_local for select using (true);

-- ---- Formularios públicos (solo insertar, nunca leer lo de otros) ----
create policy "cualquiera se suscribe" on suscriptores_newsletter for insert with check (true);
create policy "cualquiera envia mensaje" on mensajes_contacto for insert with check (true);

-- ---- super_admin: control total ----
create policy "super_admin all plaza" on plaza for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all niveles" on niveles for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all marcas" on marcas for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all amenidades" on amenidades for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all locales" on locales for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all beneficios" on beneficios for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all categorias" on categorias_calzado for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all campana" on campana for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all profiles" on profiles for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all promociones" on promociones for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all locales_renta" on locales_renta for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all vacantes" on vacantes for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all espacios" on espacios_publicitarios for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all newsletter" on suscriptores_newsletter for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all mensajes" on mensajes_contacto for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin all fotos_local" on fotos_local for all using (is_super_admin()) with check (is_super_admin());

-- ---- locatario: solo su propio perfil y su propia marca ----
create policy "locatario ve su perfil" on profiles for select using (id = auth.uid());

create policy "locatario lee su marca" on marcas for select using (owns_marca(id));
create policy "locatario edita su marca" on marcas for update using (owns_marca(id)) with check (owns_marca(id));

create policy "locatario sube sus fotos" on fotos_local for insert with check (owns_marca(marca_id));
create policy "locatario borra sus fotos" on fotos_local for delete using (owns_marca(marca_id));
create policy "locatario reordena sus fotos" on fotos_local for update using (owns_marca(marca_id)) with check (owns_marca(marca_id));

create policy "locatario ve sus promos" on promociones for select using (owns_marca(marca_id));
create policy "locatario crea sus promos" on promociones for insert
  with check (owns_marca(marca_id) and estado = 'pendiente');
create policy "locatario edita sus promos pendientes" on promociones for update
  using (owns_marca(marca_id) and estado = 'pendiente')
  with check (owns_marca(marca_id));
create policy "locatario borra sus promos pendientes" on promociones for delete
  using (owns_marca(marca_id) and estado = 'pendiente');

-- ============================================================
-- STORAGE (fotos de promociones y de locales)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('promociones', 'promociones', true), ('locales', 'locales', true), ('sitio', 'sitio', true)
on conflict (id) do nothing;

create policy "public read storage promociones" on storage.objects for select using (bucket_id = 'promociones');
create policy "public read storage locales" on storage.objects for select using (bucket_id = 'locales');
create policy "public read storage sitio" on storage.objects for select using (bucket_id = 'sitio');

-- Convención de carpetas: "<marca_id>/archivo.jpg" — así el locatario
-- solo puede subir dentro de su propia carpeta.
create policy "locatario sube fotos de promocion" on storage.objects for insert
  with check (bucket_id = 'promociones' and owns_marca((storage.foldername(name))[1]::uuid));
create policy "locatario sube fotos de local" on storage.objects for insert
  with check (bucket_id = 'locales' and owns_marca((storage.foldername(name))[1]::uuid));
create policy "locatario borra sus propias fotos en storage" on storage.objects for delete
  using (
    bucket_id in ('promociones', 'locales')
    and owns_marca((storage.foldername(name))[1]::uuid)
  );

create policy "super_admin gestiona todo el storage" on storage.objects for all
  using (is_super_admin()) with check (is_super_admin());
