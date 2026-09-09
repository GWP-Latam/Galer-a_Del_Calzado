import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { SearchTrigger } from "./SearchTrigger";
import { SearchDialog } from "./SearchDialog";
import { MobileNav } from "./MobileNav";
import { buildSearchIndex } from "@/lib/search-index";
import type { Plaza } from "@/lib/content/types";

export const NAV_ITEMS = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Directorio", href: "/directorio" },
  { label: "Oportunidades", href: "/oportunidades" },
  { label: "Promociones", href: "/promociones" },
  { label: "Eventos", href: "/eventos" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
] as const;

export function Header({ plaza }: { plaza: Plaza }) {
  const searchIndex = buildSearchIndex();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[76px] w-full max-w-[var(--container-max)] flex-nowrap items-center justify-between gap-4 overflow-hidden px-[var(--container-pad)]">
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Below xl there simply isn't room for 7 nav items + search + phone
            without wrapping (that's exactly what broke before), so the
            hamburger menu owns everything until xl. */}
        <nav aria-label="Navegación principal" className="hidden min-w-0 items-center gap-6 xl:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <SearchTrigger className="hidden xl:flex" />
          <a
            href={`tel:${plaza.telefono.replace(/\s+/g, "")}`}
            className="hidden shrink-0 whitespace-nowrap text-[13px] font-medium text-ink-soft hover:text-ink 2xl:inline"
          >
            {plaza.telefono}
          </a>
          <MobileNav navItems={NAV_ITEMS} />
        </div>
      </div>

      {/* Single search modal instance for the whole site. */}
      <SearchDialog index={searchIndex} />
    </header>
  );
}
