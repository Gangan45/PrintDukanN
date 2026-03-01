import { useState, useEffect } from "react";
import { Package, ShoppingCart, Users, TrendingUp, IndianRupee, Eye, Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: any[];
  topProducts: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch orders for revenue and count
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch recent orders with customer info
      const recentOrders = await Promise.all(
        (orders?.slice(0, 5) || []).map(async (order) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', order.user_id)
            .single();

          const { data: items } = await supabase
            .from('order_items')
            .select('product_name')
            .eq('order_id', order.id)
            .limit(1);

          return {
            id: order.order_number,
            customer: profile?.full_name || 'Customer',
            product: items?.[0]?.product_name || 'Multiple Items',
            amount: `₹${order.total_amount.toLocaleString()}`,
            status: order.status
          };
        })
      );

      // Fetch products with order counts
      const { data: products } = await supabase
        .from('products')
        .select('id, name, base_price')
        .eq('is_active', true)
        .limit(10);

      // Get order counts per product
      const topProducts = await Promise.all(
        (products || []).map(async (product) => {
          const { count: salesCount } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('product_name', product.name);

          return {
            name: product.name,
            sales: salesCount || 0,
            revenue: `₹${((salesCount || 0) * product.base_price).toLocaleString()}`,
            views: Math.floor(Math.random() * 1000) + 100 // Placeholder for views
          };
        })
      );

      // Sort by sales and take top 4
      topProducts.sort((a, b) => b.sales - a.sales);

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        recentOrders,
        topProducts: topProducts.slice(0, 4)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-500/20 text-emerald-500';
      case 'shipped': return 'bg-blue-500/20 text-blue-500';
      case 'processing': return 'bg-yellow-500/20 text-yellow-500';
      case 'confirmed': return 'bg-purple-500/20 text-purple-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-orange-500/20 text-orange-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsData = [
    { 
      title: "Total Revenue", 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      change: "+12.5%", 
      icon: IndianRupee, 
      color: "text-emerald-500" 
    },
    { 
      title: "Total Orders", 
      value: stats.totalOrders.toString(), 
      change: "+8.2%", 
      icon: ShoppingCart, 
      color: "text-blue-500" 
    },
    { 
      title: "Total Products", 
      value: stats.totalProducts.toString(), 
      change: "+3.1%", 
      icon: Package, 
      color: "text-purple-500" 
    },
    { 
      title: "Total Customers", 
      value: stats.totalCustomers.toString(), 
      change: "+15.3%", 
      icon: Users, 
      color: "text-orange-500" 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{order.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No products yet</p>
            ) : (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4 border-b border-border/50 pb-3 last:border-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{product.sales} sales</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.views}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-500">{product.revenue}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
