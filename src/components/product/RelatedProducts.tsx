import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  images: string[] | null;
  is_customizable: boolean | null;
}

const getProductLink = (product: Product) => {
  // Non-customizable products go to detail pages
  if (product.is_customizable === false) {
    const cat = product.category.toLowerCase();
    if (cat.includes('trophy') || cat.includes('trophies')) return `/trophy/${product.id}`;
    if (cat.includes('corporate')) return `/corporate-gift/${product.id}`;
    return `/product/${product.id}`;
  }
  
  // Customizable products go to customization pages
  const cat = product.category.toLowerCase();
  if (cat.includes('baby')) return `/baby-frame/${product.id}`;
  if (cat.includes('name') || cat.includes('plate')) return `/nameplate/${product.id}`;
  if (cat.includes('qr')) return `/qr-standy/${product.id}`;
  if (cat.includes('tshirt')) return `/tshirt/${product.id}`;
  if (cat.includes('clock')) return `/wall-clock/${product.id}`;
  if (cat.includes('badge')) return `/magnetic-badge/${product.id}`;
  if (cat.includes('clear-acrylic')) return `/clear-acrylic/${product.id}`;
  if (cat.includes('framed')) return `/framed-acrylic/${product.id}`;
  if (cat.includes('acrylic')) return `/customize/${product.id}`;
  return `/product/${product.id}`;
};

const ProductCard = ({ product }: { product: Product }) => {
  const originalPrice = Math.round(product.base_price * 1.25);
  const discount = Math.round(((originalPrice - product.base_price) / originalPrice) * 100);
  
  return (
    <Link 
      to={getProductLink(product)}
      className="group flex-shrink-0 w-64 bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-secondary/30 overflow-hidden">
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400'} 
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
          {discount}% OFF
        </Badge>
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm text-foreground">4.5</span>
          <span className="text-sm text-muted-foreground">(50+)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through text-sm">
            ₹{originalPrice}
          </span>
          <span className="font-bold text-foreground">₹{product.base_price}</span>
        </div>
      </div>
    </Link>
  );
};

interface RelatedProductsProps {
  category?: string;
  currentProductId?: string;
}

const RelatedProducts = ({ category, currentProductId }: RelatedProductsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [category, currentProductId]);

  const loadProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('id, name, category, base_price, images, is_customizable')
        .eq('is_active', true)
        .limit(6);

      if (category) {
        query = query.ilike('category', `%${category.split('-')[0]}%`);
      }

      if (currentProductId) {
        query = query.neq('id', currentProductId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="mt-12 border-t border-border pt-12">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
          <p className="text-muted-foreground">You might also like these</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => scroll("left")}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => scroll("right")}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
