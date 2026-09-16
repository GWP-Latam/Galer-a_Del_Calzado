# Plan de implementación — Mapa interactivo premium + rediseño editorial

Documento de ejecución para el agente que implemente el plan. Cada fase es autocontenida,
se ejecuta en orden (0 → 6), se verifica y se commitea antes de pasar a la siguiente.
El plan aprobado por el usuario vive en este documento; no hay decisiones abiertas.

## Reglas de trabajo (leer antes de tocar código)

1. **Next.js 16 con breaking changes**: antes de escribir código de App Router, leer la guía
   relevante en `node_modules/next/dist/docs/` (lo exige `AGENTS.md`). En particular antes de
   crear `src/app/template.tsx` (Fase 1) y rutas nuevas (Fase 2).
2. **Cero dependencias nuevas.** Todo se hace con lo instalado: `motion` (importar de
   `motion/react`), `react-zoom-pan-pinch`, `fuse.js`, `lucide-react`, `clsx`, Tailwind v4.
3. **Datos solo vía repositorio**: componentes y páginas leen contenido únicamente por
   `src/lib/content/repository.ts`. Nunca importar JSON de `src/data/` directo en componentes.
4. **Tokens de diseño**: usar las clases/variables existentes (`bg-paper`, `text-ink`,
   `text-ink-soft`, `border-line`, `accent`, `--state-available-bg/-ink`) definidas en
   `src/styles/tokens.css` + `globals.css`. No inventar colores.
5. **Convenciones de motion ya establecidas** (copiarlas, no reinventarlas): ease
   `[0.16, 1, 0.3, 1]`, entrada `y: 24 → 0`, `whileInView` con
   `viewport={{ once: true, margin: "-10% 0px" }}`, y SIEMPRE rama `useReducedMotion()` que
   degrada a opacity-only. Referencia: `src/components/motion/Reveal.tsx`.
6. **Idioma**: UI, comentarios y nombres de datos en español (como el código existente).
7. **Verificación por fase**: `npm run lint` y `npm run build` deben pasar. Verificar en
   navegador con el dev server (`npm run dev`) lo listado en "Aceptación" de cada fase.
8. **MÓVIL PRIMERO (prioridad explícita del usuario)**: toda prueba visual se hace PRIMERO en
   viewport móvil (375×812, preset "mobile" del browser pane) y solo después en desktop. El
   móvil es el modo principal que debe quedar bien: diseñar cada sección para 375px sin
   saturación — una idea por pantalla, jerarquía clara, targets táctiles ≥ 44px, sin scroll
   horizontal, texto legible sin zoom. Si algo se ve bien en desktop pero apretado en móvil,
   se rediseña para móvil. Recordar recargar la página tras cambiar el preset de viewport.
9. **Commit por fase**, mensaje en español estilo del repo (imperativo, primera línea corta),
   p. ej. `Fase 0: actualiza padrón de locatarios 2026`.
10. Si `AGENTS.md`/`CLAUDE.md` aparecen modificados por `next dev`, commitearlos junto con la
   fase (es comportamiento documentado del framework).

---

## Fase 0 — Actualización del padrón de locatarios

El usuario entregó el padrón vigente (septiembre 2026). Es la fuente de verdad. El diff contra
los datos actuales ya está calculado; aplicar EXACTAMENTE lo siguiente en `src/data/locales.json`
y `src/data/marcas.json`. `id_interno` existentes NO se cambian (los usan las coordenadas).

### 0.1 Marcas nuevas (agregar a `marcas.json`)

Crear con esta plantilla — `descripcion: ""`, `telefonos: []`, `correo/web/tienda_en_linea/instagram/facebook: ""`,
`fotos: []`, `logo: null`, `logo_generico: true`, `revisar: true` (el fallback a iniciales ya lo
resuelve `BrandLogo`):

| slug | nombre | categorias_producto | locales |
|---|---|---|---|
| `paralid` | Paralid | `["Calzado"]` | `["2"]` |
| `icon` | Icon | `["Calzado"]` | `["15"]` |
| `the-west-sun` | The West Sun | `["Calzado"]` | `["31", "50"]` |
| `danoise` | Danoise | `["Calzado"]` | `["31A"]` |
| `beauty-suply` | Beauty Suply | `["Belleza"]` | `["34"]` |
| `koala` | Koala | `["Calzado"]` | `["49"]` |
| `cklass` | Cklass | `["Calzado"]` | `["52"]` |
| `distrito-beauty` | Distrito Beauty | `["Belleza"]` | `["02", "04"]` |

