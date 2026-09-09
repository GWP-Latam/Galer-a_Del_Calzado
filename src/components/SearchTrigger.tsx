"use client";

import { Search } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Dumb button: opens the single <SearchDialog/> mounted once in the header. */
export function SearchTrigger({
  className,
  children,
  iconOnly = false,
}: {
  className?: string;
  children?: ReactNode;
  iconOnly?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("gc:open-search"))}
      className={clsx(
        "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-sm border border-line px-3 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink",
        className,
      )}
      aria-label="Buscar marcas, locales o contenido del sitio"
    >
      <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {!iconOnly && <span className="whitespace-nowrap">{children ?? "Buscar marcas o locales"}</span>}
      {!iconOnly && (
        <kbd className="ml-1 shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[10px] text-stone-400">
          ⌘K
        </kbd>
      )}
    </button>
  );
}
