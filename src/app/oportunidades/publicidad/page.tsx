import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Ruler } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { Field, TextAreaField } from "@/components/ui/Field";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { getEspaciosPublicitarios, getPlaza } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Espacios publicitarios",
  description: "Pantallas, islas y puntos de alta visibilidad para publicidad dentro de Galería del Calzado.",
};

export default function EspaciosPublicitariosPage() {
  const espacios = getEspaciosPublicitarios();
  const plaza = getPlaza();

  return (
    <Container as="div" className="py-12 md:py-16">
      <Link href="/oportunidades" className="text-sm text-ink-soft hover:text-ink">
        ← Oportunidades
      </Link>

      <Eyebrow className="mt-6">Espacios publicitarios</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Anúnciate donde está tu público</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Puntos de alta visibilidad dentro de la plaza, para pantallas digitales, islas y exhibidores.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {espacios.map((e) => (
          <article key={e.id} className="relative rounded-md border border-line p-6">
            {e.demo && <Tag className="absolute right-4 top-4">Ejemplo</Tag>}
            <p className="font-display text-xl">{e.titulo}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" strokeWidth={1.6} /> {e.ubicacion}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="h-4 w-4" strokeWidth={1.6} /> {e.dimensiones}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{e.descripcion}</p>
          </article>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <h2 className="text-2xl">Solicita información</h2>
        <div className="mt-6 max-w-xl">
          <PlaceholderForm fallbackPhone={plaza.telefono} submitLabel="Solicitar información">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="pub-nombre" label="Nombre" type="text" required />
              <Field id="pub-empresa" label="Empresa" type="text" required />
              <Field id="pub-correo" label="Correo" type="email" required />
              <Field id="pub-telefono" label="Teléfono" type="tel" required />
            </div>
            <TextAreaField id="pub-mensaje" label="Cuéntanos sobre tu campaña" />
          </PlaceholderForm>
        </div>
      </div>
    </Container>
  );
}
