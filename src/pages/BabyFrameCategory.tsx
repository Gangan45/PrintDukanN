import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronRight, Star, Truck, Shield, Clock, Check, ShoppingCart, Flame, ChevronLeft } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


// Design variants for baby frames
const designVariants = [
  { id: "design-1", label: "Design 1", image: "https://giftingstudio.in/cdn/shop/files/Babybirthframedesign1.webp?v=1765299500&width=600" },
  { id: "design-2", label: "Design 2", image: "https://giftingstudio.in/cdn/shop/files/Design4_1.webp?v=1765299500&width=600" },
  { id: "design-3", label: "Design 3", image: "https://giftingstudio.in/cdn/shop/files/Design5_5.webp?v=1765299500&width=600" },
  { id: "design-4", label: "Design 4", image: "https://giftingstudio.in/cdn/shop/files/Design2_3.webp?v=1765299500&width=600" },
  { id: "design-5", label: "Design 5", image: "https://giftingstudio.in/cdn/shop/files/Design3_4.webp?v=1765299500&width=600" },
];

// Size options
const sizeOptions = [
  { id: "a4", label: "A4 (8x12 inch)", price: 799, originalPrice: 999 },
  { id: "a3", label: "A3 (12x18 inch)", price: 1199, originalPrice: 1499, popular: true },
];

// Gallery images
const galleryImages = [
  "https://giftingstudio.in/cdn/shop/files/Babybirthframedesign1.webp?v=1765299500&width=800",
  "https://giftingstudio.in/cdn/shop/files/Design4_1.webp?v=1765299500&width=800",
  "https://giftingstudio.in/cdn/shop/files/Design5_5.webp?v=1765299500&width=800",
  "https://giftingstudio.in/cdn/shop/files/Design4_9.webp?v=1765299500&width=800",
  "https://giftingstudio.in/cdn/shop/files/Design2_3.webp?v=1765299500&width=800",
  "https://giftingstudio.in/cdn/shop/files/Design3_4.webp?v=1765299500&width=800",
];

