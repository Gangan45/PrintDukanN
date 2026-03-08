import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CategoryProduct {
  id: string;
  name: string;
  category: string;
  base_price: number;
  images: string[] | null;
  description: string | null;
  categorySlug?: string;
  categoryImage?: string;
}

const categoryRoutes: Record<string, string> = {
  "Acrylic Wall Photo": "/category/acrylic",
  "Acrylic Wall Clock": "/category/wall-clocks",
  "Baby Frames": "/category/acrylic/baby-frames",
  "Framed Acrylic Photo": "/framed-acrylic/customize",
  "Name Plates": "/category/name-plates",
  "QR Standee": "/category/qr-standee",
  "Trophies": "/category/trophies",
  "Corporate Gifts": "/category/corporate-gifts",
  "T-Shirts": "/category/t-shirts",
  "Name Pencils": "/category/name-pencils",
  "Wedding Card": "/category/wedding-card",
};

export const CategoryProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadCategoryProducts();
  }, []);

  const loadCategoryProducts = async () => {
    try {
      // Get all active categories
      const { data: categories } = await supabase
        .from("categories")
        .select("name, slug, image_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!categories || categories.length === 0) {
        setLoading(false);
        return;
      }

      // Get one product per category
      const productPromises = categories.map(async (cat) => {
        const { data } = await supabase
          .from("products")
          .select("id, name, category, base_price, images, description")
          .eq("category", cat.name)
          .eq("is_active", true)
          .limit(1);

        if (data && data.length > 0) {
          return {
            ...data[0],
            categorySlug: cat.slug,
            categoryImage: cat.image_url,
          } as CategoryProduct;
        }
        // If no product, create a placeholder from category
        return {
          id: cat.slug,
          name: cat.name,
          category: cat.name,
          base_price: 0,
          images: cat.image_url ? [cat.image_url] : null,
          description: null,
          categorySlug: cat.slug,
          categoryImage: cat.image_url,
        } as CategoryProduct;
      });

      const results = await Promise.all(productPromises);
      setProducts(results.filter(Boolean));
    } catch (error) {
      console.error("Error loading category products:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollButtons);
      updateScrollButtons();
      return () => el.removeEventListener("scroll", updateScrollButtons);
    }
  }, [products, updateScrollButtons]);

  // Auto-scroll
  useEffect(() => {
    if (products.length === 0 || isPaused) return;

    autoScrollRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      if (scrollLeft >= scrollWidth - clientWidth - 5) {
        // Reset to start
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
      }
    }, 3000);

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [products, isPaused]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleProductClick = (product: CategoryProduct) => {
    const route = categoryRoutes[product.category];
    if (route) {
      navigate(route);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-2xl" />
                <div className="mt-2 h-3 bg-muted rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Shop by <span className="text-primary">Category</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              One pick from every collection
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-border/50"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-border/50"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
        >
          {/* Duplicate for seamless feel */}
          {products.map((product, index) => {
            const img =
              product.images?.[0] ||
              product.categoryImage ||
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=400&fit=crop";

            return (
              <div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] snap-start group cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {/* Card */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border/30 shadow-sm transition-all duration-500 group-hover:shadow-lg group-hover:border-primary/30 group-hover:-translate-y-1">
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground/80">
                      {product.category}
                    </span>
                  </div>

                  {/* Price tag */}
                  {product.base_price > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        ₹{product.base_price}
                      </span>
                    </div>
                  )}

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 drop-shadow-md">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="text-[11px] text-white/90 font-medium">Explore</span>
                      <ArrowRight className="h-3 w-3 text-white/90" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dot indicators on mobile */}
        <div className="flex justify-center gap-1.5 mt-4 md:hidden">
          {products.slice(0, Math.min(products.length, 8)).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/30 transition-colors"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
