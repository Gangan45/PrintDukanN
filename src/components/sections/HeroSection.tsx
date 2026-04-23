import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import heroMegaSale from "@/assets/hero-mega-sale.jpg";
import heroBogo from "@/assets/hero-bogo-offer.jpg";
import heroGifts from "@/assets/hero-gifts-loved-ones.jpg";
import heroAcrylic from "@/assets/hero-acrylic-sale.jpg";
import heroClocks from "@/assets/hero-wall-clocks.jpg";
import heroBadges from "@/assets/hero-magnetic-badges.jpg";
import heroTshirts from "@/assets/hero-tshirts.jpg";
import heroTrophies from "@/assets/hero-trophies.jpg";

interface Banner {
  id: string;
  image_url: string;
  alt_text: string;
  link: string;
}

const fallbackBanners: Banner[] = [
  { id: "1", image_url: heroMegaSale, alt_text: "Mega Sale - Up to 70% OFF on All Products", link: "/products" },
  { id: "2", image_url: heroBogo, alt_text: "Buy 1 Get 1 FREE on All Photo Frames", link: "/category/acrylic" },
  { id: "3", image_url: heroGifts, alt_text: "Perfect Personalized Gifts for Loved Ones from ₹199", link: "/category/corporate-gifts" },
  { id: "4", image_url: heroAcrylic, alt_text: "Personalized Acrylic Photo Frames - Up to 40% OFF", link: "/category/acrylic" },
  { id: "5", image_url: heroClocks, alt_text: "Custom Photo Wall Clocks from ₹499", link: "/category/wall-clocks" },
  { id: "6", image_url: heroBadges, alt_text: "Professional Magnetic Badges from ₹149", link: "/category/acrylic-magnet" },
  { id: "7", image_url: heroTshirts, alt_text: "Custom T-Shirt Printing from ₹299", link: "/category/t-shirts" },
  { id: "8", image_url: heroTrophies, alt_text: "Trophies & Awards from ₹399", link: "/category/trophies" },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('hero_banners')
        .select('id, image_url, alt_text, link')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data && data.length > 0) setBanners(data);
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full">
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {banners.map((banner) => (
            <Link key={banner.id} to={banner.link} className="w-full flex-shrink-0">
              <img
                src={banner.image_url}
                alt={banner.alt_text}
                className="w-full aspect-[16/9] sm:aspect-[16/9] lg:aspect-[16/7] object-contain sm:object-cover object-center block bg-background"
                width={1920}
                height={576}
              />
            </Link>
          ))}
        </div>
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-primary w-6" : "bg-primary/40 hover:bg-primary/60"}`}
                aria-label={`Go to slide ${index + 1}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
