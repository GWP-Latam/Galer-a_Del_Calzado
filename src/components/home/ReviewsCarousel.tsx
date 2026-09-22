"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Resena } from "@/lib/content/types";

function Stars({ calificacion }: { calificacion: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${calificacion} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          strokeWidth={1.5}
          fill={i < calificacion ? "currentColor" : "none"}
          style={{ color: "var(--accent)" }}
        />
      ))}
    </div>
  );
}

export function ReviewsCarousel({ resenas }: { resenas: Resena[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-review-card]");
    const step = (card?.offsetWidth ?? 260) + 16;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {resenas.map((resena) => (
          <figure
            key={resena.id}
            data-review-card
            className="flex h-52 w-64 shrink-0 snap-start flex-col gap-3 rounded-md border border-line bg-paper p-5 shadow-sm"
          >
            <Stars calificacion={resena.calificacion} />
            <blockquote className="line-clamp-4 flex-1 text-sm leading-relaxed text-ink-soft">
              “{resena.texto}”
            </blockquote>
            <figcaption className="flex items-center gap-2.5">
              {resena.autor_foto_url ? (
                <Image
                  src={resena.autor_foto_url}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-medium text-ink-soft">
                  {resena.autor_nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate text-sm font-medium text-ink">{resena.autor_nombre}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Reseña anterior"
          className="rounded-full border border-line p-2 hover:border-ink"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Siguiente reseña"
          className="rounded-full border border-line p-2 hover:border-ink"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
