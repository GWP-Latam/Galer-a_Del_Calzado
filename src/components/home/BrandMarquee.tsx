import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { BrandLogo } from "@/components/BrandLogo";
import { getMarcas } from "@/lib/content/repository";
import type { Marca } from "@/lib/content/types";

function Row({ marcas, reverse }: { marcas: Marca[]; reverse?: boolean }) {
  const track = [...marcas, ...marcas]; // duplicated once so the -50% loop is seamless
  return (
    <div className="marquee-row overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className={`flex w-max gap-10 ${reverse ? "marquee-track-reverse" : "marquee-track"}`}>
        {track.map((marca, i) => (
          <Link
            key={`${marca.slug}-${i}`}
            href={`/directorio/${marca.slug}`}
            className="flex h-32 w-48 shrink-0 items-center justify-center p-6"
          >
            <div className="h-full w-full opacity-70 transition-opacity duration-300 hover:opacity-100">
              <BrandLogo marca={marca} eager />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  // Un logo solo aparece aquí si la marca tiene logo real Y sigue ocupando
  // un local (marca.locales no vacío) — así, si administración libera el
  // local de una marca, desaparece de la marquesina sin que nadie tenga
  // que borrar el archivo del logo a mano.
  const conLogo = getMarcas().filter((m) => !m.logo_generico && m.locales.length > 0);
  const mitad = Math.ceil(conLogo.length / 2);
  const fila1 = conLogo.slice(0, mitad);
  const fila2 = conLogo.slice(mitad);

  return (
    <Section tone="paper" className="!py-14 md:!py-16">
      <Eyebrow className="mb-8 block text-center">Algunas de nuestras marcas</Eyebrow>
      <div className="flex flex-col gap-2">
        <Row marcas={fila1} />
        <Row marcas={fila2} reverse />
      </div>
    </Section>
  );
}
