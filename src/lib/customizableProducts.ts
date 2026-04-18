/**
 * Centralized helpers to detect "customizable" product categories and to
 * compute the correct in-app customize URL for them.
 *
 * A customizable product MUST be customized (custom image / text uploaded)
 * before it can be added to cart or purchased. The cart and buy-now hooks
 * use `requiresCustomization` to enforce this.
 */

const CUSTOMIZABLE_CATEGORY_KEYWORDS = [
  "acrylic",
  "name plate",
  "name pencil",
  "qr",
  "wall clock",
  "magnetic badge",
  "baby frame",
  "baby birth",
  "t-shirt",
  "tshirt",
  "framed acrylic",
  "wall photo",
];

/** True if a product category is one we expect to be personalized. */
export function isCustomizableCategory(category?: string | null): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  return CUSTOMIZABLE_CATEGORY_KEYWORDS.some((kw) => c.includes(kw));
}

/**
 * True if this cart/buy-now request is missing the personalization assets
 * (no custom image AND no custom text) that a customizable product needs.
 */
export function requiresCustomization(params: {
  category?: string | null;
  customImageUrl?: string | File | null;
  customText?: string | null;
}): boolean {
  if (!isCustomizableCategory(params.category)) return false;
  const hasImage = !!params.customImageUrl;
  const hasText = !!(params.customText && params.customText.trim().length > 0);
  return !hasImage && !hasText;
}

/** Get the customize URL for a product. Mirrors the routing in App.tsx. */
export function getCustomizeUrl(
  category: string | null | undefined,
  productId: string,
  productName: string = ""
): string {
  const c = (category || "").toLowerCase();
  const n = (productName || "").toLowerCase();

  if (c.includes("name plate")) return `/name-plate-customize/${productId}`;
  if (c.includes("name pencil") || n.includes("pencil"))
    return `/name-pencil-customize/${productId}`;
  if (c.includes("qr")) return `/qr-standy-customize/${productId}`;
  if (c.includes("wall clock") || n.includes("wall clock"))
    return `/wall-clock-customize/${productId}`;
  if (c.includes("magnetic")) return `/magnetic-badge-customize/${productId}`;
  if (c.includes("baby")) return `/baby-frame-customize/${productId}`;
  if (c.includes("t-shirt") || c.includes("tshirt"))
    return `/tshirt-customize/${productId}`;
  if (c.includes("framed acrylic")) return `/framed-acrylic-customize/${productId}`;
  if (c.includes("omg") || n.includes("omg"))
    return `/omgs-acrylic-customize/${productId}`;
  // Default acrylic / wall photo / generic customizable
  return `/customize/${productId}`;
}
