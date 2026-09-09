import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft",
  secondary: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
  ghost: "bg-transparent text-ink hover:text-accent",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-wide transition-colors duration-200 ease-out whitespace-nowrap";

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ButtonOwnProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={clsx(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  icon,
  className,
  href,
  children,
  ...props
}: ButtonOwnProps & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={clsx(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    >
      {children}
      {icon}
    </Link>
  );
}
