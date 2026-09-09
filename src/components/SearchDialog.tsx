"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search, X, MapPin, Tag as TagIcon, FileText } from "lucide-react";
import { clsx } from "clsx";
import type { SearchItem } from "@/lib/search-index";

const TYPE_ICON: Record<SearchItem["type"], typeof Search> = {
  marca: TagIcon,
  amenidad: MapPin,
  pagina: FileText,
};

const TYPE_LABEL: Record<SearchItem["type"], string> = {
  marca: "Marca",
  amenidad: "Amenidad",
  pagina: "Página",
};

/**
 * The single modal instance for site-wide search. Mount this once (in
 * <Header/>). Any button anywhere can open it via <SearchTrigger/>, which
 * just dispatches the "gc:open-search" event — no shared state needed.
 */
export function SearchDialog({ index }: { index: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);
  const router = useRouter();

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const fuse = useMemo(
    () => new Fuse(index, { keys: ["label", "sublabel"], threshold: 0.35, ignoreLocation: true }),
    [index],
  );

  const suggestions = useMemo(() => index.filter((i) => i.type === "marca").slice(0, 8), [index]);
  const results = query.trim() ? fuse.search(query).map((r) => r.item).slice(0, 8) : suggestions;

  function close() {
    setOpen(false);
    setQuery("");
    setActive(0);
  }

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) close();
        else setOpen(true);
      }
      if (e.key === "Escape") close();
    }
    function onOpenRequest() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("gc:open-search", onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("gc:open-search", onOpenRequest);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function go(item: SearchItem) {
    close();
    router.push(item.href as Parameters<typeof router.push>[0]);
  }

  function onInputKeydown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en Galería del Calzado"
        className="w-full max-w-xl overflow-hidden rounded-md bg-paper shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="h-4.5 w-4.5 shrink-0 text-stone-400" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeydown}
            placeholder="Buscar una marca, un local, una página…"
            className="w-full bg-transparent text-base outline-none placeholder:text-stone-400"
            aria-label="Escribe para buscar"
            aria-activedescendant={results[active] ? `search-item-${active}` : undefined}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
          />
          <button type="button" onClick={close} aria-label="Cerrar búsqueda" className="text-stone-400 hover:text-ink">
            <X className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        </div>

        <ul id="search-results" role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-stone-400">Sin resultados para &ldquo;{query}&rdquo;</li>
          )}
          {results.map((item, i) => {
            const Icon = TYPE_ICON[item.type];
            return (
              <li key={item.href + item.label} id={`search-item-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  onMouseEnter={() => setActive(i)}
                  className={clsx(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === active ? "bg-stone-50" : "bg-transparent",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-stone-400" strokeWidth={1.75} />
                  <span className="flex-1 truncate text-sm text-ink">{item.label}</span>
                  {item.sublabel && <span className="shrink-0 text-xs text-stone-400">{item.sublabel}</span>}
                  <span className="hidden shrink-0 text-[10px] uppercase tracking-wide text-stone-400 sm:inline">
                    {TYPE_LABEL[item.type]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
