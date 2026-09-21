"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import type { Local, LocalEstado, Marca, Nivel, PuntoNormalizado } from "@/lib/content/types";

// Mismas constantes que scripts/generar-geometria-inicial.mjs — el botón
// "Rectángulo desde pin" debe producir exactamente la misma semilla.
const HALF_W = 0.018;
const HALF_H = 0.024;

const DRAFT_KEY = "galeria-mapa-editor-draft-v2";

type Geometria = Record<string, PuntoNormalizado[]>;
type Draft = { locales: Local[]; geometria: Geometria };

function seedRectangulo(x: number, y: number): PuntoNormalizado[] {
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

function nuevoIdInterno() {
  return `nuevo-${Math.random().toString(36).slice(2, 8)}`;
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage puede fallar (modo privado, cuota) — el trazado sigue
    // funcionando en memoria durante la sesión, solo no persiste.
  }
}

async function copiarAlPortapapeles(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Sin permiso de portapapeles: lo mostramos en un prompt como último
    // recurso para poder copiarlo a mano.
    window.prompt("Copia el JSON manualmente:", texto);
    return false;
  }
}

export function MapaEditorClient({
  niveles,
  locales: localesIniciales,
  marcas,
}: {
  niveles: Nivel[];
  locales: Local[];
  marcas: Marca[];
}) {
  const [nivelId, setNivelId] = useState(niveles[niveles.length - 1]?.id ?? niveles[0]?.id);
  const [locales, setLocales] = useState<Local[]>(localesIniciales);
  const [geometria, setGeometria] = useState<Geometria>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [modoAgregar, setModoAgregar] = useState(false);
  const [copiado, setCopiado] = useState<"locales" | "geometria" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; index: number } | null>(null);

  const marcaPorSlug = useMemo(() => new Map(marcas.map((m) => [m.slug, m])), [marcas]);
  const nivel = niveles.find((n) => n.id === nivelId) ?? niveles[0];

  // Estado inicial: locales + geometría seed que ya trae getLocales(), con
  // el borrador de localStorage encima si existe (permite seguir editando
  // tras un refresh sin perder locales agregados/quitados).
  useEffect(() => {
    const inicial: Geometria = {};
    for (const l of localesIniciales) {
      if (l.geometria) inicial[l.id_interno] = l.geometria;
    }
    const draft = loadDraft();
    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocales(draft.locales);
      setGeometria({ ...inicial, ...draft.geometria });
    } else {
      setGeometria(inicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveDraft({ locales, geometria });
  }, [locales, geometria]);

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

  function actualizarLocal(id: string, cambios: Partial<Local>) {
    setLocales((prev) => prev.map((l) => (l.id_interno === id ? { ...l, ...cambios } : l)));
  }

  function agregarLocal(x: number, y: number) {
    const id = nuevoIdInterno();
    const nuevo: Local = {
      id_interno: id,
      numero: "",
      nivel: nivelId,
      x: round(x),
      y: round(y),
      estado: "disponible",
      marca_slug: null,
      amenidad_nombre: null,
    };
    setLocales((prev) => [...prev, nuevo]);
    setGeometria((prev) => ({ ...prev, [id]: seedRectangulo(x, y) }));
    setSelectedId(id);
    setSelectedVertex(null);
    setModoAgregar(false);
  }

  function eliminarLocal(id: string) {
    const local = locales.find((l) => l.id_interno === id);
    const etiqueta = local?.marca_slug ?? local?.amenidad_nombre ?? `local ${local?.numero || "sin número"}`;
    if (!window.confirm(`¿Quitar "${etiqueta}" del mapa? Esto no se puede deshacer aquí.`)) return;
    setLocales((prev) => prev.filter((l) => l.id_interno !== id));
    setGeometria((prev) => {
      const resto = { ...prev };
      delete resto[id];
      return resto;
    });
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedVertex(null);
    }
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

  function onClickSvg(e: React.MouseEvent<SVGSVGElement>) {
    if (!modoAgregar) return;
    if (e.target !== svgRef.current) return; // clic en un polígono/vértice existente, no en el fondo
    const p = toSvgPoint(e.clientX, e.clientY);
    if (!p) return;
    agregarLocal(clamp01(p.x), clamp01(p.y));
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
    actualizarPuntos(selectedId, seedRectangulo(localSeleccionado.x, localSeleccionado.y));
    setSelectedVertex(null);
  }

  async function copiarLocalesJson() {
    // Mismo orden de campos que ya trae src/data/locales.json.
    const salida = locales.map((l) => ({
      id_interno: l.id_interno,
      numero: l.numero,
      nivel: l.nivel,
      x: l.x,
      y: l.y,
      estado: l.estado,
      marca_slug: l.marca_slug,
      amenidad_nombre: l.amenidad_nombre,
    }));
    const ok = await copiarAlPortapapeles(JSON.stringify(salida, null, 2) + "\n");
    if (ok) {
      setCopiado("locales");
      setTimeout(() => setCopiado(null), 2000);
    }
  }

  async function copiarGeometriaJson() {
    const idsVigentes = new Set(locales.map((l) => l.id_interno));
    const ordenado = Object.fromEntries(
      Object.keys(geometria)
        .filter((id) => idsVigentes.has(id))
        .sort()
        .map((id) => [id, { puntos: geometria[id] }]),
    );
    const ok = await copiarAlPortapapeles(JSON.stringify(ordenado, null, 2) + "\n");
    if (ok) {
      setCopiado("geometria");
      setTimeout(() => setCopiado(null), 2000);
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
              onClick={() => { setNivelId(n.id); setSelectedId(null); setSelectedVertex(null); setModoAgregar(false); }}
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
            onClick={() => setModoAgregar((v) => !v)}
            className={clsx(
              "ml-4 rounded-sm border px-4 py-1.5 text-sm font-medium",
              modoAgregar ? "border-accent bg-accent text-[var(--accent-ink)]" : "border-line text-ink-soft hover:bg-stone-50",
            )}
          >
            {modoAgregar ? "Clic en el plano para colocar…" : "+ Agregar local"}
          </button>
          <button
            type="button"
            onClick={copiarLocalesJson}
            className="rounded-sm border border-line px-4 py-1.5 text-sm font-medium hover:bg-stone-50"
          >
            {copiado === "locales" ? "Copiado ✓" : "Copiar locales.json"}
          </button>
          <button
            type="button"
            onClick={copiarGeometriaJson}
            className="rounded-sm bg-accent px-4 py-1.5 text-sm font-medium text-[var(--accent-ink)]"
          >
            {copiado === "geometria" ? "Copiado ✓" : "Copiar locales-geometria.json"}
          </button>
        </div>
      </div>

      <div className="flex h-[80vh] min-h-[560px] flex-1 overflow-auto">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-line bg-paper p-2">
          {localesDelNivel.map((l) => {
            const marca = l.marca_slug ? marcaPorSlug.get(l.marca_slug) : undefined;
            const label = marca?.nombre ?? l.amenidad_nombre ?? (l.numero ? `Local ${l.numero}` : "Sin datos");
            return (
              <button
                key={l.id_interno}
                type="button"
                onClick={() => { setSelectedId(l.id_interno); setSelectedVertex(null); setModoAgregar(false); }}
                className={clsx(
                  "flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm",
                  l.id_interno === selectedId ? "bg-ink text-paper" : "hover:bg-stone-100",
                )}
              >
                <span className="truncate">{label}</span>
                <span className={clsx("text-xs", l.id_interno === selectedId ? "text-paper/70" : "text-ink-soft")}>
                  Local {l.numero || "—"} · {geometria[l.id_interno]?.length ?? 0} pts
                </span>
              </button>
            );
          })}
        </aside>

        <main className="relative min-w-[420px] flex-1 overflow-auto p-6">
          <div
            className={clsx(
              "relative mx-auto min-w-[380px] max-w-4xl bg-white",
              modoAgregar && "cursor-copy",
            )}
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
              onClick={onClickSvg}
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
                    onClick={(e) => { e.stopPropagation(); setSelectedId(l.id_interno); setSelectedVertex(null); }}
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

        <aside className="w-72 shrink-0 overflow-y-auto border-l border-line bg-paper p-4">
          {localSeleccionado ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 border-b border-line pb-4">
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                  Número
                  <input
                    type="text"
                    value={localSeleccionado.numero}
                    onChange={(e) => actualizarLocal(localSeleccionado.id_interno, { numero: e.target.value })}
                    className="rounded-sm border border-line px-2 py-1.5 text-sm text-ink"
                    placeholder="Ej. 04, Isla-3"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                  Marca (deja vacío para amenidad/disponible)
                  <select
                    value={localSeleccionado.marca_slug ?? ""}
                    onChange={(e) =>
                      actualizarLocal(localSeleccionado.id_interno, {
                        marca_slug: e.target.value || null,
                        amenidad_nombre: e.target.value ? null : localSeleccionado.amenidad_nombre,
                      })
                    }
                    className="rounded-sm border border-line bg-paper px-2 py-1.5 text-sm text-ink"
                  >
                    <option value="">— Sin marca —</option>
                    {marcas.map((m) => (
                      <option key={m.slug} value={m.slug}>{m.nombre}</option>
                    ))}
                  </select>
                </label>

                {!localSeleccionado.marca_slug && (
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                    Nombre de amenidad (si aplica)
                    <input
                      type="text"
                      value={localSeleccionado.amenidad_nombre ?? ""}
                      onChange={(e) =>
                        actualizarLocal(localSeleccionado.id_interno, { amenidad_nombre: e.target.value || null })
                      }
                      className="rounded-sm border border-line px-2 py-1.5 text-sm text-ink"
                      placeholder="Ej. Administración, Isla de accesorios"
                    />
                  </label>
                )}

                <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                  Estado
                  <select
                    value={localSeleccionado.estado}
                    onChange={(e) =>
                      actualizarLocal(localSeleccionado.id_interno, { estado: e.target.value as LocalEstado })
                    }
                    className="rounded-sm border border-line bg-paper px-2 py-1.5 text-sm text-ink"
                  >
                    <option value="ocupado">Ocupado</option>
                    <option value="disponible">Disponible</option>
                  </select>
                </label>

                <p className="text-xs text-ink-soft">Local {localSeleccionado.numero || "—"} · {nivel.nombre}</p>
              </div>

              <button
                type="button"
                onClick={resetRectangulo}
                className="rounded-sm border border-line px-3 py-2 text-sm hover:bg-stone-50"
              >
                Rectángulo desde pin
              </button>

              <button
                type="button"
                onClick={() => eliminarLocal(localSeleccionado.id_interno)}
                className="rounded-sm border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Quitar este local del mapa
              </button>

              <div className="text-xs text-ink-soft">
                <p className="mb-1 font-medium text-ink">Cómo editar</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Arrastra un vértice (círculo oscuro) para moverlo.</li>
                  <li>Clic en un punto dorado a media arista para agregar un vértice ahí.</li>
                  <li>Selecciona un vértice y presiona Backspace/Delete para quitarlo (mínimo 3).</li>
                  <li>&ldquo;+ Agregar local&rdquo; y luego clic en el plano coloca un local nuevo (isla, local vacío, lo que sea) ahí mismo — edítalo con los campos de arriba.</li>
                  <li>
                    El trabajo se guarda solo en este navegador — usa los botones &ldquo;Copiar&rdquo; y pega cada uno
                    en <code>src/data/locales.json</code> y <code>src/data/locales-geometria.json</code> para
                    guardarlo en el repo.
                  </li>
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
            <p className="text-sm text-ink-soft">
              Selecciona un local de la lista, haz clic en su forma en el plano, o usa &ldquo;+ Agregar local&rdquo;
              para crear uno nuevo.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
