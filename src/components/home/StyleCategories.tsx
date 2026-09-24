import Image from "next/image";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { getCategoriasCalzado } from "@/lib/content/repository";
import { shoeIconFor } from "@/components/icons/ShoeIcons";

/**
 * An asymmetric editorial gallery, not a grid of icon cards. Each tile is
 * sized/toned on purpose rather than uniformly. The corner glyph comes from
 * the line-art set in components/icons/ShoeIcons (it replaced the framed
 * clip-art PNGs in public/estilos/, which stay only as a fallback for a
 * category the set doesn't cover yet).
 */
const TONES = ["ink", "stone", "line"] as const;

export function StyleCategories() {
  const categorias = getCategoriasCalzado();
  const spans = [
    "sm:col-span-4 sm:row-span-2",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-2 sm:row-span-1",
    "sm:col-span-2 sm:row-span-2",
    "sm:col-span-2 sm:row-span-2",
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
          const Icon = shoeIconFor(cat.slug);
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

                <ImageReveal
                  className="absolute right-4 top-4 transition-transform duration-500 ease-out group-hover:-translate-y-1"
                  delay={i * 0.05}
                >
                  {Icon ? (
                    <Icon
                      className={
                        "h-14 w-[4.7rem] sm:h-16 sm:w-[5.3rem] " +
                        (tone === "ink" ? "text-paper" : "text-ink")
                      }
                    />
                  ) : (
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                      <Image src={cat.imagen} alt="" fill sizes="112px" className="object-contain" />
                    </div>
                  )}
                </ImageReveal>

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
