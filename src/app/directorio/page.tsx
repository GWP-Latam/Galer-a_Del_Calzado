import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { DirectorioExplorer } from "@/components/directorio/DirectorioExplorer";
import { getCifrasMarcas, getLocales, getMarcas, getNiveles } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Directorio de marcas",
  description:
    "Encuentra cualquier marca de Galería del Calzado en el mapa interactivo: local, teléfono, sitio web y redes sociales.",
};

export default function DirectorioPage() {
  const marcas = getMarcas();
  const cifras = getCifrasMarcas();
  const locales = getLocales();
  const niveles = getNiveles();

  return (
    <Container as="div" className="py-12 md:py-16">
      <Reveal>
        <Eyebrow>Directorio</Eyebrow>
        <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">
          Todo lo que buscas, en un solo lugar
        </h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          {cifras.calzado} marcas de calzado
          {cifras.otras > 0 && ` y ${cifras.otras} de ${cifras.giros.join(" y ")}`} en el
          mapa interactivo de la plaza. Busca por nombre o explora el plano; cualquiera de los dos te
          lleva a la ficha completa del local.
        </p>
      </Reveal>

      <div className="mt-10">
        <DirectorioExplorer marcas={marcas} locales={locales} niveles={niveles} />
      </div>
    </Container>
  );
}
