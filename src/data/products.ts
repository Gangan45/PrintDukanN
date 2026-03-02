import { CheckCircle2, Truck, Shield, Eye } from "lucide-react";
import type { ProductData } from "@/types/product";

import qrStandyMain from "@/assets/qr-standy-main.jpg";
import qrStandy2 from "@/assets/qr-standy-2.jpg";
import qrStandy3 from "@/assets/qr-standy-3.jpg";
import qrStandy4 from "@/assets/qr-standy-4.jpg";
import qrStandyBlack1 from "@/assets/qr-standy-black-1.jpg";
import qrStandyBlack2 from "@/assets/qr-standy-black-2.jpg";
import qrStandyGold1 from "@/assets/qr-standy-gold-1.jpg";
import qrStandyGold2 from "@/assets/qr-standy-gold-2.jpg";
import reviewPhoto1 from "@/assets/review-photo-1.jpg";
import reviewPhoto2 from "@/assets/review-photo-2.jpg";
import relatedNameplate from "@/assets/related-nameplate.jpg";
import relatedTrophy from "@/assets/related-trophy.jpg";
import relatedBadge from "@/assets/related-badge.jpg";
import relatedRotatingQr from "@/assets/related-rotating-qr.jpg";

const defaultTrustBadges = [
  { icon: Eye, text: "After Placing Order, Preview Will Be Shared", highlight: false },
  { icon: CheckCircle2, text: '10% OFF, Code "FIRST10" (First Order)', highlight: true },
  { icon: Truck, text: "Free Delivery On All Orders Above ₹999/-", highlight: false },
  { icon: Shield, text: "Secure Online Payments", highlight: false },
];

const defaultQuantities = [
  { value: 3, label: "3 Pieces", price: 599 },
  { value: 5, label: "5 Pieces", price: 549 },
  { value: 10, label: "10 Pieces", price: 499 },
  { value: 25, label: "25 Pieces", price: 449 },
  { value: 50, label: "50 Pieces", price: 399 },
  { value: 100, label: "100 Pieces", price: 349 },
];

const defaultInfoSections = [
  {
    title: "Product Details",
    content: `<ul class="space-y-2 text-muted-foreground"><li>• Premium Quality Material</li><li>• UV Printed with High Resolution</li><li>• Scratch Resistant Surface</li><li>• Customizable Design</li><li>• Perfect for Corporate & Personal Use</li></ul>`,
  },
  {
    title: "Shipping Information",
    content: `<div class="space-y-2 text-muted-foreground"><p><strong>Processing Time:</strong> 2-3 Business Days</p><p><strong>Delivery:</strong> 5-7 Business Days</p><p><strong>Free Shipping:</strong> On Orders Above ₹999</p></div>`,
  },
];

const defaultReviews = [
  { id: 1, name: "Rahul Sharma", rating: 5, date: "2 days ago", title: "Excellent quality!", content: "Great product, exactly as described. Very happy with the purchase!", helpful: 12, verified: true },
  { id: 2, name: "Priya Patel", rating: 4, date: "1 week ago", title: "Good product", content: "Quality is good, delivery was fast. Would recommend.", helpful: 8, verified: true },
];

