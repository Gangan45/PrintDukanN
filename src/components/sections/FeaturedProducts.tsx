import { Heart, ShoppingCart, Eye, Star, Zap, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardSkeleton } from "@/components/skeletons";

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  images: string[] | null;
  is_customizable: boolean | null;
}

// Helper to check if product is customizable based on category
const isCustomizableProduct = (category: string) => {
  const lowerCategory = category.toLowerCase();
  // Match categories that contain these keywords
  const customizableKeywords = ["acrylic", "name plate", "qr stand", "t-shirt", "tshirt", "wall clock", "magnetic badge", "baby frame", "name pencil"];
  return customizableKeywords.some(keyword => lowerCategory.includes(keyword));
};

// Get the customization URL based on category - links directly to customization page
const getCustomizeUrl = (category: string, productId: string, productName: string) => {
  const lowerCategory = category.toLowerCase();
  const lowerName = productName.toLowerCase();

  // Acrylic Wall Clock products
  if (lowerCategory.includes("wall clock") || lowerCategory.includes("acrylic wall clock")) {
    return `/wall-clock/${productId}`;
  }

  // Acrylic Wall Photo products
  if (lowerCategory.includes("acrylic wall photo") || lowerCategory.includes("wall photo")) {
    return `/customize/${productId}`;
  }

  // General acrylic products
  if (lowerCategory.includes("acrylic")) {
    if (lowerName.includes("wall clock") || lowerName.includes("clock")) {
      return `/wall-clock/${productId}`;
    }
    if (lowerName.includes("frame") || lowerName.includes("clear")) {
      return `/framed-acrylic/${productId}`;
    }
    return `/framed-acrylic/${productId}`;
  }

  // Name Plates
  if (lowerCategory.includes("name plate")) {
    return `/nameplate/${productId}`;
  }

  // QR Standee
  if (lowerCategory.includes("qr stand")) {
    return `/qr-standee/${productId}`;
  }

  // T-Shirts
  if (lowerCategory.includes("t-shirt") || lowerCategory.includes("tshirt")) {
    return `/tshirt/${productId}`;
  }

  // Magnetic Badges
  if (lowerCategory.includes("wedding-card")) {
    return `/wedding-card/${productId}`;
  }

  // Baby Frames
  if (lowerCategory.includes("baby frame")) {
    return `/baby-frame/${productId}`;
  }

  // Name Pencils
  if (lowerCategory.includes("name pencil")) {
    return `/name-pencil/${productId}`;
  }

  // Non-customizable - go to product details
  return `/product/${productId}`;
};

// Check if category is non-customizable (only Add to Cart / Buy Now)
const isNonCustomizableCategory = (category: string) => {
  const lowerCategory = category.toLowerCase();
  return lowerCategory.includes("trophies") || lowerCategory.includes("corporate gift");
};

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-primary",
  "New": "bg-green-500",
  "Premium": "bg-gold",
  "Popular": "bg-accent",
  "Trending": "bg-coral",
};

// Assign badges based on category/name
const getProductBadge = (name: string, category: string): string | null => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("premium") || lowerName.includes("led")) return "Premium";
  if (category === "tshirts") return "Popular";
  if (category === "trophies") return "Best Seller";
  if (lowerName.includes("custom")) return "Trending";
  return null;
};

export const FeaturedProducts = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // First try to get featured products
      let { data, error } = await supabase
        .from('products')
        .select('id, name, category, base_price, images, is_customizable')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(8);

      if (error) throw error;

      // Fallback: if no featured products, get latest 8
      if (!data || data.length === 0) {
        const result = await supabase
          .from('products')
          .select('id, name, category, base_price, images, is_customizable')
          .eq('is_active', true)
          .limit(8);
        data = result.data;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    // Route to customize page for customizable, or product page for non-customizable
    if (isCustomizableProduct(product.category)) {
      navigate(getCustomizeUrl(product.category, product.id, product.name));
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleCustomize = (product: Product) => {
    navigate(getCustomizeUrl(product.category, product.id, product.name));
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0],
      unitPrice: product.base_price,
      quantity: 1,
    });
  };

  const handleBuyNow = async (product: Product) => {
    await buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || '',
      price: product.base_price,
    });
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-16 bg-muted/30" id="featured">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
                Curated Collection
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2 text-foreground">
                Featured <span className="font-display italic text-primary">Products</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-16 bg-muted/30" id="featured">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              Curated Collection
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2 text-foreground">
              Featured <span className="font-display italic text-primary">Products</span>
            </h2>
          </div>

        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product) => {
            const originalPrice = Math.round(product.base_price * 1.2);
            const badge = getProductBadge(product.name, product.category);

            return (
              <div
                key={product.id}
                className="group relative bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-500"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Badge */}
                  {badge && (
                    <span className={cn(
                      "absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-primary-foreground",
                      badgeColors[badge] || "bg-primary"
                    )}>
                      {badge}
                    </span>
                  )}

                  {/* Discount Badge */}
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-navy text-primary-foreground text-[10px] sm:text-xs font-bold">
                    {Math.round((1 - product.base_price / originalPrice) * 100)}% OFF
                  </span>

                  {/* Quick Actions */}
                  <div className={cn(
                    "absolute inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center gap-3 transition-all duration-300", "opacity-0 group-hover:opacity-100 md:flex hidden",
                    hoveredId === product.id && "md:opacity-100"
                  )}>
                    <button
                      onClick={() => toggleFavorite({
                        id: product.id,
                        name: product.name,
                        image: product.images?.[0] || '',
                        price: product.base_price,
                        category: product.category,
                        isCustomizable: product.is_customizable || false,
                      })}
                      disabled={favLoading}
                      className={cn(
                        "p-3 rounded-full transition-colors",
                        isFavorite(product.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      <Heart className={cn("h-5 w-5", isFavorite(product.id) && "fill-current")} />
                    </button>

                    {isCustomizableProduct(product.category) ? (
                      /* Customizable products: Show Customize button */
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomize(product);
                        }}
                        className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                      >
                        <Palette className="h-5 w-5" />
                      </button>
                    ) : (
                      /* Non-customizable products: Show Add to Cart, Buy Now, and View */
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(product);
                          }}
                          className="p-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Zap className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-3 rounded-full bg-card text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div
                  className="p-2.5 sm:p-4 cursor-pointer"
                  onClick={() => handleViewProduct(product)}
                >
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-semibold text-foreground mt-0.5 sm:mt-1 line-clamp-2 group-hover:text-primary transition-colors text-xs sm:text-base">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1 sm:mt-2">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-gold text-gold" />
                    <span className="text-xs sm:text-sm font-medium">4.5</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">(50+)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                    <span className="text-sm sm:text-lg font-bold text-foreground">₹{product.base_price}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground line-through">₹{originalPrice}</span>
                  </div>
                </div>

                {/* Mobile Specific Action Buttons (Add below the Product Content/Price) */}
                {/* Mobile Specific Action Buttons */}
                <div className="md:hidden flex flex-col gap-2 mt-auto px-2 pb-3">
                  {isCustomizableProduct(product.category) ? (
                    <Button
                      size="sm"
                      className="w-full text-[11px] h-9 bg-primary hover:bg-primary/90 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents navigating to product page twice
                        handleCustomize(product);
                      }}
                    >
                      <Palette className="h-3.5 w-3.5 mr-1" /> Customize
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[11px] h-8 p-1 border-muted-foreground/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" /> Cart
                      </Button>
                      <Button
                        size="sm"
                        className="w-full text-[11px] h-8 bg-emerald-600 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" /> Buy
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            );
          })}
        </div>
      </div>
    </section>
  );
};