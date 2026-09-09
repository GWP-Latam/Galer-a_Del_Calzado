import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { getCampana } from "@/lib/content/repository";

/**
 * Editorial banner for the current seasonal campaign. Administración
 * controls this entirely from the Fase 2 panel: turning it off, or leaving
 * the image empty, makes this whole section disappear from the home page.
 */
export function CampaignBanner() {
  const campana = getCampana();
  if (!campana.activa) return null;

  return (
    <section className="py-4">
      <Container>
        <Reveal>
          <div className="relative flex min-h-[360px] items-end overflow-hidden rounded-md bg-ink md:min-h-[440px]">
            {campana.imagen ? (
              <Image
                src={campana.imagen}
                alt=""
                fill
                sizes="(min-width: 1024px) 1200px, 100vw"
                className="object-cover"
              />
            ) : (
              <Image
                src="/patrones/greca.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 1200px, 100vw"
                className="object-cover opacity-[0.08] mix-blend-screen"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="relative z-10 p-8 text-paper md:p-14">
              <p className="font-display text-3xl md:text-5xl">{campana.titulo}</p>
              <p className="mt-3 max-w-md text-paper/80">{campana.subtitulo}</p>
              <LinkButton
                href={campana.cta_href}
                variant="secondary"
                className="mt-6 !border-paper !text-paper hover:!bg-paper hover:!text-ink"
                icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}
              >
                {campana.cta_label}
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
