import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/BrandLogo";
import type { Marca } from "@/lib/content/types";

export function BrandListItem({
  marca,
  active,
  onSelect,
}: {
  marca: Marca;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-4 rounded-md border p-3 transition-colors",
        active ? "border-ink bg-stone-50" : "border-line hover:border-ink-soft",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-4 text-left"
        aria-pressed={active}
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-line bg-paper p-1.5">
          <BrandLogo marca={marca} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base">{marca.nombre}</p>
          <p className="text-xs text-ink-soft">
            {marca.locales.length ? `Local ${marca.locales.join(", ")}` : "Ubicación por confirmar"}
          </p>
        </div>
      </button>
      <Link
        href={`/directorio/${marca.slug}`}
        aria-label={`Ver ficha de ${marca.nombre}`}
        className="shrink-0 rounded-full p-2 text-ink-soft hover:bg-stone-100 hover:text-ink"
      >
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
}
