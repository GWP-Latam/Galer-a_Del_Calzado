import type { Metadata } from "next";
import { MapPinned, Clock, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Field, TextAreaField } from "@/components/ui/Field";
import { PlaceholderForm } from "@/components/PlaceholderForm";
import { HubCard } from "@/components/oportunidades/HubCard";
import { getPlaza } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Oportunidades",
  description: "Renta de locales, bolsa de trabajo y espacios publicitarios en Galería del Calzado.",
};

export default function OportunidadesPage() {
  const plaza = getPlaza();
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${plaza.geo.lat},${plaza.geo.lng}`;

  return (
    <Container as="div" className="py-12 md:py-16">
      <Eyebrow>Oportunidades</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Súmate a Galería del Calzado</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        Tres formas distintas de ser parte de la plaza, cada una pensada para quien la busca.
      </p>

      <Reveal>
        <Stagger className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3" stagger={0.08}>
          <StaggerItem>
            <HubCard
              href="/oportunidades/locales"
              titulo="Locales disponibles"
              descripcion="Espacios en renta para tu marca, con cotización formal."
            />
          </StaggerItem>
          <StaggerItem>
            <HubCard
              href="/oportunidades/empleo"
              titulo="Bolsa de trabajo"
              descripcion="Vacantes en la plaza y en las marcas locatarias."
            />
          </StaggerItem>
          <StaggerItem>
            <HubCard
              href="/oportunidades/publicidad"
              titulo="Espacios publicitarios"
              descripcion="Pantallas, islas y puntos de alta visibilidad."
            />
          </StaggerItem>
        </Stagger>
      </Reveal>

      <div className="mt-20 grid grid-cols-1 gap-12 border-t border-line pt-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-2xl">¿Ninguna se ajusta a lo que buscas?</h2>
          <p className="mt-3 max-w-sm text-ink-soft">
            Escríbenos directamente o visita las oficinas de administración de la plaza.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex gap-4">
              <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Oficinas de administración</p>
                <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="mt-1 block hover:text-accent">
                  {plaza.direccion}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Horario</p>
                {plaza.horarios.map((h) => (
                  <p key={h.dias} className="mt-1">
                    {h.dias}: {h.horario}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Teléfono</p>
                <a href={`tel:${plaza.telefono.replace(/\s+/g, "")}`} className="mt-1 block hover:text-accent">
                  {plaza.telefono}
                </a>
              </div>
            </div>
          </div>
        </div>

        <PlaceholderForm fallbackPhone={plaza.telefono} submitLabel="Enviar mensaje">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id="oportunidades-nombre" label="Nombre" type="text" required />
            <Field id="oportunidades-correo" label="Correo" type="email" required />
          </div>
          <TextAreaField id="oportunidades-mensaje" label="¿En qué te podemos ayudar?" required />
        </PlaceholderForm>
      </div>
    </Container>
  );
}
