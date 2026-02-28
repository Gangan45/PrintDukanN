import { Truck, Shield, Headphones, RotateCcw } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day return policy",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-8 sm:py-12 bg-card border-y border-border">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 sm:gap-4 group"
            >
              <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                <badge.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-xs sm:text-base">{badge.title}</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
