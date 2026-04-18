-- Add photo_slots column to products for OMGS-style template+slots customizer
-- Each slot: { id, x, y, width, height, shape, rotation } where x/y/w/h are 0-1 normalized coordinates
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS photo_slots jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Optional dedicated template image (falls back to images[0] if null)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS design_template_url text;

-- Index for products that already have detected slots
CREATE INDEX IF NOT EXISTS idx_products_has_slots
  ON public.products ((jsonb_array_length(photo_slots) > 0));

COMMENT ON COLUMN public.products.photo_slots IS
  'OMGS-style template slots. Array of { id, x, y, width, height, shape (rect|circle|rounded), rotation } with normalized 0-1 coordinates relative to design template image.';
COMMENT ON COLUMN public.products.design_template_url IS
  'Optional dedicated decorated template image (with "Upload Your Photo" placeholders). Falls back to images[0].';