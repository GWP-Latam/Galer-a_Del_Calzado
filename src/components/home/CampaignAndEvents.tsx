import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { getCampana, getEventoDestacado } from "@/lib/content/repository";
import { formatRangoFecha } from "@/lib/format-fecha";

/**
 * Dos columnas en escritorio: la campaña vigente a la izquierda (su CTA
 * lleva al artículo dedicado en /campanas/[slug]) y, a la derecha, el
 * próximo evento en puerta o, si no hay ninguno agendado, el más reciente
 * que se tuvo. En móvil se apilan, campaña primero.
 */
export function CampaignAndEvents() {
  const campana = getCampana();
  const evento = getEventoDestacado();

  if (!campana.activa && !evento) return null;

  return (
    <section className="py-4">
      <Container>
        <div className="grid gap-4 md:grid-cols-2">
          {campana.activa && (
            <Reveal>
              <Link
                href={`/campanas/${campana.slug}`}
                className="group relative flex min-h-[360px] items-end overflow-hidden rounded-md bg-ink md:min-h-[440px]"
              >
                {campana.imagen ? (
                  <Image
                    src={campana.imagen}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Image
                    src="/patrones/greca.png"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover opacity-[0.08] mix-blend-screen"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="relative z-10 p-8 text-paper md:p-10">
                  <p className="font-display text-3xl md:text-4xl">{campana.titulo}</p>
                  <p className="mt-3 max-w-md text-paper/80">{campana.subtitulo}</p>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-sm border border-paper px-7 py-3.5 text-base font-medium text-paper transition-colors group-hover:bg-paper group-hover:text-ink">
                    {campana.cta_label}
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <Reveal delay={0.08}>
            {evento ? (
              <Link
                href="/eventos"
                className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-md border border-line bg-stone-50 p-8 md:min-h-[440px] md:p-10"
              >
                <Image
                  src="/patrones/greca.png"
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-[0.05] transition-transform duration-500 group-hover:scale-105"
                />
                <div className="relative z-10">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
                    <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
                    {formatRangoFecha(evento.fecha_inicio, evento.fecha_fin)}
                  </p>
                  <p className="mt-3 font-display text-2xl text-ink md:text-3xl">{evento.titulo}</p>
                  <p className="mt-2 max-w-md text-ink-soft">{evento.descripcion}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-line underline-offset-4 group-hover:decoration-ink">
                    Ver eventos
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line bg-stone-50 px-6 text-center md:min-h-[440px]">
                <CalendarDays className="h-6 w-6 text-stone-400" strokeWidth={1.5} />
                <p className="max-w-xs text-ink-soft">
                  No hay eventos programados por el momento. En cuanto el equipo de la plaza confirme
                  uno, aparecerá aquí.
                </p>
                <LinkButton href="/promociones" variant="secondary" className="mt-2">
                  Ver promociones vigentes
                </LinkButton>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
