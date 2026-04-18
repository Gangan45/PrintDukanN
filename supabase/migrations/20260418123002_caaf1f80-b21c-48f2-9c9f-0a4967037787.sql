-- Phase 1: Extend products table for OMGS-style per-product customization
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS photo_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS border_styles jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS frame_color_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS allowed_fonts jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS allow_custom_text boolean NOT NULL DEFAULT true;

-- Defaults seeding for Acrylic Wall Photo products (only where empty)
UPDATE public.products
SET 
  border_styles = COALESCE(NULLIF(border_styles, '[]'::jsonb), '[
    {"id":"none","name":"No Border"},
    {"id":"thin","name":"Thin Border"},
    {"id":"thick","name":"Thick Border"},
    {"id":"dual","name":"Dual Border"}
  ]'::jsonb),
  frame_color_options = COALESCE(NULLIF(frame_color_options, '[]'::jsonb), '[
    {"id":"black","name":"Black","value":"#0a0a0a"},
    {"id":"white","name":"White","value":"#ffffff"},
    {"id":"gold","name":"Gold","value":"#c9a961"},
    {"id":"silver","name":"Silver","value":"#c0c0c0"},
    {"id":"wood","name":"Wood","value":"#8b5a2b"}
  ]'::jsonb),
  allowed_fonts = COALESCE(NULLIF(allowed_fonts, '[]'::jsonb), '[
    {"id":"inter","name":"Inter","family":"Inter, sans-serif"},
    {"id":"playfair","name":"Playfair","family":"Playfair Display, serif"},
    {"id":"pacifico","name":"Pacifico","family":"Pacifico, cursive"},
    {"id":"lobster","name":"Lobster","family":"Lobster, cursive"},
    {"id":"roboto","name":"Roboto","family":"Roboto, sans-serif"},
    {"id":"dancing","name":"Dancing Script","family":"Dancing Script, cursive"}
  ]'::jsonb),
  photo_count = CASE 
    WHEN lower(name) LIKE '%collage%2%' OR lower(name) LIKE '%2 photo%' THEN 2
    WHEN lower(name) LIKE '%collage%3%' OR lower(name) LIKE '%3 photo%' THEN 3
    WHEN lower(name) LIKE '%collage%4%' OR lower(name) LIKE '%4 photo%' THEN 4
    WHEN lower(name) LIKE '%collage%' THEN 4
    ELSE 1
  END
WHERE category = 'Acrylic Wall Photo';