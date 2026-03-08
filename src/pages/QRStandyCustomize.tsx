import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ZoomIn, Star, Upload, Check, Truck, Shield, Zap, Loader2, ShoppingCart, MessageCircle, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVariantImages, parseVariantImages, VariantImages } from "@/lib/variantImages";
import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";
import { ProductDetailSkeleton } from "@/components/skeletons";

interface ProductSize {
  name: string;
  price: number;
}

interface ProductFrame {
  name: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  variant_images: VariantImages | null;
  sizes: ProductSize[];
  frames: ProductFrame[];
}

const platforms: Platform[] = [
  { id: "google", name: "Google", icon: "https://cdn-icons-png.flaticon.com/512/300/300221.png" },
  { id: "instagram", name: "Instagram", icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png" },
  { id: "upi", name: "UPI", icon: "https://www.svgrepo.com/show/237613/rupee.svg" },
  { id: "facebook", name: "Facebook", icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png" },
  { id: "youtube", name: "YouTube", icon: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png" },
  { id: "whatsapp", name: "WhatsApp", icon: "https://cdn-icons-png.flaticon.com/512/733/733585.png" },
  { id: "website", name: "Website", icon: "https://cdn-icons-png.flaticon.com/512/841/841364.png" },
  { id: "other", name: "Other", icon: "https://cdn-icons-png.flaticon.com/512/1828/1828817.png" },
];

const features = [
  { icon: Check, text: "Premium Quality Acrylic Material", color: "text-primary" },
  { icon: Check, text: "UV Printed with High Resolution", color: "text-primary" },
  { icon: Truck, text: "Free Delivery On All Orders Above ₹699/-", color: "text-success" },
  { icon: Shield, text: "Secure Online Payments", color: "text-success" },
];

const defaultProduct: Product = {
  id: "default-qr-standy",
  name: "QR Standee - Custom Design",
  description: "Premium acrylic QR standee with high-quality UV printing",
  base_price: 599,
  images: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop"],
  variant_images: null,
  sizes: [
    { name: "Small (4x6 inch)", price: 399 },
    { name: "Medium (6x8 inch)", price: 599 },
    { name: "Large (8x10 inch)", price: 799 },
  ],
  frames: [{ name: "Black" }, { name: "Gold" }, { name: "Silver" }],
};

const QRStandyCustomize = () => {
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFrame, setSelectedFrame] = useState<string>("");

  // Updated to support multiple selections
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [customText, setCustomText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && id !== "customize") {
      loadProduct();
    } else {
      setProduct(defaultProduct);
      setSelectedSize(defaultProduct.sizes[0]?.name || "");
      setSelectedFrame(defaultProduct.frames[0]?.name || "");
      setLoading(false);
    }
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    return getVariantImages(product.variant_images, product.images, { size: selectedSize, frame: selectedFrame });
  }, [product, selectedSize, selectedFrame]);

  useEffect(() => { setSelectedIndex(0); }, [selectedSize, selectedFrame]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) {
        setProduct(defaultProduct);
        setLoading(false);
        return;
      }
      const sizes = Array.isArray(data.sizes) ? (data.sizes as unknown as ProductSize[]) : defaultProduct.sizes;
      const frames = Array.isArray(data.frames) ? (data.frames as unknown as ProductFrame[]) : defaultProduct.frames;
      setProduct({ ...data, sizes, frames, variant_images: parseVariantImages(data.variant_images) });
      if (sizes.length > 0) setSelectedSize(sizes[0].name);
      if (frames.length > 0) setSelectedFrame(frames[0].name);
    } catch (error) {
      setProduct(defaultProduct);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]
    );
  };

  const getPlatformNames = () => {
    return platforms.filter(p => selectedPlatforms.includes(p.id)).map(p => p.name).join(", ");
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 py-4"><ProductDetailSkeleton /></div>
      <Footer />
    </div>
  );

  if (!product) return null;

  const selectedSizeObj = product.sizes.find(s => s.name === selectedSize);
  const currentPrice = selectedSizeObj?.price || product.base_price;
  const originalPrice = Math.round(currentPrice * 1.2);
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 5 * 1024 * 1024) {
      setUploadedFile(file);
      toast({ title: "File Uploaded", description: "Your QR code/logo is ready!" });
    }
  };

  const handleAddToCart = async () => {
    if (selectedPlatforms.length === 0) {
      toast({ title: "Platform Required", description: "Select at least one platform", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addToCart({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: currentPrice,
        selectedSize: `Platforms: ${getPlatformNames()}`,
        selectedFrame: selectedFrame,
        customImageUrl: uploadedFile || undefined,
        customText: customText || undefined,
        category: "qr-standy",
      });
      toast({ title: "Added to Cart" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleBuyNow = async () => {
    if (selectedPlatforms.length === 0) {
      toast({ title: "Platform Required", description: "Select at least one platform", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await buyNow({
        productId: product.id,
        productName: product.name,
        productImage: images[0] || '',
        price: currentPrice,
        quantity: 1,
        selectedSize: `Platforms: ${getPlatformNames()}`,
        selectedFrame: selectedFrame,
        customImageUrl: uploadedFile || undefined,
        customText: customText || undefined,
        category: "qr-standy",
      });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 py-2 sm:py-4">
        <nav className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
          <a href="/">Home</a> <ChevronRight className="w-3 h-3" />
          <a href="/category/qr-standee">QR Standees</a> <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Customize</span>
        </nav>
      </div>

      <section className="container mx-auto px-3 pb-6 sm:pb-12">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-12">
          {/* Gallery */}
          {/* <div className="flex flex-col-reverse md:flex-row gap-2">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedIndex(i)} className={cn("w-12 h-12 md:w-20 md:h-20 rounded-lg border-2", selectedIndex === i ? "border-primary" : "border-transparent")}>
                    <img src={img} className="w-full h-full object-cover rounded-md" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-muted group">
              <img src={images[selectedIndex]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
          </div> */}

          {/* Gallery - Is portion ko apne code se replace kar dein */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:max-h-[500px]">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={cn(
                      "shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 bg-white p-1 shadow-sm",
                      selectedIndex === i ? "border-primary shadow-glow" : "border-border"
                    )}
                  >
                    <img src={img} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 bg-white border rounded-xl overflow-hidden group min-h-[400px] md:min-h-[500px] flex items-center justify-center">
              <img
                src={images[selectedIndex]}
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                alt="Product"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex"><Star className="h-4 w-4 fill-primary text-primary" /></div>
                <span className="text-sm font-medium">4.5 (128 Reviews)</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-muted-foreground line-through">₹{originalPrice}</span>
                <span className="text-2xl font-bold">₹{currentPrice}</span>
                <span className="bg-success text-white text-xs px-2 py-1 rounded-full">{discount}% OFF</span>
              </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            <Button className="w-full h-12 gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-5 w-5" /> {uploadedFile ? "File Selected ✅" : "Upload QR / Logo"}
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customization Note</label>
              <Textarea placeholder="Any specific design instructions?" value={customText} onChange={(e) => setCustomText(e.target.value)} />
            </div>

            {/* PLATFORM MULTI-SELECT */}
            <div>
              <p className="text-sm font-bold mb-2">SELECT PLATFORMS (You can select multiple) <span className="text-destructive">*</span></p>
              <div className="grid grid-cols-4 gap-2">
                {platforms.map((p) => {
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} className={cn("relative flex flex-col items-center p-2 rounded-xl border-2 transition-all", isSelected ? "border-primary bg-primary/10" : "border-border")}>
                      <img src={p.icon} className="w-8 h-8 object-contain mb-1" />
                      <span className="text-[10px] font-medium">{p.name}</span>
                      {isSelected && <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={handleAddToCart} disabled={isSubmitting}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Cart
              </Button>
              <Button className="flex-1 h-12 bg-primary" onClick={handleBuyNow} disabled={isSubmitting}>
                <Zap className="mr-2 h-5 w-5" /> Buy Now
              </Button>
            </div>

            <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20BD5A]" onClick={() => window.open(`https://wa.me/918518851767?text=Hi, interested in ${product.name}`, '_blank')}>
              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Us
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <ReviewsAndSuggestions productId={id || "default-qr-standy"} category="QR Standee" />
      </div>

      {/* QR Standee Reels Section */}
      <QRStandeeReels />

      <Footer />
    </div>
  );
};

// QR Standee specific reels component
const QRStandeeReels = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [likedReels, setLikedReels] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('likedReels');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const { data: reels = [] } = useQuery({
    queryKey: ["qr-standee-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .eq("is_active", true)
        .ilike("category", "%qr%")
        .order("display_order", { ascending: true });
      if (error) { console.error("Error fetching QR reels:", error); return []; }
      return data || [];
    },
  });

  const handleLike = (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    const newLiked = new Set(likedReels);
    if (newLiked.has(reelId)) newLiked.delete(reelId);
    else newLiked.add(reelId);
    setLikedReels(newLiked);
    localStorage.setItem('likedReels', JSON.stringify([...newLiked]));
  };

  const handleShare = async (e: React.MouseEvent, reel: any) => {
    e.stopPropagation();
    const url = `${window.location.origin}${reel.product_link}`;
    try {
      if (navigator.share) await navigator.share({ title: reel.title, url });
      else { await navigator.clipboard.writeText(url); }
    } catch {}
  };

  const formatLikes = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();

  if (reels.length === 0) return null;

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Watch & Shop</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-foreground">
            QR Standee <span className="font-display italic text-primary">Reels</span>
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">See our QR standees in action</p>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-2">
          {reels.map((reel: any) => (
            <div
              key={reel.id}
              className="relative flex-shrink-0 w-[75vw] sm:w-[240px] aspect-[9/16] rounded-2xl overflow-hidden snap-center group cursor-pointer"
              onClick={() => window.open("https://www.instagram.com/printdukan_official", "_blank")}
            >
              {reel.video_url ? (
                <video src={reel.video_url} className="w-full h-full object-cover" autoPlay loop muted playsInline poster={reel.image_url} />
              ) : (
                <img src={reel.image_url} alt={reel.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3">
                <button onClick={(e) => handleLike(e, reel.id)} className="flex flex-col items-center gap-1">
                  <div className={cn("w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center", likedReels.has(reel.id) ? "bg-red-500" : "bg-white/20")}>
                    <Heart className={cn("h-4 w-4", likedReels.has(reel.id) ? "text-white fill-white" : "text-white")} />
                  </div>
                  <span className="text-[10px] text-white">{formatLikes(reel.likes_count + (likedReels.has(reel.id) ? 1 : 0))}</span>
                </button>
                <button onClick={(e) => handleShare(e, reel)} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-white" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-semibold text-white mb-1">{reel.title}</p>
                <p className="text-xs text-white/80">{reel.product_name}</p>
                <p className="text-base font-bold text-white">₹{reel.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QRStandyCustomize;