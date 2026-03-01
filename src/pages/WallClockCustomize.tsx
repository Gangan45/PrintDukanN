import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, ZoomIn, Star, Upload, Check, Truck, Shield, 
  Zap, Loader2, ShoppingCart, Type, Image as ImageIcon, RotateCcw, 
  Move, Minus, Plus, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const features = [
  { icon: Check, text: "Premium Quality Acrylic Material", color: "text-primary" },
  { icon: Check, text: "UV Printed with Super HD 1200x2400 DPI", color: "text-primary" },
  { icon: Truck, text: "Free Delivery On All Orders Above ₹699/-", color: "text-success" },
  { icon: Shield, text: "Never Peels Off - Even in Moisture", color: "text-success" },
];

const clockShapes = [
  { id: "circle", name: "Circle", path: "circle(50% at 50% 50%)" },
  { id: "square", name: "Square Round", path: "inset(0 round 20px)" },
  { id: "leaf", name: "Leaf", path: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  { id: "heart", name: "Heart", path: "none" },
];

// Default product values when no ID provided
const defaultProduct: Product = {
  id: "default-wall-clock",
  name: "Custom Acrylic Wall Clock",
  description: "Premium acrylic wall clock with your personalized photo",
  base_price: 999,
  images: ["https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=600&fit=crop"],
  variant_images: null,
  sizes: [
    { name: "8 inch", price: 799 },
    { name: "10 inch", price: 999 },
    { name: "12 inch", price: 1299 },
  ],
  frames: [
    { name: "Circle" },
    { name: "Square Round" },
    { name: "Heart" },
  ],
};

const WallClockCustomize = () => {
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFrame, setSelectedFrame] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [pincode, setPincode] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // For preview/canvas
  const [uploadedFileObjects, setUploadedFileObjects] = useState<File[]>([]); // For upload
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image positioning states (per image)
  const [imagePositions, setImagePositions] = useState<{ x: number; y: number }[]>([]);
  const [imageScales, setImageScales] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (id && id !== "customize") {
      loadProduct();
    } else {
      // Use default product when no ID
      setProduct(defaultProduct);
      setSelectedSize(defaultProduct.sizes[0]?.name || "");
      setSelectedFrame(defaultProduct.frames[0]?.name || "");
      setLoading(false);
    }
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    return getVariantImages(
      product.variant_images,
      product.images,
      { size: selectedSize, frame: selectedFrame }
    );
  }, [product, selectedSize, selectedFrame]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedSize, selectedFrame]);

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
        setSelectedFrame(defaultProduct.frames[0]?.name || "");
        setLoading(false);
        return;
      }
      
      const sizes = Array.isArray(data.sizes) && data.sizes.length > 0
        ? (data.sizes as unknown as ProductSize[]) 
        : defaultProduct.sizes;
      
      // Detect shape from product name to set the correct frame
      const productName = data.name?.toLowerCase() || '';
      let detectedShape = 'Circle'; // Default shape
      
      if (productName.includes('square')) {
        detectedShape = 'Square Round';
      } else if (productName.includes('hexagon')) {
        detectedShape = 'Hexagon';
      } else if (productName.includes('octagon')) {
        detectedShape = 'Octagon';
      } else if (productName.includes('star')) {
        detectedShape = 'Star';
      } else if (productName.includes('heart')) {
        detectedShape = 'Heart';
      } else if (productName.includes('leaf')) {
        detectedShape = 'Leaf';
      } else if (productName.includes('floral')) {
        detectedShape = 'Floral';
      } else if (productName.includes('triangle')) {
        detectedShape = 'Triangle';
      } else if (productName.includes('curved')) {
        detectedShape = 'Curved';
      } else if (productName.includes('collage')) {
        detectedShape = 'Square Round'; // Collage clocks are usually square
      } else if (productName.includes('circle') || productName.includes('round')) {
        detectedShape = 'Circle';
      }
      
      // Use detected shape as the only frame option for this product
      const frames: ProductFrame[] = [{ name: detectedShape }];
      const variant_images = parseVariantImages(data.variant_images);
      
      setProduct({ ...data, sizes, frames, variant_images });
      
      if (sizes.length > 0) {
        setSelectedSize(sizes[0].name);
      }
      
      // Set the frame to detected shape
      setSelectedFrame(detectedShape);
    } catch (error) {
      console.error('Error loading product:', error);
      // Use default on error
      setProduct(defaultProduct);
      setSelectedSize(defaultProduct.sizes[0]?.name || "");
      setSelectedFrame(defaultProduct.frames[0]?.name || "");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("File upload triggered, files:", files);
    
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }
    
    const totalFiles = files.length;
    let processedCount = 0;
    const newFiles: string[] = [];
    const newFileObjects: File[] = [];
    const newPositions: { x: number; y: number }[] = [];
    const newScales: number[] = [];
    
    const updateState = () => {
      console.log("Updating state with files:", newFiles.length);
      if (newFiles.length > 0) {
        setUploadedFiles(prev => {
          const updated = [...prev, ...newFiles];
          console.log("Updated uploadedFiles:", updated.length);
          // Set activeImageIndex to first new image (prev.length is the index of first new file)
          setActiveImageIndex(prev.length);
          return updated;
        });
        setUploadedFileObjects(prev => [...prev, ...newFileObjects]);
        setImagePositions(prev => [...prev, ...newPositions]);
        setImageScales(prev => [...prev, ...newScales]);
        toast({
          title: `${newFiles.length} Photo(s) Uploaded!`,
          description: "Position your photos in the clock preview",
        });
      }
    };
    
    Array.from(files).forEach((file, index) => {
      console.log(`Processing file ${index + 1}:`, file.name, file.size);
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB and was skipped`,
          variant: "destructive",
        });
        processedCount++;
        if (processedCount === totalFiles) {
          updateState();
        }
        return;
      }
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        console.log(`File ${index + 1} loaded successfully`);
        const result = reader.result as string;
        if (result) {
          newFiles.push(result);
          newFileObjects.push(file);
          newPositions.push({ x: 0, y: 0 });
          newScales.push(1);
        }
        processedCount++;
        
        if (processedCount === totalFiles) {
          updateState();
        }
      };
      
      reader.onerror = () => {
        console.error(`Error reading file ${file.name}:`, reader.error);
        toast({
          title: "Error reading file",
          description: `Could not read ${file.name}`,
          variant: "destructive",
        });
        processedCount++;
        if (processedCount === totalFiles) {
          updateState();
        }
      };
      
      reader.readAsDataURL(file);
    });
    
    // Reset input to allow re-uploading same file
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePositions(prev => prev.filter((_, i) => i !== index));
    setImageScales(prev => prev.filter((_, i) => i !== index));
    if (activeImageIndex >= index && activeImageIndex > 0) {
      setActiveImageIndex(prev => prev - 1);
    }
  };

  const currentPosition = imagePositions[activeImageIndex] || { x: 0, y: 0 };
  const currentScale = imageScales[activeImageIndex] || 1;
  const activeImage = uploadedFiles[activeImageIndex];
  
  // Debug log
  console.log("Image state:", { 
    uploadedFilesCount: uploadedFiles.length, 
    activeImageIndex, 
    hasActiveImage: !!activeImage,
    activeImageLength: activeImage?.length || 0
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!activeImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - currentPosition.x, y: e.clientY - currentPosition.y });
  }, [activeImage, currentPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setImagePositions(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      return updated;
    });
  }, [isDragging, dragStart, activeImageIndex]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => {
    setImageScales(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = Math.min((updated[activeImageIndex] || 1) + 0.1, 3);
      return updated;
    });
  };

  const handleZoomOut = () => {
    setImageScales(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = Math.max((updated[activeImageIndex] || 1) - 0.1, 0.5);
      return updated;
    });
  };

  const handleReset = () => {
    setImagePositions(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = { x: 0, y: 0 };
      return updated;
    });
    setImageScales(prev => {
      const updated = [...prev];
      updated[activeImageIndex] = 1;
      return updated;
    });
  };

  const getClockShape = () => {
    const frameName = selectedFrame.toLowerCase();

    // High-fidelity shapes via SVG clipPath
    if (frameName.includes("leaf")) return "url(#wc-clip-leaf)";
    if (frameName.includes("heart")) return "url(#wc-clip-heart)";
    if (frameName.includes("curved")) return "url(#wc-clip-curved)";

    // Polygon/inset shapes
    if (frameName.includes("square")) return "inset(0 round 24px)";
    if (frameName.includes("hexagon")) return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
    if (frameName.includes("octagon")) return "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";
    if (frameName.includes("star")) return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
    if (frameName.includes("floral")) return "polygon(50% 0%, 65% 15%, 85% 10%, 80% 30%, 100% 50%, 80% 70%, 85% 90%, 65% 85%, 50% 100%, 35% 85%, 15% 90%, 20% 70%, 0% 50%, 20% 30%, 15% 10%, 35% 15%)";
    if (frameName.includes("triangle")) return "polygon(50% 0%, 100% 100%, 0% 100%)";
    if (frameName.includes("circle") || frameName.includes("round")) return "circle(50% at 50% 50%)";
    if (frameName.includes("symmetrical")) return "circle(50% at 50% 50%)";

    return "circle(50% at 50% 50%)";
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

  if (!product) {
    return null;
  }

  const selectedSizeObj = product.sizes.find(s => s.name === selectedSize);
  const currentPrice = selectedSizeObj?.price || product.base_price;
  const originalPrice = Math.round(currentPrice * 1.2);
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Photo Required",
        description: "Please upload at least one photo for your wall clock",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await addToCart({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: currentPrice,
        selectedSize: selectedSize,
        selectedFrame: selectedFrame,
        customImageUrl: uploadedFileObjects[0] || undefined,
        customText: customText || undefined,
        category: "wall-clocks",
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
    if (uploadedFiles.length === 0) {
      toast({
        title: "Photo Required",
        description: "Please upload at least one photo for your wall clock",
        variant: "destructive",
      });
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
        selectedSize: selectedSize,
        selectedFrame: selectedFrame,
        customImageUrl: uploadedFileObjects[0] || undefined,
        customText: customText || undefined,
        category: "wall-clocks",
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
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto">
          <a href="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</a>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          <a href="/category/wall-clocks" className="hover:text-primary transition-colors whitespace-nowrap">Wall Clocks</a>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-foreground font-medium whitespace-nowrap">Customize</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12">
          
          {/* Clock Preview */}
          <div className="space-y-3 sm:space-y-4">
            {/* Tabs for Image/Text */}
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4 h-10 sm:h-11">
                <TabsTrigger value="image" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Photo
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Add Text
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image" className="space-y-3 sm:space-y-4">
                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="wall-clock-file-upload"
                />
                <Button 
                  size="lg" 
                  className="w-full h-11 sm:h-14 text-sm sm:text-base font-semibold gap-2 sm:gap-3 bg-primary hover:bg-primary/90 shadow-glow"
                  onClick={() => {
                    console.log("Upload button clicked, fileInputRef:", fileInputRef.current);
                    fileInputRef.current?.click();
                  }}
                  type="button"
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  {uploadedFiles.length > 0 ? `Add More Photos (${uploadedFiles.length})` : "Select Photos"}
                </Button>
                
                {/* Uploaded Images Thumbnails */}
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                          activeImageIndex === index ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img src={file} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                          className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-destructive text-destructive-foreground rounded-bl-lg flex items-center justify-center text-[10px] sm:text-xs hover:bg-destructive/90"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                <Textarea 
                  placeholder="Add custom text to appear on your clock..." 
                  value={customText} 
                  onChange={(e) => setCustomText(e.target.value)} 
                  className="resize-none" 
                  rows={3} 
                />
              </TabsContent>
            </Tabs>

            {/* Clock Preview Area */}
            <div 
              className="relative aspect-square bg-muted rounded-xl overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* SVG clipPaths for complex shapes (leaf/heart/curved) */}
              <svg width="0" height="0" className="absolute">
                <defs>
                  <clipPath id="wc-clip-leaf" clipPathUnits="objectBoundingBox">
                    <path d="M0.50,0.03 C0.68,0.10 0.86,0.28 0.93,0.50 C0.86,0.76 0.68,0.94 0.50,0.99 C0.32,0.94 0.14,0.76 0.07,0.50 C0.14,0.28 0.32,0.10 0.50,0.03 Z" />
                  </clipPath>
                  <clipPath id="wc-clip-heart" clipPathUnits="objectBoundingBox">
                    <path d="M0.50,0.95 C0.20,0.72 0.08,0.50 0.16,0.34 C0.22,0.20 0.34,0.18 0.50,0.30 C0.66,0.18 0.78,0.20 0.84,0.34 C0.92,0.50 0.80,0.72 0.50,0.95 Z" />
                  </clipPath>
                  <clipPath id="wc-clip-curved" clipPathUnits="objectBoundingBox">
                    <path d="M0.50,0.02 C0.74,0.06 0.92,0.26 0.98,0.50 C0.92,0.78 0.74,0.94 0.50,0.98 C0.26,0.94 0.08,0.78 0.02,0.50 C0.08,0.26 0.26,0.06 0.50,0.02 Z" />
                  </clipPath>
                </defs>
              </svg>
              {/* User's uploaded image */}
              {activeImage && activeImage.length > 0 ? (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: getClockShape(),
                    WebkitClipPath: getClockShape(),
                  }}
                >
                  <img
                    src={activeImage}
                    alt="Your photo"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      transform: `translate(${currentPosition.x}px, ${currentPosition.y}px) scale(${currentScale})`,
                      transition: isDragging ? 'none' : 'transform 0.1s ease',
                      transformOrigin: 'center center',
                    }}
                    draggable={false}
                    onError={(e) => {
                      console.error('Image failed to load:', activeImage?.substring(0, 100));
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-muted-foreground/10"
                  style={{
                    clipPath: getClockShape(),
                    WebkitClipPath: getClockShape(),
                  }}
                >
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">Select Photos</p>
                    <p className="text-sm text-muted-foreground/70">Click the button above</p>
                  </div>
                </div>
              )}

              {/* Clock numbers overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full">
                  <span className="absolute top-[8%] left-1/2 -translate-x-1/2 text-foreground font-bold text-xl drop-shadow-lg">12</span>
                  <span className="absolute top-[15%] right-[15%] text-foreground font-bold text-lg drop-shadow-lg">1</span>
                  <span className="absolute top-[30%] right-[8%] text-foreground font-bold text-lg drop-shadow-lg">2</span>
                  <span className="absolute top-1/2 right-[5%] -translate-y-1/2 text-foreground font-bold text-xl drop-shadow-lg">3</span>
                  <span className="absolute bottom-[30%] right-[8%] text-foreground font-bold text-lg drop-shadow-lg">4</span>
                  <span className="absolute bottom-[15%] right-[15%] text-foreground font-bold text-lg drop-shadow-lg">5</span>
                  <span className="absolute bottom-[8%] left-1/2 -translate-x-1/2 text-foreground font-bold text-xl drop-shadow-lg">6</span>
                  <span className="absolute bottom-[15%] left-[15%] text-foreground font-bold text-lg drop-shadow-lg">7</span>
                  <span className="absolute bottom-[30%] left-[8%] text-foreground font-bold text-lg drop-shadow-lg">8</span>
                  <span className="absolute top-1/2 left-[5%] -translate-y-1/2 text-foreground font-bold text-xl drop-shadow-lg">9</span>
                  <span className="absolute top-[30%] left-[8%] text-foreground font-bold text-lg drop-shadow-lg">10</span>
                  <span className="absolute top-[15%] left-[15%] text-foreground font-bold text-lg drop-shadow-lg">11</span>
                  
                  {/* Clock hands */}
                  <div className="absolute top-1/2 left-1/2 w-1 h-1/4 bg-foreground origin-bottom -translate-x-1/2 -translate-y-full rotate-[30deg] rounded-full" />
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-1/3 bg-foreground origin-bottom -translate-x-1/2 -translate-y-full rotate-[-60deg] rounded-full" />
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              
              {/* Custom Text Overlay */}
              {customText && (
                <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-foreground font-semibold text-sm bg-background/70 px-3 py-1 rounded-full backdrop-blur-sm">
                  {customText}
                </div>
              )}
            </div>

            {/* Image Controls */}
            {activeImage && (
              <div className="flex items-center justify-center gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl flex-wrap">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8 sm:h-10 sm:w-10">
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground min-w-[50px] sm:min-w-[60px] text-center">
                    {Math.round(currentScale * 100)}%
                  </span>
                  <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8 sm:h-10 sm:w-10">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <div className="w-px h-5 sm:h-6 bg-border hidden sm:block" />
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3">
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Reset
                </Button>
                <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Move className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Drag to position</span>
                </div>
              </div>
            )}

            {/* Product Images Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      selectedIndex === index
                        ? "border-primary shadow-glow"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", i < 4 ? "fill-primary text-primary" : "fill-primary/30 text-primary/30")} />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">4.5</span>
                <span className="text-xs sm:text-sm text-muted-foreground">(256 Reviews)</span>
              </div>
              {product.description && (
                <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">{product.description}</p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-muted-foreground line-through text-sm sm:text-lg">₹{originalPrice.toLocaleString()}</span>
                <span className="text-2xl sm:text-3xl font-heading font-bold text-foreground">₹{currentPrice.toLocaleString()}</span>
                <span className="bg-success text-success-foreground text-xs sm:text-sm font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">SAVE {discount}%</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">Inclusive of All Taxes</p>
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">
                  ACRYLIC SIZE: <span className="text-muted-foreground font-normal">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.sizes.map((size) => (
                    <button 
                      key={size.name} 
                      onClick={() => setSelectedSize(size.name)} 
                      className={cn(
                        "px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border-2 transition-all duration-200", 
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

            {/* Shape/Frame Info */}
            {product.frames.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">
                  CLOCK SHAPE: <span className="text-muted-foreground font-normal uppercase">{selectedFrame}</span>
                </p>
              </div>
            )}
            {/* Free Keys Highlight Banner */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-2xl p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
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
      </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full h-12 sm:h-14 text-base font-semibold gap-2 border-2 border-foreground text-foreground hover:bg-foreground hover:text-primary-foreground"
                onClick={handleAddToCart}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                Add to Cart
              </Button>
              <Button 
                size="lg" 
                className="w-full h-12 sm:h-14 text-base font-semibold gap-2 bg-primary hover:bg-primary/90 shadow-glow"
                onClick={handleBuyNow}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}
                Buy Now
              </Button>
            </div>

            {/* WhatsApp Contact */}
            <Button
              variant="outline"
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
              onClick={() => {
                const message = encodeURIComponent(
                  `Hi! I'm interested in Acrylic Wall Clock.\n\nDetails:\n- Size: ${selectedSize}\n- Shape: ${selectedFrame}\n- Price: ₹${currentPrice}`
                );
                window.open(`https://wa.me/918518851767?text=${message}`, "_blank");
              }}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Contact on WhatsApp
            </Button>

            

            {/* Features */}
            <div className="space-y-2 sm:space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-muted shrink-0", feature.color)}>
                    <feature.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Product Details */}
            <div className="border-t border-border pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base text-foreground">Why PrintDukan Acrylic Wall Clock?</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Unidirectional pixel perfect</strong> direct printing on Acrylic</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Super HD print</strong> output 1200×2400 DPI</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                  <span>Acrylic <strong>Chemical treatment</strong> before printing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Never peel off</strong>, Even Moisture Environment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                  <span><strong>Same Day Processing</strong> of orders</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews and Related Products */}
      <div className="container mx-auto px-3 sm:px-4">
        <ReviewsAndSuggestions 
          productId={id || "default-wall-clock"} 
          category="Wall Clocks" 
        />
      </div>

      <Footer />
    </div>
  );
};

export default WallClockCustomize;
