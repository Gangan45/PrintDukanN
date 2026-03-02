import { Gift, ArrowRight, Sparkles, ShoppingCart, Zap, Eye } from "lucide-react";
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
  category: string;
  is_customizable: boolean | null;
}

export const CorporateGifts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, base_price, images, category, is_customizable')
        .eq('category', 'Corporate Gifts')
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading corporate gift products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    // Corporate gifts are non-customizable, always go to product detail page
    navigate(`/corporate-gift/customize/${product.id}`);
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
    <section className="py-20 bg-gradient-to-b from-background via-card to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Animated Header - PrintMine Style */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide uppercase">Premium Quality</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 animate-slide-up">
            Customized Premium
          </h2>
          <h3 className="text-4xl md:text-6xl font-display font-bold text-gradient mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Corporate Gifts
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
            Make a lasting impression with personalized corporate gifts. Perfect for employee recognition, 
            client appreciation, and brand promotion.
          </p>
        </div>

        

        {/* Products Grid - PrintMine Style */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
              Featured Corporate Gifts
            </h3>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80"
              onClick={() => navigate('/category/corporate-gifts')}
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop'}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        hoveredProduct === product.id ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    
                    {/* Quick Actions */}
                    <div className={`absolute inset-0 bg-foreground/40 flex items-center justify-center gap-3 transition-all duration-300 ${
                      hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-12 h-12 rounded-full transform transition-all duration-300 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        className="w-12 h-12 rounded-full transform transition-all duration-300 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                      >
                        <Zap className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="w-12 h-12 rounded-full bg-card transform transition-all duration-300 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                      ₹{product.base_price.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description || 'Premium customizable corporate gift'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* CTA Banner - PrintMine Style with Animations */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-hero p-8 md:p-12">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop')] opacity-10 bg-cover bg-center" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-full mb-4 animate-pulse">
                <Gift className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm text-primary-foreground font-medium">Special Offer</span>
              </div>
              <h4 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3">
                Bulk Orders? Get Special Discounts!
              </h4>
              <p className="text-primary-foreground/80 text-lg">
                Order 50+ items and get up to <span className="font-bold text-primary-foreground">30% off</span> on corporate gifts
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};