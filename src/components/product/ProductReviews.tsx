import { useState } from "react";
import { Star, ThumbsUp, Camera, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import reviewPhoto1 from "@/assets/review-photo-1.jpg";
import reviewPhoto2 from "@/assets/review-photo-2.jpg";

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  photos?: string[];
}

const initialReviews: Review[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    date: "2 days ago",
    title: "Excellent quality for our restaurant!",
    content: "We ordered 25 pieces for our restaurant chain. The print quality is amazing and the acrylic is thick and sturdy. Customers love scanning the QR for our menu. Highly recommend for any food business!",
    helpful: 24,
    verified: true,
    photos: [reviewPhoto1],
  },
  {
    id: 2,
    name: "Priya Patel",
    rating: 5,
    date: "1 week ago",
    title: "Perfect for corporate gifting",
    content: "Gifted these to our clients with their company logos. The customization came out perfect and delivery was super fast. Will definitely order again for our next corporate event.",
    helpful: 18,
    verified: true,
    photos: [reviewPhoto2],
  },
  {
    id: 3,
    name: "Amit Kumar",
    rating: 4,
    date: "2 weeks ago",
    title: "Good product, fast delivery",
    content: "Quality is good, exactly as shown in pictures. Received within 5 days. One piece had a small scratch but customer service replaced it immediately. Good experience overall.",
    helpful: 12,
    verified: true,
  },
  {
    id: 4,
    name: "Sneha Gupta",
    rating: 5,
    date: "3 weeks ago",
    title: "Love the clear acrylic finish!",
    content: "The clarity of the acrylic is outstanding. Our cafe looks so professional now with these QR standees. Got so many compliments from customers!",
    helpful: 8,
    verified: true,
  },
];

const StarRating = ({ rating, size = "sm", interactive = false, onChange }: { 
  rating: number; 
  size?: "sm" | "lg"; 
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  const starSize = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={cn("transition-transform", interactive && "hover:scale-110 cursor-pointer")}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star
            className={cn(
              starSize,
              (interactive ? (hovered || rating) >= star : rating >= star)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            )}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleHelpful = () => {
    if (!voted) {
      setHelpful(helpful + 1);
      setVoted(true);
    }
  };

  return (
    <div className="border border-border rounded-lg p-5 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{review.name}</span>
              {review.verified && (
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                  Verified Buyer
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{review.date}</span>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{review.content}</p>
      </div>

      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2">
          {review.photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhoto(photo)}
              className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
            >
              <img src={photo} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleHelpful}
          disabled={voted}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            voted ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ThumbsUp className="w-4 h-4" />
          Helpful ({helpful})
        </button>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button className="absolute top-4 right-4 text-background">
            <X className="w-8 h-8" />
          </button>
          <img src={selectedPhoto} alt="Review" className="max-w-full max-h-[80vh] rounded-lg" />
        </div>
      )}
    </div>
  );
};

const WriteReviewForm = ({ onSubmit }: { onSubmit: (review: Omit<Review, 'id' | 'helpful' | 'verified' | 'date'>) => void }) => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !name.trim() || !title.trim() || !content.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Rating, name, title and review are required.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({ name: name.trim(), rating, title: title.trim(), content: content.trim() });
    setRating(0);
    setName("");
    setTitle("");
    setContent("");
    setOpen(false);
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback. Your review will appear shortly.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="w-4 h-4" />
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input 
              placeholder="Enter your name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Review Title</label>
            <Input 
              placeholder="Summarize your experience" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Review</label>
            <Textarea 
              placeholder="Tell others about your experience..." 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
          
          <Button type="submit" className="w-full">Submit Review</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProductReviews = () => {
  const [reviews, setReviews] = useState(initialReviews);
  const [showAll, setShowAll] = useState(false);

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: (reviews.filter(r => r.rating === star).length / reviews.length) * 100,
  }));

  const handleNewReview = (review: Omit<Review, 'id' | 'helpful' | 'verified' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now(),
      helpful: 0,
      verified: false,
      date: "Just now",
    };
    setReviews([newReview, ...reviews]);
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section className="mt-12 border-t border-border pt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
          <p className="text-muted-foreground">{reviews.length} reviews</p>
        </div>
        <WriteReviewForm onSubmit={handleNewReview} />
      </div>

      <div className="grid lg:grid-cols-4 gap-8 mb-8">
        {/* Rating Summary */}
        <div className="lg:col-span-1 bg-secondary/30 rounded-lg p-6 h-fit">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="text-sm text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
          </div>
          
          <div className="space-y-2">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-3">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3 space-y-4">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          
          {reviews.length > 3 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : `Show All ${reviews.length} Reviews`}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
