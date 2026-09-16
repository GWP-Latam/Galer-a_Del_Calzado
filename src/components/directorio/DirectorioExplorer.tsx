"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X, ArrowRight, List, Map as MapIcon, Home } from "lucide-react";
import { clsx } from "clsx";
import { InteractiveMap, type InteractiveMapHandle } from "./InteractiveMap";
import { BrandListItem } from "./BrandListItem";
import { BrandLogo } from "@/components/BrandLogo";
import { Monogram } from "@/components/Monogram";
import type { Local, Marca, Nivel } from "@/lib/content/types";

const EASE = [0.16, 1, 0.3, 1] as const;

// Solo se reproduce una vez por sesión de navegador.
const INTRO_SESSION_KEY = "galeria-directorio-intro-vista";

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
  const [categoria, setCategoria] = useState<string | "todas">("todas");
  const [nivelId, setNivelId] = useState<string | undefined>(
    niveles[niveles.length - 1]?.id ?? niveles[0]?.id,
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [infoLocal, setInfoLocal] = useState<Local | null>(null);
  const [mobileView, setMobileView] = useState<"lista" | "mapa">("mapa");
  const [pendingFly, setPendingFly] = useState<string[] | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapRef = useRef<InteractiveMapHandle>(null);
  const reduced = useReducedMotion();

  // Entrada cinemática: solo la primera vez que se visita /directorio en
  // esta pestaña. "introKey" fuerza el remount del contenedor del mapa
  // para que su animación initial→animate se reproduzca de verdad (motion
  // no la repite si solo cambia una prop en un elemento ya montado).
  const [introKey, setIntroKey] = useState(0);
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);

  // Decide si toca reproducir la intro. Separado del efecto que la apaga
  // (abajo) a propósito: en desarrollo React monta cada efecto dos veces
  // (mount → cleanup → mount) para detectar código no idempotente. Si el
  // "ya se vio" y el "apágala en 1.3s" vivieran en el mismo efecto, el
  // cleanup de la primera pasada cancelaría el timeout y la segunda
  // pasada, al ver sessionStorage ya marcado, no volvería a programarlo —
  // la intro se quedaría pegada en pantalla para siempre.
  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY)) return;
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      return; // sin sessionStorage no hay forma de saber si ya se vio — se omite
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIntroKey(1);
    setShowIntroOverlay(true);
  }, [reduced]);

  // Apaga la intro sola a los 1.3s. Al depender de showIntroOverlay (no de
  // sessionStorage), el doble-montaje de React siempre deja un timeout
  // vivo que sí dispara.
  useEffect(() => {
    if (!showIntroOverlay) return;
    const t = setTimeout(() => setShowIntroOverlay(false), 1300);
    return () => clearTimeout(t);
  }, [showIntroOverlay]);

  const nivel = niveles.find((n) => n.id === nivelId) ?? niveles[0];

  const categorias = useMemo(() => {
    const set = new Set<string>();
    marcas.forEach((m) => m.categorias_producto.forEach((c) => set.add(c)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [marcas]);

  const marcasPorCategoria = useMemo(
    () => (categoria === "todas" ? marcas : marcas.filter((m) => m.categorias_producto.includes(categoria))),
    [marcas, categoria],
  );

  const fuse = useMemo(
    () => new Fuse(marcasPorCategoria, { keys: ["nombre"], threshold: 0.35, ignoreLocation: true }),
    [marcasPorCategoria],
  );

  const filteredMarcas = useMemo(() => {
    const q = query.trim();
    if (!q) return marcasPorCategoria;
    return fuse.search(q).map((r) => r.item);
  }, [marcasPorCategoria, fuse, query]);

  const localesDelNivel = useMemo(() => locales.filter((l) => l.nivel === nivel?.id), [locales, nivel]);

  // Vuela a la forma del local (o locales, para marcas con varias
  // sucursales) una vez que el mapa del nivel correcto ya está montado —
  // si hubo que cambiar de piso, esperamos al siguiente frame.
  useEffect(() => {
    if (!pendingFly) return;
    // useEffect ya corre después de que React aplicó el DOM del nivel
    // nuevo (si hubo cambio de piso) — no hace falta esperar un frame más.
    mapRef.current?.flyTo(pendingFly);
    // "pendingFly" es un disparador de una acción imperativa (volar la
    // cámara), no estado derivado — limpiarlo aquí es correcto aunque el
    // linter prefiera evitar setState dentro de efectos en general.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingFly(null);
  }, [pendingFly, nivelId]);

  function selectMarca(marca: Marca) {
    setSelectedSlug(marca.slug);
    const susLocales = locales.filter((l) => l.marca_slug === marca.slug);
    if (susLocales.length > 0) {
      if (!susLocales.some((l) => l.nivel === nivelId)) setNivelId(susLocales[0].nivel);
      setInfoLocal(susLocales[0]);
      setPendingFly(susLocales.map((l) => l.id_interno));
    } else {
      setInfoLocal(null);
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
  const infoDisponible = infoLocal?.estado === "disponible";

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

      {categorias.length > 1 && (
        <div className="-mt-2 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoria("todas")}
            className={clsx(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              categoria === "todas" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink",
            )}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={clsx(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                categoria === c ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

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

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${categoria}-${query}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[640px]"
            >
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
            </motion.div>
          </AnimatePresence>
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

          <div className="relative h-[420px] sm:h-[520px] lg:h-[640px]">
            {/* Entrada cinemática: el mapa arranca alejado y borroso y
                "desciende" a su encuadre normal — key={introKey} fuerza el
                remount para que initial→animate se reproduzca de verdad. */}
            <motion.div
              key={introKey}
              className="absolute inset-0"
              initial={introKey === 1 ? { scale: 1.12, opacity: 0, filter: "blur(6px)" } : false}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <AnimatePresence initial={false}>
                {nivel && (
                  <motion.div
                    key={nivel.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <InteractiveMap
                      ref={mapRef}
                      nivel={nivel}
                      locales={localesDelNivel}
                      selectedSlug={selectedSlug}
                      onSelectLocal={selectLocal}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {showIntroOverlay && (
                <motion.div
                  className="absolute inset-0 z-30 flex cursor-pointer items-center justify-center rounded-md bg-paper"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  role="button"
                  tabIndex={0}
                  aria-label="Saltar animación de bienvenida al mapa"
                  onClick={() => setShowIntroOverlay(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setShowIntroOverlay(false);
                  }}
                >
                  <Monogram className="h-16 w-16 text-ink/10" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop: tarjeta de info inline bajo el mapa */}
          {infoLocal && (
            <div className="hidden items-center gap-4 rounded-md border border-line bg-stone-50 p-4 lg:flex">
              <InfoLocalContenido infoLocal={infoLocal} infoMarca={infoMarca} infoDisponible={infoDisponible} />
            </div>
          )}
        </div>
      </div>

      {/* Móvil: bottom sheet fija, con swipe-down para cerrar */}
      <AnimatePresence>
        {infoLocal && mobileView === "mapa" && (
          <motion.div
            key="bottom-sheet"
            className="fixed inset-x-0 bottom-0 z-40 rounded-t-xl border-t border-line bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-md lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: EASE }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) setInfoLocal(null);
            }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="flex items-center gap-4">
              <InfoLocalContenido infoLocal={infoLocal} infoMarca={infoMarca} infoDisponible={infoDisponible} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoLocalContenido({
  infoLocal,
  infoMarca,
  infoDisponible,
}: {
  infoLocal: Local;
  infoMarca?: Marca;
  infoDisponible: boolean;
}) {
  if (infoDisponible) {
    return (
      <>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[var(--state-available-ink)]/30 bg-[var(--state-available-bg)]">
          <Home className="h-5 w-5 text-[var(--state-available-ink)]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--state-available-ink)]">Local disponible</p>
          <p className="text-xs text-ink-soft">Local {infoLocal.numero}</p>
        </div>
        <Link
          href="/oportunidades/locales"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          Renta este local <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </>
    );
  }

  if (infoMarca) {
    return (
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
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <p className="truncate">{infoLocal.amenidad_nombre}</p>
      <p className="text-xs text-ink-soft">Local {infoLocal.numero}</p>
    </div>
  );
}
