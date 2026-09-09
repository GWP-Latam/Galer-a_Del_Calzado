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
            {/* Placeholder monochrome treatment until locatarios deliver
                single-color vector logos (plan punto 5.2) — grayscale keeps
                the marquee visually unified in the meantime. */}
            <div className="h-full w-full opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
              <BrandLogo marca={marca} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  const conLogo = getMarcas().filter((m) => !m.logo_generico);
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
