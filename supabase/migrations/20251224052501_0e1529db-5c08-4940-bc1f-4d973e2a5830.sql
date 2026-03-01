-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can view active coupons (needed for validation)
CREATE POLICY "Active coupons are viewable by everyone" 
ON public.coupons 
FOR SELECT 
USING (is_active = true AND expires_at > now() AND used_count < max_uses);

-- Admins can view all coupons
CREATE POLICY "Admins can view all coupons" 
ON public.coupons 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add coupon columns to orders table for tracking
ALTER TABLE public.orders 
ADD COLUMN coupon_code TEXT,
ADD COLUMN coupon_discount NUMERIC DEFAULT 0;

-- Insert some initial coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_uses, expires_at) VALUES
('WELCOME10', 'percentage', 10, 500, 100, '2025-06-30 23:59:59+00'),
('FLAT200', 'fixed', 200, 1000, 50, '2025-06-30 23:59:59+00'),
('SUMMER15', 'percentage', 15, 800, 150, '2025-06-30 23:59:59+00');