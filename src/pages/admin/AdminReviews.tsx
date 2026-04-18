import { useState, useEffect } from "react";
import { Search, Star, Trash2, Eye, Loader2, MessageSquare, ThumbsUp, Image as ImageIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  user_id: string | null;
  rating: number;
  title: string | null;
  content: string;
  photos: string[];
  helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
  status: string;
  guest_name: string | null;
  product_name?: string;
  user_name?: string;
  user_email?: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
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

      const enriched = await Promise.all(
        (data || []).map(async (review: any) => {
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', review.product_id)
            .maybeSingle();

          let user_name = review.guest_name || 'Anonymous';
          let user_email = 'guest';
          if (review.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', review.user_id)
              .maybeSingle();
            if (profile) {
              user_name = profile.full_name || user_name;
              user_email = profile.email || 'N/A';
            }
          }

          return {
            ...review,
            product_name: product?.name || 'Unknown Product',
            user_name,
            user_email,
          } as Review;
        })
      );

      setReviews(enriched);
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
    const matchesStatus = statusFilter === "all" || (review.status || 'pending') === statusFilter;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
      toast({ title: status === 'approved' ? "Approved" : "Rejected", description: `Review is now ${status}.` });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Review removed successfully" });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => (r.status || 'pending') === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    withPhotos: reviews.filter(r => r.photos && r.photos.length > 0).length,
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const s = status || 'pending';
    if (s === 'approved') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
    if (s === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
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
        <p className="text-muted-foreground">Approve or reject customer reviews. Only approved reviews show on the website.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.pending, color: "text-amber-500" },
          { label: "Approved", value: stats.approved, color: "text-emerald-500" },
          { label: "Rejected", value: stats.rejected, color: "text-red-500" },
          { label: "With Photos", value: stats.withPhotos, color: "text-blue-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5,4,3,2,1].map(n => <SelectItem key={n} value={String(n)}>{n} Star{n>1?'s':''}</SelectItem>)}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell><p className="font-medium text-foreground line-clamp-1">{review.product_name}</p></TableCell>
                    <TableCell>
                      <p className="font-medium">{review.user_name}</p>
                      <p className="text-xs text-muted-foreground">{review.user_email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{review.content}</p>
                      {review.photos && review.photos.length > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />{review.photos.length} photos
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge status={review.status} /></TableCell>
                    <TableCell>{format(new Date(review.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {review.status !== 'approved' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => updateStatus(review.id, 'approved')} title="Approve">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => updateStatus(review.id, 'rejected')} title="Reject">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedReview(review); setDetailsOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteReview(review.id)}>
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Review Details</DialogTitle></DialogHeader>
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
                      <Star key={i} className={`h-5 w-5 ${i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedReview.status} />
                </div>
              </div>
              {selectedReview.title && (<div><p className="text-sm font-semibold mb-1">Title</p><p>{selectedReview.title}</p></div>)}
              <div><p className="text-sm font-semibold mb-1">Review</p><p className="text-muted-foreground">{selectedReview.content}</p></div>
              {selectedReview.photos && selectedReview.photos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Photos</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedReview.photos.map((photo, idx) => (
                      <button key={idx} onClick={() => setImagePreview(photo)} className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                        <img src={photo} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-4 border-t">
                {selectedReview.status !== 'approved' && (
                  <Button onClick={() => { updateStatus(selectedReview.id, 'approved'); setDetailsOpen(false); }} className="bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4 mr-1" />Approve
                  </Button>
                )}
                {selectedReview.status !== 'rejected' && (
                  <Button variant="outline" onClick={() => { updateStatus(selectedReview.id, 'rejected'); setDetailsOpen(false); }}>
                    <X className="h-4 w-4 mr-1" />Reject
                  </Button>
                )}
                <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />{selectedReview.helpful_count} helpful
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
