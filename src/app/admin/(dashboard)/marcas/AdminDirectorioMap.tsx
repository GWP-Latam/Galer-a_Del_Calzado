"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { InteractiveMap } from "@/components/directorio/InteractiveMap";
import type { Local, Nivel } from "@/lib/content/types";

/**
 * Mismo InteractiveMap del sitio público (con la geometría real de cada
 * local), pero al hacer clic en una marca navega a su ficha de edición en
 * vez de a la ficha pública. Los locales sin marca (amenidades, vacantes)
 * simplemente no navegan a ningún lado.
 */
export function AdminDirectorioMap({ niveles, locales }: { niveles: Nivel[]; locales: Local[] }) {
  const [nivelId, setNivelId] = useState(niveles[niveles.length - 1]?.id ?? niveles[0]?.id);
  const router = useRouter();
  const nivel = niveles.find((n) => n.id === nivelId) ?? niveles[0];
  if (!nivel) return null;

  const localesDelNivel = locales.filter((l) => l.nivel === nivelId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {niveles.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setNivelId(n.id)}
            className={clsx(
              "rounded-sm px-3 py-1.5 text-sm font-medium",
              n.id === nivelId ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-600",
            )}
          >
            {n.nombre}
          </button>
        ))}
      </div>
      <div className="h-[520px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
        <InteractiveMap
          nivel={nivel}
          locales={localesDelNivel}
          selectedSlug={null}
          onSelectLocal={(local) => {
            if (local.marca_slug) router.push(`/admin/marcas/${local.marca_slug}`);
          }}
        />
      </div>
    </div>
  );
}
