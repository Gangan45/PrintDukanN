import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Zap, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AcrylicProduct {
  id: string;
  name: string;
  base_price: number;
  images: string[] | null;
  is_customizable: boolean | null;
  tags?: string[] | null;
}

interface AcrylicProductGridProps {
  products: AcrylicProduct[];
  loading: boolean;
  customizeUrlBuilder: (product: AcrylicProduct) => string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (product: AcrylicProduct) => void;
  onAddToCart: (product: AcrylicProduct) => void;
  onBuyNow: (product: AcrylicProduct) => void;
  emptyMessage?: string;
}

interface AcrylicProductCardProps {
  product: AcrylicProduct;
  index: number;
  customizeUrl: string;
  fav: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

// Single card with auto-cycling product images + "Upload Your Photo" overlay
const AcrylicProductCard = ({
  product,
  index,
  customizeUrl,
  fav,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
}: AcrylicProductCardProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"];

  // Auto-cycle product images (only when more than one)
  useEffect(() => {
    if (images.length <= 1) return;
    // Pause cycling when the user is hovering so they can inspect a frame
    if (isHovered) return;

    const startDelay = 1500 + (index % 5) * 500; // stagger between cards
    let interval: ReturnType<typeof setInterval> | undefined;

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setImgIdx((prev) => (prev + 1) % images.length);
      }, 2500);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [index, images.length, isHovered]);

  // Auto-cycle: card alternates between showing photo and "Upload Your Photo" overlay
  useEffect(() => {
    if (product.is_customizable === false) return;

    const startDelay = 2000 + (index % 5) * 600; // stagger cards
    let interval: ReturnType<typeof setInterval> | undefined;

    const startTimer = setTimeout(() => {
      setShowOverlay(true);
      interval = setInterval(() => {
        setShowOverlay((prev) => !prev);
      }, 4000);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [index, product.is_customizable]);

  const overlayVisible = showOverlay || isHovered;

  return (
    <div
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link to={customizeUrl} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Stack all images and crossfade between them */}
          {images.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`${product.name} ${i + 1}`}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-105",
                i === imgIdx ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
            />
          ))}

          {/* Image dots indicator (only when multiple images) */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === imgIdx ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  )}
                />
              ))}
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-20",
              fav
                ? "bg-destructive text-destructive-foreground"
                : "bg-background/80 text-foreground hover:bg-background"
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("w-4 h-4", fav && "fill-current")} />
          </button>

          {/* Auto-cycling "Upload Your Photo" overlay */}
          {product.is_customizable !== false && (
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40 flex items-center justify-center pointer-events-none transition-opacity duration-700",
                overlayVisible ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="flex flex-col items-center gap-2 transform transition-transform duration-700">
                <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg animate-pulse">
                  <ImageUp className="w-7 h-7 text-primary" />
                </div>
                <span className="text-white text-sm font-bold bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
                  Upload Your Photo
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4 space-y-3">
        <Link to={customizeUrl}>
          <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-bold text-primary">
            ₹{product.base_price.toLocaleString()}
          </span>
          <Link to={customizeUrl}>
            <Button size="sm" className="rounded-full">
              Customise
            </Button>
          </Link>
        </div>

        {/* Add to Cart + Buy Now */}
        {product.is_customizable === false && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1 h-8 text-xs"
              onClick={onAddToCart}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Cart</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={onBuyNow}
            >
              <Zap className="w-3.5 h-3.5" />
              Buy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AcrylicProductGrid = ({
  products,
  loading,
  customizeUrlBuilder,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  emptyMessage = "No products found in this category",
}: AcrylicProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product, idx) => (
        <AcrylicProductCard
          key={product.id}
          product={product}
          index={idx}
          customizeUrl={customizeUrlBuilder(product)}
          fav={isFavorite(product.id)}
          onToggleFavorite={() => onToggleFavorite(product)}
          onAddToCart={() => onAddToCart(product)}
          onBuyNow={() => onBuyNow(product)}
        />
      ))}
    </div>
  );
};
