-- Drop existing INSERT policy and recreate to explicitly allow anon + authenticated guests
DROP POLICY IF EXISTS "Anyone can create abandoned checkout" ON public.abandoned_checkouts;

CREATE POLICY "Public can create abandoned checkouts"
ON public.abandoned_checkouts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also allow public UPDATE so the same anonymous user can update their record (e.g., mark as converted after order placed)
DROP POLICY IF EXISTS "Public can update own abandoned checkout" ON public.abandoned_checkouts;

CREATE POLICY "Public can update abandoned checkouts"
ON public.abandoned_checkouts
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);