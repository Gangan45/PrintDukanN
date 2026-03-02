-- Allow guest orders by making user_id nullable and adding guest_email column
ALTER TABLE public.orders ADD COLUMN guest_email TEXT;
ALTER TABLE public.orders ADD COLUMN guest_name TEXT;
ALTER TABLE public.orders ADD COLUMN guest_phone TEXT;

-- Make user_id nullable for guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add policy for guest orders (orders without user_id)
CREATE POLICY "Allow insert for guest orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Update select policy for guest orders (allow viewing by order_number lookup)
CREATE POLICY "Allow guest to view their orders by email" 
ON public.orders 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));