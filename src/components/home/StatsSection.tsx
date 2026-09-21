import { Section } from "@/components/ui/Section";
import { Counter } from "@/components/motion/Counter";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getLocales } from "@/lib/content/repository";

// La plaza abrió como recinto especializado en calzado en 1987 (ver
// src/app/nosotros/page.tsx) — este número hay que subirlo a mano cada año.
const ANIOS_DESDE_APERTURA = new Date().getFullYear() - 1987;

/**
 * "Marcas" y "años" son cifras de mercadeo (decisión del cliente, no el
 * conteo literal de src/data) — solo "locales" se calcula del repositorio.
 */
export function StatsSection() {
  const stats = [
    { value: 500, label: "marcas de calzado" },
    { value: getLocales().length, label: "locales en la plaza" },
    { value: ANIOS_DESDE_APERTURA, label: "años siendo el corazón del calzado en Guadalajara" },
  ];

  return (
    <Section tone="ink" className="!py-12 md:!py-16">
      <Stagger className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3" stagger={0.1}>
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Counter
              value={s.value}
              suffix="+"
              className="font-display text-5xl text-paper md:text-6xl"
            />
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-paper/60">{s.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
