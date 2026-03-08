import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  key_id: string;
}

interface PaymentResult {
  success: boolean;
  payment_id?: string;
  order_id?: string;
  error?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const createOrder = useCallback(async (amount: number, receipt?: string): Promise<RazorpayOrder | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount, receipt },
      });

      if (error) {
        console.error("Error creating Razorpay order:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return null;
    }
  }, []);

  const verifyPayment = useCallback(async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    order_id?: string
  ): Promise<{ verified: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
        body: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          order_id,
        },
      });

      if (error) {
        console.error("Error verifying payment:", error);
        return { verified: false, error: error.message };
      }

      return { verified: data.verified };
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      return { verified: false, error: error.message };
    }
  }, []);

  const initiatePayment = useCallback(async (
    amount: number,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    description: string,
    dbOrderId?: string
  ): Promise<PaymentResult> => {
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        return { success: false, error: "Failed to load payment gateway" };
      }

      // Create order
      const order = await createOrder(amount);
      if (!order) {
        return { success: false, error: "Failed to create payment order" };
      }

      return new Promise((resolve) => {
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "PrintDukan",
          description: description,
          order_id: order.id,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: "#e11d48",
          },
          handler: async (response: RazorpayResponse) => {
            // Verify payment
            const verification = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              dbOrderId
            );

            if (verification.verified) {
              resolve({
                success: true,
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
              });
            } else {
              resolve({
                success: false,
                error: verification.error || "Payment verification failed",
              });
            }
          },
          modal: {
            ondismiss: () => {
              resolve({ success: false, error: "Payment cancelled by user" });
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      return { success: false, error: error.message || "Payment failed" };
    } finally {
      setLoading(false);
    }
  }, [loadRazorpayScript, createOrder, verifyPayment]);

  return {
    initiatePayment,
    loading,
  };
};
