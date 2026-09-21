import { getAmenidades, getMarcas } from "@/lib/content/repository";

export interface SearchItem {
  type: "marca" | "amenidad" | "pagina";
  label: string;
  sublabel?: string;
  href: string;
}

const STATIC_PAGES: SearchItem[] = [
  { type: "pagina", label: "Directorio de marcas", href: "/directorio" },
  { type: "pagina", label: "Nosotros", sublabel: "Historia de la plaza", href: "/nosotros" },
  { type: "pagina", label: "Promociones", sublabel: "Promociones vigentes", href: "/promociones" },
  { type: "pagina", label: "Eventos", href: "/eventos" },
  { type: "pagina", label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { type: "pagina", label: "Contacto", href: "/contacto" },
];

export function buildSearchIndex(): SearchItem[] {
  const marcas: SearchItem[] = getMarcas().map((m) => ({
    type: "marca",
    label: m.nombre,
    sublabel: m.locales.length ? `Local ${m.locales.join(", ")}` : undefined,
    href: `/directorio/${m.slug}`,
  }));

  const amenidades: SearchItem[] = getAmenidades().map((a) => ({
    type: "amenidad",
    label: a.nombre,
    sublabel: a.local ? `Local ${a.local}` : undefined,
    href: `/directorio?amenidad=${encodeURIComponent(a.nombre)}`,
  }));

  return [...marcas, ...amenidades, ...STATIC_PAGES];
}
