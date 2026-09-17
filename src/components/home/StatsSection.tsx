import { Section } from "@/components/ui/Section";
import { Counter } from "@/components/motion/Counter";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getLocales, getMarcas, getNiveles } from "@/lib/content/repository";

/**
 * Los números se calculan del repositorio, nunca a mano — si mañana hay
 * 60 marcas o un nivel más, esta sección no necesita tocarse.
 */
export function StatsSection() {
  const stats = [
    { value: getMarcas().length, label: "marcas de calzado" },
    { value: getLocales().length, label: "locales en la plaza" },
    { value: getNiveles().length, label: "niveles para recorrer" },
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
