#!/usr/bin/env node
/**
 * Extrae la geometría REAL de cada local directamente de los píxeles del
 * plano (public/mapa/*.png), en vez de generar un rectángulo aproximado.
 *
 * El plano es de dos tonos limpios: el interior de cada local es blanco
 * puro (255,255,255) y los muros que lo separan del vecino son una línea
 * delgada gris (204,204,204) — los pasillos son beige (~235,230,213).
 * Esa diferencia es suficiente para:
 *
 *   1. Relleno multi-semilla (watershed): arranca un flood-fill desde el
 *      x/y verificado de CADA local a la vez, expandiendo pixel a pixel
 *      solo por píxeles "caminables" (casi blancos) que nadie más haya
 *      reclamado todavía. Como todas las semillas crecen en paralelo,
 *      cuando dos locales vecinos se encuentran, cada quien se queda con
 *      lo que ya alcanzó — no hay forma de que uno invada al otro.
 *   2. Trazado de contorno (Moore boundary tracing) sobre la máscara de
 *      píxeles reclamados por cada local, para obtener su silueta real.
 *   3. Simplificación (Douglas-Peucker) para bajar de cientos de puntos
 *      a un polígono legible (~8-20 vértices) sin perder las esquinas
 *      reales (incluye entrantes/salientes, no solo un rectángulo).
 *
 * Salida: src/data/locales-geometria.json, con SOLO los locales que se
 * pudieron vectorizar con confianza (área razonable, no tocó el borde de
 * la imagen). Los que fallan (ver el resumen al final) conservan lo que
 * ya tenían — normalmente el rectángulo adaptativo de
 * generar-geometria-inicial.mjs — hasta que se corrijan a mano en
 * /dev/mapa-editor.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const WHITE_MIN = 248; // umbral: los tres canales deben superar esto para contar como "interior caminable"
const MAX_RADIUS_PX = 140; // tope de seguridad: nunca crece más de esto desde su semilla (evita fugas hacia pasillos/estacionamiento)
const MIN_AREA_PX = 250; // por debajo de esto, algo salió mal (semilla en una pared, área irrisoria)
const SIMPLIFY_EPSILON = 1.6; // tolerancia de Douglas-Peucker en píxeles

async function vectorizarNivel(nivelId, planoFile, locales) {
  const { data, info } = await sharp(path.join(ROOT, "public", "mapa", planoFile))
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  function esCaminable(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    const i = (y * width + x) * channels;
    return data[i] >= WHITE_MIN && data[i + 1] >= WHITE_MIN && data[i + 2] >= WHITE_MIN;
  }

  const seeds = locales
    .filter((l) => l.nivel === nivelId)
    .map((l) => ({
      id: l.id_interno,
      x: Math.round(l.x * width),
      y: Math.round(l.y * height),
    }));

  // -1 = sin reclamar; owner index en `seeds` en otro caso.
  const owner = new Int16Array(width * height).fill(-1);
  const dist = new Float64Array(width * height).fill(Infinity);

  // BFS multi-fuente por niveles de distancia (watershed): un heap simple
  // basado en arrays ordenados por "frente" es suficiente aquí porque
  // todas las semillas crecen a la misma velocidad (4-conectividad).
  let frontier = [];
  seeds.forEach((s, idx) => {
    const p = s.y * width + s.x;
    if (!esCaminable(s.x, s.y)) {
      console.warn(`  ! semilla de "${s.id}" no cae en un píxel blanco (${s.x},${s.y}) — se omite`);
      return;
    }
    owner[p] = idx;
    dist[p] = 0;
    frontier.push(p);
  });

  const dx4 = [1, -1, 0, 0];
  const dy4 = [0, 0, 1, -1];
  let radius = 0;
  while (frontier.length > 0 && radius < MAX_RADIUS_PX) {
    radius++;
    const next = [];
    for (const p of frontier) {
      const x = p % width;
      const y = (p / width) | 0;
      const o = owner[p];
      for (let k = 0; k < 4; k++) {
        const nx = x + dx4[k];
        const ny = y + dy4[k];
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const np = ny * width + nx;
        if (owner[np] !== -1) continue;
        if (!esCaminable(nx, ny)) continue;
        owner[np] = o;
        dist[np] = radius;
        next.push(np);
      }
    }
    frontier = next;
  }

  // Contorno + simplificación por local.
  const resultado = {};
  const resumen = { ok: 0, chico: 0, tocaBorde: 0, sinSemilla: 0 };
  seeds.forEach((s, idx) => {
    if (dist[s.y * width + s.x] !== 0) {
      resumen.sinSemilla++;
      return;
    }
    const area = countArea(owner, idx);
    if (area < MIN_AREA_PX) {
      resumen.chico++;
      console.warn(`  ! "${s.id}": área irrisoria (${area}px) — se omite`);
      return;
    }
    const contorno = traceBoundary(owner, idx, width, height);
    if (!contorno) {
      resumen.chico++;
      return;
    }
    if (tocaBorde(contorno, width, height)) {
      resumen.tocaBorde++;
      console.warn(`  ! "${s.id}": el relleno llegó al borde de la imagen (posible fuga) — se omite`);
      return;
    }
    const simplificado = douglasPeucker(contorno, SIMPLIFY_EPSILON);
    const puntos = simplificado.map(([x, y]) => [round(x / width), round(y / height)]);
    resultado[s.id] = { puntos };
    resumen.ok++;
  });

  return { resultado, resumen, totalSemillas: seeds.length };
}

function countArea(owner, idx) {
  let n = 0;
  for (let i = 0; i < owner.length; i++) if (owner[i] === idx) n++;
  return n;
}

function tocaBorde(contorno, width, height) {
  return contorno.some(([x, y]) => x <= 1 || y <= 1 || x >= width - 2 || y >= height - 2);
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}

/**
 * Trazado de contorno tipo "square tracing" sobre una máscara binaria
 * (owner[i] === idx). Devuelve los puntos del contorno en orden, a nivel
 * de píxel (sin simplificar).
 */
