"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Tag } from "@/components/ui/Tag";
import type { Marca, Promocion } from "@/lib/content/types";

export function PromoCarousel({
  items,
}: {
  items: { promo: Promocion; marca?: Marca }[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-promo-card]");
    const step = (card?.offsetWidth ?? 320) + 20;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ promo, marca }) => (
          <article
            key={promo.id}
            data-promo-card
            className="relative flex h-80 w-[280px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-md bg-ink sm:w-[340px]"
          >
            {promo.imagen ? (
              <Image src={promo.imagen} alt="" fill sizes="340px" className="object-cover" />
            ) : marca ? (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-100 p-14">
                <BrandLogo marca={marca} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                <Sparkles className="h-8 w-8 text-stone-400" strokeWidth={1.5} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
            {promo.demo && (
              <Tag className="absolute right-4 top-4 z-10">Ejemplo</Tag>
            )}
            <div className="relative z-10 p-5 text-paper">
              <p className="font-display text-xl leading-tight">{promo.titulo}</p>
              <p className="mt-1.5 line-clamp-2 text-sm text-paper/80">{promo.descripcion}</p>
              {marca && (
                <Link
                  href={`/directorio/${marca.slug}`}
                  className="mt-3 inline-block text-sm font-medium underline decoration-paper/40 underline-offset-4 hover:decoration-paper"
                >
                  Ver {marca.nombre}
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Promoción anterior"
          className="rounded-full border border-line p-2 hover:border-ink"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Siguiente promoción"
          className="rounded-full border border-line p-2 hover:border-ink"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