Nota: `cklass` (local 52) es DISTINTA de `cklass-outlet` (local 36); ambas existen.
`distrito-beauty` deja de ser amenidad y pasa a ser marca (ver 0.4).

### 0.2 Marcas dadas de baja (eliminar de `marcas.json`)

`zapateria-luna`, `lob-footwear`, `lady-paulina`, `capa-de-ozono`, `kactus`,
`duque-di-galeano`, `kleiman-store`, `francis-deluxe`.

`francis-deluxe` no desaparece: se FUSIONA con `francis` → en la marca `francis` dejar
`locales: ["20", "40", "42", "55"]`. Si `francis` tiene campos vacíos que `francis-deluxe`
sí tenía (teléfono, logo real), conservar los de `francis-deluxe` al fusionar.

No borrar archivos de `public/logos/` (inofensivos y recuperables).

### 0.3 Reasignaciones en `locales.json` (primer piso, nivel `gc-piso`)

| id_interno | Cambio |
|---|---|
| `localdisponible-15` | `numero: "15"`, `estado: "ocupado"`, `marca_slug: "icon"` |
| `zapaterialuna` (local 19) | `marca_slug: "christian-divat"` (y en marca `christian-divat`: `locales: ["3", "19"]`) |
| `lob` (local 19A) | `marca_slug: null`, `estado: "disponible"` |
| `lady-paulina` (local 21) | `marca_slug: "sketcher"` (y en marca `sketcher`: `locales: ["21", "22"]`) |
| `capadeozono` (local 28) | `marca_slug: null`, `estado: "disponible"` |
| `andrea` (local 31) | `marca_slug: "the-west-sun"` |
| `localdisponible-49` | `numero: "49"`, `estado: "ocupado"`, `marca_slug: "koala"` |
| `localdisponible-50` | `numero: "50"`, `estado: "ocupado"`, `marca_slug: "the-west-sun"` |
| `duque-di-galeano` (local 52) | `marca_slug: "cklass"` |
| `kactus` (local 54) | `marca_slug: "andrea"` (y en marca `andrea`: `locales: ["54"]`) |
| `francis-deluxe`, `francis-deluxe2`, `francis-deluxe3` (55/40/42) | `marca_slug: "francis"` |
| `cuple-bsupply-colors` | `numero: "34"`, `amenidad_nombre: null`, `marca_slug: "beauty-suply"` |

Locales NUEVOS (no existen hoy) — crear registros con coordenadas provisionales interpoladas
entre vecinos (la posición fina se corrige en Fase 2 con el editor):

| id_interno | numero | nivel | x, y provisional | marca_slug |
|---|---|---|---|---|
| `paralid` | `"2"` | `gc-piso` | punto medio entre locales 1 y 3 | `"paralid"` |
| `danoise` | `"31A"` | `gc-piso` | punto medio entre locales 31 y 32 | `"danoise"` |

Sin cambios (ya coinciden con el padrón): 1, 3, 4, "5 y 6" (amenidad Banco Santander cubre
5 y 6 — se queda igual), 7–14, 16–18, 19B, 20, 22–27A, 29, 30, 32, 33, 35–48 excepto los
listados, 51, 53, 56–63, y la amenidad Steria Coffee en el 38 (se queda como amenidad).

### 0.4 Sótano

| id_interno | Cambio |
|---|---|
| `kleiman-store` (numero "01") | `marca_slug: "scarpe"` (y en marca `scarpe`: `locales: ["63", "01"]`) |
| `administracion` (numero "L-2, Lob 1, 02") | `numero: "02"`, `amenidad_nombre: null`, `marca_slug: "distrito-beauty"` |
| `scarpe-l2` (numero "L-2, Lob 1, 04") | `numero: "04"`, `marca_slug: "distrito-beauty"` |
| `distrito beauty` (numero "L-2, Lob 2, 07") | ELIMINAR registro (Distrito Beauty ya no está en el 07) |
| `damas`, `caballeros` | sin cambios (WC) |

En `amenidades.json`: eliminar la entrada "Distrito Beauty" y la de "Cuple/Bsupply/Colors" si
existe; CONSERVAR "Administración" como amenidad pero SIN local numerado propio (dejar su campo
`local` en `""` o el texto "Lobby 1") y `revisar: true` — el padrón la ubica "cerca" de los
locales 01/02, no dentro de uno.

### 0.5 Cierre de fase

- Documentar en `README.md`: los JSON de `src/data/` se mantienen a mano desde este padrón;
  `../scripts/build_seed.py` queda obsoleto como fuente (no volver a regenerar encima).
