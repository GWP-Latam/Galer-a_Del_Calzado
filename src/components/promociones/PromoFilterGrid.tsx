"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { ChevronDown, Clock } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Tag } from "@/components/ui/Tag";
import { LinkButton } from "@/components/ui/Button";
import {
  CALZADOS,
  DIAS_TERMINA_PRONTO,
  PUBLICOS,
  TIPOS_OFERTA,
  type Calzado,
  type Publico,
  type TipoOferta,
} from "@/lib/promociones/clasificacion";
import type { Marca, Promocion } from "@/lib/content/types";

type Item = {
  promo: Promocion;
  marca?: Marca;
  /** Calculado en el servidor (evita desfases de hidratación por la hora del cliente). */
  diasRestantes: number | null;
};

type Rapido = "todas" | "termina-pronto" | TipoOferta;

const terminaPronto = (i: Item) => i.diasRestantes !== null && i.diasRestantes <= DIAS_TERMINA_PRONTO;

function textoDias(dias: number) {
  if (dias === 0) return "Termina hoy";
  if (dias === 1) return "Termina mañana";
  return `Quedan ${dias} días`;
}

/**
 * Filtros en tres ejes (ver src/lib/promociones/clasificacion.ts). Móvil
 * primero: una sola fila deslizable con el tipo de oferta (más "Termina
 * pronto", que sale de las fechas) y, debajo, dos selectores compactos para
 * "para quién" y "calzado". Solo aparecen las opciones que alguna promoción
 * vigente tiene, así nunca hay un filtro que lleve a una lista vacía.
 */
