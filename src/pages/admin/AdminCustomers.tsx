import { useState, useEffect } from "react";
import { Search, Users, Loader2, Mail, ShoppingBag, Eye, UserCheck } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Customer {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get orders data for each customer
      const customersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', profile.id);

          return {
            ...profile,
            orders_count: orders?.length || 0,
            total_spent: orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({ title: "Error", description: "Failed to load customers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const viewCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);

    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false });

      setCustomerOrders(orders || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-500/20 text-emerald-500';
      case 'shipped': return 'bg-blue-500/20 text-blue-500';
      case 'processing': return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-orange-500/20 text-orange-500';
    }
  };

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.orders_count > 0).length,
    new: customers.filter(c => {
      const created = new Date(c.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created > thirtyDaysAgo;
    }).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground">Manage your customer base</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: stats.total, icon: Users, color: "text-foreground" },
          { label: "Active Buyers", value: stats.active, icon: UserCheck, color: "text-emerald-500" },
          { label: "New (30 days)", value: stats.new, icon: Users, color: "text-blue-500" },
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: ShoppingBag, color: "text-gold" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {customer.avatar_url && <AvatarImage src={customer.avatar_url} />}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{customer.full_name || 'No Name'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{customer.email || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.orders_count}</Badge>
                    </TableCell>
                    <TableCell>₹{customer.total_spent.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(customer.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewCustomerDetails(customer)}>
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

      {/* Customer Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-16 w-16">
                  {selectedCustomer.avatar_url && <AvatarImage src={selectedCustomer.avatar_url} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedCustomer.full_name?.charAt(0) || selectedCustomer.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCustomer.full_name || 'No Name'}</h3>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedCustomer.email || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customer since {format(new Date(selectedCustomer.created_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border/50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{selectedCustomer.orders_count}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-emerald-500">₹{selectedCustomer.total_spent.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Orders */}
              <div>
                <h4 className="font-semibold mb-3">Order History</h4>
                {customerOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), "dd MMM yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{order.total_amount.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
