import { ArrowRight, MapPinned } from "lucide-react";
import { HeroMedia } from "./HeroMedia";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Plaza } from "@/lib/content/types";

export function Hero({ plaza }: { plaza: Plaza }) {
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${plaza.geo.lat},${plaza.geo.lng}`;

  return (
    <section className="relative flex min-h-[640px] items-end overflow-hidden md:min-h-[720px]">
      <HeroMedia />

      <Container className="relative z-10 pb-16 pt-40 text-paper md:pb-24">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-paper/75">
          Guadalajara · Av. México 3225
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] md:text-6xl">
          Todo el calzado de Guadalajara, bajo un mismo techo.
        </h1>
        <p className="mt-5 max-w-lg text-base text-paper/85 md:text-lg">
          Más de cincuenta marcas de zapatos, tenis, sandalias y botas para toda la familia, a un
          costado de Av. México.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <LinkButton href="/directorio" size="lg" icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}>
            Ver directorio de marcas
          </LinkButton>
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-paper/40 px-7 py-3.5 text-base font-medium text-paper transition-colors hover:border-paper hover:bg-paper/10"
          >
            <MapPinned className="h-4 w-4" strokeWidth={2} />
            Cómo llegar
          </a>
        </div>
      </Container>
    </section>
  );
}
