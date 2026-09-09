import { MapPinned, Phone, Clock } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import type { Plaza } from "@/lib/content/types";

export function LocationSection({ plaza }: { plaza: Plaza }) {
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${plaza.geo.lat},${plaza.geo.lng}`;
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(plaza.direccion)}&output=embed`;

  return (
    <Section tone="paper">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Eyebrow>Aquí nos encuentras</Eyebrow>
          <h2 className="mt-2 text-3xl md:text-4xl">Visítanos</h2>

          <dl className="mt-8 space-y-6">
            <div className="flex gap-4">
              <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Dirección</dt>
                <dd className="mt-1 text-base">{plaza.direccion}</dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Horario</dt>
                {plaza.horarios.map((h) => (
                  <dd key={h.dias} className="mt-1 text-base">
                    {h.dias}: {h.horario}
                  </dd>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Teléfono</dt>
                <dd className="mt-1 text-base">
                  <a href={`tel:${plaza.telefono.replace(/\s+/g, "")}`} className="hover:text-accent">
                    {plaza.telefono}
                  </a>
                </dd>
              </div>
            </div>
          </dl>

          <LinkButton
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="mt-8"
            icon={<MapPinned className="h-4 w-4" strokeWidth={2} />}
          >
            Cómo llegar
          </LinkButton>
        </Reveal>

        <Reveal direction="none" delay={0.1}>
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-line lg:aspect-auto lg:h-full">
            <iframe
              title="Ubicación de Galería del Calzado en el mapa"
              src={embedSrc}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
