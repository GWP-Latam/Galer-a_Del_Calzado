import { track as vercelTrack } from "@vercel/analytics";

/**
 * The three events tied to the site's actual success metrics (plan punto 1.3):
 * clicks toward a tenant's own online store, and clicks on "Contactar" / "Ver
 * mapa" inside a brand's ficha. Keep this list in sync with what the plan
 * defines as KPIs — nothing else needs a custom event.
 */
export function trackContactar(marcaSlug: string) {
  vercelTrack("contactar", { marca: marcaSlug });
}

export function trackVerMapa(marcaSlug: string) {
  vercelTrack("ver_mapa", { marca: marcaSlug });
}

export function trackTiendaEnLinea(marcaSlug: string) {
  vercelTrack("tienda_en_linea", { marca: marcaSlug });
}
