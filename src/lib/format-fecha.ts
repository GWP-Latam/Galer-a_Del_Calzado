const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function parseISO(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  return { y, m, d };
}

/** Formatea un rango de fechas ISO (YYYY-MM-DD) en español, colapsando
 * el mes/año cuando son iguales en ambos extremos: "15 de agosto de 2026",
 * "28 de agosto al 3 de septiembre de 2026". */
export function formatRangoFecha(inicio: string, fin: string): string {
  const a = parseISO(inicio);
  const b = parseISO(fin);

  if (inicio === fin) {
    return `${a.d} de ${MESES[a.m - 1]} de ${a.y}`;
  }
  if (a.y === b.y && a.m === b.m) {
    return `${a.d} al ${b.d} de ${MESES[a.m - 1]} de ${a.y}`;
  }
  if (a.y === b.y) {
    return `${a.d} de ${MESES[a.m - 1]} al ${b.d} de ${MESES[b.m - 1]} de ${a.y}`;
  }
  return `${a.d} de ${MESES[a.m - 1]} de ${a.y} al ${b.d} de ${MESES[b.m - 1]} de ${b.y}`;
}
