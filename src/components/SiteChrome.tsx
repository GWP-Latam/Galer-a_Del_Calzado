"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Plaza } from "@/lib/content/types";

/**
 * El panel /admin vive en este mismo layout raíz (fuente, <html>/<body>)
 * pero no debe heredar el header/footer del sitio público — tiene su propio
 * shell (sidebar) definido en app/admin/(dashboard)/layout.tsx.
 */
export function SiteChrome({ plaza, children }: { plaza: Plaza; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header plaza={plaza} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer plaza={plaza} />
    </>
  );
}
