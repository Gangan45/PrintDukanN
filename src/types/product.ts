export interface ProductQuantity {
  value: number;
  label: string;
  price: number;
}

export interface ProductVariant {
  value: string;
  label: string;
  images: string[];
}

export interface TrustBadge {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  highlight?: boolean;
}

export interface ProductInfoSection {
  title: string;
  content: string;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  photos?: string[];
}

export interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  badge?: string;
}

export interface ProductData {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  quantities: ProductQuantity[];
  variants: ProductVariant[];
  trustBadges: TrustBadge[];
  infoSections: ProductInfoSection[];
  reviews: Review[];
  relatedProducts: RelatedProduct[];
}
