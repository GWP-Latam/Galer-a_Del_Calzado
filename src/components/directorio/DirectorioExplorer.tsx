"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, List, Map as MapIcon } from "lucide-react";
import { clsx } from "clsx";
import { InteractiveMap } from "./InteractiveMap";
import { BrandListItem } from "./BrandListItem";
import { BrandLogo } from "@/components/BrandLogo";
import type { Local, Marca, Nivel } from "@/lib/content/types";

export function DirectorioExplorer({
  marcas,
  locales,
  niveles,
}: {
  marcas: Marca[];
  locales: Local[];
  niveles: Nivel[];
}) {
  const [query, setQuery] = useState("");
  const [nivelId, setNivelId] = useState<string | undefined>(
    niveles[niveles.length - 1]?.id ?? niveles[0]?.id,
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [infoLocal, setInfoLocal] = useState<Local | null>(null);
  const [mobileView, setMobileView] = useState<"lista" | "mapa">("mapa");
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const nivel = niveles.find((n) => n.id === nivelId) ?? niveles[0];

  const filteredMarcas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return marcas;
    return marcas.filter((m) => m.nombre.toLowerCase().includes(q));
  }, [marcas, query]);

  const localesDelNivel = useMemo(() => locales.filter((l) => l.nivel === nivel?.id), [locales, nivel]);

  function selectMarca(marca: Marca) {
    setSelectedSlug(marca.slug);
    const suLocal = locales.find((l) => l.marca_slug === marca.slug);
    if (suLocal) {
      if (suLocal.nivel !== nivelId) setNivelId(suLocal.nivel);
      setInfoLocal(suLocal);
    }
    setMobileView("mapa");
  }

  function selectLocal(local: Local) {
    setInfoLocal(local);
    if (local.marca_slug) {
      setSelectedSlug(local.marca_slug);
      itemRefs.current[local.marca_slug]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      setSelectedSlug(null);
    }
  }

  const infoMarca = infoLocal?.marca_slug ? marcas.find((m) => m.slug === infoLocal.marca_slug) : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Search — shared across list and map, always visible above the
          mobile Lista/Mapa switch. */}
      <div className="flex items-center gap-2 rounded-sm border border-line px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-stone-400" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca una marca por nombre…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
            <X className="h-4 w-4 text-stone-400" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Mobile view switcher */}
      <div className="flex rounded-sm border border-line lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView("mapa")}
          className={clsx(
            "flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium",
            mobileView === "mapa" ? "bg-ink text-paper" : "text-ink-soft",
          )}
        >
          <MapIcon className="h-4 w-4" strokeWidth={1.75} /> Mapa
        </button>
        <button
          type="button"
          onClick={() => setMobileView("lista")}
          className={clsx(
            "flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium",
            mobileView === "lista" ? "bg-ink text-paper" : "text-ink-soft",
          )}
        >
          <List className="h-4 w-4" strokeWidth={1.75} /> Lista
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* List column */}
        <div className={clsx("flex w-full flex-col gap-4 lg:w-[38%]", mobileView !== "lista" && "hidden lg:flex")}>
          <p className="text-xs text-ink-soft">
            {filteredMarcas.length} {filteredMarcas.length === 1 ? "marca" : "marcas"}
          </p>

          <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[640px]">
            {filteredMarcas.map((marca) => (
              <div key={marca.slug} ref={(el) => { itemRefs.current[marca.slug] = el; }}>
                <BrandListItem marca={marca} active={marca.slug === selectedSlug} onSelect={() => selectMarca(marca)} />
              </div>
            ))}
            {filteredMarcas.length === 0 && (
              <p className="py-10 text-center text-sm text-ink-soft">
                No encontramos marcas con &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        </div>

        {/* Map column */}
        <div className={clsx("flex w-full flex-col gap-4 lg:w-[62%]", mobileView !== "mapa" && "hidden lg:flex")}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex rounded-sm border border-line p-0.5">
              {niveles.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setNivelId(n.id)}
                  className={clsx(
                    "rounded-sm px-4 py-1.5 text-sm font-medium transition-colors",
                    n.id === nivelId ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {n.nombre}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-4 text-xs text-ink-soft sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-ink" /> Marca
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-ink-soft/40 bg-paper" /> Amenidad
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--state-available-bg)]" /> Disponible
              </span>
            </div>
          </div>

          <div className="h-[420px] sm:h-[520px] lg:h-[640px]">
            {nivel && (
              <InteractiveMap nivel={nivel} locales={localesDelNivel} selectedSlug={selectedSlug} onSelectLocal={selectLocal} />
            )}
          </div>

          {infoLocal && (
            <div className="flex items-center gap-4 rounded-md border border-line bg-stone-50 p-4">
              {infoMarca ? (
                <>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-line bg-paper p-1">
                    <BrandLogo marca={infoMarca} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{infoMarca.nombre}</p>
                    <p className="text-xs text-ink-soft">Local {infoLocal.numero}</p>
                  </div>
                  <Link
                    href={`/directorio/${infoMarca.slug}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
                  >
                    Ver ficha <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </>
              ) : (
                <div className="min-w-0 flex-1">
                  <p className="truncate">{infoLocal.amenidad_nombre}</p>
                  <p className="text-xs text-ink-soft">Local {infoLocal.numero}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
