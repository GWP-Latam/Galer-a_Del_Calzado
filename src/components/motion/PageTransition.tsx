"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Entrada de página en cada navegación. Next.js re-renderiza app/template.tsx
 * en cada cambio de ruta, pero solo remonta cuando cambia el segmento de su
 * propio nivel — navegar de /directorio a /directorio/[slug] no lo dispara
 * (ver docs/01-app/.../template.md). Por eso la clave real la ponemos
 * nosotros con `key={pathname}`: fuerza el remount del motion.div en
 * cualquier cambio de ruta, incluidas las rutas dinámicas anidadas.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
