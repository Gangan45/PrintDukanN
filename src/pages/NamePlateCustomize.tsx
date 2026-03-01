import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";
import { ProductDetailSkeleton } from "@/components/skeletons";
import {
  ChevronRight,
  Loader2,
  ShoppingCart,
  Zap,
  Type,
  Palette,
  Check,
  Star,
  MessageCircle
} from "lucide-react";

interface ProductSize {
  name: string;
  price: number;
}

interface ProductFrame {
  name: string;
  hex?: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  sizes: ProductSize[];
  frames: ProductFrame[];
}

const defaultSizes: ProductSize[] = [
  { name: "12 x 5 inches", price: 0 },
  { name: "14 x 6 inches", price: 200 },
  { name: "16 x 6 inches", price: 400 },
  { name: "16 x 7 inches", price: 500 },
  { name: "18 x 6 inches", price: 600 },
  { name: "18 x 7 inches", price: 700 }
];

const defaultMaterials: ProductFrame[] = [
  { name: "Clear Acrylic", price: 0 },
  { name: "Frosted Acrylic", price: 100 },
  { name: "Black Acrylic", price: 150 },
  { name: "Gold Mirror", price: 300 },
  { name: "Silver Mirror", price: 300 }
];

const textColors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Gold", hex: "#d4af37" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" }
];

// Default product values when no ID provided
const defaultProduct: Product = {
  id: "default-name-plate",
  name: "Custom Acrylic Name Plate",
  description: "Premium acrylic name plate with customizable text and design",
  base_price: 499,
  images: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop"],
  sizes: defaultSizes,
  frames: defaultMaterials,
};

