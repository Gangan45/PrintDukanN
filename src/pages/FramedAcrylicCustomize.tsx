import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChevronRight, 
  Upload, 
  ZoomIn, 
  ZoomOut,
  Type,
  Image as ImageIcon,
  Loader2,
  Check,
  ShoppingCart,
  Truck,
  Clock,
  Shield,
  Palette,
  Square,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetailSkeleton } from "@/components/skeletons";

// Frame color options matching OMGS reference
const frameColors = [
  { id: "none", label: "No Frame", color: "transparent", border: "#999", isNone: true },
  { id: "black", label: "Black", color: "#1a1a1a", border: "#333" },
  { id: "white", label: "White", color: "#f5f5f5", border: "#ddd" },
  { id: "gold", label: "Gold", color: "#d4af37", border: "#b8960c" },
  { id: "silver", label: "Silver", color: "#c0c0c0", border: "#a0a0a0" },
];

// Size options matching OMGS reference
const sizeOptions = [
  { id: "12x9", label: "12x9", width: 12, height: 9, widthCm: 30.48, heightCm: 22.86, priceAdd: 0 },
  { id: "11x11", label: "11x11", width: 11, height: 11, widthCm: 27.94, heightCm: 27.94, priceAdd: 200 },
  { id: "16x12", label: "16x12 🔥", width: 16, height: 12, widthCm: 40.64, heightCm: 30.48, priceAdd: 400, popular: true },
  { id: "16x16", label: "16x16", width: 16, height: 16, widthCm: 40.64, heightCm: 40.64, priceAdd: 600 },
  { id: "21x15", label: "21x15", width: 21, height: 15, widthCm: 53.34, heightCm: 38.1, priceAdd: 900 },
  { id: "35x23", label: "35x23", width: 35, height: 23, widthCm: 88.9, heightCm: 58.42, priceAdd: 1800 },
];

// Thickness options
const thicknessOptions = [
  { id: "3mm", label: "3MM", priceAdd: 0 },
  { id: "8mm", label: "8MM", priceAdd: 300 },
];

