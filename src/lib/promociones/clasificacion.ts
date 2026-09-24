/**
 * Clasificación de promociones en tres ejes independientes, en vez de la
 * lista plana anterior (liquidación / descuentos / rebajas / deportivo / lujo
 * / casual), que mezclaba sinónimos del mismo tipo de oferta con estilos de
 * producto:
 *
 * - tipo_oferta: la mecánica de la promoción (una sola). Es lo que el
 *   visitante compara: "¿es 2x1, es un descuento, son meses sin intereses?".
 * - publico: para quién es (varios). Vacío = toda la familia.
 * - calzado: qué tipo de calzado (varios). Vacío = toda la tienda. Usa los
 *   mismos slugs que "Un estilo para cada paso" del inicio.
 *
 * "Termina pronto" no se captura: sale de vigente_hasta.
 *
 * Si una promoción no trae alguno de los ejes (promociones anteriores a la
 * migración 0004, o el locatario no lo marcó), `clasificar` lo deduce del
 * título y la descripción.
 */

export const TIPOS_OFERTA = {
  descuento: "Descuento",
  "2x1": "2x1 y segundo par",
  precio_especial: "Precio especial",
  liquidacion: "Liquidación",
  meses_sin_intereses: "Meses sin intereses",
  regalo: "Regalo con tu compra",
  nueva_coleccion: "Nueva colección",
} as const;

export const PUBLICOS = {
  mujer: "Mujer",
  hombre: "Hombre",
  ninos: "Niños",
} as const;

export const CALZADOS = {
  zapatos: "Zapatos",
  sneakers: "Sneakers",
  sandalias: "Sandalias",
  botas: "Botas",
} as const;

export type TipoOferta = keyof typeof TIPOS_OFERTA;
export type Publico = keyof typeof PUBLICOS;
export type Calzado = keyof typeof CALZADOS;

export interface Clasificacion {
  tipo_oferta: TipoOferta | null;
  publico: Publico[];
  calzado: Calzado[];
}

/** Días antes del fin de vigencia en que una promoción cuenta como "termina pronto". */
export const DIAS_TERMINA_PRONTO = 7;

const esTipo = (v: unknown): v is TipoOferta => typeof v === "string" && v in TIPOS_OFERTA;
const esPublico = (v: unknown): v is Publico => typeof v === "string" && v in PUBLICOS;
const esCalzado = (v: unknown): v is Calzado => typeof v === "string" && v in CALZADOS;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// El orden importa: gana la primera coincidencia. La mecánica concreta
// ("2x1", "20%") pesa más que el motivo ("nueva colección con 20% off" es
// un descuento).
const REGLAS_TIPO: [RegExp, TipoOferta][] = [
  [/\b\d\s*x\s*\d\b|segundo par|2do par|par gratis/, "2x1"],
  [/liquidacion|remate|fin de temporada|outlet/, "liquidacion"],
  [/meses sin intereses|\bmsi\b|pagos? fijos|a meses/, "meses_sin_intereses"],
  [/regalo|obsequio|de cortesia|gratis con tu compra/, "regalo"],
  [/\d+\s*%|descuento|\boff\b|rebaja/, "descuento"],
  [/precio especial|precios especiales|desde \$|a solo \$|precio unico/, "precio_especial"],
  [/nueva coleccion|lanzamiento|estreno|recien llegad|nueva temporada/, "nueva_coleccion"],
];

const REGLAS_PUBLICO: [RegExp, Publico][] = [
  [/mujer|\bdamas?\b|para ella/, "mujer"],
  [/hombre|caballero/, "hombre"],
  [/nin[oa]s?|infantil|kids|escolar|bebe/, "ninos"],
];

const REGLAS_CALZADO: [RegExp, Calzado][] = [
  [/zapato|zapatilla|mocasin|tacon|oxford/, "zapatos"],
  [/tenis|sneaker|deportiv/, "sneakers"],
  [/sandalia|huarache|chancla/, "sandalias"],
  [/\bbota|botin/, "botas"],
];

/** Traducción de las categorías viejas, solo como último recurso. */
const LEGADO_TIPO: Record<string, TipoOferta> = {
  liquidacion: "liquidacion",
  descuentos: "descuento",
  rebajas: "descuento",
};
const LEGADO_CALZADO: Record<string, Calzado> = { deportivo: "sneakers" };

export function inferirClasificacion(titulo: string, descripcion: string, legado: string[] = []): Clasificacion {
  const texto = normalizar(`${titulo} ${descripcion}`);

  const tipo =
    REGLAS_TIPO.find(([re]) => re.test(texto))?.[1] ??
    legado.map((c) => LEGADO_TIPO[c]).find(Boolean) ??
    null;

  const publico = /toda la familia|para todos/.test(texto)
    ? []
    : REGLAS_PUBLICO.filter(([re]) => re.test(texto)).map(([, p]) => p);

  const calzado = /toda la tienda|todo el calzado|todos los modelos/.test(texto)
    ? []
    : Array.from(
        new Set([
          ...REGLAS_CALZADO.filter(([re]) => re.test(texto)).map(([, c]) => c),
          ...legado.map((c) => LEGADO_CALZADO[c]).filter(esCalzado),
        ]),
      );

  return { tipo_oferta: tipo, publico, calzado };
}

/**
 * Clasificación final de una promoción: lo que el locatario eligió manda;
 * lo que dejó vacío se deduce del texto (y si el texto tampoco lo dice, se
 * queda vacío: toda la familia / toda la tienda).
 */
export function clasificar(p: {
  titulo: string;
  descripcion: string;
  tipo_oferta?: string | null;
  publico?: string[] | null;
  calzado?: string[] | null;
  categorias?: string[] | null;
}): Clasificacion {
  const inferida = inferirClasificacion(p.titulo, p.descripcion, p.categorias ?? []);
  return {
    tipo_oferta: esTipo(p.tipo_oferta) ? p.tipo_oferta : inferida.tipo_oferta,
    publico: p.publico?.length ? p.publico.filter(esPublico) : inferida.publico,
    calzado: p.calzado?.length ? p.calzado.filter(esCalzado) : inferida.calzado,
  };
}

/** Días completos que le quedan a la promoción (0 = termina hoy), o null sin fecha. */
export function diasRestantes(vigenteHasta: string | undefined, hoy = new Date()): number | null {
  if (!vigenteHasta) return null;
  const fin = new Date(`${vigenteHasta}T23:59:59`);
  return Math.max(0, Math.floor((fin.getTime() - hoy.getTime()) / 86_400_000));
}

/** Lee los tres ejes de un FormData de los formularios de /admin. */
export function clasificacionDesdeFormulario(formData: FormData): Clasificacion {
  const tipo = String(formData.get("tipo_oferta") ?? "");
  return {
    tipo_oferta: esTipo(tipo) ? tipo : null,
    publico: formData.getAll("publico").filter(esPublico),
    calzado: formData.getAll("calzado").filter(esCalzado),
  };
}

/**
 * Valor para la columna vieja `categorias` (enum), que se sigue llenando
 * para que el sitio anterior a este cambio lea algo coherente.
 */
export function categoriasLegado(c: Clasificacion): ("liquidacion" | "descuentos" | "deportivo")[] {
  const out: ("liquidacion" | "descuentos" | "deportivo")[] = [];
  if (c.tipo_oferta === "liquidacion") out.push("liquidacion");
  else if (c.tipo_oferta) out.push("descuentos");
  if (c.calzado.includes("sneakers")) out.push("deportivo");
  return out;
}
