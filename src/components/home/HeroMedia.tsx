import Image from "next/image";
import { Monogram } from "@/components/Monogram";
import { Parallax } from "@/components/motion/Parallax";

/**
 * The only video asset recovered from the old site is a promotional motion
 * graphic (color blocks + its own headlines like "Renuévate"), not ambient
 * b-roll of the space — playing it behind our own hero copy reads as two
 * ads fighting each other. Until real facade/interior photography or ambient
 * footage exists (plan punto 8.3), the hero uses the brand's own greca
 * pattern as a quiet textured backdrop instead of borrowed stock footage.
 */
export function HeroMedia() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <Image
        src="/patrones/greca.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.07] mix-blend-screen"
      />
      <Parallax
        offset={30}
        className="absolute -bottom-24 -right-24 h-[560px] w-[560px] md:h-[720px] md:w-[720px]"
      >
        <Monogram className="h-full w-full text-paper/[0.05]" strokeWidth={1.2} />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/90" />
    </div>
  );
}
