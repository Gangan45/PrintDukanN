import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronRight, ShoppingCart, Zap, Play, MessageCircle, Share2, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import acrylicWall from "@/assets/1-Landscape-Acrylic-Wall-Photo-1.webp";
import acrylicCollege from "@/assets/collage-1-min-1.webp";


interface Product {
  id: string;
  name: string;
  base_price: number;
  images: string[] | null;
  category: string;
  is_customizable: boolean | null;
}
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
}

// Acrylic subcategories with showcase data
const acrylicShowcases = [
  {
    id: "wall-photo",
    title: "Premium Acrylic Wall Photo",
    subtitle: "Transform Your Walls",
    description: "Experience the brilliance and vibrancy of our acrylic prints, expertly crafted to bring your images to life. Create a captivating visual display that truly reflects your style.",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766938943981-d5vchq.mp4",
    isVideo: true, // Mark this as video
    bgColor: "from-slate-900 to-slate-800",
  },
  {
    id: "wall-clocks",
    title: "Acrylic Wall Clock",
    subtitle: "Timeless Elegance",
    description: "Experience timeless elegance with personalized photo wall clocks, where your memories transform a simple timepiece into a captivating decor statement.",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/categories/category-1770128202669-xtfa337eah.mp4",
    isVideo: true, // Mark this as video
    bgColor: "from-emerald-900/80 to-teal-900/60",
  },
  {
    id: "framed-photo",
    title: "Framed Acrylic Photo",
    subtitle: "Classic Sophistication",
    description: "Personalize your décor with framed acrylic photos, expertly crafted to highlight your favorite memories with elegance and clarity.",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/categories/WhatsApp%20Video%202026-02-09%20at%2013.59.00.mp4",
    isVideo: true, // Mark this as video
    bgColor: "from-purple-900/80 to-indigo-900/60",
  },
  {
    id: "baby-frames",
    title: "Baby Photo Frames",
    subtitle: "Precious Moments",
    description: "Capture and cherish your little one's precious moments with our specially designed baby photo frames, perfect for nurseries and gifts.",
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/categories/WhatsApp%20Video%202026-02-09%20at%2013.58.59.mp4",
    isVideo: true, // Mark this as video
    bgColor: "from-pink-900/80 to-rose-900/60",
  },
];

// Acrylic-specific reels data
const acrylicReels = [
  {
    id: 1,
    title: "Wall Acrylic Magic ✨",
    product: "Premium Wall Acrylic",
    price: 1299,
    image: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/categories/WhatsApp%20Video%202026-02-09%20at%2013.59.00.mp4",
    likes: "12.5K",
    comments: "234",
    link: "/category/acrylic/wall-photo",
  },
  {
    id: 2,
    title: "Framed Acrylic Style",
    product: "Framed Acrylic Photo",
    price: 1599,
    image: "https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=400&h=600&fit=crop",
    likes: "9.8K",
    comments: "187",
    link: "/category/acrylic/framed-photo",
  },
  {
    id: 3,
    title: "Acrylic Clock Design",
    product: "Custom Wall Clock",
    price: 1899,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=600&fit=crop",
    likes: "7.2K",
    comments: "156",
    link: "/category/wall-clocks",
  },
  {
    id: 4,
    title: "Baby Frame Memories 👶",
    product: "Baby Birth Frame",
    price: 999,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=600&fit=crop",
    likes: "15.3K",
    comments: "412",
    link: "/category/baby-frames",
  },
  {
    id: 5,
    title: "Collage Photo Art",
    product: "Acrylic Collage",
    price: 2499,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    likes: "6.1K",
    comments: "98",
    link: "/category/acrylic",
  },
];

