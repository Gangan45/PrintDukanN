import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ChevronLeft,
  Upload,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  ShoppingCart,
  Image as ImageIcon,
  Info,
  Loader2,
  Check,
  ArrowRight,
  Crop,
  Lock,
  Unlock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { supabase } from "@/integrations/supabase/client";
import { getVariantImages, parseVariantImages } from "@/lib/variantImages";

// Design templates for different product types
const designTemplates = {
  portrait: {
    id: "portrait",
    label: "Portrait",
    aspectRatio: 3 / 4,
    mockupStyle: "portrait-frame",
  },
  landscape: {
    id: "landscape",
    label: "Landscape",
    aspectRatio: 4 / 3,
    mockupStyle: "landscape-frame",
  },
  square: {
    id: "square",
    label: "Square",
    aspectRatio: 1,
    mockupStyle: "square-frame",
  },
  "dual-border": {
    id: "dual-border",
    label: "Dual Border",
    aspectRatio: 3 / 4,
    mockupStyle: "dual-border-frame",
  },
  collage: {
    id: "collage",
    label: "Collage",
    aspectRatio: 1,
    mockupStyle: "collage-frame",
  },
};

// Fixed frame colors for Premium Acrylic Wall Photo category
const premiumAcrylicFrameColors = [
  { id: "red", label: "Red", price: 0 },
  { id: "silver", label: "Silver", price: 0 },
  { id: "golden", label: "Golden", price: 0 },
  { id: "purple", label: "Purple", price: 0 },
  { id: "yellow", label: "Yellow", price: 0 },
  { id: "blue", label: "Blue", price: 0 },
];
// Acrylic thickness options
const thicknessOptions = [
  { id: "3mm", label: "3mm", price: 0 },
  { id: "5mm", label: "5mm", price: 100 },
  { id: "8mm", label: "8mm", price: 200 },
];

const customizableProducts: Record<string, {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  description: string;
  sizes: { id: string; label: string; dimensions: string; price: number }[];
  frameOptions: { id: string; label: string; price: number }[];
  previewAspectRatio: number;
}>
  = {
  "1": {
    id: "1",
    name: "Portrait Acrylic Wall Photo",
    basePrice: 1299,
    category: "Acrylic Wall Photo",
    description: "Premium crystal-clear acrylic print with vibrant colors",
    sizes: [
      { id: "8x12", label: "8×12 inch", dimensions: "8x12", price: 1299 },
      { id: "12x18", label: "12×18 inch", dimensions: "12x18", price: 1799 },
      { id: "16x24", label: "16×24 inch", dimensions: "16x24", price: 2499 },
      { id: "20x30", label: "20×30 inch", dimensions: "20x30", price: 3299 },
    ],
    frameOptions: [
      { id: "none", label: "No Frame", price: 0 },
      { id: "black", label: "Black Frame", price: 299 },
      { id: "white", label: "White Frame", price: 299 },
      { id: "gold", label: "Gold Frame", price: 499 },
    ],
    previewAspectRatio: 3 / 4,
  },
  "2": {
    id: "2",
    name: "Landscape Acrylic Wall Photo",
    basePrice: 1399,
    category: "Acrylic Wall Photo",
    description: "Premium crystal-clear acrylic print in landscape orientation",
    sizes: [
      { id: "12x8", label: "12×8 inch", dimensions: "12x8", price: 1399 },
      { id: "18x12", label: "18×12 inch", dimensions: "18x12", price: 1899 },
      { id: "24x16", label: "24×16 inch", dimensions: "24x16", price: 2599 },
      { id: "30x20", label: "30×20 inch", dimensions: "30x20", price: 3499 },
    ],
    frameOptions: [
      { id: "none", label: "No Frame", price: 0 },
      { id: "black", label: "Black Frame", price: 299 },
      { id: "white", label: "White Frame", price: 299 },
      { id: "wood", label: "Wood Frame", price: 599 },
    ],
    previewAspectRatio: 4 / 3,
  },
  "3": {
    id: "3",
    name: "Square Acrylic Photo Frame",
    basePrice: 999,
    category: "Acrylic Wall Photo",
    description: "Perfect square format for Instagram-style prints",
    sizes: [
      { id: "8x8", label: "8×8 inch", dimensions: "8x8", price: 999 },
      { id: "12x12", label: "12×12 inch", dimensions: "12x12", price: 1499 },
      { id: "16x16", label: "16×16 inch", dimensions: "16x16", price: 1999 },
      { id: "20x20", label: "20×20 inch", dimensions: "20x20", price: 2699 },
    ],
    frameOptions: [
      { id: "none", label: "No Frame", price: 0 },
      { id: "black", label: "Black Frame", price: 249 },
      { id: "white", label: "White Frame", price: 249 },
    ],
    previewAspectRatio: 1,
  },
};

