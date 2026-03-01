
-- Create admin_settings table for storing admin panel config
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin settings" ON public.admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage admin settings" ON public.admin_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default admin password
INSERT INTO public.admin_settings (key, value) VALUES ('admin_password', '123Asd@#');
