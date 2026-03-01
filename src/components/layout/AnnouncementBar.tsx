import { Gift, Truck, BadgePercent } from "lucide-react";

const announcements = [
  { icon: Truck, text: "Free Shipping on Orders Above ₹999" },
  { icon: BadgePercent, text: "Flat 10% OFF on First Order" },
  { icon: Gift, text: "Bulk Orders? Get Special Corporate Discounts" },
];

export const AnnouncementBar = () => {
  return (
    <div className="bg-gradient-hero overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap py-2.5">
        {[...announcements, ...announcements, ...announcements].map((item, index) => (
          <div key={index} className="mx-8 flex items-center gap-2 text-sm text-primary-foreground">
            <item.icon className="h-4 w-4" />
            <span className="font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
