import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { LoginModal } from "@/components/auth/LoginModal";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PendingAction {
  type: 'add_to_cart' | 'buy_now';
  productId: string;
  productName: string;
  unitPrice: number;
  productImage?: string;
  returnPath: string;
}

interface AuthModalContextType {
  openLoginModal: (returnTo?: string, onSuccessCallback?: () => void) => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
  setPendingAction: (action: PendingAction | null) => void;
  getPendingAction: () => PendingAction | null;
  clearPendingAction: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

const PENDING_ACTION_KEY = 'pendingAuthAction';

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
};

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();

  // Store pending action in localStorage (survives OAuth redirect)
  const setPendingAction = useCallback((action: PendingAction | null) => {
    if (action) {
      localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
    } else {
      localStorage.removeItem(PENDING_ACTION_KEY);
    }
  }, []);

  const getPendingAction = useCallback((): PendingAction | null => {
    const stored = localStorage.getItem(PENDING_ACTION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const clearPendingAction = useCallback(() => {
    localStorage.removeItem(PENDING_ACTION_KEY);
  }, []);

  // Listen for auth changes and execute pending action after login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsOpen(false);
        setReturnTo(undefined);

        // Check for pending action after OAuth redirect
        const pendingAction = getPendingAction();
        if (pendingAction) {
          // Small delay to ensure session is fully established
          setTimeout(async () => {
            try {
              if (pendingAction.type === 'add_to_cart') {
                // Add to cart
                await supabase.from('cart_items').insert({
                  user_id: session.user.id,
                  product_id: pendingAction.productId,
                  product_name: pendingAction.productName,
                  unit_price: pendingAction.unitPrice,
                  quantity: 1,
                });
                // Navigate back to product page
                navigate(pendingAction.returnPath);
              } else if (pendingAction.type === 'buy_now') {
                // Clear cart first
                await supabase.from('cart_items').delete().eq('user_id', session.user.id);
                // Add the item
                await supabase.from('cart_items').insert({
                  user_id: session.user.id,
                  product_id: pendingAction.productId,
                  product_name: pendingAction.productName,
                  unit_price: pendingAction.unitPrice,
                  quantity: 1,
                });
                // Navigate to checkout
                navigate('/checkout');
              }
            } catch (error) {
              console.error('Error executing pending action:', error);
              // Navigate back to product page on error
              navigate(pendingAction.returnPath);
            } finally {
              clearPendingAction();
            }
          }, 500);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [getPendingAction, clearPendingAction, navigate]);

  const openLoginModal = useCallback((customReturnTo?: string) => {
    // Use current path as returnTo if not specified
    setReturnTo(customReturnTo || location.pathname);
    setIsOpen(true);
  }, [location.pathname]);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
    setReturnTo(undefined);
    clearPendingAction();
  }, [clearPendingAction]);

  return (
    <AuthModalContext.Provider value={{ 
      openLoginModal, 
      closeLoginModal, 
      isLoginModalOpen: isOpen,
      setPendingAction,
      getPendingAction,
      clearPendingAction
    }}>
      {children}
      <LoginModal 
        isOpen={isOpen} 
        onClose={closeLoginModal}
        returnTo={returnTo}
      />
    </AuthModalContext.Provider>
  );
};
