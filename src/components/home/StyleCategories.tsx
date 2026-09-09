import Image from "next/image";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getCategoriasCalzado } from "@/lib/content/repository";

/**
 * An asymmetric editorial gallery, not a grid of icon cards (the look this
 * replaced). Each tile is sized/toned on purpose rather than uniformly, and
 * carries the greca pattern as texture instead of a literal shoe icon.
 * Photography is the intended long-term treatment here — swap the pattern
 * fill for a real photo per category as soon as the plaza has one; the grid
 * spans below were chosen assuming a photograph will eventually anchor each
 * tile, so no other change should be needed.
 */
const TONES = ["ink", "stone", "line"] as const;

export function StyleCategories() {
  const categorias = getCategoriasCalzado();
  const spans = [
    "sm:col-span-4 sm:row-span-2",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-2 sm:row-span-2",
  ];

  return (
    <Section tone="paper">
      <Reveal>
        <Eyebrow>La galería</Eyebrow>
        <h2 className="mt-2 max-w-xl text-3xl md:text-4xl">Un estilo para cada paso</h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-6 sm:[grid-auto-rows:9rem]">
        {categorias.map((cat, i) => {
          const tone = TONES[i % TONES.length];
          return (
            <Reveal key={cat.slug} delay={i * 0.05} className={spans[i] ?? "sm:col-span-2"}>
              <div
                className={
                  "group relative flex h-full min-h-[9rem] w-full flex-col justify-end overflow-hidden rounded-md p-5" +
                  " " +
                  (tone === "ink"
                    ? "bg-ink text-paper"
                    : tone === "stone"
                      ? "bg-stone-100 text-ink"
                      : "border border-line text-ink")
                }
              >
                <Image
                  src="/patrones/greca.png"
                  alt=""
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className={
                    "object-cover transition-transform duration-500 ease-out group-hover:scale-105 " +
                    (tone === "ink" ? "opacity-[0.06] mix-blend-screen" : "opacity-[0.05]")
                  }
                />
                <p className="relative font-display text-2xl leading-none">{cat.nombre}</p>
                <p className={"relative mt-1 text-xs " + (tone === "ink" ? "text-paper/70" : "text-ink-soft")}>
                  {cat.perfil}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
