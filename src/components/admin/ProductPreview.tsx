import { useState } from "react";
import { Star, Heart, ShoppingCart, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductPreviewProps {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  sizes: Array<{ name: string; price: number }>;
  variants: Array<{ name: string; price?: number; hex?: string }>;
  isCustomizable: boolean;
}

const ProductPreview = ({
  name,
  description,
  category,
  basePrice,
  images,
  sizes,
  variants,
  isCustomizable
}: ProductPreviewProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.name || "");
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.name || "");

  const selectedSizeObj = sizes.find(s => s.name === selectedSize);
  const selectedVariantObj = variants.find(v => v.name === selectedVariant);
  
  const totalPrice = basePrice + (selectedSizeObj?.price || 0) + (selectedVariantObj?.price || 0);
  const originalPrice = Math.round(totalPrice * 1.4);
  const discount = Math.round(((originalPrice - totalPrice) / originalPrice) * 100);

  const hasColorVariants = variants.some(v => v.hex);

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-primary/10 px-4 py-2 text-center">
        <p className="text-xs text-primary font-medium">Product Preview - How customers will see it</p>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <p>No images</p>
                </div>
              )}
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 shadow-md"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                {discount}% OFF
              </Badge>

              {/* Wishlist */}
              <button className="absolute top-2 right-2 bg-background/80 rounded-full p-2 shadow-md">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      idx === selectedImageIndex ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Category & Title */}
            <div>
              <Badge variant="secondary" className="mb-2">{category}</Badge>
              <h1 className="text-xl font-bold text-foreground">{name || "Product Name"}</h1>
              
              {/* Ratings */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(128 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">₹{totalPrice.toLocaleString()}</span>
              <span className="text-lg text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
              <Badge variant="outline" className="text-emerald-600 border-emerald-600">Save {discount}%</Badge>
            </div>

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Size:</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        selectedSize === size.name
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {size.name}
                      {size.price > 0 && <span className="text-xs ml-1">(+₹{size.price})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  {hasColorVariants ? "Color:" : "Option:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {hasColorVariants ? (
                    variants.map(variant => (
                      <button
                        key={variant.name}
                        onClick={() => setSelectedVariant(variant.name)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedVariant === variant.name
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border"
                        }`}
                        style={{ backgroundColor: variant.hex }}
                        title={variant.name}
                      />
                    ))
                  ) : (
                    variants.map(variant => (
                      <button
                        key={variant.name}
                        onClick={() => setSelectedVariant(variant.name)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                          selectedVariant === variant.name
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Customizable Badge */}
            {isCustomizable && (
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <p className="text-sm text-primary font-medium">✨ Upload your own photo for customization</p>
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
              <Button variant="secondary" className="flex-1">
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-5 h-5 text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="w-5 h-5 text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-5 h-5 text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
