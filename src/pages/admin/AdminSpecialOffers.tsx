import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface SpecialOffer {
  id: string;
  title: string;
  subtitle: string;
  code: string | null;
  cta_text: string;
  link: string;
  gradient_from: string;
  gradient_to: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

const emptyOffer: Omit<SpecialOffer, 'id'> = {
  title: "",
  subtitle: "",
  code: null,
  cta_text: "Shop Now",
  link: "/",
  gradient_from: "primary",
  gradient_to: "coral-dark",
  icon_name: "Percent",
  display_order: 0,
  is_active: true,
};

const colorOptions = [
  { value: "primary", label: "Primary (Orange)" },
  { value: "coral", label: "Coral" },
  { value: "coral-dark", label: "Coral Dark" },
  { value: "navy", label: "Navy" },
  { value: "navy-light", label: "Navy Light" },
];

const iconOptions = ["Percent", "Gift", "Clock", "Tag"];

export default function AdminSpecialOffers() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [form, setForm] = useState<Omit<SpecialOffer, 'id'>>(emptyOffer);

  const fetchOffers = async () => {
    const { data } = await supabase
      .from('special_offers')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setOffers(data);
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.subtitle) {
      toast.error("Title aur Subtitle required hai");
      return;
    }

    if (editingOffer) {
      const { error } = await supabase
        .from('special_offers')
        .update(form)
        .eq('id', editingOffer.id);
      if (error) { toast.error("Update failed"); return; }
      toast.success("Offer updated!");
    } else {
      const { error } = await supabase
        .from('special_offers')
        .insert(form);
      if (error) { toast.error("Insert failed"); return; }
      toast.success("Offer created!");
    }

    setDialogOpen(false);
    setEditingOffer(null);
    setForm(emptyOffer);
    fetchOffers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kya aap sure hain? Ye offer delete ho jayegi.")) return;
    const { error } = await supabase.from('special_offers').delete().eq('id', id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Offer deleted!");
    fetchOffers();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('special_offers').update({ is_active: !current }).eq('id', id);
    fetchOffers();
  };

  const openEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setForm({
      title: offer.title,
      subtitle: offer.subtitle,
      code: offer.code,
      cta_text: offer.cta_text,
      link: offer.link,
      gradient_from: offer.gradient_from,
      gradient_to: offer.gradient_to,
      icon_name: offer.icon_name,
      display_order: offer.display_order,
      is_active: offer.is_active,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingOffer(null);
    setForm({ ...emptyOffer, display_order: offers.length + 1 });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Special Offers</h1>
          <p className="text-muted-foreground text-sm">Homepage pe dikhne wali special offers manage karo</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Offer
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : offers.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Koi offer nahi hai. Add Offer pe click karo.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className={`${!offer.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="flex items-center gap-4 py-4">
                <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{offer.title}</h3>
                    {offer.code && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-mono">{offer.code}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{offer.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">Link: {offer.link} | CTA: {offer.cta_text} | Order: {offer.display_order}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch checked={offer.is_active} onCheckedChange={() => toggleActive(offer.id, offer.is_active)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(offer)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit Offer" : "New Offer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Flat 10% OFF" />
            </div>
            <div>
              <Label>Subtitle *</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="On Your First Order" />
            </div>
            <div>
              <Label>Coupon Code (optional)</Label>
              <Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value || null })} placeholder="FIRST10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Button Text</Label>
                <Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} placeholder="Shop Now" />
              </div>
              <div>
                <Label>Link</Label>
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/category/acrylic-photos" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gradient From</Label>
                <Select value={form.gradient_from} onValueChange={(v) => setForm({ ...form, gradient_from: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gradient To</Label>
                <Select value={form.gradient_to} onValueChange={(v) => setForm({ ...form, gradient_to: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <Select value={form.icon_name} onValueChange={(v) => setForm({ ...form, icon_name: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} className="w-full">
              {editingOffer ? "Update Offer" : "Create Offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
