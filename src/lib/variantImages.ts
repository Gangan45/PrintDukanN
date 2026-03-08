// Utility for variant-specific image mapping
// variant_images structure: { "variant_key": ["image_url1", "image_url2"], ... }
// Keys: "default", "size:value", "color:value", "frame:value", or combos like "size:Large,color:Red"

export type VariantImages = Record<string, string[]>;

export interface VariantSelection {
  size?: string;
  color?: string;
  frame?: string;
  material?: string;
  base?: string;
  finish?: string;
  [key: string]: string | undefined;
}

/**
 * Get images for a specific variant combination
 * Falls back to more general variants, then to default, then to base images
 */
export function getVariantImages(
  variantImages: VariantImages | null | undefined,
  baseImages: string[] | null | undefined,
  selection: VariantSelection
): string[] {
  if (!variantImages || Object.keys(variantImages).length === 0) {
    return baseImages || [];
  }

  // Build all possible variant keys from most specific to least specific
  const keys: string[] = [];
  const activeSelections = Object.entries(selection).filter(([_, v]) => v);

  // Try full combination first (e.g., "size:Large,color:Red,frame:Black")
  if (activeSelections.length > 0) {
    const fullKey = activeSelections
      .sort(([a], [b]) => a.localeCompare(b)) // Sort for consistent key order
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    keys.push(fullKey);
  }

  // Try individual variants (e.g., "size:Large", "color:Red")
  activeSelections.forEach(([key, value]) => {
    keys.push(`${key}:${value}`);
  });

  // Always include default as fallback
  keys.push('default');

  // Create a lowercase lookup map for case-insensitive matching
  const variantImagesLower: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(variantImages)) {
    variantImagesLower[k.toLowerCase()] = v;
  }

  // Find first matching key (case-insensitive)
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (variantImagesLower[lowerKey] && variantImagesLower[lowerKey].length > 0) {
      return variantImagesLower[lowerKey];
    }
  }

  // Final fallback to base images
  return baseImages || [];
}

/**
 * Generate a variant key from selections
 */
export function generateVariantKey(selection: VariantSelection): string {
  const activeSelections = Object.entries(selection).filter(([_, v]) => v);
  if (activeSelections.length === 0) return 'default';
  
  return activeSelections
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
}

/**
 * Parse variant_images from database (handles both string and object)
 */
export function parseVariantImages(data: unknown): VariantImages {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (typeof data === 'object') {
    return data as VariantImages;
  }
  return {};
}
