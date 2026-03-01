import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ZoomIn, Star, Upload, Check, Truck, Shield, Zap, Loader2, ShoppingCart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVariantImages, parseVariantImages, VariantImages } from "@/lib/variantImages";
import { ProductDetailSkeleton } from "@/components/skeletons";
import Magenticbadge from "@/assets/A_Content_Desktop_-_2025-09-30T182434.699.webp"
import orderblue from "@/assets/Processing_-_Desktop_1.webp";
import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";

interface ProductSize {
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  variant_images: VariantImages | null;
  sizes: ProductSize[];
}

const features = [
  { icon: Check, text: "After Placing Order, Preview Will Be Shared (Logo Cutout)", color: "text-primary" },
  { icon: Check, text: '12% OFF, Code "FESTWEEK12" (Order above ₹999)', color: "text-primary" },
  { icon: Truck, text: "Free Delivery On All Orders Above ₹699/-", color: "text-success" },
  { icon: Shield, text: "Secure Online Payments", color: "text-success" },
];

// Default product values when no ID provided
const defaultProduct: Product = {
  id: "default-magnetic-badge",
  name: "Custom Magnetic Badge",
  description: "Premium quality magnetic badges with your custom logo",
  base_price: 199,
  images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop"],
  variant_images: null,
  sizes: [
    { name: "10 Pieces", price: 199 },
    { name: "25 Pieces", price: 449 },
    { name: "50 Pieces", price: 799 },
    { name: "100 Pieces", price: 1499 },
  ],
};

