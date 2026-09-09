import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { getEventos } from "@/lib/content/repository";
import { formatRangoFecha } from "@/lib/format-fecha";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Activaciones y eventos de Galería del Calzado.",
};

export default function EventosPage() {
  const hoy = new Date().toISOString().slice(0, 10);
  const eventos = getEventos();
  const enCurso = eventos.filter((e) => e.fecha_fin >= hoy);
  const pasados = eventos.filter((e) => e.fecha_fin < hoy).reverse();

  return (
    <Container as="div" className="py-12 md:py-16">
      <Eyebrow>Eventos</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Activaciones en la plaza</h1>

      {eventos.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 rounded-md border border-dashed border-line bg-stone-50 px-6 py-20 text-center">
          <CalendarDays className="h-6 w-6 text-stone-400" strokeWidth={1.5} />
          <p className="max-w-sm text-ink-soft">
            No hay eventos programados por el momento. En cuanto el equipo de la plaza confirme uno,
            aparecerá aquí con fecha, horario y detalles.
          </p>
          <LinkButton href="/promociones" variant="secondary" className="mt-2">
            Ver promociones vigentes
          </LinkButton>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {enCurso.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-ink-soft">
                Próximos y en curso
              </h2>
              {enCurso.map((e) => (
                <EventoCard key={e.slug} evento={e} />
              ))}
            </section>
          )}

          {pasados.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-ink-soft">
                Eventos anteriores
              </h2>
              {pasados.map((e) => (
                <EventoCard key={e.slug} evento={e} />
              ))}
            </section>
          )}
        </div>
      )}
    </Container>
  );
}

function EventoCard({
  evento,
}: {
  evento: { slug: string; titulo: string; descripcion: string; fecha_inicio: string; fecha_fin: string };
}) {
  return (
    <div className="rounded-md border border-line p-6 md:p-8">
      <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
        <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
        {formatRangoFecha(evento.fecha_inicio, evento.fecha_fin)}
      </p>
      <p className="mt-2 font-display text-2xl">{evento.titulo}</p>
      <p className="mt-2 max-w-2xl text-ink-soft">{evento.descripcion}</p>
    </div>
  );
}
