import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getCampana } from "@/lib/content/repository";

export function generateStaticParams() {
  const campana = getCampana();
  return campana.activa ? [{ slug: campana.slug }] : [];
}

export async function generateMetadata(props: PageProps<"/campanas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const campana = getCampana();
  if (!campana.activa || campana.slug !== slug) return {};
  return {
    title: campana.titulo,
    description: campana.subtitulo,
    openGraph: { title: `${campana.titulo} — Galería del Calzado` },
  };
}

export default async function CampanaPage(props: PageProps<"/campanas/[slug]">) {
  const { slug } = await props.params;
  const campana = getCampana();
  if (!campana.activa || campana.slug !== slug) notFound();

  return (
    <article>
      <div className="relative flex min-h-[420px] items-end overflow-hidden bg-ink md:min-h-[520px]">
        {campana.imagen ? (
          <Image src={campana.imagen} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <Image
            src="/patrones/greca.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.08] mix-blend-screen"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <Container className="relative z-10 pb-12 text-paper md:pb-16">
          <Reveal>
            <Eyebrow className="text-paper/75">Campaña de temporada</Eyebrow>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">{campana.titulo}</h1>
            <p className="mt-4 max-w-lg text-paper/85 md:text-lg">{campana.subtitulo}</p>
          </Reveal>
        </Container>
      </div>

      <Container className="py-12 md:py-16">
        <Reveal className="mx-auto flex max-w-2xl flex-col gap-5">
          {campana.concepto.map((parrafo, i) => (
            <p key={i} className="text-base leading-relaxed text-ink-soft md:text-lg">
              {parrafo}
            </p>
          ))}
        </Reveal>

        {campana.imagenes.length > 0 && (
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2">
            {campana.imagenes.map((src) => (
              <StaggerItem key={src} className="relative aspect-[4/5] overflow-hidden rounded-md bg-stone-100">
                <Image src={src} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
    </article>
  );
}
