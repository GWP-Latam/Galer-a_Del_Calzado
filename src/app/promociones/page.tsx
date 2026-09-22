import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PromoFilterGrid } from "@/components/promociones/PromoFilterGrid";
import { getMarcaBySlug } from "@/lib/content/repository";
import { getPromocionesVigentes } from "@/lib/content/repository.server";

export const metadata: Metadata = {
  title: "Promociones",
  description: "Todas las promociones vigentes de las marcas de Galería del Calzado, por categoría.",
};

// Se leen de Supabase, curadas desde /admin/promociones — una hora de ISR
// alcanza para ver cambios sin volver la página 100% dinámica.
export const revalidate = 3600;

export default async function PromocionesPage() {
  const promociones = await getPromocionesVigentes();
  const items = promociones.map((promo) => ({
    promo,
    marca: promo.marca_slug ? getMarcaBySlug(promo.marca_slug) : undefined,
  }));

  return (
    <>
      <Container as="div" className="py-12 md:py-16">
        <Eyebrow>Promociones</Eyebrow>
        <h1 className="mt-2 max-w-2xl font-display text-3xl md:text-4xl">Todas las promociones de la plaza</h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Lo que cada marca tiene activo en este momento, filtrado por categoría.
        </p>

        <div className="mt-10">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line bg-stone-50 px-6 py-20 text-center">
              <Sparkles className="h-6 w-6 text-stone-400" strokeWidth={1.5} />
              <p className="max-w-sm text-ink-soft">
                Por ahora no hay promociones activas. El equipo de la plaza publica aquí las ofertas
                vigentes de cada marca en cuanto están disponibles.
              </p>
              <LinkButton href="/directorio" variant="secondary" className="mt-2">
                Ver directorio completo
              </LinkButton>
            </div>
          ) : (
            <PromoFilterGrid items={items} />
          )}
        </div>
      </Container>

      <Container as="div" className="pb-16 md:pb-24">
        <NewsletterSignup />
      </Container>
    </>
  );
}
