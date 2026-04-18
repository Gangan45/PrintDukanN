-- Add shape and thickness_options columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shape text,
  ADD COLUMN IF NOT EXISTS thickness_options jsonb DEFAULT '[]'::jsonb;

-- Index on shape for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_shape ON public.products(shape);

-- Seed shape based on product name for existing Acrylic Wall Photo products
UPDATE public.products
SET shape = CASE
  WHEN lower(name) LIKE '%portrait%' THEN 'portrait'
  WHEN lower(name) LIKE '%landscape%' THEN 'landscape'
  WHEN lower(name) LIKE '%square%' THEN 'square'
  WHEN lower(name) LIKE '%circle%' OR lower(name) LIKE '%round%' THEN 'circle'
  WHEN lower(name) LIKE '%balloon%' THEN 'balloon'
  WHEN lower(name) LIKE '%bean%' THEN 'bean'
  WHEN lower(name) LIKE '%egg%' THEN 'egg'
  WHEN lower(name) LIKE '%squircle%' THEN 'squircle'
  WHEN lower(name) LIKE '%collage%' THEN 'collage'
  WHEN lower(name) LIKE '%dual%' OR lower(name) LIKE '%border%' THEN 'dual-border'
  ELSE 'portrait'
END
WHERE category = 'Acrylic Wall Photo' AND shape IS NULL;

-- Seed standard OMGS sizes (regular_price, sale_price) for all Acrylic Wall Photo products
UPDATE public.products
SET sizes = '[
  {"name":"8x6","regular_price":799,"sale_price":499},
  {"name":"12x8","regular_price":1199,"sale_price":799},
  {"name":"16x12","regular_price":1799,"sale_price":1199},
  {"name":"20x16","regular_price":2499,"sale_price":1699},
  {"name":"24x18","regular_price":2999,"sale_price":2099},
  {"name":"30x20","regular_price":3999,"sale_price":2799},
  {"name":"36x24","regular_price":4999,"sale_price":3499},
  {"name":"48x32","regular_price":7999,"sale_price":5599},
  {"name":"72x72","regular_price":14999,"sale_price":10499}
]'::jsonb
WHERE category = 'Acrylic Wall Photo';

-- Seed standard thickness options
UPDATE public.products
SET thickness_options = '[
  {"name":"3mm","price_add":0},
  {"name":"5mm","price_add":300},
  {"name":"8mm","price_add":700}
]'::jsonb
WHERE category = 'Acrylic Wall Photo';