import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromoBanner } from "@/components/layout/PromoBanner";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoryCircles } from "@/components/sections/CategoryCircles";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Newsletter } from "@/components/sections/Newsletter";
import { MapSection } from "@/components/sections/MapSection";
import { ReelShowcase } from "@/components/sections/ReelShowcase";
import { Testimonials } from "@/components/sections/Testimonials";
import { BrandsMarquee } from "@/components/sections/BrandsMarquee";
import { CorporateGifts } from "@/components/sections/CorporateGifts";
import { TShirtPrinting } from "@/components/sections/TShirtPrinting";
import { TrophiesMementos } from "@/components/sections/TrophiesMementos";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { YouTubeSection } from "@/components/sections/YouTubeSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      
      <main className="flex flex-col gap-8 md:gap-16 lg:gap-24 overflow-hidden">
        <HeroSection />
        <CategoryCircles />
        <TrustBadges />
        <FeaturedProducts />
        <CorporateGifts />
        <TrophiesMementos />
        <ReelShowcase />
        <TShirtPrinting />
        <BrandsMarquee />
        <GoogleReviews />
        <YouTubeSection />
        <Newsletter />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
};
export default Index;