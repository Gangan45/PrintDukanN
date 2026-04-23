import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, GripVertical, Save, Eye, EyeOff } from "lucide-react";
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

interface OfferConfig {
  id: string;
  is_enabled: boolean;
  headline: string;
  subtitle: string;
  eligible_categories: string[];
}

interface OfferItem {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  badge_color: string;
  image_url: string;
  price: number;
  original_price: number | null;
  cta_text: string;
  link: string;
  action_type: "add_to_cart" | "redirect";
  product_id: string | null;
  category_tag: string | null;
  display_order: number;
  is_active: boolean;
}

const AVAILABLE_CATEGORIES = [
  { value: "acrylic", label: "Acrylic Wall Photo" },
  { value: "wall-clock", label: "Acrylic Wall Clocks" },
  { value: "framed-acrylic", label: "Framed Acrylic Photo" },
  { value: "baby-frame", label: "Baby Photo Frames" },
  { value: "wall-photo", label: "Wall Photo" },
  { value: "name-plate", label: "Name Plates" },
  { value: "qr-standee", label: "QR Standee" },
  { value: "fridge-magnet", label: "Fridge Magnet" },
  { value: "trophies", label: "Trophies" },
  { value: "wedding-card", label: "Wedding Card" },
  { value: "t-shirt", label: "T-Shirts" },
  { value: "name-pencil", label: "Name Pencils" },
];

const BADGE_COLOR_OPTIONS = [
  { value: "red", label: "Red", className: "bg-red-500" },
  { value: "green", label: "Green", className: "bg-green-500" },
  { value: "orange", label: "Orange", className: "bg-orange-500" },
  { value: "blue", label: "Blue", className: "bg-blue-500" },
  { value: "purple", label: "Purple", className: "bg-purple-500" },
];

const blankItem: Omit<OfferItem, "id"> = {
  title: "",
  subtitle: "",
  badge_text: "",
  badge_color: "red",
  image_url: "",
  price: 0,
  original_price: null,
  cta_text: "Customize Now",
  link: "/",
  action_type: "add_to_cart",
  product_id: null,
  category_tag: null,
  display_order: 0,
  is_active: true,
};

