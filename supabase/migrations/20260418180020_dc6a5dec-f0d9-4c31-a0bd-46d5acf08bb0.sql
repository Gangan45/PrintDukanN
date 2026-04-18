-- Unschedule any prior version of this job (safe if it doesn't exist)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-delivered-custom-images-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Run every day at 02:30 UTC
SELECT cron.schedule(
  'cleanup-delivered-custom-images-daily',
  '30 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rqnknqgpqttjqqhaejmt.supabase.co/functions/v1/cleanup-delivered-custom-images',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbmtucWdwcXR0anFxaGFlam10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDU1MjgsImV4cCI6MjA4MDE4MTUyOH0.7CqCyiGUFb1sHN5wwE8rtULbTKNA0Dfj6X_do5VDy1w"}'::jsonb,
    body := jsonb_build_object('triggered_at', now())
  ) AS request_id;
  $$
);