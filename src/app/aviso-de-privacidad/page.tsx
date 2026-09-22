import type { Metadata } from "next";
import { FileText, Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Aviso de privacidad de Galería del Calzado.",
};

export default function AvisoPrivacidadPage() {
  return (
    <Container as="div" className="py-12 md:py-16">
      <Reveal>
        <Eyebrow>Aviso legal</Eyebrow>
        <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Aviso de privacidad</h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Consulta el documento completo con el tratamiento que Galería del Calzado da a tus datos
          personales.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <a
          href="/documentos/aviso-de-privacidad.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex max-w-md items-center gap-4 rounded-md border border-line p-5 hover:border-ink"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-stone-100">
            <FileText className="h-5 w-5 text-ink-soft" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <p className="font-medium">Aviso de privacidad (PDF)</p>
            <p className="text-sm text-ink-soft">Ver o descargar el documento completo</p>
          </div>
          <Download className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.75} />
        </a>
      </Reveal>
    </Container>
  );
}
