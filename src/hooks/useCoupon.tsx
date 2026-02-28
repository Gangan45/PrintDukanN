import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
}

interface AppliedCoupon {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discountAmount: number;
}

export const useCoupon = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const applyCoupon = useCallback(async (code: string, cartTotal: number): Promise<boolean> => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (error || !coupon) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code is not valid or has expired",
          variant: "destructive"
        });
        return false;
      }

      // Check if expired
      if (new Date(coupon.expires_at) < new Date()) {
        toast({
          title: "Expired Coupon",
          description: "This coupon has expired",
          variant: "destructive"
        });
        return false;
      }

      // Check usage limit
      if (coupon.used_count >= coupon.max_uses) {
        toast({
          title: "Coupon Limit Reached",
          description: "This coupon has reached its maximum usage limit",
          variant: "destructive"
        });
        return false;
      }

      // Check minimum order amount
      if (cartTotal < coupon.min_order_amount) {
        toast({
          title: "Minimum Order Required",
          description: `Add ₹${(coupon.min_order_amount - cartTotal).toLocaleString()} more to use this coupon`,
          variant: "destructive"
        });
        return false;
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discount_type === "percentage") {
        discountAmount = Math.round((cartTotal * coupon.discount_value) / 100);
      } else {
        discountAmount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed cart total
      discountAmount = Math.min(discountAmount, cartTotal);

      setAppliedCoupon({
        code: coupon.code,
        discount_type: coupon.discount_type as "percentage" | "fixed",
        discount_value: coupon.discount_value,
        discountAmount
      });

      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${discountAmount.toLocaleString()}!`
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to apply coupon. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order"
    });
  }, [toast]);

  const recalculateDiscount = useCallback((cartTotal: number) => {
    if (!appliedCoupon) return;

    let discountAmount = 0;
    if (appliedCoupon.discount_type === "percentage") {
      discountAmount = Math.round((cartTotal * appliedCoupon.discount_value) / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }

    discountAmount = Math.min(discountAmount, cartTotal);

    setAppliedCoupon(prev => prev ? { ...prev, discountAmount } : null);
  }, [appliedCoupon]);

  const incrementCouponUsage = useCallback(async (code: string) => {
    try {
      // Use rpc or raw query to increment
      const { data: coupon } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("code", code)
        .single();

      if (coupon) {
        await supabase
          .from("coupons")
          .update({ used_count: coupon.used_count + 1 })
          .eq("code", code);
      }
    } catch (error) {
      console.error("Failed to increment coupon usage:", error);
    }
  }, []);

  return {
    appliedCoupon,
    loading,
    applyCoupon,
    removeCoupon,
    recalculateDiscount,
    incrementCouponUsage
  };
};