import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  base_price: number;
  images?: string[] | null;
  is_customizable?: boolean | null;
  category?: string;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  emptyMessage?: string;
  customizeUrlPrefix: string;
  detailUrlPrefix?: string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onResetFilter?: () => void;
}

// Get the customization URL based on category
const getCustomizeUrl = (category: string, productId: string, productName: string) => {
  const lowerCategory = category?.toLowerCase() || '';
  const lowerName = productName?.toLowerCase() || '';
  console.log(`Determining URL for category: ${category}, product name: ${productName}`);

  // Acrylic products
  if (lowerCategory === "acrylic" || lowerCategory === "acrylic wall photo" || lowerCategory === "premium acrylic wall photo") {
    if (lowerName.includes("wall clock") || lowerName.includes("clock")) {
      return `/wall-clock/${productId}`;
    }
    if (lowerName.includes("frame") || lowerName.includes("clear")) {
      return `/framed-acrylic/${productId}`;
    }
    return `/customize/${productId}`;
  }

  // Direct customization routes for each category with product ID
  if (lowerCategory === "name-plates" || lowerCategory === "name plates") {
    return `/nameplate/${productId}`;
  }
  if (lowerCategory === "qr-standy" || lowerCategory === "qr standy" || lowerCategory === "qr standee") {
    return `/qr-standee/${productId}`;
  }
  if (lowerCategory === "t-shirts" || lowerCategory === "tshirts") {
    return `/tshirt/${productId}`;
  }
  if (lowerCategory === "wall-clocks" || lowerCategory === "wall clocks" || lowerCategory === "acrylic wall clock") {
    return `/wall-clock/${productId}`;
  }
  if (lowerCategory === "wedding-card" || lowerCategory === "wedding card") {
    return `/wedding-card/${productId}`;
  }
  if (lowerCategory === "baby-frames" || lowerCategory === "baby frames") {
    return `/baby-frame/${productId}`;
  }
  if (lowerCategory === "corporate-gifts" || lowerCategory === "corporate gifts") {
    return `/corporate-gift/customize/${productId}`;
  }

  // Default customize route
  return `/customize/${productId}`;
};

// Get the detail URL for non-customizable products
const getDetailUrl = (category: string, productId: string) => {
  const lowerCategory = category?.toLowerCase() || '';
  
  if (lowerCategory === "corporate-gifts" || lowerCategory === "corporate gifts") {
    return `/corporate-gift/${productId}`;
  }
  if (lowerCategory === "trophies") {
    return `/product/${productId}`;
  }
  
  // Default product detail route
  return `/product/${productId}`;
};

export const ProductGrid = ({
  products,
  loading,
  emptyMessage = "No products found",
  customizeUrlPrefix,
  detailUrlPrefix,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onResetFilter,
}: ProductGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
        {onResetFilter && (
          <Button variant="outline" className="mt-4" onClick={onResetFilter}>
            View All Products
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => {
        const isCustomizable = product.is_customizable !== false;
        const productCategory = product.category || '';
        
        // Use category-aware URLs based on customizability
        const finalCustomizeUrl = isCustomizable && productCategory
          ? getCustomizeUrl(productCategory, product.id, product.name)
          : `${customizeUrlPrefix}/${product.id}`;
          
        const finalDetailUrl = !isCustomizable && productCategory
          ? getDetailUrl(productCategory, product.id)
          : (detailUrlPrefix ? `${detailUrlPrefix}/${product.id}` : `/product/${product.id}`);

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.base_price}
            image={product.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"}
            isFavorite={isFavorite(product.id)}
            customizeUrl={finalCustomizeUrl}
            detailUrl={finalDetailUrl}
            isCustomizable={isCustomizable}
            onToggleFavorite={() => onToggleFavorite(product)}
            onAddToCart={() => onAddToCart(product)}
            onBuyNow={() => onBuyNow(product)}
          />
        );
      })}
    </div>
  );
};
