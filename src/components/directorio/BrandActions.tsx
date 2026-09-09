"use client";

import { Phone, MapPinned, ExternalLink } from "lucide-react";
import { trackContactar, trackTiendaEnLinea, trackVerMapa } from "@/lib/analytics";
import type { Marca } from "@/lib/content/types";

export function BrandActions({ marca }: { marca: Marca }) {
  const contactHref = marca.telefonos[0]
    ? `tel:${marca.telefonos[0].replace(/\s+/g, "")}`
    : marca.correo
      ? `mailto:${marca.correo}`
      : null;

  const tiendaHref = marca.tienda_en_linea || marca.web || null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {contactHref && (
        <a
          href={contactHref}
          onClick={() => trackContactar(marca.slug)}
          className="inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          <Phone className="h-4 w-4" strokeWidth={1.75} />
          Contactar
        </a>
      )}
      <a
        href="#ubicacion-local"
        onClick={() => trackVerMapa(marca.slug)}
        className="inline-flex items-center gap-2 rounded-sm border border-ink px-6 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-paper"
      >
        <MapPinned className="h-4 w-4" strokeWidth={1.75} />
        Ver mapa
      </a>
      {tiendaHref && (
        <a
          href={tiendaHref.startsWith("http") ? tiendaHref : `https://${tiendaHref}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackTiendaEnLinea(marca.slug)}
          className="inline-flex items-center gap-2 rounded-sm border border-line px-6 py-3 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink"
        >
          Tienda en línea
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
        </a>
      )}
    </div>
  );
}
