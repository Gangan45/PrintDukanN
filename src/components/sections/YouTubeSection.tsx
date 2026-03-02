import { Play, Youtube, ExternalLink, Eye, Clock, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  video_id: string;
  thumbnail: string | null;
  duration: string | null;
  views: string | null;
  likes: string | null;
}

const fallbackVideos = [
  { id: "1", title: "How to Customize Acrylic Photo Frames", video_id: "dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop", duration: "12:45", views: "125K", likes: "4.2K" },
  { id: "2", title: "Corporate Gift Ideas 2024", video_id: "dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=225&fit=crop", duration: "8:32", views: "89K", likes: "3.1K" },
  { id: "3", title: "T-Shirt Printing Process", video_id: "dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=225&fit=crop", duration: "15:20", views: "67K", likes: "2.8K" },
  { id: "4", title: "Night Lamp Customization Tutorial", video_id: "dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop", duration: "10:15", views: "156K", likes: "5.6K" },
];

export const YouTubeSection = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>(fallbackVideos);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from('youtube_videos')
        .select('id, title, video_id, thumbnail, duration, views, likes')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data && data.length > 0) setVideos(data);
    };
    fetchVideos();
  }, []);

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full mb-4">
              <Youtube className="w-4 h-4" />
              <span className="text-sm font-medium">Our YouTube Channel</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Watch Our Latest Videos</h2>
            <p className="mt-2 text-muted-foreground max-w-lg">Learn about our products, customization process, and get inspired.</p>
          </div>
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => window.open("https://www.youtube.com", "_blank")}>
            <Youtube className="w-5 h-5 mr-2" />Subscribe Now<ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="group bg-background rounded-2xl overflow-hidden shadow-card hover-lift cursor-pointer border border-border/50"
              onClick={() => handleVideoClick(video.video_id)}
              onMouseEnter={() => setHoveredId(video.id)} onMouseLeave={() => setHoveredId(null)}>
              <div className="relative aspect-video overflow-hidden">
                <img src={video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-foreground/30 flex items-center justify-center transition-opacity duration-300 ${hoveredId === video.id ? "opacity-100" : "opacity-0"}`}>
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>
                {video.duration && <div className="absolute bottom-2 right-2 bg-foreground/80 text-primary-foreground text-xs font-medium px-2 py-1 rounded">{video.duration}</div>}
                <div className="absolute top-2 left-2"><Youtube className="w-6 h-6 text-red-600" /></div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">{video.title}</h4>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {video.views && <div className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views} views</div>}
                  {video.likes && <div className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{video.likes}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center"><Youtube className="w-10 h-10 text-red-600" /></div>
              <div><h4 className="text-xl font-bold text-white">Our YouTube Channel</h4><p className="text-white/80 text-sm">Subscribe for latest updates & tutorials</p></div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center"><p className="text-3xl font-bold text-white">50K+</p><p className="text-sm text-white/70">Subscribers</p></div>
              <div className="text-center"><p className="text-3xl font-bold text-white">200+</p><p className="text-sm text-white/70">Videos</p></div>
              <div className="text-center"><p className="text-3xl font-bold text-white">5M+</p><p className="text-sm text-white/70">Views</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
