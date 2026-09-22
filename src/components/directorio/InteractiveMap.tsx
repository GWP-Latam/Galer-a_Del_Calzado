"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/BrandLogo";
import { getAmenidadIcon } from "@/lib/amenidad-icons";
import { getMarcaBySlug } from "@/lib/content/repository";
import type { Local, Nivel } from "@/lib/content/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface InteractiveMapHandle {
  /** Vuela y encuadra uno o varios locales (marcas con varias sucursales
   * quedan todas dentro del encuadre). No-op si el local no tiene
   * geometría trazada todavía. */
  flyTo: (idsInternos: string[]) => void;
}

function polyId(idInterno: string) {
  return `local-poly-${idInterno}`;
}

function centroidOf(local: Local): { x: number; y: number } {
  if (!local.geometria || local.geometria.length === 0) return { x: local.x, y: local.y };
  const xs = local.geometria.map((p) => p[0]);
  const ys = local.geometria.map((p) => p[1]);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}

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

function LocalShape({
  local,
  nivel,
  isSelected,
  index,
  playEntrance,
  onSelect,
}: {
  local: Local;
  nivel: Nivel;
  isSelected: boolean;
  index: number;
  playEntrance: boolean;
  onSelect?: (local: Local) => void;
}) {
  const reduced = useReducedMotion();
  const isAmenidad = Boolean(local.amenidad_nombre);
  const isAvailable = local.estado === "disponible";
  const puntos = local.geometria!;
  const puntosAbs = puntos.map(([x, y]) => `${x * nivel.ancho_ref},${y * nivel.alto_ref}`).join(" ");

  const fill = isSelected
    ? "rgba(150, 116, 42, 0.22)"
    : isAvailable
      ? "rgba(150, 116, 42, 0.1)"
      : "rgba(19, 17, 16, 0.03)";
  const stroke = isSelected ? "#96742a" : isAvailable ? "#96742a" : "rgba(19, 17, 16, 0.18)";

  const label = local.marca_slug
    ? getMarcaBySlug(local.marca_slug)?.nombre
    : local.amenidad_nombre ?? `Local ${local.numero}`;

  return (
    <motion.polygon
      id={polyId(local.id_interno)}
      points={puntosAbs}
      fill={fill}
      stroke={stroke}
      strokeWidth={isSelected ? 3 : isAmenidad ? 1.5 : 1}
      strokeDasharray={isAmenidad && !isSelected ? "4 3" : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? label : undefined}
      style={{ cursor: onSelect ? "pointer" : "default", outline: "none" }}
      className="transition-[fill,stroke] duration-150 hover:!fill-[rgba(19,17,16,0.07)] focus-visible:!fill-[rgba(150,116,42,0.2)]"
      onClick={() => onSelect?.(local)}
      onKeyDown={(e) => {
        const esActivacion =
          e.key === "Enter" || e.key === " " || e.code === "Enter" || e.code === "Space";
        if (onSelect && esActivacion) {
          e.preventDefault();
          onSelect(local);
        }
      }}
      initial={playEntrance && !reduced ? { opacity: 0 } : false}
      animate={{
        opacity: 1,
        pathLength: isSelected && !reduced ? [0, 1] : undefined,
      }}
      transition={{
        opacity: { duration: 0.4, delay: playEntrance && !reduced ? index * 0.012 : 0, ease: EASE },
        pathLength: { duration: 0.6, ease: EASE },
      }}
    />
  );
}

