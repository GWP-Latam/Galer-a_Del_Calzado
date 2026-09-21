import type { Metadata } from "next";
import { MapPinned, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Field, SelectField, TextAreaField } from "@/components/ui/Field";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { getPlaza } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Dirección, teléfono, horario y formulario de contacto de Galería del Calzado.",
};

const RAZONES_CONTACTO = [
  { value: "contacto", label: "Información general" },
  { value: "renta", label: "Renta de locales" },
  { value: "empleo", label: "Bolsa de trabajo" },
  { value: "publicidad", label: "Espacios publicitarios" },
] as const;

export default async function ContactoPage(props: PageProps<"/contacto">) {
  const { razon } = await props.searchParams;
  const razonInicial = RAZONES_CONTACTO.some((r) => r.value === razon) ? razon : undefined;

  const plaza = getPlaza();
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${plaza.geo.lat},${plaza.geo.lng}`;

  return (
    <Container as="div" className="py-12 md:py-16">
      <Eyebrow>Contacto</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">¿Necesitas ponerte en contacto con nosotros?</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Llena el siguiente formulario y te contactaremos a la brevedad posible.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="flex gap-4">
            <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Dirección</p>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-base hover:text-accent"
              >
                {plaza.direccion}
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Horario</p>
              {plaza.horarios.map((h) => (
                <p key={h.dias} className="mt-1 text-base">
                  {h.dias}: {h.horario}
                </p>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Teléfono</p>
              <a href={`tel:${plaza.telefono.replace(/\s+/g, "")}`} className="mt-1 block text-base hover:text-accent">
                {plaza.telefono}
              </a>
            </div>
          </div>
        </div>

        <PlaceholderForm fallbackPhone={plaza.telefono}>
          <SelectField id="razon" label="Razón de contacto" defaultValue={razonInicial} required>
            <option value="" disabled hidden>
              Selecciona una opción
            </option>
            {RAZONES_CONTACTO.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id="nombre" label="Nombre" type="text" placeholder="Tu nombre" required />
            <Field id="correo" label="Correo" type="email" placeholder="tu@correo.com" required />
          </div>
          <Field id="telefono" label="Teléfono (opcional)" type="tel" placeholder="33 0000 0000" />
          <TextAreaField id="mensaje" label="Mensaje" placeholder="¿En qué te ayudamos?" required />
        </PlaceholderForm>
      </div>
    </Container>
  );
}