export const products: Record<string, ProductData> = {
  "qr-standy": {
    id: "qr-standy",
    name: "Premium QR Standy | Custom Acrylic Stand | Best for Restaurants & Corporate",
    basePrice: 599,
    rating: 4.5,
    reviewCount: 128,
    images: [qrStandyMain, qrStandy2, qrStandy3, qrStandy4],
    quantities: defaultQuantities,
    variants: [
      { value: "clear", label: "Clear Acrylic", images: [qrStandyMain, qrStandy2, qrStandy3, qrStandy4] },
      { value: "black", label: "Black Base", images: [qrStandyBlack1, qrStandyBlack2, qrStandy3, qrStandy4] },
      { value: "gold", label: "Gold Accent", images: [qrStandyGold1, qrStandyGold2, qrStandy3, qrStandy4] },
    ],
    trustBadges: defaultTrustBadges,
    infoSections: [
      {
        title: "Product Details",
        content: `<ul class="space-y-2 text-muted-foreground"><li>• Premium Quality Acrylic Material</li><li>• UV Printed with High Resolution</li><li>• Scratch Resistant Surface</li><li>• Sturdy Base for Stability</li><li>• Customizable with Your QR Code & Logo</li><li>• Perfect for Restaurants, Cafes, Offices</li></ul>`,
      },
      {
        title: "Size & Dimensions",
        content: `<div class="space-y-2 text-muted-foreground"><p><strong>Standard Size:</strong> 4" x 4" (10cm x 10cm)</p><p><strong>Height with Stand:</strong> 5 inches</p><p><strong>Material Thickness:</strong> 5mm Acrylic</p><p><strong>Weight:</strong> ~150 grams</p></div>`,
      },
      {
        title: "Customization Options",
        content: `<ul class="space-y-2 text-muted-foreground"><li>• Add Your Business Logo</li><li>• Custom QR Code (Menu, Payment, Website)</li><li>• Choose Background Color</li><li>• Add Contact Information</li><li>• Custom Text & Messaging</li></ul>`,
      },
      {
        title: "Shipping Information",
        content: `<div class="space-y-2 text-muted-foreground"><p><strong>Processing Time:</strong> 2-3 Business Days</p><p><strong>Delivery:</strong> 5-7 Business Days</p><p><strong>Free Shipping:</strong> On Orders Above ₹999</p><p>Secure packaging to prevent damage during transit.</p></div>`,
      },
    ],
    reviews: [
      { id: 1, name: "Rahul Sharma", rating: 5, date: "2 days ago", title: "Excellent quality for our restaurant!", content: "We ordered 25 pieces for our restaurant chain. The print quality is amazing and the acrylic is thick and sturdy.", helpful: 24, verified: true, photos: [reviewPhoto1] },
      { id: 2, name: "Priya Patel", rating: 5, date: "1 week ago", title: "Perfect for corporate gifting", content: "Gifted these to our clients with their company logos. The customization came out perfect and delivery was super fast.", helpful: 18, verified: true, photos: [reviewPhoto2] },
      { id: 3, name: "Amit Kumar", rating: 4, date: "2 weeks ago", title: "Good product, fast delivery", content: "Quality is good, exactly as shown in pictures. Received within 5 days.", helpful: 12, verified: true },
      { id: 4, name: "Sneha Gupta", rating: 5, date: "3 weeks ago", title: "Love the clear acrylic finish!", content: "The clarity of the acrylic is outstanding. Our cafe looks so professional now!", helpful: 8, verified: true },
    ],
    relatedProducts: [
      { id: "rotating-qr", name: "Rotating QR Standy | 360° Metal Base", image: relatedRotatingQr, price: 799, originalPrice: 999, rating: 4.6, reviewCount: 89, badge: "Bestseller" },
      { id: "qr-black-base", name: "Premium QR Stand | Black Base Edition", image: qrStandy4, price: 649, originalPrice: 849, rating: 4.4, reviewCount: 56 },
      { id: "nameplate", name: "Acrylic Desk Name Plate | Wooden Base", image: relatedNameplate, price: 549, originalPrice: 699, rating: 4.7, reviewCount: 234, badge: "Popular" },
      { id: "trophy", name: "Crystal Acrylic Trophy | Custom Engraving", image: relatedTrophy, price: 1299, originalPrice: 1599, rating: 4.8, reviewCount: 156 },
      { id: "badge", name: "Magnetic Name Badge | Corporate ID", image: relatedBadge, price: 249, originalPrice: 349, rating: 4.5, reviewCount: 412, badge: "Value Pack" },
    ],
  },
  "rotating-qr": {
    id: "rotating-qr",
    name: "Rotating QR Standy | 360° Metal Base | Premium Display Stand",
    basePrice: 799,
    rating: 4.6,
    reviewCount: 89,
    images: [relatedRotatingQr, qrStandy2, qrStandy3],
    quantities: [
      { value: 1, label: "1 Piece", price: 799 },
      { value: 3, label: "3 Pieces", price: 749 },
      { value: 5, label: "5 Pieces", price: 699 },
      { value: 10, label: "10 Pieces", price: 649 },
    ],
    variants: [
      { value: "silver", label: "Silver Metal", images: [relatedRotatingQr, qrStandy2, qrStandy3] },
      { value: "black", label: "Matte Black", images: [qrStandyBlack1, qrStandyBlack2, qrStandy3] },
    ],
    trustBadges: defaultTrustBadges,
    infoSections: [
      {
        title: "Product Details",
        content: `<ul class="space-y-2 text-muted-foreground"><li>• 360° Rotating Metal Base</li><li>• Premium Acrylic Display Panel</li><li>• Smooth Ball Bearing Rotation</li><li>• Heavy Duty & Stable</li><li>• Eye-catching Design</li></ul>`,
      },
      ...defaultInfoSections.slice(1),
    ],
    reviews: defaultReviews,
    relatedProducts: [
      { id: "qr-standy", name: "Premium QR Standy | Custom Acrylic Stand", image: qrStandyMain, price: 599, originalPrice: 719, rating: 4.5, reviewCount: 128 },
      { id: "nameplate", name: "Acrylic Desk Name Plate | Wooden Base", image: relatedNameplate, price: 549, originalPrice: 699, rating: 4.7, reviewCount: 234, badge: "Popular" },
      { id: "trophy", name: "Crystal Acrylic Trophy | Custom Engraving", image: relatedTrophy, price: 1299, originalPrice: 1599, rating: 4.8, reviewCount: 156 },
    ],
  },
  "qr-black-base": {
    id: "qr-black-base",
    name: "Premium QR Stand | Black Base Edition | Modern Corporate Style",
    basePrice: 649,
    rating: 4.4,
    reviewCount: 56,
    images: [qrStandyBlack1, qrStandyBlack2, qrStandy3, qrStandy4],
    quantities: defaultQuantities.map(q => ({ ...q, price: q.price + 50 })),
    variants: [
      { value: "matte", label: "Matte Black", images: [qrStandyBlack1, qrStandyBlack2, qrStandy3, qrStandy4] },
      { value: "glossy", label: "Glossy Black", images: [qrStandyBlack2, qrStandyBlack1, qrStandy3, qrStandy4] },
    ],
    trustBadges: defaultTrustBadges,
    infoSections: defaultInfoSections,
    reviews: defaultReviews,
    relatedProducts: [
      { id: "qr-standy", name: "Premium QR Standy | Clear Acrylic", image: qrStandyMain, price: 599, originalPrice: 719, rating: 4.5, reviewCount: 128 },
      { id: "rotating-qr", name: "Rotating QR Standy | 360° Metal Base", image: relatedRotatingQr, price: 799, originalPrice: 999, rating: 4.6, reviewCount: 89, badge: "Bestseller" },
      { id: "badge", name: "Magnetic Name Badge | Corporate ID", image: relatedBadge, price: 249, originalPrice: 349, rating: 4.5, reviewCount: 412, badge: "Value Pack" },
    ],
  },
  "nameplate": {
    id: "nameplate",
    name: "Acrylic Desk Name Plate | Wooden Base | Executive Office Decor",
    basePrice: 549,
    rating: 4.7,
    reviewCount: 234,
    images: [relatedNameplate, qrStandy2, qrStandy3],
    quantities: [
      { value: 1, label: "1 Piece", price: 549 },
      { value: 3, label: "3 Pieces", price: 499 },
      { value: 5, label: "5 Pieces", price: 449 },
      { value: 10, label: "10 Pieces", price: 399 },
    ],
    variants: [
      { value: "walnut", label: "Walnut Wood", images: [relatedNameplate, qrStandy2, qrStandy3] },
      { value: "oak", label: "Oak Wood", images: [relatedNameplate, qrStandy3, qrStandy2] },
      { value: "black", label: "Black Matte", images: [qrStandyBlack1, relatedNameplate, qrStandy3] },
    ],
    trustBadges: defaultTrustBadges,
    infoSections: [
      {
        title: "Product Details",
        content: `<ul class="space-y-2 text-muted-foreground"><li>• Premium Acrylic with Wooden Base</li><li>• UV Printed Text & Graphics</li><li>• Multiple Font Options Available</li><li>• Perfect for Offices & Desks</li><li>• Professional Executive Look</li></ul>`,
      },
      ...defaultInfoSections.slice(1),
    ],
    reviews: defaultReviews,
    relatedProducts: [
      { id: "qr-standy", name: "Premium QR Standy | Custom Acrylic Stand", image: qrStandyMain, price: 599, originalPrice: 719, rating: 4.5, reviewCount: 128 },
      { id: "trophy", name: "Crystal Acrylic Trophy | Custom Engraving", image: relatedTrophy, price: 1299, originalPrice: 1599, rating: 4.8, reviewCount: 156 },
      { id: "badge", name: "Magnetic Name Badge | Corporate ID", image: relatedBadge, price: 249, originalPrice: 349, rating: 4.5, reviewCount: 412, badge: "Value Pack" },
    ],
  },
  "trophy": {
    id: "trophy",
    name: "Crystal Acrylic Trophy | Custom Engraving | Award & Recognition",
    basePrice: 1299,
    rating: 4.8,
    reviewCount: 156,
    images: [relatedTrophy, qrStandy2, qrStandy3],
    quantities: [
      { value: 1, label: "1 Piece", price: 1299 },
      { value: 3, label: "3 Pieces", price: 1199 },
      { value: 5, label: "5 Pieces", price: 1099 },
      { value: 10, label: "10 Pieces", price: 999 },
    ],
    variants: [
      { value: "crystal", label: "Crystal Clear", images: [relatedTrophy, qrStandy2, qrStandy3] },
      { value: "gold-accent", label: "Gold Accent", images: [qrStandyGold1, relatedTrophy, qrStandy3] },
    ],
    trustBadges: defaultTrustBadges,
    infoSections: [
      {
        title: "Product Details",
        content: `<ul class="space-y-2 text-muted-foreground"><li>• Premium Crystal Acrylic Material</li><li>• Custom Laser Engraving</li><li>• Elegant Gift Box Included</li><li>• Perfect for Awards & Recognition</li><li>• Multiple Size Options</li></ul>`,
      },
      ...defaultInfoSections.slice(1),
    ],
    reviews: defaultReviews,
    relatedProducts: [
      { id: "nameplate", name: "Acrylic Desk Name Plate | Wooden Base", image: relatedNameplate, price: 549, originalPrice: 699, rating: 4.7, reviewCount: 234, badge: "Popular" },
      { id: "qr-standy", name: "Premium QR Standy | Custom Acrylic Stand", image: qrStandyMain, price: 599, originalPrice: 719, rating: 4.5, reviewCount: 128 },
      { id: "badge", name: "Magnetic Name Badge | Corporate ID", image: relatedBadge, price: 249, originalPrice: 349, rating: 4.5, reviewCount: 412, badge: "Value Pack" },
    ],
  },
  "badge": {
    id: "badge",
    name: "Magnetic Name Badge | Corporate ID | Professional Name Tag",
    basePrice: 249,
    rating: 4.5,
    reviewCount: 412,
    images: [relatedBadge, qrStandy2, qrStandy3],
    quantities: [
      { value: 5, label: "5 Pieces", price: 249 },
      { value: 10, label: "10 Pieces", price: 229 },
      { value: 25, label: "25 Pieces", price: 199 },
      { value: 50, label: "50 Pieces", price: 179 },
      { value: 100, label: "100 Pieces", price: 149 },
    ],
    variants: [
      { value: "silver", label: "Silver Frame", images: [relatedBadge, qrStandy2, qrStandy3] },
      { value: "gold", label: "Gold Frame", images: [qrStandyGold1, relatedBadge, qrStandy3] },
      { value: "black", label: "Black Frame", images: [qrStandyBlack1, relatedBadge, qrStandy3] },
    ],
    trustBadges: defaultTrustBadges,
    infoSections: [
      {
        title: "Product Details",
        content: `<ul class="space-y-2 text-muted-foreground"><li>• Strong Magnetic Backing</li><li>• Won't Damage Clothing</li><li>• Custom Print with Name & Designation</li><li>• Professional Corporate Look</li><li>• Bulk Order Discounts Available</li></ul>`,
      },
      ...defaultInfoSections.slice(1),
    ],
    reviews: defaultReviews,
    relatedProducts: [
      { id: "nameplate", name: "Acrylic Desk Name Plate | Wooden Base", image: relatedNameplate, price: 549, originalPrice: 699, rating: 4.7, reviewCount: 234, badge: "Popular" },
      { id: "qr-standy", name: "Premium QR Standy | Custom Acrylic Stand", image: qrStandyMain, price: 599, originalPrice: 719, rating: 4.5, reviewCount: 128 },
      { id: "trophy", name: "Crystal Acrylic Trophy | Custom Engraving", image: relatedTrophy, price: 1299, originalPrice: 1599, rating: 4.8, reviewCount: 156 },
    ],
  },
};

export const getProductById = (id: string): ProductData | undefined => {
  return products[id];
};

export const getAllProducts = (): ProductData[] => {
  return Object.values(products);
};
