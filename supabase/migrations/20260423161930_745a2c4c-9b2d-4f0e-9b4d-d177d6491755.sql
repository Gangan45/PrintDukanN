ALTER TABLE public.cart_offer_items
  ADD COLUMN IF NOT EXISTS action_type text NOT NULL DEFAULT 'add_to_cart',
  ADD COLUMN IF NOT EXISTS original_price numeric,
  ADD COLUMN IF NOT EXISTS badge_color text NOT NULL DEFAULT 'red',
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS category_tag text;

-- Constrain action_type to known values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_offer_items_action_type_check'
  ) THEN
    ALTER TABLE public.cart_offer_items
      ADD CONSTRAINT cart_offer_items_action_type_check
      CHECK (action_type IN ('add_to_cart','redirect'));
  END IF;
END$$;

-- Constrain badge_color to known values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_offer_items_badge_color_check'
  ) THEN
    ALTER TABLE public.cart_offer_items
      ADD CONSTRAINT cart_offer_items_badge_color_check
      CHECK (badge_color IN ('red','green','orange','blue','purple'));
  END IF;
END$$;