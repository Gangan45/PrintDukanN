GRANT USAGE ON SCHEMA public TO anon, authenticated;

REVOKE SELECT, UPDATE, DELETE ON TABLE public.abandoned_checkouts FROM anon;
GRANT INSERT ON TABLE public.abandoned_checkouts TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.abandoned_checkouts TO authenticated;