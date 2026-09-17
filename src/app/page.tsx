import { Hero } from "@/components/home/Hero";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { StatsSection } from "@/components/home/StatsSection";
import { CampaignAndEvents } from "@/components/home/CampaignAndEvents";
import { PromoSection } from "@/components/home/PromoSection";
import { StyleCategories } from "@/components/home/StyleCategories";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { LocationSection } from "@/components/home/LocationSection";
import { getPlaza } from "@/lib/content/repository";

// Reseñas: se leen de Supabase (lo único no estático de esta página) y se
// curan desde /admin/resenas, no todos los días — una hora de caché (ISR)
// es de sobra para que se vean cambios sin volver la home 100% dinámica.
export const revalidate = 3600;

export default function HomePage() {
  const plaza = getPlaza();

  return (
    <>
      <Hero plaza={plaza} />
      <BrandMarquee />
      <StatsSection />
      <CampaignAndEvents />
      <PromoSection />
      <StyleCategories />
      <BenefitsSection />
      <ReviewsSection />
      <LocationSection plaza={plaza} />
    </>
  );
}
