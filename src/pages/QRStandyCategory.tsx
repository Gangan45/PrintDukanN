import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { ProductGrid } from "@/components/products/ProductGrid";


import Magenticbadge from "@/assets/A_Content_Desktop_-_2025-09-30T182434.699.webp"
import orderblue from "@/assets/Processing_-_Desktop_1.webp";
import trust from "@/assets/Trusted_by_more_than_Mobile_2_fe9b4fe6-3dfa-4e6b-b41a-c9671b3e09f2.webp";

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

// QR Standy showcases


// Filter options for QR stands
const filterCategories = [
  { id: "all", label: "All QR Stands", icon: "✦" },
  { id: "clear-acrylic", label: "Clear Acrylic", icon: "◇" },
  { id: "nfc", label: "NFC", icon: "📶" },
];

const QRStandyCategory = () => {
  const [activeFilter, setActiveFilter] = useState("all");
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
        .from('products')
        .select('*')
        .eq('category', 'QR Standee')
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
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
      productImage: product.images?.[0] || '',
      price: product.base_price,
    });
  };

  const getStandType = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nfc')) return 'nfc';
    return 'clear-acrylic';
  };

  const filteredProducts = activeFilter === "all"
    ? products
    : products.filter(p => getStandType(p.name) === activeFilter);

  const handleToggleFavorite = (product: Product) => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.base_price,
      category: product.category,
      isCustomizable: product.is_customizable ?? true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">QR Standees</span>
        </div>
      </div>

      

      {/* Filter Section */}
      <CategoryFilter
        title="Filter by Type:"
        filters={filterCategories}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
            Premium QR Standees
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Perfect for restaurants, cafes, offices, and retail stores. Display your QR codes in style.
          </p>
        </div>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          emptyMessage="No products found in this category"
          customizeUrlPrefix="/qr-standy"
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
};

export default QRStandyCategory;
