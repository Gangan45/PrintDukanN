import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronRight } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AcrylicFilterBar } from "@/components/acrylic/AcrylicFilterBar";
import { AcrylicProductGrid } from "@/components/acrylic/AcrylicProductGrid";

interface Product {
  id: string;
  name: string;
  base_price: number;
  images: string[] | null;
  category: string;
  is_customizable: boolean | null;
  tags: string[] | null;
}

const subcategoryData: Record<
  string,
  { title: string; description: string; customizeUrl: string }
> = {
  "wall-photo": {
    title: "Acrylic Wall Photo",
    description: "Transform your walls with stunning acrylic prints",
    customizeUrl: "/customize",
  },
  "wall-clock": {
    title: "Acrylic Wall Clock",
    description: "Timeless elegance meets personalized design",
    customizeUrl: "/category/wall-clocks",
  },
  "wall-clocks": {
    title: "Acrylic Wall Clock",
    description: "Timeless elegance meets personalized design",
    customizeUrl: "/category/wall-clocks",
  },
  "framed-photo": {
    title: "Framed Acrylic Photo",
    description: "Classic sophistication with modern clarity",
    customizeUrl: "/framed-acrylic",
  },
  "baby-frames": {
    title: "Baby Photo Frames",
    description: "Capture precious moments of your little one",
    customizeUrl: "/baby-frame",
  },
};

const AcrylicSubcategory = () => {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const [activeTag, setActiveTag] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();

  const subcategory =
    subcategoryData[subcategoryId || ""] || {
      title: "Acrylic Products",
      description: "Premium acrylic photo products",
      customizeUrl: "/customize",
    };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategoryId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, base_price, images, category, is_customizable, tags")
        .eq("category", "Acrylic Wall Photo")
        .eq("is_active", true);

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by tag
  const filteredProducts = useMemo(() => {
    if (activeTag === "all") return products;
    return products.filter((p) =>
      Array.isArray(p.tags) ? p.tags.includes(activeTag) : false
    );
  }, [products, activeTag]);

  const buildCustomizeUrl = (product: Product) => {
    if (subcategoryId === "wall-clock" || subcategoryId === "wall-clocks") {
      return `/wall-clock/${product.id}`;
    }
    if (subcategoryId === "baby-frames") {
      return `/baby-frame/${product.id}`;
    }
    if (subcategoryId === "framed-photo") {
      return `/framed-acrylic/${product.id}`;
    }
    return `/customize/${product.id}`;
  };

  const handleAddToCart = async (product: Product) => {
    const success = await addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || "",
      unitPrice: product.base_price,
      quantity: 1,
      category: product.category || subcategory.title,
    });

    if (success) {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
    }
  };

  const handleBuyNow = (product: Product) => {
    buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || "",
      price: product.base_price,
      category: product.category || subcategory.title,
    });
  };

  const handleToggleFavorite = (product: Product) => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.base_price,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            to="/category/acrylic"
            className="hover:text-primary transition-colors"
          >
            Acrylic
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{subcategory.title}</span>
        </div>
      </div>

      {/* Title */}
      <section className="container mx-auto px-4 pt-2 pb-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-center text-foreground">
          {subcategory.title}
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          {subcategory.description}
        </p>
      </section>

      {/* OMGS-style Filter Bar */}
      <section className="container mx-auto px-4 pb-6">
        <AcrylicFilterBar
          activeTag={activeTag}
          onTagChange={setActiveTag}
          title="Acrylic Wall Photo Filters:"
        />
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-16">
        <AcrylicProductGrid
          products={filteredProducts}
          loading={loading}
          customizeUrlBuilder={buildCustomizeUrl}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          emptyMessage={
            activeTag === "all"
              ? "No products found in this category"
              : `No products found for "${activeTag}" filter`
          }
        />
      </section>

      <Footer />
    </div>
  );
};

export default AcrylicSubcategory;
