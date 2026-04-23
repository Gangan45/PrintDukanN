-- Cart offers settings (single row config)
CREATE TABLE IF NOT EXISTS public.cart_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT true,
  headline text NOT NULL DEFAULT 'Special Cart Offers !',
  subtitle text NOT NULL DEFAULT 'The product you''ve added to your cart is eligible for our exclusive offer.',
  eligible_categories jsonb NOT NULL DEFAULT '["acrylic","wall-clock","framed-acrylic","baby-frame"]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_offer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  badge_text text,
  image_url text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  cta_text text NOT NULL DEFAULT 'Customize Now',
  link text NOT NULL DEFAULT '/',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_offer_items ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Anyone can read cart offers"
  ON public.cart_offers FOR SELECT USING (true);
CREATE POLICY "Anyone can read cart offer items"
  ON public.cart_offer_items FOR SELECT USING (true);

-- Admins can manage
CREATE POLICY "Admins can insert cart offers"
  ON public.cart_offers FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cart offers"
  ON public.cart_offers FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cart offers"
  ON public.cart_offers FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cart offer items"
  ON public.cart_offer_items FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cart offer items"
  ON public.cart_offer_items FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cart offer items"
  ON public.cart_offer_items FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at triggers
CREATE TRIGGER cart_offers_updated_at
  BEFORE UPDATE ON public.cart_offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER cart_offer_items_updated_at
  BEFORE UPDATE ON public.cart_offer_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed default config + 3 sample items
INSERT INTO public.cart_offers (is_enabled, headline, subtitle, eligible_categories)
VALUES (
  true,
  'Special Cart Offers !',
  'The product you''ve added to your cart is eligible for our exclusive offer.',
  '["acrylic","wall-clock","framed-acrylic","baby-frame","wall-photo"]'::jsonb
);

INSERT INTO public.cart_offer_items (title, subtitle, badge_text, image_url, price, cta_text, link, display_order, is_active) VALUES
  ('Personalised Keychain', 'Complimentary Gift For You!', 'Gift', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80', 0, 'Customize Now', '/category/acrylic-magnet', 1, true),
  ('Acrylic Photo 8x6', 'Premium HD Print', '@ just ₹99', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', 99, 'Customize Now', '/framed-acrylic/customize', 2, true),
  ('Fridge Magnets', 'Super Sale', '@ just ₹99', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', 99, 'Customize Now', '/fridge-magnet/customize', 3, true);