// Default product for any ID not in our list
const defaultProduct = {
  id: "default",
  name: "Custom Acrylic Photo",
  basePrice: 1299,
  category: "Acrylic",
  description: "Premium quality acrylic photo print",
  sizes: [
    { id: "small", label: "Small (8×10)", dimensions: "8x10", price: 1299 },
    { id: "medium", label: "Medium (12×16)", dimensions: "12x16", price: 1799 },
    { id: "large", label: "Large (16×20)", dimensions: "16x20", price: 2499 },
  ],
  frameOptions: [
    { id: "none", label: "No Frame", price: 0 },
    { id: "black", label: "Black Frame", price: 299 },
    { id: "white", label: "White Frame", price: 299 },
  ],
  previewAspectRatio: 4 / 5,
};

const ProductCustomize = () => {
  const { id } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // For canvas/preview
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null); // For upload
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: string; name: string } | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFrame, setSelectedFrame] = useState<string>("none");
  const [selectedThickness, setSelectedThickness] = useState<string>("3mm");
  const [selectedDesign, setSelectedDesign] = useState<string>("portrait");
  const [isDragging, setIsDragging] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<"design" | "upload" | "preview">("design");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  // Collage images state - 4 slots for 2x2 grid
  const [collageImages, setCollageImages] = useState<(string | null)[]>([null, null, null, null]);
  const [_activeCollageSlot, setActiveCollageSlot] = useState<number>(0);
  const { addToCart, loading: cartLoading } = useCart();
  const { buyNow, loading: buyNowLoading } = useBuyNow();

  // Fetch product from database if UUID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      // Check if id is a UUID
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

  // Use DB product or fallback to static
  const staticProduct = id && customizableProducts[id] ? customizableProducts[id] : defaultProduct;

  // Parse variant images from database product
  const dbVariantImages = dbProduct ? parseVariantImages(dbProduct.variant_images) : {};
  const dbBaseImages = dbProduct?.images || [];

  // Check if product is Premium Acrylic Wall Photo category
  const isPremiumAcrylicWallPhoto = dbProduct?.category?.toLowerCase().includes('premium acrylic wall photo') ||
    dbProduct?.name?.toLowerCase().includes('premium acrylic wall photo');

  const product = dbProduct ? {
    id: dbProduct.id,
    name: dbProduct.name,
    basePrice: dbProduct.base_price,
    category: dbProduct.category,
    description: dbProduct.description || '',
    sizes: (dbProduct.sizes || []).map((s: any) => ({
      id: s.name,
      label: s.name,
      dimensions: s.name,
      price: dbProduct.base_price + (s.price || 0)
    })),
    // Use fixed colors for Premium Acrylic Wall Photo, otherwise use DB frames
    frameOptions: isPremiumAcrylicWallPhoto
      ? premiumAcrylicFrameColors
      : (dbProduct.frames || []).map((f: any) => ({
        id: f.name.toLowerCase().replace(/\s/g, '-'),
        label: f.name,
        price: f.price || 0
      })),
    previewAspectRatio: 4 / 5
  } : staticProduct;

  // Get current design template
  const currentDesignTemplate = designTemplates[selectedDesign as keyof typeof designTemplates] || designTemplates.portrait;

  // Get variant-specific images based on current selection
  const variantImages = useMemo(() => {
    if (dbProduct) {
      return getVariantImages(dbVariantImages, dbBaseImages, {
        size: selectedSize,
        frame: selectedFrame
      });
    }
    return [];
  }, [dbProduct, dbVariantImages, dbBaseImages, selectedSize, selectedFrame]);

  // Initialize size on mount
  useEffect(() => {
    if (product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0].id);
    }
  }, [product.sizes, selectedSize]);

  // Detect design type from product ID
  useEffect(() => {
    if (id) {
      // Map product IDs to design types
      const designMap: Record<string, string> = {
        "wp-1": "portrait",
        "wp-2": "dual-border",
        "wp-3": "landscape",
        "wp-4": "square",
        "wp-5": "portrait",
        "wp-6": "portrait",
        "wp-7": "collage",
        "wp-8": "portrait",
        "cp-1": "cutout",
        "cp-2": "landscape",
        "cp-3": "square",
        "cp-4": "cutout",
        "1": "portrait",
        "2": "landscape",
        "3": "square",
      };
      if (designMap[id]) {
        setSelectedDesign(designMap[id]);
      }
    }
  }, [id]);

  // Function to load image to canvas (defined first to be used in useEffect)
  const loadImageToCanvas = useCallback(async (dataUrl: string, canvas: FabricCanvas) => {
    canvas.clear();
    canvas.backgroundColor = "#f5f5f5";

    // Enable clipping to ensure image stays within canvas bounds
    canvas.clipPath = undefined;

    try {
      const img = await FabricImage.fromURL(dataUrl);

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = img.width || 100;
      const imgHeight = img.height || 100;

      // Calculate scale to cover the entire canvas (no gaps)
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      // Use Math.max to ensure the image covers the entire frame
      // Add a small buffer (1.02) to ensure complete coverage
      const scale = Math.max(scaleX, scaleY) * 1.02;

      img.scale(scale);
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: "center",
        originY: "center",
        // Disable all interaction - allow page scroll
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        selectable: false,
        evented: false,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      setImageScale(scale);
      setImageRotation(0);
      setIsProcessingImage(false);
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Error loading image:", error);
      toast.error("Failed to load image");
      setIsProcessingImage(false);
    }
  }, []);

  // Initialize Fabric canvas based on design template
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || currentStep !== "upload") return;

    const containerWidth = containerRef.current.clientWidth;
    const canvasWidth = Math.min(containerWidth, 500);
    const canvasHeight = canvasWidth / currentDesignTemplate.aspectRatio;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#f5f5f5",
      selection: false,
      allowTouchScrolling: true,
    });

    setFabricCanvas(canvas);

    // If there's an uploaded image waiting to be placed on canvas
    if (uploadedImage) {
      loadImageToCanvas(uploadedImage, canvas);
    }

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, [currentDesignTemplate.aspectRatio, currentStep, uploadedImage, loadImageToCanvas]);

  // Load pending image when canvas becomes available
  useEffect(() => {
    if (fabricCanvas && pendingImage) {
      loadImageToCanvas(pendingImage, fabricCanvas);
      setPendingImage(null);
    }
  }, [fabricCanvas, pendingImage, loadImageToCanvas]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle image upload to canvas
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
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        width: img.width,
        height: img.height,
        size: formatFileSize(file.size),
        name: file.name
      });
    };

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      // Load image to get dimensions
      img.src = dataUrl;

      // Show preview thumbnail immediately
      setPreviewThumbnail(dataUrl);
      setUploadedImage(dataUrl);

      // If canvas not ready, set pending image
      if (!fabricCanvas) {
        setPendingImage(dataUrl);
        toast.success("Photo selected! Preparing canvas...");
        return;
      }

      // Load to canvas
      await loadImageToCanvas(dataUrl, fabricCanvas);
    };
    reader.readAsDataURL(file);
  }, [fabricCanvas, loadImageToCanvas]);

  // Handle collage image upload for specific slot
  const handleCollageImageUpload = useCallback(async (file: File, slotIndex: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCollageImages(prev => {
        const newImages = [...prev];
        newImages[slotIndex] = dataUrl;
        return newImages;
      });
      toast.success(`Photo ${slotIndex + 1} uploaded!`);
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove collage image from slot
  const handleRemoveCollageImage = (slotIndex: number) => {
    setCollageImages(prev => {
      const newImages = [...prev];
      newImages[slotIndex] = null;
      return newImages;
    });
  };

  // Check if collage has at least one image
  const hasCollageImages = collageImages.some(img => img !== null);

  // Handle continue to preview
  const handleContinueToPreview = () => {
    if (selectedDesign === "collage") {
      if (!hasCollageImages) {
        toast.error("Please upload at least one photo for collage");
        return;
      }
    } else if (!uploadedImage) {
      toast.error("Please upload a photo first");
      return;
    }
    setCurrentStep("preview");
  };

  // Handle back to upload
  const handleBackToUpload = () => {
    setCurrentStep("upload");
  };

  // Handle continue to upload from design selection
  const handleContinueToUpload = () => {
    setCurrentStep("upload");
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  // Image controls
  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const currentScale = activeObject.scaleX || 1;
      activeObject.scale(currentScale * 1.1);
      setImageScale(currentScale * 1.1);
      fabricCanvas.renderAll();
    }
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const currentScale = activeObject.scaleX || 1;
      activeObject.scale(currentScale * 0.9);
      setImageScale(currentScale * 0.9);
      fabricCanvas.renderAll();
    }
  };

  const handleRotate = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.rotate(currentAngle + 90);
      setImageRotation(currentAngle + 90);
      fabricCanvas.renderAll();
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f5f5f5";
    fabricCanvas.renderAll();
    setUploadedImage(null);
    setUploadedImageFile(null);
    setPreviewThumbnail(null);
    setImageInfo(null);
    setImageScale(1);
    setImageRotation(0);
    setIsCropMode(false);
  };

  // Toggle crop mode with aspect ratio lock
  const handleToggleCropMode = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();

    if (activeObject) {
      if (!isCropMode) {
        // Enable crop mode - lock aspect ratio based on design template
        if (aspectRatioLocked) {
          activeObject.set({
            lockUniScaling: true,
          });
        }
        toast.info("Crop mode enabled. Resize handles will maintain aspect ratio.");
      } else {
        activeObject.set({
          lockUniScaling: false,
        });
        toast.info("Crop mode disabled.");
      }
      fabricCanvas.renderAll();
    }
    setIsCropMode(!isCropMode);
  };

  // Toggle aspect ratio lock
  const handleToggleAspectRatioLock = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();

    if (activeObject) {
      activeObject.set({
        lockUniScaling: !aspectRatioLocked,
      });
      fabricCanvas.renderAll();
    }
    setAspectRatioLocked(!aspectRatioLocked);
    toast.info(aspectRatioLocked ? "Aspect ratio unlocked" : "Aspect ratio locked");
  };

  // Calculate total price
  const selectedSizeData = product.sizes.find(s => s.id === selectedSize);
  const selectedFrameData = product.frameOptions.find(f => f.id === selectedFrame);
  const selectedThicknessData = thicknessOptions.find(t => t.id === selectedThickness);
  
  // Check if category is Acrylic Wall Photo (show thickness option)
  const isAcrylicWallPhoto = product.category?.toLowerCase().includes('acrylic wall photo') ||
    product.category?.toLowerCase().includes('acrylic') ||
    product.name?.toLowerCase().includes('acrylic');
  
  const thicknessPrice = isAcrylicWallPhoto ? (selectedThicknessData?.price || 0) : 0;
  const totalPrice = (selectedSizeData?.price || product.basePrice) + (selectedFrameData?.price || 0) + thicknessPrice;

  const handleAddToCart = async () => {
    const frameLabel = isAcrylicWallPhoto && selectedThicknessData
      ? `${selectedFrameData?.label || 'No Frame'} | Thickness: ${selectedThicknessData.label}`
      : selectedFrameData?.label;

    const result = await addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      selectedSize: selectedSizeData?.label,
      selectedFrame: frameLabel,
      customImageUrl: uploadedImageFile || undefined,
      unitPrice: totalPrice,
      category: product.category,
    });

    if (result) {
      toast.success("Added to cart!", {
        description: `${product.name} - ${selectedSizeData?.label} with ${selectedFrameData?.label}`,
      });
    }
  };

  const handleBuyNow = async () => {
    const frameLabel = isAcrylicWallPhoto && selectedThicknessData
      ? `${selectedFrameData?.label || 'No Frame'} | Thickness: ${selectedThicknessData.label}`
      : selectedFrameData?.label;

    await buyNow({
      productId: product.id,
      productName: product.name,
      productImage: uploadedImage || product.sizes[0]?.id || '',
      price: totalPrice,
      selectedSize: selectedSizeData?.label,
      selectedFrame: frameLabel,
      customImageUrl: uploadedImageFile || undefined,
      category: product.category,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <Link to="/category/acrylic" className="hover:text-primary transition-colors">Acrylic</Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-foreground font-medium">Customise</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between md:justify-center gap-2 md:gap-4 mb-6 md:mb-8 overflow-x-auto pb-2">
          <div className={cn(
            "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
            currentStep === "design" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-background/20 flex items-center justify-center text-[10px] md:text-xs">1</span>
            <span className="hidden sm:inline">Select</span> Design
          </div>
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
          <div className={cn(
            "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
            currentStep === "upload" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-background/20 flex items-center justify-center text-[10px] md:text-xs">2</span>
            <span className="hidden sm:inline">Upload</span> Photo
          </div>
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
          <div className={cn(
            "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
            currentStep === "preview" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-background/20 flex items-center justify-center text-[10px] md:text-xs">3</span>
            Preview<span className="hidden sm:inline"> & Order</span>
          </div>
        </div>

        {/* Step 1: Design Selection */}
        {currentStep === "design" && (
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="text-center px-2">
              <h1 className="text-xl md:text-3xl font-display font-bold text-foreground mb-2">
                Choose Your Design Style
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Select the perfect design template for your acrylic photo
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {Object.values(designTemplates).map((design) => (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesign(design.id)}
                  className={cn(
                    "relative p-3 md:p-4 border-2 rounded-xl transition-all duration-300 text-left",
                    selectedDesign === design.id
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {/* Design Preview */}
                  <div className={cn(
                    "relative mx-auto mb-3 md:mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden",
                    design.aspectRatio === 1 && "w-16 h-16 md:w-24 md:h-24",
                    design.aspectRatio === 3 / 4 && "w-14 h-20 md:w-20 md:h-28",
                    design.aspectRatio === 4 / 3 && "w-20 h-14 md:w-28 md:h-20",
                    design.id === "cutout" ? "rounded-full" : "rounded-lg"
                  )}>
                    {/* Photo placeholder */}
                    <div className={cn(
                      "absolute inset-2 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center",
                      design.id === "cutout" ? "rounded-full" : "rounded"
                    )}>
                      <ImageIcon className="w-6 h-6 text-primary/50" />
                    </div>

                    {/* Design-specific overlays */}
                    {design.id === "dual-border" && (
                      <div className="absolute inset-1 border-2 border-primary/40 rounded pointer-events-none" />
                    )}

                    {design.id === "cutout" && (
                      <div className="absolute inset-0 rounded-full border-3 border-primary/40 pointer-events-none" />
                    )}

                    {design.id === "collage" && (
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-1 pointer-events-none">
                        <div className="border border-primary/30 rounded-sm bg-primary/5" />
                        <div className="border border-primary/30 rounded-sm bg-primary/10" />
                        <div className="border border-primary/30 rounded-sm bg-primary/10" />
                        <div className="border border-primary/30 rounded-sm bg-primary/5" />
                      </div>
                    )}

                    {design.id === "portrait" && (
                      <div className="absolute inset-1 border border-primary/30 rounded pointer-events-none" />
                    )}

                    {design.id === "landscape" && (
                      <div className="absolute inset-1 border border-primary/30 rounded pointer-events-none" />
                    )}

                    {design.id === "square" && (
                      <div className="absolute inset-1 border border-primary/30 pointer-events-none" />
                    )}
                  </div>

                  <div className="text-center">
                    <p className="font-medium text-foreground text-sm md:text-base">{design.label}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                      {design.aspectRatio === 1 ? "1:1" : design.aspectRatio === 3 / 4 ? "3:4" : "4:3"} ratio
                    </p>
                  </div>

                  {/* Selected checkmark */}
                  {selectedDesign === design.id && (
                    <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center px-4">
              <Button size="lg" onClick={handleContinueToUpload} className="w-full md:w-auto px-12">
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Photo */}
        {currentStep === "upload" && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Canvas Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep("design")} className="h-8 w-8 p-0 md:h-9 md:w-auto md:px-3">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-lg md:text-2xl font-display font-bold text-foreground">
                    Upload Your Photo
                  </h1>
                </div>
                <Badge variant="secondary" className="text-xs md:text-sm">{currentDesignTemplate.label}</Badge>
              </div>

              {/* Upload Area / Canvas */}
              <div
                ref={containerRef}
                className={cn(
                  "relative border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  !uploadedImage && "cursor-pointer hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Frame Preview Overlay */}
                {selectedFrame !== "none" && selectedFrame !== "no-frame" && uploadedImage && (
                  <div
                    className={cn(
                      "absolute inset-0 pointer-events-none z-10 border-[12px]",
                      (selectedFrame === "black" || selectedFrame.toLowerCase().includes("black")) && "border-gray-900",
                      (selectedFrame === "white" || selectedFrame.toLowerCase().includes("white")) && "border-white shadow-inner",
                      (selectedFrame === "gold" || selectedFrame === "golden" || selectedFrame.toLowerCase().includes("gold")) && "border-amber-500",
                      (selectedFrame === "wood" || selectedFrame.toLowerCase().includes("wood")) && "border-amber-800",
                      (selectedFrame === "red" || selectedFrame.toLowerCase().includes("red")) && "border-red-600",
                      (selectedFrame === "silver" || selectedFrame.toLowerCase().includes("silver")) && "border-gray-400",
                      (selectedFrame === "purple" || selectedFrame.toLowerCase().includes("purple")) && "border-purple-600",
                      (selectedFrame === "yellow" || selectedFrame.toLowerCase().includes("yellow")) && "border-yellow-500",
                      (selectedFrame === "blue" || selectedFrame.toLowerCase().includes("blue")) && "border-blue-600"
                    )}
                  />
                )}

                {/* Design-specific overlays */}
                {uploadedImage && (
                  <>
                    {/* Dual border overlay */}
                    {selectedDesign === "dual-border" && (
                      <div className="absolute inset-4 border-4 border-primary/50 pointer-events-none z-10 rounded" />
                    )}

                    {/* Cutout circular overlay */}
                    {selectedDesign === "cutout" && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute inset-0 bg-background" style={{
                          maskImage: 'radial-gradient(circle at center, transparent 45%, black 45%)',
                          WebkitMaskImage: 'radial-gradient(circle at center, transparent 45%, black 45%)',
                        }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[90%] h-[90%] rounded-full border-4 border-primary/30" style={{ maxWidth: '90%', maxHeight: '90%' }} />
                        </div>
                      </div>
                    )}

                    {/* Collage grid overlay */}
                    {selectedDesign === "collage" && (
                      <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-2 grid-rows-2 gap-1 p-2">
                        <div className="border-2 border-primary/20 rounded" />
                        <div className="border-2 border-primary/20 rounded" />
                        <div className="border-2 border-primary/20 rounded" />
                        <div className="border-2 border-primary/20 rounded" />
                      </div>
                    )}

                    {/* Portrait elegant border */}
                    {selectedDesign === "portrait" && selectedFrame === "none" && (
                      <div className="absolute inset-0 pointer-events-none z-10 border-2 border-primary/20 m-2 rounded" />
                    )}

                    {/* Landscape elegant border */}
                    {selectedDesign === "landscape" && selectedFrame === "none" && (
                      <div className="absolute inset-0 pointer-events-none z-10 border-2 border-primary/20 m-2 rounded" />
                    )}

                    {/* Square minimal border */}
                    {selectedDesign === "square" && selectedFrame === "none" && (
                      <div className="absolute inset-0 pointer-events-none z-10 border-2 border-primary/20 m-2" />
                    )}
                  </>
                )}

                {/* Collage Design - Multi Image Upload */}
                {selectedDesign === "collage" ? (
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 p-4 aspect-square">
                    {collageImages.map((img, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative border-2 border-dashed rounded-lg overflow-hidden transition-all",
                          img ? "border-primary bg-black" : "border-border hover:border-primary/50 bg-muted/50",
                          index === 0 && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        {img ? (
                          <>
                            <img
                              src={img}
                              alt={`Collage photo ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemoveCollageImage(index)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 hover:opacity-100 transition-opacity z-10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity bg-black/50 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">Change</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleCollageImageUpload(file, index);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </label>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer p-4">
                            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground text-center">Photo {index + 1}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleCollageImageUpload(file, index);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                ) : !uploadedImage ? (
                  <label htmlFor="photo-upload-input" className="flex flex-col items-center justify-center py-20 cursor-pointer w-full">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Upload Your Photo
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, WEBP (Max 10MB)
                    </p>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="flex justify-center">
                    <canvas ref={canvasRef} className="max-w-full" />
                  </div>
                )}
              </div>

              {/* Image Controls - Only show for non-collage designs */}
              {selectedDesign !== "collage" && uploadedImage && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRotate} title="Rotate">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-border" />
                  <Button
                    variant={isCropMode ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleCropMode}
                    title="Crop Mode"
                  >
                    <Crop className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={aspectRatioLocked ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleAspectRatioLock}
                    title={aspectRatioLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                  >
                    {aspectRatioLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                  <div className="w-px h-6 bg-border" />
                  <Button variant="outline" size="sm" onClick={handleClear} title="Clear">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <label>
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Change
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
                </div>
              )}

              {/* Collage photos count indicator */}
              {selectedDesign === "collage" && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Collage Photos</p>
                      <p className="text-sm text-muted-foreground">
                        {collageImages.filter(img => img !== null).length} of 4 photos uploaded
                      </p>
                    </div>
                    {hasCollageImages && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCollageImages([null, null, null, null])}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {/* Uploaded Image Thumbnail Preview with File Info - Only for non-collage */}
              {selectedDesign !== "collage" && previewThumbnail && (
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={previewThumbnail}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      {isProcessingImage && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {imageInfo?.name || (isProcessingImage ? "Processing image..." : "Image ready")}
                      </p>
                      {imageInfo && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Size:</span> {imageInfo.size}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Dimensions:</span> {imageInfo.width} × {imageInfo.height}px
                          </span>
                        </div>
                      )}
                      {!imageInfo && (
                        <p className="text-xs text-muted-foreground">
                          {isProcessingImage
                            ? "Placing on canvas..."
                            : "Adjust position using controls above"}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Tips */}
              <Card className="p-3 md:p-4 bg-muted/50">
                <div className="flex gap-2 md:gap-3">
                  <Info className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Pro Tips:</p>
                    <ul className="list-disc list-inside space-y-0.5 md:space-y-1">
                      <li>Use high-resolution images for best print quality</li>
                      <li>Drag to reposition your photo within the frame</li>
                      <li>Zoom and rotate to get the perfect crop</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            {/* Options Section */}
            <div className="space-y-4 md:space-y-6">
              <Card className="p-4 md:p-6">
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
                  Select Size
                </h2>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {product.sizes.map((size) => (
                      <label
                        key={size.id}
                        className={cn(
                          "flex items-center justify-between p-3 md:p-4 border rounded-lg cursor-pointer transition-all",
                          selectedSize === size.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <RadioGroupItem value={size.id} id={`size-${size.id}`} />
                          <div>
                            <p className="font-medium text-foreground text-sm md:text-base">{size.label}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-primary text-sm md:text-base">₹{size.price}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </Card>

              <Card className="p-4 md:p-6">
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
                  Frame Options
                </h2>
                <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame}>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {product.frameOptions.map((frame) => (
                      <label
                        key={frame.id}
                        className={cn(
                          "flex items-center justify-between p-3 md:p-4 border rounded-lg cursor-pointer transition-all",
                          selectedFrame === frame.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <RadioGroupItem value={frame.id} id={`frame-${frame.id}`} />
                          <div className="flex items-center gap-1.5 md:gap-2">
                            {frame.id !== "none" && frame.id !== "no-frame" && (
                              <div
                                className={cn(
                                  "w-3 h-3 md:w-4 md:h-4 rounded border",
                                  (frame.id === "black" || frame.label.toLowerCase() === "black") && "bg-gray-900",
                                  (frame.id === "white" || frame.label.toLowerCase() === "white") && "bg-white border-gray-300",
                                  (frame.id === "gold" || frame.id === "golden" || frame.label.toLowerCase() === "gold" || frame.label.toLowerCase() === "golden") && "bg-amber-500",
                                  (frame.id === "wood" || frame.label.toLowerCase() === "wood") && "bg-amber-800",
                                  (frame.id === "red" || frame.label.toLowerCase() === "red") && "bg-red-600",
                                  (frame.id === "silver" || frame.label.toLowerCase() === "silver") && "bg-gray-400",
                                  (frame.id === "purple" || frame.label.toLowerCase() === "purple") && "bg-purple-600",
                                  (frame.id === "yellow" || frame.label.toLowerCase() === "yellow") && "bg-yellow-500",
                                  (frame.id === "blue" || frame.label.toLowerCase() === "blue") && "bg-blue-600"
                                )}
                              />
                            )}
                            <p className="font-medium text-foreground text-sm md:text-base">{frame.label}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-primary text-xs md:text-sm whitespace-nowrap">
                          {frame.price > 0 ? `+₹${frame.price}` : "Free"}
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </Card>

              {/* Acrylic Thickness Option - Only for Acrylic Wall Photo */}
              {isAcrylicWallPhoto && (
                <Card className="p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
                    Acrylic Thickness
                  </h2>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {thicknessOptions.map((thickness) => (
                      <button
                        key={thickness.id}
                        onClick={() => setSelectedThickness(thickness.id)}
                        className={cn(
                          "px-4 py-2 md:px-6 md:py-3 rounded-lg border-2 font-medium transition-all text-sm md:text-base",
                          selectedThickness === thickness.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        )}
                      >
                        {thickness.label}
                        {thickness.price > 0 && (
                          <span className="ml-1 text-xs opacity-80">+₹{thickness.price}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Continue to Preview Button */}
              <Button
                size="lg"
                className="w-full h-12 md:h-14 text-base md:text-lg"
                onClick={handleContinueToPreview}
                disabled={selectedDesign === "collage" ? !hasCollageImages : !uploadedImage}
              >
                Continue to Preview
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Order */}
        {currentStep === "preview" && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button variant="ghost" size="sm" onClick={handleBackToUpload} className="h-8 w-8 p-0 md:h-9 md:w-auto md:px-3">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-lg md:text-2xl font-display font-bold text-foreground">
                    Preview Your Design
                  </h1>
                </div>
                <Badge variant="secondary" className="text-xs md:text-sm">{product.category}</Badge>
              </div>

              {/* Product Mockup Preview */}
              <div className="relative">
                {/* Background environment */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 md:p-12">
                  {/* Wall texture */}
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHBhdGggZD0iTTAgMGg1MHY1MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoMjV2MjVIMHptMjUgMjVoMjV2MjVIMjV6IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMDUpIi8+PC9zdmc+')]" />

                  {/* Product Frame Container */}
                  <div className="relative mx-auto" style={{
                    maxWidth: currentDesignTemplate.aspectRatio >= 1 ? "400px" : "300px",
                  }}>
                    {/* Shadow effect */}
                    <div className="absolute -inset-4 bg-black/10 blur-2xl rounded-lg" />

                    {/* Frame */}
                    <div className={cn(
                      "relative bg-white rounded-sm overflow-hidden",
                      selectedFrame === "black" && "ring-[16px] ring-gray-900",
                      selectedFrame === "white" && "ring-[16px] ring-white shadow-lg",
                      (selectedFrame === "gold" || selectedFrame === "golden") && "ring-[16px] ring-amber-500",
                      selectedFrame === "red" && "ring-[16px] ring-red-600",
                      selectedFrame === "silver" && "ring-[16px] ring-gray-400",
                      selectedFrame === "purple" && "ring-[16px] ring-purple-600",
                      selectedFrame === "yellow" && "ring-[16px] ring-yellow-500",
                      selectedFrame === "blue" && "ring-[16px] ring-blue-600",
                      selectedFrame === "none" && "ring-1 ring-gray-200",
                      // selectedDesign === "cutout" && "rounded-full ring-0"
                    )}>
                      {/* Design-specific inner frames */}
                      {selectedDesign === "dual-border" && (
                        <div className="absolute inset-2 border-4 border-primary/50 pointer-events-none z-10 rounded-sm" />
                      )}

                      {selectedDesign === "portrait" && selectedFrame === "none" && (
                        <div className="absolute inset-2 border-2 border-primary/30 pointer-events-none z-10 rounded-sm" />
                      )}

                      {selectedDesign === "landscape" && selectedFrame === "none" && (
                        <div className="absolute inset-2 border-2 border-primary/30 pointer-events-none z-10 rounded-sm" />
                      )}

                      {selectedDesign === "square" && selectedFrame === "none" && (
                        <div className="absolute inset-2 border-2 border-primary/30 pointer-events-none z-10" />
                      )}

                      {/* Photo */}
                      <div
                        className={cn(
                          "relative w-full overflow-hidden bg-black",
                          selectedDesign === "cutout" && "rounded-full"
                        )}
                        style={{
                          aspectRatio: currentDesignTemplate.aspectRatio,
                        }}
                      >
                        {selectedDesign === "collage" ? (
                          /* Collage Grid with individual images */
                          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 bg-white">
                            {collageImages.map((img, index) => (
                              <div key={index} className="relative overflow-hidden bg-black">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={`Collage photo ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : uploadedImage ? (
                          <>
                            <img
                              src={uploadedImage}
                              alt="Your design preview"
                              className={cn(
                                "absolute inset-0 w-full h-full object-cover",
                                selectedDesign === "cutout" && "rounded-full"
                              )}
                              style={{
                                transform: `rotate(${imageRotation}deg) scale(${Math.max(imageScale, 1.02)})`,
                                transformOrigin: 'center center',
                              }}
                            />

                            {/* Cutout circular mask effect */}
                            {selectedDesign === "cutout" && (
                              <div className="absolute inset-0 rounded-full ring-4 ring-primary/30 pointer-events-none z-10" />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product badge */}
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  {product.name}
                </div>
              </div>

              {/* Selected Options Summary */}
              <Card className="p-3 md:p-4">
                <h3 className="font-semibold text-foreground mb-2 md:mb-3 text-sm md:text-base">Your Selections</h3>
                <div className={cn(
                  "grid gap-2 md:gap-4 text-xs md:text-sm",
                  isAcrylicWallPhoto ? "grid-cols-4" : "grid-cols-3"
                )}>
                  <div>
                    <p className="text-muted-foreground">Design</p>
                    <p className="font-medium">{currentDesignTemplate.label}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{selectedSizeData?.label || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frame</p>
                    <p className="font-medium">{selectedFrameData?.label || "No Frame"}</p>
                  </div>
                  {isAcrylicWallPhoto && (
                    <div>
                      <p className="text-muted-foreground">Thickness</p>
                      <p className="font-medium">{selectedThicknessData?.label || "3mm"}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Order Section */}
            <div className="space-y-4 md:space-y-6">
              <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{product.name}</span>
                    <span>₹{selectedSizeData?.price || product.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size: {selectedSizeData?.label}</span>
                  </div>
                  {selectedFrameData && selectedFrameData.price > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{selectedFrameData.label}</span>
                      <span>+₹{selectedFrameData.price}</span>
                    </div>
                  )}
                  {isAcrylicWallPhoto && selectedThicknessData && selectedThicknessData.price > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Thickness: {selectedThicknessData.label}</span>
                      <span>+₹{selectedThicknessData.price}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground text-sm md:text-base">Total</span>
                    <span className="text-2xl md:text-3xl font-bold text-primary">₹{totalPrice}</span>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2 md:space-y-3">
                <Button
                  size="lg"
                  className="w-full h-12 md:h-14 text-base md:text-lg"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full h-12 md:h-14 text-base md:text-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={buyNowLoading}
                  onClick={handleBuyNow}
                >
                  {buyNowLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : null}
                  Buy Now - ₹{totalPrice}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500 flex-shrink-0" />
                  Premium Quality Print
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500 flex-shrink-0" />
                  Free Shipping
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500 flex-shrink-0" />
                  Secure Packaging
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500 flex-shrink-0" />
                  Easy Returns
                </div>
              </div>

              {/* Free Keys Highlight Banner */}
              <div className="container mx-auto px-4 mb-6">
                <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-2xl p-4 md:p-6">
                  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">🔑</span>
                      </div>
                      <span className="font-semibold text-green-700 dark:text-green-400">Free Keys chain Included</span>
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
              {/* Edit Options */}
              <Button
                variant="outline"
                className="w-full h-10 md:h-auto"
                onClick={handleBackToUpload}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Edit Photo & Options
              </Button>

              {/* Description */}
              <p className="text-xs md:text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductCustomize;
