import { Clock, MapPinned, Phone } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { getResenasDestacadas } from "@/lib/content/repository.server";
import type { Plaza } from "@/lib/content/types";

const GOOGLE_REVIEWS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL ??
  "https://www.google.com/search?q=Galer%C3%ADa+del+Calzado+Guadalajara+rese%C3%B1as";

/**
 * El mapa ya responde "dónde" (por eso no repetimos la dirección en texto);
 * esta sección responde "por qué venir" — con lo que la gente ya dice de
 * nosotros al lado, no como sección aparte.
 */
export async function LocationSection({ plaza }: { plaza: Plaza }) {
  const resenas = await getResenasDestacadas();
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${plaza.geo.lat},${plaza.geo.lng}`;
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(plaza.direccion)}&output=embed`;

  return (
    <Section tone="paper">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal direction="none">
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-line lg:aspect-auto lg:h-[calc(100%-3.5rem)]">
            <iframe
              title="Ubicación de Galería del Calzado en el mapa"
              src={embedSrc}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
              {plaza.horarios.map((h) => `${h.dias}: ${h.horario}`).join(" · ")}
            </span>
            <a href={`tel:${plaza.telefono.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 hover:text-accent">
              <Phone className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.6} />
              {plaza.telefono}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Eyebrow>Ven a conocernos</Eyebrow>
          <h2 className="mt-2 text-3xl md:text-4xl">Te estamos esperando</h2>
          <p className="mt-3 max-w-md text-ink-soft">
            Esto es lo que dice quien ya nos visitó — la mejor razón para venir a comprobarlo tú
            mismo.
          </p>

          {resenas.length > 0 && (
            <div className="mt-8">
              <ReviewsCarousel resenas={resenas} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <LinkButton
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              icon={<MapPinned className="h-4 w-4" strokeWidth={2} />}
            >
              Cómo llegar
            </LinkButton>
            {resenas.length > 0 && (
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
              >
                Ver todas en Google
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
