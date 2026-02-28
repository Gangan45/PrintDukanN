import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  video_url: string | null;
  slug: string;
  products_count: number | null;
}

// Fallback categories if database is empty
const fallbackCategories: Category[] = [
  { id: "acrylic", name: "Acrylic", image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop", video_url: null, slug: "acrylic", products_count: 150 },
  { id: "baby-frames", name: "Baby Frames", image_url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop", video_url: null, slug: "baby-frames", products_count: 20 },
  { id: "name-plates", name: "Name Plates", image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop", video_url: null, slug: "name-plates", products_count: 80 },
  { id: "qr-standy", name: "QR Standee", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop", video_url: null, slug: "qr-standy", products_count: 45 },
  { id: "wall-clocks", name: "Wall Clocks", image_url: "https://s.omgs.in/wp-content/uploads/2025/02/5-min-1-500x500.jpg", video_url: null, slug: "wall-clocks", products_count: 50 },
  { id: "trophies", name: "Trophies", image_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop", video_url: null, slug: "trophies", products_count: 120 },
  { id: "corporate-gifts", name: "Corporate Gifts", image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop", video_url: null, slug: "corporate-gifts", products_count: 200 },
  { id: "tshirts", name: "T-Shirts", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", video_url: null, slug: "tshirts", products_count: 300 },
];

export const CategoryCircles = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, image_url, video_url, slug, products_count')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data);
      } else {
        // Use fallback categories if database is empty
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryHref = (slug: string) => {
    return `/category/${slug}`;
  };

  const CategoryCard = ({ category }: { category: Category }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const cardRef = useRef<HTMLAnchorElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const hasVideo = !!category.video_url;

    // Intersection Observer for auto-play on scroll (both mobile and desktop)
    useEffect(() => {
      if (!hasVideo) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
        },
        {
          threshold: 0.3, // Play when 30% visible for quicker start
          rootMargin: '50px'
        }
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => observer.disconnect();
    }, [hasVideo]);

    // Play/pause video based on scroll visibility
    useEffect(() => {
      if (!videoRef.current) return;

      if (isInView) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }, [isInView]);

    // Handle video ready state
    const handleVideoCanPlay = () => {
      setIsVideoReady(true);
    };

    const cardContent = (
      <>
        {/* Circle Video/Image Container */}
        <div
          className={cn(
            "relative w-20 h-20 xs:w-24 xs:h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden transition-all duration-500",
            "ring-2 ring-transparent",
            "shadow-md",
            isInView ? "scale-110 z-10 shadow-xl ring-primary/50" : "scale-100"
          )}
        >
          {hasVideo ? (
            <>
              {/* Video element - autoPlay ensures immediate playback */}
              <video
                ref={videoRef}
                src={category.video_url!}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  isVideoReady ? "opacity-100" : "opacity-0"
                )}
                onCanPlay={handleVideoCanPlay}
              />
              {/* Fallback image shown until video is ready */}
              {!isVideoReady && category.image_url && (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </>
          ) : (
            <img
              src={category.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop'}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 transition-opacity duration-300" />
        </div>

        {/* Label */}
        <div className="text-center max-w-[70px] xs:max-w-[80px] sm:max-w-none">
          <h3 className="font-semibold text-foreground transition-colors text-[10px] xs:text-xs sm:text-sm lg:text-base leading-tight">
            {category.name}
          </h3>
          <span className="text-[8px] xs:text-[10px] sm:text-xs text-muted-foreground hidden xs:block">
            {category.products_count ? `${category.products_count}+ Products` : 'Products'}
          </span>
        </div>
      </>
    );

    return (
      <Link
        ref={cardRef}
        to={getCategoryHref(category.slug)}
        className="flex flex-col items-center gap-3 flex-shrink-0"
      >
        {cardContent}
      </Link>
    );
  };

  if (loading) {
    return (
      <section className="py-6 sm:py-10 lg:py-16 bg-background overflow-hidden" id="categories">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-4 sm:mb-8 lg:mb-12">
            <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-primary uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="text-lg sm:text-2xl lg:text-4xl font-bold mt-1 sm:mt-2 text-foreground">
              Shop By <span className="font-display italic text-primary">Category</span>
            </h2>
          </div>
          <div className="flex gap-4 justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="py-6 sm:py-10 lg:py-16 bg-background overflow-hidden" id="categories">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Section Header */}
        <div className="text-center mb-4 sm:mb-8 lg:mb-12">
          <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-primary uppercase tracking-wider">
            Browse Categories
          </span>
          <h2 className="text-lg sm:text-2xl lg:text-4xl font-bold mt-1 sm:mt-2 text-foreground">
            Shop By <span className="font-display italic text-primary">Category</span>
          </h2>
        </div>
        {/* Manual Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 lg:gap-8 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-4 sm:px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
