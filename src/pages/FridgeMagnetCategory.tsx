import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronRight } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductGrid } from "@/components/products/ProductGrid";

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

const DEFAULT_FRIDGE_MAGNETS: Product[] = [
  {
    id: "default-fridge-magnet",
    name: "Acrylic Fridge Magnet",
    description:
      "Premium acrylic fridge magnets with HD print and strong magnetic backing.",
    category: "fridge-magnet",
    base_price: 299,
    images: [
      "https://cdn.printshoppy.com/image/catalog/v6/jpg/acrylic-fridge-magnets/product-page/fridge-magents-preview-s2.jpg",
    ],
    sizes: null,
    is_customizable: true,
    is_active: true,
  },
];

const FridgeMagnetCategory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "fridge-magnet")
        .eq("is_active", true);

      if (error) throw error;
      const list = data && data.length > 0 ? data : DEFAULT_FRIDGE_MAGNETS;
      setProducts(list);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts(DEFAULT_FRIDGE_MAGNETS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart({
      productId: product.id,
      productName: product.name,
      unitPrice: product.base_price,
      quantity: 1,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleBuyNow = (product: Product) => {
    buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || "",
      price: product.base_price,
    });
  };

  const handleToggleFavorite = (product: Product) => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.base_price,
      category: product.category,
      isCustomizable: product.is_customizable ?? true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Fridge Magnet</span>
        </div>
      </div>

      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
            Customizable Fridge Magnets
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Premium acrylic fridge magnets with your favourite photos. Buy more,
            save more — starting ₹119/-
          </p>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No fridge magnets available yet"
          customizeUrlPrefix="/fridge-magnet"
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </section>

      <Footer />
    </div>
  );
};

export default FridgeMagnetCategory;
