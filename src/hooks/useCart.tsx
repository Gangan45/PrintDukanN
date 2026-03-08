import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string | null;
  quantity: number;
  selected_size: string | null;
  selected_frame: string | null;
  custom_image_url: string | null;
  custom_text: string | null;
  product_name: string | null;
  category: string | null;
  unit_price: number;
  product_image?: string;
}

interface AddToCartParams {
  productId: string;
  productName: string;
  productImage?: string;
  quantity?: number;
  selectedSize?: string;
  selectedFrame?: string;
  customImageUrl?: string | File;
  customText?: string;
  category?: string;
  unitPrice: number;
}

const CART_STORAGE_KEY = "printdukan_cart";

const getCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const items = getCartFromStorage();
    setCartItems(items);
    setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  const updateCartState = (items: CartItem[]) => {
    setCartItems(items);
    setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    saveCartToStorage(items);
  };

  const addToCart = async ({
    productId,
    productName,
    productImage,
    quantity = 1,
    selectedSize,
    selectedFrame,
    customImageUrl,
    customText,
    category,
    unitPrice
  }: AddToCartParams): Promise<boolean> => {
    setLoading(true);

    try {
      // Handle custom image - convert File to base64 for localStorage
      let finalImageUrl: string | null = null;
      if (customImageUrl) {
        if (customImageUrl instanceof File) {
          // Convert file to base64 for storage
          finalImageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(customImageUrl);
          });
        } else if (typeof customImageUrl === 'string') {
          finalImageUrl = customImageUrl;
        }
      }

      const currentCart = getCartFromStorage();

      // Check if similar item exists
      const existingIndex = currentCart.findIndex(
        item => 
          item.product_id === productId &&
          item.selected_size === (selectedSize || null) &&
          item.selected_frame === (selectedFrame || null)
      );

      if (existingIndex >= 0 && productId) {
        // Update quantity
        currentCart[existingIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          product_id: productId || null,
          quantity,
          selected_size: selectedSize || null,
          selected_frame: selectedFrame || null,
          custom_image_url: finalImageUrl,
          custom_text: customText || null,
          product_name: productName || null,
          category: category || null,
          unit_price: unitPrice,
          product_image: productImage || undefined
        };
        currentCart.push(newItem);
      }

      updateCartState(currentCart);

      toast({
        title: "Added to Cart",
        description: `${productName} added to your cart`
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(itemId);

    const currentCart = getCartFromStorage();
    const itemIndex = currentCart.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      currentCart[itemIndex].quantity = quantity;
      updateCartState(currentCart);
    }
    return true;
  };

  const removeFromCart = async (itemId: string) => {
    const currentCart = getCartFromStorage();
    const filtered = currentCart.filter(item => item.id !== itemId);
    updateCartState(filtered);
    
    toast({
      title: "Removed from Cart",
      description: "Item removed from your cart"
    });
    return true;
  };

  const clearCart = async () => {
    updateCartState([]);
    return true;
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  return {
    cartItems,
    cartCount,
    loading,
    requiresAuth: false,
    resetAuthRequired: () => {},
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    refreshCart: () => {
      const items = getCartFromStorage();
      setCartItems(items);
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    }
  };
};
