import { Phone } from "lucide-react";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { SearchTrigger } from "./SearchTrigger";
import { SearchDialog } from "./SearchDialog";
import { MobileNav } from "./MobileNav";
import { HeaderVisibility } from "./HeaderVisibility";
import { buildSearchIndex } from "@/lib/search-index";
import type { Plaza } from "@/lib/content/types";

export const NAV_ITEMS = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Directorio", href: "/directorio" },
  { label: "Promociones", href: "/promociones" },
  { label: "Eventos", href: "/eventos" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
] as const;

export function Header({ plaza }: { plaza: Plaza }) {
  const searchIndex = buildSearchIndex();

  return (
    <HeaderVisibility>
      {/* Wider cap than the site's editorial --container-max (1440px): the
          header is UI chrome, not reading content, and with an icon-only
          search + icon-only phone (not a labeled search box or full phone
          number) the 7 nav items now fit comfortably from xl (1280px) up. */}
      <div className="mx-auto flex h-[76px] w-full max-w-[1680px] flex-nowrap items-center justify-between gap-4 overflow-hidden px-[var(--container-pad)]">
        <div className="shrink-0">
          <Logo />
        </div>

        {/* overflow-hidden here is a last-resort safety net, not the fix
            itself — the real fix is keeping search/phone icon-only so this
            fits well before the viewport gets uncomfortably narrow. */}
        <nav aria-label="Navegación principal" className="hidden min-w-0 items-center gap-5 overflow-hidden xl:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <SearchTrigger className="hidden xl:flex" iconOnly />
          <a
            href={`tel:${plaza.telefono.replace(/\s+/g, "")}`}
            aria-label={`Llamar a Galería del Calzado, ${plaza.telefono}`}
            className="hidden shrink-0 items-center justify-center rounded-sm border border-line p-2 text-ink-soft transition-colors hover:border-ink hover:text-ink xl:flex"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
          </a>
          <MobileNav navItems={NAV_ITEMS} />
        </div>
      </div>

      {/* Single search modal instance for the whole site. */}
      <SearchDialog index={searchIndex} />
    </HeaderVisibility>
  );
}
