import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Loader2, Image, GripVertical, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HeroBanner {
  id: string;
  title: string;
  image_url: string;
  link: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
}

const AdminHeroBanners = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", image_url: "", link: "/", alt_text: "", is_active: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hero_banners').select('*').order('display_order', { ascending: true });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setBanners(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ title: "", image_url: "", link: "/", alt_text: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (b: HeroBanner) => {
    setEditing(b);
    setFormData({ title: b.title, image_url: b.image_url, link: b.link, alt_text: b.alt_text, is_active: b.is_active });
    setDialogOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 10MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '31536000', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images').getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: "Uploaded", description: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast({ title: "Error", description: "Image is required", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        const { error } = await supabase.from('hero_banners').update({
          title: formData.title, image_url: formData.image_url, link: formData.link,
          alt_text: formData.alt_text, is_active: formData.is_active,
        }).eq('id', editing.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Banner updated successfully" });
      } else {
        const maxOrder = Math.max(...banners.map(b => b.display_order), 0);
        const { error } = await supabase.from('hero_banners').insert({
          title: formData.title, image_url: formData.image_url, link: formData.link,
          alt_text: formData.alt_text, is_active: formData.is_active, display_order: maxOrder + 1,
        });
        if (error) throw error;
        toast({ title: "Added", description: "Banner added successfully" });
      }
      setDialogOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('hero_banners').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted", description: "Banner removed" }); fetchBanners(); }
  };

  const handleToggle = async (b: HeroBanner) => {
    await supabase.from('hero_banners').update({ is_active: !b.is_active }).eq('id', b.id);
    fetchBanners();
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Hero Banners</h1>
          <p className="text-muted-foreground">Manage homepage hero slider images</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Banner</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <Card key={b.id} className={`border-border/50 bg-card/50 backdrop-blur-sm group ${!b.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">{b.title || "Untitled Banner"}</CardTitle>
                  <p className="text-xs text-muted-foreground">Link: {b.link}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Switch checked={b.is_active} onCheckedChange={() => handleToggle(b)} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {b.image_url ? (
                <img src={b.image_url} alt={b.alt_text} className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-4" />
          <p>No banners yet. Add your first hero banner.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Banner" : "Add Banner"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Banner title" />
            </div>

            <div className="space-y-2">
              <Label>Banner Image *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {formData.image_url ? (
                  <div className="space-y-3">
                    <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                        Change Image
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, image_url: "" })}>Remove</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {uploading ? (
                      <Loader2 className="h-10 w-10 text-primary mb-2 animate-spin" />
                    ) : (
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm font-medium text-foreground">Click to upload image</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP up to 10MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="/category/acrylic" />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input value={formData.alt_text} onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })} placeholder="Banner description" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={uploading}>{editing ? "Update" : "Add"} Banner</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHeroBanners;
