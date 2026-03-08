import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useCoupon } from "@/hooks/useCoupon";
import { AvailableCoupons } from "@/components/cart/AvailableCoupons";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, loading, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { appliedCoupon, loading: couponLoading, applyCoupon, removeCoupon } = useCoupon();
  const [couponCode, setCouponCode] = useState("");

  const cartTotal = getCartTotal();
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = cartTotal - discountAmount;

  const handleApplyCouponFromInput = async () => {
    const success = await applyCoupon(couponCode, cartTotal);
    if (success) {
      setCouponCode("");
    }
  };

  const handleApplyCouponFromDropdown = async (code: string) => {
    const success = await applyCoupon(code, cartTotal);
    if (success) {
      setCouponCode("");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Button onClick={() => navigate("/")} className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper function to get the display image
  const getDisplayImage = (item: any) => {
    if (item.product_image) return item.product_image;
    return "/placeholder.svg";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-4 sm:mb-8">
          Shopping Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
        </h1>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  {/* Product Image - Always show default product image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={getDisplayImage(item)}
                      alt={item.product_name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">
                      {item.product_name || "Custom Product"}
                    </h3>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1 mt-1">
                      {item.selected_size && (
                        <p>Size: {item.selected_size}</p>
                      )}
                      {item.selected_frame && (
                        <p className="truncate">Variant: {item.selected_frame}</p>
                      )}
                      {item.custom_image_url && (
                        <p className="text-xs text-primary">• Custom design</p>
                      )}
                    </div>
                    <p className="font-bold text-primary mt-1.5 sm:mt-2 text-sm sm:text-base">
                      ₹{item.unit_price.toLocaleString()}
                    </p>
                    
                    {/* Mobile Quantity Controls - below price */}
                    <div className="flex items-center justify-between mt-2 sm:hidden">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Quantity Controls */}
                  <div className="hidden sm:flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Order Summary
              </h2>

              {/* Coupon Section */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-emerald-600">{appliedCoupon.code}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={removeCoupon}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyCouponFromInput}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Available Coupons Dropdown */}
              {!appliedCoupon && (
                <div className="mb-4">
                  <AvailableCoupons 
                    onApplyCoupon={handleApplyCouponFromDropdown} 
                    cartTotal={cartTotal} 
                  />
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Coupon Discount</span>
                    <span className="font-medium text-emerald-600">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-primary">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => navigate("/checkout", { state: { coupon: appliedCoupon } })}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Link 
                to="/category/acrylic" 
                className="block text-center text-sm text-muted-foreground hover:text-primary mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
