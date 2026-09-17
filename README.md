# Galería del Calzado — sitio web (Fase 1)

Rediseño del sitio web de Galería del Calzado. Next.js 16 (App Router, Turbopack), TypeScript,
Tailwind CSS v4, Motion. Ver el plan completo en `../` (carpeta raíz del proyecto archivo) y el
brief de diseño para el contexto de negocio.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run lint
```

## Estructura

```
src/
├── app/                    Rutas (App Router). Cada carpeta = una página.
│   └── directorio/[slug]/  Ficha de marca, generada estáticamente (generateStaticParams)
├── components/
│   ├── home/                Secciones de la página de inicio
│   ├── directorio/           Mapa interactivo, lista de marcas, ficha
│   ├── motion/                Reveal/Stagger (animaciones de scroll)
│   └── ui/                    Primitivas de diseño (Button, Container, Section, Field...)
├── data/                    JSON generado desde el material extraído (ver abajo)
├── lib/
│   ├── content/              Modelo de contenido + repositorio (única puerta de acceso a los datos)
│   ├── search-index.ts       Índice para el buscador (Fuse.js)
│   └── analytics.ts          Los 3 eventos de KPI (contactar, ver_mapa, tienda_en_linea)
└── styles/tokens.css        Paleta, tipografía y escala — el archivo a tocar cuando llegue
                              el manual de marca oficial
```

## De dónde salen los datos

`src/data/*.json` se generó originalmente con `python ../scripts/build_seed.py`, que lee
`../data/mapdata_clean.json` (el mapa interactivo del sitio anterior). **Esto ya no aplica**:
desde septiembre de 2026 estos archivos se mantienen a mano contra el padrón de locatarios
vigente que entrega el cliente (ver `docs/PLAN-IMPLEMENTACION.md`, Fase 0). **No vuelvas a
correr `build_seed.py`** — sobrescribiría las reasignaciones, altas y bajas ya aplicadas.

Después de cualquier edición manual de `locales.json`, `marcas.json` o `amenidades.json`, corre:

```bash
npm run validar-datos
```

Verifica relaciones cruzadas (marca ↔ local, duplicados, estados) y falla si algo quedó
inconsistente. Es obligatorio antes de commitear cambios a esos archivos.

Esto **no** toca imágenes ni el resto de `public/` — esos archivos se copiaron una sola vez desde
`../imagenes/` y se procesaron con `../scripts/crop_logo_cards.py` (recorta el texto de contacto
que algunos logotipos traían incrustado). Cuando lleguen los logotipos vectorizados oficiales
(SVG o PNG sin fondo), sustitúyelos directamente en `public/logos/<slug>.png` — el componente
`BrandLogo` los toma automáticamente, sin tocar código.

## Decisiones que quedaron pendientes de validar

- **Identidad visual**: la paleta y tipografía en `src/styles/tokens.css` son un punto de partida
  (derivado del monograma y wordmark que ya existían), no el manual de marca oficial.
- **Video del hero**: el único video recuperado del sitio anterior es un spot promocional (con
  sus propios textos), no material ambiental de la plaza — por eso el hero usa el patrón de greca
  de la marca en vez de ese video. Ver `src/components/home/HeroMedia.tsx`.
- **Formularios** (Contacto, Oportunidades): solo interfaz, sin conexión a backend todavía.
- **Datos de marcas**: los teléfonos/correos/redes vienen del mapa interactivo original; conviene
  que administración los valide contra `../Directorio_Galeria_del_Calzado.xlsx` antes de publicar.

## Fase 2 (fuera de este alcance)

Scrollytelling en Nosotros, Temporada/FAQ alimentados por base de datos, formularios conectados,
y el plano del sótano en SVG con locales clickeables (hoy solo existe en PNG).

## Panel de administración (`/admin`)

El panel vivía en un repo aparte (`backend-GDC`) y se fusionó aquí: mismo despliegue, mismo
`layout.tsx` raíz (usa `SiteChrome` para no heredar el header/footer del sitio público),
autenticación por Supabase con `src/proxy.ts` (matcher `/admin/:path*`, no toca el resto del
sitio). Rutas en `src/app/admin/`, cliente/tipos de Supabase en `src/lib/supabase/` y
`src/lib/types/database.ts`, componentes propios del panel en `src/components/admin/ui/` (no
comparten los primitivos de UI del sitio público).

Variables de entorno (`.env.local`, no se commitea — copiarlas del proyecto de Supabase en
Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

El repo `backend-GDC` queda como historial de referencia; una vez validado este panel en
producción, puede archivarse.

## Reseñas de Google (`/admin/resenas`)

Sección de reseñas en el home (`src/components/home/ReviewsSection.tsx`), curada desde
`/admin/resenas`. Combina dos fuentes en la misma tabla `resenas` (Supabase):

- **Google Places API (New)**: trae hasta 5 reseñas por lugar — es el máximo que esa API
  devuelve, no algo que podamos ampliar. Requiere `GOOGLE_PLACES_API_KEY` (proyecto de Google
  Cloud con la Places API "New" habilitada y facturación activa) y `GOOGLE_PLACE_ID`. Sin estas
  variables, el botón "Sincronizar con Google" queda deshabilitado — el resto del panel funciona
  igual.
- **Carga manual**: el equipo de la plaza copia reseñas reales tal cual desde Google Maps para
  tener más de 5. No se scrapea Google Maps automáticamente — viola sus Términos de Servicio.

Desde `/admin/resenas` se elige cuáles de todas estas se muestran en el home y en qué orden
(nunca se edita el texto de una reseña ajena, solo se selecciona/oculta). La migración
correspondiente es `supabase/migrations/0003_resenas.sql`; **todavía no se aplicó** al proyecto
real de Supabase — hay que correrla (`supabase db push` o el MCP de Supabase) y luego regenerar
`src/lib/types/database.ts` con `generate_typescript_types`.

```
# Opcionales
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
NEXT_PUBLIC_GOOGLE_REVIEWS_URL=
```
