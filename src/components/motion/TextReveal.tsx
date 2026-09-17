"use client";

import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

function buildVariants(reduced: boolean): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  }
  return {
    hidden: { y: "110%" },
    visible: { y: "0%" },
  };
}

/**
 * Revela un título línea por línea al montar: cada línea vive en un
 * contenedor `overflow-hidden` y sube desde abajo con un pequeño stagger.
 * Las líneas se definen con <br/> explícitos entre children — no se mide
 * el DOM ni se reflowea texto automáticamente.
 *
 * Dispara con `animate` al montar (como PageTransition), no con
 * `whileInView`: el propio contenedor overflow-hidden de cada línea
 * recorta a su hijo antes de la animación, así que el hijo arranca con
 * 0% de área visible — cualquier variante de whileInView atada a ese
 * árbol nunca detecta intersección con IntersectionObserver y el texto
 * queda invisible para siempre. TextReveal se usa para títulos que ya
 * están en pantalla al cargar (el H1 del hero), así que no hace falta
 * esperar a que entren en viewport — animar al montar es más simple y
 * es exactamente lo que se necesita aquí.
 */
export function TextReveal({
  children,
  as: Component = "h2",
  className,
  delay = 0,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const lineas = splitByBreak(children);
  const variants = buildVariants(Boolean(reduced));

  return (
    <Component className={className}>
      {lineas.map((linea, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.7, ease: EASE, delay: delay + i * 0.08 }}
          >
            {linea}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}

/** Parte los children en líneas cortando en cada <br/>. */
function splitByBreak(children: ReactNode): ReactNode[] {
  const lineas: ReactNode[][] = [[]];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === "br") {
      lineas.push([]);
    } else {
      lineas[lineas.length - 1].push(child);
    }
  });
  return lineas.map((partes, i) => <Fragment key={i}>{partes}</Fragment>);
}
