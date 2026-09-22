"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

/**
 * Drawer de navegación para /admin en móvil. Recibe los MISMOS elementos
 * <NavLink> que ya se renderizan en el <aside> de escritorio (pasados como
 * children desde el Server Component) — así nunca hay dos listas de nav que
 * se puedan desincronizar.
 */
export function AdminMobileNav({
  title,
  children,
  signOut,
}: {
  title: string;
  children: React.ReactNode;
  signOut: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de administración"
        className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
      >
        <Menu className="h-6 w-6" strokeWidth={1.75} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col bg-white">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4">
              <span className="text-sm font-semibold text-zinc-900">{title}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
              >
                <X className="h-5.5 w-5.5" strokeWidth={1.75} />
              </button>
            </div>
            {/* Cierra el drawer al navegar: un click en cualquier <Link> hijo
                burbujea hasta aquí sin necesitar onClick por cada NavLink. */}
            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
              onClick={() => setOpen(false)}
            >
              {children}
            </nav>
            <div className="shrink-0 border-t border-zinc-200 p-4">{signOut}</div>
          </div>,
          document.body,
        )}
    </div>
  );
}
