"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "shrink-0 whitespace-nowrap border-b-2 pb-1 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors",
        active ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