const BabyFrameCategory = () => {
  const navigate = useNavigate();
  const [selectedDesign, setSelectedDesign] = useState(designVariants[0]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart, loading: cartLoading } = useCart();
  const { buyNow, loading: buyNowLoading } = useBuyNow();

  const productId = "baby-birth-frame";
  const productName = "Personalized Baby Birth Frame – A Memory for Life";

  const handleAddToCart = async () => {
    const result = await addToCart({
      productId,
      productName,
      productImage: selectedDesign.image,
      quantity,
      selectedSize: selectedSize.label,
      selectedFrame: selectedDesign.label,
      customImageUrl: selectedDesign.image,
      unitPrice: selectedSize.price,
      category: "Baby Frames",
    });

    if (result) {
      toast.success("Added to cart!", {
        description: `${productName} - ${selectedSize.label}`,
      });
    }
  };

  const handleBuyNow = async () => {
    await buyNow({
      productId,
      productName,
      productImage: selectedDesign.image,
      price: selectedSize.price * quantity,
      selectedSize: selectedSize.label,
      selectedFrame: selectedDesign.label,
      customImageUrl: selectedDesign.image,
      category: "Baby Frames",
    });
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Announcement Bar */}
      <div className="bg-amber-400 text-black text-center py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
        🚚 Free Shipping on All Prepaid Orders
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap pb-1">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          <Link to="/category/acrylic" className="hover:text-primary transition-colors">Acrylic</Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-foreground font-medium">Baby Birth Frame</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            {/* Bestseller Badge */}
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 mb-1 sm:mb-2 text-xs">
              Bestseller
            </Badge>

            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 rounded-xl sm:rounded-2xl overflow-hidden group">
              <img
                src={galleryImages[selectedImageIndex]}
                alt="Baby Birth Frame"
                className="w-full h-full object-contain p-2 sm:p-4"
              />
              
              {/* Navigation Arrows - Always visible on mobile */}
              <button
                onClick={handlePrevImage}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-background/80 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-background"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-background/80 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-background"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs sm:text-sm">
                {selectedImageIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-lg overflow-hidden border-2 transition-all",
                    selectedImageIndex === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                {productName}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Most Loved by 1,00,000+ New Parents in India
              </p>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm sm:text-base text-muted-foreground">2353 Reviews</span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">₹{selectedSize.price}</span>
              <span className="text-lg sm:text-xl text-muted-foreground line-through">₹{selectedSize.originalPrice}</span>
              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                Save {Math.round(((selectedSize.originalPrice - selectedSize.price) / selectedSize.originalPrice) * 100)}%
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Inclusive of taxes !</p>

            {/* Activity Indicator */}
            <div className="flex items-center gap-2 p-2 sm:p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                <strong>42 people</strong> are viewing this right now
              </span>
            </div>

            {/* Design Variant */}
            <div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Design variant</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {designVariants.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={cn(
                      "relative p-0.5 sm:p-1 rounded-lg border-2 transition-all",
                      selectedDesign.id === design.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <img
                      src={design.image}
                      alt={design.label}
                      className="w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 object-cover rounded"
                    />
                    <span className="block text-[10px] sm:text-xs text-center mt-0.5 sm:mt-1">{design.label}</span>
                    {selectedDesign.id === design.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="font-semibold text-sm sm:text-base">Size</h3>
                <button className="text-xs sm:text-sm text-primary hover:underline">Size chart</button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left",
                      selectedSize.id === size.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {size.popular && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-[10px] sm:text-xs">
                            Most loved
                          </Badge>
                        )}
                        <span className="font-medium text-xs sm:text-sm">{size.label}</span>
                        {size.popular && <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <span className="font-bold text-sm sm:text-base">₹{size.price}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground line-through">₹{size.originalPrice}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Quantity</h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  -
                </button>
                <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-sm sm:text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customize Button */}
            <Link to="/baby-frame/customize" className="block">
              <Button
                variant="outline"
                size="default"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm sm:text-base h-10 sm:h-11"
              >
                ✏️ Customize Your Frame
              </Button>
            </Link>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-border">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Premium Quality</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">3-5 Days Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-8">Why Parents Love Our Baby Frames</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-lg sm:rounded-xl">
              <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-4 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                <span className="text-lg sm:text-2xl">👶</span>
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-base">All Birth Details</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Name, birth date, time, weight & height
              </p>
            </div>
            
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg sm:rounded-xl">
              <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-lg sm:text-2xl">📸</span>
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-base">Multiple Photos</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Add baby & parent photos
              </p>
            </div>
            
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg sm:rounded-xl">
              <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-4 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                <span className="text-lg sm:text-2xl">🎁</span>
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-base">Perfect Gift</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Ideal for baby showers
              </p>
            </div>
            
            <div className="text-center p-3 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg sm:rounded-xl">
              <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-4 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <span className="text-lg sm:text-2xl">✨</span>
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-base">Premium Acrylic</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                High-quality UV printing
              </p>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-10 sm:mt-16">
          <h2 className="text-lg sm:text-2xl font-bold text-center mb-1 sm:mb-2">Customer Reviews</h2>
          <p className="text-center text-xs sm:text-base text-muted-foreground mb-4 sm:mb-8">See what parents are saying</p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {[
              {
                name: "Priya Sharma",
                rating: 5,
                review: "Absolutely beautiful frame! The quality exceeded my expectations. Perfect keepsake for my daughter's birth details.",
                date: "2 days ago",
                verified: true,
              },
              {
                name: "Rahul Verma",
                rating: 5,
                review: "Gifted this to my sister for her baby shower. She loved it! The printing quality is amazing.",
                date: "1 week ago",
                verified: true,
              },
              {
                name: "Anjali Patel",
                rating: 5,
                review: "Fast delivery and excellent packaging. The frame looks exactly like the pictures. Highly recommend!",
                date: "2 weeks ago",
                verified: true,
              },
            ].map((review, index) => (
              <div key={index} className="p-3 sm:p-6 bg-card rounded-lg sm:rounded-xl border border-border">
                <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-3">{review.review}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{review.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  {review.verified && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BabyFrameCategory;