function traceBoundary(owner, idx, width, height) {
  const isMask = (x, y) => x >= 0 && y >= 0 && x < width && y < height && owner[y * width + x] === idx;

  // Encontrar el píxel más arriba-izquierda de la región.
  let start = null;
  for (let y = 0; y < height && !start; y++) {
    for (let x = 0; x < width; x++) {
      if (isMask(x, y)) { start = [x, y]; break; }
    }
  }
  if (!start) return null;

  // Square tracing: en cada paso probamos las 4 direcciones en orden
  // fijo relativo a la última dirección de movimiento, "abrazando" el
  // borde de la región (regla de la mano derecha).
  const dirs = [ [1,0], [0,1], [-1,0], [0,-1] ]; // E, S, O, N
  let [x, y] = start;
  let dir = 0; // empezamos buscando hacia el Este
  const path = [[x, y]];
  const maxSteps = width * height; // cota de seguridad
  let steps = 0;

  do {
    let moved = false;
    for (let turn = 0; turn < 4; turn++) {
      const d = (dir + 3 + turn) % 4; // gira a la izquierda desde la dirección anterior
      const [ddx, ddy] = dirs[d];
      const nx = x + ddx, ny = y + ddy;
      if (isMask(nx, ny)) {
        x = nx; y = ny; dir = d;
        path.push([x, y]);
        moved = true;
        break;
      }
    }
    if (!moved) break;
    steps++;
  } while ((x !== start[0] || y !== start[1]) && steps < maxSteps);

  return path.length >= 4 ? path : null;
}

/** Simplificación de Douglas-Peucker estándar sobre un polígono cerrado. */
function douglasPeucker(points, epsilon) {
  if (points.length <= 4) return points;

  function perpDist(p, a, b) {
    const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return Math.hypot(x - x1, y - y1);
    return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / len;
  }

  function simplify(pts) {
    if (pts.length <= 2) return pts;
    let maxDist = 0, index = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
      if (d > maxDist) { maxDist = d; index = i; }
    }
    if (maxDist > epsilon) {
      const left = simplify(pts.slice(0, index + 1));
      const right = simplify(pts.slice(index));
      return [...left.slice(0, -1), ...right];
    }
    return [pts[0], pts[pts.length - 1]];
  }

  // Partimos el polígono cerrado en dos mitades para que Douglas-Peucker
  // (pensado para curvas abiertas) no colapse todo a una línea recta.
  const mid = Math.floor(points.length / 2);
  const half1 = simplify(points.slice(0, mid + 1));
  const half2 = simplify(points.slice(mid));
  const full = [...half1.slice(0, -1), ...half2.slice(0, -1)];
  return full.length >= 3 ? full : points;
}

async function main() {
  const localesPath = path.join(ROOT, "src", "data", "locales.json");
  const geometriaPath = path.join(ROOT, "src", "data", "locales-geometria.json");
  const locales = JSON.parse(fs.readFileSync(localesPath, "utf8"));
  const geometriaExistente = fs.existsSync(geometriaPath)
    ? JSON.parse(fs.readFileSync(geometriaPath, "utf8"))
    : {};

  console.log("Vectorizando primer piso...");
  const piso = await vectorizarNivel("gc-piso", "primer-piso.png", locales);
  console.log(`  ${piso.resumen.ok}/${piso.totalSemillas} locales vectorizados desde el plano real.`);
  if (piso.resumen.chico || piso.resumen.tocaBorde || piso.resumen.sinSemilla) {
    console.log(`  (omitidos: ${piso.resumen.chico} área chica, ${piso.resumen.tocaBorde} tocó el borde, ${piso.resumen.sinSemilla} semilla fuera de blanco — conservan su geometría anterior)`);
  }

  console.log("Vectorizando sótano...");
  const sotano = await vectorizarNivel("sotano", "sotano.png", locales);
  console.log(`  ${sotano.resumen.ok}/${sotano.totalSemillas} locales vectorizados desde el plano real.`);

  const combinado = { ...geometriaExistente, ...piso.resultado, ...sotano.resultado };
  const ordenado = Object.fromEntries(Object.keys(combinado).sort().map((id) => [id, combinado[id]]));
  fs.writeFileSync(geometriaPath, JSON.stringify(ordenado, null, 2) + "\n");
  console.log(`\nOK: ${Object.keys(ordenado).length} locales en total en locales-geometria.json`);
}

main();
