import Image from "next/image";
import { clsx } from "clsx";
import type { Marca } from "@/lib/content/types";

/**
 * Renders a brand's logo (SVG or PNG, delivered by the tenant) with
 * `object-fit: contain` over a neutral surface. Brands without an official
 * logo yet fall back to their initials so the grid never shows a broken
 * image — drop the real file at the path in `marca.logo` and it appears
 * automatically, no code change needed.
 */
export function BrandLogo({
  marca,
  className,
  eager,
}: {
  marca: Marca;
  className?: string;
  /** Skips lazy-loading and Next's on-demand image transform — for small,
   * already-optimized logos shown all at once (e.g. the home marquee),
   * where deferring the fetch just shows up as pop-in. */
  eager?: boolean;
}) {
  if (marca.logo_generico || !marca.logo) {
    const initials = marca.nombre
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    return (
      <div
        className={clsx(
          "flex h-full w-full items-center justify-center rounded-sm bg-stone-100 text-lg text-ink-soft",
          className,
        )}
        aria-hidden="true"
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={clsx("relative h-full w-full", className)}>
      <Image
        src={marca.logo}
        alt={`Logotipo de ${marca.nombre}`}
        fill
        sizes="200px"
        priority={eager}
        unoptimized={eager}
        className="object-contain"
      />
    </div>
  );
}
