import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "available";
  className?: string;
}) {
  const toneClasses = {
    default: "bg-stone-100 text-ink-soft",
    accent: "bg-accent text-accent-ink",
    available: "bg-[var(--state-available-bg)] text-[var(--state-available-ink)]",
  }[tone];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        toneClasses,
        className,
      )}
    >
      {children}
    </span>
  );
}
