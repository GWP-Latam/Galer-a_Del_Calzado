import { Sparkles } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { PromoCarousel } from "./PromoCarousel";
import { getMarcaBySlug, getPromocionesVigentes } from "@/lib/content/repository";

export function PromoSection() {
  const promociones = getPromocionesVigentes();
  const items = promociones.map((promo) => ({
    promo,
    marca: promo.marca_slug ? getMarcaBySlug(promo.marca_slug) : undefined,
  }));

  return (
    <Section tone="stone" id="promociones">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Lo más nuevo</Eyebrow>
            <h2 className="mt-2 text-3xl md:text-4xl">Promociones vigentes</h2>
          </div>
          <LinkButton href="/promociones" variant="secondary">
            Ver todas
          </LinkButton>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-md border border-dashed border-line bg-paper px-6 py-16 text-center">
            <Sparkles className="h-6 w-6 text-stone-400" strokeWidth={1.5} />
            <p className="text-ink-soft">
              Por ahora no hay promociones activas. Vuelve pronto o revisa el directorio completo.
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={0.1} className="mt-10">
          <PromoCarousel items={items} />
        </Reveal>
      )}
    </Section>
  );
}
