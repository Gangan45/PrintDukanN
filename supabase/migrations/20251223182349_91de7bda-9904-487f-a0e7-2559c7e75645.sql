-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  products_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Acrylic Wall Photo', 'acrylic-wall-photo', 'Premium acrylic wall photos', 1),
  ('Clear Acrylic Photo', 'clear-acrylic-photo', 'Crystal clear acrylic photos', 2),
  ('Acrylic Wall Clock', 'acrylic-wall-clock', 'Custom acrylic wall clocks', 3),
  ('Framed Acrylic Photo', 'framed-acrylic-photo', 'Framed acrylic photos', 4),
  ('Acrylic Night Lamp', 'acrylic-night-lamp', 'LED night lamps', 5),
  ('Acrylic Table Stand', 'acrylic-table-stand', 'Table stand photos', 6),
  ('Name Plates', 'name-plates', 'Home and office name plates', 7),
  ('QR Standee', 'qr-standee', 'Digital QR code stands', 8),
  ('Trophies', 'trophies', 'Awards and trophies', 9),
  ('Corporate Gifts', 'corporate-gifts', 'Business gifting solutions', 10),
  ('T-Shirts', 'tshirts', 'Custom printed t-shirts', 11),
  ('Trending', 'trending', 'Hot and trending products', 12);