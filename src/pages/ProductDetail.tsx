import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Star, Minus, Plus, Truck, Shield, RotateCcw, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  description: string | null;
  images: string[] | null;
  is_customizable: boolean | null;
}

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-primary",
  "New": "bg-green-500",
  "Premium": "bg-gold",
  "Popular": "bg-accent",
  "Trending": "bg-coral",
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);

      // Load related products
      if (data) {
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', productId)
          .eq('is_active', true)
          .limit(4);
        setRelatedProducts(related || []);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const result = await addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0],
      quantity,
      unitPrice: product.base_price,
      selectedSize: 'Standard',
    });
    
    if (result) {
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || '',
      price: product.base_price,
      quantity,
      selectedSize: 'Standard',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const originalPrice = Math.round(product.base_price * 1.2);
  const discount = Math.round((1 - product.base_price / originalPrice) * 100);
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to products
        </button>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-navy text-white">
                {discount}% OFF
              </Badge>
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < 4 ? "fill-gold text-gold" : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="font-semibold">4.5</span>
                <span className="text-muted-foreground">(50+ reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-foreground">₹{product.base_price}</span>
                <span className="text-xl text-muted-foreground line-through">₹{originalPrice}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Save ₹{originalPrice - product.base_price}
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'Premium quality product with excellent craftsmanship and attention to detail.'}
              </p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => toggleFavorite({
                    id: product.id,
                    name: product.name,
                    image: images[0],
                    price: product.base_price,
                    category: product.category,
                    isCustomizable: product.is_customizable ?? false,
                  })}
                  disabled={favLoading}
                  className={cn(isFavorite(product.id) && "bg-primary/10 border-primary")}
                >
                  <Heart className={cn("h-5 w-5", isFavorite(product.id) && "fill-primary text-primary")} />
                </Button>
              </div>

              <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center p-3">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <RotateCcw className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="description" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">Product Description</h3>
              <p className="text-muted-foreground">
                {product.description || 'Premium quality product with excellent craftsmanship and attention to detail. Our products are made using the finest materials and undergo rigorous quality checks to ensure customer satisfaction.'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <ProductReviewsSection productId={product.id} />
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/product/${related.id}`)}
                  className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={related.images?.[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&h=300&fit=crop'}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {related.name}
                    </h3>
                    <p className="text-primary font-bold">₹{related.base_price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
