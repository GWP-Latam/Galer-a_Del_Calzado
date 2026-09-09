import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { Field, TextAreaField } from "@/components/ui/Field";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { getPlaza, getVacantes } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Bolsa de trabajo",
  description: "Vacantes en Galería del Calzado y en sus marcas locatarias.",
};

export default function BolsaDeTrabajoPage() {
  const vacantes = getVacantes();
  const plaza = getPlaza();

  return (
    <Container as="div" className="py-12 md:py-16">
      <Link href="/oportunidades" className="text-sm text-ink-soft hover:text-ink">
        ← Oportunidades
      </Link>

      <Eyebrow className="mt-6">Bolsa de trabajo</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Trabaja en Galería del Calzado</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Vacantes vigentes en la plaza y en las marcas que la conforman. Postúlate con el formulario
        de abajo.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {vacantes.map((v) => (
          <article key={v.id} className="relative rounded-md border border-line p-6">
            {v.demo && <Tag className="absolute right-4 top-4">Ejemplo</Tag>}
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-stone-100 text-accent">
              <Briefcase className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <p className="mt-3 font-display text-xl">{v.puesto}</p>
            <p className="text-sm text-ink-soft">
              {v.area} · {v.tipo}
            </p>
            <p className="mt-3 text-sm text-ink-soft">{v.descripcion}</p>
          </article>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <h2 className="text-2xl">Envía tu postulación</h2>
        <div className="mt-6 max-w-xl">
          <PlaceholderForm fallbackPhone={plaza.telefono} submitLabel="Enviar postulación">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="candidato-nombre" label="Nombre completo" type="text" required />
              <Field id="candidato-telefono" label="Teléfono" type="tel" required />
              <Field id="candidato-correo" label="Correo" type="email" required />
              <Field id="candidato-puesto" label="Puesto de interés" type="text" placeholder="Ej. Ventas, Administración" required />
            </div>
            <TextAreaField id="candidato-mensaje" label="Cuéntanos sobre tu experiencia" />
          </PlaceholderForm>
        </div>
      </div>
    </Container>
  );
}
