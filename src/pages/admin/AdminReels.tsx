import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Play, Image, Heart, MessageCircle, Upload, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Reel {
  id: string;
  title: string;
  product_name: string;
  price: number;
  image_url: string;
  video_url: string | null;
  category: string;
  product_link: string;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const categories = [
  { value: "acrylic", label: "Acrylic Frames" },
  { value: "tshirts", label: "T-Shirts" },
  { value: "trophies", label: "Trophies" },
  { value: "corporate-gifts", label: "Corporate Gifts" },
  { value: "name-plates", label: "Name Plates" },
  { value: "qr-standee", label: "QR Standee" },
  { value: "magnetic-badges", label: "Magnetic Badges" },
  { value: "wall-clocks", label: "Wall Clocks" },
  { value: "baby-frames", label: "Baby Frames" },
];

export default function AdminReels() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    product_name: "",
    price: 0,
    image_url: "",
    video_url: "",
    category: "",
    product_link: "",
    likes_count: 0,
    comments_count: 0,
    is_active: true,
    display_order: 0,
  });

  const uploadVideoToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reel-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('reel-videos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a valid video file");
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error("Video file must be less than 100MB");
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

  // Fetch reels
  const { data: reels = [], isLoading } = useQuery({
    queryKey: ["admin-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Reel[];
    },
  });

  // Create reel mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("reels").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      toast.success("Reel added successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add reel");
    },
  });

  // Update reel mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("reels")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      toast.success("Reel updated successfully");
      setIsOpen(false);
      setEditingReel(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update reel");
    },
  });

  // Delete reel mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      toast.success("Reel deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete reel");
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("reels")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      toast.success("Status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      product_name: "",
      price: 0,
      image_url: "",
      video_url: "",
      category: "",
      product_link: "",
      likes_count: 0,
      comments_count: 0,
      is_active: true,
      display_order: 0,
    });
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleEdit = (reel: Reel) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title,
      product_name: reel.product_name,
      price: reel.price,
      image_url: reel.image_url,
      video_url: reel.video_url || "",
      category: reel.category,
      product_link: reel.product_link,
      likes_count: reel.likes_count,
      comments_count: reel.comments_count,
      is_active: reel.is_active,
      display_order: reel.display_order,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let videoUrl = formData.video_url;

    // Upload video file if selected
    if (videoFile) {
      setIsUploadingVideo(true);
      try {
        videoUrl = await uploadVideoToStorage(videoFile);
        toast.success("Video uploaded successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to upload video");
        setIsUploadingVideo(false);
        return;
      }
      setIsUploadingVideo(false);
    }

    const dataToSubmit = { ...formData, video_url: videoUrl };

    if (editingReel) {
      updateMutation.mutate({ id: editingReel.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reels Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage trending reels for homepage showcase
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingReel(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Reel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReel ? "Edit Reel" : "Add New Reel"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Acrylic Photo Magic ✨"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="Wall Acrylic Frame"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              

              <div className="space-y-2">
                <Label>Video File*</Label>
                <div className="space-y-2">
                  {/* Show existing video URL if editing */}
                  {formData.video_url && !videoFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Play className="h-4 w-4 text-primary" />
                      <span className="text-sm truncate flex-1">Current video uploaded</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, video_url: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Show selected file */}
                  {videoFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Play className="h-4 w-4 text-primary" />
                      <span className="text-sm truncate flex-1">{videoFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeVideoFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* File input */}
                  <div className="flex gap-2">
                    <Input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {videoFile ? "Change Video" : "Upload Video"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Max file size: 100MB. Supported formats: MP4, WebM, MOV</p>
                </div>
              </div>

              

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="likes_count">Likes Count</Label>
                  <Input
                    id="likes_count"
                    type="number"
                    value={formData.likes_count}
                    onChange={(e) => setFormData({ ...formData, likes_count: Number(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending || isUploadingVideo}
                >
                  {isUploadingVideo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    editingReel ? "Update Reel" : "Add Reel"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Play className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Total Reels</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold">{reels.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Image className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Active</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {reels.filter(r => r.is_active).length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Heart className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Total Likes</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-red-500">
            {formatLikes(reels.reduce((sum, r) => sum + r.likes_count, 0))}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Total Comments</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-blue-500">
            {formatLikes(reels.reduce((sum, r) => sum + r.comments_count, 0))}
          </p>
        </div>
      </div>

      {/* Reels Table - Desktop */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No reels found. Add your first reel!
                </TableCell>
              </TableRow>
            ) : (
              reels.map((reel) => (
                <TableRow key={reel.id}>
                  <TableCell>
                    <div className="w-12 h-20 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={reel.image_url}
                        alt={reel.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{reel.title}</p>
                      <p className="text-xs text-muted-foreground">Order: {reel.display_order}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{reel.product_name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.value === reel.category)?.label || reel.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">₹{reel.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        {formatLikes(reel.likes_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                        {reel.comments_count}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={reel.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: reel.id, is_active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(reel)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(reel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reels Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : reels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reels found. Add your first reel!
          </div>
        ) : (
          reels.map((reel) => (
            <div key={reel.id} className="bg-card border rounded-lg p-4">
              <div className="flex gap-3">
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={reel.image_url}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{reel.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{reel.product_name}</p>
                    </div>
                    <Switch
                      checked={reel.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({ id: reel.id, is_active: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.value === reel.category)?.label || reel.category}
                    </Badge>
                    <span className="font-bold text-sm">₹{reel.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        {formatLikes(reel.likes_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                        {reel.comments_count}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(reel)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate(reel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}