import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  isFavorite?: boolean;
  customizeUrl: string;
  detailUrl?: string;
  isCustomizable?: boolean;
  onToggleFavorite?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  showDiscount?: boolean;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  isFavorite,
  customizeUrl,
  detailUrl,
  isCustomizable = true,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  showDiscount = false,
}: ProductCardProps) => {
  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <div className="group bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/30">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {showDiscount && discountPercent > 0 && (
          <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs bg-destructive text-destructive-foreground">
            SAVE {discountPercent}%
          </Badge>
        )}

        {/* Wishlist Button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={`
              absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md z-10
              ${isFavorite
                ? "bg-destructive text-destructive-foreground"
                : "bg-background/90 text-foreground hover:bg-background"
              }
            `}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        )}

        {/* Hover Overlay with Quick Actions - Only show for non-customizable products */}
        {!isCustomizable && (onAddToCart || onBuyNow) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-3 sm:pb-4 px-2 sm:px-3">
            {/* Quick Action Buttons */}
            <div className="flex gap-1.5 sm:gap-2 w-full">
              {onAddToCart && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart();
                  }}
                  size="sm" 
                  className="flex-1 bg-primary hover:bg-primary/90 text-[10px] sm:text-xs h-7 sm:h-8 rounded-full px-2 sm:px-3"
                >
                  <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                  <span className="hidden xs:inline">Add to Cart</span>
                  <span className="xs:hidden">Cart</span>
                </Button>
              )}
              {onBuyNow && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onBuyNow();
                  }}
                  size="sm" 
                  variant="secondary"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] sm:text-xs h-7 sm:h-8 rounded-full px-2 sm:px-3"
                >
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                  <span className="hidden xs:inline">Buy Now</span>
                  <span className="xs:hidden">Buy</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-3">
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-[10px] sm:text-sm ${i < Math.floor(rating) ? "text-yellow-500" : "text-muted-foreground/30"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-[10px] sm:text-sm text-muted-foreground">
              {rating} {reviews && `(${reviews})`}
            </span>
          </div>
        )}

        {/* Name */}
        <h3 className="font-medium text-xs sm:text-base text-foreground line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-primary transition-colors leading-tight">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-sm sm:text-lg font-bold text-primary">
            ₹{price.toLocaleString()}
          </span>
        </div>

        {/* Main Action Button */}
        {isCustomizable ? (
          <Link to={customizeUrl} className="block">
            <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-[10px] sm:text-sm h-7 sm:h-10">
              Customise
            </Button>
          </Link>
        ) : detailUrl ? (
          <Link to={detailUrl} className="block">
            <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-[10px] sm:text-sm h-7 sm:h-10">
              View Details
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
};