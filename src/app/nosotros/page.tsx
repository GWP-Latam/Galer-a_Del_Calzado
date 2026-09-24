import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedTimeline } from "@/components/nosotros/AnimatedTimeline";
import { getCifrasMarcas } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "La historia de Galería del Calzado: desde 1985, el centro especializado en calzado de Guadalajara.",
};

const HITOS = [
  {
    anio: "1985",
    texto:
      "Desarrollada y construida en la región bajío y occidente, atrayendo desde el inicio a los principales actores de la industria del calzado.",
  },
  {
    anio: "1987",
    texto:
      "Nace formalmente como un recinto especializado en la venta de una sola clase de producto: el calzado.",
  },
  {
    anio: "1996",
    texto: "Se remodela para mantener su vigencia arquitectónica, con una modificación importante a su fachada.",
  },
  {
    anio: "Hoy",
    texto:
      `Se mantiene consolidada como el recinto especializado en la venta de calzado en Guadalajara, con más de ${getCifrasMarcas().masDe} marcas.`,
  },
  {
    anio: "Próximamente",
    texto:
      "Premios, certificaciones y cobertura de prensa a lo largo de la historia de la plaza — en investigación para completar este recorrido.",
  },
];

export default function NosotrosPage() {
  return (
    <Container as="div" className="py-12 md:py-16">
      <Eyebrow>Nosotros</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">
        Un lugar céntrico en la ciudad, dedicado por completo al calzado
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="max-w-2xl space-y-5 text-ink-soft">
          <p>
            Esta Galería surge entre momentos y personas de sueños y proyectos con profundas raíces
            tapatías. Desarrollada y construida en 1985, su ubicación, tanto geográfica como en las
            casualidades del momento, captó la atención de los principales actores de la industria
            del calzado en la región bajío y occidente del país.
          </p>
          <p>
            Fue entonces que nació formalmente, en 1987, un recinto especializado en la venta de una
            sola clase de producto: el calzado. En sus primeras décadas, Galería del Calzado se
            convirtió en un modelo a seguir para la comercialización del calzado, distinguiéndose
            por sus campañas de venta novedosas para su época.
          </p>
          <p>
            Diferenciada de otros espacios comerciales, la Galería ofrece a través de sus locales
            una amplia variedad de modelos de calzado de marcas nacionales e internacionales, para toda la familia.
            Entre pasillos y vestíbulos, el visitante vive una experiencia que va más allá de comprar
            un producto: un vestigio de tradición que hace reverencia al oficio del artesano
            zapatero.
          </p>
        </div>

        <div className="space-y-6">
          <Reveal>
            <div className="rounded-md border border-line p-6">
              <p className="text-lg">Misión</p>
              <p className="mt-2 text-sm text-ink-soft">
                Incentivar los deseos de compra y pertenencia por medio de una experiencia
                físico/digital cautivadora.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-md border border-line p-6">
              <p className="text-lg">Visión</p>
              <p className="mt-2 text-sm text-ink-soft">
                Ser la marca referente como un hito cultural en la región, posicionada como un
                centro especializado que brinda versatilidad, moda y entretenimiento.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-20 border-t border-line pt-10">
        <Reveal>
          <Eyebrow>Nuestra historia</Eyebrow>
          <h2 className="mt-2 text-2xl">Cuatro décadas, un mismo oficio</h2>
        </Reveal>
        <AnimatedTimeline hitos={HITOS} />
      </div>
    </Container>
  );
}
