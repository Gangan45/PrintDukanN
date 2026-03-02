import { useState, useEffect } from "react";
import { Loader2, Star, StarOff, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  images: string[] | null;
  is_featured: boolean;
}

const AdminFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, base_price, images, is_featured')
      .eq('is_active', true)
      .order('is_featured', { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const toggleFeatured = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: !product.is_featured })
      .eq('id', product.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: product.is_featured ? "Disabled" : "Enabled", description: `${product.name} ${product.is_featured ? 'removed from' : 'added to'} featured` });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p));
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = products.filter(p => p.is_featured).length;

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Featured Products</h1>
        <p className="text-muted-foreground">Enable/disable products to show in homepage Featured section ({featuredCount} enabled)</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Card key={p.id} className={`border-border/50 bg-card/50 backdrop-blur-sm transition-all ${p.is_featured ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-3">
              <div className="flex gap-3 items-center">
                <img src={p.images?.[0] || 'https://via.placeholder.com/80'} alt={p.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <p className="text-sm font-bold mt-0.5">₹{p.base_price}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Switch checked={p.is_featured ?? false} onCheckedChange={() => toggleFeatured(p)} />
                  <span className="text-[10px] text-muted-foreground">{p.is_featured ? "On" : "Off"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminFeaturedProducts;
