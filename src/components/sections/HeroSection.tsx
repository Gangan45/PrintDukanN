import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroBanner1 from "@/assets/hero-banner-1.png";
import heroBanner2 from "@/assets/hero-banner-2.png";

const banners = [
  {
    id: 1,
    image: heroBanner1,
    alt: "Valentine's Sale - Up to 30% OFF",
    link: "/category/corporate-gifts",
  },
  {
    id: 2,
    image: heroBanner2,
    alt: "12.12 Sale - Discount up to 15%",
    link: "/category/qr-standee",
  },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Slider Container */}
      <div className="relative w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="w-full flex-shrink-0"
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-auto object-cover"
              />
            </Link>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "bg-primary w-6"
                  : "bg-primary/40 hover:bg-primary/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
