-- Allow admins to view all categories (including inactive)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete reviews
CREATE POLICY "Admins can delete reviews" 
ON public.reviews 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all profiles (for review management)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all products (including inactive)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));