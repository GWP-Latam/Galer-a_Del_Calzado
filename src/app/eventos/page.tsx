import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Activaciones y eventos de Galería del Calzado.",
};

export default function EventosPage() {
  return (
    <Container as="div" className="py-12 md:py-16">
      <Eyebrow>Eventos</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Activaciones en la plaza</h1>

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
    </Container>
  );
}
