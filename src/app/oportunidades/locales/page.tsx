import type { Metadata } from "next";
import Link from "next/link";
import { Ruler, Layers, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { Field, TextAreaField } from "@/components/ui/Field";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { getLocalesRenta, getPlaza } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Locales disponibles",
  description: "Espacios comerciales en renta dentro de Galería del Calzado.",
};

export default function LocalesDisponiblesPage() {
  const locales = getLocalesRenta();
  const plaza = getPlaza();

  return (
    <Container as="div" className="py-12 md:py-16">
      <Link href="/oportunidades" className="text-sm text-ink-soft hover:text-ink">
        ← Oportunidades
      </Link>

      <Eyebrow className="mt-6">Locales disponibles</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Encuentra el espacio para tu marca</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Cuando un local se libera, aparece aquí con sus medidas, nivel y servicios. Solicita una
        cotización formal con el formulario de abajo.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {locales.map((local) => (
          <article key={local.id} className="relative rounded-md border border-line p-6">
            {local.demo && <Tag className="absolute right-4 top-4">Ejemplo</Tag>}
            <p className="font-display text-xl">{local.titulo}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="h-4 w-4" strokeWidth={1.6} /> {local.m2} m²
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4" strokeWidth={1.6} /> {local.nivel}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{local.descripcion}</p>
            <ul className="mt-4 space-y-1.5">
              {local.servicios.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent" strokeWidth={1.6} />
                  {s}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <h2 className="text-2xl">Solicita tu cotización</h2>
        <div className="mt-6 max-w-xl">
          <PlaceholderForm fallbackPhone={plaza.telefono} submitLabel="Solicitar cotización">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="renta-nombre" label="Nombre" type="text" required />
              <Field id="renta-marca" label="Marca o empresa" type="text" required />
              <Field id="renta-correo" label="Correo" type="email" required />
              <Field id="renta-telefono" label="Teléfono" type="tel" required />
            </div>
            <TextAreaField id="renta-mensaje" label="¿Qué tipo de espacio buscas?" />
          </PlaceholderForm>
        </div>
      </div>
    </Container>
  );
}
