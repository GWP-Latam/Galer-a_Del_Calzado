"use client";

import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Revela un título línea por línea: cada línea vive en un contenedor
 * `overflow-hidden` y sube desde abajo con un pequeño stagger. Las líneas se
 * definen con <br/> explícitos entre children — no se mide el DOM ni se
 * reflowea texto automáticamente.
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

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component className={className}>
      {lineas.map((linea, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.08 }}
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
