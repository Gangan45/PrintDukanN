import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductHeaderProps {
  name: string;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  salePrice: number;
  discount: number;
}

const ProductHeader = ({
  name,
  rating,
  reviewCount,
  originalPrice,
  salePrice,
  discount,
}: ProductHeaderProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
        {name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {rating} ({reviewCount} Reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3 bg-secondary/50 p-4 rounded-lg">
        <span className="text-muted-foreground line-through text-lg">
          ₹{originalPrice.toLocaleString()}
        </span>
        <span className="text-2xl font-bold text-foreground">
          ₹{salePrice.toLocaleString()}
        </span>
        <Badge className="bg-success text-success-foreground hover:bg-success">
          SAVE {discount}%
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">Inclusive of All Taxes</p>
    </div>
  );
};

export default ProductHeader;
