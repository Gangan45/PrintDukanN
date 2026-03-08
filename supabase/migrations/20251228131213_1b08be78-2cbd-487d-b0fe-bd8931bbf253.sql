-- Create reels table for storing product reels
CREATE TABLE public.reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  video_url TEXT,
  category TEXT NOT NULL,
  product_link TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Reels are viewable by everyone" 
ON public.reels 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage reels" 
ON public.reels 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_reels_updated_at
BEFORE UPDATE ON public.reels
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();