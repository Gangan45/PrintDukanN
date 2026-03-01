import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface BuyNowParams {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity?: number;
  selectedSize?: string;
  selectedFrame?: string;
  customImageUrl?: string | File;
  customText?: string;
  category?: string;
}

const BUY_NOW_STORAGE_KEY = "printdukan_buynow";

export const useBuyNow = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const buyNow = async (params: BuyNowParams): Promise<boolean> => {
    setLoading(true);
    try {
      // Handle custom image - convert File to base64 for localStorage
      let finalImageUrl: string | null = null;
      if (params.customImageUrl) {
        if (params.customImageUrl instanceof File) {
          const file = params.customImageUrl;
          finalImageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        } else if (typeof params.customImageUrl === 'string') {
          finalImageUrl = params.customImageUrl;
        }
      }

      // Store buy now item in localStorage
      const buyNowItem = {
        id: `buynow_${Date.now()}`,
        product_id: params.productId || null,
        quantity: params.quantity || 1,
        unit_price: params.price,
        selected_size: params.selectedSize || null,
        selected_frame: params.selectedFrame || null,
        custom_image_url: finalImageUrl,
        custom_text: params.customText || null,
        product_name: params.productName || null,
        category: params.category || null,
        product_image: params.productImage || null
      };

      localStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(buyNowItem));

      // Navigate directly to checkout with buy now flag
      navigate("/checkout?buynow=true");
      return true;
    } catch (error: any) {
      console.error("Buy now error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { buyNow, loading, requiresAuth: false, resetAuthRequired: () => {} };
};
