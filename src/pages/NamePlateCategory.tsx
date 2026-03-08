import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Briefcase, DoorOpen, Award, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";


interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  images: string[] | null;
  sizes: unknown;
  is_customizable: boolean | null;
  is_active: boolean | null;
}

const namePlateShowcases = [
  {
    id: "table-desk",
    title: "Table/Desk Name Plates",
    subtitle: "Professional Desk Signs",
    description: "Elegant desk name plates for professionals and offices",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    bgColor: "from-blue-500/20 to-indigo-500/20"
  },
  {
    id: "door",
    title: "Door Name Plates",
    subtitle: "Premium Door Signs",
    description: "High-quality door plates with custom designs",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    bgColor: "from-emerald-500/20 to-teal-500/20"
  }
];

const filterCategories = [
  { id: "all", label: "All", icon: Award },
  { id: "table-desk", label: "Table/Desk Nameplate", icon: Briefcase },
  { id: "door", label: "Door Nameplate", icon: DoorOpen }
];

export default function NamePlateCategory() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Name Plates")
        .eq("is_active", true);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Name plates loaded:", data?.length, data);
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.base_price,
      category: "name-plates"
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = async (product: Product) => {
    await buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || "",
      price: product.base_price,
      quantity: 1,
      category: "name-plates"
    });
  };

  const handleToggleFavorite = (product: Product) => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.images?.[0] || '',
      category: product.category,
      isCustomizable: product.is_customizable ?? true,
    });
  };

  const getPlateType = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("table") || lowerName.includes("desk") || lowerName.includes("office")) return "table-desk";
    if (lowerName.includes("door")) return "door";
    return "all";
  };

  const filteredProducts = products.filter((product) => {
    if (activeFilter === "all") return true;
    return getPlateType(product.name) === activeFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Name Plates</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Custom Name Plates
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium acrylic and metal name plates for homes, offices, and doors. Personalize with your name, logo, or custom design.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {namePlateShowcases.map((showcase) => (
            <div
              key={showcase.id}
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${showcase.bgColor} p-6 cursor-pointer group hover:scale-[1.02] transition-transform`}
              onClick={() => setActiveFilter(showcase.id)}
            >
              <div className="relative z-10">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {showcase.subtitle}
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1 mb-2">
                  {showcase.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {showcase.description}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full">
                <img
                  src={showcase.image}
                  alt={showcase.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-muted/30 border-y border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-center text-lg font-medium text-foreground mb-4">
            Filter by Type
          </h3>
          <div className="flex flex-nowrap overflow-x-auto pb-2 sm:flex-wrap justify-start sm:justify-center gap-2 no-scrollbar">
            {filterCategories.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "whitespace-nowrap flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200",
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background border-border hover:border-primary/50 hover:bg-muted"
                )}
              >
                <filter.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-8">
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          emptyMessage="No name plates found in this category"
          customizeUrlPrefix="/nameplate"
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onResetFilter={() => setActiveFilter("all")}
        />
      </section>

      <Footer />
    </div>
  );
}