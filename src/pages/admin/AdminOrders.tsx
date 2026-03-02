import { useState, useEffect } from "react";
import { Search, Eye, Download, Package, RefreshCw, Image as ImageIcon, XCircle, AlertTriangle, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  selected_size: string | null;
  selected_frame: string | null;
  custom_image_url: string | null;
  custom_text: string | null;
  category: string | null;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
  payment_method: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  customer_email?: string;
  customer_name?: string;
  items?: OrderItem[];
}

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-orange-500/20 text-orange-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500/20 text-blue-500" },
  { value: "processing", label: "Processing", color: "bg-yellow-500/20 text-yellow-500" },
  { value: "shipped", label: "Shipped", color: "bg-purple-500/20 text-purple-500" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-500/20 text-emerald-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/20 text-red-500" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Cancellation state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [refundOrder, setRefundOrder] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch customer profiles
      const userIds = [...new Set(ordersData?.map(o => o.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedOrders = ordersData?.map(order => ({
        ...order,
        customer_email: profileMap.get(order.user_id)?.email || "N/A",
        customer_name: profileMap.get(order.user_id)?.full_name || "Customer",
      })) || [];

      setOrders(enrichedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Order change:", payload);
          if (payload.eventType === "INSERT") {
            fetchOrders();
          } else if (payload.eventType === "UPDATE") {
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id 
                ? { ...order, ...payload.new }
                : order
            ));
          } else if (payload.eventType === "DELETE") {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast({ title: "Updated", description: `Order status changed to ${newStatus}` });
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
    
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || "bg-muted text-muted-foreground";
  };

  // Open cancel dialog
  const openCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancellationReason("");
    setRefundOrder(false);
    setCancelDialogOpen(true);
  };

  // Handle admin cancellation
  const handleAdminCancel = async () => {
    if (!orderToCancel) return;

    try {
      const newStatus: OrderStatus = "cancelled";
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderToCancel.id);

      if (error) throw error;

      toast({ 
        title: "Order Cancelled", 
        description: `Order ${orderToCancel.order_number} has been cancelled${refundOrder ? " and marked for refund" : ""}` 
      });
      
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      setCancellationReason("");
      fetchOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast({ title: "Error", description: "Failed to cancel order", variant: "destructive" });
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => ["confirmed", "processing", "shipped"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage customer orders with real-time updates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchOrders} disabled={loading} className="h-9 w-9">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {/* <Button variant="outline" className="gap-2 h-9 text-xs sm:text-sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.pending, color: "text-orange-500" },
          { label: "In Progress", value: stats.processing, color: "text-blue-500" },
          { label: "Delivered", value: stats.delivered, color: "text-emerald-500" },
          { label: "Cancelled", value: stats.cancelled, color: "text-red-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="p-3 sm:pt-4">
              <p className="text-[10px] sm:text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Order ID</TableHead>
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Payment</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-right text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">₹{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {order.payment_method === "razorpay" ? (
                              <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Banknote className="h-3.5 w-3.5 text-orange-500" />
                            )}
                            <span className="text-xs font-medium">
                              {order.payment_method === "razorpay" ? "Razorpay" : "COD"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{format(new Date(order.created_at), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                          >
                            <SelectTrigger className={`w-28 h-7 text-xs ${getStatusColor(order.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewOrderDetails(order)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {order.status !== "cancelled" && order.status !== "delivered" && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-600"
                                onClick={() => openCancelDialog(order)}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3 bg-background/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{order.order_number}</p>
                        <p className="font-medium text-sm mt-0.5">{order.customer_name}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-[10px] px-2 py-0.5`}>
                        {statusOptions.find(s => s.value === order.status)?.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {order.payment_method === "razorpay" ? (
                          <CreditCard className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Banknote className="h-3 w-3 text-orange-500" />
                        )}
                        <span>{order.payment_method === "razorpay" ? "Razorpay" : "COD"}</span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">₹{order.total_amount.toLocaleString()}</span>
                    </div>
                    
                    <div className="text-[10px] text-muted-foreground">
                      {format(new Date(order.created_at), "dd MMM yyyy")}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                      >
                        <SelectTrigger className={`flex-1 h-8 text-xs ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => viewOrderDetails(order)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => openCancelDialog(order)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 sm:space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium text-sm">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm truncate">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium text-xs sm:text-sm">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-sm">{format(new Date(selectedOrder.created_at), "dd MMM yyyy")}</p>
                </div>
              </div>
              
              {selectedOrder.shipping_address && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground mb-2">Shipping Address</p>
                  <p className="text-xs sm:text-sm whitespace-pre-line bg-muted/50 p-2 sm:p-3 rounded-lg">{selectedOrder.shipping_address}</p>
                </div>
              )}

              {/* Order Items with Customization Details */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Order Items</p>
                <div className="space-y-3 sm:space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 sm:p-4 bg-card">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div 
                          className="w-14 h-14 sm:w-20 sm:h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => item.product_image && setImagePreview(item.product_image)}
                        >
                          <img 
                            src={item.product_image || "/placeholder.svg"} 
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-sm line-clamp-1">{item.product_name}</p>
                              {item.category && (
                                <Badge variant="secondary" className="mt-1 text-[10px]">
                                  {item.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              )}
                            </div>
                            <p className="font-bold text-sm sm:text-lg flex-shrink-0">₹{(item.quantity * item.unit_price).toLocaleString()}</p>
                          </div>
                          
                          {/* Variants */}
                          <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
                            {item.selected_size && (
                              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded text-muted-foreground">
                                Size: <span className="text-foreground font-medium">{item.selected_size}</span>
                              </span>
                            )}
                            {item.selected_frame && (
                              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded text-muted-foreground">
                                Variant: <span className="text-foreground font-medium">{item.selected_frame}</span>
                              </span>
                            )}
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded text-muted-foreground">
                              Qty: <span className="text-foreground font-medium">{item.quantity}</span>
                            </span>
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded text-muted-foreground">
                              ₹{item.unit_price}/unit
                            </span>
                          </div>
                          
                          {/* Custom Text */}
                          {item.custom_text && (
                            <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-primary/5 border border-primary/20 rounded">
                              <p className="text-[10px] text-muted-foreground mb-0.5">Custom Text:</p>
                              <p className="text-xs sm:text-sm text-foreground">{item.custom_text}</p>
                            </div>
                          )}
                          
                          {/* Custom Image Preview */}
                          {item.custom_image_url && (
                            <div className="mt-1.5 sm:mt-2">
                              <p className="text-[10px] text-muted-foreground mb-1">Uploaded Design:</p>
                              <div className="flex items-end gap-2 sm:gap-3">
                                <div 
                                  className="w-16 h-16 sm:w-24 sm:h-24 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border"
                                  onClick={() => setImagePreview(item.custom_image_url!)}
                                >
                                  <img 
                                    src={item.custom_image_url} 
                                    alt="Custom design"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setImagePreview(item.custom_image_url!)}
                                    className="h-7 text-[10px] sm:text-xs px-2"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = item.custom_image_url!;
                                      link.download = `design-${selectedOrder?.order_number}-${item.product_name.replace(/\s/g, '-')}.png`;
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      toast({ title: "Download Started", description: "Customer design is being downloaded" });
                                    }}
                                    className="h-7 text-[10px] sm:text-xs px-2"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-foreground">Payment Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {selectedOrder.payment_method === "razorpay" ? (
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Banknote className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="font-medium text-sm">
                        {selectedOrder.payment_method === "razorpay" ? "Razorpay (Online)" : "Cash on Delivery"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Status</p>
                    <Badge className={`mt-0.5 text-xs ${selectedOrder.payment_method === "razorpay" && selectedOrder.razorpay_payment_id ? "bg-emerald-500/20 text-emerald-600" : "bg-orange-500/20 text-orange-600"}`}>
                      {selectedOrder.payment_method === "razorpay" && selectedOrder.razorpay_payment_id ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
                
                {selectedOrder.payment_method === "razorpay" && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    {selectedOrder.razorpay_order_id && (
                      <div>
                        <p className="text-xs text-muted-foreground">Razorpay Order ID</p>
                        <p className="font-mono text-xs sm:text-sm text-foreground break-all">{selectedOrder.razorpay_order_id}</p>
                      </div>
                    )}
                    {selectedOrder.razorpay_payment_id && (
                      <div>
                        <p className="text-xs text-muted-foreground">Razorpay Payment ID</p>
                        <p className="font-mono text-xs sm:text-sm text-foreground break-all">{selectedOrder.razorpay_payment_id}</p>
                      </div>
                    )}
                    {selectedOrder.razorpay_signature && (
                      <div>
                        <p className="text-xs text-muted-foreground">Signature</p>
                        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground break-all truncate max-w-full">{selectedOrder.razorpay_signature}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-3 sm:pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-bold">₹{selectedOrder.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-xs`}>
                    {statusOptions.find(s => s.value === selectedOrder.status)?.label}
                  </Badge>
                </div>
              </div>

              {/* Admin Cancel Button in Details */}
              {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setDetailsOpen(false);
                      openCancelDialog(selectedOrder);
                    }}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog with Download */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Image Preview</span>
              {imagePreview && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imagePreview;
                    link.download = `customer-design-${Date.now()}.png`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast({ title: "Download Started", description: "Image is being downloaded" });
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {imagePreview && (
            <div className="flex items-center justify-center">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Cancel Order Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Order {orderToCancel?.order_number}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the order. The customer will be notified of the cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cancellation Reason (optional)</Label>
              <Textarea
                placeholder="Enter reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Process Refund</p>
                <p className="text-xs text-muted-foreground">Mark order as refunded instead of cancelled</p>
              </div>
              <input
                type="checkbox"
                checked={refundOrder}
                onChange={(e) => setRefundOrder(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAdminCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {refundOrder ? "Cancel & Refund" : "Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
