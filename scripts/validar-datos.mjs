#!/usr/bin/env node
/**
 * Valida la integridad cruzada de src/data/locales.json, marcas.json y
 * amenidades.json. Node puro, sin dependencias. Se corre con
 * `npm run validar-datos` y debe pasar limpio antes de cada commit que
 * toque estos archivos.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "src", "data");

function leer(nombre) {
  return JSON.parse(fs.readFileSync(path.join(DATA, nombre), "utf8"));
}

const locales = leer("locales.json");
const marcas = leer("marcas.json");
const amenidades = leer("amenidades.json");

const errores = [];
const advertencias = [];

const marcasPorSlug = new Map(marcas.map((m) => [m.slug, m]));

// 1. Cada marca.locales[] debe apuntar a un local existente cuyo
//    marca_slug apunte de vuelta a esa marca (relación recíproca).
for (const marca of marcas) {
  for (const numeroLocal of marca.locales) {
    const local = locales.find(
      (l) => l.numero === numeroLocal && l.marca_slug === marca.slug,
    );
    if (!local) {
      errores.push(
        `Marca "${marca.slug}" declara el local "${numeroLocal}" pero ningún ` +
          `local en locales.json tiene numero="${numeroLocal}" con marca_slug="${marca.slug}".`,
      );
    }
  }
}

// 2. No debe haber marca_slug huérfanos (que apunten a una marca inexistente).
for (const local of locales) {
  if (local.marca_slug && !marcasPorSlug.has(local.marca_slug)) {
    errores.push(
      `Local "${local.id_interno}" (numero ${local.numero}) tiene marca_slug ` +
        `"${local.marca_slug}" que no existe en marcas.json.`,
    );
  }
}

// 3. Cada local ocupado por una marca debe aparecer en el locales[] de esa marca.
for (const local of locales) {
  if (local.marca_slug) {
    const marca = marcasPorSlug.get(local.marca_slug);
    if (marca && !marca.locales.includes(local.numero)) {
      advertencias.push(
        `Local "${local.id_interno}" (numero ${local.numero}) tiene marca_slug ` +
          `"${local.marca_slug}" pero esa marca no lista "${local.numero}" en su ` +
          `campo locales[] (${JSON.stringify(marca.locales)}).`,
      );
    }
  }
}

// 4. No debe haber numero duplicado dentro del mismo nivel.
const vistos = new Map();
for (const local of locales) {
  const clave = `${local.nivel}::${local.numero}`;
  if (vistos.has(clave)) {
    errores.push(
      `Numero de local duplicado en el mismo nivel: "${local.numero}" (nivel ${local.nivel}) ` +
        `aparece en "${vistos.get(clave)}" y "${local.id_interno}".`,
    );
  } else {
    vistos.set(clave, local.id_interno);
  }
}

// 5. estado "disponible" implica marca_slug null (y viceversa, como advertencia).
for (const local of locales) {
  if (local.estado === "disponible" && local.marca_slug !== null) {
    errores.push(
      `Local "${local.id_interno}" tiene estado "disponible" pero marca_slug="${local.marca_slug}" ` +
        `(debería ser null).`,
    );
  }
  if (local.estado === "ocupado" && !local.marca_slug && !local.amenidad_nombre) {
    advertencias.push(
      `Local "${local.id_interno}" (numero ${local.numero}) está "ocupado" pero no tiene ` +
        `marca_slug ni amenidad_nombre.`,
    );
  }
}

// 6. id_interno únicos.
const idsVistos = new Set();
for (const local of locales) {
  if (idsVistos.has(local.id_interno)) {
    errores.push(`id_interno duplicado en locales.json: "${local.id_interno}".`);
  }
  idsVistos.add(local.id_interno);
}

// 7. slugs de marca únicos.
const slugsVistos = new Set();
for (const marca of marcas) {
  if (slugsVistos.has(marca.slug)) {
    errores.push(`slug duplicado en marcas.json: "${marca.slug}".`);
  }
  slugsVistos.add(marca.slug);
}

// 8. amenidades.json: el local referenciado debe existir cuando tiene forma
//    de numero de local reconocible (se omite si es una descripción libre,
//    p. ej. "Lobby 1 (cerca de locales 01-02)").
for (const amenidad of amenidades) {
  const pareceNumeroDeLocal = /^[\dA-Z,\s]+$|^L-\d/.test(amenidad.local);
  if (pareceNumeroDeLocal) {
    const existe = locales.some(
      (l) => l.numero === amenidad.local && l.nivel === amenidad.nivel,
    );
    if (!existe) {
      advertencias.push(
        `Amenidad "${amenidad.nombre}" referencia local "${amenidad.local}" ` +
          `(nivel ${amenidad.nivel}) que no existe en locales.json.`,
      );
    }
  }
}

console.log(`Locales: ${locales.length} · Marcas: ${marcas.length} · Amenidades: ${amenidades.length}`);

if (advertencias.length > 0) {
  console.log(`\n⚠ ${advertencias.length} advertencia(s):`);
  for (const a of advertencias) console.log(`  - ${a}`);
}

if (errores.length > 0) {
  console.error(`\n✗ ${errores.length} error(es):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("\n✓ Datos consistentes.");
