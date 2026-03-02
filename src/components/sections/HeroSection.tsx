import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import heroBanner1 from "@/assets/hero-banner-1.png";
import heroBanner2 from "@/assets/hero-banner-2.png";

interface Banner {
  id: string;
  image_url: string;
  alt_text: string;
  link: string;
}

const fallbackBanners: Banner[] = [
  { id: "1", image_url: heroBanner1, alt_text: "Valentine's Sale - Up to 30% OFF", link: "/category/corporate-gifts" },
  { id: "2", image_url: heroBanner2, alt_text: "12.12 Sale - Discount up to 15%", link: "/category/qr-standee" },
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
              <img src={banner.image_url} alt={banner.alt_text} className="w-full h-auto object-cover" />
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
