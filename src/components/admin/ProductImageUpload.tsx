import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProductImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  category: string;
}

// Map category to folder name
const getCategoryFolder = (category: string): string => {
  const folderMap: Record<string, string> = {
    "Acrylic Wall Photo": "acrylic-wall-photo",
    "Acrylic Wall Clock": "acrylic-wall-clock",
    "Framed Acrylic Photo": "framed-acrylic-photo",
    "Baby Frames": "baby-frames",
    "Name Plates": "name-plates",
    "QR Standee": "qr-standee",
    "Trophies": "trophies",
    "Corporate Gifts": "corporate-gifts",
    "tshirts": "tshirts",
    "Trending": "trending"
  };
  return folderMap[category] || "general";
};

const ProductImageUpload = ({ images, onImagesChange, category }: ProductImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImageUrls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({ 
            title: "Invalid file", 
            description: `${file.name} is not an image`, 
            variant: "destructive" 
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({ 
            title: "File too large", 
            description: `${file.name} exceeds 5MB limit`, 
            variant: "destructive" 
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const folder = getCategoryFolder(category);
        const filePath = `${folder}/${fileName}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '31536000', // 1 year cache
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          toast({ 
            title: "Upload failed", 
            description: error.message, 
            variant: "destructive" 
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        newImageUrls.push(urlData.publicUrl);
      } catch (err) {
        console.error('Upload error:', err);
        toast({ 
          title: "Upload failed", 
          description: "An error occurred while uploading", 
          variant: "destructive" 
        });
      }
    }

    if (newImageUrls.length > 0) {
      onImagesChange([...images, ...newImageUrls]);
      toast({ 
        title: "Upload complete", 
        description: `${newImageUrls.length} image(s) uploaded successfully` 
      });
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 hover:border-primary/50
          ${uploading ? "border-primary bg-primary/5" : "border-border"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Click or drag images here to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Max 5MB per image • JPG, PNG, WEBP
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div 
              key={index} 
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              <img 
                src={url} 
                alt={`Product image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center justify-center py-4 border border-dashed border-border rounded-lg bg-muted/30">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No images uploaded yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
