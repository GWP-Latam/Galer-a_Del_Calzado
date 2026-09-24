import Image from "next/image";
import { Monogram } from "@/components/Monogram";
import { Parallax } from "@/components/motion/Parallax";
import { getHeroFotos } from "@/lib/content/repository";
import { HeroSlideshow } from "./HeroSlideshow";

/**
 * Con fotos en src/data/hero-fotos.json (pedido del cliente, 23/09/26:
 * acompañar "Todo el calzado de Guadalajara" con fotografías de la galería)
 * el fondo es un fundido entre ellas bajo un degradado oscuro que mantiene
 * legible el texto. Sin fotos todavía, se queda el fondo de greca + monograma.
 * El único video del sitio anterior es un motion graphic promocional con sus
 * propios titulares, por eso no se usa aquí.
 */
export function HeroMedia() {
  const fotos = getHeroFotos();

  if (fotos.length > 0) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-ink">
        <HeroSlideshow fotos={fotos} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/70" />
      </div>
    );
  }

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
