import { useState, useEffect } from "react";
import { Star, ThumbsUp, Camera, X, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  photos: string[];
  helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

interface ProductReviewsSectionProps {
  productId: string;
}

const StarRating = ({ 
  rating, 
  size = "md", 
  interactive = false, 
  onChange 
}: { 
  rating: number; 
  size?: "sm" | "md" | "lg"; 
  interactive?: boolean; 
  onChange?: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onChange?.(star)}
          className={cn("transition-colors", interactive && "cursor-pointer hover:scale-110")}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star ? "fill-gold text-gold" : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ 
  review, 
  onHelpful 
}: { 
  review: Review; 
  onHelpful: (id: string) => void;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const initials = review.user_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="p-4 bg-muted/50 rounded-xl space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          {review.user_avatar ? (
            <AvatarImage src={review.user_avatar} alt={review.user_name || 'User'} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{review.user_name || 'Anonymous'}</h4>
              {review.is_verified_purchase && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <StarRating rating={review.rating} size="sm" />
          
          {review.title && (
            <h5 className="font-medium text-foreground mt-2">{review.title}</h5>
          )}
          
          <p className="text-muted-foreground mt-1">{review.content}</p>
          
          {/* Review Photos */}
          {review.photos && review.photos.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {review.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setImagePreview(photo)}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                >
                  <img src={photo} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          
          <button
            onClick={() => onHelpful(review.id)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mt-3 transition-colors"
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful ({review.helpful_count})
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-2xl">
            <img src={imagePreview} alt="Review photo" className="w-full h-auto rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Write Review Form - Guest Mode (No Authentication Required)
const WriteReviewForm = ({ 
  productId, 
  onSubmit 
}: { 
  productId: string; 
  onSubmit: (review: Review) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
    
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls([...photoPreviewUrls, ...newUrls]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please write your review");
      return;
    }

    setSubmitting(true);
    
    try {
      // Upload photos to storage first
      const uploadedPhotoUrls: string[] = [];
      
      for (const photo of photos) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(fileName, photo);
        
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          continue;
        }
        
        const { data: publicUrl } = supabase.storage
          .from('review-photos')
          .getPublicUrl(fileName);
        
        uploadedPhotoUrls.push(publicUrl.publicUrl);
      }

      // Insert review into database
      const { data: insertedReview, error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: null,
          guest_name: name.trim(),
          rating,
          title: title.trim() || null,
          content: content.trim(),
          photos: uploadedPhotoUrls,
          is_verified_purchase: false
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const reviewData = insertedReview as any;
      const newReview: Review = {
        id: reviewData.id,
        product_id: reviewData.product_id,
        user_id: reviewData.user_id || 'guest',
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        photos: reviewData.photos || [],
        helpful_count: reviewData.helpful_count || 0,
        is_verified_purchase: reviewData.is_verified_purchase || false,
        created_at: reviewData.created_at,
        user_name: reviewData.guest_name || name.trim(),
        user_avatar: undefined
      };
      
      onSubmit(newReview);
      toast.success("Review submitted successfully!");
      
      setRating(0);
      setName("");
      setTitle("");
      setContent("");
      setPhotos([]);
      setPhotoPreviewUrls([]);
      setOpen(false);
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating *</label>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name *</label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Review Title (Optional)</label>
            <Input
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Review *</label>
            <Textarea
              placeholder="Share your experience with this product..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">{content.length}/1000</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Photos (Optional)</label>
            <p className="text-xs text-muted-foreground">Upload up to 5 photos</p>
            
            <div className="flex gap-2 flex-wrap">
              {photoPreviewUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {photos.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ProductReviewsSection = ({ productId }: ProductReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load user profiles for each review
      const reviewsWithUsers = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', review.user_id)
            .single();
          
          return {
            ...review,
            user_name: profile?.full_name || 'Anonymous',
            user_avatar: profile?.avatar_url
          };
        })
      );

      setReviews(reviewsWithUsers);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      await supabase
        .from('reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', reviewId);

      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      ));
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  const handleNewReview = (review: Review) => {
    setReviews([review, ...reviews]);
  };

  // Calculate rating stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 
      ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 
      : 0
  }));

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <div className="text-5xl font-bold text-foreground mb-2">{averageRating}</div>
          <StarRating rating={parseFloat(averageRating)} />
          <p className="text-muted-foreground mt-2">Based on {totalReviews} reviews</p>
        </div>
        
        {/* Rating Breakdown */}
        <div className="space-y-2">
          {ratingCounts.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-12">{rating} star</span>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <WriteReviewForm productId={productId} onSubmit={handleNewReview} />
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-semibold text-foreground">No reviews yet</h4>
          <p className="text-muted-foreground">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} onHelpful={handleHelpful} />
          ))}
          
          {reviews.length > 3 && (
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
