
-- Drop existing restrictive policies and create open policies for admin-managed tables

-- HERO_BANNERS
DROP POLICY IF EXISTS "Admins can manage banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Banners viewable by everyone" ON public.hero_banners;
CREATE POLICY "Anyone can read banners" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Anyone can insert banners" ON public.hero_banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update banners" ON public.hero_banners FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete banners" ON public.hero_banners FOR DELETE USING (true);

-- PRODUCTS
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- CATEGORIES
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE USING (true);

-- REELS
DROP POLICY IF EXISTS "Admins can manage reels" ON public.reels;
DROP POLICY IF EXISTS "Reels are viewable by everyone" ON public.reels;
CREATE POLICY "Anyone can read reels" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reels" ON public.reels FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reels" ON public.reels FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete reels" ON public.reels FOR DELETE USING (true);

-- YOUTUBE_VIDEOS
DROP POLICY IF EXISTS "Admins can manage videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "Videos viewable by everyone" ON public.youtube_videos;
CREATE POLICY "Anyone can read videos" ON public.youtube_videos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert videos" ON public.youtube_videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update videos" ON public.youtube_videos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete videos" ON public.youtube_videos FOR DELETE USING (true);

-- COUPONS
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can view all coupons" ON public.coupons;
DROP POLICY IF EXISTS "Active coupons are viewable by everyone" ON public.coupons;
CREATE POLICY "Anyone can read coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Anyone can insert coupons" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update coupons" ON public.coupons FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete coupons" ON public.coupons FOR DELETE USING (true);

-- REVIEWS (admin delete)
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Anyone can delete reviews" ON public.reviews FOR DELETE USING (true);

-- ORDERS
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Anyone can read all orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- ORDER_ITEMS
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Anyone can read all order items" ON public.order_items FOR SELECT USING (true);

-- ADMIN_SETTINGS
DROP POLICY IF EXISTS "Admins can manage admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Anyone can read admin settings" ON public.admin_settings;
CREATE POLICY "Anyone can read settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert settings" ON public.admin_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON public.admin_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete settings" ON public.admin_settings FOR DELETE USING (true);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- USER_ROLES
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Anyone can read roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Anyone can manage roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);

-- PROFILES (admin view)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Anyone can read all profiles" ON public.profiles FOR SELECT USING (true);

-- Storage: allow public upload/delete on product-images bucket
CREATE POLICY "Anyone can upload to product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Anyone can update product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Anyone can delete from product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
