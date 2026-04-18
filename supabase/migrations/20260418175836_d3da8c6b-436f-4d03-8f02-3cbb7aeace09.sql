-- Enable required extensions for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Track when a delivered order's custom image was cleaned from storage
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS custom_image_deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_order_items_custom_image_cleanup
  ON public.order_items (custom_image_deleted_at)
  WHERE custom_image_url IS NOT NULL AND custom_image_deleted_at IS NULL;