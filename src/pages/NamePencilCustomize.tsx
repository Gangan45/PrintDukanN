import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, ShoppingCart, Zap, Pencil, Package, Gift } from "lucide-react";
import { PencilPreview, PencilStackPreview } from "@/components/product/PencilPreview";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "sonner";

import namePencil1 from "@/assets/name-pencil-1.jpg";

interface NameEntry {
  id: number;
  name: string;
  packs: number;
}

// Parse bulk pricing tiers from product sizes JSON (DB-driven)
const getPricePerPack = (totalPacks: number, sizes?: any[]): number => {
  if (!sizes || sizes.length === 0) {
    if (totalPacks >= 50) return 79;
    if (totalPacks >= 20) return 89;
    if (totalPacks >= 10) return 99;
    if (totalPacks >= 5) return 129;
    if (totalPacks >= 2) return 149;
    return 299;
  }
  const tiers = sizes.map((s: any) => {
    const sizeLabel = s.label || s.name || '';
    const match = sizeLabel.match(/^(\d+)/);
    const qty = match ? parseInt(match[1]) : 1;
    return { qty, price: s.price };
  }).sort((a: any, b: any) => b.qty - a.qty);

  for (const tier of tiers) {
    if (totalPacks >= tier.qty) return tier.price;
  }
  return tiers[tiers.length - 1]?.price || 299;
};

