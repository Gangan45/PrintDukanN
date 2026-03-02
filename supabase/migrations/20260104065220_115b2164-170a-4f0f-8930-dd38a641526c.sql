-- Allow authenticated users to upload custom images to the customize-images folder in product-images bucket
CREATE POLICY "Authenticated users can upload custom images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'customize-images'
);

-- Allow authenticated users to update their uploaded custom images
CREATE POLICY "Authenticated users can update custom images"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'customize-images'
);