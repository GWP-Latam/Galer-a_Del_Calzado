import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "./icons/SocialIcons";
import { Logo } from "./Logo";
import { Container } from "./ui/Container";
import { NAV_ITEMS } from "./Header";
import type { Plaza } from "@/lib/content/types";

export function Footer({ plaza }: { plaza: Plaza }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink text-paper">
      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:py-20">
        <div className="flex flex-col gap-5">
          <Logo inverted />
          <p className="max-w-sm text-sm leading-relaxed text-paper/65">
            El centro especializado en calzado de Guadalajara: {plaza.direccion.split(",")[0]}.
          </p>
          <div className="flex items-center gap-3">
            {plaza.redes.instagram && (
              <a href={plaza.redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper/75 transition-colors hover:border-paper hover:text-paper">
                <InstagramIcon className="h-[18px] w-[18px]" />
              </a>
            )}
            {plaza.redes.facebook && (
              <a href={plaza.redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper/75 transition-colors hover:border-paper hover:text-paper">
                <FacebookIcon className="h-[18px] w-[18px]" />
              </a>
            )}
            {plaza.redes.tiktok && (
              <a href={plaza.redes.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper/75 transition-colors hover:border-paper hover:text-paper">
                <TikTokIcon className="h-[18px] w-[18px]" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Enlaces del sitio" className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-paper/50">Navegación</span>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-paper/80 hover:text-paper">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-paper/50">Visítanos</span>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Galer%C3%ADa+del+Calzado+Av.+M%C3%A9xico+3225+Guadalajara"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm text-paper/80 hover:text-paper"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
            {plaza.direccion}
          </a>
          <a href={`tel:${plaza.telefono.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-sm text-paper/80 hover:text-paper">
            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            {plaza.telefono}
          </a>
          <div className="mt-1 text-sm text-paper/60">
            {plaza.horarios.map((h) => (
              <p key={h.dias}>
                {h.dias}: {h.horario}
              </p>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-paper/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-paper/50 sm:flex-row">
          <p>© {year} Galería del Calzado. Todos los derechos reservados.</p>
          <Link href={plaza.aviso_privacidad} className="hover:text-paper">
            Aviso de privacidad
          </Link>
        </Container>
      </div>
    </footer>
  );
}
