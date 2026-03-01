import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Clock, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";


interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[] | null;
  frames: { name: string }[];
}

const filters = [
  { id: "all", label: "All", icon: Filter },
  { id: "collage", label: "Collage", icon: Clock },
];

const WallClockCategory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Acrylic Wall Clock")
        .eq("is_active", true);

      if (error) throw error;

      const parsedProducts = (data || []).map((p) => ({
        ...p,
        frames: Array.isArray(p.frames) ? (p.frames as unknown as { name: string }[]) : [],
      }));

      setProducts(parsedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "collage") {
      return product.name.toLowerCase().includes("collage") || 
             product.name.toLowerCase().includes("photos") ||
             product.name.toLowerCase().includes("pics");
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/category/acrylic" className="hover:text-primary transition-colors">Customise</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Wall Clocks</span>
          </nav>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Acrylic Wall Clocks
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform your memories into beautiful wall clocks. Premium acrylic with UV printing.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm font-medium text-muted-foreground mr-2">Wall Clocks Filters:</span>
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "gap-2 rounded-full",
                activeFilter === filter.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-xl aspect-square" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try changing the filter or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/wall-clock/${product.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay with clock numbers */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-foreground/10 backdrop-blur-sm">
                    <div className="relative w-3/4 h-3/4 flex items-center justify-center">
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 text-background font-bold text-sm">12</span>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-background font-bold text-sm">3</span>
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-background font-bold text-sm">6</span>
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-background font-bold text-sm">9</span>
                    </div>
                  </div>
                  
                  {product.frames?.[0]?.name && (
                    <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                      {product.frames[0].name}
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-3 h-3",
                          i < 4 ? "fill-primary text-primary" : "fill-muted text-muted"
                        )} 
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">₹{product.base_price}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{Math.round(product.base_price * 1.2)}</span>
                  </div>

                  <Button 
                    className="w-full mt-3 bg-primary hover:bg-primary/90" 
                    size="sm"
                  >
                    Customise
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-muted/50 rounded-2xl p-8">
          <h2 className="text-2xl font-heading font-bold text-foreground text-center mb-8">
            Why Choose Our Acrylic Wall Clocks?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "UV Printed", desc: "Super HD 1200x2400 DPI printing" },
              { title: "Chemical Treated", desc: "Acrylic treatment for durability" },
              { title: "Never Peels", desc: "Even in moisture environment" },
              { title: "Same Day Processing", desc: "Quick turnaround time" },
            ].map((feature, i) => (
              <div key={i} className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WallClockCategory;
