"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

/**
 * Hides the header on scroll-down, reveals it on scroll-up (and always
 * shows it near the top of the page) — instead of a header permanently
 * pinned to the top of the viewport.
 */
export function HeaderVisibility({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) {
        setVisible(true);
      } else if (Math.abs(delta) > 4) {
        setVisible(delta < 0);
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm transition-transform duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      {children}
    </header>
  );
}
