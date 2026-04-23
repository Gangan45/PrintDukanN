import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Star,
  Upload,
  Check,
  Truck,
  Shield,
  Loader2,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  getVariantImages,
  parseVariantImages,
  VariantImages,
} from "@/lib/variantImages";
import { ProductDetailsBlock } from "@/components/product/ProductDetailsBlock";
import { captureDesignFromDOM } from "@/lib/captureDesign";

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  variant_images: VariantImages | null;
}

// CSS clip-path values for each shape — used for live preview
const SHAPE_OPTIONS = [
  { id: "square", label: "Square", emoji: "▢", clip: "inset(0 round 8px)" },
  { id: "circle", label: "Circle", emoji: "◯", clip: "circle(50% at 50% 50%)" },
  { id: "heart", label: "Heart", emoji: "♥",
    clip: "path('M50,88 C18,66 4,46 4,28 C4,14 16,4 28,4 C38,4 46,10 50,20 C54,10 62,4 72,4 C84,4 96,14 96,28 C96,46 82,66 50,88 Z')" },
  { id: "star", label: "Star", emoji: "★",
    clip: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
  { id: "hexagon", label: "Hexagon", emoji: "⬡",
    clip: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)" },
  { id: "oval", label: "Oval", emoji: "⬭", clip: "ellipse(40% 50% at 50% 50%)" },
  { id: "rounded", label: "Rounded", emoji: "▢", clip: "inset(0 round 24px)" },
  { id: "custom-cutout", label: "Custom Cutout", emoji: "✂", clip: "none" },
] as const;

type ShapeId = (typeof SHAPE_OPTIONS)[number]["id"];

// Printshoppy-style tier pricing (per piece)
const PRICE_TIERS = [
  { minQty: 1, perPiece: 299, label: "1 pc" },
  { minQty: 2, perPiece: 149, label: "Buy 2+" },
  { minQty: 5, perPiece: 129, label: "Buy 5+" },
  { minQty: 10, perPiece: 119, label: "Buy 10+" },
];

const MRP_PER_PIECE = 399;

const getPerPiecePrice = (qty: number): number => {
  // Walk tiers from highest minQty downward
  for (let i = PRICE_TIERS.length - 1; i >= 0; i--) {
    if (qty >= PRICE_TIERS[i].minQty) return PRICE_TIERS[i].perPiece;
  }
  return PRICE_TIERS[0].perPiece;
};

const defaultProduct: Product = {
  id: "default-fridge-magnet",
  name: "Acrylic Fridge Magnet",
  description:
    "Premium quality acrylic fridge magnets with your custom photo. Strong magnets, vibrant prints.",
  base_price: 299,
  images: [
    "https://cdn.printshoppy.com/image/catalog/v6/jpg/acrylic-fridge-magnets/product-page/fridge-magents-preview-s2.jpg",
    "https://cdn.printshoppy.com/image/catalog/v6/jpg/acrylic-fridge-magnets/product-page/fridge-magents-preview-s3.jpg",
    "https://cdn.printshoppy.com/image/catalog/v6/jpg/acrylic-fridge-magnets/product-page/fridge-magents-preview-s4.jpg",
    "https://cdn.printshoppy.com/image/catalog/v6/jpg/acrylic-fridge-magnets/product-page/fridge-magents-preview-s5.jpg",
  ],
  variant_images: null,
};

interface MagnetItem {
  id: string;
  qty: number;
  shape: ShapeId;
  file: File | null;
  preview: string | null;
}

const newMagnet = (): MagnetItem => ({
  id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  qty: 1,
  shape: "square",
  file: null,
  preview: null,
});

const FridgeMagnetCustomize = () => {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [magnets, setMagnets] = useState<MagnetItem[]>([newMagnet()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Refs to each magnet's live preview node — used to capture the masked design as base64
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  useEffect(() => {
    if (id && id !== "customize") {
      loadProduct();
    } else {
      setProduct(defaultProduct);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    return getVariantImages(product.variant_images, product.images, {});
  }, [product]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setProduct(defaultProduct);
        return;
      }

      const variant_images = parseVariantImages(data.variant_images);
      setProduct({
        id: data.id,
        name: data.name,
        description: data.description,
        base_price: Number(data.base_price) || defaultProduct.base_price,
        images: data.images?.length ? data.images : defaultProduct.images,
        variant_images,
      });
    } catch (error) {
      console.error("Error loading product:", error);
      setProduct(defaultProduct);
    } finally {
      setLoading(false);
    }
  };

  const totalQty = useMemo(
    () => magnets.reduce((sum, m) => sum + (m.qty || 0), 0),
    [magnets]
  );
  const perPiece = getPerPiecePrice(totalQty);
  const totalPrice = perPiece * totalQty;
  const totalMrp = MRP_PER_PIECE * totalQty;
  const totalSavings = Math.max(0, totalMrp - totalPrice);
  const discountPercent =
    totalMrp > 0 ? Math.round((totalSavings / totalMrp) * 100) : 0;

  const updateMagnet = (mid: string, patch: Partial<MagnetItem>) => {
    setMagnets((prev) =>
      prev.map((m) => (m.id === mid ? { ...m, ...patch } : m))
    );
  };

  const handleFileSelect = (mid: string, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max 5MB per photo",
        variant: "destructive",
      });
      return;
    }
    const preview = URL.createObjectURL(file);
    updateMagnet(mid, { file, preview });
  };

  const addAnotherMagnet = () => {
    if (magnets.length >= 20) {
      toast({
        title: "Limit reached",
        description: "Max 20 magnets per order",
      });
      return;
    }
    setMagnets((prev) => [...prev, newMagnet()]);
  };

  const removeMagnet = (mid: string) => {
    if (magnets.length === 1) {
      toast({ title: "At least 1 magnet required" });
      return;
    }
    setMagnets((prev) => prev.filter((m) => m.id !== mid));
  };

  const validate = (): boolean => {
    const missing = magnets.findIndex((m) => !m.file);
    if (missing >= 0) {
      toast({
        title: "Photo missing",
        description: `Please upload a photo for Magnet ${missing + 1}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const buildCustomText = (): string => {
    return magnets
      .map(
        (m, i) =>
          `Magnet ${i + 1}: ${m.qty} pc, Shape: ${
            SHAPE_OPTIONS.find((s) => s.id === m.shape)?.label || m.shape
          }`
      )
      .join(" | ");
  };

  // Capture the masked live-preview of one magnet to a base64 PNG so the
  // admin downloads exactly what the customer saw (with shape cutout applied).
  const captureMagnetPreview = async (mid: string): Promise<string | null> => {
    const node = previewRefs.current[mid];
    if (!node) return null;
    try {
      return await captureDesignFromDOM(node);
    } catch (err) {
      console.error("Preview capture failed:", err);
      return null;
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Add each magnet group as a separate cart line (so each photo upload persists)
      for (let i = 0; i < magnets.length; i++) {
        const m = magnets[i];
        // Capture the masked preview — falls back to the raw upload if capture fails
        const designSnapshot = await captureMagnetPreview(m.id);
        await addToCart({
          productId: product.id,
          productName: `${product.name} (${
            SHAPE_OPTIONS.find((s) => s.id === m.shape)?.label
          })`,
          productImage: images[0] || "",
          quantity: m.qty,
          unitPrice: perPiece,
          selectedSize: SHAPE_OPTIONS.find((s) => s.id === m.shape)?.label,
          customImageUrl: designSnapshot || m.file || undefined,
          customText: `Shape: ${
            SHAPE_OPTIONS.find((s) => s.id === m.shape)?.label
          }`,
          category: "fridge-magnet",
        });
      }
      toast({
        title: "Added to Cart",
        description: `${totalQty} magnet${totalQty > 1 ? "s" : ""} added`,
      });
    } catch (e) {
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
    if (!product) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Buy-now uses the first magnet as primary line; group totals via custom text
      const first = magnets[0];
      const designSnapshot = await captureMagnetPreview(first.id);
      await buyNow({
        productId: product.id,
        productName: product.name,
        productImage: images[0] || "",
        price: perPiece,
        quantity: totalQty,
        selectedSize: SHAPE_OPTIONS.find((s) => s.id === first.shape)?.label,
        customImageUrl: designSnapshot || first.file || undefined,
        customText: buildCustomText(),
        category: "fridge-magnet",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to process",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!product) return null;

  const goToPrevious = () =>
    setSelectedIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  const goToNext = () =>
    setSelectedIndex((p) => (p === images.length - 1 ? 0 : p + 1));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to="/category/acrylic"
            className="hover:text-primary transition-colors"
          >
            Acrylic
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to="/category/acrylic-magnet"
            className="hover:text-primary transition-colors"
          >
            Acrylic Magnet
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Customize</span>
        </nav>
      </div>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {images.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0 md:pr-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all",
                      selectedIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 group">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img
                  src={images[selectedIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < 4
                          ? "fill-primary text-primary"
                          : "fill-primary/30 text-primary/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">4.6</span>
                <span className="text-sm text-muted-foreground">
                  (2,184 Reviews)
                </span>
              </div>
              {product.description && (
                <p className="mt-3 text-muted-foreground">
                  {product.description}
                </p>
              )}
            </div>

            {/* Buy More Save More */}
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-lg">🏷️</span> BUY MORE, SAVE MORE
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PRICE_TIERS.slice(1).map((tier) => {
                  const active = totalQty >= tier.minQty;
                  return (
                    <button
                      key={tier.minQty}
                      type="button"
                      onClick={() => {
                        if (magnets.length === 0) return;
                        // Set the first magnet's qty to this tier so totalQty hits the threshold
                        const others = magnets
                          .slice(1)
                          .reduce((sum, m) => sum + (m.qty || 0), 0);
                        const newFirstQty = Math.max(1, tier.minQty - others);
                        updateMagnet(magnets[0].id, { qty: newFirstQty });
                        toast({
                          title: `Tier applied: ₹${tier.perPiece}/- each`,
                          description: `Quantity set to ${tier.minQty} magnets`,
                        });
                      }}
                      className={cn(
                        "rounded-lg border-2 p-3 text-center transition-all cursor-pointer hover:border-primary hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/40",
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/60"
                      )}
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        Buy any
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {tier.minQty}+ More
                      </p>
                      <p className="text-sm text-primary font-semibold mt-1">
                        ₹{tier.perPiece}/- Each
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Magnets list */}
            <div className="space-y-4">
              {magnets.map((m, idx) => {
                const shapeDef = SHAPE_OPTIONS.find((s) => s.id === m.shape);
                return (
                <div
                  key={m.id}
                  className="rounded-xl border-2 border-primary/30 p-4 space-y-4 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Magnet {idx + 1}
                    </p>
                    {magnets.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMagnet(m.id)}
                        className="text-destructive hover:bg-destructive/10 h-8 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* LIVE PREVIEW */}
                  <div className="rounded-lg bg-gradient-to-br from-muted/40 to-muted/10 border border-border p-4 flex flex-col items-center gap-2">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Live Preview
                    </p>
                    <div
                      ref={(el) => (previewRefs.current[m.id] = el)}
                      className="relative w-40 h-40 flex items-center justify-center"
                    >
                      {m.preview ? (
                        <div
                          className="w-full h-full bg-white shadow-lg overflow-hidden transition-all duration-300"
                          style={{
                            clipPath: shapeDef?.clip,
                            WebkitClipPath: shapeDef?.clip,
                          }}
                        >
                          <img
                            src={m.preview}
                            alt={`Magnet ${idx + 1} preview`}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border"
                          style={{
                            clipPath: shapeDef?.clip,
                            WebkitClipPath: shapeDef?.clip,
                          }}
                        >
                          <Upload className="h-6 w-6 mb-1" />
                          <span className="text-[10px]">Upload photo</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Shape: <strong className="text-foreground">{shapeDef?.label}</strong> · Qty: <strong className="text-foreground">{m.qty}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Upload */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Upload Photo
                      </label>
                      <FileUploader
                        preview={m.preview}
                        onFile={(f) => handleFileSelect(m.id, f)}
                        onClear={() =>
                          updateMagnet(m.id, { file: null, preview: null })
                        }
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Qty
                      </label>
                      <select
                        value={m.qty}
                        onChange={(e) =>
                          updateMagnet(m.id, { qty: parseInt(e.target.value) })
                        }
                        className="w-full h-11 px-3 rounded-lg border-2 border-border bg-background text-foreground text-sm font-medium"
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(
                          (n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Shape selector */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Shape
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {SHAPE_OPTIONS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateMagnet(m.id, { shape: s.id })}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all",
                            m.shape === s.id
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <span className="text-xl leading-none">{s.emoji}</span>
                          <span className="text-[10px] font-medium text-foreground leading-tight text-center">
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}

              <Button
                variant="outline"
                onClick={addAnotherMagnet}
                className="w-full h-12 gap-2 border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
              >
                <Plus className="h-4 w-4" /> Add Another Photo
              </Button>
            </div>

            {/* Price summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total Magnets: <strong>{totalQty}</strong>
                </span>
                <span className="text-muted-foreground">
                  Each: <strong>₹{perPiece}</strong>
                </span>
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-muted-foreground line-through text-lg">
                  ₹{totalMrp.toLocaleString()}
                </span>
                <span className="text-3xl font-heading font-bold text-foreground">
                  ₹{totalPrice.toLocaleString()}
                </span>
                {discountPercent > 0 && (
                  <span className="bg-success text-success-foreground text-sm font-semibold px-3 py-1 rounded-full">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-xs text-success font-medium">
                ✓ Free Shipping · Inclusive of all taxes
              </p>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={handleAddToCart}
                disabled={isSubmitting}
                className="h-14 text-base font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Add to Cart"
                )}
              </Button>
              <Button
                size="lg"
                onClick={handleBuyNow}
                disabled={isSubmitting}
                className="h-14 text-base font-semibold bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Buy Now"
                )}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Strong Magnets</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">HD Print Quality</span>
              </div>
            </div>
          </div>
        </div>

        <ProductDetailsBlock
          productId={id || product.id}
          category="fridge-magnet"
          description={product.description || undefined}
        />
      </section>

      <Footer />
    </div>
  );
};

interface FileUploaderProps {
  preview: string | null;
  onFile: (f: File | null) => void;
  onClear: () => void;
}

const FileUploader = ({ preview, onFile, onClear }: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  if (preview) {
    return (
      <div className="relative h-11 w-full rounded-lg border-2 border-success bg-success/5 flex items-center px-3 gap-2">
        <img
          src={preview}
          alt="preview"
          className="h-7 w-7 rounded object-cover"
        />
        <span className="text-xs font-medium text-success truncate flex-1">
          Photo uploaded
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Remove photo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="w-full h-11 gap-2 border-2 border-primary text-primary hover:bg-primary/5"
      >
        <Upload className="h-4 w-4" />
        Upload
      </Button>
    </>
  );
};

export default FridgeMagnetCustomize;
