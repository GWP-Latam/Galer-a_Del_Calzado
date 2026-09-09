"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/BrandLogo";
import { Tag } from "@/components/ui/Tag";
import { LinkButton } from "@/components/ui/Button";
import type { Marca, Promocion, PromocionCategoria } from "@/lib/content/types";

const CATEGORY_LABELS: Record<PromocionCategoria, string> = {
  liquidacion: "Liquidación",
  descuentos: "Descuentos",
  rebajas: "Rebajas",
  deportivo: "Deportivo",
  lujo: "Lujo",
  casual: "Casual",
};

export function PromoFilterGrid({
  items,
}: {
  items: { promo: Promocion; marca?: Marca }[];
}) {
  const [activa, setActiva] = useState<PromocionCategoria | "todas">("todas");

  const categoriasPresentes = useMemo(() => {
    const set = new Set<PromocionCategoria>();
    items.forEach(({ promo }) => promo.categorias.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [items]);

  const filtrados = activa === "todas" ? items : items.filter(({ promo }) => promo.categorias.includes(activa));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiva("todas")}
          className={clsx(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            activa === "todas" ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink",
          )}
        >
          Todas
        </button>
        {categoriasPresentes.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiva(cat)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activa === cat ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink",
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map(({ promo, marca }) => (
          <article key={promo.id} className="relative flex flex-col justify-between rounded-md border border-line p-6">
            {promo.demo && <Tag className="absolute right-4 top-4">Ejemplo</Tag>}
            <div>
              {marca && <div className="mb-4 h-10 w-24"><BrandLogo marca={marca} /></div>}
              <h3 className="text-xl">{promo.titulo}</h3>
              <p className="mt-2 text-sm text-ink-soft">{promo.descripcion}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {promo.categorias.map((c) => (
                  <Tag key={c} tone="default">{CATEGORY_LABELS[c]}</Tag>
                ))}
              </div>
            </div>
            {marca && (
              <LinkButton href={`/directorio/${marca.slug}`} variant="ghost" className="mt-6 self-start !px-0">
                Ver {marca.nombre} →
              </LinkButton>
            )}
          </article>
        ))}
        {filtrados.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-ink-soft">
            No hay promociones en esta categoría por ahora.
          </p>
        )}
      </div>
    </div>
  );
}
