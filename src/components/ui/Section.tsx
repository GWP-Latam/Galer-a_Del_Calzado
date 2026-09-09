import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Container } from "./Container";

type Tone = "paper" | "stone" | "ink";

const TONE_CLASSES: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  stone: "bg-stone-50 text-ink",
  ink: "bg-ink text-paper",
};

export function Section({
  children,
  tone = "paper",
  className,
  containerClassName,
  id,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("py-16 md:py-24", TONE_CLASSES[tone], className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={clsx(
        "font-body text-xs font-medium uppercase tracking-[0.18em] text-accent",
        className,
      )}
    >
      {children}
    </p>
  );
}
