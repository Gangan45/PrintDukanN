import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronRight, ShoppingCart, Zap } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


interface Product {
  id: string;
  name: string;
  base_price: number;
  images: string[] | null;
  category: string;
  is_customizable: boolean | null;
}

// Subcategory data with customize URL mapping
const subcategoryData: Record<string, { title: string; description: string; customizeUrl: string; categoryFilter?: string }> = {
  "wall-photo": {
    title: "Acrylic Wall Photo",
    description: "Transform your walls with stunning acrylic prints",
    customizeUrl: "/customize",
    categoryFilter: "acrylic",
  },
  "wall-clock": {
    title: "Acrylic Wall Clock",
    description: "Timeless elegance meets personalized design",
    customizeUrl: "/category/wall-clocks",
    categoryFilter: "wall-clocks",
  },
  "wall-clocks": {
    title: "Acrylic Wall Clock",
    description: "Timeless elegance meets personalized design",
    customizeUrl: "/category/wall-clocks",
    categoryFilter: "wall-clocks",
  },
  "framed-photo": {
    title: "Framed Acrylic Photo",
    description: "Classic sophistication with modern clarity",
    customizeUrl: "/framed-acrylic",
    categoryFilter: "acrylic",
  },
  "baby-frames": {
    title: "Baby Photo Frames",
    description: "Capture precious moments of your little one",
    customizeUrl: "/baby-frame",
    categoryFilter: "baby-frames",
  },
};

const AcrylicSubcategory = () => {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const [activeFilter, setActiveFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  const subcategory = subcategoryData[subcategoryId || ""] || {
    title: "Acrylic Products",
    description: "Premium acrylic photo products",
    customizeUrl: "/customize",
    categoryFilter: "acrylic",
  };

  useEffect(() => {
    loadProducts();
  }, [subcategoryId]);

  const loadProducts = async () => {
    try {
      setLoading(true);


      const { data, error } = await supabase
        .from('products')
        .select('id, name, base_price, images, category, is_customizable')
        .eq('category', 'Acrylic Wall Photo')
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomizeUrl = (productId: string) => {
    if (subcategoryId === "wall-clock" || subcategoryId === "wall-clocks") {
      return `/wall-clock/${productId}`;
    }
    if (subcategoryId === "baby-frames") {
      return `/baby-frame/${productId}`;
    }
    return `${subcategory.customizeUrl}/${productId}`;
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart({
      productId: product.id,
      productName: product.name,
      unitPrice: product.base_price,
      quantity: 1,
      category: subcategory.title,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleBuyNow = (product: Product) => {
    buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || '',
      price: product.base_price,
    });
  };

  const handleToggleFavorite = (product: Product) => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.base_price,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/category/acrylic" className="hover:text-primary transition-colors">Acrylic</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{subcategory.title}</span>
        </div>
      </div>

      {/* Page Title */}
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-center text-foreground">
          {subcategory.title}
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          {subcategory.description}
        </p>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleToggleFavorite(product)}
                    className={`
                      absolute top-3 right-3 p-2 rounded-full transition-all duration-200
                      ${isFavorite(product.id)
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-background/80 text-foreground hover:bg-background'
                      }
                    `}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Upload Photo Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      Upload Your Photo
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                {/* Inside the products.map loop in AcrylicSubcategory.tsx */}

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ₹{product.base_price.toLocaleString()}
                    </span>
                    {/* Always show Customise button for this category as it's photo-based */}
                    <Link to={getCustomizeUrl(product.id)}>
                      <Button size="sm" className="rounded-full">
                        Customise
                      </Button>
                    </Link>
                  </div>

                  {/* Only show Add to Cart and Buy Now if the product is NOT customizable */}
                  {!product.is_customizable && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleBuyNow(product)}
                      >
                        <Zap className="w-4 h-4" />
                        Buy Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found in this category</p>
            <Link to="/category/acrylic">
              <Button variant="outline" className="mt-4">
                View All Acrylic Products
              </Button>
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default AcrylicSubcategory;