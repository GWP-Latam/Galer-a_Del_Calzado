-- Reseñas de la plaza mostradas en el home. Combinan dos fuentes: hasta 5
-- traídas automáticamente de la Google Places API (New) — es el máximo que
-- esa API devuelve por lugar, no una limitación nuestra — y las que el
-- equipo de la plaza copia a mano desde Google Maps para tener más de 5.
-- El destacar/ocultar es solo curaduría de cuáles se muestran: nunca se
-- reescribe el texto de una reseña ajena.

create type resena_fuente as enum ('google', 'manual');

create table resenas (
  id uuid primary key default gen_random_uuid(),
  fuente resena_fuente not null default 'manual',
  google_review_id text unique, -- null en las manuales; evita duplicar al re-sincronizar
  autor_nombre text not null,
  autor_foto_url text,
  calificacion smallint not null check (calificacion between 1 and 5),
  texto text not null,
  fecha_resena date,
  destacada boolean not null default false, -- si aparece en el home
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger resenas_set_updated_at before update on resenas
  for each row execute function set_updated_at();

alter table resenas enable row level security;

create policy "public read resenas destacadas" on resenas for select using (destacada);
create policy "super_admin all resenas" on resenas for all using (is_super_admin()) with check (is_super_admin());
