import { useState, useEffect, useRef } from "react";
import { Edit, Trash2, GripVertical, Loader2, Video, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  is_active: boolean;
  products_count: number;
  created_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    slug: "", 
    description: "",
    image_url: "",
    video_url: "",
    is_active: true
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', cat.name);
          return { ...cat, products_count: count || 0 };
        })
      );
      
      setCategories(categoriesWithCounts);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const deleteVideoFromStorage = async (videoUrl: string): Promise<boolean> => {
    try {
      // Extract the file path from the public URL
      const urlParts = videoUrl.split('/reel-videos/');
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('reel-videos')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting previous video:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting video from storage:', error);
      return false;
    }
  };

  const uploadVideoToStorage = async (file: File, existingVideoUrl?: string | null): Promise<string | null> => {
    try {
      // Delete the previous video if it exists
      if (existingVideoUrl) {
        await deleteVideoFromStorage(existingVideoUrl);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reel-videos')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reel-videos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({ title: "Error", description: "Failed to upload video", variant: "destructive" });
      return null;
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({ title: "Error", description: "Please select a video file", variant: "destructive" });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "Error", description: "Video must be under 50MB", variant: "destructive" });
        return;
      }
      setVideoFile(file);
    }
  };

  const removeVideoFile = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast({ title: "Error", description: "Name and slug are required", variant: "destructive" });
      return;
    }

    try {
      setIsUploadingVideo(true);
      let videoUrl = formData.video_url;

      // Upload video if new file selected (will also delete previous video)
      if (videoFile) {
        const existingVideoUrl = editingCategory?.video_url || null;
        const uploadedUrl = await uploadVideoToStorage(videoFile, existingVideoUrl);
        if (uploadedUrl) {
          videoUrl = uploadedUrl;
        }
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            image_url: formData.image_url || null,
            video_url: videoUrl || null,
            is_active: formData.is_active
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ title: "Updated", description: "Category updated successfully" });
      } else {
        const maxOrder = Math.max(...categories.map(c => c.display_order), 0);
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            image_url: formData.image_url || null,
            video_url: videoUrl || null,
            is_active: formData.is_active,
            display_order: maxOrder + 1,
            show_in_header: true,
            show_in_homepage: true,
            route_path: `/category/${formData.slug}`
          });

        if (error) throw error;
        toast({ title: "Success", description: "Category added successfully" });
      }

      setFormData({ name: "", slug: "", description: "", image_url: "", video_url: "", is_active: true });
      setVideoFile(null);
      setEditingCategory(null);
      setIsAddDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      slug: category.slug, 
      description: category.description || "",
      image_url: category.image_url || "",
      video_url: category.video_url || "",
      is_active: category.is_active
    });
    setVideoFile(null);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Category removed successfully" });
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;
      fetchCategories();
    } catch (error: any) {
      console.error('Error toggling category:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Organize your product categories</p>
        </div>
        <Button onClick={() => {
          setEditingCategory(null);
          setFormData({ name: "", slug: "", description: "", image_url: "", video_url: "", is_active: true });
          setVideoFile(null);
          setIsAddDialogOpen(true);
        }}>
          + Add Category
        </Button>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            setFormData({ name: "", slug: "", description: "", image_url: "", video_url: "", is_active: true });
            setVideoFile(null);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name,
                      slug: formData.slug || generateSlug(name)
                    });
                  }}
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Video Upload Section */}
              <div className="space-y-2">
                <Label>Category Video</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {videoFile ? (
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <span className="text-sm truncate max-w-[180px]">{videoFile.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={removeVideoFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : formData.video_url ? (
                    <div className="space-y-2">
                      <video 
                        src={formData.video_url} 
                        className="w-full h-24 object-cover rounded-lg"
                        muted
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Current video</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => setFormData({ ...formData, video_url: "" })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center py-4 cursor-pointer"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload video</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, WebM up to 50MB</p>
                    </div>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                  {!videoFile && !formData.video_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Select Video
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={isUploadingVideo}>
                {isUploadingVideo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className={`border-border/50 bg-card/50 backdrop-blur-sm group ${!category.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.name}
                    {!category.is_active && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">/{category.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {category.video_url ? (
                <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-muted relative">
                  <video 
                    src={category.video_url} 
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                  <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                    <Video className="h-3 w-3 text-white" />
                  </div>
                </div>
              ) : category.image_url ? (
                <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-muted">
                  <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <p className="text-sm text-muted-foreground mb-3">{category.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{category.products_count} products</span>
                <Switch
                  checked={category.is_active}
                  onCheckedChange={() => handleToggleActive(category)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