const AdminCartOffers = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<OfferConfig | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [editing, setEditing] = useState<OfferItem | null>(null);
  const [creating, setCreating] = useState<typeof blankItem | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [cfgRes, itemsRes] = await Promise.all([
      supabase.from("cart_offers").select("*").limit(1).maybeSingle(),
      supabase.from("cart_offer_items").select("*").order("display_order"),
    ]);
    if (cfgRes.data) {
      setConfig({
        id: cfgRes.data.id,
        is_enabled: cfgRes.data.is_enabled,
        headline: cfgRes.data.headline,
        subtitle: cfgRes.data.subtitle,
        eligible_categories: Array.isArray(cfgRes.data.eligible_categories)
          ? (cfgRes.data.eligible_categories as string[])
          : [],
      });
    }
    if (itemsRes.data) {
      setItems(
        (itemsRes.data as any[]).map((d) => ({
          id: d.id,
          title: d.title,
          subtitle: d.subtitle,
          badge_text: d.badge_text,
          badge_color: d.badge_color || "red",
          image_url: d.image_url,
          price: Number(d.price) || 0,
          original_price:
            d.original_price !== null && d.original_price !== undefined
              ? Number(d.original_price)
              : null,
          cta_text: d.cta_text,
          link: d.link,
          action_type: (d.action_type as "add_to_cart" | "redirect") || "add_to_cart",
          product_id: d.product_id,
          category_tag: d.category_tag,
          display_order: d.display_order,
          is_active: d.is_active,
        }))
      );
    }
    setLoading(false);
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase
      .from("cart_offers")
      .update({
        is_enabled: config.is_enabled,
        headline: config.headline,
        subtitle: config.subtitle,
        eligible_categories: config.eligible_categories,
      })
      .eq("id", config.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const toggleCategory = (cat: string) => {
    if (!config) return;
    const exists = config.eligible_categories.includes(cat);
    setConfig({
      ...config,
      eligible_categories: exists
        ? config.eligible_categories.filter((c) => c !== cat)
        : [...config.eligible_categories, cat],
    });
  };

  const saveItem = async (
    item: OfferItem | typeof blankItem,
    id?: string
  ) => {
    if (!item.title || !item.image_url) {
      toast.error("Title and image URL required");
      return;
    }
    // Strip id for inserts; ensure null for empty optional fields
    const payload: any = {
      title: item.title,
      subtitle: item.subtitle || null,
      badge_text: item.badge_text || null,
      badge_color: item.badge_color || "red",
      image_url: item.image_url,
      price: Number(item.price) || 0,
      original_price:
        item.original_price !== null && item.original_price !== undefined && Number(item.original_price) > 0
          ? Number(item.original_price)
          : null,
      cta_text: item.cta_text || "Add to Cart",
      link: item.link || "/",
      action_type: item.action_type || "add_to_cart",
      product_id: item.product_id || null,
      category_tag: item.category_tag || null,
      display_order: Number(item.display_order) || 0,
      is_active: item.is_active ?? true,
    };
    if (id) {
      const { error } = await supabase
        .from("cart_offer_items")
        .update(payload)
        .eq("id", id);
      if (error) return toast.error(error.message);
      toast.success("Item updated");
    } else {
      const { error } = await supabase.from("cart_offer_items").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Item added");
    }
    setEditing(null);
    setCreating(null);
    load();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this offer item?")) return;
    const { error } = await supabase.from("cart_offer_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggleItemActive = async (item: OfferItem) => {
    const { error } = await supabase
      .from("cart_offer_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Cart Offers Popup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the special offers popup that appears when customers add eligible products to cart.
        </p>
      </div>

      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Popup Settings</span>
            {config && (
              <div className="flex items-center gap-2">
                <Label htmlFor="enabled" className="text-sm font-normal">
                  {config.is_enabled ? "Enabled" : "Disabled"}
                </Label>
                <Switch
                  id="enabled"
                  checked={config.is_enabled}
                  onCheckedChange={(v) => setConfig({ ...config, is_enabled: v })}
                />
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config && (
            <>
              <div>
                <Label>Headline</Label>
                <Input
                  value={config.headline}
                  onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Textarea
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label className="mb-2 block">
                  Eligible Categories (popup shows when these are added to cart)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const active = config.eligible_categories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        onClick={() => toggleCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button onClick={saveConfig} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Offer Items ({items.length})</span>
            <Dialog open={creating !== null} onOpenChange={(o) => !o && setCreating(null)}>
              <DialogTrigger asChild>
                <Button onClick={() => setCreating({ ...blankItem, display_order: items.length + 1 })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Offer Item</DialogTitle>
                </DialogHeader>
                {creating && (
                  <ItemForm
                    value={creating}
                    onChange={setCreating}
                    onSave={() => saveItem(creating)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No offer items yet. Add one to get started.
              </p>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-14 w-14 rounded object-cover bg-muted flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.badge_text && (
                      <Badge variant="destructive" className="text-[10px]">
                        {item.badge_text}
                      </Badge>
                    )}
                    {item.price === 0 ? (
                      <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                        FREE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        ₹{item.price}
                        {item.original_price && item.original_price > item.price && (
                          <span className="line-through text-muted-foreground ml-1">
                            ₹{item.original_price}
                          </span>
                        )}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {item.action_type === "add_to_cart" ? "🛒 Add to cart" : "↗ Redirect"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    → {item.action_type === "add_to_cart" ? "Adds directly" : item.link}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleItemActive(item)}
                  title={item.is_active ? "Hide" : "Show"}
                >
                  {item.is_active ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Dialog
                  open={editing?.id === item.id}
                  onOpenChange={(o) => !o && setEditing(null)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Offer Item</DialogTitle>
                    </DialogHeader>
                    {editing && (
                      <ItemForm
                        value={editing}
                        onChange={(v) => setEditing(v as OfferItem)}
                        onSave={() => saveItem(editing, editing.id)}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Reusable form
const ItemForm = ({
  value,
  onChange,
  onSave,
}: {
  value: any;
  onChange: (v: any) => void;
  onSave: () => void;
}) => {
  const isAddToCart = (value.action_type || "add_to_cart") === "add_to_cart";
  return (
    <div className="space-y-4">
      {/* Action type — most important */}
      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-2">
        <Label className="font-semibold">What happens when customer clicks the card?</Label>
        <Select
          value={value.action_type || "add_to_cart"}
          onValueChange={(v) => onChange({ ...value, action_type: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add_to_cart">
              🛒 Add to Cart directly (free / discounted)
            </SelectItem>
            <SelectItem value="redirect">
              ↗ Redirect to a customize / product page
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {isAddToCart
            ? "Item is added to cart instantly at the price below. Use price = 0 for FREE gifts."
            : "Customer is taken to the link below — useful for products that need customization."}
        </p>
      </div>

      <div>
        <Label>Title *</Label>
        <Input
          value={value.title || ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Personalised Keychain"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={value.subtitle || ""}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
          placeholder="Premium HD Print"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Badge Text</Label>
          <Input
            value={value.badge_text || ""}
            onChange={(e) => onChange({ ...value, badge_text: e.target.value })}
            placeholder="Gift / @ just ₹99"
          />
        </div>
        <div>
          <Label>Badge Color</Label>
          <Select
            value={value.badge_color || "red"}
            onValueChange={(v) => onChange({ ...value, badge_color: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BADGE_COLOR_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${c.className}`} />
                    {c.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Offer Price (₹) — 0 = FREE</Label>
          <Input
            type="number"
            value={value.price ?? 0}
            onChange={(e) => onChange({ ...value, price: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Original Price (₹) — for strike-through (optional)</Label>
          <Input
            type="number"
            value={value.original_price ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                original_price: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="e.g. 299"
          />
        </div>
      </div>

      <div>
        <Label>Image URL *</Label>
        <Input
          value={value.image_url || ""}
          onChange={(e) => onChange({ ...value, image_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>CTA Button Text</Label>
          <Input
            value={value.cta_text || ""}
            onChange={(e) => onChange({ ...value, cta_text: e.target.value })}
            placeholder="Add to Cart / Customize Now"
          />
        </div>
        <div>
          <Label>{isAddToCart ? "Link (fallback / not used)" : "Redirect Link *"}</Label>
          <Input
            value={value.link || ""}
            onChange={(e) => onChange({ ...value, link: e.target.value })}
            placeholder="/category/acrylic-magnet"
          />
        </div>
      </div>

      {isAddToCart && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Linked Product ID (optional)</Label>
            <Input
              value={value.product_id || ""}
              onChange={(e) =>
                onChange({ ...value, product_id: e.target.value || null })
              }
              placeholder="UUID from products table"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Leave blank for a generic offer-gift line.
            </p>
          </div>
          <div>
            <Label>Cart Category Tag (optional)</Label>
            <Input
              value={value.category_tag || ""}
              onChange={(e) =>
                onChange({ ...value, category_tag: e.target.value || null })
              }
              placeholder="offer-gift"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Default: <code>offer-gift</code> (skips customize check).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label>Display Order</Label>
          <Input
            type="number"
            value={value.display_order ?? 0}
            onChange={(e) =>
              onChange({ ...value, display_order: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch
            checked={value.is_active ?? true}
            onCheckedChange={(v) => onChange({ ...value, is_active: v })}
          />
          <Label>Active</Label>
        </div>
      </div>

      <Button onClick={onSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  );
};

export default AdminCartOffers;
