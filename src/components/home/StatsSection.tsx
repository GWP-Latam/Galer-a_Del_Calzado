import { Section } from "@/components/ui/Section";
import { Counter } from "@/components/motion/Counter";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getCifrasMarcas } from "@/lib/content/repository";

// La plaza abrió como recinto especializado en calzado en 1987 (ver
// src/app/nosotros/page.tsx).
const ANIOS_DESDE_APERTURA = new Date().getFullYear() - 1987;

/**
 * Sin la cifra de "500+ marcas" (comentario del cliente, 23/09/26). El
 * número de marcas es el conteo real del directorio (solo calzado), el mismo
 * del que salen el "más de N" del hero, /nosotros y /directorio.
 */
export function StatsSection() {
  const stats = [
    { value: getCifrasMarcas().calzado, label: "marcas de calzado" },
    { value: ANIOS_DESDE_APERTURA, label: "años siendo el corazón del calzado en Guadalajara" },
  ];

  return (
    <Section tone="ink" className="!py-12 md:!py-16">
      <Stagger className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2" stagger={0.1}>
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Counter
              value={s.value}
              className="font-display text-5xl text-paper md:text-6xl"
            />
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-paper/60">{s.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
