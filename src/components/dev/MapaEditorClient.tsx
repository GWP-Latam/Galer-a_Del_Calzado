"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import type { Local, Marca, Nivel, PuntoNormalizado } from "@/lib/content/types";

// Mismas constantes que scripts/generar-geometria-inicial.mjs — el botón
// "Rectángulo desde pin" debe producir exactamente la misma semilla.
const HALF_W = 0.018;
const HALF_H = 0.024;

const DRAFT_KEY = "galeria-mapa-editor-draft-v1";

type Geometria = Record<string, PuntoNormalizado[]>;

function seedRectangulo(local: Local): PuntoNormalizado[] {
  const { x, y } = local;
  return [
    [round(x - HALF_W), round(y - HALF_H)],
    [round(x + HALF_W), round(y - HALF_H)],
    [round(x + HALF_W), round(y + HALF_H)],
    [round(x - HALF_W), round(y + HALF_H)],
  ];
}

function round(n: number) {
  return Math.round(n * 10000) / 10000;
}

function loadDraft(): Geometria | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Geometria) : null;
  } catch {
    return null;
  }
}

function saveDraft(geometria: Geometria) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(geometria));
  } catch {
    // localStorage puede fallar (modo privado, cuota) — el trazado sigue
    // funcionando en memoria durante la sesión, solo no persiste.
  }
}

