import { useState, useEffect } from "react";
import { Search, Star, Trash2, Eye, Loader2, MessageSquare, ThumbsUp, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  product_name?: string;
  user_name?: string;
  user_email?: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with product and user info
      const enrichedReviews = await Promise.all(
        (data || []).map(async (review) => {
          // Get product name
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', review.product_id)
            .maybeSingle();

          // Get user info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', review.user_id)
            .maybeSingle();

          return {
            ...review,
            product_name: product?.name || 'Unknown Product',
            user_name: profile?.full_name || 'Anonymous',
            user_email: profile?.email || 'N/A'
          };
        })
      );

      setReviews(enrichedReviews);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const handleDeleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Review removed successfully" });
      fetchReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review);
    setDetailsOpen(true);
  };

  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0",
    fivestar: reviews.filter(r => r.rating === 5).length,
    onestar: reviews.filter(r => r.rating === 1).length,
    withPhotos: reviews.filter(r => r.photos && r.photos.length > 0).length,
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
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground">Manage customer product reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Reviews", value: stats.total, icon: MessageSquare, color: "text-foreground" },
          { label: "Avg Rating", value: stats.average, icon: Star, color: "text-gold" },
          { label: "5 Star", value: stats.fivestar, icon: Star, color: "text-emerald-500" },
          { label: "1 Star", value: stats.onestar, icon: Star, color: "text-red-500" },
          { label: "With Photos", value: stats.withPhotos, icon: ImageIcon, color: "text-blue-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <p className="font-medium text-foreground line-clamp-1">{review.product_name}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.user_name}</p>
                        <p className="text-xs text-muted-foreground">{review.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{review.content}</p>
                      {review.photos && review.photos.length > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {review.photos.length} photos
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(review.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewReviewDetails(review)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{selectedReview.product_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedReview.user_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedReview.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < selectedReview.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedReview.created_at), "dd MMM yyyy, hh:mm a")}</p>
                </div>
              </div>

              {selectedReview.title && (
                <div>
                  <p className="text-sm font-semibold mb-1">Title</p>
                  <p className="text-foreground">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold mb-1">Review</p>
                <p className="text-muted-foreground">{selectedReview.content}</p>
              </div>

              {selectedReview.photos && selectedReview.photos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Photos</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedReview.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImagePreview(photo)}
                        className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                      >
                        <img src={photo} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  {selectedReview.helpful_count} found helpful
                </div>
                {selectedReview.is_verified_purchase && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Verified Purchase
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
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

export default AdminReviews;
