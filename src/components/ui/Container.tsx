import { clsx } from "clsx";
import type { ElementType, ComponentPropsWithoutRef } from "react";

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Container<T extends ElementType = "div">({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={clsx("mx-auto w-full max-w-[var(--container-max)] px-[var(--container-pad)]", className)}
      {...props}
    />
  );
}