export function PromoFilterGrid({ items }: { items: Item[] }) {
  const [rapido, setRapido] = useState<Rapido>("todas");
  const [publico, setPublico] = useState<Publico | "">("");
  const [calzado, setCalzado] = useState<Calzado | "">("");
  const reduced = useReducedMotion();

  const opciones = useMemo(() => {
    const tipos = new Map<TipoOferta, number>();
    const publicos = new Set<Publico>();
    const calzados = new Set<Calzado>();
    for (const { promo } of items) {
      if (promo.tipo_oferta) tipos.set(promo.tipo_oferta, (tipos.get(promo.tipo_oferta) ?? 0) + 1);
      promo.publico.forEach((p) => publicos.add(p));
      promo.calzado.forEach((c) => calzados.add(c));
    }
    const orden = <K extends string>(dic: Record<K, string>, set: Set<K>) =>
      (Object.keys(dic) as K[]).filter((k) => set.has(k));
    return {
      tipos: (Object.keys(TIPOS_OFERTA) as TipoOferta[])
        .filter((t) => tipos.has(t))
        .map((t) => ({ tipo: t, total: tipos.get(t)! })),
      publicos: orden(PUBLICOS, publicos),
      calzados: orden(CALZADOS, calzados),
      terminanPronto: items.filter(terminaPronto).length,
    };
  }, [items]);

  // Una promoción sin "para quién" o sin "calzado" es para toda la familia /
  // toda la tienda: aparece con cualquier selección de ese eje.
  const filtrados = items.filter(
    (i) =>
      (rapido === "todas" ||
        (rapido === "termina-pronto" ? terminaPronto(i) : i.promo.tipo_oferta === rapido)) &&
      (!publico || i.promo.publico.length === 0 || i.promo.publico.includes(publico)) &&
      (!calzado || i.promo.calzado.length === 0 || i.promo.calzado.includes(calzado)),
  );

  const hayFiltros = rapido !== "todas" || publico !== "" || calzado !== "";
  const limpiar = () => {
    setRapido("todas");
    setPublico("");
    setCalzado("");
  };

  return (
    <div>
      <div
        role="group"
        aria-label="Tipo de oferta"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        <Chip activo={rapido === "todas"} onClick={() => setRapido("todas")}>
          Todas <Cuenta>{items.length}</Cuenta>
        </Chip>
        {opciones.terminanPronto > 0 && (
          <Chip activo={rapido === "termina-pronto"} onClick={() => setRapido("termina-pronto")}>
            <Clock className="h-3.5 w-3.5" strokeWidth={2} />
            Termina pronto <Cuenta>{opciones.terminanPronto}</Cuenta>
          </Chip>
        )}
        {opciones.tipos.map(({ tipo, total }) => (
          <Chip key={tipo} activo={rapido === tipo} onClick={() => setRapido(tipo)}>
            {TIPOS_OFERTA[tipo]} <Cuenta>{total}</Cuenta>
          </Chip>
        ))}
      </div>

      {(opciones.publicos.length > 0 || opciones.calzados.length > 0) && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {opciones.publicos.length > 0 && (
            <Selector
              etiqueta="Para quién"
              valor={publico}
              onChange={(v) => setPublico(v as Publico | "")}
              todas="Toda la familia"
              opciones={opciones.publicos.map((p) => [p, PUBLICOS[p]])}
            />
          )}
          {opciones.calzados.length > 0 && (
            <Selector
              etiqueta="Calzado"
              valor={calzado}
              onChange={(v) => setCalzado(v as Calzado | "")}
              todas="Todo el calzado"
              opciones={opciones.calzados.map((c) => [c, CALZADOS[c]])}
            />
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between text-sm text-ink-soft" aria-live="polite">
        <span>
          {filtrados.length} {filtrados.length === 1 ? "promoción" : "promociones"}
        </span>
        {hayFiltros && (
          <button type="button" onClick={limpiar} className="font-medium text-ink underline underline-offset-4">
            Quitar filtros
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtrados.map((item) => (
            <motion.article
              key={item.promo.id}
              layout={!reduced}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col justify-between overflow-hidden rounded-md border border-line"
            >
              <PromoCard {...item} />
            </motion.article>
          ))}
        </AnimatePresence>
        {filtrados.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center text-sm text-ink-soft">
            <p>No hay promociones con esa combinación por ahora.</p>
            <button type="button" onClick={limpiar} className="font-medium text-ink underline underline-offset-4">
              Ver todas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PromoCard({ promo, marca, diasRestantes }: Item) {
  const pronto = diasRestantes !== null && diasRestantes <= DIAS_TERMINA_PRONTO;
  const para = promo.publico.length ? promo.publico.map((p) => PUBLICOS[p]).join(", ") : "Toda la familia";
  const que = promo.calzado.length ? promo.calzado.map((c) => CALZADOS[c]).join(", ") : "Toda la tienda";

  return (
    <>
      {promo.imagen && (
        <div className="relative aspect-square w-full bg-stone-100">
          <Image
            src={promo.imagen}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          {promo.demo && <Tag className="absolute right-3 top-3">Ejemplo</Tag>}
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        {promo.demo && !promo.imagen && <Tag className="absolute right-4 top-4">Ejemplo</Tag>}
        <div>
          {marca && <div className="mb-4 h-10 w-24"><BrandLogo marca={marca} /></div>}
          <div className="flex flex-wrap items-center gap-1.5">
            {promo.tipo_oferta && <Tag tone="accent">{TIPOS_OFERTA[promo.tipo_oferta]}</Tag>}
            {pronto && (
              <Tag className="gap-1">
                <Clock className="h-3 w-3" strokeWidth={2} />
                {textoDias(diasRestantes!)}
              </Tag>
            )}
          </div>
          <h3 className="mt-3 text-xl">{promo.titulo}</h3>
          <p className="mt-2 text-sm text-ink-soft">{promo.descripcion}</p>
          <p className="mt-3 text-xs text-ink-soft">
            {para} · {que}
          </p>
        </div>
        {marca && (
          <LinkButton href={`/directorio/${marca.slug}`} variant="ghost" className="mt-6 self-start !px-0">
            Ver {marca.nombre} →
          </LinkButton>
        )}
      </div>
    </>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={clsx(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        activo ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

function Cuenta({ children }: { children: React.ReactNode }) {
  return <span className="text-xs opacity-60">{children}</span>;
}

function Selector({
  etiqueta,
  valor,
  onChange,
  todas,
  opciones,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  todas: string;
  opciones: [string, string][];
}) {
  return (
    <label className="relative block min-w-0 sm:w-48">
      <span className="sr-only">{etiqueta}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "w-full appearance-none truncate rounded-full border py-2 pl-4 pr-9 text-sm font-medium transition-colors",
          valor ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft hover:border-ink",
        )}
      >
        <option value="">{todas}</option>
        {opciones.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <ChevronDown
        className={clsx("pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2", valor ? "text-paper" : "text-ink-soft")}
        strokeWidth={2}
      />
    </label>
  );
}
