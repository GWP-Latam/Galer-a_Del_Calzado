"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "none";

const DISTANCE = 24;

function buildVariants(direction: Direction, reduced: boolean): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: direction === "up" ? DISTANCE : 0 },
    visible: { opacity: 1, y: 0 },
  };
}

/** Reveals its children once, the first time they scroll into view. */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const reduced = useReducedMotion();
  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={buildVariants(direction, Boolean(reduced))}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </MotionComponent>
  );
}

/** Staggers the reveal of its direct children by `stagger` seconds. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
}) {
  const MotionComponent = motion[Component];
  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </MotionComponent>
  );
}

export function StaggerItem({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const MotionComponent = motion[Component];
  return (
    <MotionComponent className={className} variants={buildVariants("up", Boolean(reduced))} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </MotionComponent>
  );
}
