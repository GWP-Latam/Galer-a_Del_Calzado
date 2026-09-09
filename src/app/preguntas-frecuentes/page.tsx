import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { Accordion } from "@/components/Accordion";
import { LinkButton } from "@/components/ui/Button";
import { getPlaza } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Horario, estacionamiento, ubicación y cómo contactar a las marcas de Galería del Calzado.",
};

export default function FAQPage() {
  const plaza = getPlaza();
  const [entreSemana, domingo] = plaza.horarios;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${plaza.geo.lat},${plaza.geo.lng}`;

  const items = [
    {
      pregunta: "¿Cuál es el horario de Galería del Calzado?",
      respuesta: `${entreSemana.dias}, de ${entreSemana.horario}. ${domingo.dias}, de ${domingo.horario}.`,
    },
    {
      pregunta: "¿El estacionamiento tiene costo?",
      respuesta:
        "No. El estacionamiento es gratuito para los visitantes y cuenta con vigilancia dentro de las instalaciones.",
    },
    {
      pregunta: "¿Cómo encuentro una marca específica?",
      respuesta:
        "Usa el buscador en la parte superior del sitio o entra al Directorio: puedes buscar por nombre o ubicarla directamente en el mapa interactivo, que te muestra su local exacto.",
    },
    {
      pregunta: "¿Hay WiFi disponible dentro de la plaza?",
      respuesta: "Sí, WiFi gratuito dentro de todas las instalaciones de Galería del Calzado.",
    },
    {
      pregunta: "¿Cómo contacto directamente a una tienda?",
      respuesta:
        "Cada marca tiene su propia ficha dentro del Directorio, con teléfono, correo, redes sociales y, si la tiene, un enlace directo a su tienda en línea.",
    },
    {
      pregunta: "Tengo interés en rentar un local, ¿con quién hablo?",
      respuesta:
        "Entra a la sección Oportunidades y llena el formulario de renta de locales; el equipo de administración de la plaza te contactará para una cotización formal.",
    },
    {
      pregunta: "¿Cómo llego a Galería del Calzado?",
      respuesta: `Estamos en ${plaza.direccion}. Desde el Directorio o la página de inicio puedes abrir la ubicación directamente en Google Maps.`,
    },
  ];

  return (
    <Container as="div" className="py-12 md:py-16">
      <Eyebrow>Preguntas frecuentes</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">¿En qué te podemos ayudar?</h1>

      <div className="mt-10 max-w-3xl">
        <Accordion items={items} />
      </div>

      <div className="mt-14 flex flex-col items-start gap-4 rounded-md bg-stone-50 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl">¿Ya resolviste tus dudas?</p>
          <p className="mt-1 text-sm text-ink-soft">Te esperamos en {plaza.direccion}.</p>
        </div>
        <LinkButton
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          icon={<MapPinned className="h-4 w-4" strokeWidth={2} />}
        >
          Visitar Galería del Calzado
        </LinkButton>
      </div>
    </Container>
  );
}
