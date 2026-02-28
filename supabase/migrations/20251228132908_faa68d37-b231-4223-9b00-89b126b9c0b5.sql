-- Create storage bucket for reel videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('reel-videos', 'reel-videos', true);

-- Create storage policies for reel videos
CREATE POLICY "Anyone can view reel videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'reel-videos');

CREATE POLICY "Admins can upload reel videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reel-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reel videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'reel-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reel videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'reel-videos' AND has_role(auth.uid(), 'admin'::app_role));