- Escribir un script de validación `scripts/validar-datos.mjs` (Node puro, sin deps) que
  verifique: cada `marca.locales[]` tiene su local con `marca_slug` recíproco; no hay
  `marca_slug` huérfanos; no hay `numero` duplicado por nivel; `estado: "disponible"` implica
  `marca_slug: null`. Agregar script npm `"validar-datos"`. Debe pasar limpio.

**Aceptación**: `npm run validar-datos`, `lint` y `build` pasan; en `/directorio` se ven las
marcas nuevas con iniciales, 19A y 28 como disponibles, y la ficha `/directorio/francis`
muestra 4 locales.

---

## Fase 1 — Sistema de motion global

### 1.1 Transición de página
Crear `src/app/template.tsx` (client component): envuelve `children` en `motion.div` con
entrada `opacity 0→1, y 12→0`, duración ~0.45s, ease de la regla 5. App Router re-monta
`template.tsx` en cada navegación — es la vía idiomática sin librerías. Con reduced motion:
solo opacity. Verificar en los docs de `node_modules/next/dist/docs/` la firma vigente de
template en Next 16.

### 1.2 Nuevas primitivas en `src/components/motion/`
Mismo estilo de API que `Reveal` (props `children`, `className`, `delay?`):

- **`TextReveal.tsx`**: título display revelado por líneas — cada línea en un contenedor
  `overflow-hidden` y la línea sube `y: "110%" → 0` con stagger de 80ms. Prop `as?` para el
  tag (`h1`/`h2`/`p`). Dividir por `<br>` explícitos o por palabras agrupadas; no medir DOM.
- **`ImageReveal.tsx`**: wrapper para imágenes — `clip-path: inset(0 0 100% 0)` → `inset(0)`
  mientras la imagen interna hace `scale 1.15 → 1` (estilo La Perla).
- **`Counter.tsx`**: número que cuenta de 0 al valor al entrar en viewport (usar
  `useMotionValue` + `animate` de motion, `once: true`). Props: `value`, `suffix?` (p. ej. "+").
- **`Parallax.tsx`**: desplaza a sus children ±N px con `useScroll` + `useTransform` +
  `useSpring` (patrón ya usado en `src/components/nosotros/AnimatedTimeline.tsx`). Prop
  `offset?` (default 40). Desactivado con reduced motion.

### 1.3 Salidas animadas en grids filtrables
En `src/components/promociones/PromoFilterGrid.tsx`: envolver las tarjetas en
`AnimatePresence mode="popLayout"` + `motion.div layout` con `exit={{ opacity: 0, scale: 0.96 }}`,
para que al cambiar filtro las tarjetas entren/salgan animadas. (El directorio recibe lo suyo
en Fase 3.)

**Aceptación**: navegar entre rutas muestra la transición; una página de prueba no hace falta —
aplicar `Counter` ya en Fase 5. `lint` + `build` pasan. Con
`prefers-reduced-motion: reduce` (emular en devtools del navegador) no hay movimiento, solo fades.

---

## Fase 2 — Geometría de locales + editor de trazado

### 2.1 Datos
- Crear `src/data/locales-geometria.json`:
  `{ "<id_interno>": { "puntos": [[x, y], ...] } }` — polígono en coordenadas normalizadas
  0–1 sobre el frame 1306×960 del nivel (mismo convenio que `x`/`y` de los pines).
- En `types.ts`: `export type PuntoNormalizado = [number, number];` y en `Local` agregar
  `geometria?: PuntoNormalizado[]`.
- En `repository.ts`: `getLocales()` fusiona la geometría por `id_interno` (import del JSON
  nuevo, spread sobre cada local). Los llamadores no cambian.

### 2.2 Semilla automática
Script `scripts/generar-geometria-inicial.mjs`: para cada local genera un rectángulo por
defecto centrado en su pin (`x ± 0.018`, `y ± 0.024` — ajustar a ojo tras verlo render) y
escribe `locales-geometria.json`. Así el mapa de Fase 3 funciona completo desde el día uno y
el trazado fino es solo refinamiento.

### 2.3 Editor de trazado (dev-only)
`src/app/dev/mapa-editor/page.tsx` + componente client. En producción:
`if (process.env.NODE_ENV === "production") notFound();`.

Funciones mínimas:
- Selector de nivel; muestra el plano (`nivel.plano ?? plano_raster`) a tamaño completo con un
  `<svg>` overlay `viewBox="0 0 1306 960"`.
- Lista lateral de locales del nivel (número + marca); al elegir uno, su polígono actual se
  resalta y entra en modo edición.
- Edición: arrastrar vértices existentes; clic sobre una arista agrega vértice; tecla
  `Backspace` borra el vértice activo; botón "Rectángulo desde pin" restaura la semilla.