export default function NamePlateCustomize() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [mainText, setMainText] = useState("");
  const [subText, setSubText] = useState("");
  const [selectedTextColor, setSelectedTextColor] = useState(textColors[0]);
  

  useEffect(() => {
    if (id && id !== "customize") {
      loadProduct();
    } else {
      // Use default product when no ID
      setProduct(defaultProduct);
      setSelectedSize(defaultProduct.sizes[0]?.name || "");
      setSelectedMaterial(defaultProduct.frames[0]?.name || "");
      setLoading(false);
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Use default if product not found
        setProduct(defaultProduct);
        setSelectedSize(defaultProduct.sizes[0]?.name || "");
        setSelectedMaterial(defaultProduct.frames[0]?.name || "");
        setLoading(false);
        return;
      }

      const sizes = Array.isArray(data.sizes)
        ? (data.sizes as unknown as ProductSize[])
        : defaultSizes;
      const frames = Array.isArray(data.frames)
        ? (data.frames as unknown as ProductFrame[])
        : defaultMaterials;

      setProduct({ ...data, sizes, frames });
      if (sizes.length > 0) setSelectedSize(sizes[0].name);
      if (frames.length > 0) setSelectedMaterial(frames[0].name);
    } catch (error) {
      console.error("Error loading product:", error);
      // Use default on error
      setProduct(defaultProduct);
      setSelectedSize(defaultProduct.sizes[0]?.name || "");
      setSelectedMaterial(defaultProduct.frames[0]?.name || "");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <ProductDetailSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const sizes = product.sizes.length > 0 ? product.sizes : defaultSizes;
  const materials = product.frames.length > 0 ? product.frames : defaultMaterials;

  const selectedSizeObj = sizes.find((s) => s.name === selectedSize);
  const selectedMaterialObj = materials.find((m) => m.name === selectedMaterial);
  
  const currentPrice = product.base_price + 
    (selectedSizeObj?.price || 0) + 
    (selectedMaterialObj?.price || 0);
  const originalPrice = Math.round(currentPrice * 1.25);


  // Extract quantity from selected size (e.g., "10 Pieces" -> 10)
  const getQuantityFromSize = (size: string): number => {
    const match = size.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const handleAddToCart = async () => {
    if (!mainText.trim()) {
      toast.error("Please enter the main text for your name plate");
      return;
    }

    setIsSubmitting(true);
    try {
      const quantity = getQuantityFromSize(selectedSize);
      const result = await addToCart({
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || "",
        quantity: quantity,
        unitPrice: currentPrice,
        selectedSize: selectedSize,
        selectedFrame: selectedMaterial,
        customText: `${mainText}${subText ? ` | ${subText}` : ""}`,
        category: "name-plates"
      });
      
      if (result) {
        toast.success("Added to cart!");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!mainText.trim()) {
      toast.error("Please enter the main text for your name plate");
      return;
    }

    setIsSubmitting(true);
    try {
      const quantity = getQuantityFromSize(selectedSize);
      await buyNow({
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || "",
        price: currentPrice,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedFrame: selectedMaterial,
        customText: `${mainText}${subText ? ` | ${subText}` : ""}`,
        category: "name-plates"
      });
    } catch (error) {
      toast.error("Failed to process");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 border-b border-border">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/category/name-plates" className="hover:text-primary">Name Plates</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">Customize</span>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Product Image Section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-xl sm:rounded-2xl border border-border relative overflow-hidden">
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  No Image Available
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Live Preview:</p>
              <div
                className={cn(
                  "w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg text-center transition-all",
                  selectedMaterial.includes("Black") ? "bg-gray-900" :
                  selectedMaterial.includes("Frosted") ? "bg-white/80 backdrop-blur" :
                  selectedMaterial.includes("Gold") ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                  selectedMaterial.includes("Silver") ? "bg-gradient-to-r from-gray-300 to-gray-400" :
                  "bg-white"
                )}
              >
                <h2 
                  className="text-base sm:text-xl font-bold tracking-wide"
                  style={{ color: selectedTextColor.hex }}
                >
                  {mainText || "Your Name Here"}
                </h2>
                {subText && (
                  <p 
                    className="text-xs sm:text-sm mt-1 opacity-80"
                    style={{ color: selectedTextColor.hex }}
                  >
                    {subText}
                  </p>
                )}
              </div>
            </div>

            {/* Rating - Hidden on mobile, shown below title */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < 4 ? "fill-primary text-primary" : "text-muted")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(245 reviews)</span>
            </div>
          </div>

          {/* Customization Section */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground">{product.name}</h1>
              {/* Mobile rating */}
              <div className="flex sm:hidden items-center gap-2 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3 h-3", i < 4 ? "fill-primary text-primary" : "text-muted")} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">(245 reviews)</span>
              </div>
              <div className="flex items-baseline gap-2 sm:gap-3 mt-2">
                <span className="text-xl sm:text-2xl font-bold text-foreground">₹{currentPrice}</span>
                <span className="text-sm sm:text-lg text-muted-foreground line-through">₹{originalPrice}</span>
                <span className="bg-success/10 text-success text-xs sm:text-sm font-medium px-2 py-0.5 sm:py-1 rounded">
                  {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
                </span>
              </div>
            </div>

            {/* Main Text */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                Main Text *
              </Label>
              <Input
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
                placeholder="Enter your name or company name"
                maxLength={30}
                className="h-10"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">{mainText.length}/30 characters</p>
            </div>

            {/* Sub Text */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Sub Text (Optional)</Label>
              <Input
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="Designation, flat number, etc."
                maxLength={50}
                className="h-10"
              />
            </div>

            {/* Size Selection */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Size</Label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={cn(
                      "px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border-2 transition-all",
                      selectedSize === size.name
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {size.name} {size.price > 0 && `+₹${size.price}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                Material
              </Label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                {materials.map((material) => (
                  <button
                    key={material.name}
                    onClick={() => setSelectedMaterial(material.name)}
                    className={cn(
                      "px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border-2 transition-all",
                      selectedMaterial === material.name
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {material.name} {material.price > 0 && `+₹${material.price}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Text Color</Label>
              <div className="flex gap-2 flex-wrap">
                {textColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedTextColor(color)}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center",
                      selectedTextColor.name === color.name
                        ? "border-primary scale-110"
                        : "border-border"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedTextColor.name === color.name && (
                      <Check className={cn(
                        "w-3 h-3 sm:w-4 sm:h-4",
                        color.hex === "#ffffff" || color.hex === "#c0c0c0" || color.hex === "#d4af37"
                          ? "text-gray-800"
                          : "text-white"
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm">Need Custom Design?</Label>
              <Button
                variant="outline"
                onClick={() => {
                  const message = encodeURIComponent(
                    `Hi! I'm interested in a custom name plate.\n\nDetails:\n- Size: ${selectedSize}\n- Material: ${selectedMaterial}\n- Text Color: ${selectedTextColor.name}\n- Main Text: ${mainText || "Not entered"}\n- Sub Text: ${subText || "None"}`
                  );
                  window.open(`https://wa.me/918518851767?text=${message}`, "_blank");
                }}
                className="w-full h-10 text-sm bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact on WhatsApp
              </Button>
            </div>

            {/* Action Buttons - Fixed on mobile */}
            <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4 sticky bottom-0 bg-background py-3 sm:relative sm:py-0 border-t sm:border-t-0 border-border -mx-3 px-3 sm:mx-0 sm:px-0">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-11 sm:h-12 text-sm"
                onClick={handleAddToCart}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />}
                <span className="hidden xs:inline">Add to Cart</span>
                <span className="xs:hidden">Cart</span>
              </Button>
              <Button
                size="lg"
                className="flex-1 h-11 sm:h-12 text-sm"
                onClick={handleBuyNow}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-1 sm:mr-2" />}
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews and Related Products */}
        <ReviewsAndSuggestions 
          productId={id || "default-name-plate"} 
          category="Name Plates" 
        />
      </main>

      <Footer />
    </div>
  );
}
