import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Briefcase, Gift, Users, Package, Star, Sparkles, Building2 } from "lucide-react";
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

// Corporate gift categories for showcase
const giftShowcases = [
  {
    id: "executive",
    title: "Executive Gifts",
    subtitle: "Premium Quality",
    description: "Luxury corporate gifts for executives and VIP clients.",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=600&fit=crop",
    bgColor: "from-slate-900 to-gray-800",
    icon: Briefcase,
  },
  {
    id: "branded",
    title: "Branded Merchandise",
    subtitle: "Company Branding",
    description: "Custom branded products with your company logo and identity.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    bgColor: "from-blue-900/80 to-indigo-900/60",
    icon: Building2,
  },
  {
    id: "bulk",
    title: "Bulk Orders",
    subtitle: "Best Value",
    description: "Special pricing for bulk corporate orders and events.",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop",
    bgColor: "from-emerald-900/80 to-green-900/60",
    icon: Package,
  },
];

// Popular gift categories
const giftCategories = [
  { 
    id: "badges", 
    title: "Wedding Card", 
    description: "Professional name badges for your team",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
    link: "/category/magnetic-badges"
  },
  { 
    id: "t-shirts", 
    title: "Custom T-Shirts", 
    description: "Branded apparel for events and teams",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
    link: "/category/t-shirts"
  },
  { 
    id: "awards", 
    title: "Trophies & Awards", 
    description: "Recognition for achievements",
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop",
    link: "/category/trophies"
  },
  { 
    id: "qr-standee", 
    title: "QR Standees", 
    description: "Smart digital display solutions",
    image: "https://images.unsplash.com/photo-1622126807280-9b5b32b28e77?w=400&h=300&fit=crop",
    link: "/category/qr-standee"
  },
];

// Filter options for Corporate Gifts
const filterCategories = [
  { id: "all", label: "All Gifts", icon: "🎁" },
  { id: "executive", label: "Executive", icon: "💼" },
  { id: "tech", label: "Tech Gadgets", icon: "📱" },
  { id: "stationery", label: "Stationery", icon: "✏️" },
  { id: "drinkware", label: "Drinkware", icon: "☕" },
  { id: "bags", label: "Bags", icon: "👜" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
];

const CorporateGiftsCategory = () => {
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
        .eq('category', 'Corporate Gifts')
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
    if (lowerName.includes('executive') || lowerName.includes('premium') || lowerName.includes('luxury')) return 'executive';
    if (lowerName.includes('tech') || lowerName.includes('gadget') || lowerName.includes('charger') || lowerName.includes('speaker')) return 'tech';
    if (lowerName.includes('pen') || lowerName.includes('diary') || lowerName.includes('notebook') || lowerName.includes('stationery')) return 'stationery';
    if (lowerName.includes('mug') || lowerName.includes('bottle') || lowerName.includes('tumbler') || lowerName.includes('sipper')) return 'drinkware';
    if (lowerName.includes('bag') || lowerName.includes('backpack') || lowerName.includes('tote')) return 'bags';
    if (lowerName.includes('wellness') || lowerName.includes('yoga') || lowerName.includes('fitness')) return 'wellness';
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
      category: product.category,
      isCustomizable: product.is_customizable ?? false,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Best Corporate Gifts & Branded Merchandise | Bulk Orders | PrintMine</title>
        <meta name="description" content="Shop premium corporate gifts, branded merchandise & promotional products. Custom magnetic badges, t-shirts, trophies & more. Special bulk order pricing. Fast delivery across India." />
        <meta name="keywords" content="corporate gifts, branded merchandise, promotional products, bulk corporate gifts, custom company gifts, employee gifts, client gifts, executive gifts" />
        <link rel="canonical" href="/category/corporate-gifts" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Corporate Gifts Collection",
            "description": "Premium corporate gifts and branded merchandise for businesses",
            "url": "/category/corporate-gifts"
          })}
        </script>
      </Helmet>

      <Header />

      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span><strong>Special Offer!</strong> Get 15% OFF on bulk orders of 50+ items</span>
          <Badge variant="secondary" className="ml-2">BULK15</Badge>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li><ChevronRight className="w-4 h-4" aria-hidden="true" /></li>
          <li className="text-foreground font-medium" aria-current="page">Corporate Gifts</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1920&h=800&fit=crop')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">Trusted by 1000+ Companies</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Premium Corporate Gifts
              </h1>
              <p className="text-lg lg:text-xl text-white/80 leading-relaxed">
                Elevate your brand with our curated collection of corporate gifts and branded merchandise. 
                Perfect for employee appreciation, client gifting, and promotional events.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                  <Gift className="mr-2 w-5 h-5" />
                  Explore Collection
                </Button>
                
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-sm text-white/60">Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">1000+</p>
                  <p className="text-sm text-white/60">Happy Clients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">4.9★</p>
                  <p className="text-sm text-white/60">Rating</p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&h=500&fit=crop"
                  alt="Corporate Gifts Collection"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Links */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Popular Gift Categories
            </h2>
            <p className="text-muted-foreground mt-2">Browse our most requested corporate gift solutions</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {giftCategories.map((category) => (
              <Link
                key={category.id}
                to={category.link}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-semibold text-lg">{category.title}</h3>
                  <p className="text-sm text-white/70 line-clamp-1">{category.description}</p>
                </div>
              </Link>
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
      <section className="container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
            Our Corporate Gift Collection
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Premium quality corporate gifts with custom branding options
          </p>
        </div>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          emptyMessage="No products found in this category"
          customizeUrlPrefix="/corporate-gift/customize" // Isko change kare
          detailUrlPrefix="/corporate-gift"
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onResetFilter={() => setActiveFilter("all")}
        />
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Why Choose PrintMine for Corporate Gifts?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Gift, title: "500+ Products", description: "Wide range of customizable corporate gifts" },
              { icon: Star, title: "Premium Quality", description: "Only the finest materials and finishes" },
              { icon: Package, title: "Bulk Discounts", description: "Special pricing for large orders" },
              { icon: Users, title: "Dedicated Support", description: "Personal account manager for corporates" },
            ].map((item, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-4">
            Need Help with Bulk Corporate Orders?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Our corporate gifting experts are here to help you find the perfect gifts for your team or clients.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary">
              Get a Custom Quote
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Call: +91 9876543210
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CorporateGiftsCategory;
