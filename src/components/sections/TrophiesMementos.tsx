import { Trophy, Award, Medal, Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "sonner";
import { ProductCardSkeleton } from "@/components/skeletons";

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  is_customizable: boolean | null;
}

const trophyCategories = [
  {
    id: 1,
    title: "Crystal Trophies",
    description: "Elegant crystal awards for excellence",
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop",
    icon: Trophy,
  },
  {
    id: 2,
    title: "Metal Awards",
    description: "Premium metal plaques and shields",
    image: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400&h=400&fit=crop",
    icon: Medal,
  },
  {
    id: 3,
    title: "Wooden Mementos",
    description: "Custom engraved wooden trophies",
    image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400&h=400&fit=crop",
    icon: Award,
  },
  {
    id: 4,
    title: "Acrylic Awards",
    description: "Modern acrylic recognition pieces",
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400&h=400&fit=crop",
    icon: Star,
  },
];

export const TrophiesMementos = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Trophies')
        .eq('is_active', true)
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading trophy products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    const success = await addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.base_price,
      selectedSize: 'Standard',
    });
    
    if (!success) {
      // Toast is already shown by useCart hook for login required
    }
  };

  const handleBuyNow = async (product: Product) => {
    try {
      await buyNow({
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: product.base_price,
        quantity: 1,
        selectedSize: 'Standard',
      });
    } catch {
      toast.error('Please login to proceed');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-card via-background to-card overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Animated Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-hero text-primary-foreground px-6 py-2 rounded-full mb-6 animate-float">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide">Award Excellence</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Trophies & <span className="text-gradient">Mementos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Celebrate achievements with our premium collection of custom trophies, awards, and mementos. 
            Perfect for corporate events, sports competitions, and special occasions.
          </p>
        </div>

        

        {/* Product Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-display font-bold text-foreground mb-8 text-center">
            Featured Trophy Products
          </h3>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-card hover-lift animate-scale-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    // Trophies are non-customizable, go to product detail
                    navigate(`/product/${product.id}`);
                  }}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
                    
                    {/* Quick Action Buttons */}
                    
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description || 'Custom trophy with your design'}
                    </p>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* CTA Section with Animation */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-hero p-8 md:p-12">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-full mb-4">
                <Trophy className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm text-primary-foreground font-medium">Bulk Orders Welcome</span>
              </div>
              <h4 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3">
                Custom Awards for Your Events
              </h4>
              <p className="text-primary-foreground/80 max-w-lg">
                From corporate recognition to sports tournaments, we create memorable trophies that celebrate excellence.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8"
                onClick={() => navigate('/category/trophies')}
              >
                View All Trophies
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};