- Botón **"Copiar JSON"**: escribe al portapapeles el `locales-geometria.json` completo
  actualizado, para pegarlo en el archivo. (No hace falta API de escritura; mantenerlo simple.)
- Guardar borrador en `localStorage` (try/catch) para no perder trabajo entre recargas.

El trazado fino de los 72 locales lo hace el usuario con esta herramienta cuando quiera; NO
bloquea las fases siguientes gracias a la semilla 2.2.

**Aceptación**: `/dev/mapa-editor` opera en dev y da 404 en `next build && next start`;
`locales-geometria.json` tiene entrada para los 74 locales (72 + los 2 nuevos de Fase 0);
`build` pasa.

---

## Fase 3 — Mapa interactivo premium (el corazón)

Rehacer el render de `src/components/directorio/InteractiveMap.tsx` CONSERVANDO: el
`TransformWrapper` (minScale 1, maxScale 6, centerOnInit), los controles de zoom, el umbral
`LOGO_ZOOM_THRESHOLD`, los tooltips contra-escalados (`scale(1/scale)`) y el modo read-only
(prop `onSelectLocal` opcional).

### 3.1 Capa de formas
Dentro del contenedor con aspect-ratio, encima del `<Image>` del plano: un `<svg>` absoluto
`viewBox="0 0 1306 960"` `preserveAspectRatio="none"` con un `<motion.polygon>` por local que
tenga `geometria` (puntos multiplicados por 1306/960). Los pines actuales se conservan como
etiqueta central (número/logo) pero dejan de ser el único target: el polígono completo es
clicable (`onClick`, `tabIndex=0`, `role="button"`, `aria-label` con marca + local, Enter/Space
activan).

### 3.2 Estados visuales (con tokens)
- Base: `fill` transparente, `stroke` sutil (`--color-line`).
- Hover/focus: fill tenue de tinta (~8% opacidad) + cursor-pointer.
- **Seleccionado**: fill de acento suave + trazo de acento que se dibuja con
  `initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}` + el logo/las iniciales de la marca
  centrados en el bounding box del polígono.
- **Disponible** (19A y 28): fill `--state-available-bg`; su tarjeta de info muestra CTA
  "Renta este local" → `/oportunidades/locales`.
- Amenidad: contorno discontinuo + icono lucide del dato (`amenidades.json`).

### 3.3 Cámara animada
Al seleccionar marca en la lista: calcular el bounding box del polígono destino y usar
`setTransform(x, y, scale, 600, "easeOut")` del ref del `TransformWrapper` para volar y
encuadrarlo (scale objetivo ~2.5, clamp a maxScale). Hoy solo se marca el pin; esto es lo que
da la sensación "Proxymo".

### 3.4 Entrada del mapa
Al montar el nivel: polígonos aparecen con stagger (~15ms por local, opacity + scale 0.97→1
desde su centro) y después los logos "caen" (`y: -8 → 0`) sobre sus locales. Reutilizable por
la Fase 4. Con reduced motion: sin stagger, fade simple.

### 3.5 Explorador (`DirectorioExplorer.tsx`)
- **Búsqueda con Fuse.js** (ya instalada): índice sobre `nombre` + `categorias_producto`,
  umbral ~0.35, en vez del `includes` actual.
- **Chips de categoría**: derivar el set de `categorias_producto` de todas las marcas; chips
  horizontales scrolleables arriba de la lista; filtro combinable con la búsqueda; animar el
  grid de lista con `AnimatePresence` (patrón de Fase 1.3).
- **Cambio de nivel**: crossfade entre planos (`AnimatePresence` sobre el contenido del mapa
  keyed por `nivel.id`).
- **Móvil**: la tarjeta de info del local pasa a bottom-sheet fija (`position: fixed; bottom`)
  con drag-to-dismiss de motion (`drag="y"` + `dragConstraints`), en vez de quedar debajo del
  mapa. En desktop se queda donde está.
- Mantener el toggle Lista/Mapa y el `scrollIntoView` al seleccionar desde el mapa.

### 3.6 Ficha de marca (`src/app/directorio/[slug]/page.tsx`)
El mapa embebido "Dónde encontrarla" resalta el/los polígonos de la marca (ya recibe
`selectedSlug`; con 3.1–3.2 esto funciona solo — verificar que marcas multi-local como
`francis` resalten sus 4 formas y que el estado seleccionado no dependa de un único local).

