#!/usr/bin/env node
/**
 * Sincroniza las tablas `marcas`, `amenidades` y `locales` de Supabase (las
 * que usa el panel /admin) con el padrón vigente en src/data (el que usa el
 * sitio público). Node puro, sin dependencias; habla con la API REST de
 * Supabase usando la service role de .env.local.
 *
 *   npm run sincronizar-supabase            → solo muestra los cambios
 *   npm run sincronizar-supabase -- --aplicar → los escribe
 *
 * Reglas:
 * - Marcas del padrón que no existen en la base se dan de alta (las que ya
 *   existen no se tocan: pueden tener ediciones hechas desde /admin).
 * - Marcas de la base que ya no están en el padrón NO se borran: quedan
 *   `activa = false` (reversible). Sus promociones sí se borran — una marca
 *   que ya no está en la plaza no debe anunciar nada.
 * - Amenidades del padrón que no existen en la base se dan de alta.
 * - Cada local de la base se empata con el del mapa por nivel + número,
 *   tolerando números mal capturados ("15 Disponible", "L-2, Lob 1, 04",
 *   "34, 34A, 34B"), y se corrigen número, estado, marca y amenidad. Los que
 *   faltan se crean; los que ya no existen en el mapa se borran.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APLICAR = process.argv.includes("--aplicar");

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_API = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_API || !KEY) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");

async function api(metodo, ruta, cuerpo) {
  const res = await fetch(`${URL_API}/${ruta}`, {
    method: metodo,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!res.ok) throw new Error(`${metodo} ${ruta}: ${res.status} ${await res.text()}`);
  const texto = await res.text();
  return texto ? JSON.parse(texto) : null;
}

const leer = (nombre) => JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", nombre), "utf8"));
const padronMarcas = leer("marcas.json");
const padronAmenidades = leer("amenidades.json");
const padronLocales = leer("locales.json");

const [dbMarcas, dbAmenidades, dbLocales, dbPromos] = await Promise.all([
  api("GET", "marcas?select=id,slug,nombre,activa"),
  api("GET", "amenidades?select=id,nombre"),
  api("GET", "locales?select=id,numero,nivel_id,estado,marca_id,amenidad_id"),
  api("GET", "promociones?select=id,titulo,marca_id"),
]);

const cambios = [];
const log = (linea) => cambios.push(linea);

// ---------- Marcas ----------
const slugsPadron = new Set(padronMarcas.map((m) => m.slug));
const dbMarcaPorSlug = new Map(dbMarcas.map((m) => [m.slug, m]));

const marcasNuevas = padronMarcas.filter((m) => !dbMarcaPorSlug.has(m.slug));
const marcasBaja = dbMarcas.filter((m) => !slugsPadron.has(m.slug) && m.activa);
const marcasReactivar = dbMarcas.filter((m) => slugsPadron.has(m.slug) && !m.activa);

marcasNuevas.forEach((m) => log(`+ marca      ${m.nombre} (${m.slug})`));
marcasReactivar.forEach((m) => log(`↺ marca      ${m.nombre}: activa = true`));
marcasBaja.forEach((m) => log(`− marca      ${m.nombre} (${m.slug}): activa = false`));

// ---------- Promociones de marcas dadas de baja ----------
const idsBaja = new Set(marcasBaja.map((m) => m.id));
const promosBorrar = dbPromos.filter((p) => idsBaja.has(p.marca_id));
promosBorrar.forEach((p) =>
  log(`✕ promoción  "${p.titulo}" (${dbMarcas.find((m) => m.id === p.marca_id).nombre})`),
);

// ---------- Amenidades ----------
const dbAmenidadPorNombre = new Map(dbAmenidades.map((a) => [a.nombre, a]));
const amenidadesNuevas = padronAmenidades.filter((a) => !dbAmenidadPorNombre.has(a.nombre));
amenidadesNuevas.forEach((a) => log(`+ amenidad   ${a.nombre}`));

// ---------- Locales ----------
const clave = (nivel, numero) => `${nivel}|${numero}`;
const padronPorClave = new Map(padronLocales.map((l) => [clave(l.nivel, l.numero), l]));

/** Números con los que un local mal capturado podría corresponder al del mapa. */
function candidatos(numero) {
  const partes = numero.split(",").map((p) => p.trim());
  return [numero, numero.replace(/\s*disponible$/i, ""), partes.at(-1), partes[0]];
}

const tomados = new Set();
const empates = new Map(); // id local db → local del padrón
// Primero los exactos, para que un número "tolerado" no le gane el lugar a uno exacto.
for (const pasada of ["exacto", "tolerante"]) {
  for (const l of dbLocales) {
    if (empates.has(l.id)) continue;
    const opciones = pasada === "exacto" ? [l.numero] : candidatos(l.numero);
    const k = opciones.map((n) => clave(l.nivel_id, n)).find((c) => padronPorClave.has(c) && !tomados.has(c));
    if (k) {
      tomados.add(k);
      empates.set(l.id, padronPorClave.get(k));
    }
  }
}

