import { useState, useRef } from "react";
import { 
  ShoppingCart, Zap, MapPin, CheckCircle2, ChevronLeft, ChevronRight, 
  ZoomIn, Upload, X, File, Star, ThumbsUp, Camera, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { ProductData, Review } from "@/types/product";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";

interface ProductProps {
  product: ProductData;
}

const Product = ({ product }: ProductProps) => {
  // Main state
  const [selectedQuantity, setSelectedQuantity] = useState(product.quantities[0]?.value || 1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.value || "");
  const [customText, setCustomText] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  
  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(product.reviews);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, boolean>>({});
  
  // Related products carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  // Computed values
  const currentVariant = product.variants.find(v => v.value === selectedVariant);
  const currentImages = currentVariant?.images || product.images;
  const currentPrice = product.quantities.find((q) => q.value === selectedQuantity)?.price || product.basePrice;
  const originalPrice = Math.round(currentPrice * 1.2);
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const totalPrice = currentPrice * selectedQuantity;
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const selectedVariantLabel = currentVariant?.label || selectedVariant;

  // Reset image index when variant changes
  const handleVariantChange = (variantValue: string) => {
    setSelectedVariant(variantValue);
    setCurrentImageIndex(0);
  };

  // Handlers
  const handleAddToCart = () => {
    toast({ title: "Added to Cart!", description: `${selectedQuantity}x ${product.name} (${selectedVariantLabel}) added to your cart.` });
  };

  const handleBuyNow = () => {
    toast({ title: "Proceeding to Checkout", description: `Total: ₹${totalPrice.toLocaleString()}` });
  };

  const handleCheckPincode = () => {
    if (pincode.length === 6) {
      setPincodeChecked(true);
      toast({ title: "Delivery Available!", description: `Your pincode ${pincode} is serviceable. Estimated delivery: 5-7 days.` });
    } else {
      toast({ title: "Invalid Pincode", description: "Please enter a valid 6-digit pincode.", variant: "destructive" });
    }
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewName.trim() || !reviewTitle.trim() || !reviewContent.trim()) {
      toast({ title: "Please fill all fields", description: "Rating, name, title and review are required.", variant: "destructive" });
      return;
    }
    const newReview: Review = { id: Date.now(), name: reviewName.trim(), rating: reviewRating, title: reviewTitle.trim(), content: reviewContent.trim(), helpful: 0, verified: false, date: "Just now" };
    setReviews([newReview, ...reviews]);
    setReviewRating(0); setReviewName(""); setReviewTitle(""); setReviewContent("");
    setReviewDialogOpen(false);
    toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  const handleHelpful = (reviewId: number) => {
    if (!helpfulVotes[reviewId]) {
      setHelpfulVotes({ ...helpfulVotes, [reviewId]: true });
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-foreground cursor-pointer">Products</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name.split("|")[0].trim()}</span>
        </nav>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Image Gallery */}
          <div className="animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="relative group overflow-hidden rounded-lg bg-secondary/50">
                <div className="aspect-square relative">
                  <img src={currentImages[currentImageIndex]} alt={`${product.name} - Image ${currentImageIndex + 1}`} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  <button className="absolute bottom-4 right-4 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn className="w-5 h-5 text-foreground" /></button>
                  <button onClick={() => setCurrentImageIndex(i => i === 0 ? currentImages.length - 1 : i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"><ChevronLeft className="w-5 h-5 text-foreground" /></button>
                  <button onClick={() => setCurrentImageIndex(i => i === currentImages.length - 1 ? 0 : i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"><ChevronRight className="w-5 h-5 text-foreground" /></button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentImages.map((image, index) => (
                  <button key={index} onClick={() => setCurrentImageIndex(index)} className={cn("flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all", currentImageIndex === index ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground")}>
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} Reviews)</span>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 p-4 rounded-lg">
                <span className="text-muted-foreground line-through text-lg">₹{originalPrice.toLocaleString()}</span>
                <span className="text-2xl font-bold text-foreground">₹{currentPrice.toLocaleString()}</span>
                <Badge className="bg-success text-success-foreground hover:bg-success">SAVE {discount}%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Inclusive of All Taxes</p>
            </div>

            {/* File Upload */}
            <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="w-8 h-8 text-primary" />
                  <div className="text-left"><p className="font-medium text-foreground">{selectedFile.name}</p><p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p></div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 rounded-full hover:bg-destructive/10 text-destructive"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2"><Upload className="w-8 h-8 text-muted-foreground" /><p className="text-muted-foreground">Drag & Drop your files or <span className="text-primary font-medium">Browse</span></p></div>
              )}
            </div>

            {/* Customization Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Any Text or Customization Needed <span className="text-muted-foreground">(Optional)</span></label>
              <Textarea placeholder="Write Here - You can type any customization in design you need!" value={customText} onChange={(e) => setCustomText(e.target.value)} className="resize-none" rows={3} />
            </div>

            {/* Quantity Selector */}
            {product.quantities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Quantity: <span className="text-primary">{selectedQuantity} Pieces</span></h4>
                <div className="flex flex-wrap gap-2">
                  {product.quantities.map((qty) => (<button key={qty.value} onClick={() => setSelectedQuantity(qty.value)} className={cn("px-4 py-2 rounded-md border text-sm font-medium transition-all", selectedQuantity === qty.value ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:border-foreground")}>{qty.label}</button>))}
                </div>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Type: <span className="text-primary uppercase">{selectedVariantLabel}</span></h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (<button key={variant.value} onClick={() => handleVariantChange(variant.value)} className={cn("px-4 py-2 rounded-md border text-sm font-medium transition-all", selectedVariant === variant.value ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:border-foreground")}>{variant.label}</button>))}
                </div>
              </div>
            )}

            {/* Add to Cart / Buy Now */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" className="flex-1 gap-2 bg-foreground text-background hover:bg-foreground/90" onClick={handleAddToCart}><ShoppingCart className="w-5 h-5" />Add to Cart</Button>
              <Button size="lg" className="flex-1 gap-2" onClick={handleBuyNow}><Zap className="w-5 h-5" />Buy Now - ₹{totalPrice.toLocaleString()}</Button>
            </div>

            {/* Pincode Check */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />Check Product Availability</div>
              <div className="flex gap-2">
                <Input placeholder="Enter Pincode" value={pincode} onChange={(e) => { setPincode(e.target.value); setPincodeChecked(false); }} maxLength={6} className="flex-1" />
                <Button variant="outline" onClick={handleCheckPincode}>Check Now</Button>
              </div>
              {pincodeChecked && (<div className="flex items-center gap-2 text-sm text-success animate-fade-in"><CheckCircle2 className="w-4 h-4" />Your Pincode is serviceable</div>)}
            </div>

            {/* Trust Badges */}
            <div className="space-y-3 py-4 border-t border-border">
              {product.trustBadges.map((badge, index) => (<div key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}><badge.icon className="w-5 h-5 text-success flex-shrink-0" /><p className={`text-sm ${badge.highlight ? "text-primary font-medium" : "text-muted-foreground"}`}>{badge.text}</p></div>))}
            </div>

            {/* Recent Orders */}
            <div className="flex items-center gap-2 text-sm bg-secondary/50 px-4 py-3 rounded-lg">
              <Zap className="w-4 h-4 text-primary" /><span className="text-muted-foreground"><strong className="text-foreground">24</strong> orders in last 3 hours</span>
            </div>
          </div>
        </div>

        {/* Product Information Accordion */}
        {product.infoSections.length > 0 && (
          <div className="mt-8 border-t border-border pt-8">
            <Accordion type="single" collapsible className="w-full">
              {product.infoSections.map((item, index) => (<AccordionItem key={index} value={`item-${index}`}><AccordionTrigger className="text-foreground font-medium hover:text-primary">{item.title}</AccordionTrigger><AccordionContent><div dangerouslySetInnerHTML={{ __html: item.content }} /></AccordionContent></AccordionItem>))}
            </Accordion>
          </div>
        )}

        {/* Customer Reviews */}
        {reviews.length > 0 && (
          <section className="mt-12 border-t border-border pt-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div><h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2><p className="text-muted-foreground">{reviews.length} reviews</p></div>
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild><Button variant="outline" className="gap-2"><Camera className="w-4 h-4" />Write a Review</Button></DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader><DialogTitle>Write a Review</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmitReview} className="space-y-4 pt-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Your Rating</label><div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((star) => (<button key={star} type="button" onClick={() => setReviewRating(star)} className="hover:scale-110 transition-transform cursor-pointer"><Star className={cn("w-6 h-6", reviewRating >= star ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} /></button>))}</div></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Your Name</label><Input placeholder="Enter your name" value={reviewName} onChange={(e) => setReviewName(e.target.value)} maxLength={50} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Review Title</label><Input placeholder="Summarize your experience" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} maxLength={100} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Your Review</label><Textarea placeholder="Tell others about your experience..." value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} rows={4} maxLength={500} /></div>
                    <Button type="submit" className="w-full">Submit Review</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid lg:grid-cols-4 gap-8 mb-8">
              {/* Rating Summary */}
              <div className="lg:col-span-1 bg-secondary/30 rounded-lg p-6 h-fit">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center gap-0.5">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={cn("w-4 h-4", Math.round(averageRating) >= star ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />))}</div>
                  <p className="text-sm text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => { const count = reviews.filter(r => r.rating === star).length; const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0; return (
                    <div key={star} className="flex items-center gap-2"><span className="text-sm w-3">{star}</span><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} /></div><span className="text-sm text-muted-foreground w-8">{count}</span></div>
                  ); })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-3 space-y-4">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-lg p-5 space-y-4 animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>
                        <div>
                          <div className="flex items-center gap-2"><span className="font-semibold text-foreground">{review.name}</span>{review.verified && (<span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Verified Buyer</span>)}</div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={cn("w-4 h-4", review.rating >= star ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />))}</div>
                    </div>
                    <div><h4 className="font-semibold text-foreground mb-2">{review.title}</h4><p className="text-muted-foreground text-sm leading-relaxed">{review.content}</p></div>
                    {review.photos && review.photos.length > 0 && (<div className="flex gap-2">{review.photos.map((photo, idx) => (<button key={idx} onClick={() => setSelectedPhoto(photo)} className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"><img src={photo} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" /></button>))}</div>)}
                    <div className="flex items-center gap-4 pt-2"><button onClick={() => handleHelpful(review.id)} disabled={helpfulVotes[review.id]} className={cn("flex items-center gap-2 text-sm transition-colors", helpfulVotes[review.id] ? "text-primary" : "text-muted-foreground hover:text-foreground")}><ThumbsUp className="w-4 h-4" />Helpful ({review.helpful})</button></div>
                  </div>
                ))}
                {reviews.length > 3 && (<Button variant="outline" className="w-full" onClick={() => setShowAllReviews(!showAllReviews)}>{showAllReviews ? "Show Less" : `Show All ${reviews.length} Reviews`}</Button>)}
              </div>
            </div>
          </section>
        )}

        {/* Related Products Carousel */}
        {product.relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-2xl font-bold text-foreground">Related Products</h2><p className="text-muted-foreground">You might also like these</p></div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => scrollCarousel("left")} className="rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => scrollCarousel("right")} className="rounded-full"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
            <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {product.relatedProducts.map((relatedProduct) => { const prodDiscount = Math.round(((relatedProduct.originalPrice - relatedProduct.price) / relatedProduct.originalPrice) * 100); return (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`} className="group flex-shrink-0 w-64 bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                    <img src={relatedProduct.image} alt={relatedProduct.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                    {relatedProduct.badge && (<Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{relatedProduct.badge}</Badge>)}
                    <Badge className="absolute top-3 right-3 bg-success text-success-foreground">{prodDiscount}% OFF</Badge>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">{relatedProduct.name}</h3>
                    <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-sm text-foreground">{relatedProduct.rating}</span><span className="text-sm text-muted-foreground">({relatedProduct.reviewCount})</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground line-through text-sm">₹{relatedProduct.originalPrice}</span><span className="font-bold text-foreground">₹{relatedProduct.price}</span></div>
                  </div>
                </Link>
              ); })}
            </div>
            
          </section>
          
        )}
      </main>
      <Footer/>
    </div>
  );
};

export default Product;
