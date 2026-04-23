GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.abandoned_checkouts TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.abandoned_checkouts TO authenticated;