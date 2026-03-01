import { useState, useEffect } from "react";
import { Search, Package, Plus, RefreshCw, Eye, FileText, Download, Phone, Mail } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BulkOrder {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  product_type: string;
  quantity: number;
  requirements: string;
  budget: number;
  deadline: string;
  status: "inquiry" | "quoted" | "negotiating" | "confirmed" | "in_production" | "delivered" | "cancelled";
  created_at: string;
}

// Mock data for bulk orders
const mockBulkOrders: BulkOrder[] = [
  { id: "1", company_name: "TechCorp India", contact_name: "Rajesh Verma", contact_email: "rajesh@techcorp.in", contact_phone: "+91 98765 43210", product_type: "Corporate Trophies", quantity: 500, requirements: "Need customized trophies for annual awards ceremony. Gold finish with company logo engraving.", budget: 150000, deadline: "2025-02-15", status: "confirmed", created_at: "2024-12-10" },
  { id: "2", company_name: "StartupHub", contact_name: "Meera Kapoor", contact_email: "meera@startuphub.co", contact_phone: "+91 87654 32109", product_type: "QR Standies", quantity: 1000, requirements: "QR standies for all member companies. Different QR codes for each, same design.", budget: 200000, deadline: "2025-01-30", status: "quoted", created_at: "2024-12-15" },
  { id: "3", company_name: "Hotel Grand", contact_name: "Sunil Mehta", contact_email: "sunil@hotelgrand.com", contact_phone: "+91 76543 21098", product_type: "Name Plates", quantity: 200, requirements: "Room number plates for all rooms. Brass finish with modern design.", budget: 80000, deadline: "2025-03-01", status: "inquiry", created_at: "2024-12-18" },
  { id: "4", company_name: "Fashion Week Ltd", contact_name: "Anita Roy", contact_email: "anita@fashionweek.in", contact_phone: "+91 65432 10987", product_type: "Acrylic Badges", quantity: 5000, requirements: "VIP, Media, and Guest badges for fashion week event.", budget: 250000, deadline: "2025-01-20", status: "in_production", created_at: "2024-12-05" },
];

const statusOptions = [
  { value: "inquiry", label: "Inquiry", color: "bg-blue-500/20 text-blue-500" },
  { value: "quoted", label: "Quoted", color: "bg-purple-500/20 text-purple-500" },
  { value: "negotiating", label: "Negotiating", color: "bg-orange-500/20 text-orange-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-emerald-500/20 text-emerald-500" },
  { value: "in_production", label: "In Production", color: "bg-yellow-500/20 text-yellow-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500/20 text-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/20 text-red-500" },
];

const AdminBulkOrders = () => {
  const [orders, setOrders] = useState<BulkOrder[]>(mockBulkOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<BulkOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    product_type: "",
    quantity: 0,
    requirements: "",
    budget: 0,
    deadline: "",
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (id: string, status: BulkOrder["status"]) => {
    setOrders(prev => prev.map(o => 
      o.id === id ? { ...o, status } : o
    ));
    toast({ title: "Updated", description: `Order status changed to ${status.replace("_", " ")}` });
  };

  const viewOrderDetails = (order: BulkOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const createOrder = () => {
    if (!newOrder.company_name || !newOrder.contact_email || !newOrder.product_type) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const order: BulkOrder = {
      id: Date.now().toString(),
      ...newOrder,
      status: "inquiry",
      created_at: new Date().toISOString().split('T')[0],
    };

    setOrders(prev => [order, ...prev]);
    setCreateOpen(false);
    setNewOrder({
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      product_type: "",
      quantity: 0,
      requirements: "",
      budget: 0,
      deadline: "",
    });
    toast({ title: "Created", description: "Bulk order inquiry created" });
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || "bg-muted text-muted-foreground";
  };

  const stats = {
    total: orders.length,
    active: orders.filter(o => ["inquiry", "quoted", "negotiating", "confirmed", "in_production"].includes(o.status)).length,
    totalValue: orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.budget, 0),
    confirmed: orders.filter(o => ["confirmed", "in_production", "delivered"].includes(o.status)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Bulk Orders</h1>
          <p className="text-muted-foreground">Manage corporate and bulk order inquiries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Bulk Order Inquiry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input 
                    value={newOrder.company_name}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input 
                      value={newOrder.contact_name}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, contact_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={newOrder.contact_phone}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, contact_phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={newOrder.contact_email}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Type *</Label>
                    <Input 
                      value={newOrder.product_type}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, product_type: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number"
                      value={newOrder.quantity || ""}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Budget (₹)</Label>
                    <Input 
                      type="number"
                      value={newOrder.budget || ""}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input 
                      type="date"
                      value={newOrder.deadline}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea 
                    rows={3}
                    value={newOrder.requirements}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>
                <Button onClick={createOrder} className="w-full">Create Inquiry</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Inquiries", value: stats.total, color: "text-foreground" },
          { label: "Active", value: stats.active, color: "text-blue-500" },
          { label: "Confirmed", value: stats.confirmed, color: "text-emerald-500" },
          { label: "Total Value", value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
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
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bulk orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.company_name}</p>
                        <p className="text-xs text-muted-foreground">{order.contact_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.product_type}</TableCell>
                    <TableCell className="font-mono">{order.quantity.toLocaleString()}</TableCell>
                    <TableCell>₹{order.budget.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(order.deadline), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value as BulkOrder["status"])}
                      >
                        <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(order.status)}`}>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewOrderDetails(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-lg">{selectedOrder.company_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedOrder.contact_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedOrder.contact_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedOrder.contact_phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Product Type</Label>
                <p className="font-medium">{selectedOrder.product_type}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Quantity</Label>
                  <p className="font-mono font-bold">{selectedOrder.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Budget</Label>
                  <p className="font-bold">₹{selectedOrder.budget.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Deadline</Label>
                  <p className="font-medium">{format(new Date(selectedOrder.deadline), "dd MMM yyyy")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Requirements</Label>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedOrder.requirements}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Quote
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBulkOrders;
