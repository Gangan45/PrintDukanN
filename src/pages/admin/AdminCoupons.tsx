import { useState, useEffect } from "react";
import { Search, Ticket, Plus, Trash2, Copy, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    min_order_amount: 0,
    max_uses: 100,
    expires_at: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons((data as Coupon[]) || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Coupon code "${code}" copied to clipboard` });
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setCoupons(prev => prev.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ));
      toast({ title: "Updated", description: "Coupon status updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCoupons(prev => prev.filter(c => c.id !== id));
      toast({ title: "Deleted", description: "Coupon removed successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const createCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value || !newCoupon.expires_at) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .insert({
          code: newCoupon.code.toUpperCase(),
          discount_type: newCoupon.discount_type,
          discount_value: newCoupon.discount_value,
          min_order_amount: newCoupon.min_order_amount,
          max_uses: newCoupon.max_uses,
          expires_at: new Date(newCoupon.expires_at).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCoupons(prev => [data as Coupon, ...prev]);
      setDialogOpen(false);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_amount: 0,
        max_uses: 100,
        expires_at: "",
      });
      toast({ title: "Created", description: `Coupon "${data.code}" created successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.is_active && new Date(c.expires_at) > new Date()).length,
    expired: coupons.filter(c => new Date(c.expires_at) < new Date()).length,
    totalUsed: coupons.reduce((sum, c) => sum + c.used_count, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input 
                  placeholder="e.g., SAVE20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select 
                    value={newCoupon.discount_type}
                    onValueChange={(v) => setNewCoupon(prev => ({ ...prev, discount_type: v as "percentage" | "fixed" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input 
                    type="number"
                    placeholder={newCoupon.discount_type === "percentage" ? "10" : "200"}
                    value={newCoupon.discount_value || ""}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Order Amount (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="500"
                    value={newCoupon.min_order_amount || ""}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input 
                    type="number"
                    placeholder="100"
                    value={newCoupon.max_uses || ""}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, max_uses: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input 
                  type="date"
                  value={newCoupon.expires_at}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
              <Button onClick={createCoupon} className="w-full" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: stats.total, color: "text-foreground" },
          { label: "Active", value: stats.active, color: "text-emerald-500" },
          { label: "Expired", value: stats.expired, color: "text-red-500" },
          { label: "Total Uses", value: stats.totalUsed, color: "text-blue-500" },
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
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No coupons found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expires_at) < new Date();
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{coupon.code}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(coupon.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.discount_type === "percentage" 
                          ? `${coupon.discount_value}%` 
                          : `₹${coupon.discount_value}`}
                      </TableCell>
                      <TableCell>₹{coupon.min_order_amount}</TableCell>
                      <TableCell>
                        <span className="font-mono">{coupon.used_count}/{coupon.max_uses}</span>
                      </TableCell>
                      <TableCell>{format(new Date(coupon.expires_at), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={
                          isExpired 
                            ? "bg-red-500/20 text-red-500"
                            : coupon.is_active 
                              ? "bg-emerald-500/20 text-emerald-500" 
                              : "bg-muted text-muted-foreground"
                        }>
                          {isExpired ? "Expired" : coupon.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                            disabled={isExpired}
                          >
                            {coupon.is_active ? "Disable" : "Enable"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => deleteCoupon(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

export default AdminCoupons;