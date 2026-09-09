"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { clsx } from "clsx";

export interface Hito {
  anio: string;
  texto: string;
}

/**
 * A real scroll-driven timeline (not a static grid): a vertical line fills
 * as the visitor scrolls past it, and each milestone slides in from
 * alternating sides. This is the interim step toward full scrollytelling —
 * once research on awards/certifications/press coverage lands (see memoria
 * del proyecto), each node here is where that content plugs in, and photos
 * can replace the plain nodes without changing this structure.
 */
export function AnimatedTimeline({ hitos }: { hitos: Hito[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.4"],
  });
  const lineHeight = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 120,
    damping: 24,
  });

  return (
    <div ref={containerRef} className="relative mt-8">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line sm:left-1/2" />
      <motion.div
        className="absolute left-[7px] top-2 w-px bg-accent sm:left-1/2"
        style={{ height: lineHeight }}
      />

      <div className="flex flex-col gap-14">
        {hitos.map((h, i) => (
          <TimelineNode key={h.anio} hito={h} align={i % 2 === 0 ? "left" : "right"} />
        ))}
      </div>
    </div>
  );
}

function TimelineNode({ hito, align }: { hito: Hito; align: "left" | "right" }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: nodeRef, offset: ["start 0.9", "start 0.5"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [align === "left" ? -28 : 28, 0]);

  return (
    <div ref={nodeRef} className="relative pl-9 sm:grid sm:grid-cols-2 sm:gap-10 sm:pl-0">
      <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-accent bg-paper sm:left-1/2 sm:-translate-x-1/2" />

      <motion.div
        style={{ opacity, x }}
        className={clsx(
          "sm:col-span-1",
          align === "left" ? "sm:col-start-1 sm:pr-10 sm:text-right" : "sm:col-start-2 sm:pl-10",
        )}
      >
        <p className="font-display text-3xl">{hito.anio}</p>
        <p className="mt-2 text-sm text-ink-soft">{hito.texto}</p>
      </motion.div>
    </div>
  );
}
