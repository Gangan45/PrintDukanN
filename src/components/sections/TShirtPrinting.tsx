import { Shirt, Palette, Users, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  is_customizable: boolean | null;
  frames: unknown;
}

const features = [
  "Premium Cotton Fabric",
  "Custom Logo Printing",
  "Multiple Color Options",
  "Bulk Order Discounts",
  "Fast Delivery",
  "Quality Guarantee",
];

export const TShirtPrinting = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, base_price, images, is_customizable, frames')
        .eq('category', 'T-Shirts')
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading t-shirt products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
          <div className="lg:w-1/2 text-left lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Shirt className="w-4 h-4" />
              <span className="text-sm font-medium">Custom Printing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight break-words">
              Customized Polo T-Shirt
            </h2>
            <h3 className="mt-3 text-muted-foreground max-w-full lg:max-w-2xl text-sm sm:text-base">
              With Your Company Logo
            </h3>
            <p className="text-muted-foreground mb-8">
              Get premium quality customized t-shirts for your team, events, or promotional needs.
              We offer high-quality printing with vibrant colors that last.
            </p>

            {/* Features Grid */}
            {/* Features Grid ko update karein */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground whitespace-normal">{feature}</span>
                </div>
              ))}
            </div>

            
          </div>

          {/* Hero Image */}
          <div className="lg:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=500&fit=crop"
                alt="Custom T-Shirt Printing"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/90 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground text-lg font-semibold">Your Logo Here</p>
                    <p className="text-primary-foreground/70 text-sm">Customized with your brand</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary-foreground/50 flex items-center justify-center">
                    <span className="text-xs text-primary-foreground/70 text-center">LOGO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute top-2 right-2 sm:-top-4 sm:-right-4 bg-primary text-primary-foreground px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg z-10">
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Starting ₹299</span>
            </div>
          </div>
        </div>

        {/* T-Shirt Products from Database */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group bg-background rounded-2xl overflow-hidden shadow-card hover-lift cursor-pointer border border-border/50"
                onClick={() => navigate(`/tshirt/${product.id}`)}
              >
                {/* Image */}
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description || 'Custom t-shirt with your design'}
                  </p>
                  {/* Color count from database */}
                  {product.frames && Array.isArray(product.frames) && product.frames.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-1">
                        {(product.frames as Array<{ name?: string; hex?: string }>).slice(0, 5).map((frame, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border-2 border-background"
                            style={{ backgroundColor: frame.hex || '#666' }}
                            title={frame.name}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.frames.length} color{product.frames.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ₹{product.base_price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                      Customize
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
