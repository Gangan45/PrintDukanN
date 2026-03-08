import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, ShoppingBag, AlertTriangle, MapPin, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { addDays, format, differenceInDays } from "date-fns";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  created_at: string;
  items?: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; description: string; daysToAdd: number }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock, description: "Order received, awaiting confirmation", daysToAdd: 0 },
  confirmed: { label: "Confirmed", color: "bg-blue-500", icon: CheckCircle, description: "Order confirmed, preparing for dispatch", daysToAdd: 1 },
  processing: { label: "Processing", color: "bg-purple-500", icon: Package, description: "Order is being prepared", daysToAdd: 2 },
  shipped: { label: "Shipped", color: "bg-orange-500", icon: Truck, description: "On the way to your address", daysToAdd: 4 },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle, description: "Order delivered successfully", daysToAdd: 5 },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle, description: "Order has been cancelled", daysToAdd: 0 },
  refunded: { label: "Refunded", color: "bg-pink-500", icon: XCircle, description: "Payment has been refunded", daysToAdd: 0 },
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// Get estimated delivery date
const getEstimatedDelivery = (orderDate: string, status: string) => {
  const date = new Date(orderDate);
  if (status === 'delivered') {
    return { text: 'Delivered', date: null, daysLeft: 0 };
  }
  if (status === 'cancelled' || status === 'refunded') {
    return { text: 'N/A', date: null, daysLeft: 0 };
  }
  const estimatedDate = addDays(date, 5);
  const daysLeft = differenceInDays(estimatedDate, new Date());
  return { 
    text: format(estimatedDate, 'MMM d, yyyy'), 
    date: estimatedDate,
    daysLeft: Math.max(0, daysLeft)
  };
};

