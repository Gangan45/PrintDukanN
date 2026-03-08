-- Add product_name, custom_text, and category columns to cart_items
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS custom_text text,
ADD COLUMN IF NOT EXISTS category text;

-- Add customization columns to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS selected_size text,
ADD COLUMN IF NOT EXISTS selected_frame text,
ADD COLUMN IF NOT EXISTS custom_image_url text,
ADD COLUMN IF NOT EXISTS custom_text text,
ADD COLUMN IF NOT EXISTS category text;