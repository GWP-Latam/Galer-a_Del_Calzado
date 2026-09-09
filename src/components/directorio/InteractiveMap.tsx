"use client";

import { useState } from "react";
import Image from "next/image";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/BrandLogo";
import { getMarcaBySlug } from "@/lib/content/repository";
import type { Local, Nivel } from "@/lib/content/types";

// Past this zoom level, pins swap their local number for the brand's logo.
const LOGO_ZOOM_THRESHOLD = 2.2;

function MapControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col overflow-hidden rounded-sm border border-line bg-paper shadow-sm">
      <button type="button" onClick={() => zoomIn()} aria-label="Acercar" className="border-b border-line p-2 hover:bg-stone-50">
        <ZoomIn className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button type="button" onClick={() => zoomOut()} aria-label="Alejar" className="border-b border-line p-2 hover:bg-stone-50">
        <ZoomOut className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button type="button" onClick={() => resetTransform()} aria-label="Restablecer vista" className="p-2 hover:bg-stone-50">
        <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

function Pin({
  local,
  isSelected,
  scale,
  onSelectLocal,
}: {
  local: Local;
  isSelected: boolean;
  scale: number;
  onSelectLocal?: (local: Local) => void;
}) {
  const isAmenidad = Boolean(local.amenidad_nombre);
  const isAvailable = local.estado === "disponible";
  const marca = local.marca_slug ? getMarcaBySlug(local.marca_slug) : undefined;
  const showLogo = scale >= LOGO_ZOOM_THRESHOLD && marca && !marca.logo_generico;
  const counterScale = 1 / scale;

  const label = marca?.nombre ?? local.amenidad_nombre ?? `Local ${local.numero}`;

  return (
    <div
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${local.x * 100}%`, top: `${local.y * 100}%` }}
    >
      <button
        type="button"
        onClick={() => onSelectLocal?.(local)}
        aria-label={label}
        className={clsx(
          "relative flex items-center justify-center rounded-full border font-medium leading-none transition-transform hover:z-20 hover:scale-125",
          showLogo ? "h-7 w-7 bg-paper p-0.5 shadow-sm" : "h-[18px] w-[18px] text-[8px]",
          isSelected && "z-20 ring-2 ring-accent ring-offset-1",
          !showLogo && isAmenidad && "border-ink-soft/50 bg-paper text-ink-soft",
          !showLogo && !isAmenidad && isAvailable && "border-[var(--state-available-ink)]/50 bg-[var(--state-available-bg)] text-[var(--state-available-ink)]",
          !showLogo && !isAmenidad && !isAvailable && "border-paper bg-ink text-paper",
        )}
      >
        {showLogo ? <BrandLogo marca={marca!} /> : isAmenidad ? "" : local.numero}
      </button>

      {/* Desktop hover card — counter-scaled so it reads at a constant size
          regardless of how far the map is zoomed in. */}
      <div
        className="pointer-events-none absolute bottom-full left-1/2 z-30 hidden -translate-x-1/2 pb-2 group-hover:md:block"
        style={{ transform: `scale(${counterScale})`, transformOrigin: "bottom center" }}
      >
        <div className="flex items-center gap-2 whitespace-nowrap rounded-sm border border-line bg-paper px-3 py-2 shadow-md">
          {marca && (
            <div className="h-6 w-10 shrink-0">
              <BrandLogo marca={marca} />
            </div>
          )}
          <div className="text-left">
            <p className="text-xs font-medium leading-tight text-ink">{label}</p>
            <p className="text-[10px] leading-tight text-ink-soft">Local {local.numero}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveMap({
  nivel,
  locales,
  selectedSlug,
  onSelectLocal,
}: {
  nivel: Nivel;
  locales: Local[];
  selectedSlug: string | null;
  /** Omit when embedding a read-only map from a Server Component (e.g. a
   * brand's ficha) — functions can't cross the server/client boundary, so
   * the no-op lives here instead of being passed in from a server page. */
  onSelectLocal?: (local: Local) => void;
}) {
  const planoSrc = nivel.plano ?? nivel.plano_raster!;
  const [scale, setScale] = useState(1);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-line bg-stone-50">
      <TransformWrapper
        minScale={1}
        maxScale={6}
        centerOnInit
        doubleClick={{ mode: "zoomIn" }}
        onTransform={(_, state) => setScale(state.scale)}
      >
        <MapControls />
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <div
            className="relative w-full"
            style={{ aspectRatio: `${nivel.ancho_ref} / ${nivel.alto_ref}` }}
          >
            <Image
              src={planoSrc}
              alt={`Plano del nivel ${nivel.nombre}`}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-contain"
              priority
            />
            {locales.map((local) => (
              <Pin
                key={local.id_interno}
                local={local}
                isSelected={local.marca_slug === selectedSlug}
                scale={scale}
                onSelectLocal={onSelectLocal}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
