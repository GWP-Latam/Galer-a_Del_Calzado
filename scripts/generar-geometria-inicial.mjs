#!/usr/bin/env node
/**
 * Genera src/data/locales-geometria.json a partir de las coordenadas x/y
 * (el centroide del pin) de cada local en locales.json: un rectángulo por
 * defecto centrado en ese punto. Así el mapa de la Fase 3 funciona con
 * formas clicables desde el día uno; el trazado fino se hace después con
 * /dev/mapa-editor sin bloquear el resto del trabajo.
 *
 * El tamaño de cada rectángulo es ADAPTATIVO: se calcula a partir de la
 * distancia real al vecino más cercano del mismo nivel (por separado en X
 * y en Y), no un tamaño fijo — así ningún rectángulo se sale de su local
 * ni choca con el de al lado, sin importar qué tan pegados estén los
 * locales en el plano real (ver docs/PLAN-IMPLEMENTACION.md, Fase 3,
 * corrección post-feedback del usuario sobre el mapa).
 *
 * Por defecto solo agrega geometría a locales que NO la tengan ya en el
 * archivo existente (no pisa el trazado manual). Pasa --force para
 * regenerar TODOS los rectángulos adaptativos desde cero (por ejemplo,
 * tras corregir coordenadas x/y) — solo pisa los locales que siguen
 * siendo un rectángulo simple de 4 puntos; un trazado manual con más
 * vértices nunca se toca.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const localesPath = path.join(ROOT, "src", "data", "locales.json");
const geometriaPath = path.join(ROOT, "src", "data", "locales-geometria.json");

const FORCE = process.argv.includes("--force");

// Límites del rectángulo adaptativo, en coordenadas normalizadas 0–1
// (frame de referencia 1306×960 de niveles.json).
const MAX_HALF_W = 0.018;
const MAX_HALF_H = 0.024;
const MIN_HALF_W = 0.006;
const MIN_HALF_H = 0.008;
// Fracción de la distancia al vecino más cercano que puede ocupar el
// semiancho/semialto — 0.4 dado a cada lado dejan ~20% de margen entre
// dos locales vecinos.
const MARGIN_FACTOR = 0.4;
// Al buscar el vecino "de la misma fila" (para el ancho) o "de la misma
// columna" (para el alto), solo se consideran locales cuya coordenada
// perpendicular esté a menos de esta distancia — evita que un local en
// otra fila lejana determine el tamaño.
const ALINEACION_MAX = 0.05;

const locales = JSON.parse(fs.readFileSync(localesPath, "utf8"));

let geometria = {};
if (fs.existsSync(geometriaPath)) {
  geometria = JSON.parse(fs.readFileSync(geometriaPath, "utf8"));
}

function esRectanguloSimple(entry) {
  return Array.isArray(entry?.puntos) && entry.puntos.length === 4;
}

function distanciaMasCercana(local, mismoNivel, eje) {
  // eje "x": vecino en la misma fila (y parecida), distancia en x.
  // eje "y": vecino en la misma columna (x parecida), distancia en y.
  const perpendicular = eje === "x" ? "y" : "x";
  let mejor = Infinity;
  for (const otro of mismoNivel) {
    if (otro === local) continue;
    if (Math.abs(otro[perpendicular] - local[perpendicular]) > ALINEACION_MAX) continue;
    const d = Math.abs(otro[eje] - local[eje]);
    if (d > 0 && d < mejor) mejor = d;
  }
  return mejor;
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}

let agregados = 0;
let actualizados = 0;

for (const local of locales) {
  const existente = geometria[local.id_interno];
  if (existente && !(FORCE && esRectanguloSimple(existente))) continue;

  const mismoNivel = locales.filter((l) => l.nivel === local.nivel);
  const dx = distanciaMasCercana(local, mismoNivel, "x");
  const dy = distanciaMasCercana(local, mismoNivel, "y");

  const halfW = Number.isFinite(dx)
    ? Math.min(MAX_HALF_W, Math.max(MIN_HALF_W, dx * MARGIN_FACTOR))
    : MAX_HALF_W;
  const halfH = Number.isFinite(dy)
    ? Math.min(MAX_HALF_H, Math.max(MIN_HALF_H, dy * MARGIN_FACTOR))
    : MAX_HALF_H;

  const { x, y } = local;
  geometria[local.id_interno] = {
    puntos: [
      [round(x - halfW), round(y - halfH)],
      [round(x + halfW), round(y - halfH)],
      [round(x + halfW), round(y + halfH)],
      [round(x - halfW), round(y + halfH)],
    ],
  };

  if (existente) actualizados++;
  else agregados++;
}

// Orden estable por id_interno para que el diff de git sea legible.
const ordenado = Object.fromEntries(
  Object.keys(geometria)
    .sort()
    .map((id) => [id, geometria[id]]),
);

fs.writeFileSync(geometriaPath, JSON.stringify(ordenado, null, 2) + "\n");
console.log(
  `OK: ${agregados} local(es) nuevos, ${actualizados} actualizados (--force) · ${Object.keys(ordenado).length} en total.`,
);
