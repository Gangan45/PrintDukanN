import { Heart, MessageCircle, Share2, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
}

// Fallback reels if no data from database
const fallbackReels: Reel[] = [
  {
    id: "1",
    title: "Acrylic Photo Magic ✨",
    product_name: "Wall Acrylic Frame",
    price: 1299,
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=600&fit=crop",
    video_url: null,
    category: "acrylic",
    product_link: "/category/acrylic",
    likes_count: 12500,
    comments_count: 234,
    is_active: true,
    display_order: 0,
  },
  {
    id: "2",
    title: "LED Name Plate Glow",
    product_name: "Custom LED Sign",
    price: 1899,
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600&fit=crop",
    video_url: null,
    category: "name-plates",
    product_link: "/category/name-plates",
    likes_count: 8200,
    comments_count: 156,
    is_active: true,
    display_order: 1,
  },
  {
    id: "3",
    title: "Corporate Gift Unboxing",
    product_name: "Premium Gift Set",
    price: 3999,
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=600&fit=crop",
    video_url: null,
    category: "corporate-gifts",
    product_link: "/category/corporate-gifts",
    likes_count: 15300,
    comments_count: 412,
    is_active: true,
    display_order: 2,
  },
  {
    id: "4",
    title: "T-Shirt Printing Process",
    product_name: "Custom Polo Tee",
    price: 499,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop",
    video_url: null,
    category: "tshirts",
    product_link: "/category/t-shirts",
    likes_count: 9700,
    comments_count: 289,
    is_active: true,
    display_order: 3,
  },
  {
    id: "5",
    title: "Trophy Engraving",
    product_name: "Crystal Award",
    price: 2499,
    image_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=600&fit=crop",
    video_url: null,
    category: "trophies",
    product_link: "/category/trophies",
    likes_count: 6100,
    comments_count: 98,
    is_active: true,
    display_order: 4,
  },
];

export const ReelShowcase = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mutedReels, setMutedReels] = useState<Set<string>>(new Set());
  const [likedReels, setLikedReels] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('likedReels');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ reelId, isLiked }: { reelId: string; isLiked: boolean }) => {
      const newCount = isLiked ? -1 : 1;
      const { error } = await supabase
        .from('reels')
        .update({ likes_count: supabase.rpc ? undefined : undefined })
        .eq('id', reelId);

      // Update likes_count in database
      const { data: currentReel } = await supabase
        .from('reels')
        .select('likes_count')
        .eq('id', reelId)
        .single();

      if (currentReel) {
        await supabase
          .from('reels')
          .update({ likes_count: Math.max(0, currentReel.likes_count + newCount) })
          .eq('id', reelId);
      }

      return { reelId, isLiked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-reels'] });
    }
  });

  const handleLike = (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    const isLiked = likedReels.has(reelId);
    const newLikedReels = new Set(likedReels);

    if (isLiked) {
      newLikedReels.delete(reelId);
      toast.success('Like removed');
    } else {
      newLikedReels.add(reelId);
      toast.success('Liked! ❤️');
    }

    setLikedReels(newLikedReels);
    localStorage.setItem('likedReels', JSON.stringify([...newLikedReels]));
    likeMutation.mutate({ reelId, isLiked });
  };

  const handleComment = (e: React.MouseEvent, reelTitle: string) => {
    e.stopPropagation();
    toast.info(`Comments for "${reelTitle}" coming soon!`);
  };

  const handleShare = async (e: React.MouseEvent, reel: Reel) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${reel.product_link}`;
    const shareData = {
      title: reel.title,
      text: `Check out ${reel.product_name} at ₹${reel.price}!`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    }
  };
  // Fetch reels from database
  const { data: dbReels = [] } = useQuery({
    queryKey: ["homepage-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching reels:", error);
        return [];
      }
      return data as Reel[];
    },
  });

  // Use database reels if available, otherwise fallback
  const reels = dbReels.length > 0 ? dbReels : fallbackReels;

  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || reels.length === 0) return;

    const interval = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const nextIndex = (activeIndex + 1) % reels.length;
      const itemWidth = container.scrollWidth / reels.length;
      container.scrollTo({ left: itemWidth * nextIndex, behavior: 'smooth' });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, reels.length]);

  // Track scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || reels.length === 0) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.scrollWidth / reels.length;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setActiveIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [reels.length]);

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Watch & Shop
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-foreground">
            Trending <span className="font-display italic text-primary">Reels</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Watch our products come to life and shop directly
          </p>
        </div>

        {/* Reels Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
        >
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="relative flex-shrink-0 w-[85vw] mx-auto sm:w-[260px] aspect-[9/16] rounded-3xl overflow-hidden snap-center group cursor-pointer"
              onMouseEnter={() => setHoveredId(reel.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => window.open("https://www.instagram.com/printdukan_official?igsh=YXpvdjBzcXA4Ymdk", "_blank")}
            >
              {/* Video or Fallback Image */}
              {reel.video_url ? (
                <video
                  ref={(el) => { videoRefs.current[reel.id] = el; }}
                  src={reel.video_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={!mutedReels.has(reel.id)}
                  playsInline
                  poster={reel.image_url}
                />
              ) : (
                <img
                  src={reel.image_url}
                  alt={reel.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent pointer-events-none" />

              {/* Mute/Unmute Button - Only for videos */}
              {reel.video_url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newMutedReels = new Set(mutedReels);
                    if (mutedReels.has(reel.id)) {
                      newMutedReels.delete(reel.id);
                    } else {
                      newMutedReels.add(reel.id);
                    }
                    setMutedReels(newMutedReels);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  {!mutedReels.has(reel.id) ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>
              )}

              {/* Side Actions */}
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4">
                <button
                  onClick={(e) => handleLike(e, reel.id)}
                  className="flex flex-col items-center gap-1 group/btn"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300",
                    likedReels.has(reel.id)
                      ? "bg-red-500"
                      : "bg-primary-foreground/20 hover:bg-primary-foreground/30"
                  )}>
                    <Heart className={cn(
                      "h-5 w-5 transition-all duration-300",
                      likedReels.has(reel.id)
                        ? "text-white fill-white scale-110"
                        : "text-primary-foreground"
                    )} />
                  </div>
                  <span className="text-xs text-primary-foreground font-medium">
                    {formatLikes(reel.likes_count + (likedReels.has(reel.id) ? 1 : 0))}
                  </span>
                </button>
                
                <button
                  onClick={(e) => handleShare(e, reel)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                    <Share2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                </button>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-semibold text-primary-foreground mb-1">{reel.title}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-primary-foreground/80">{reel.product_name}</p>
                    <p className="text-lg font-bold text-primary-foreground">₹{reel.price}</p>
                  </div>
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot Indicators - Mobile Only */}
        <div className="flex sm:hidden justify-center gap-2 mt-4">
          {reels.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                activeIndex === index
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30"
              )}
              onClick={() => {
                const container = scrollContainerRef.current;
                if (container) {
                  const itemWidth = container.scrollWidth / reels.length;
                  container.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