function Etiqueta({
  local,
  isSelected,
  scale,
  index,
  playEntrance,
  onSelectLocal,
}: {
  local: Local;
  isSelected: boolean;
  scale: number;
  index: number;
  playEntrance: boolean;
  onSelectLocal?: (local: Local) => void;
}) {
  const reduced = useReducedMotion();
  const isAmenidad = Boolean(local.amenidad_nombre);
  const isAvailable = local.estado === "disponible";
  const marca = local.marca_slug ? getMarcaBySlug(local.marca_slug) : undefined;
  // El logo solo se muestra para el local seleccionado (y con logo real):
  // así nunca hay más de un puñado de logos visibles al mismo tiempo, sin
  // importar cuántos locales haya pegados unos a otros ni el zoom.
  const showLogo = isSelected && marca && !marca.logo_generico;
  // Contra-escalamos TODA la etiqueta (no solo el tooltip) para que el
  // punto se vea del mismo tamaño sin importar el zoom del mapa — a mayor
  // zoom crece el polígono del local, no el marcador encima.
  const counterScale = 1 / scale;
  const { x, y } = centroidOf(local);
  const AmenidadIcon = getAmenidadIcon(local.amenidad_nombre);
  // getAmenidadIcon siempre devuelve un componente fijo de lucide-react
  // (nunca uno creado ad hoc); el linter no puede verlo porque la función
  // vive en otro módulo, de ahí la excepción.
  // eslint-disable-next-line react-hooks/static-components
  const iconoAmenidad = <AmenidadIcon className="h-2.5 w-2.5" strokeWidth={2} />;

  const label = marca?.nombre ?? local.amenidad_nombre ?? `Local ${local.numero}`;

  const dropVariants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="group pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      initial={playEntrance ? "hidden" : false}
      animate="visible"
      variants={dropVariants}
      transition={{ duration: 0.35, delay: playEntrance ? 0.15 + index * 0.012 : 0, ease: EASE }}
    >
      <div style={{ transform: `scale(${counterScale})`, transformOrigin: "center" }}>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onSelectLocal?.(local)}
          className={clsx(
            "pointer-events-auto relative flex items-center justify-center rounded-full border font-medium leading-none transition-transform hover:z-20 hover:scale-125",
            showLogo ? "h-10 w-10 bg-paper p-1 shadow-md" : "h-4 w-4 text-[7px]",
            isSelected && "z-20 ring-2 ring-accent ring-offset-1",
            !showLogo && isAmenidad && "border-ink-soft/60 bg-paper text-ink-soft",
            !showLogo && !isAmenidad && isAvailable && "border-[var(--state-available-ink)]/60 bg-[var(--state-available-bg)] text-[var(--state-available-ink)]",
            !showLogo && !isAmenidad && !isAvailable && "border-paper bg-ink text-paper",
          )}
        >
          {showLogo ? <BrandLogo marca={marca!} /> : isAmenidad ? iconoAmenidad : local.numero}
        </button>

        {/* Tarjeta al pasar el cursor — vive en el mismo contenedor
            contra-escalado que el punto, así que siempre se ve del mismo
            tamaño y alineada justo encima de él. */}
        <div className="pointer-events-none absolute bottom-full left-1/2 z-30 hidden -translate-x-1/2 pb-2 group-hover:md:block">
          <div className="flex items-center gap-2 whitespace-nowrap rounded-sm border border-line bg-paper px-3 py-2 shadow-md">
            {marca && (
              <div className="h-6 w-10 shrink-0">
                <BrandLogo marca={marca} />
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-medium leading-tight text-ink">{label}</p>
              <p className="text-[10px] leading-tight text-ink-soft">
                {isAvailable ? "Local disponible" : `Local ${local.numero}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const InteractiveMap = forwardRef<InteractiveMapHandle, {
  nivel: Nivel;
  locales: Local[];
  selectedSlug: string | null;
  /** Omit when embedding a read-only map from a Server Component (e.g. a
   * brand's ficha) — functions can't cross the server/client boundary, so
   * the no-op lives here instead of being passed in from a server page. */
  onSelectLocal?: (local: Local) => void;
}>(function InteractiveMap({ nivel, locales, selectedSlug, onSelectLocal }, ref) {
  const planoSrc = nivel.plano ?? nivel.plano_raster!;
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<ReactZoomPanPinchRef | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo(idsInternos: string[]) {
      const ctx = wrapperRef.current;
      if (!ctx) return;
      const nodes = idsInternos
        .map((id) => document.getElementById(polyId(id)))
        .filter((n): n is HTMLElement => n !== null);
      if (nodes.length === 0) return;
      ctx.zoomToElement(nodes.length === 1 ? nodes[0] : nodes, { maxScale: 3.5, minScale: 1.4 }, 600, "easeOut");
    },
  }), []);

  const localesConGeometria = useMemo(() => locales.filter((l) => l.geometria), [locales]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-line bg-stone-50">
      <TransformWrapper
        ref={wrapperRef}
        key={nivel.id}
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
            // react-zoom-pan-pinch envuelve esto en un div `display:flex` con
            // el stretch por defecto (align-items: stretch) — sin self-center
            // ese flex estira este div a la altura del panel completo y el
            // aspect-ratio de abajo queda sin efecto (ambos ejes ya "definidos"
            // por fuera), desalineando el plano de fondo contra el overlay de
            // los locales. /dev/mapa-editor no tiene este problema porque ahí
            // no hay ningún TransformComponent de por medio.
            className="relative w-full self-center"
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

            <svg
              viewBox={`0 0 ${nivel.ancho_ref} ${nivel.alto_ref}`}
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              {localesConGeometria.map((local, i) => (
                <LocalShape
                  key={local.id_interno}
                  local={local}
                  nivel={nivel}
                  isSelected={local.marca_slug === selectedSlug && selectedSlug !== null}
                  index={i}
                  playEntrance
                  onSelect={onSelectLocal}
                />
              ))}
            </svg>

            {locales.map((local, i) => (
              <Etiqueta
                key={local.id_interno}
                local={local}
                isSelected={local.marca_slug === selectedSlug && selectedSlug !== null}
                scale={scale}
                index={i}
                playEntrance
                onSelectLocal={onSelectLocal}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
});
