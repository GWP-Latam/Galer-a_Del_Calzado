import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getAmenidades, getBeneficios } from "@/lib/content/repository";
import { iconForName as iconFor } from "@/lib/amenidad-icons";

export function BenefitsSection() {
  const beneficios = getBeneficios();
  const amenidades = getAmenidades().filter((a) => !a.revisar);
  // "servicio" tenants (café, salón, banco) are real traffic drivers on their
  // own — Galería del Calzado is highly specialized, but not a one-note
  // destination. Give them their own prominent row instead of burying them
  // in the small text list below.
  const servicios = amenidades.filter((a) => a.tipo === "servicio");
  const instalaciones = amenidades.filter((a) => a.tipo === "instalacion");

  return (
    <Section tone="ink">
      <Reveal>
        <Eyebrow className="!text-paper/60">Pensado para tu visita</Eyebrow>
        <h2 className="mt-2 max-w-xl text-3xl text-paper md:text-4xl">
          Especializados en calzado, no limitados a él
        </h2>
        <p className="mt-3 max-w-lg text-paper/70">
          Entre pasillo y pasillo también hay café, banco y belleza — motivos de sobra para
          quedarte un rato más.
        </p>
      </Reveal>

      <Stagger className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-md bg-paper/10 sm:grid-cols-3" stagger={0.06}>
        {servicios.map((s) => {
          const Icon = iconFor(s.icono);
          return (
            <StaggerItem key={s.nombre}>
              <div className="flex h-full items-center gap-4 bg-ink px-6 py-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-display text-lg text-paper">{s.nombre}</p>
                  <p className="text-xs text-paper/60">Local {s.local}</p>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Reveal delay={0.1}>
        <p className="mt-12 mb-4 text-xs font-medium uppercase tracking-[0.14em] text-paper/50">
          Beneficios de la plaza
        </p>
      </Reveal>
      <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-paper/10 sm:grid-cols-4" stagger={0.06}>
        {beneficios.map((b) => {
          const Icon = iconFor(b.icono);
          return (
            <StaggerItem key={b.titulo}>
              <div className="flex h-full flex-col gap-3 bg-ink px-5 py-7">
                <Icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
                <div>
                  <p className="text-lg text-paper">{b.titulo}</p>
                  <p className="mt-1 text-sm text-paper/65">{b.descripcion}</p>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      {instalaciones.length > 0 && (
        <Reveal delay={0.1} className="mt-10">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-paper/50">
            También en la plaza
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {instalaciones.map((a) => {
              const Icon = iconFor(a.icono);
              return (
                <span key={a.nombre} className="inline-flex items-center gap-2 text-sm text-paper/75">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {a.nombre}
                </span>
              );
            })}
          </div>
        </Reveal>
      )}
    </Section>
  );
}
