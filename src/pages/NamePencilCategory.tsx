import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Star, ShoppingCart, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

import namePencil1 from "@/assets/name-pencil-1.jpg";
import namePencil2 from "@/assets/name-pencil-2.jpg";
import namePencil3 from "@/assets/name-pencil-3.jpg";
import namePencil4 from "@/assets/name-pencil-4.jpg";

const features = [
  { title: "Smooth & Dark Writing", description: "Premium quality lead for smooth, dark writing experience", image: namePencil1 },
  { title: "Vibrant Neon Colors", description: "Eye-catching neon colored pencils that kids will love", image: namePencil2 },
  { title: "Ergonomic Design", description: "Comfortable grip for long writing sessions", image: namePencil3 },
  { title: "Free Eraser & Sharpener", description: "Every pack comes with a free eraser and sharpener combo", image: namePencil4 },
];

const bulkPricing = [
  { packs: "1 Pack", price: 299, perPencil: "₹29.9/pencil" },
  { packs: "2+ Packs", price: 149, perPencil: "₹14.9/pencil" },
  { packs: "5+ Packs", price: 129, perPencil: "₹12.9/pencil" },
  { packs: "10+ Packs", price: 99, perPencil: "₹9.9/pencil" },
  { packs: "20+ Packs", price: 89, perPencil: "₹8.9/pencil" },
  { packs: "50+ Packs", price: 79, perPencil: "₹7.9/pencil" },
];

const NamePencilCategory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Name Pencils")
        .eq("is_active", true);
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Personalized Name Pencils | Custom Printed Pencils | PrintDukan</title>
        <meta name="description" content="Order personalized name pencils online. Custom printed pencils perfect for kids, schools, return gifts & corporate events. Starting at ₹79/pack." />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10 py-12 md:py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm font-medium">
                  <Pencil className="w-4 h-4" />
                  Personalized for You
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Name <span className="text-amber-600 dark:text-amber-400">Pencils</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  Personalized name pencils that your kids will love! Perfect for schools, return gifts & corporate events.
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-foreground">₹299<span className="text-lg text-muted-foreground line-through ml-2">₹399</span></div>
                  <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-semibold px-3 py-1 rounded-full">25% OFF</span>
                </div>
                <p className="text-sm text-muted-foreground">Each pack contains 10 pencils + Free Eraser & Sharpener</p>
                <Button
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                  onClick={() => {
                    const product = products[0];
                    if (product) navigate(`/name-pencil/${product.id}`);
                    else navigate("/name-pencil/customize");
                  }}
                >
                  <Pencil className="w-5 h-5 mr-2" />
                  Customize Now
                </Button>
              </div>
              <div className="relative">
                <img src={namePencil1} alt="Personalized Name Pencils" className="w-full rounded-2xl shadow-2xl" />
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 hidden md:block">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">4.8/5 (2000+ Reviews)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bulk Pricing */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-2">Buy More, Save More</h2>
            <p className="text-center text-muted-foreground mb-8">Bulk discounts on every order</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {bulkPricing.map((tier, i) => (
                <div key={i} className={`relative rounded-xl p-4 text-center border-2 transition-all ${i === 0 ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-border bg-card hover:border-amber-300'}`}>
                  {i === 5 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Best Value</span>}
                  <p className="font-semibold text-foreground text-sm">{tier.packs}</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 my-1">₹{tier.price}</p>
                  <p className="text-xs text-muted-foreground">{tier.perPencil}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">Why Our Pencils?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-border">
                  <img src={feature.image} alt={feature.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">Perfect For</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["🎒 School Kids", "🎁 Return Gifts", "🏢 Corporate Events", "📚 Teachers"].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <p className="text-lg font-medium text-foreground">{item}</p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="mt-8 bg-amber-600 hover:bg-amber-700 text-white px-10"
              onClick={() => {
                const product = products[0];
                if (product) navigate(`/name-pencil/${product.id}`);
                else navigate("/name-pencil/customize");
              }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Order Now - Starting ₹79/pack
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default NamePencilCategory;
