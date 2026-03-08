-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  base_price NUMERIC NOT NULL DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  sizes JSONB DEFAULT '[]',
  frames JSONB DEFAULT '[]',
  is_customizable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_size TEXT,
  selected_frame TEXT,
  custom_image_url TEXT,
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Products are publicly viewable
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Cart policies
CREATE POLICY "Users can view their own cart"
ON public.cart_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart"
ON public.cart_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON public.cart_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
ON public.cart_items
FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample acrylic products
INSERT INTO public.products (name, description, category, base_price, images, sizes, frames, is_customizable) VALUES
('Wall Photo Frame', 'Beautiful acrylic wall photo frame with crystal clear finish', 'acrylic', 599, ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'], '[{"name": "6x8", "price": 0}, {"name": "8x10", "price": 100}, {"name": "12x15", "price": 250}, {"name": "16x20", "price": 400}]', '[{"name": "Classic", "price": 0}, {"name": "Premium", "price": 150}, {"name": "Luxury", "price": 300}]', true),
('Table Photo Stand', 'Elegant acrylic table photo stand for your desk', 'acrylic', 449, ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'], '[{"name": "4x6", "price": 0}, {"name": "5x7", "price": 50}, {"name": "6x8", "price": 100}]', '[{"name": "Standard", "price": 0}, {"name": "Frosted", "price": 100}]', true),
('LED Photo Frame', 'Stunning LED backlit acrylic photo frame', 'acrylic', 899, ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'], '[{"name": "8x10", "price": 0}, {"name": "12x15", "price": 200}, {"name": "16x20", "price": 400}]', '[{"name": "White LED", "price": 0}, {"name": "RGB LED", "price": 200}]', true),
('Rotating Photo Cube', 'Interactive rotating acrylic photo cube', 'acrylic', 749, ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400'], '[{"name": "Small", "price": 0}, {"name": "Medium", "price": 150}, {"name": "Large", "price": 300}]', '[{"name": "Clear", "price": 0}, {"name": "Tinted", "price": 100}]', true),
('Photo Keychain', 'Personalized acrylic photo keychain', 'acrylic', 149, ARRAY['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400'], '[{"name": "Standard", "price": 0}, {"name": "Large", "price": 30}]', '[{"name": "Clear", "price": 0}, {"name": "Glitter", "price": 20}]', true),
('Photo Magnet', 'Custom acrylic photo magnet for fridge', 'acrylic', 199, ARRAY['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'], '[{"name": "2x3", "price": 0}, {"name": "3x4", "price": 25}]', '[{"name": "Standard", "price": 0}]', true);