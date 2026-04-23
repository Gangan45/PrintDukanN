import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoryCircles } from "@/components/sections/CategoryCircles";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { MapSection } from "@/components/sections/MapSection";
import { ReelShowcase } from "@/components/sections/ReelShowcase";
import { BrandsMarquee } from "@/components/sections/BrandsMarquee";
import { CorporateGifts } from "@/components/sections/CorporateGifts";
import { TShirtPrinting } from "@/components/sections/TShirtPrinting";
import { TrophiesMementos } from "@/components/sections/TrophiesMementos";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { YouTubeSection } from "@/components/sections/YouTubeSection";
import { CategoryProducts } from "@/components/sections/CategoryProducts";
import { StatsCounter } from "@/components/sections/StatsCounter";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SpecialOffers } from "@/components/sections/SpecialOffers";
import { ProcessGuarantee } from "@/components/sections/ProcessGuarantee";
import { MagneticBadgeSection } from "@/components/sections/MagneticBadgeSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      
      <main className="flex flex-col overflow-hidden">
        <HeroSection />
        
        <CategoryCircles />
        <TrustBadges />
        <StatsCounter />
        <FeaturedProducts />
        <SpecialOffers />
        <CorporateGifts />
        <MagneticBadgeSection />
        <HowItWorks />
        <TrophiesMementos />
        <CategoryProducts />
        <ProcessGuarantee />
        <ReelShowcase />
        <TShirtPrinting />
        <GoogleReviews />
        <YouTubeSection />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
};
export default Index;