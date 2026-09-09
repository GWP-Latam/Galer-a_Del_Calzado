"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export function Accordion({ items }: { items: { pregunta: string; respuesta: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.pregunta}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-lg">{item.pregunta}</span>
              <ChevronDown
                className={clsx("h-5 w-5 shrink-0 text-ink-soft transition-transform", isOpen && "rotate-180")}
                strokeWidth={1.75}
              />
            </button>
            {isOpen && <p className="max-w-2xl pb-5 text-ink-soft">{item.respuesta}</p>}
          </div>
        );
      })}
    </div>
  );
}
