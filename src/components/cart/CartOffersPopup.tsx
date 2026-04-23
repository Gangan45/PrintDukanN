import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Type, Image as ImageIcon, Circle, Upload, ShoppingCart, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OfferItem {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  badge_color: string;
  image_url: string;
  price: number;
  original_price: number | null;
  cta_text: string;
  link: string;
  action_type: "add_to_cart" | "redirect";
  product_id: string | null;
  category_tag: string | null;
  display_order: number;
  is_active: boolean;
}

interface OfferConfig {
  id: string;
  is_enabled: boolean;
  headline: string;
  subtitle: string;
  eligible_categories: string[];
}

const SHOWN_FLAG = "cart_offers_shown_session";

type CustomizeMode = "text" | "photo" | "shape";

export const CartOffersPopup = () => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<OfferConfig | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<OfferItem | null>(null);
  const [mode, setMode] = useState<CustomizeMode>("photo");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load config + items once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cfgRes, itemsRes] = await Promise.all([
        supabase.from("cart_offers").select("*").limit(1).maybeSingle(),
        supabase
          .from("cart_offer_items")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
      ]);
      if (cancelled) return;
      if (cfgRes.data) {
        setConfig({
          id: cfgRes.data.id,
          is_enabled: cfgRes.data.is_enabled,
          headline: cfgRes.data.headline,
          subtitle: cfgRes.data.subtitle,
          eligible_categories: Array.isArray(cfgRes.data.eligible_categories)
            ? (cfgRes.data.eligible_categories as string[])
            : [],
        });
      }
      if (itemsRes.data) {
        setItems(
          (itemsRes.data as any[]).map((d) => ({
            id: d.id,
            title: d.title,
            subtitle: d.subtitle,
            badge_text: d.badge_text,
            badge_color: d.badge_color || "red",
            image_url: d.image_url,
            price: Number(d.price) || 0,
            original_price: d.original_price !== null && d.original_price !== undefined
              ? Number(d.original_price)
              : null,
            cta_text: d.cta_text,
            link: d.link,
            action_type: (d.action_type as "add_to_cart" | "redirect") || "add_to_cart",
            product_id: d.product_id,
            category_tag: d.category_tag,
            display_order: d.display_order,
            is_active: d.is_active,
          }))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for trigger event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ category?: string }>).detail || {};
      if (!config?.is_enabled || items.length === 0) return;
      const cat = (detail.category || "").toLowerCase().trim();
      if (!cat) return;
      const eligibleList = config.eligible_categories.map((c) => c.toLowerCase().trim()).filter(Boolean);
      const eligible =
        eligibleList.length === 0 ||
        eligibleList.some((c) => cat === c || cat.includes(c) || c.includes(cat));
      if (!eligible) return;
      const last = Number(sessionStorage.getItem(SHOWN_FLAG) || 0);
      if (Date.now() - last < 8000) return;
      sessionStorage.setItem(SHOWN_FLAG, String(Date.now()));
      setActiveItem(null);
      setPhotoData(null);
      setCustomText("");
      setOpen(true);
    };
    window.addEventListener("cart-offer-trigger", handler);
    return () => window.removeEventListener("cart-offer-trigger", handler);
  }, [config, items]);

  const resetCustomizer = () => {
    setActiveItem(null);
    setPhotoData(null);
    setCustomText("");
    setMode("photo");
  };

  const handleCardClick = (item: OfferItem) => {
    if (item.action_type === "redirect") {
      setOpen(false);
      navigate(item.link || "/");
      return;
    }
    // open inline customizer
    setActiveItem(item);
    setPhotoData(null);
    setCustomText("");
    setMode("photo");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 8MB allowed.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddCustomized = async () => {
    if (!activeItem) return;
    if (mode === "photo" && !photoData) {
      toast({ title: "Select a photo", description: "Please upload a photo first.", variant: "destructive" });
      return;
    }
    if (mode === "text" && !customText.trim()) {
      toast({ title: "Enter text", description: "Please type your custom text.", variant: "destructive" });
      return;
    }
    setBusyId(activeItem.id);
    try {
      const isFreeGift = activeItem.price === 0;
      const giftPaidPrice = activeItem.original_price && activeItem.original_price > 0
        ? activeItem.original_price
        : undefined;

      const ok = await addToCart({
        productId: activeItem.product_id || `offer-${activeItem.id}`,
        productName: activeItem.title,
        productImage: activeItem.image_url,
        quantity: 1,
        unitPrice: activeItem.price,
        category: activeItem.category_tag || "offer-gift",
        isFreeGift,
        giftPaidPrice,
        customImageUrl: photoData || undefined,
        customText: customText.trim() || undefined,
      });
      if (ok) {
        setOpen(false);
        resetCustomizer();
      }
    } catch {
      toast({ title: "Couldn't add", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  if (!config?.is_enabled || items.length === 0) return null;

  const words = config.headline.split(" ");
  const firstWord = words[0] || "";
  const lastWord = words.length > 1 ? words[words.length - 1] : "";
  const middle = words.slice(1, -1).join(" ");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetCustomizer();
      }}
    >
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-0 gap-0 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-foreground text-background relative px-6 py-3 sticky top-0 z-20">
          <h2 className="text-center text-base sm:text-lg font-semibold">
            <span className="text-background/90">{firstWord} </span>
            {middle && <span className="text-primary">{middle}</span>}
            {lastWord && lastWord !== firstWord && <span> {lastWord}</span>}
            <span className="text-primary"> !</span>
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-background/70 hover:text-background transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customizer view */}
        {activeItem ? (
          <div className="bg-background px-4 sm:px-6 pt-5 pb-6">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={resetCustomizer}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to offers
              </button>
            </div>
            <p className="text-center text-sm text-foreground mb-4">
              {activeItem.price === 0
                ? activeItem.subtitle || "Complimentary Gift For You!"
                : `Special cart offer ${activeItem.title}`}
            </p>

            {/* Mode toggle row */}
            <div className="mx-auto max-w-md border border-border rounded-lg p-2 mb-5">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode("text")}
                  className={cn(
                    "h-10 w-12 rounded-md border flex items-center justify-center transition-colors",
                    mode === "text"
                      ? "bg-background border-primary ring-2 ring-primary"
                      : "bg-background border-border hover:border-foreground/40"
                  )}
                  aria-label="Text"
                >
                  <Type className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode("photo")}
                  className={cn(
                    "h-10 w-12 rounded-md border flex items-center justify-center transition-colors",
                    mode === "photo"
                      ? "bg-foreground text-background border-foreground ring-2 ring-primary"
                      : "bg-foreground text-background border-foreground hover:opacity-90"
                  )}
                  aria-label="Photo"
                >
                  <span className="block h-5 w-5 bg-background/0 border-2 border-background rounded-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode("shape")}
                  className={cn(
                    "h-10 w-12 rounded-md border flex items-center justify-center transition-colors",
                    mode === "shape"
                      ? "bg-background border-primary ring-2 ring-primary"
                      : "bg-background border-border hover:border-foreground/40"
                  )}
                  aria-label="Shape"
                >
                  <Circle className="h-5 w-5 fill-foreground text-foreground" />
                </button>
              </div>
            </div>

            {/* Preview area */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-muted/50 border border-border rounded-2xl overflow-hidden flex items-center justify-center">
                {mode === "photo" && photoData ? (
                  <img src={photoData} alt="Your design" className="w-full h-full object-cover" />
                ) : mode === "text" && customText ? (
                  <div className="px-4 text-center text-foreground font-bold text-xl break-words">
                    {customText}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => mode === "photo" && fileInputRef.current?.click()}
                    className={cn(
                      "h-16 w-16 rounded-md flex items-center justify-center text-[10px] font-bold leading-tight text-white",
                      mode === "photo" ? "bg-primary hover:bg-primary/90 cursor-pointer" : "bg-primary/70"
                    )}
                  >
                    {mode === "photo" ? "SELECT\nPHOTO".split("\n").map((l, i) => <div key={i}>{l}</div>) : "PREVIEW"}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Mode-specific controls */}
              {mode === "text" && (
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={30}
                  placeholder="Type your text..."
                  className="w-full max-w-xs px-3 py-2 border border-border rounded-md text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              {mode === "photo" && photoData && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" /> Change photo
                </button>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2">
                {activeItem.original_price && activeItem.original_price > activeItem.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{activeItem.original_price}
                  </span>
                )}
                <span className="text-base font-bold text-foreground">
                  ₹{activeItem.price}
                </span>
              </div>
              {activeItem.price === 0 && (
                <p className="text-xs text-green-600 font-medium -mt-2">Only 2 left!</p>
              )}

              {/* Add to cart */}
              <Button
                onClick={handleAddCustomized}
                disabled={busyId === activeItem.id}
                className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 rounded-md uppercase tracking-wide"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {busyId === activeItem.id ? "Adding..." : "Add to Cart"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background rounded-md px-4"
              >
                No, Skip
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Subtitle */}
            <div className="bg-background px-6 pt-4 pb-2 text-center">
              <p className="text-sm text-muted-foreground">{config.subtitle}</p>
            </div>

            {/* Skip top */}
            <div className="flex justify-center pb-3 bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background rounded-md px-4"
              >
                No, Skip
              </Button>
            </div>

            {/* Offer cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 pb-4 bg-background">
              {items.map((item) => {
                const isFree = item.price === 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCardClick(item)}
                    className="group text-left border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 transition-all flex flex-col"
                  >
                    {/* Image area with corner ribbon badge */}
                    <div className="relative aspect-square bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {item.badge_text && (
                        <CornerRibbonBadge text={item.badge_text} variant={isFree ? "starburst" : "ribbon"} />
                      )}
                    </div>

                    {/* Title block */}
                    <div className="px-3 pt-3 pb-2 text-center bg-card">
                      <h3 className={cn(
                        "font-extrabold leading-tight",
                        isFree ? "text-primary text-xl sm:text-2xl" : "text-foreground text-base"
                      )}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-foreground/80 mt-1 font-medium">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {/* CTA bar */}
                    <div className="bg-foreground text-background py-2.5 text-sm font-medium group-hover:bg-foreground/90 transition-colors text-center mt-auto">
                      {item.cta_text || "Customize Now"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Skip bottom */}
            <div className="flex justify-center py-4 bg-background">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background rounded-md px-4"
              >
                No, Skip
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Corner badge — starburst (for FREE/Gift) or ribbon (for ₹99 etc.)
const CornerRibbonBadge = ({ text, variant }: { text: string; variant: "ribbon" | "starburst" }) => {
  if (variant === "starburst") {
    return (
      <div className="absolute -top-1 -left-1 z-10">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-primary drop-shadow-md">
            <polygon
              fill="currentColor"
              points="50,2 58,16 74,10 74,26 90,30 82,44 96,52 82,60 90,74 74,74 74,90 58,84 50,98 42,84 26,90 26,74 10,74 18,60 4,52 18,44 10,30 26,26 26,10 42,16"
            />
          </svg>
          <span className="relative text-primary-foreground font-extrabold text-xs sm:text-sm italic transform -rotate-12">
            {text}
          </span>
        </div>
      </div>
    );
  }
  // Ribbon variant — top-right diagonal banner
  return (
    <div className="absolute top-3 right-0 z-10">
      <div className="relative bg-primary text-primary-foreground px-3 py-1.5 pr-4 font-extrabold text-xs sm:text-sm shadow-md">
        <span className="relative z-10 leading-tight">{text}</span>
        {/* tail */}
        <div className="absolute -bottom-2 right-0 w-0 h-0 border-t-[8px] border-t-primary/70 border-r-[12px] border-r-transparent" />
      </div>
    </div>
  );
};
