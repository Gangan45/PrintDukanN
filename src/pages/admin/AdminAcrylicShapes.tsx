import { useEffect, useState } from "react";
import { Loader2, Search, Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProductShape, shapeLabel } from "@/components/customize/ShapeMask";

interface ShapeRow {
  id: string;
  name: string;
  category: string;
  shape: string | null;
  images: string[] | null;
  dirty?: boolean;
}

const SHAPES: ProductShape[] = [
  "portrait", "landscape", "square", "circle",
  "balloon", "bean", "egg", "squircle", "collage", "dual-border"
];

const AdminAcrylicShapes = () => {
  const [rows, setRows] = useState<ShapeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,category,shape,images')
        .ilike('category', '%acrylic%')
        .order('name');
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setRows((data || []) as ShapeRow[]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleChange = (id: string, shape: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, shape, dirty: true } : r));
  };

  const handleSaveAll = async () => {
    const dirty = rows.filter(r => r.dirty);
    if (!dirty.length) {
      toast({ title: "Nothing to save", description: "No changes pending." });
      return;
    }
    setSaving(true);
    let ok = 0, fail = 0;
    for (const r of dirty) {
      const { error } = await supabase
        .from('products')
        .update({ shape: r.shape } as any)
        .eq('id', r.id);
      if (error) fail++; else ok++;
    }
    setSaving(false);
    setRows(prev => prev.map(r => r.dirty ? { ...r, dirty: false } : r));
    toast({
      title: "Saved",
      description: `${ok} updated${fail ? `, ${fail} failed` : ''}.`,
      variant: fail ? "destructive" : "default",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dirtyCount = rows.filter(r => r.dirty).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Acrylic Product Shapes</h1>
          <p className="text-muted-foreground">
            Assign the shape used by the OMGS-style customizer for every Acrylic product.
            Auto-detected from product names — change here as needed.
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving || dirtyCount === 0} className="bg-coral hover:bg-coral-dark text-white">
          <Save className="h-4 w-4 mr-2" />
          Save {dirtyCount > 0 ? `(${dirtyCount})` : 'All'}
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-56">Shape</TableHead>
                <TableHead className="w-20">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.images?.[0] ? (
                      <img src={r.images[0]} alt={r.name} className="w-12 h-12 object-cover rounded-md border border-border" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.category}</TableCell>
                  <TableCell>
                    <Select value={r.shape || 'portrait'} onValueChange={(v) => handleChange(r.id, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SHAPES.map(s => (
                          <SelectItem key={s} value={s}>{shapeLabel[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {r.dirty && <Badge variant="secondary" className="bg-amber-100 text-amber-700">unsaved</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No products match.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAcrylicShapes;
