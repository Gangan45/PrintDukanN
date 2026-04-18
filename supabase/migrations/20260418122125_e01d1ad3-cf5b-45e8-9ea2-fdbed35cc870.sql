-- 1) Add review approval workflow
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON public.reviews(product_id, status);

-- Replace public read policy: only approved reviews are visible publicly,
-- but admins and the author can see their own.
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Approved reviews are public"
ON public.reviews
FOR SELECT
USING (
  status = 'approved'
  OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2) Storage policies for review-photos bucket (public bucket already exists)
DROP POLICY IF EXISTS "Anyone can view review photos" ON storage.objects;
CREATE POLICY "Anyone can view review photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Anyone can upload review photos" ON storage.objects;
CREATE POLICY "Anyone can upload review photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Admins can delete review photos" ON storage.objects;
CREATE POLICY "Admins can delete review photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- 3) Backfill shape on Acrylic products from product name keywords (auto-detect)
UPDATE public.products
SET shape = CASE
  WHEN lower(name) LIKE '%dual%border%' OR lower(name) LIKE '%dual-border%' THEN 'dual-border'
  WHEN lower(name) LIKE '%collage%' THEN 'collage'
  WHEN lower(name) LIKE '%bean%' THEN 'bean'
  WHEN lower(name) LIKE '%balloon%' THEN 'balloon'
  WHEN lower(name) LIKE '%egg%' THEN 'egg'
  WHEN lower(name) LIKE '%squircle%' THEN 'squircle'
  WHEN lower(name) LIKE '%circle%' OR lower(name) LIKE '%round%' THEN 'circle'
  WHEN lower(name) LIKE '%square%' THEN 'square'
  WHEN lower(name) LIKE '%landscape%' THEN 'landscape'
  ELSE 'portrait'
END
WHERE category ILIKE '%acrylic%' AND (shape IS NULL OR shape = '');