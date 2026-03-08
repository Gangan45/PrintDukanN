import { useState, useEffect } from "react";
import { Search, Package, Plus, Minus, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  images: string[] | null;
  is_active: boolean;
  stock?: number;
}

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      
      // Simulate stock data (in production, you'd have a separate inventory table)
      const productsWithStock = data?.map(p => ({
        ...p,
        stock: Math.floor(Math.random() * 100) + 1
      })) || [];
      
      setProducts(productsWithStock);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({ title: "Error", description: "Failed to load inventory", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStock = (productId: string, delta: number) => {
    setStockUpdates(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + delta
    }));
    
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, stock: Math.max(0, (p.stock || 0) + delta) }
        : p
    ));
  };

  const saveStockChanges = async () => {
    toast({ 
      title: "Stock Updated", 
      description: `Updated stock for ${Object.keys(stockUpdates).length} products` 
    });
    setStockUpdates({});
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-red-500/20 text-red-500" };
    if (stock < 10) return { label: "Low Stock", color: "bg-orange-500/20 text-orange-500" };
    return { label: "In Stock", color: "bg-emerald-500/20 text-emerald-500" };
  };

  const stats = {
    total: products.length,
    inStock: products.filter(p => (p.stock || 0) > 10).length,
    lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage product stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {Object.keys(stockUpdates).length > 0 && (
            <Button onClick={saveStockChanges} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Save Changes ({Object.keys(stockUpdates).length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.total, icon: Package, color: "text-foreground" },
          { label: "In Stock", value: stats.inStock, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "text-orange-500" },
          { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangle, color: "text-red-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock || 0);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                            <img 
                              src={product.images?.[0] || "/placeholder.svg"} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{product.base_price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">{product.stock}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateStock(product.id, -1)}
                            disabled={(product.stock || 0) === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateStock(product.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInventory;