// Statuses that allow cancellation
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadOrders();
  }, []);

  const checkUserAndLoadOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/');
      return;
    }

    await loadOrders(session.user.id);
  };

  const loadOrders = async (userId: string) => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData && ordersData.length > 0) {
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);
            return { ...order, items: items || [] };
          })
        );
        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const canCancelOrder = (status: string) => {
    return CANCELLABLE_STATUSES.includes(status);
  };

  const openCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderToCancel.id);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderToCancel.id 
          ? { ...order, status: 'cancelled' }
          : order
      ));

      toast({
        title: "Order Cancelled",
        description: `Order ${orderToCancel.order_number} has been cancelled successfully.`,
      });

      setCancelDialogOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">Order History</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Track and manage your orders</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 sm:py-16 px-4">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center">
                  You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
                <Button onClick={() => navigate('/')} size="sm" className="sm:size-default">
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {orders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                const isExpanded = expandedOrder === order.id;
                const isCancellable = canCancelOrder(order.status);

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors p-3 sm:p-6"
                      onClick={() => toggleOrderExpand(order.id)}
                    >
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                          <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", config.color.replace('bg-', 'bg-opacity-20 bg-'))}>
                            <StatusIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", config.color.replace('bg-', 'text-').replace('-500', '-600'))} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <CardTitle className="text-sm sm:text-lg">Order</CardTitle>
                              <Badge className={cn("text-white text-xs sm:hidden shrink-0", config.color)}>
                                {config.label}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs sm:text-sm font-mono truncate">
                              #{order.order_number}
                            </CardDescription>
                            <CardDescription className="text-xs sm:text-sm mt-0.5">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <Badge className={cn("text-white hidden sm:inline-flex", config.color)}>
                            {config.label}
                          </Badge>
                          <span className="font-bold text-foreground text-sm sm:text-base">₹{order.total_amount}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="border-t border-border pt-3 sm:pt-4 px-3 sm:px-6">
                        {/* Estimated Delivery */}
                        {order.status !== 'cancelled' && order.status !== 'refunded' && (
                          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">Estimated Delivery</p>
                                  <p className="font-semibold text-sm sm:text-base text-foreground">
                                    {getEstimatedDelivery(order.created_at, order.status).text}
                                  </p>
                                </div>
                              </div>
                              {order.status !== 'delivered' && getEstimatedDelivery(order.created_at, order.status).daysLeft > 0 && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">
                                  {getEstimatedDelivery(order.created_at, order.status).daysLeft} days left
                                </Badge>
                              )}
                              {order.status === 'delivered' && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] sm:text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Delivered
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Order Timeline */}
                        <div className="mb-4 sm:mb-6">
                          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">ORDER TRACKING</h4>
                          
                          {/* Mobile: Vertical Timeline */}
                          <div className="sm:hidden space-y-0">
                            {statusSteps.map((status, idx) => {
                              const stepConfig = statusConfig[status];
                              const currentIdx = statusSteps.indexOf(order.status);
                              const isCompleted = idx <= currentIdx && order.status !== 'cancelled' && order.status !== 'refunded';
                              const isCurrent = status === order.status;
                              const StepIcon = stepConfig.icon;
                              
                              return (
                                <div key={status} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                                      isCompleted ? stepConfig.color + " text-white" : "bg-muted text-muted-foreground",
                                      isCurrent && "ring-2 ring-offset-1 ring-primary"
                                    )}>
                                      <StepIcon className="h-4 w-4" />
                                    </div>
                                    {idx < statusSteps.length - 1 && (
                                      <div className={cn(
                                        "w-0.5 h-8 my-1",
                                        isCompleted && idx < currentIdx ? stepConfig.color : "bg-muted"
                                      )} />
                                    )}
                                  </div>
                                  <div className="pb-4">
                                    <p className={cn(
                                      "font-medium text-sm",
                                      isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                      {stepConfig.label}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{stepConfig.description}</p>
                                    {isCurrent && order.status !== 'cancelled' && (
                                      <Badge className="mt-1 bg-primary/10 text-primary text-[10px] px-1.5">Current</Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Desktop: Horizontal Timeline */}
                          <div className="hidden sm:block">
                            <div className="flex items-start justify-between">
                              {statusSteps.map((status, idx) => {
                                const stepConfig = statusConfig[status];
                                const currentIdx = statusSteps.indexOf(order.status);
                                const isCompleted = idx <= currentIdx && order.status !== 'cancelled' && order.status !== 'refunded';
                                const isCurrent = status === order.status;
                                const StepIcon = stepConfig.icon;
                                
                                return (
                                  <div key={status} className="flex-1 relative">
                                    <div className="flex flex-col items-center">
                                      <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10",
                                        isCompleted ? stepConfig.color + " text-white" : "bg-muted text-muted-foreground",
                                        isCurrent && "ring-2 ring-offset-2 ring-primary"
                                      )}>
                                        <StepIcon className="h-5 w-5" />
                                      </div>
                                      <p className={cn(
                                        "mt-2 font-medium text-xs text-center",
                                        isCompleted ? "text-foreground" : "text-muted-foreground"
                                      )}>
                                        {stepConfig.label}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground text-center max-w-[80px] mt-0.5">
                                        {stepConfig.description}
                                      </p>
                                    </div>
                                    {idx < statusSteps.length - 1 && (
                                      <div className={cn(
                                        "absolute top-5 left-1/2 w-full h-0.5",
                                        isCompleted && idx < currentIdx ? stepConfig.color : "bg-muted"
                                      )} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {(order.status === 'cancelled' || order.status === 'refunded') && (
                            <div className="mt-3 p-2 sm:p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                This order has been {order.status}. {order.status === 'cancelled' ? 'If you paid, your refund will be processed within 5-7 business days.' : 'Your refund has been processed.'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">ORDER ITEMS</h4>
                            <div className="space-y-2 sm:space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-muted/30 rounded-lg">
                                  {item.product_image ? (
                                    <img 
                                      src={item.product_image} 
                                      alt={item.product_name}
                                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg shrink-0 flex items-center justify-center">
                                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-xs sm:text-sm line-clamp-2">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                  </div>
                                  <span className="font-semibold text-xs sm:text-sm shrink-0">₹{item.unit_price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Shipping Address */}
                        {order.shipping_address && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                            <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">SHIPPING ADDRESS</h4>
                            <p className="text-xs sm:text-sm text-foreground whitespace-pre-line">{order.shipping_address}</p>
                          </div>
                        )}

                        {/* Cancel Order Button */}
                        {isCancellable && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCancelDialog(order);
                              }}
                              className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                            >
                              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Cancel Order
                            </Button>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                              You can cancel this order as it hasn't been shipped yet.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0" />
              Cancel Order?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to cancel order <strong className="break-all">{orderToCancel?.order_number}</strong>? 
              This action cannot be undone. If you've already made a payment, a refund will be processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={cancelling} className="text-xs sm:text-sm">Keep Order</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Order"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
