#!/usr/bin/env node
/**
 * Genera src/data/locales-geometria.json a partir de las coordenadas x/y
 * (el centroide del pin) de cada local en locales.json: un rectángulo por
 * defecto centrado en ese punto. Así el mapa de la Fase 3 funciona con
 * formas clicables desde el día uno; el trazado fino se hace después con
 * /dev/mapa-editor sin bloquear el resto del trabajo.
 *
 * Solo agrega geometría a locales que NO la tengan ya en el archivo
 * existente (no pisa el trabajo de trazado manual). Para regenerar todo
 * desde cero, borra src/data/locales-geometria.json antes de correr esto.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const localesPath = path.join(ROOT, "src", "data", "locales.json");
const geometriaPath = path.join(ROOT, "src", "data", "locales-geometria.json");

// Semiancho/semialto del rectángulo semilla, en coordenadas normalizadas
// 0–1 (frame de referencia 1306×960 de niveles.json).
const HALF_W = 0.018;
const HALF_H = 0.024;

const locales = JSON.parse(fs.readFileSync(localesPath, "utf8"));

let geometria = {};
if (fs.existsSync(geometriaPath)) {
  geometria = JSON.parse(fs.readFileSync(geometriaPath, "utf8"));
}

let agregados = 0;
for (const local of locales) {
  if (geometria[local.id_interno]) continue; // ya trazado a mano, no tocar
  const { x, y } = local;
  geometria[local.id_interno] = {
    puntos: [
      [round(x - HALF_W), round(y - HALF_H)],
      [round(x + HALF_W), round(y - HALF_H)],
      [round(x + HALF_W), round(y + HALF_H)],
      [round(x - HALF_W), round(y + HALF_H)],
    ],
  };
  agregados++;
}

function round(n) {
  return Math.round(n * 10000) / 10000;
}

// Orden estable por id_interno para que el diff de git sea legible.
const ordenado = Object.fromEntries(
  Object.keys(geometria)
    .sort()
    .map((id) => [id, geometria[id]]),
);

fs.writeFileSync(geometriaPath, JSON.stringify(ordenado, null, 2) + "\n");
console.log(`OK: ${agregados} local(es) con geometría semilla nueva · ${Object.keys(ordenado).length} en total.`);
