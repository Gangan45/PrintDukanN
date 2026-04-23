REVOKE SELECT, UPDATE ON TABLE public.abandoned_checkouts FROM anon, authenticated;
GRANT INSERT ON TABLE public.abandoned_checkouts TO anon, authenticated;

DROP POLICY IF EXISTS "Public can update abandoned checkouts" ON public.abandoned_checkouts;