// Background options for photo
const backgroundOptions = [
  { id: "none", label: "None", color: "transparent" },
  { id: "white", label: "White", color: "#ffffff" },
  { id: "black", label: "Black", color: "#000000" },
  { id: "gradient-blue", label: "Blue Gradient", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "gradient-sunset", label: "Sunset", color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { id: "gradient-ocean", label: "Ocean", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
];

const FramedAcrylicCustomize = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // For canvas/preview
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null); // For upload
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [selectedFrameColor, setSelectedFrameColor] = useState("black");
  const [selectedSize, setSelectedSize] = useState("12x9");
  const [selectedThickness, setSelectedThickness] = useState("3mm");
  const [selectedBackground, setSelectedBackground] = useState("none");
  const [customText, setCustomText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [imageQuality, setImageQuality] = useState<{ quality: string; resolution: string } | null>(null);
  const { addToCart, loading: cartLoading } = useCart();
  const { buyNow, loading: buyNowLoading } = useBuyNow();

  // Fetch product from database
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (data && !error) {
          setDbProduct(data);
        }
      }
    };
    fetchProduct();
  }, [id]);

  const basePrice = dbProduct?.base_price || 799;
  const originalPrice = dbProduct?.base_price ? dbProduct.base_price * 1.5 : 1499;
  const productName = dbProduct?.name || "PrintDukan Premium Framed Acrylic Photo";

  // Get current selections
  const currentSize = sizeOptions.find(s => s.id === selectedSize) || sizeOptions[0];
  const currentThickness = thicknessOptions.find(t => t.id === selectedThickness) || thicknessOptions[0];
  const totalPrice = (basePrice + currentSize.priceAdd + currentThickness.priceAdd) * quantity;
  const totalOriginalPrice = (originalPrice + currentSize.priceAdd + currentThickness.priceAdd) * quantity;

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !uploadedImage) return;

    const containerWidth = containerRef.current.clientWidth;
    const aspectRatio = currentSize.width / currentSize.height;
    const canvasWidth = Math.min(containerWidth - 100, 550);
    const canvasHeight = canvasWidth / aspectRatio;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#4a6572",
      selection: true,
    });

    setFabricCanvas(canvas);
    loadImageToCanvas(uploadedImage, canvas);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, [selectedSize, uploadedImage]);

  // Load image to canvas
  const loadImageToCanvas = useCallback(async (dataUrl: string, canvas: FabricCanvas) => {
    canvas.clear();
    canvas.backgroundColor = "#4a6572";

    try {
      const img = await FabricImage.fromURL(dataUrl);
      
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = img.width || 100;
      const imgHeight = img.height || 100;
      
      // Calculate image quality
      const selectedSizeData = sizeOptions.find(s => s.id === selectedSize) || sizeOptions[0];
      const dpi = Math.min(imgWidth / selectedSizeData.width, imgHeight / selectedSizeData.height);
      let quality = "Good";
      if (dpi >= 300) quality = "Excellent";
      else if (dpi >= 150) quality = "Good";
      else if (dpi >= 72) quality = "Fair";
      else quality = "Low";
      
      setImageQuality({
        quality,
        resolution: `${selectedSizeData.width}x${selectedSizeData.height}`
      });
      
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.max(scaleX, scaleY);

      img.scale(scale);
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: "center",
        originY: "center",
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setIsProcessingImage(false);
    } catch (error) {
      console.error("Error loading image:", error);
      toast.error("Failed to load image");
      setIsProcessingImage(false);
    }
  }, [selectedSize]);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setIsProcessingImage(true);
    // Store the actual File object for upload
    setUploadedImageFile(file);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl); // For canvas preview
      toast.success("Photo uploaded successfully!");
      setIsProcessingImage(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  }, []);

  // Image controls
  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const currentScale = activeObject.scaleX || 1;
      activeObject.scale(currentScale * 1.1);
      fabricCanvas.renderAll();
    }
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const currentScale = activeObject.scaleX || 1;
      activeObject.scale(currentScale * 0.9);
      fabricCanvas.renderAll();
    }
  };

  // Calculate total price
  const handleAddToCart = async () => {
    if (!uploadedImage) {
      toast.error("Please upload a photo first");
      return;
    }

    const result = await addToCart({
      productId: dbProduct?.id || id || 'framed-acrylic',
      productName: productName,
      productImage: uploadedImage,
      quantity: quantity,
      selectedSize: currentSize.label,
      selectedFrame: `${frameColors.find(f => f.id === selectedFrameColor)?.label} - ${currentThickness.label}`,
      customImageUrl: uploadedImageFile || undefined,
      customText: customText || undefined,
      unitPrice: totalPrice / quantity,
      category: "Framed Acrylic Photo",
    });

    if (result) {
      toast.success("Added to cart!", {
        description: `${productName} - ${currentSize.label}`,
      });
    }
  };

  const handleBuyNow = async () => {
    if (!uploadedImage) {
      toast.error("Please upload a photo first");
      return;
    }

    await buyNow({
      productId: dbProduct?.id || id || 'framed-acrylic',
      productName: productName,
      productImage: uploadedImage,
      price: totalPrice,
      selectedSize: currentSize.label,
      selectedFrame: `${frameColors.find(f => f.id === selectedFrameColor)?.label} - ${currentThickness.label}`,
      customImageUrl: uploadedImageFile || undefined,
      customText: customText || undefined,
      category: "Framed Acrylic Photo",
    });
  };

  const currentFrameColor = frameColors.find(f => f.id === selectedFrameColor) || frameColors[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 overflow-x-auto">
          <Link to="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <Link to="/category/acrylic" className="hover:text-primary transition-colors whitespace-nowrap hidden sm:inline">Premium Acrylic Photo</Link>
          <Link to="/category/acrylic" className="hover:text-primary transition-colors whitespace-nowrap sm:hidden">Acrylic</Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-foreground whitespace-nowrap">Framed Acrylic</span>
        </div>

        {/* Product Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground px-2">
            {productName}
          </h1>
          {/* Rating */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">(66 reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left: Preview Canvas */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Canvas with dimension labels */}
            <div 
              ref={containerRef}
              className="relative bg-[#4a6572] rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-10 flex items-center justify-center overflow-hidden"
            >
              {/* Width dimension label - Top */}
              <div className="absolute top-2 sm:top-3 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">
                {currentSize.width}" Width
              </div>

              {/* Height dimension label - Left */}
              <div className="absolute left-1 sm:left-3 top-1/2 transform -translate-y-1/2 -rotate-90 bg-gray-800 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap z-10">
                {currentSize.height}" Height
              </div>

              {/* Frame wrapper */}
              <div 
                className="relative transition-all duration-300 inline-block"
                style={{
                  padding: currentFrameColor.isNone ? '0px' : '12px',
                  backgroundColor: currentFrameColor.isNone ? 'transparent' : currentFrameColor.color,
                  borderRadius: '4px',
                  boxShadow: currentFrameColor.isNone ? 'none' : '0 20px 40px rgba(0,0,0,0.3)',
                }}
              >
                {/* Inner frame border effect - hidden for No Frame */}
                {!currentFrameColor.isNone && (
                  <div 
                    className="absolute inset-[8px] sm:inset-[10px] pointer-events-none z-10"
                    style={{ 
                      border: `2px solid ${currentFrameColor.border}`,
                      borderRadius: '2px',
                    }}
                  />
                )}

                {/* Canvas area */}
                {!uploadedImage ? (
                  <label 
                    htmlFor="photo-upload" 
                    className="flex flex-col items-center justify-center bg-gray-200 cursor-pointer rounded"
                    style={{ 
                      width: '100%',
                      maxWidth: '400px',
                      minHeight: '200px',
                      aspectRatio: '4/3',
                    }}
                  >
                    <div className="text-center p-4 sm:p-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Select Photo</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Click to upload</p>
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative inline-block max-w-full">
                    <canvas ref={canvasRef} className="block rounded max-w-full" />
                    {/* PREVIEW watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-white/30 text-xl sm:text-2xl md:text-4xl font-bold tracking-widest">PREVIEW</span>
                    </div>
                    {/* OMGs logo watermark */}
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-red-600 text-white text-[6px] sm:text-[8px] px-1 rounded">
                      OMGs ®
                    </div>
                  </div>
                )}

                {isProcessingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Frame Color Selector */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Frame Color</p>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {frameColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedFrameColor(color.id)}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded border-2 transition-all duration-200 relative",
                      selectedFrameColor === color.id 
                        ? "ring-2 ring-offset-1 sm:ring-offset-2 ring-primary scale-110" 
                        : "hover:scale-105",
                      color.isNone && "bg-gray-100"
                    )}
                    style={{ 
                      backgroundColor: color.isNone ? '#f3f4f6' : color.color,
                      borderColor: color.border,
                    }}
                    title={color.label}
                  >
                    {color.isNone && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[2px] bg-red-500 rotate-45 absolute" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Photo Background */}
            <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">Change Photo Background</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                *Manual background removal available
              </p>
            </div>

            {/* Action Toolbar - OMGS Style */}
            <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-lg p-3 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleZoomOut}
                disabled={!uploadedImage}
                className="flex flex-col items-center gap-1 h-auto py-2 px-4"
              >
                <ZoomOut className="w-5 h-5" />
                <span className="text-xs">Zoom</span>
              </Button>

              <label>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex flex-col items-center gap-1 h-auto py-2 px-6 bg-primary"
                  asChild
                >
                  <span>
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Select Photo</span>
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTextInput(!showTextInput)}
                disabled={!uploadedImage}
                className="flex flex-col items-center gap-1 h-auto py-2 px-4"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">Text</span>
              </Button>
            </div>

            {/* Text Input */}
            {showTextInput && (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Text on photo</p>
                <Input
                  placeholder="Enter text to add on photo..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="mb-2"
                />
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground">
              By uploading an image you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
            </p>

            {/* Photo Quality Indicator */}
            {imageQuality && (
              <div className="text-center">
                <p className="text-sm">
                  Your Photo Quality: <span className={cn(
                    "font-bold",
                    imageQuality.quality === "Excellent" && "text-green-500",
                    imageQuality.quality === "Good" && "text-green-500",
                    imageQuality.quality === "Fair" && "text-yellow-500",
                    imageQuality.quality === "Low" && "text-red-500"
                  )}>{imageQuality.quality}</span> ({imageQuality.resolution})
                </p>
              </div>
            )}
          </div>

          {/* Right: Product Options */}
          <div className="space-y-4 sm:space-y-6">
            {/* Free Keys Highlight Banner */}
            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🔑</span>
                  </div>
                  <span className="font-semibold text-green-700 dark:text-green-400">Free Key chain Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🎁</span>
                  </div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">No Extra Charges</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <span className="font-semibold text-teal-700 dark:text-teal-400">Ready to Use</span>
                </div>
              </div>
            </div>

            {/* Size Guide Link */}
            <div className="text-right">
              <button className="text-xs sm:text-sm text-primary hover:underline">
                Size Guide ?
              </button>
            </div>

            {/* Size Selection */}
            <div>
              <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Size (Inch)</p>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={cn(
                      "px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all",
                      selectedSize === size.id 
                        ? "bg-gray-800 text-white border-gray-800" 
                        : "bg-background border-border hover:border-gray-400"
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thickness Selection */}
            <div>
              <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Thickness (mm)</p>
              <div className="flex gap-1.5 sm:gap-2">
                {thicknessOptions.map((thickness) => (
                  <button
                    key={thickness.id}
                    onClick={() => setSelectedThickness(thickness.id)}
                    className={cn(
                      "px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all",
                      selectedThickness === thickness.id 
                        ? "bg-gray-800 text-white border-gray-800" 
                        : "bg-background border-border hover:border-gray-400"
                    )}
                  >
                    {thickness.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-foreground">₹{totalPrice.toLocaleString()}</span>
                <span className="text-sm sm:text-lg text-muted-foreground line-through">₹{totalOriginalPrice.toLocaleString()}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {Math.round((1 - totalPrice / totalOriginalPrice) * 100)}% OFF
              </Badge>

              <p className="text-xs sm:text-sm text-orange-600 mt-2">
                Only <strong>7</strong> left!
              </p>
            </div>

            {/* Processing Time */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>Processing Time <strong>6 hours</strong></span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 sm:gap-4">
              <p className="text-xs sm:text-sm font-medium">Quantity:</p>
              <div className="flex items-center border rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-muted transition-colors text-sm"
                >
                  -
                </button>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 font-medium text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-muted transition-colors text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button 
                className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-orange-500 hover:bg-orange-600"
                onClick={handleBuyNow}
                disabled={buyNowLoading || !uploadedImage}
              >
                {buyNowLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  "BUY IT NOW"
                )}
              </Button>

              <Button 
                variant="outline"
                className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold"
                onClick={handleAddToCart}
                disabled={cartLoading || !uploadedImage}
              >
                {cartLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              {/* WhatsApp Contact */}
              <Button
                variant="outline"
                className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                onClick={() => {
                  const message = encodeURIComponent(
                    `Hi! I'm interested in Framed Acrylic Photo.\n\nDetails:\n- Size: ${currentSize.label}\n- Frame: ${frameColors.find(f => f.id === selectedFrameColor)?.label}\n- Thickness: ${currentThickness.label}\n- Price: ₹${totalPrice}`
                  );
                  window.open(`https://wa.me/918518851767?text=${message}`, "_blank");
                }}
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Contact on WhatsApp
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
              <div className="p-2 sm:p-3 bg-muted/30 rounded-lg">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                <p className="text-[10px] sm:text-xs">Free Ship</p>
              </div>
              <div className="p-2 sm:p-3 bg-muted/30 rounded-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                <p className="text-[10px] sm:text-xs">Secure</p>
              </div>
              <div className="p-2 sm:p-3 bg-muted/30 rounded-lg">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                <p className="text-[10px] sm:text-xs">Quality</p>
              </div>
            </div>

            {/* Check Delivery */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FramedAcrylicCustomize;
