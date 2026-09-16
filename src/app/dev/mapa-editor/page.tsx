import { notFound } from "next/navigation";
import { getLocales, getMarcas, getNiveles } from "@/lib/content/repository";
import { MapaEditorClient } from "@/components/dev/MapaEditorClient";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Herramienta interna de trazado de la geometría de locales sobre el
 * plano. Solo existe en desarrollo — ver docs/PLAN-IMPLEMENTACION.md,
 * Fase 2.3. En producción da 404: nunca se navega hasta aquí desde el
 * sitio público y no aparece en el sitemap.
 */
export default function MapaEditorPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const niveles = getNiveles();
  const locales = getLocales();
  const marcas = getMarcas();

  return <MapaEditorClient niveles={niveles} locales={locales} marcas={marcas} />;
}