const AcrylicCategory = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredReelId, setHoveredReelId] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { buyNow } = useBuyNow();
  const [dbReels, setDbReels] = useState<Reel[]>([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [babyDbReels, setBabyDbReels] = useState<Reel[]>([]);
  const [mutedReels, setMutedReels] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [likedReels, setLikedReels] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('likedReels');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Handle Like Function
  const handleLike = async (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    const isLiked = likedReels.has(reelId);
    const newLikedReels = new Set(likedReels);

    if (isLiked) {
      newLikedReels.delete(reelId);
      toast({ title: "Removed from favorites" });
    } else {
      newLikedReels.add(reelId);
      toast({ title: "Liked! ❤️" });
    }

    setLikedReels(newLikedReels);
    localStorage.setItem('likedReels', JSON.stringify([...newLikedReels]));

    // Database update logic (Optional: Only if you want to update global count)
    const { data: currentReel } = await supabase
      .from('reels')
      .select('likes_count')
      .eq('id', reelId)
      .single();

    if (currentReel) {
      await supabase
        .from('reels')
        .update({ likes_count: Math.max(0, currentReel.likes_count + (isLiked ? -1 : 1)) })
        .eq('id', reelId);
    }
  };

  // Handle Comment Function
  const handleComment = (e: React.MouseEvent, reelTitle: string) => {
    e.stopPropagation();
    toast({ title: `Comments for "${reelTitle}" coming soon!` });
  };

  // Handle Share Function
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
        toast({ title: "Shared successfully!" });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied to clipboard!" });
      }
    }
  };

  useEffect(() => {
    const fetchAcrylicReels = async () => {
      try {
        const { data, error } = await supabase
          .from("reels")
          .select("*")
          .eq("category", "acrylic") // Yaha category filter lagaya
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        if (data) setDbReels(data);
      } catch (err) {
        console.error("Error loading acrylic reels:", err);
      } finally {
        setReelsLoading(false);
      }
    };

    fetchAcrylicReels();
  }, []);

  // Agar database me data nahi hai to fallback data use karein
  const displayReels = dbReels.length > 0 ? dbReels : acrylicReels;

  // Formatting function for likes
  const formatLikes = (count: any) => {
    if (typeof count === 'string') return count;
    return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();
  };

  // useEffect(() => {
  //   loadProducts();
  // }, []);

  // const loadProducts = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('products')
  //       .select('id, name, base_price, images, category, is_customizable')
  //       .eq('category', 'xyz')
  //       .eq('is_active', true);

  //     if (error) throw error;
  //     setProducts(data || []);
  //   } catch (error) {
  //     console.error('Error loading products:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleAddToCart = async (product: Product) => {
    await addToCart({
      productId: product.id,
      productName: product.name,
      unitPrice: product.base_price,
      quantity: 1,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleBuyNow = (product: Product) => {
    buyNow({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || '',
      price: product.base_price,
    });
  };

  const handleToggleFavorite = (product: Product) => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.base_price,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Acrylic Products</span>
        </div>
      </div>



      {/* Hero Showcases - Alternating Layout */}
      <section className="space-y-0">
        {acrylicShowcases.map((showcase, index) => (
          <div
            key={showcase.id}
            className={`relative min-h-[10vh] flex items-center bg-gradient-to-br ${showcase.bgColor}`}
          >
            <div className={`container mx-auto px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Image Side */}
              <div className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />

                  {showcase.isVideo ? (
                    <video
                      src={showcase.image}
                      className="relative w-full max-w-md mx-auto rounded-lg shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={showcase.image}
                      alt={showcase.title}
                      className="relative w-full max-w-lg mx-auto rounded-lg shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  )}

                  {/* Floating Label */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-background text-foreground px-6 py-2 rounded-full shadow-lg font-display text-lg">
                    {showcase.subtitle}
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className={`text-white space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  {showcase.title}
                </h2>
                <p className="text-lg text-white/80 leading-relaxed max-w-md">
                  {showcase.description}
                </p>

                <Link to={`/category/acrylic/${showcase.id}`}>
                  <Button size="lg" variant="secondary" className="group">
                    Shop now
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
      {/* Acrylic Reels Section */}
      <section className="py-12 sm:py-16 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Watch & Shop
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-foreground">
              Acrylic <span className="font-display italic text-primary">Reels</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              See our acrylic products in action
            </p>
          </div>

          {/* Reels Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
          >
            {displayReels.map((reel) => (
              <div
                key={reel.id}
                className="relative flex-shrink-0 w-[85vw] mx-auto sm:w-[220px] md:w-[260px] aspect-[9/16] rounded-3xl overflow-hidden snap-center group cursor-pointer"
                onMouseEnter={() => setHoveredReelId(reel.id as string)}
                onMouseLeave={() => setHoveredReelId(null)}
                onClick={() => navigate(reel.product_link || `/category/acrylic`)}
              >
                {/* Video or Image */}
                {reel.video_url ? (
                  <video
                    ref={(el) => { videoRefs.current[reel.id as string] = el; }}
                    src={reel.video_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={!mutedReels.has(reel.id as string)}
                    playsInline
                    poster={reel.image_url || (reel as any).image}
                  />
                ) : (
                  <img
                    src={reel.image_url || (reel as any).image}
                    alt={reel.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Mute/Unmute Button - Only for videos */}
                {reel.video_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const reelId = reel.id as string;
                      const newMutedReels = new Set(mutedReels);
                      if (mutedReels.has(reelId)) {
                        newMutedReels.delete(reelId);
                      } else {
                        newMutedReels.add(reelId);
                      }
                      setMutedReels(newMutedReels);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10"
                  >
                    {!mutedReels.has(reel.id as string) ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                )}

                {/* Side Actions */}
                <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={(e) => handleLike(e, reel.id as string)}
                    className="flex flex-col items-center gap-1 group/btn"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300",
                      likedReels.has(reel.id as string)
                        ? "bg-red-500"
                        : "bg-black/30 hover:bg-black/50"
                    )}>
                      <Heart className={cn(
                        "h-5 w-5 transition-all duration-300",
                        likedReels.has(reel.id as string)
                          ? "text-white fill-white scale-110"
                          : "text-white"
                      )} />
                    </div>
                    <span className="text-xs text-white font-medium">
                      {formatLikes((reel.likes_count || (reel as any).likes || 0) + (likedReels.has(reel.id as string) ? 1 : 0))}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={(e) => handleComment(e, reel.title)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={(e) => handleShare(e, reel as Reel)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Share2 className="h-5 w-5 text-white" />
                    </div>
                  </button>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold text-white mb-1 line-clamp-1">{reel.title}</p>
                  <div>
                    <p className="text-xs text-white/70 line-clamp-1">{reel.product_name || (reel as any).product}</p>
                    <p className="text-lg font-bold text-white">₹{reel.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators - Mobile Only */}
          <div className="flex sm:hidden justify-center gap-2 mt-4">
            {displayReels.slice(0, 5).map((_, index) => (
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
                    const itemWidth = container.scrollWidth / displayReels.length;
                    container.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AcrylicCategory;