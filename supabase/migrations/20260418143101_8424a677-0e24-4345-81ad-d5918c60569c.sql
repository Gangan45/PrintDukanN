ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS design_layers jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.design_layers IS 'Re-editable design layers state (text, image, photo-slot) for the customizable design editor.';