const NamePencilCustomize = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [nameEntries, setNameEntries] = useState<NameEntry[]>([
    { id: 1, name: "", packs: 1 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id && id !== "customize") {
        const { data } = await supabase.from("products").select("*").eq("id", id).single();
        if (data) setProduct(data);
      } else {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("category", "Name Pencils")
          .eq("is_active", true)
          .limit(1)
          .single();
        if (data) setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Use DB images, fallback to single local import
  const images: string[] =
    product?.images?.length > 0 ? product.images : [namePencil1];

  const productSizes = product?.sizes as any[] | undefined;
  const productFrames = product?.frames as any;
  const codCharges = productFrames?.cod_charges ?? 50;
  const totalPacks = nameEntries.reduce((sum, e) => sum + e.packs, 0);
  const pricePerPack = getPricePerPack(totalPacks, productSizes);
  const totalPrice = totalPacks * pricePerPack + codCharges;
  const originalPrice = totalPacks * (productSizes?.[0]?.price || 399);

  const pricingTiers = (productSizes || [
    { label: "1 Pack", price: 299 },
    { label: "2+ Packs", price: 149 },
    { label: "5+ Packs", price: 129 },
    { label: "10+ Packs", price: 99 },
    { label: "20+ Packs", price: 89 },
    { label: "50+ Packs", price: 79 },
  ]);

  const addNameEntry = () => {
    setNameEntries([...nameEntries, { id: Date.now(), name: "", packs: 1 }]);
  };

  const removeNameEntry = (entryId: number) => {
    if (nameEntries.length <= 1) return;
    setNameEntries(nameEntries.filter((e) => e.id !== entryId));
  };

  const updateName = (entryId: number, name: string) => {
    setNameEntries(nameEntries.map((e) => (e.id === entryId ? { ...e, name } : e)));
  };

  const updatePacks = (entryId: number, packs: number) => {
    if (packs < 1) return;
    setNameEntries(nameEntries.map((e) => (e.id === entryId ? { ...e, packs } : e)));
  };

  const validateEntries = (): boolean => {
    const emptyNames = nameEntries.filter((e) => !e.name.trim());
    if (emptyNames.length > 0) {
      toast.error("Please enter name for all entries");
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateEntries() || !product) return;
    const customText = nameEntries.map((e) => `${e.name} (x${e.packs})`).join(", ");
    await addToCart({
      productId: product.id,
      productName: product.name,
      productImage: images[0],
      unitPrice: pricePerPack,
      quantity: totalPacks,
      selectedSize: `${totalPacks} Packs (10 pencils each)`,
      selectedFrame: null,
      customText: customText,
      category: "Name Pencils",
    });
    toast.success("Added to cart!");
  };

  const handleBuyNowClick = async () => {
    if (!validateEntries() || !product) return;
    const customText = nameEntries.map((e) => `${e.name} (x${e.packs})`).join(", ");
    await buyNow({
      productId: product.id,
      productName: product.name,
      productImage: images[0],
      price: pricePerPack,
      quantity: totalPacks,
      selectedSize: `${totalPacks} Packs (10 pencils each)`,
      selectedFrame: undefined,
      customText: customText,
      category: "Name Pencils",
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product?.name || "Customize Name Pencils"} | PrintDukan</title>
        <meta name="description" content={product?.description || "Customize your personalized name pencils. Add names, choose packs, and order. Starting at ₹79/pack."} />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background py-6 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery + Live Pencil Preview */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden bg-muted/20 border border-border">
                <img
                  src={images[selectedImage]}
                  alt={product?.name || "Name Pencils"}
                  className="w-full h-[300px] md:h-[380px] object-cover"
                />
              </div>

              {/* Live Pencil Preview */}
              <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Pencil className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-foreground text-sm">Live Preview</h3>
                </div>
                <PencilStackPreview 
                  names={nameEntries.map(e => ({ name: e.name, packs: e.packs }))} 
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? "border-amber-500 shadow-md" : "border-border opacity-70 hover:opacity-100"}`}
                    >
                      <img src={img} alt={`Preview ${i + 1}`} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customization Panel */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {product?.name || "Name Pencils"} <span className="text-amber-600">(Smooth & Dark)</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  {product?.description || "Custom printed pencils with any name or message. Each pack contains 10 pencils."}
                </p>
              </div>

              {/* Bulk Pricing Table - from DB */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-foreground">Buy More, Save More</h3>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-sm">
                  {pricingTiers.map((t: any, i: number) => {
                    const tierLabel = t.label || t.name || '';
                    const match = tierLabel.match(/^(\d+)/);
                    const tierQty = match ? parseInt(match[1]) : 1;
                    const allTierQtys = pricingTiers.map((s: any) => {
                      const sLabel = s.label || s.name || '';
                      const m = sLabel.match(/^(\d+)/);
                      return m ? parseInt(m[1]) : 1;
                    }).sort((a: number, b: number) => a - b);
                    const nextTierQty = allTierQtys[allTierQtys.indexOf(tierQty) + 1] || Infinity;
                    const isActive = totalPacks >= tierQty && totalPacks < nextTierQty;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setNameEntries(prev => {
                            const updated = [...prev];
                            if (updated.length > 0) {
                              updated[0] = { ...updated[0], packs: tierQty };
                            }
                            return updated;
                          });
                        }}
                        className={`rounded-lg py-2 px-1 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${isActive
                          ? "bg-amber-500 text-white font-bold ring-2 ring-amber-400 ring-offset-1"
                          : "bg-white dark:bg-card border border-border hover:border-amber-400"
                        }`}
                      >
                        <p className="font-medium">{tierLabel}</p>
                        <p className="font-bold">₹{t.price}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 text-center">
                  Each pack contains 10 pencils + Free Eraser & Sharpener
                </p>
              </div>

              {/* Name Entries */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  Enter Names
                </h3>
                {nameEntries.map((entry, index) => (
                  <div key={entry.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Name {index + 1}</span>
                      {nameEntries.length > 1 && (
                        <button onClick={() => removeNameEntry(entry.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Inline Pencil Preview */}
                    <PencilPreview 
                      name={entry.name} 
                      color={["green", "yellow", "red", "blue"][index % 4] as any} 
                      size="sm" 
                    />

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Your Text:</label>
                        <Input
                          placeholder="Type name here..."
                          value={entry.name}
                          onChange={(e) => updateName(entry.id, e.target.value)}
                          maxLength={20}
                          className="h-10"
                        />
                      </div>
                      <div className="w-28">
                        <label className="text-xs text-muted-foreground mb-1 block">Packs:</label>
                        <div className="flex items-center border border-border rounded-md h-10">
                          <button
                            onClick={() => updatePacks(entry.id, entry.packs - 1)}
                            className="px-2 h-full hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="flex-1 text-center font-medium text-sm">{entry.packs}</span>
                          <button
                            onClick={() => updatePacks(entry.id, entry.packs + 1)}
                            className="px-2 h-full hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addNameEntry} className="w-full border-dashed border-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Name
                </Button>
              </div>

              {/* Price Summary */}
              <div className="bg-card rounded-xl p-4 border border-border space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total Packs:</span>
                  <span className="font-medium text-foreground">{totalPacks}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Price per Pack:</span>
                  <span className="font-medium text-foreground">₹{pricePerPack}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total Pencils:</span>
                  <span className="font-medium text-foreground">{totalPacks * 10}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-medium text-foreground">₹{totalPacks * pricePerPack}</span>
                </div>
                {codCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cash on Delivery Charges:</span>
                    <span className="font-medium text-amber-600">+₹{codCharges}</span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total:</span>
                  <div className="text-right">
                    <span className="text-sm line-through text-muted-foreground mr-2">₹{originalPrice}</span>
                    <span className="text-2xl font-bold text-amber-600">₹{totalPrice}</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  🎉 You save ₹{originalPrice - totalPrice}! Free Shipping Included
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-12"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
                  onClick={handleBuyNowClick}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: Gift, text: "Free Eraser & Sharpener" },
                  { icon: Package, text: "10 Pencils per Pack" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    <badge.icon className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-muted-foreground">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NamePencilCustomize;