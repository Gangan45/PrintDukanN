import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Package,
  Star,
  Check,
  Minus,
  Plus,
  MessageCircle,
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import FileUpload from "@/components/product/FileUpload";
interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  images: string[] | null;
  sizes: unknown;
  frames: unknown;
  is_customizable: boolean | null;
  is_active: boolean | null;
}

const CorporateGiftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading: cartLoading } = useCart();
  const { buyNow, loading: buyLoading } = useBuyNow();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Product Not Found",
          description: "The product you're looking for doesn't exist",
          variant: "destructive",
        });
        navigate('/category/corporate-gifts');
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
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
      unitPrice: product.base_price,
      quantity: quantity,
      category: product.category,
    });

    if (result) {
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to your cart`,
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    await buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || '',
      price: product.base_price * quantity,
      quantity: quantity,
      category: product.category,
    });
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    toggleFavorite({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.base_price,
      category: product.category,
      isCustomizable: product.is_customizable ?? false,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        text: product?.description || '',
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      });
    }
  };
  // File ke upar imports me FileUpload add karein (agar nahi hai)


  // Component ke andar state define karein
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);

  // JSX me (Quantity Selector ke neeche ya Action Buttons ke upar)


  const images = product?.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=800&fit=crop'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const isProductFavorite = isFavorite(product.id);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.name} | Corporate Gift | PrintMine</title>
        <meta name="description" content={product.description || `Buy ${product.name} - Premium corporate gift from PrintMine`} />
        <link rel="canonical" href={`/corporate-gift/${product.id}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": images[0],
            "offers": {
              "@type": "Offer",
              "price": product.base_price,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link to="/category/corporate-gifts" className="hover:text-primary transition-colors">Corporate Gifts</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-foreground font-medium line-clamp-1">{product.name}</li>
        </ol>
      </nav>

      {/* Product Section */}
      <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-border">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain sm:object-cover transition-all duration-500 hover:scale-105"
              />

              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-3 rounded-full shadow-lg backdrop-blur-sm transition-all z-10 ${isProductFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-white'
                  }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isProductFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Gallery - Mobile Friendly */}
            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x touch-pan-x -mx-1 px-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all snap-start focus:outline-none focus:ring-2 focus:ring-primary ${selectedImage === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2 sm:mb-3 text-xs sm:text-sm">Corporate Gift</Badge>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">(4.8) • 120+ Reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                  ₹{(product.base_price * quantity).toLocaleString()}
                </span>
                <span className="text-sm sm:text-lg text-muted-foreground line-through">
                  ₹{(product.base_price * 1.2 * quantity).toLocaleString()}
                </span>
                <Badge className="bg-green-500 hover:bg-green-500 text-xs">20% OFF</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <Separator />

            {/* Quantity Selector */}
            <div>
              <h3 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Quantity</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center border rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 sm:p-3 hover:bg-muted transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 sm:px-6 py-2.5 sm:py-3 font-semibold min-w-[50px] sm:min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 sm:p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  (Minimum order: 1 piece)
                </span>
              </div>
            </div>

            {/* Bulk Order Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">Bulk Order Discount</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Order 50+ items and get 15% OFF. Contact us for custom branding.
                  </p>
                </div>
              </div>
            </div>
            
            {/* File upload section */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-semibold text-foreground">
                Upload Your Logo / Design
              </label>
              <FileUpload onFileSelect={(file) => setUploadedLogo(file)} />
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                <p className="text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-medium leading-relaxed">
                  Note: Our team will send a design preview for your approval after the order is confirmed.
                </p>
              </div>
            </div>

            {/* WhatsApp Contact Button */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">Need Custom Branding or Bulk Design?</h3>
              <Button
                variant="outline"
                onClick={() => {
                  const message = encodeURIComponent(
                    `Hi! I'm interested in corporate gifting for "${product?.name}".\n\nProduct ID: ${product?.id}\nQuantity: ${quantity}`
                  );
                  window.open(`https://wa.me/8518851767?text=${message}`, "_blank");
                }}
                className="w-full h-10 sm:h-12 text-xs sm:text-sm bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 rounded-lg sm:rounded-xl shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Contact on WhatsApp for Custom Design</span>
                <span className="sm:hidden">WhatsApp for Custom Design</span>
              </Button>
            </div>
            {/* Action Buttons - Fixed at bottom on mobile */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex gap-2 sm:gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  <ShoppingCart className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Add to </span>Cart
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                  onClick={handleBuyNow}
                  disabled={buyLoading}
                >
                  Buy Now
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handleShare}
                  className="w-11 sm:w-12 h-11 sm:h-12 p-0 flex-shrink-0"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4">
              <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium leading-tight">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium leading-tight">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium leading-tight">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Features */}
      <section className="bg-muted/30 py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-lg sm:text-2xl font-display font-bold text-foreground mb-4 sm:mb-6 text-center">
            Product Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto">
            {[
              "Premium Quality",
              "Eco-Friendly",
              "Custom Branding",
              "Bulk Discounts",
              "Fast Delivery",
              "Dedicated Support",
              "Quality Assured",
              "Gift Ready"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-1.5 sm:gap-2 bg-background rounded-lg p-2 sm:p-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Reviews and Related Products */}
      <div className="container mx-auto px-4">
        <ReviewsAndSuggestions
          productId={id || "default-tshirt"}
          category="Corporate Gifts"
        />
      </div>
      <Footer />
    </div>
  );
};

export default CorporateGiftDetail;
