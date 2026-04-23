
DELETE FROM public.hero_banners WHERE id = '80db3407-4c60-4966-876e-f2f8cfb91262';

INSERT INTO public.hero_banners (title, image_url, link, alt_text, display_order, is_active) VALUES
  ('Personalized Acrylic Frames - Up to 40% OFF', 'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/product-images/banners/hero-acrylic-sale.jpg', '/category/acrylic', 'Personalized Acrylic Photo Frames - Up to 40% OFF', 10, true),
  ('Custom Wall Clocks - Personalize Your Time', 'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/product-images/banners/hero-wall-clocks.jpg', '/category/wall-clocks', 'Custom Wall Clocks starting from ₹499', 11, true),
  ('Magnetic Badges for Professionals', 'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/product-images/banners/hero-magnetic-badges.jpg', '/category/magnetic-badge', 'Magnetic Name Badges for Professionals & Teams', 12, true),
  ('Custom T-Shirt Printing - Design Your Own', 'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/product-images/banners/hero-tshirts.jpg', '/category/t-shirts', 'Custom T-Shirt Printing starting at ₹299', 13, true),
  ('Trophies & Awards - Celebrate Excellence', 'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/product-images/banners/hero-trophies.jpg', '/category/trophies', 'Personalized Trophies & Awards with Fast Delivery', 14, true);
