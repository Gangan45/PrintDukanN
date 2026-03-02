import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Youtube, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  video_id: string;
  thumbnail: string | null;
  duration: string | null;
  views: string | null;
  likes: string | null;
  display_order: number;
  is_active: boolean;
}

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: "", video_id: "", thumbnail: "", duration: "", views: "", likes: "", is_active: true
  });

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setVideos(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ title: "", video_id: "", thumbnail: "", duration: "", views: "", likes: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (v: Video) => {
    setEditing(v);
    setFormData({
      title: v.title, video_id: v.video_id, thumbnail: v.thumbnail || "",
      duration: v.duration || "", views: v.views || "", likes: v.likes || "", is_active: v.is_active
    });
    setDialogOpen(true);
  };

  const extractVideoId = (input: string) => {
    // Handle full YouTube URLs
    const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.video_id) {
      toast({ title: "Error", description: "Title and Video ID are required", variant: "destructive" });
      return;
    }
    const videoId = extractVideoId(formData.video_id);
    const thumbnail = formData.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    try {
      if (editing) {
        const { error } = await supabase.from('youtube_videos').update({
          title: formData.title, video_id: videoId, thumbnail,
          duration: formData.duration || null, views: formData.views || null,
          likes: formData.likes || null, is_active: formData.is_active,
        }).eq('id', editing.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Video updated" });
      } else {
        const maxOrder = Math.max(...videos.map(v => v.display_order), 0);
        const { error } = await supabase.from('youtube_videos').insert({
          title: formData.title, video_id: videoId, thumbnail,
          duration: formData.duration || null, views: formData.views || null,
          likes: formData.likes || null, is_active: formData.is_active, display_order: maxOrder + 1,
        });
        if (error) throw error;
        toast({ title: "Added", description: "Video added" });
      }
      setDialogOpen(false);
      fetchVideos();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('youtube_videos').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchVideos(); }
  };

  const handleToggle = async (v: Video) => {
    await supabase.from('youtube_videos').update({ is_active: !v.is_active }).eq('id', v.id);
    fetchVideos();
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">YouTube Videos</h1>
          <p className="text-muted-foreground">Manage homepage video section</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Video</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <Card key={v.id} className={`border-border/50 bg-card/50 backdrop-blur-sm group ${!v.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm line-clamp-1">{v.title}</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Switch checked={v.is_active} onCheckedChange={() => handleToggle(v)} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <img src={v.thumbnail || `https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg`} alt={v.title} className="w-full h-32 object-cover rounded-lg" />
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                {v.duration && <span>⏱ {v.duration}</span>}
                {v.views && <span>👁 {v.views}</span>}
                {v.likes && <span>👍 {v.likes}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Youtube className="h-12 w-12 mx-auto mb-4" />
          <p>No videos yet. Add your first YouTube video.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Video" : "Add Video"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Video title" />
            </div>
            <div className="space-y-2">
              <Label>YouTube Video ID or URL *</Label>
              <Input value={formData.video_id} onChange={(e) => setFormData({ ...formData, video_id: e.target.value })} placeholder="dQw4w9WgXcQ or full URL" />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL (auto-generated if empty)</Label>
              <Input value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Duration</Label>
                <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="12:45" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Views</Label>
                <Input value={formData.views} onChange={(e) => setFormData({ ...formData, views: e.target.value })} placeholder="125K" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Likes</Label>
                <Input value={formData.likes} onChange={(e) => setFormData({ ...formData, likes: e.target.value })} placeholder="4.2K" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
            </div>
            <Button onClick={handleSubmit} className="w-full">{editing ? "Update" : "Add"} Video</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVideos;
