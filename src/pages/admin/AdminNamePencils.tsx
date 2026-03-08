import { useState, useEffect } from "react";
import { Pencil, Plus, Edit, Trash2, Loader2, Package, IndianRupee, ShoppingCart, Image as ImageIcon, X, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PricingTier {
  name: string;
  price: number;
}

interface NamePencilProduct {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  sizes: PricingTier[] | null;
  frames: any;
  is_active: boolean | null;
  is_customizable: boolean | null;
  quantity: number | null;
  created_at: string;
  updated_at: string;
}

interface NamePencilOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  user_id: string | null;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
    custom_text: string | null;
  }[];
}

const AdminNamePencils = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<NamePencilProduct[]>([]);
  const [orders, setOrders] = useState<NamePencilOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<NamePencilProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, activeProducts: 0 });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: 299,
    is_active: true,
    is_customizable: true,
    quantity: 100,
    cod_charges: 50,
  });
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    { name: "1 Pack", price: 299 },
    { name: "2+ Packs", price: 149 },
    { name: "5+ Packs", price: 129 },
    { name: "10+ Packs", price: 99 },
    { name: "20+ Packs", price: 89 },
    { name: "50+ Packs", price: 79 },
  ]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Name Pencils")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const parsed = (data || []).map((p) => ({
        ...p,
        sizes: Array.isArray(p.sizes) ? p.sizes : (p.sizes ? JSON.parse(JSON.stringify(p.sizes)) : []),
      }));
      setProducts(parsed);

      // Calc stats
      const active = parsed.filter((p) => p.is_active).length;
      setStats((s) => ({ ...s, totalProducts: parsed.length, activeProducts: active }));
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      // Get order items for Name Pencils category
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*, orders(*)")
        .eq("category", "Name Pencils");

      if (itemsError) throw itemsError;

      // Group by order
      const orderMap = new Map<string, NamePencilOrder>();
      (orderItems || []).forEach((item: any) => {
        const order = item.orders;
        if (!order) return;
        if (!orderMap.has(order.id)) {
          orderMap.set(order.id, {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            total_amount: order.total_amount,
            created_at: order.created_at,
            guest_name: order.guest_name,
            guest_email: order.guest_email,
            guest_phone: order.guest_phone,
            user_id: order.user_id,
            items: [],
          });
        }
        orderMap.get(order.id)!.items.push({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          custom_text: item.custom_text,
        });
      });

      const ordersList = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(ordersList);

      const totalRevenue = ordersList.reduce((sum, o) => {
        const pencilTotal = o.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
        return sum + pencilTotal;
      }, 0);
      setStats((s) => ({ ...s, totalOrders: ordersList.length, totalRevenue }));
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    } finally {
      setOrdersLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({ name: "", description: "", base_price: 299, is_active: true, is_customizable: true, quantity: 100, cod_charges: 50 });
    setPricingTiers([
      { name: "1 Pack", price: 299 },
      { name: "2+ Packs", price: 149 },
      { name: "5+ Packs", price: 129 },
      { name: "10+ Packs", price: 99 },
      { name: "20+ Packs", price: 89 },
      { name: "50+ Packs", price: 79 },
    ]);
    setImageUrls([]);
    setNewImageUrl("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: NamePencilProduct) => {
    setEditingProduct(product);
    const framesData = product.frames as any;
    const codCharges = framesData?.cod_charges ?? 50;
    setFormData({
      name: product.name,
      description: product.description || "",
      base_price: product.base_price,
      is_active: product.is_active ?? true,
      is_customizable: product.is_customizable ?? true,
      quantity: product.quantity ?? 100,
      cod_charges: codCharges,
    });
    setPricingTiers(
      Array.isArray(product.sizes) && product.sizes.length > 0
        ? (product.sizes as PricingTier[])
        : [
            { name: "1 Pack", price: 299 },
            { name: "2+ Packs", price: 149 },
            { name: "5+ Packs", price: 129 },
            { name: "10+ Packs", price: 99 },
            { name: "20+ Packs", price: 89 },
            { name: "50+ Packs", price: 79 },
          ]
    );
    setImageUrls(product.images || []);
    setNewImageUrl("");
    setIsDialogOpen(true);
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addPricingTier = () => {
    setPricingTiers([...pricingTiers, { name: "", price: 0 }]);
  };

  const removePricingTier = (index: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const updatePricingTier = (index: number, field: keyof PricingTier, value: string | number) => {
    const updated = [...pricingTiers];
    updated[index] = { ...updated[index], [field]: value };
    setPricingTiers(updated);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category: "Name Pencils",
        base_price: formData.base_price,
        is_active: formData.is_active,
        is_customizable: formData.is_customizable,
        quantity: formData.quantity,
        images: imageUrls.length > 0 ? imageUrls : null,
        sizes: pricingTiers as any,
        frames: { cod_charges: formData.cod_charges } as any,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);
        if (error) throw error;
        toast({ title: "Success", description: "Product added successfully" });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Product removed" });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (product: NamePencilProduct) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id);
      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-muted text-muted-foreground";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Pencil className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Name Pencils</h1>
            <p className="text-muted-foreground">Manage Name Pencil products, pricing & orders</p>
          </div>
        </div>
        <Button onClick={openAddDialog} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeProducts}</p>
                <p className="text-sm text-muted-foreground">Active Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products & Pricing</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {products.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Pencil className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Name Pencil products yet</h3>
                <p className="text-muted-foreground mb-4">Add your first Name Pencil product to get started</p>
                <Button onClick={openAddDialog} className="bg-amber-500 hover:bg-amber-600">
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {product.description || "No description"}
                        </p>

                        {/* Pricing tiers inline */}
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(product.sizes) &&
                            (product.sizes as PricingTier[]).map((tier, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                              >
                                {tier.name}: ₹{tier.price}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Switch
                          checked={product.is_active ?? false}
                          onCheckedChange={() => handleToggleActive(product)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Name Pencil orders yet</h3>
                <p className="text-muted-foreground">Orders with Name Pencil items will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Custom Text</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.guest_name || "Registered User"}</p>
                          <p className="text-xs text-muted-foreground">{order.guest_phone || order.guest_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.items.map((item, i) => (
                          <p key={i} className="text-sm">
                            {item.product_name} × {item.quantity}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell>
                        {order.items.map((item, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {item.custom_text || "-"}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.items.reduce((s, i) => s + i.unit_price * i.quantity, 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Name Pencil Product" : "Add Name Pencil Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Info</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Personalized Name Pencils"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>COD Charges (₹)</Label>
                  <Input
                    type="number"
                    value={formData.cod_charges}
                    onChange={(e) => setFormData({ ...formData, cod_charges: Number(e.target.value) })}
                    placeholder="e.g. 50"
                  />
                  <p className="text-xs text-muted-foreground">Set to 0 for free COD</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2 pt-2">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2 pt-2">
                  <Label>Customizable</Label>
                  <Switch
                    checked={formData.is_customizable}
                    onCheckedChange={(v) => setFormData({ ...formData, is_customizable: v })}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Bulk Pricing Tiers
                </h3>
                <Button variant="outline" size="sm" onClick={addPricingTier}>
                  <Plus className="h-3 w-3 mr-1" /> Add Tier
                </Button>
              </div>
              <div className="space-y-2">
                {pricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={tier.name}
                      onChange={(e) => updatePricingTier(index, "name", e.target.value)}
                      placeholder="e.g. 5+ Packs"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updatePricingTier(index, "price", Number(e.target.value))}
                        className="w-24"
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePricingTier(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Product Images</h3>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                />
                <Button variant="outline" onClick={handleAddImage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-20 object-cover rounded-lg border" />
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleSave} className="w-full bg-amber-500 hover:bg-amber-600" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNamePencils;
