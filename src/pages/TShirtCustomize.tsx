import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";
import { ProductDetailSkeleton } from "@/components/skeletons";
import {
  Star,
  Upload,
  ShoppingCart,
  Zap,
  Loader2,
  ChevronRight as BreadcrumbIcon,
  Minus,
  Plus
} from "lucide-react";

interface TshirtSize {
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  sizes: unknown;
}

const DEFAULT_TSHIRT_IMAGE = "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=700&fit=crop";

const defaultSizes: TshirtSize[] = [
  { name: "S", price: 0 },
  { name: "M", price: 0 },
  { name: "L", price: 0 },
  { name: "XL", price: 0 },
  { name: "XXL", price: 0 },
];

export default function TShirtCustomize() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [customText, setCustomText] = useState("");
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id && id !== "customize") {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("category", "T-Shirts")
        .maybeSingle();

      if (error) throw error;
      if (data) setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseSizes = (sizes: unknown): TshirtSize[] => {
    if (!sizes || !Array.isArray(sizes)) return defaultSizes;
    return sizes.length > 0 ? (sizes as TshirtSize[]) : defaultSizes;
  };

  const productName = product?.name || "Custom T-Shirt";
  const productPrice = product?.base_price || 449;
  const productSizes = parseSizes(product?.sizes);
  const currentImage = product?.images?.[0] || DEFAULT_TSHIRT_IMAGE;
  const originalPrice = Math.round(productPrice * 1.15);
  const discountPercent = Math.round(((originalPrice - productPrice) / originalPrice) * 100);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      // Store file directly for upload to storage later
      setUploadedLogo(file);
      // Create preview URL for display
      setLogoPreview(URL.createObjectURL(file));
      toast.success("Logo uploaded successfully!");
    }
  };

  const handleSizeQuantityChange = (sizeName: string, delta: number) => {
    setSelectedSizes((prev) => {
      const current = prev[sizeName] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [sizeName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [sizeName]: newValue };
    });
  };

  const getTotalQuantity = () => Object.values(selectedSizes).reduce((sum, qty) => sum + qty, 0);

  const handleAddToCart = async () => {
    const totalQty = getTotalQuantity();
    if (totalQty === 0) {
      toast.error("Please select at least one size");
      return;
    }
    setIsLoading(true);
    const result = await addToCart({
      productId: product?.id || `tshirt-custom`,
      productName,
      quantity: totalQty,
      unitPrice: productPrice,
      selectedSize: Object.entries(selectedSizes).map(([s, q]) => `${s}-${q}`).join(", "),
      customImageUrl: uploadedLogo || undefined,
      customText: customText || undefined,
      category: "tshirts",
    });
    if (result) { toast.success("Added to cart!"); }
    setIsLoading(false);
  };

  const handleBuyNow = async () => {
    const totalQty = getTotalQuantity();
    if (totalQty === 0) {
      toast.error("Please select at least one size");
      return;
    }
    setIsLoading(true);
    await buyNow({
      productId: product?.id || `tshirt-custom`,
      productName,
      productImage: currentImage,
      price: productPrice,
      quantity: totalQty,
      selectedSize: Object.entries(selectedSizes).map(([s, q]) => `${s}-${q}`).join(", "),
      customImageUrl: uploadedLogo || undefined,
      customText: customText || undefined,
      category: "tshirts",
    });
    setIsLoading(false);
  };

  if (loading) return <ProductDetailSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <BreadcrumbIcon className="w-3 h-3" />
          <Link to="/category/t-shirts" className="hover:text-primary">T-Shirts</Link>
          <BreadcrumbIcon className="w-3 h-3" />
          <span className="text-foreground font-medium">{productName}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Static Image with Fixed Logo Overlay */}
          <div className="space-y-4">
            <div className="relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
              <div className="aspect-[4/5] relative">
                <img src={currentImage} alt={productName} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary">{productName.toUpperCase()}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-sm">4.3 (655 Reviews)</span>
              </div>
            </div>

            <div className="bg-muted/40 rounded-xl p-4 border flex items-center gap-3">
              <span className="text-muted-foreground line-through">₹{originalPrice}</span>
              <span className="text-2xl font-bold">₹{productPrice}</span>
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">SAVE {discountPercent}%</span>
            </div>

            {/* Simple Upload Button */}
            <div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-xl text-white font-bold"
              >
                <Upload className="w-5 h-5 mr-2" />
                {logoPreview ? "Change Logo" : "Upload Logo"}
              </Button>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                Maximum file size: 5MB. Format: JPG, PNG, or SVG.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes / Custom Text</label>
              <Textarea 
                value={customText} 
                onChange={(e) => setCustomText(e.target.value)} 
                placeholder="Mention any specific placement or text instructions here..." 
                className="rounded-xl min-h-[80px]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">SELECT SIZES: <span className="text-primary font-bold">{getTotalQuantity()} PCS</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {productSizes.map((size) => (
                  <div key={size.name} className={`flex items-center justify-between p-3 rounded-lg border-2 ${selectedSizes[size.name] ? "border-primary bg-primary/5" : "border-border"}`}>
                    <span className="font-semibold text-sm">{size.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleSizeQuantityChange(size.name, -1)} className="w-7 h-7 rounded-full border hover:bg-muted" disabled={!selectedSizes[size.name]}><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm">{selectedSizes[size.name] || 0}</span>
                      <button onClick={() => handleSizeQuantityChange(size.name, 1)} className="w-7 h-7 rounded-full border hover:bg-muted"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">₹{(getTotalQuantity() * productPrice).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleAddToCart} disabled={isLoading || getTotalQuantity() === 0} variant="outline" className="py-6 rounded-xl font-semibold">
                {isLoading ? <Loader2 className="animate-spin" /> : <ShoppingCart className="mr-2 w-5 h-5" />} Add to Cart
              </Button>
              <Button onClick={handleBuyNow} disabled={isLoading || getTotalQuantity() === 0} className="py-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                {isLoading ? <Loader2 className="animate-spin" /> : <Zap className="mr-2 w-5 h-5" />} Buy Now
              </Button>
            </div>
          </div>
        </div>
        <ReviewsAndSuggestions productId={id || "default-tshirt"} category="T-Shirts" />
      </main>
      <Footer />
    </div>
  );
}