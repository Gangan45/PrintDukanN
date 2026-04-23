import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";

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

const BADGE_COLORS: Record<string, string> = {
  red: "bg-red-500 text-white",
  green: "bg-green-500 text-white",
  orange: "bg-orange-500 text-white",
  blue: "bg-blue-500 text-white",
  purple: "bg-purple-500 text-white",
};

export const CartOffersPopup = () => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<OfferConfig | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
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
      const cat = (detail.category || "").toLowerCase();
      const eligible = config.eligible_categories
        .map((c) => c.toLowerCase())
        .some((c) => cat.includes(c) || c.includes(cat));
      if (!eligible) return;

      // Throttle: once per session
      if (sessionStorage.getItem(SHOWN_FLAG)) return;
      sessionStorage.setItem(SHOWN_FLAG, "1");
      setOpen(true);
    };
    window.addEventListener("cart-offer-trigger", handler);
    return () => window.removeEventListener("cart-offer-trigger", handler);
  }, [config, items]);

  const handleClick = async (item: OfferItem) => {
    setBusyId(item.id);
    try {
      if (item.action_type === "add_to_cart") {
        const isFreeGift = item.price === 0;
        // For paid offer items, also treat as "gift-style" if price is 0; only paid extras for true free gifts.
        const giftPaidPrice = item.original_price && item.original_price > 0
          ? item.original_price
          : undefined;

        const ok = await addToCart({
          productId: item.product_id || `offer-${item.id}`,
          productName: item.title,
          productImage: item.image_url,
          quantity: 1,
          unitPrice: item.price,
          // Use offer-gift category to bypass the customizable check unless admin set a real category
          category: item.category_tag || "offer-gift",
          isFreeGift,
          giftPaidPrice,
        });
        if (ok) {
          setOpen(false);
        }
      } else {
        // redirect
        setOpen(false);
        navigate(item.link || "/");
      }
    } catch (err) {
      toast({
        title: "Couldn't add",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (!config?.is_enabled || items.length === 0) return null;

  // Split headline into 3 parts for styling: first word | middle | last word (preserves existing visual)
  const words = config.headline.split(" ");
  const firstWord = words[0] || "";
  const lastWord = words.length > 1 ? words[words.length - 1] : "";
  const middle = words.slice(1, -1).join(" ");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-0 gap-0">
        {/* Header */}
        <div className="bg-foreground text-background relative px-6 py-4">
          <h2 className="text-center text-lg sm:text-xl font-semibold">
            <span className="text-primary-foreground/90">{firstWord} </span>
            {middle && <span className="text-primary">{middle}</span>}
            {lastWord && lastWord !== firstWord && <span> {lastWord}</span>}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="bg-background px-6 pt-5 pb-3 text-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-4 bg-background max-h-[60vh] overflow-y-auto">
          {items.map((item) => {
            const badgeClass = BADGE_COLORS[item.badge_color] || BADGE_COLORS.red;
            const isBusy = busyId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item)}
                disabled={isBusy}
                className="group text-left border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 transition-all flex flex-col disabled:opacity-60 disabled:cursor-wait"
              >
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {item.badge_text && (
                    <span
                      className={`absolute top-3 right-3 ${badgeClass} text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}
                    >
                      {item.badge_text}
                    </span>
                  )}
                </div>
                <div className="p-3 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                    )}
                    <div className="flex items-baseline gap-2 justify-center mt-2">
                      {item.price === 0 ? (
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          FREE
                        </span>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-primary">₹{item.price}</p>
                          {item.original_price && item.original_price > item.price && (
                            <p className="text-xs text-muted-foreground line-through">
                              ₹{item.original_price}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-foreground text-background py-3 text-sm font-medium group-hover:bg-foreground/90 transition-colors text-center">
                  {isBusy ? "Adding..." : item.cta_text}
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
      </DialogContent>
    </Dialog>
  );
};
