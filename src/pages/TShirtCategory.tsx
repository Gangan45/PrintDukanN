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


// Filter options for T-Shirts
const filterCategories = [
  { id: "all", label: "All T-Shirts", icon: "✦" },
  { id: "round-neck", label: "Round Neck", icon: "○" },
  { id: "polo", label: "Polo", icon: "◇" },
  { id: "v-neck", label: "V-Neck", icon: "▽" },
  { id: "full-sleeve", label: "Full Sleeve", icon: "▯" },
  { id: "sports", label: "Sports", icon: "★" },
  { id: "oversized", label: "Oversized", icon: "◻" },
];

const TShirtCategory = () => {
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
        .eq('category', 'T-Shirts')
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
    const result = await addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0],
      unitPrice: product.base_price,
      quantity: 1,
    });
    
    if (result) {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
    }
  };

  const handleBuyNow = async (product: Product) => {
    await buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || '',
      price: product.base_price,
    });
  };

  const getProductType = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('polo')) return 'polo';
    if (lowerName.includes('v-neck')) return 'v-neck';
    if (lowerName.includes('full sleeve')) return 'full-sleeve';
    if (lowerName.includes('sports') || lowerName.includes('dry-fit')) return 'sports';
    if (lowerName.includes('oversized')) return 'oversized';
    return 'round-neck';
  };

  const filteredProducts = activeFilter === "all" 
    ? products 
    : products.filter(p => getProductType(p.name) === activeFilter);

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
          <span className="text-foreground font-medium">T-Shirt Printing</span>
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
            Custom T-Shirt Printing
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Design your perfect t-shirts with our premium printing services
          </p>
        </div>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          emptyMessage="No products found in this category"
          customizeUrlPrefix="/tshirt"
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

export default TShirtCategory;