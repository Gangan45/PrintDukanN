import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Percent, Clock, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Percent, Gift, Clock, Tag,
};

interface SpecialOffer {
  id: string;
  title: string;
  subtitle: string;
  code: string | null;
  cta_text: string;
  link: string;
  gradient_from: string;
  gradient_to: string;
  icon_name: string;
  display_order: number;
}

const gradientMap: Record<string, string> = {
  "primary": "hsl(var(--primary))",
  "coral": "hsl(var(--coral))",
  "coral-dark": "hsl(var(--coral-dark))",
  "navy": "hsl(var(--navy))",
  "navy-light": "hsl(var(--navy-light))",
};

const fallbackOffers: SpecialOffer[] = [
  { id: "1", title: "Flat 10% OFF", subtitle: "On Your First Order", code: "FIRST10", cta_text: "Shop Now", link: "/category/acrylic-photos", gradient_from: "primary", gradient_to: "coral-dark", icon_name: "Percent", display_order: 1 },
  { id: "2", title: "Bulk Order Discount", subtitle: "50+ Qty = Extra 15% OFF", code: "BULK15", cta_text: "Get Quote", link: "/category/corporate-gifts", gradient_from: "navy", gradient_to: "navy-light", icon_name: "Gift", display_order: 2 },
  { id: "3", title: "Free Shipping", subtitle: "On Orders Above ₹999", code: null, cta_text: "Explore", link: "/category/acrylic-photos", gradient_from: "coral", gradient_to: "primary", icon_name: "Clock", display_order: 3 },
];

export const SpecialOffers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>(fallbackOffers);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('special_offers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data && data.length > 0) setOffers(data);
    };
    fetch();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-semibold mb-4 animate-pulse">
            🔥 Limited Time Deals
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display italic">
            Special Offers For You
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => {
            const Icon = iconMap[offer.icon_name] || Percent;
            const fromColor = gradientMap[offer.gradient_from] || gradientMap["primary"];
            const toColor = gradientMap[offer.gradient_to] || gradientMap["coral-dark"];

            return (
              <div
                key={offer.id}
                className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-primary-foreground group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-8 -translate-x-8" />

                <div className="relative z-10">
                  <Icon className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-2xl sm:text-3xl font-bold mb-1">{offer.title}</h3>
                  <p className="text-primary-foreground/80 mb-4">{offer.subtitle}</p>

                  {offer.code && (
                    <div className="inline-block px-4 py-1.5 bg-primary-foreground/20 backdrop-blur-sm rounded-lg text-sm font-mono font-bold mb-5 border border-primary-foreground/30">
                      Code: {offer.code}
                    </div>
                  )}

                  <div className="mt-2">
                    <Link to={offer.link}>
                      <Button variant="heroOutline" size="sm" className="group-hover:bg-primary-foreground/20">
                        {offer.cta_text} →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
