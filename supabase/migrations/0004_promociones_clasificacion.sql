-- Reemplaza la lista plana de categorías de promociones (liquidación /
-- descuentos / rebajas / deportivo / lujo / casual) por tres ejes:
--   tipo_oferta  la mecánica (una sola): descuento, 2x1, precio especial...
--   publico      para quién (varios; vacío = toda la familia)
--   calzado      qué calzado (varios; vacío = toda la tienda)
-- Ver src/lib/promociones/clasificacion.ts. Es aditiva: la columna
-- `categorias` se queda (el código la sigue llenando) para no romper una
-- versión del sitio anterior a este cambio mientras se despliega.

alter table promociones
  add column if not exists tipo_oferta text,
  add column if not exists publico text[] not null default '{}',
  add column if not exists calzado text[] not null default '{}';

alter table promociones
  drop constraint if exists promociones_tipo_oferta_valido,
  add constraint promociones_tipo_oferta_valido check (
    tipo_oferta is null or tipo_oferta in (
      'descuento', '2x1', 'precio_especial', 'liquidacion',
      'meses_sin_intereses', 'regalo', 'nueva_coleccion'
    )
  ),
  drop constraint if exists promociones_publico_valido,
  add constraint promociones_publico_valido check (publico <@ array['mujer', 'hombre', 'ninos']),
  drop constraint if exists promociones_calzado_valido,
  add constraint promociones_calzado_valido check (calzado <@ array['zapatos', 'sneakers', 'sandalias', 'botas']);

-- Traslado de lo que ya existe. Solo lo inequívoco; el resto lo deduce el
-- sitio del título/descripción mientras tipo_oferta siga en null.
update promociones set tipo_oferta = 'liquidacion'
  where tipo_oferta is null and 'liquidacion' = any (categorias);
update promociones set calzado = array['sneakers']
  where calzado = '{}' and 'deportivo' = any (categorias);
