
-- Set initial admin password (admin123) and admin email
INSERT INTO public.admin_settings (key, value) 
VALUES ('admin_password', 'admin123'), ('admin_email', 'deshmukhgagan45@gmail.com'), ('admin_reset_token', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
