import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Copy, Check, ChevronDown, ChevronUp, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  expires_at: string;
}

interface AvailableCouponsProps {
  onApply?: (code: string) => void;
  onApplyCoupon?: (code: string) => void;
  cartTotal: number;
}

export const AvailableCoupons = ({ onApply, onApplyCoupon, cartTotal }: AvailableCouponsProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, min_order_amount, expires_at")
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("discount_value", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Code Copied!",
      description: `${code} copied to clipboard`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (code: string) => {
    (onApply || onApplyCoupon)?.(code);
  };

  const isEligible = (minAmount: number) => cartTotal >= minAmount;

  if (loading || coupons.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Available Coupons</span>
          <Badge variant="secondary" className="text-xs">
            {coupons.length} offers
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border divide-y divide-border">
          {coupons.map((coupon) => {
            const eligible = isEligible(coupon.min_order_amount);
            const shortfall = coupon.min_order_amount - cartTotal;

            return (
              <div
                key={coupon.id}
                className={cn(
                  "p-4 transition-colors",
                  eligible ? "bg-background" : "bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-bold">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}% OFF`
                        : `₹${coupon.discount_value} OFF`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min order: ₹{coupon.min_order_amount}
                    </p>
                    {!eligible && (
                      <p className="text-xs text-amber-600 mt-1">
                        Add ₹{shortfall.toLocaleString()} more to unlock
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={eligible ? "default" : "outline"}
                    disabled={!eligible}
                    onClick={() => handleApply(coupon.code)}
                    className="shrink-0"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
