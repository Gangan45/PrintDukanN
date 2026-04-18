-- Add tags column to products for OMGS-style filtering
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

-- Index for fast tag filtering
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);