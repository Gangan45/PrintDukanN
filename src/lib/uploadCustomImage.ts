import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a custom image (base64 or file) to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadCustomImage(
  imageData: string | File,
  category: string = "custom"
): Promise<string | null> {
  try {
    let file: File;
    
    if (typeof imageData === 'string') {
      // Check if it's already a URL (not base64)
      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        return imageData; // Already a URL, return as-is
      }
      
      // Convert base64 to File
      if (imageData.startsWith('data:')) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const extension = blob.type.split('/')[1] || 'png';
        file = new File([blob], `custom-${Date.now()}.${extension}`, { type: blob.type });
      } else {
        console.error('Invalid image data format');
        return null;
      }
    } else {
      file = imageData;
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'png';
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `customize-images/${categorySlug}/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Error uploading custom image:', err);
    return null;
  }
}
