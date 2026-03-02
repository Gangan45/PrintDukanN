import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CreditCard, Check, Tag, X, Loader2, Wallet } from "lucide-react";
import { AvailableCoupons } from "@/components/cart/AvailableCoupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";

const CART_STORAGE_KEY = "printdukan_cart";
import { useCoupon } from "@/hooks/useCoupon";
import { useRazorpay } from "@/hooks/useRazorpay";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AppliedCoupon {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discountAmount: number;
}

interface CheckoutItem {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  selected_size: string | null;
  selected_frame: string | null;
  custom_image_url: string | null;
  custom_text: string | null;
  product_name: string | null;
  category: string | null;
  product_image?: string;
}

const BUY_NOW_STORAGE_KEY = "printdukan_buynow";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get("buynow") === "true";
  
  const { cartItems, getCartTotal, clearCart, loading: cartLoading } = useCart();
  const { appliedCoupon, loading: couponLoading, applyCoupon, removeCoupon, incrementCouponUsage } = useCoupon();
  const { initiatePayment, loading: paymentLoading } = useRazorpay();
  
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("razorpay");
  

  // Payment-based discounts
  const ONLINE_PAYMENT_DISCOUNT_PERCENT = 10;
  const COD_ADVANCE_AMOUNT = 199;
  
  // Get coupon from cart page if passed
  const [passedCoupon, setPassedCoupon] = useState<AppliedCoupon | null>(null);
  
  useEffect(() => {
    if (location.state?.coupon) {
      setPassedCoupon(location.state.coupon);
    }
  }, [location.state]);

  // Load checkout items (from cart or buy now)
  useEffect(() => {
    if (isBuyNow) {
      const buyNowData = localStorage.getItem(BUY_NOW_STORAGE_KEY);
      if (buyNowData) {
        const item = JSON.parse(buyNowData);
        setCheckoutItems([item]);
      }
    } else {
      setCheckoutItems(cartItems);
    }
  }, [isBuyNow, cartItems]);

  const activeCoupon = appliedCoupon || passedCoupon;
  const cartTotal = checkoutItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const couponDiscount = activeCoupon?.discountAmount || 0;
  
  // Calculate online payment discount (10%)
  const onlinePaymentDiscount = paymentMethod === "razorpay" 
    ? Math.round((cartTotal - couponDiscount) * ONLINE_PAYMENT_DISCOUNT_PERCENT / 100) 
    : 0;
  
  const totalDiscount = couponDiscount + onlinePaymentDiscount;
  const shippingCost = 0;
  const finalTotal = cartTotal - totalDiscount + shippingCost;
  
  
  const [shippingData, setShippingData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });

  const handleApplyCoupon = async () => {
    const success = await applyCoupon(couponCode, cartTotal);
    if (success) {
      setCouponCode("");
      setPassedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setPassedCoupon(null);
  };

  // Handle going back - move buy now item to cart if needed
  const handleGoBack = () => {
    if (isBuyNow) {
      const buyNowData = localStorage.getItem(BUY_NOW_STORAGE_KEY);
      if (buyNowData) {
        const buyNowItem = JSON.parse(buyNowData);
        // Get existing cart items
        const existingCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
        // Add buy now item to cart with a new cart id
        const cartItem = {
          ...buyNowItem,
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        existingCart.push(cartItem);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingCart));
        // Clear buy now storage
        localStorage.removeItem(BUY_NOW_STORAGE_KEY);
      }
    }
    navigate("/cart");
  };

  const generateOrderNumber = () => {
    const prefix = "ORD";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    const required = ["fullName", "phone", "address", "city", "state", "pincode"];
    for (const field of required) {
      if (!shippingData[field as keyof typeof shippingData].trim()) {
        toast({ title: "Error", description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, variant: "destructive" });
        return false;
      }
    }
    if (!/^\d{10}$/.test(shippingData.phone)) {
      toast({ title: "Error", description: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return false;
    }
    if (!/^\d{6}$/.test(shippingData.pincode)) {
      toast({ title: "Error", description: "Please enter a valid 6-digit pincode", variant: "destructive" });
      return false;
    }
    return true;
  };

  const getDisplayImage = (item: CheckoutItem) => {
    if (item.product_image) return item.product_image;
    return "/placeholder.svg";
  };

  const createOrderInDB = async () => {
    const newOrderNumber = generateOrderNumber();
    const shippingAddress = `${shippingData.fullName}\n${shippingData.phone}\n${shippingData.address}${shippingData.landmark ? `, ${shippingData.landmark}` : ""}\n${shippingData.city}, ${shippingData.state} - ${shippingData.pincode}`;

    // Create guest order without user_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: newOrderNumber,
        total_amount: finalTotal,
        shipping_address: shippingAddress,
        status: "pending",
        coupon_code: activeCoupon?.code || null,
        coupon_discount: totalDiscount,
        payment_method: paymentMethod,
        guest_name: shippingData.fullName,
        guest_phone: shippingData.phone
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = checkoutItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id || "custom",
      product_name: item.product_name || "Custom Product",
      product_image: item.product_image || "/placeholder.svg",
      quantity: item.quantity,
      unit_price: item.unit_price,
      ...(item.selected_size && { selected_size: item.selected_size }),
      ...(item.selected_frame && { selected_frame: item.selected_frame }),
      ...(item.custom_image_url && { custom_image_url: item.custom_image_url }),
      ...(item.custom_text && { custom_text: item.custom_text }),
      ...(item.category && { category: item.category }),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData as any);

    if (itemsError) throw itemsError;

    // Send admin notification
    try {
      await supabase.functions.invoke("send-admin-notification", {
        body: {
          orderId: order.id,
          orderNumber: newOrderNumber,
          customerName: shippingData.fullName,
          customerPhone: shippingData.phone,
          shippingAddress: shippingAddress,
          totalAmount: finalTotal,
          items: orderItemsData,
        },
      });
    } catch (notifyError) {
      console.error("Failed to send admin notification:", notifyError);
    }

    return { order, newOrderNumber };
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;
    
    setIsProcessing(true);
    try {
      if (paymentMethod === "razorpay") {
        const tempOrderNumber = generateOrderNumber();
        
        const paymentResult = await initiatePayment(
          finalTotal,
          shippingData.fullName,
          "",
          shippingData.phone,
          `Order #${tempOrderNumber}`
        );

        if (paymentResult.success) {
          const orderResult = await createOrderInDB();
          if (!orderResult) {
            setIsProcessing(false);
            toast({ title: "Error", description: "Payment was successful but order creation failed. Please contact support.", variant: "destructive" });
            return;
          }

          await supabase
            .from("orders")
            .update({
              razorpay_order_id: paymentResult.order_id,
              razorpay_payment_id: paymentResult.payment_id,
              status: "confirmed"
            })
            .eq("id", orderResult.order.id);

          if (activeCoupon?.code) {
            await incrementCouponUsage(activeCoupon.code);
          }

          // Clear cart or buy now item
          if (isBuyNow) {
            localStorage.removeItem(BUY_NOW_STORAGE_KEY);
          } else {
            await clearCart();
          }
          
          setOrderNumber(orderResult.newOrderNumber);
          setOrderComplete(true);
          toast({ title: "Success", description: "Payment successful! Order placed." });
        } else {
          if (paymentResult.error !== "Payment cancelled by user") {
            toast({ title: "Payment Failed", description: paymentResult.error || "Payment could not be completed", variant: "destructive" });
          }
        }
      } else {
        // COD: Require ₹199 advance payment
        const tempOrderNumber = generateOrderNumber();
        
        const paymentResult = await initiatePayment(
          COD_ADVANCE_AMOUNT,
          shippingData.fullName,
          "",
          shippingData.phone,
          `COD Advance for Order #${tempOrderNumber}`
        );

        if (paymentResult.success) {
          const orderResult = await createOrderInDB();
          if (!orderResult) {
            setIsProcessing(false);
            toast({ title: "Error", description: "Advance payment was successful but order creation failed. Please contact support.", variant: "destructive" });
            return;
          }

          await supabase
            .from("orders")
            .update({
              razorpay_order_id: paymentResult.order_id,
              razorpay_payment_id: paymentResult.payment_id,
              status: "confirmed",
              payment_method: "cod"
            })
            .eq("id", orderResult.order.id);

          if (activeCoupon?.code) {
            await incrementCouponUsage(activeCoupon.code);
          }

          if (isBuyNow) {
            localStorage.removeItem(BUY_NOW_STORAGE_KEY);
          } else {
            await clearCart();
          }
          
          setOrderNumber(orderResult.newOrderNumber);
          setOrderComplete(true);
          toast({ title: "Success", description: `Advance payment of ₹${COD_ADVANCE_AMOUNT} received! Order confirmed. Pay ₹${Math.max(0, finalTotal - COD_ADVANCE_AMOUNT).toLocaleString()} on delivery.` });
        } else {
          if (paymentResult.error !== "Payment cancelled by user") {
            toast({ title: "Advance Payment Failed", description: paymentResult.error || "Please complete the advance payment to confirm your order", variant: "destructive" });
          }
        }
      }
    } catch (error: any) {
      console.error("Order error:", error);
      toast({ title: "Error", description: error.message || "Failed to place order", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartLoading && !isBuyNow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-4">
              Your order <span className="font-mono font-semibold text-foreground">{orderNumber}</span> has been placed successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You will receive an email confirmation shortly with tracking details.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-4">Add some products to checkout</p>
            <Button onClick={() => navigate("/")}>Start Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 sm:pb-8">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="h-10 w-10 rounded-full bg-muted/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Checkout</h1>
        </div>

        {/* Progress Steps - Enhanced for mobile */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 bg-card rounded-2xl p-4 shadow-sm border">
          {[
            { num: 1, label: "Shipping", icon: MapPin },
            { num: 2, label: "Payment", icon: CreditCard }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${step >= s.num ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted"}`}>
                  {step > s.num ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm sm:text-base font-semibold">{s.label}</span>
              </div>
              {i < 1 && <div className={`w-10 sm:w-16 h-1 mx-2 sm:mx-3 rounded-full transition-all ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6 order-2 lg:order-1">
            {step === 1 && (
              <Card className="border-0 shadow-md sm:border sm:shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                      <Input 
                        id="fullName" 
                        name="fullName" 
                        value={shippingData.fullName} 
                        onChange={handleInputChange} 
                        className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel"
                        value={shippingData.phone} 
                        onChange={handleInputChange} 
                        maxLength={10} 
                        className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                    <Textarea 
                      id="address" 
                      name="address" 
                      value={shippingData.address} 
                      onChange={handleInputChange} 
                      rows={3} 
                      className="text-base rounded-xl border-muted-foreground/20 focus:border-primary resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landmark" className="text-sm font-medium">Landmark (Optional)</Label>
                    <Input 
                      id="landmark" 
                      name="landmark" 
                      value={shippingData.landmark} 
                      onChange={handleInputChange} 
                      className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={shippingData.city} 
                        onChange={handleInputChange} 
                        className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        value={shippingData.state} 
                        onChange={handleInputChange} 
                        className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <Label htmlFor="pincode" className="text-sm font-medium">Pincode *</Label>
                      <Input 
                        id="pincode" 
                        name="pincode" 
                        type="tel"
                        value={shippingData.pincode} 
                        onChange={handleInputChange} 
                        maxLength={6} 
                        className="h-12 text-base rounded-xl border-muted-foreground/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  {/* Desktop button */}
                  <Button 
                    className="w-full mt-4 h-12 text-base font-semibold rounded-xl hidden sm:flex" 
                    onClick={() => validateShipping() && setStep(2)}
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="border-0 shadow-md sm:border sm:shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="p-4 bg-muted/50 rounded-xl border border-muted">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Delivering to</p>
                    <p className="font-semibold text-base">{shippingData.fullName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{shippingData.phone}</p>
                    <p className="text-sm text-muted-foreground">{shippingData.address}</p>
                    <p className="text-sm text-muted-foreground">{shippingData.city}, {shippingData.state} - {shippingData.pincode}</p>
                    <Button variant="link" className="p-0 h-auto mt-3 text-primary font-medium" onClick={() => setStep(1)}>
                      Change Address
                    </Button>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cod" | "razorpay")} className="space-y-3">
                    <div 
                      className={`relative flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"}`}
                      onClick={() => setPaymentMethod("razorpay")}
                    >
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-base">Pay Online</p>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full">10% OFF</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">UPI, Cards, Net Banking, Wallets</p>
                        </div>
                      </Label>
                    </div>
                    <div 
                      className={`relative flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"}`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-base">Cash on Delivery</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Pay ₹{COD_ADVANCE_AMOUNT} advance, rest on delivery</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "cod" && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">Advance Payment Required</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400/80">
                        To confirm your COD order, please pay ₹{COD_ADVANCE_AMOUNT} advance. The remaining ₹{Math.max(0, finalTotal - COD_ADVANCE_AMOUNT).toLocaleString()} will be collected on delivery.
                      </p>
                    </div>
                  )}

                  {/* Desktop buttons */}
                  <div className="hidden sm:flex gap-3 mt-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">
                      Back
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder} 
                      disabled={isProcessing || paymentLoading}
                      className="flex-1 h-12 rounded-xl font-semibold"
                    >
                      {isProcessing || paymentLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : paymentMethod === "cod" ? (
                        `Pay ₹${COD_ADVANCE_AMOUNT} Advance`
                      ) : (
                        `Pay ₹${finalTotal.toLocaleString()}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="order-1 lg:order-2">
            <Card className="lg:sticky lg:top-24 border-0 shadow-md sm:border sm:shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Summary
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    {checkoutItems.length} item{checkoutItems.length > 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto pr-1">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-2 bg-muted/30 rounded-xl">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getDisplayImage(item)}
                          alt={item.product_name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name || "Custom Product"}</p>
                        <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground mt-0.5">
                          {item.selected_size && <span>Size: {item.selected_size}</span>}
                          {item.selected_frame && <span>Frame: {item.selected_frame}</span>}
                        </div>
                        <p className="text-sm font-semibold mt-1 text-primary">
                          ₹{item.unit_price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon Section */}
                <div className="space-y-3">
                  {activeCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-600">{activeCoupon.code}</span>
                        <span className="text-xs text-emerald-600/70">applied</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 h-11 rounded-xl text-sm"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon} 
                        disabled={couponLoading || !couponCode}
                        className="h-11 px-4 rounded-xl"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                  <AvailableCoupons onApply={(code) => { setCouponCode(code); handleApplyCoupon(); }} cartTotal={cartTotal} />
                </div>

                <Separator />

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount</span>
                      <span className="font-medium">-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {onlinePaymentDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Online Payment Discount (10%)</span>
                      <span className="font-medium">-₹{onlinePaymentDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold pt-1">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="mt-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        COD requires ₹{COD_ADVANCE_AMOUNT} advance payment. Remaining ₹{Math.max(0, finalTotal - COD_ADVANCE_AMOUNT).toLocaleString()} payable on delivery.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t shadow-lg sm:hidden z-50">
        {step === 1 ? (
          <Button 
            className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20" 
            onClick={() => validateShipping() && setStep(2)}
          >
            Continue to Payment
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)} 
              className="h-14 px-6 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handlePlaceOrder} 
              disabled={isProcessing || paymentLoading}
              className="flex-1 h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20"
            >
              {isProcessing || paymentLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : paymentMethod === "cod" ? (
                `Pay ₹${COD_ADVANCE_AMOUNT} Advance`
              ) : (
                `Pay ₹${finalTotal.toLocaleString()}`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
