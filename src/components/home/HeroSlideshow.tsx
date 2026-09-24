"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import type { FotoGaleria } from "@/lib/content/types";

const INTERVALO_MS = 6000;

/** Fotos de la plaza en fundido cruzado; con movimiento reducido se queda en la primera. */
export function HeroSlideshow({ fotos }: { fotos: FotoGaleria[] }) {
  const [activa, setActiva] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || fotos.length < 2) return;
    const id = setInterval(() => setActiva((i) => (i + 1) % fotos.length), INTERVALO_MS);
    return () => clearInterval(id);
  }, [reduced, fotos.length]);

  return (
    <>
      {fotos.map((foto, i) => (
        <Image
          key={foto.src}
          src={foto.src}
          alt={i === activa ? foto.alt : ""}
          fill
          priority={i === 0}
          sizes="100vw"
          className={
            "object-cover transition-opacity duration-[1500ms] ease-in-out " +
            (i === activa ? "opacity-100" : "opacity-0")
          }
        />
      ))}
    </>
  );
}