**Aceptación** (en navegador): buscar "Andrea" → la cámara vuela al local 54 y la forma se
ilumina con el trazo animado; clic en local 28 → tarjeta con CTA de renta; Distrito Beauty
resalta en sótano; teclado: Tab recorre locales y Enter selecciona; móvil 375px: bottom-sheet
y toggle funcionan; `lint` + `build` pasan.

---

## Fase 4 — Entrada cinemática 2D al directorio

Secuencia de apertura en `/directorio`, una vez por sesión (`sessionStorage`, try/catch),
saltable con clic/tecla, desactivada por completo con reduced motion:

1. Overlay sobre el mapa: monograma + greca (assets en `public/`) con fade.
2. El plano arranca alejado y elevado (`initial` del TransformWrapper / wrapper con scale 1.15
   y blur ligero) y "desciende" a encuadre normal (~1.2s).
3. Dispara la entrada de Fase 3.4 (stagger de formas + caída de logos).

Implementación: orquestar con variants/`animate` de motion en `DirectorioExplorer` +
`setTransform` inicial; sin librerías nuevas. Total < 2.5s.

**Aceptación**: primera visita muestra la secuencia; recargar en la misma pestaña ya no;
con reduced motion no existe; el mapa queda 100% operable al terminar o al saltarla.

---

## Fase 5 — Home editorial

1. **Stats** — nueva sección `src/components/home/StatsSection.tsx` tras el BrandMarquee:
   3–4 `Counter` grandes (fuente display Bodoni). Los valores se CALCULAN de repository (no
   hardcodear): marcas = `getMarcas().length`, locales = `getLocales().length`, niveles =
   `getNiveles().length`. Etiquetas: "marcas", "locales", "niveles". Si `plaza.json` no tiene
   año de fundación, omitir ese stat (no inventarlo).
2. **StyleCategories** (`src/components/home/StyleCategories.tsx`): usar por fin
   `cat.imagen` (fotos reales en `public/estilos/`, hoy ignoradas) dentro de `ImageReveal`,
   conservando el bento grid asimétrico, el hover `scale-105` existente y un caption editorial
   (nombre + `perfil` del JSON). La greca queda como fallback si `imagen` faltara.
3. **Hero** (`src/components/home/Hero.tsx`): título con `TextReveal`; monograma/greca de
   fondo con `Parallax` sutil (offset ~30).
4. **Ritmo**: aplicar `Reveal`/`Stagger` (ya existen) a las secciones de la home que aún no
   los usen, con más aire vertical entre secciones (`Section` de `ui/`).

Nota de contenido: no hay fotografía de la plaza en el repo; no bloquear — el diseño funciona
con los assets actuales y las fotos se conectan cuando el cliente las entregue.

**Aceptación**: home con contadores animados al hacer scroll, categorías con foto y reveal,
hero con reveal de texto; sin CLS visible (reservar espacio de imágenes); `lint` + `build`.

---

## Fase 6 — Promociones con vigencia y marca

Los tipos ya existen (`Promocion.vigente_desde/vigente_hasta/marca_slug` en `types.ts`); falta
usarlos:

1. `repository.ts` → `getPromocionesVigentes()`: filtrar por fecha real — sin `vigente_hasta`
   se considera vigente; con fechas, `vigente_desde <= hoy <= vigente_hasta` (comparación de
   strings ISO `YYYY-MM-DD`, patrón de `getEventoDestacado`). Quitar el comentario "Fase 1".
2. `PromoFilterGrid`: badge "Termina pronto" cuando falten ≤ 7 días para `vigente_hasta`;
   si `marca_slug` existe, la tarjeta enlaza a `/directorio/[slug]` y muestra el `BrandLogo`.
3. Poblar `promociones.json` demo con fechas variadas (una vencida para probar el filtro,
   una que termina pronto, una sin fechas).
4. Las entradas/salidas animadas del filtro ya quedaron en Fase 1.3 — verificar que siguen.

**Aceptación**: la promo vencida no aparece; el badge sale solo en la que termina pronto;
la tarjeta con marca navega a la ficha; `lint` + `build`.

---

## Verificación final (tras Fase 6)

1. `npm run validar-datos && npm run lint && npm run build` — todo limpio.
2. Recorrido completo en navegador (desktop y 375px): home → directorio (cinemática →
   buscar → volar al local → ficha) → promociones → oportunidades.
3. `prefers-reduced-motion`: sin cinemática, sin parallax, solo fades.
4. `/dev/mapa-editor` responde 404 en build de producción.
5. Reportar al usuario: el diff aplicado del padrón (altas/bajas/reasignaciones y los
   `revisar: true` pendientes de logos/contactos) y recordarle que el trazado fino de formas
   se hace en `/dev/mapa-editor`.
