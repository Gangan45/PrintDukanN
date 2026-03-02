import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";
import { ProductDetailSkeleton } from "@/components/skeletons";
import {
  ChevronRight,
  Loader2,
  ShoppingCart,
  Zap,
  Upload,
  Baby,
  Calendar,
  Clock,
  Weight,
  Ruler,
  MapPin,
  Heart,
  Star,
  X,
  Image as ImageIcon,
  MessageCircle,
  Check
} from "lucide-react";

interface ProductSize {
  name: string;
  dimensions: string;
  price: number;
}

interface DesignTemplate {
  id: string;
  name: string;
  image: string;
  color: string;
}

const sizes: ProductSize[] = [
  { name: "Standard", dimensions: "8x10 inch", price: 0 },
  { name: "Medium", dimensions: "10x12 inch", price: 200 },
  { name: "Large", dimensions: "12x16 inch", price: 400 },
  { name: "Premium", dimensions: "16x20 inch", price: 700 },
];

const designTemplates: DesignTemplate[] = [
  { id: "design-1", name: "Classic Blue", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop", color: "bg-blue-100" },
  { id: "design-2", name: "Sweet Pink", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop", color: "bg-pink-100" },
  { id: "design-3", name: "Neutral Beige", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop", color: "bg-amber-50" },
  { id: "design-4", name: "Mint Green", image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&h=300&fit=crop", color: "bg-green-100" },
  { id: "design-5", name: "Lavender Dream", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=300&fit=crop", color: "bg-purple-100" },
  { id: "design-6", name: "Sunny Yellow", image: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=300&h=300&fit=crop", color: "bg-yellow-100" },
];

const frameTypes = [
  { id: "without-frame", name: "Without Frame", price: 0 },
  { id: "black-frame", name: "Black Frame", price: 200 },
  { id: "white-frame", name: "White Frame", price: 200 },
  { id: "wooden-frame", name: "Wooden Frame", price: 350 },
];

export default function BabyFrameCustomize() {
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Baby details
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [hospital, setHospital] = useState("");
  const [parentsNames, setParentsNames] = useState("");
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  
  // Product options
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedDesign, setSelectedDesign] = useState(designTemplates[0]);
  const [selectedFrame, setSelectedFrame] = useState(frameTypes[0]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // For preview
  const [uploadedImageFiles, setUploadedImageFiles] = useState<File[]>([]); // For upload
  
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 3;
    if (uploadedImages.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    Array.from(files).slice(0, maxImages - uploadedImages.length).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }

      // Store the actual File object for upload
      setUploadedImageFiles((prev) => [...prev, file]);
      
      // Create preview URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const currentPrice = 799 + selectedSize.price + selectedFrame.price;
  const originalPrice = Math.round(currentPrice * 1.25);
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const validateForm = () => {
    if (!babyName.trim()) {
      toast.error("Please enter baby's name");
      return false;
    }
    if (!birthDate) {
      toast.error("Please enter birth date");
      return false;
    }
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one photo");
      return false;
    }
    return true;
  };

  const getCustomText = () => {
    const details = [
      `Name: ${babyName}`,
      `DOB: ${birthDate}`,
      birthTime && `Time: ${birthTime}`,
      weight && `Weight: ${weight}`,
      height && `Height: ${height}`,
      hospital && `Hospital: ${hospital}`,
      parentsNames && `Parents: ${parentsNames}`,
      `Gender: ${gender}`,
      `Design: ${selectedDesign.name}`,
    ].filter(Boolean).join(" | ");
    return details;
  };

  const handleAddToCart = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await addToCart({
        productId: id || "baby-birth-frame",
        productName: `Baby Birth Frame - ${selectedDesign.name}`,
        productImage: uploadedImages[0] || selectedDesign.image,
        quantity: 1,
        unitPrice: currentPrice,
        selectedSize: selectedSize.dimensions,
        selectedFrame: selectedFrame.name,
        customText: getCustomText(),
        customImageUrl: uploadedImageFiles[0],
        category: "baby-frames"
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await buyNow({
        productId: id || "baby-birth-frame",
        productName: `Baby Birth Frame - ${selectedDesign.name}`,
        productImage: uploadedImages[0] || selectedDesign.image,
        price: currentPrice,
        quantity: 1,
        selectedSize: selectedSize.dimensions,
        selectedFrame: selectedFrame.name,
        customText: getCustomText(),
        customImageUrl: uploadedImageFiles[0],
        category: "baby-frames"
      });
    } catch (error) {
      toast.error("Failed to process");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hi! I want to order a Baby Birth Frame.\n\n` +
      `Baby's Name: ${babyName || "Not entered"}\n` +
      `Birth Date: ${birthDate || "Not entered"}\n` +
      `Time: ${birthTime || "Not entered"}\n` +
      `Weight: ${weight || "Not entered"}\n` +
      `Height: ${height || "Not entered"}\n` +
      `Hospital: ${hospital || "Not entered"}\n` +
      `Parents: ${parentsNames || "Not entered"}\n` +
      `Gender: ${gender}\n` +
      `Design: ${selectedDesign.name}\n` +
      `Size: ${selectedSize.dimensions}\n` +
      `Frame: ${selectedFrame.name}\n` +
      `Total: ₹${currentPrice}`
    );
    window.open(`https://wa.me/8518851767?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/category/baby-frames" className="hover:text-primary">Baby Frames</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Customize</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-4">
            {/* Main Preview */}
            <div className={cn(
              "aspect-square rounded-2xl border-8 border-white dark:border-gray-800 shadow-2xl relative overflow-hidden",
              selectedDesign.color
            )}>
              {uploadedImages.length > 0 ? (
                <div className="w-full h-full p-8 flex items-center justify-center">
                  <div className="relative w-full max-w-sm">
                    <img
                      src={uploadedImages[0]}
                      alt="Baby"
                      className="w-full aspect-square object-cover rounded-xl shadow-lg"
                    />
                    {/* Overlay with baby details */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                      <p className="font-display text-lg font-bold text-foreground">
                        {babyName || "Baby Name"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">Upload baby's photo to see preview</p>
                </div>
              )}
              
              {/* Baby Details Overlay */}
              {babyName && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {birthDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span>{birthDate}</span>
                      </div>
                    )}
                    {birthTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{birthTime}</span>
                      </div>
                    )}
                    {weight && (
                      <div className="flex items-center gap-1">
                        <Weight className="w-3 h-3 text-primary" />
                        <span>{weight}</span>
                      </div>
                    )}
                    {height && (
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3 h-3 text-primary" />
                        <span>{height}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="flex gap-2">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={img}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < 5 ? "fill-amber-400 text-amber-400" : "text-muted")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(324 reviews)</span>
            </div>
          </div>

          {/* Customization Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Personalized Baby Birth Frame
              </h1>
              <p className="text-muted-foreground mt-1">A Memory for Life</p>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-bold text-foreground">₹{currentPrice}</span>
                <span className="text-lg text-muted-foreground line-through">₹{originalPrice}</span>
                <span className="bg-success/10 text-success text-sm font-medium px-2 py-1 rounded">
                  {discount}% OFF
                </span>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Baby className="w-4 h-4" />
                Gender
              </Label>
              <RadioGroup
                value={gender}
                onValueChange={(v) => setGender(v as "boy" | "girl")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="boy" id="boy" />
                  <Label htmlFor="boy" className="cursor-pointer">👶 Boy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="girl" id="girl" />
                  <Label htmlFor="girl" className="cursor-pointer">👶 Girl</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Baby Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Baby's Name *
              </Label>
              <Input
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder="Enter baby's name"
                maxLength={25}
              />
            </div>

            {/* Birth Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birth Date *
                </Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Birth Time
                </Label>
                <Input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </div>
            </div>

            {/* Weight & Height */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  Weight (kg)
                </Label>
                <Input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 3.2 kg"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Height (cm)
                </Label>
                <Input
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 50 cm"
                />
              </div>
            </div>

            {/* Hospital */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Hospital / Birth Place
              </Label>
              <Input
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="Enter hospital name"
              />
            </div>

            {/* Parents Names */}
            <div className="space-y-2">
              <Label>Proud Parents</Label>
              <Input
                value={parentsNames}
                onChange={(e) => setParentsNames(e.target.value)}
                placeholder="e.g., Mom & Dad Name"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Baby's Photo *
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 border-dashed"
                disabled={uploadedImages.length >= 3}
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">
                    {uploadedImages.length >= 3
                      ? "Maximum 3 images uploaded"
                      : "Click to upload (Max 3 images)"}
                  </span>
                </div>
              </Button>
            </div>

            {/* Design Templates */}
            <div className="space-y-2">
              <Label>Choose Design Template</Label>
              <div className="grid grid-cols-3 gap-2">
                {designTemplates.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      selectedDesign.id === design.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("absolute inset-0", design.color)} />
                    <img
                      src={design.image}
                      alt={design.name}
                      className="relative w-full h-full object-cover opacity-80"
                    />
                    {selectedDesign.id === design.id && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "p-3 rounded-lg text-left border-2 transition-all",
                      selectedSize.name === size.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="font-medium text-sm">{size.name}</div>
                    <div className="text-xs text-muted-foreground">{size.dimensions}</div>
                    {size.price > 0 && (
                      <div className="text-xs text-primary mt-1">+₹{size.price}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Type */}
            <div className="space-y-2">
              <Label>Frame Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {frameTypes.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={cn(
                      "p-3 rounded-lg text-left border-2 transition-all",
                      selectedFrame.id === frame.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="font-medium text-sm">{frame.name}</div>
                    {frame.price > 0 && (
                      <div className="text-xs text-primary">+₹{frame.price}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

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

            {/* WhatsApp Contact */}
            <Button
              variant="outline"
              onClick={handleWhatsAppContact}
              className="w-full bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Order via WhatsApp
            </Button>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews and Related Products */}
        <ReviewsAndSuggestions 
          productId={id || "baby-birth-frame"} 
          category="Baby Frames" 
        />
      </main>

      <Footer />
    </div>
  );
}
