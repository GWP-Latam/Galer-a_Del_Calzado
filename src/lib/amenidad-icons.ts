import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAmenidades } from "@/lib/content/repository";

/** Convierte un nombre de icono en kebab-case (como vienen en amenidades.json,
 * p. ej. "shopping-bag") al componente de lucide-react equivalente. */
export function iconForName(name: string): LucideIcon {
  const pascal = name
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
  return (Icons as unknown as Record<string, LucideIcon>)[pascal] ?? Icons.MapPin;
}

/** Busca el icono de una amenidad del mapa por su nombre visible
 * (local.amenidad_nombre) contra el catálogo de amenidades.json. Devuelve
 * siempre un componente (MapPin como último recurso) para que quien lo usa
 * decida si mostrarlo con una condición aparte, no con la identidad del
 * componente. */
export function getAmenidadIcon(nombre: string | null): LucideIcon {
  const amenidad = nombre ? getAmenidades().find((a) => a.nombre === nombre) : undefined;
  return amenidad ? iconForName(amenidad.icono) : Icons.MapPin;
}
