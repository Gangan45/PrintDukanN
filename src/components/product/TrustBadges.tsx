import { CheckCircle2, Truck, Shield, Eye, CreditCard } from "lucide-react";

const badges = [
  {
    icon: Eye,
    text: "After Placing Order, Preview Will Be Shared",
    highlight: false,
  },
  {
    icon: CreditCard,
    text: "10% OFF on Online Payment",
    highlight: true,
  },
  {
    icon: CheckCircle2,
    text: 'Use Code "FIRST10" for First Order Discount',
    highlight: false,
  },
  {
    icon: Truck,
    text: "Free Delivery On All Orders Above ₹999/-",
    highlight: false,
  },
  {
    icon: Shield,
    text: "Secure Online Payments",
    highlight: false,
  },
];

const TrustBadges = () => {
  return (
    <div className="space-y-3 py-4 border-t border-border">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <badge.icon className="w-5 h-5 text-success flex-shrink-0" />
          <p className={`text-sm ${badge.highlight ? "text-primary font-medium" : "text-muted-foreground"}`}>
            {badge.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
