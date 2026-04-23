-- Abandoned checkouts table
CREATE TABLE public.abandoned_checkouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  converted_order_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- Anyone can create (guest checkouts)
CREATE POLICY "Anyone can create abandoned checkout"
ON public.abandoned_checkouts
FOR INSERT
WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view all abandoned checkouts"
ON public.abandoned_checkouts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update abandoned checkouts"
ON public.abandoned_checkouts
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete abandoned checkouts"
ON public.abandoned_checkouts
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_abandoned_checkouts_updated_at
BEFORE UPDATE ON public.abandoned_checkouts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for sorting
CREATE INDEX idx_abandoned_checkouts_created_at ON public.abandoned_checkouts(created_at DESC);
CREATE INDEX idx_abandoned_checkouts_status ON public.abandoned_checkouts(status);
CREATE INDEX idx_abandoned_checkouts_phone ON public.abandoned_checkouts(phone);