export function MapaEditorClient({
  niveles,
  locales,
  marcas,
}: {
  niveles: Nivel[];
  locales: Local[];
  marcas: Marca[];
}) {
  const [nivelId, setNivelId] = useState(niveles[niveles.length - 1]?.id ?? niveles[0]?.id);
  const [geometria, setGeometria] = useState<Geometria>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; index: number } | null>(null);

  const marcaPorSlug = useMemo(() => new Map(marcas.map((m) => [m.slug, m])), [marcas]);
  const nivel = niveles.find((n) => n.id === nivelId) ?? niveles[0];

  // Estado inicial: geometría semilla de cada local (ya viene fusionada
  // por getLocales()), con el borrador de localStorage encima si existe.
  useEffect(() => {
    const inicial: Geometria = {};
    for (const l of locales) {
      if (l.geometria) inicial[l.id_interno] = l.geometria;
    }
    // Lee localStorage (solo existe en cliente) una vez al montar; no hay
    // forma de calcular este estado inicial en el primer render sin él.
    const draft = loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeometria(draft ? { ...inicial, ...draft } : inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(geometria).length > 0) saveDraft(geometria);
  }, [geometria]);

  const localesDelNivel = useMemo(
    () => locales.filter((l) => l.nivel === nivelId).sort((a, b) => a.numero.localeCompare(b.numero, "es")),
    [locales, nivelId],
  );

  const localSeleccionado = locales.find((l) => l.id_interno === selectedId) ?? null;
  const puntos = selectedId ? geometria[selectedId] : undefined;

  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x / nivel.ancho_ref, y: local.y / nivel.alto_ref };
  }, [nivel]);

  function actualizarPuntos(id: string, nuevos: PuntoNormalizado[]) {
    setGeometria((prev) => ({ ...prev, [id]: nuevos }));
  }

  function onPointerDownVertice(e: React.PointerEvent, index: number) {
    if (!selectedId) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { id: selectedId, index };
    setSelectedVertex(index);
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toSvgPoint(e.clientX, e.clientY);
    if (!p) return;
    const clamped: PuntoNormalizado = [clamp01(p.x), clamp01(p.y)];
    const actuales = geometria[drag.id] ?? [];
    const nuevos = actuales.map((pt, i) => (i === drag.index ? clamped : pt)) as PuntoNormalizado[];
    actualizarPuntos(drag.id, nuevos);
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function agregarVerticeEnArista(index: number) {
    if (!selectedId || !puntos) return;
    const a = puntos[index];
    const b = puntos[(index + 1) % puntos.length];
    const medio: PuntoNormalizado = [round((a[0] + b[0]) / 2), round((a[1] + b[1]) / 2)];
    const nuevos = [...puntos.slice(0, index + 1), medio, ...puntos.slice(index + 1)];
    actualizarPuntos(selectedId, nuevos);
  }

  function resetRectangulo() {
    if (!selectedId || !localSeleccionado) return;
    actualizarPuntos(selectedId, seedRectangulo(localSeleccionado));
    setSelectedVertex(null);
  }

  async function copiarJson() {
    const ordenado = Object.fromEntries(
      Object.keys(geometria)
        .sort()
        .map((id) => [id, { puntos: geometria[id] }]),
    );
    const texto = JSON.stringify(ordenado, null, 2) + "\n";
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: mostramos el JSON en un prompt como
      // último recurso para que se pueda copiar a mano.
      window.prompt("Copia el JSON manualmente:", texto);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId && selectedVertex !== null && puntos) {
        if (puntos.length <= 3) return; // un polígono necesita al menos 3 puntos
        const nuevos = puntos.filter((_, i) => i !== selectedVertex);
        actualizarPuntos(selectedId, nuevos);
        setSelectedVertex(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, selectedVertex, puntos]);

  if (!nivel) return null;
  const planoSrc = nivel.plano ?? nivel.plano_raster!;

  return (
    <div className="flex flex-col bg-stone-50 text-ink">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
        <div>
          <p className="text-sm font-medium">Editor de geometría del mapa</p>
          <p className="text-xs text-ink-soft">Solo disponible en desarrollo · no forma parte del sitio público</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {niveles.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => { setNivelId(n.id); setSelectedId(null); setSelectedVertex(null); }}
              className={clsx(
                "rounded-sm px-3 py-1.5 text-sm font-medium",
                n.id === nivelId ? "bg-ink text-paper" : "border border-line text-ink-soft",
              )}
            >
              {n.nombre}
            </button>
          ))}
          <button
            type="button"
            onClick={copiarJson}
            className="ml-4 rounded-sm bg-accent px-4 py-1.5 text-sm font-medium text-[var(--accent-ink)]"
          >
            {copiado ? "Copiado ✓" : "Copiar JSON completo"}
          </button>
        </div>
      </div>

      <div className="flex h-[80vh] min-h-[560px] flex-1 overflow-auto">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-line bg-paper p-2">
          {localesDelNivel.map((l) => {
            const marca = l.marca_slug ? marcaPorSlug.get(l.marca_slug) : undefined;
            const label = marca?.nombre ?? l.amenidad_nombre ?? `Local ${l.numero}`;
            return (
              <button
                key={l.id_interno}
                type="button"
                onClick={() => { setSelectedId(l.id_interno); setSelectedVertex(null); }}
                className={clsx(
                  "flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm",
                  l.id_interno === selectedId ? "bg-ink text-paper" : "hover:bg-stone-100",
                )}
              >
                <span className="truncate">{label}</span>
                <span className={clsx("text-xs", l.id_interno === selectedId ? "text-paper/70" : "text-ink-soft")}>
                  Local {l.numero} · {geometria[l.id_interno]?.length ?? 0} pts
                </span>
              </button>
            );
          })}
        </aside>

        <main className="relative min-w-[420px] flex-1 overflow-auto p-6">
          <div
            className="relative mx-auto min-w-[380px] max-w-4xl bg-white"
            style={{ aspectRatio: `${nivel.ancho_ref} / ${nivel.alto_ref}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- herramienta interna, no next/image */}
            <img src={planoSrc} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
            <svg
              ref={svgRef}
              viewBox={`0 0 ${nivel.ancho_ref} ${nivel.alto_ref}`}
              className="absolute inset-0 h-full w-full"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {localesDelNivel.map((l) => {
                const pts = geometria[l.id_interno];
                if (!pts) return null;
                const esSeleccionado = l.id_interno === selectedId;
                const puntosAbs = pts.map(([x, y]) => `${x * nivel.ancho_ref},${y * nivel.alto_ref}`).join(" ");
                return (
                  <polygon
                    key={l.id_interno}
                    points={puntosAbs}
                    onClick={() => { setSelectedId(l.id_interno); setSelectedVertex(null); }}
                    style={{ cursor: "pointer" }}
                    fill={esSeleccionado ? "rgba(150, 116, 42, 0.25)" : "rgba(19, 17, 16, 0.04)"}
                    stroke={esSeleccionado ? "#96742a" : "rgba(19, 17, 16, 0.3)"}
                    strokeWidth={esSeleccionado ? 2.5 : 1}
                  />
                );
              })}

              {/* Puntos medios de arista del local seleccionado: clic agrega vértice */}
              {puntos && puntos.map((pt, i) => {
                const b = puntos[(i + 1) % puntos.length];
                const mx = ((pt[0] + b[0]) / 2) * nivel.ancho_ref;
                const my = ((pt[1] + b[1]) / 2) * nivel.alto_ref;
                return (
                  <circle
                    key={`mid-${i}`}
                    cx={mx}
                    cy={my}
                    r={5}
                    fill="rgba(150, 116, 42, 0.5)"
                    style={{ cursor: "copy" }}
                    onClick={(e) => { e.stopPropagation(); agregarVerticeEnArista(i); }}
                  />
                );
              })}

              {/* Vértices arrastrables del local seleccionado */}
              {puntos && puntos.map((pt, i) => (
                <circle
                  key={`v-${i}`}
                  cx={pt[0] * nivel.ancho_ref}
                  cy={pt[1] * nivel.alto_ref}
                  r={7}
                  fill={selectedVertex === i ? "#96742a" : "#131110"}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: "grab" }}
                  onPointerDown={(e) => onPointerDownVertice(e, i)}
                />
              ))}
            </svg>
          </div>
        </main>

        <aside className="w-64 shrink-0 overflow-y-auto border-l border-line bg-paper p-4">
          {localSeleccionado ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium">
                  {localSeleccionado.marca_slug
                    ? marcaPorSlug.get(localSeleccionado.marca_slug)?.nombre
                    : localSeleccionado.amenidad_nombre ?? "Sin asignar"}
                </p>
                <p className="text-xs text-ink-soft">Local {localSeleccionado.numero} · {nivel.nombre}</p>
              </div>
              <button
                type="button"
                onClick={resetRectangulo}
                className="rounded-sm border border-line px-3 py-2 text-sm hover:bg-stone-50"
              >
                Rectángulo desde pin
              </button>
              <div className="text-xs text-ink-soft">
                <p className="mb-1 font-medium text-ink">Cómo editar</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Arrastra un vértice (círculo oscuro) para moverlo.</li>
                  <li>Clic en un punto dorado a media arista para agregar un vértice ahí.</li>
                  <li>Selecciona un vértice y presiona Backspace/Delete para quitarlo (mínimo 3).</li>
                  <li>El trabajo se guarda solo en este navegador — usa &ldquo;Copiar JSON completo&rdquo; y pégalo en <code>src/data/locales-geometria.json</code> para guardarlo en el repo.</li>
                </ul>
              </div>
              {puntos && (
                <div>
                  <p className="mb-1 text-xs font-medium">Puntos ({puntos.length})</p>
                  <pre className="max-h-40 overflow-auto rounded-sm bg-stone-50 p-2 text-[10px] leading-relaxed">
                    {JSON.stringify(puntos)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Selecciona un local de la lista o haz clic en su forma en el plano.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
