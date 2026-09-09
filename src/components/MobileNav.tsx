"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { SearchTrigger } from "./SearchTrigger";

export function MobileNav({
  navItems,
}: {
  navItems: ReadonlyArray<{ label: string; href: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentional: this is the standard client-only-mount guard so the
    // portal target (document.body) is only touched after hydration. There
    // is no non-effect way to know we're past the first client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <div className="flex items-center gap-2">
        <SearchTrigger className="!px-2.5" iconOnly />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú de navegación"
          className="p-2 text-ink"
        >
          <Menu className="h-5.5 w-5.5" strokeWidth={1.75} />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          // Rendered directly on <body>, outside <header>'s stacking context —
          // a `position: fixed` child of a `position: sticky` + `z-index`
          // ancestor is still painted WITHIN that ancestor's stacking context,
          // so its own z-index doesn't guarantee it wins against siblings of
          // <header> (like the Hero section). A portal sidesteps that
          // entirely instead of trying to out-stack it with z-index tricks.
          <div className="fixed inset-0 z-[100] bg-ink text-paper" style={{ backgroundColor: "var(--ink)" }}>
            <div className="flex h-[76px] items-center justify-between px-[var(--container-pad)]">
              <span className="text-[15px] font-medium uppercase tracking-[0.14em]">Menú</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="p-2">
                <X className="h-5.5 w-5.5" strokeWidth={1.75} />
              </button>
            </div>
            <motion.nav
              aria-label="Navegación del menú móvil"
              className="flex flex-col gap-1 px-[var(--container-pad)] py-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-paper/15 py-4 text-2xl"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
