-- Add variant_images column to products table for variant-specific image mapping
-- Structure: { "variant_key": ["image_url1", "image_url2"], ... }
-- Example: { "default": ["url1"], "size:Large": ["url2"], "color:Red": ["url3"], "size:Large,color:Red": ["url4"] }

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variant_images jsonb DEFAULT '{}'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN public.products.variant_images IS 'Maps variant combinations to image arrays. Keys can be: "default", "size:value", "color:value", "frame:value", or combinations like "size:Large,color:Red"';