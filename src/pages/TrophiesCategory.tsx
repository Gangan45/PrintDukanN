import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy, Award, Medal, Star, Crown, Gift } from "lucide-react";
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

// Trophy subcategory showcases
const trophyShowcases = [
  {
    id: "crystal",
    title: "Crystal Trophies",
    subtitle: "Premium Excellence",
    description: "Elegant crystal trophies that capture light and recognition beautifully.",
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=600&fit=crop",
    bgColor: "from-indigo-900 to-purple-800",
    icon: Trophy,
  },
  {
    id: "acrylic",
    title: "Acrylic Awards",
    subtitle: "Modern Design",
    description: "Contemporary acrylic awards with stunning clarity and customization options.",
    image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&h=600&fit=crop",
    bgColor: "from-teal-900/80 to-cyan-900/60",
    icon: Award,
  },
  {
    id: "metal",
    title: "Metal Trophies",
    subtitle: "Timeless Recognition",
    description: "Classic metal trophies and mementos that stand the test of time.",
    image: "https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?w=800&h=600&fit=crop",
    bgColor: "from-amber-900/80 to-yellow-900/60",
    icon: Medal,
  },
];

// Filter options for Trophies
const filterCategories = [
  { id: "all", label: "All Trophies", icon: "🏆" },
  { id: "crystal", label: "Crystal", icon: "💎" },
  { id: "acrylic", label: "Acrylic", icon: "◇" },
  { id: "metal", label: "Metal", icon: "🥇" },
  { id: "wooden", label: "Wooden", icon: "🪵" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "corporate", label: "Corporate", icon: "🏢" },
];

const TrophiesCategory = () => {
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
        .eq('category', 'Trophies')
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
    if (lowerName.includes('crystal')) return 'crystal';
    if (lowerName.includes('acrylic')) return 'acrylic';
    if (lowerName.includes('metal') || lowerName.includes('gold') || lowerName.includes('silver')) return 'metal';
    if (lowerName.includes('wooden') || lowerName.includes('wood')) return 'wooden';
    if (lowerName.includes('sport') || lowerName.includes('football') || lowerName.includes('cricket')) return 'sports';
    if (lowerName.includes('corporate') || lowerName.includes('award')) return 'corporate';
    return 'all';
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
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Custom Trophies & Awards | Premium Recognition Products | PrintMine</title>
        <meta name="description" content="Shop premium custom trophies, crystal awards, acrylic mementos & metal plaques. Perfect for corporate recognition, sports achievements & special occasions. Free customization available." />
        <meta name="keywords" content="custom trophies, crystal awards, acrylic trophies, metal awards, corporate awards, sports trophies, recognition awards, custom mementos" />
        <link rel="canonical" href="/category/trophies" />
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li><ChevronRight className="w-4 h-4" aria-hidden="true" /></li>
          <li className="text-foreground font-medium" aria-current="page">Trophies & Awards</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 py-10 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1920&h=800&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium">Premium Quality Awards</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4 sm:mb-6">
              Trophies & <br className="sm:hidden" />Mementos
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-white/80 leading-relaxed mb-6 sm:mb-8 px-2">
              Celebrate achievements with our premium collection of custom trophies, awards, and mementos. Perfect for corporate events, sports competitions, and special occasions.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Button size="default" className="bg-white text-amber-900 hover:bg-white/90 text-sm sm:text-base h-10 sm:h-11">
                <Gift className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Browse Collection
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
      </section>

      {/* Category Showcases */}
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-2 sm:mb-3">
              Explore Our Trophy Categories
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              From elegant crystal awards to classic metal trophies, find the perfect recognition piece
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trophyShowcases.map((showcase) => (
              <article
                key={showcase.id}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${showcase.bgColor}`} />
                <img
                  src={showcase.image}
                  alt={showcase.title}
                  className="relative w-full h-48 sm:h-64 object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <showcase.icon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-medium text-yellow-400">{showcase.subtitle}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold mb-1 sm:mb-2">{showcase.title}</h3>
                  <p className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4 line-clamp-2">{showcase.description}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-fit group-hover:translate-x-1 transition-transform text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => setActiveFilter(showcase.id)}
                  >
                    View Collection
                    <ChevronRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <CategoryFilter
        title="Filter by Type:"
        filters={filterCategories}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
            Featured Trophy Products
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Premium quality trophies and awards with free customization
          </p>
        </div>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          emptyMessage="No trophies found in this category"
          customizeUrlPrefix="/customize"
          detailUrlPrefix="/product"
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onResetFilter={() => setActiveFilter("all")}
        />
      </section>

      {/* Trust Section */}
      <section className="bg-muted/50 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {[
              { icon: Trophy, label: "500+ Designs", value: "Premium Collection" },
              { icon: Star, label: "4.9 Rating", value: "Customer Satisfaction" },
              { icon: Crown, label: "Free Custom", value: "Personalized Touch" },
              { icon: Gift, label: "Fast Delivery", value: "Pan India" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5 sm:gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-xs sm:text-base">{item.label}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrophiesCategory;
