-- Insert admin roles for existing users
-- These are the user IDs that need admin access
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('1f5d7f9b-fd94-4e6e-9aeb-59a1d6810075', 'admin'),
  ('95d7d53e-9028-4f9b-9714-70f1c2cc1f9d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;