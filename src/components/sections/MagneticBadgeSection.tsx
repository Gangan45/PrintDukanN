import { Link } from "react-router-dom";
import { Badge as BadgeIcon, Briefcase, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import magneticBadgeImage from "@/assets/magnetic-badge-section.jpg";

const features = [
  { icon: Briefcase, label: "Corporate Ready", desc: "Perfect for offices & teams" },
  { icon: Users, label: "Bulk Orders", desc: "Special pricing on 50+ pieces" },
  { icon: Sparkles, label: "Premium Finish", desc: "Glossy print, durable magnet" },
];

const benefits = [
  "Reusable & damage-free clothing",
  "Custom photo, name & company logo",
  "Strong neodymium magnets",
  "Fast 3-5 day delivery",
];

export const MagneticBadgeSection = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <BadgeIcon className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              New Arrival
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3">
            Magnetic <span className="font-display italic text-primary">Name Badges</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium magnetic badges for professionals, offices, events & teams. Reusable, stylish, and damage-free.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Image */}
          <div className="relative group order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50">
              <img
                src={magneticBadgeImage}
                alt="Premium magnetic name badges collection"
                loading="lazy"
                width={1200}
                height={800}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Floating Price Badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-card/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-border/50">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold">Starting at</div>
                <div className="text-xl sm:text-2xl font-bold text-primary">₹149<span className="text-xs sm:text-sm text-muted-foreground font-normal">/pc</span></div>
              </div>
              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/40 to-transparent" />
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Feature cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{feature.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Benefits list */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Why Choose Our Badges
              </h3>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1 group shadow-lg shadow-primary/25">
                <Link to="/category/magnetic-badge">
                  Shop Magnetic Badges
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <a href="https://wa.me/918518851767?text=Hi!%20I%20need%20bulk%20pricing%20for%20Magnetic%20Badges." target="_blank" rel="noopener noreferrer">
                  Get Bulk Quote
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
