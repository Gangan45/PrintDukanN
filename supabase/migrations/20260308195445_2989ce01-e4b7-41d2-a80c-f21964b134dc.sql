CREATE TABLE public.special_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL,
  code text,
  cta_text text NOT NULL DEFAULT 'Shop Now',
  link text NOT NULL DEFAULT '/',
  gradient_from text NOT NULL DEFAULT 'primary',
  gradient_to text NOT NULL DEFAULT 'coral-dark',
  icon_name text NOT NULL DEFAULT 'Percent',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read special offers" ON public.special_offers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert special offers" ON public.special_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update special offers" ON public.special_offers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete special offers" ON public.special_offers FOR DELETE USING (true);

INSERT INTO public.special_offers (title, subtitle, code, cta_text, link, gradient_from, gradient_to, icon_name, display_order) VALUES
('Flat 10% OFF', 'On Your First Order', 'FIRST10', 'Shop Now', '/category/acrylic-photos', 'primary', 'coral-dark', 'Percent', 1),
('Bulk Order Discount', '50+ Qty = Extra 15% OFF', 'BULK15', 'Get Quote', '/category/corporate-gifts', 'navy', 'navy-light', 'Gift', 2),
('Free Shipping', 'On Orders Above ₹999', NULL, 'Explore', '/category/acrylic-photos', 'coral', 'primary', 'Clock', 3);