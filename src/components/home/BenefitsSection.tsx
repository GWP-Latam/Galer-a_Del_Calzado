import Image from "next/image";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getAmenidades, getBeneficios } from "@/lib/content/repository";
import { iconForName as iconFor } from "@/lib/amenidad-icons";

// Fotos reales de fachada para los servicios más visibles de la plaza.
const FOTOS: Record<string, string> = {
  "Steria Coffee": "/mapa/Marcas/steria_coffee.png",
  "Banco Santander": "/mapa/Marcas/santander.png",
  "Distrito Beauty": "/mapa/Marcas/Distrito beauty.png",
};

export function BenefitsSection() {
  const beneficios = getBeneficios();
  const amenidades = getAmenidades().filter((a) => !a.revisar);
  // "servicio" tenants (cafe, salon, bank) are real traffic drivers on their
  // own — worth a prominent row instead of burying them in the small text
  // list below.
  const servicios = amenidades.filter((a) => a.tipo === "servicio");
  const instalaciones = amenidades.filter((a) => a.tipo === "instalacion");

  // Distrito Beauty es una marca (no una amenidad), pero el texto de esta
  // sección la menciona explícitamente ("...café, banco y belleza") — se
  // agrega a mano a la fila destacada, con enlace a su ficha del directorio.
  const destacados: { nombre: string; sub: string; icono: string; href?: string }[] = [
    ...servicios.map((s) => ({ nombre: s.nombre, sub: `Local ${s.local}`, icono: s.icono })),
    { nombre: "Distrito Beauty", sub: "Local 01, Sótano", icono: "sparkles", href: "/directorio/distrito-beauty" },
  ];

  return (
    <Section tone="ink">
      <Reveal>
        <Eyebrow className="!text-paper/60">Pensado para tu visita</Eyebrow>
        <h2 className="mt-2 max-w-xl text-3xl text-paper md:text-4xl">
          Expertos en calzado, con mucho más para ofrecerte
        </h2>
        <p className="mt-3 max-w-lg text-paper/70">
          Entre pasillo y pasillo también hay café, banco y belleza — motivos de sobra para
          quedarte un rato más.
        </p>
      </Reveal>

      {/* sm:grid-cols-3 fijo dejaba una celda vacía junto al último cuando
          solo hay 2-3 destacados — el número de columnas sigue al número
          real de items, hasta 3. */}
      <div
        className="mt-8"
        style={{ "--sm-cols": Math.min(destacados.length, 3) } as React.CSSProperties}
      >
        <Stagger
          className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(var(--sm-cols),minmax(0,1fr))]"
          stagger={0.06}
        >
        {destacados.map((d) => {
          const Icon = iconFor(d.icono);
          const foto = FOTOS[d.nombre];
          const contenido = (
            <div className="group relative flex h-40 items-end overflow-hidden rounded-md bg-ink-soft">
              {foto ? (
                <Image
                  src={foto}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="relative flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-display text-lg text-paper">{d.nombre}</p>
                  <p className="text-xs text-paper/70">{d.sub}</p>
                </div>
              </div>
            </div>
          );
          return (
            <StaggerItem key={d.nombre}>
              {d.href ? <Link href={d.href}>{contenido}</Link> : contenido}
            </StaggerItem>
          );
        })}
        </Stagger>
      </div>

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