const MagneticBadgeCustomize = () => {
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [pincode, setPincode] = useState("");
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  useEffect(() => {
    if (id && id !== "customize") {
      loadProduct();
    } else {
      // Use default product when no ID
      setProduct(defaultProduct);
      setSelectedSize(defaultProduct.sizes[0]?.name || "");
      setLoading(false);
    }
  }, [id]);

  // Get variant-specific images based on current selection - MOVED BEFORE CONDITIONAL RETURNS
  const images = useMemo(() => {
    if (!product) return [];
    return getVariantImages(
      product.variant_images,
      product.images,
      { size: selectedSize }
    );
  }, [product, selectedSize]);

  // Reset image index when variant changes - MOVED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedSize]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Use default if product not found
        setProduct(defaultProduct);
        setSelectedSize(defaultProduct.sizes[0]?.name || "");
        setLoading(false);
        return;
      }

      // Parse sizes and variant_images from JSON
      const sizes = Array.isArray(data.sizes)
        ? (data.sizes as unknown as ProductSize[])
        : defaultProduct.sizes;
      const variant_images = parseVariantImages(data.variant_images);
      setProduct({ ...data, sizes, variant_images });

      if (sizes.length > 0) {
        setSelectedSize(sizes[0].name);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      // Use default on error
      setProduct(defaultProduct);
      setSelectedSize(defaultProduct.sizes[0]?.name || "");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const selectedSizeObj = product.sizes.find(s => s.name === selectedSize);
  const currentPrice = selectedSizeObj?.price || product.base_price;
  const originalPrice = Math.round(currentPrice * 1.3);
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      // Store the actual File object for upload
      setUploadedLogo(file);
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      toast({
        title: "Logo Uploaded",
        description: "Your logo has been uploaded successfully!",
      });
    }
  };

  // Extract quantity from selected size (e.g., "10 Pieces" -> 10)
  const getQuantityFromSize = (size: string): number => {
    const match = size.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const handleAddToCart = async () => {
    setIsSubmitting(true);
    try {
      const quantity = getQuantityFromSize(selectedSize);
      const result = await addToCart({
        productId: product.id,
        productName: product.name,
        productImage: images[0] || '',
        quantity: quantity,
        unitPrice: currentPrice,
        selectedSize: selectedSize,
        customImageUrl: uploadedLogo || undefined,
        category: "magnetic-badges",
      });

      if (result) {
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    setIsSubmitting(true);
    try {
      const quantity = getQuantityFromSize(selectedSize);
      await buyNow({
        productId: product.id,
        productName: product.name,
        productImage: images[0] || '',
        price: currentPrice,
        quantity: quantity,
        selectedSize: selectedSize,
        customImageUrl: uploadedLogo || undefined,
        category: "magnetic-badges",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <ChevronRight className="w-4 h-4" />
          <a href="/category/magnetic-badges" className="hover:text-primary transition-colors">Wedding Card</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Customize</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0 md:pr-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      selectedIndex === index
                        ? "border-primary shadow-glow"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img src={image} alt={`Product view ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 group">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img
                  src={images[selectedIndex] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop'}
                  alt="Product main view"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {images.length > 1 && (
                  <>
                    <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < 4 ? "fill-primary text-primary" : "fill-primary/30 text-primary/30")} />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">4.4</span>
                <span className="text-sm text-muted-foreground">(1,427 Reviews)</span>
              </div>
              {product.description && (
                <p className="mt-3 text-muted-foreground">{product.description}</p>
              )}
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-muted-foreground line-through text-lg">₹{originalPrice.toLocaleString()}</span>
                <span className="text-3xl font-heading font-bold text-foreground">₹{currentPrice.toLocaleString()}</span>
                <span className="bg-success text-success-foreground text-sm font-semibold px-3 py-1 rounded-full">SAVE {discount}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Inclusive of All Taxes</p>
            </div>

            {/* Logo Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold gap-3 bg-primary hover:bg-primary/90 shadow-glow"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
              {uploadedLogo ? "Change Logo" : "Upload Your Logo"}
            </Button>
            {uploadedLogo && (
              <div className="flex items-center gap-2 justify-center -mt-2">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm text-success font-medium">Logo uploaded</span>
              </div>
            )}
            <p className="text-center text-sm text-primary font-medium -mt-3">
              We'll send design preview for approval after order is Placed/Confirmed.
            </p>

            {/* Size/Quantity Selector */}
            {product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  QUANTITY: <span className="text-muted-foreground font-normal">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200",
                        selectedSize === size.name
                          ? "border-foreground bg-foreground text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-muted-foreground"
                      )}
                    >
                      {size.name} - ₹{size.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Pricing Calculator */}
            {selectedSizeObj && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Bulk Pricing Calculator</h3>
                </div>

                {(() => {
                  const quantityMatch = selectedSize.match(/(\d+)/);
                  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
                  const perPiecePrice = currentPrice / quantity;
                  const regularPerPiece = product.sizes[0]?.price
                    ? product.sizes[0].price / (parseInt(product.sizes[0].name.match(/(\d+)/)?.[1] || "1"))
                    : perPiecePrice;
                  const savingsPercent = regularPerPiece > perPiecePrice
                    ? Math.round(((regularPerPiece - perPiecePrice) / regularPerPiece) * 100)
                    : 0;

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background/80 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Total Quantity</p>
                          <p className="text-xl font-bold text-foreground">{quantity} pcs</p>
                        </div>
                        <div className="bg-background/80 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Per Piece Price</p>
                          <p className="text-xl font-bold text-primary">₹{perPiecePrice.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="bg-background/80 rounded-lg p-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-bold text-foreground">₹{currentPrice.toLocaleString()}</span>
                        </div>
                        {savingsPercent > 0 && (
                          <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-border/50">
                            <span className="text-muted-foreground">Bulk Savings</span>
                            <span className="font-semibold text-success">{savingsPercent}% OFF per piece!</span>
                          </div>
                        )}
                      </div>

                      {/* Pricing comparison table */}
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Compare Pricing:</p>
                        <div className="space-y-1.5">
                          {product.sizes.map((size) => {
                            const qty = parseInt(size.name.match(/(\d+)/)?.[1] || "1");
                            const pricePerPc = size.price / qty;
                            const isSelected = size.name === selectedSize;
                            return (
                              <div
                                key={size.name}
                                className={cn(
                                  "flex justify-between items-center text-xs p-2 rounded-md transition-colors",
                                  isSelected
                                    ? "bg-primary/20 border border-primary/30"
                                    : "bg-background/50 hover:bg-background/80"
                                )}
                              >
                                <span className={cn(
                                  "font-medium",
                                  isSelected ? "text-primary" : "text-foreground"
                                )}>
                                  {size.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">₹{pricePerPc.toFixed(2)}/pc</span>
                                  {isSelected && (
                                    <Check className="h-3.5 w-3.5 text-primary" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-row gap-2 sm:gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-11 sm:h-14 text-sm sm:text-base font-semibold gap-1.5 sm:gap-2 border-2 border-foreground text-foreground hover:bg-foreground hover:text-primary-foreground"
                onClick={handleAddToCart}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 h-11 sm:h-14 text-sm sm:text-base font-semibold gap-1.5 sm:gap-2 bg-primary hover:bg-primary/90 shadow-glow"
                onClick={handleBuyNow}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                Buy Now
              </Button>
            </div>
            <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20BD5A]" onClick={() => window.open(`https://wa.me/918518851767?text=Hi, interested in ${product.name}`, '_blank')}>
              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Us
            </Button>



            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <feature.icon className={cn("h-5 w-5 shrink-0 mt-0.5", feature.color)} />
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              {[{ icon: "🔒", label: "Secure Checkout" }, { icon: "🚚", label: "Fast Shipping" }, { icon: "💯", label: "Quality Assured" }, { icon: "↩️", label: "Easy Returns" }].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-sm font-medium text-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ReviewsAndSuggestions 
                productId={id || "default-magnetic-badge"} 
                category="wedding-card" 
              />
      
      <Footer />
    </div>
  );
};

export default MagneticBadgeCustomize;
