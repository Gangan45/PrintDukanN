import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
  Magnet,
  Image as ImageIcon,
} from "lucide-react";
import showcaseAsset from "@/assets/acrylic-magnet-showcase.mp4.asset.json";
import gallery1 from "@/assets/acrylic-magnet-gallery-1.png";
import gallery2 from "@/assets/acrylic-magnet-gallery-2.png";
import gallery3 from "@/assets/acrylic-magnet-gallery-3.png";
import gallery4 from "@/assets/acrylic-magnet-gallery-4.png";

const FEATURES = [
  {
    icon: Magnet,
    title: "Strong Magnetic Hold",
    desc: "Premium neodymium magnets that stay put on any metal surface.",
  },
  {
    icon: ImageIcon,
    title: "HD Photo Print",
    desc: "Crystal clear UV print on 3mm crystal-clear acrylic.",
  },
  {
    icon: ShieldCheck,
    title: "Scratch Resistant",
    desc: "Durable glossy finish that keeps memories looking fresh.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Dispatched within 24-48 hours across India.",
  },
];

const SIZES = [
  { name: "Small Square", size: '2.5" x 2.5"', price: 199 },
  { name: "Standard", size: '3" x 3"', price: 249 },
  { name: "Large", size: '4" x 4"', price: 349 },
  { name: "Set of 6", size: 'Mixed sizes', price: 999, badge: "Best Value" },
];

const GALLERY = [gallery1, gallery2, gallery3, gallery4];

const AcrylicMagnetCategory = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Acrylic Magnet — Custom Photo Fridge Magnets | PrintDukan</title>
        <meta
          name="description"
          content="Personalised acrylic photo magnets with HD print and strong magnetic hold. Turn memories into beautiful fridge art. Starting ₹199."
        />
        <link rel="canonical" href="/category/acrylic-magnet" />
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/category/acrylic" className="hover:text-primary">Acrylic</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Acrylic Magnet</span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 lg:py-14 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              New • Custom Acrylic Magnets
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
              Your memories,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                stuck in style
              </span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl">
              Premium 3mm acrylic photo magnets with HD UV print and a powerful
              magnetic back. Perfect for fridges, lockers, whiteboards & gifting.
            </p>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">₹199</span>
              <span className="text-sm text-muted-foreground line-through">₹399</span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                50% OFF
              </span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link to="/fridge-magnet/customize">Customize Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#gallery">See Gallery</a>
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Quality Assured</span>
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> Free Shipping ₹499+</span>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted ring-1 ring-border">
              <video
                src={showcaseAsset.url}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-80">Live Preview</p>
                  <p className="text-lg font-semibold">Custom Acrylic Magnets</p>
                </div>
                <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-medium">
                  3mm Glossy
                </span>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 hidden md:block bg-card border border-border rounded-xl shadow-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Loved by</p>
                  <p className="text-sm font-bold">10,000+ happy homes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base mb-1">{f.title}</h3>
              <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sizes & Pricing */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Pick your size</h2>
            <p className="text-sm text-muted-foreground">Single magnets or money-saving sets — all printed in HD.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SIZES.map((s) => (
              <Link
                key={s.name}
                to="/fridge-magnet/customize"
                className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all"
              >
                {s.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                )}
                <h3 className="font-semibold mb-1">{s.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{s.size}</p>
                <p className="text-2xl font-bold text-primary">₹{s.price}</p>
                <p className="text-xs text-muted-foreground mt-2 group-hover:text-primary transition-colors">
                  Customize →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="container mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">Real moments, real magnets</h2>
          <p className="text-sm text-muted-foreground">Inspiration from our customers.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {GALLERY.map((src, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted group">
              <img
                src={src}
                alt={`Acrylic magnet sample ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="container mx-auto px-4 pb-12 lg:pb-16">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-8 lg:p-12 text-center text-primary-foreground shadow-xl">
          <h2 className="text-2xl lg:text-4xl font-bold mb-3">Ready to print your memories?</h2>
          <p className="text-sm lg:text-base opacity-90 max-w-xl mx-auto mb-6">
            Upload a photo, choose a size, and we'll deliver your custom acrylic magnets to your doorstep.
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-lg">
            <Link to="/fridge-magnet/customize">Start Designing</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AcrylicMagnetCategory;