const nombreMarca = (id) => dbMarcas.find((m) => m.id === id)?.nombre ?? (id ? "?" : "—");
const nombreAmenidad = (id) => dbAmenidades.find((a) => a.id === id)?.nombre ?? (id ? "?" : "—");

const localesPatch = [];
for (const l of dbLocales) {
  const p = empates.get(l.id);
  if (!p) continue;
  const deseado = {
    numero: p.numero,
    estado: p.estado,
    marca_slug: p.marca_slug,
    amenidad_nombre: p.amenidad_nombre,
  };
  const actualSlug = dbMarcas.find((m) => m.id === l.marca_id)?.slug ?? null;
  const actualAmenidad = dbAmenidades.find((a) => a.id === l.amenidad_id)?.nombre ?? null;
  const difs = [];
  if (l.numero !== deseado.numero) difs.push(`número "${l.numero}" → "${deseado.numero}"`);
  if (l.estado !== deseado.estado) difs.push(`estado ${l.estado} → ${deseado.estado}`);
  if (actualSlug !== deseado.marca_slug)
    difs.push(`marca ${nombreMarca(l.marca_id)} → ${padronMarcas.find((m) => m.slug === deseado.marca_slug)?.nombre ?? "—"}`);
  if (actualAmenidad !== deseado.amenidad_nombre)
    difs.push(`amenidad ${nombreAmenidad(l.amenidad_id)} → ${deseado.amenidad_nombre ?? "—"}`);
  if (difs.length) {
    localesPatch.push({ id: l.id, deseado });
    log(`~ local      ${l.nivel_id} ${deseado.numero}: ${difs.join("; ")}`);
  }
}

const localesNuevos = padronLocales.filter((p) => !tomados.has(clave(p.nivel, p.numero)));
localesNuevos.forEach((p) =>
  log(`+ local      ${p.nivel} ${p.numero}: ${p.marca_slug ?? p.amenidad_nombre ?? p.estado}`),
);
const localesBorrar = dbLocales.filter((l) => !empates.has(l.id));
localesBorrar.forEach((l) =>
  log(`✕ local      ${l.nivel_id} "${l.numero}" (${nombreMarca(l.marca_id)}) — no existe en el mapa`),
);

console.log(cambios.length ? cambios.join("\n") : "Sin diferencias: la base ya coincide con el padrón.");
console.log(`\n${cambios.length} cambios.`);

if (!APLICAR) {
  if (cambios.length) console.log("Modo revisión: no se escribió nada. Corre con --aplicar para escribirlos.");
  process.exit(0);
}

// ---------- Escritura ----------
// Orden: altas primero (los locales las referencian), bajas al final.
for (const m of marcasNuevas) {
  const [creada] = await api("POST", "marcas", {
    slug: m.slug,
    nombre: m.nombre,
    descripcion: m.descripcion,
    categorias_producto: m.categorias_producto,
    telefonos: m.telefonos,
    correo: m.correo,
    web: m.web,
    tienda_en_linea: m.tienda_en_linea,
    instagram: m.instagram,
    facebook: m.facebook,
    logo_url: m.logo,
    logo_generico: m.logo_generico,
    revisar: m.revisar,
    activa: true,
  });
  dbMarcas.push(creada);
}
for (const m of marcasReactivar) await api("PATCH", `marcas?id=eq.${m.id}`, { activa: true });

for (const a of amenidadesNuevas) {
  const [creada] = await api("POST", "amenidades", {
    nombre: a.nombre,
    tipo: a.tipo,
    icono: a.icono,
    local_numero: a.local,
    nivel_id: a.nivel,
    telefonos: a.telefonos,
    revisar: a.revisar,
  });
  dbAmenidades.push(creada);
}

const idMarca = (slug) => (slug ? dbMarcas.find((m) => m.slug === slug).id : null);
const idAmenidad = (nombre) => (nombre ? dbAmenidades.find((a) => a.nombre === nombre).id : null);

for (const { id, deseado } of localesPatch) {
  await api("PATCH", `locales?id=eq.${id}`, {
    numero: deseado.numero,
    estado: deseado.estado,
    marca_id: idMarca(deseado.marca_slug),
    amenidad_id: idAmenidad(deseado.amenidad_nombre),
  });
}
for (const p of localesNuevos) {
  await api("POST", "locales", {
    numero: p.numero,
    nivel_id: p.nivel,
    x: p.x,
    y: p.y,
    estado: p.estado,
    marca_id: idMarca(p.marca_slug),
    amenidad_id: idAmenidad(p.amenidad_nombre),
  });
}
for (const l of localesBorrar) await api("DELETE", `locales?id=eq.${l.id}`);

for (const p of promosBorrar) await api("DELETE", `promociones?id=eq.${p.id}`);
for (const m of marcasBaja) await api("PATCH", `marcas?id=eq.${m.id}`, { activa: false });

console.log("Aplicado.");
