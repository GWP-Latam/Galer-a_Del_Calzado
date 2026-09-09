import { Hero } from "@/components/home/Hero";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { CampaignAndEvents } from "@/components/home/CampaignAndEvents";
import { PromoSection } from "@/components/home/PromoSection";
import { StyleCategories } from "@/components/home/StyleCategories";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { LocationSection } from "@/components/home/LocationSection";
import { getPlaza } from "@/lib/content/repository";

export default function HomePage() {
  const plaza = getPlaza();

  return (
    <>
      <Hero plaza={plaza} />
      <BrandMarquee />
      <CampaignAndEvents />
      <PromoSection />
      <StyleCategories />
      <BenefitsSection />
      <LocationSection plaza={plaza} />
    </>
  );
}
