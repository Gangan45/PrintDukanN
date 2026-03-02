import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Get the customization URL based on category
const getCustomizeUrl = (category: string | undefined, productId: string, productName: string) => {
  const lowerCategory = category?.toLowerCase().trim() || '';
  const lowerName = productName?.toLowerCase() || '';
  console.log('Determining customize URL for category:', lowerCategory, 'and name:', lowerName);
  // Wall clocks - exact match first, then includes
  if (lowerCategory === "wall-clocks" || lowerCategory.includes("wall-clock") || 
      lowerName.includes("wall clock") || lowerName.includes("clock")) {
    return `/wall-clock/${productId}`;
  }

  // QR Standy/Standee - exact match
  if (lowerCategory === "qr standee" || lowerCategory.includes("qr standee") || 
      lowerName.includes("qr")) {
    return `/qr-standy/${productId}`;
  }

  // T-shirts - exact match
  if (lowerCategory === "tshirts" || lowerCategory === "t-shirts" || 
      lowerCategory.includes("tshirt") || lowerName.includes("t-shirt")) {
    return `/tshirt/${productId}`;
  }

  // Name plates - exact match
  if (lowerCategory === "name-plates" || lowerCategory.includes("nameplate") || 
      lowerName.includes("name plate")) {
    return `/nameplate/${productId}`;
  }

  // Magnetic badges / Wedding cards - exact match
  if (lowerCategory === "magnetic badges" || lowerCategory.includes("magnetic-badge") || 
      lowerCategory.includes("wedding") || lowerName.includes("magnetic badge")) {
    return `/wedding-card/${productId}`;
  }

  // Baby frames - exact match (case insensitive)
  if (lowerCategory === "baby frames" || lowerCategory.includes("baby-frame") || 
      lowerName.includes("baby frame")) {
    return `/baby-frame/${productId}`;
  }

  // Name Pencils
  if (lowerCategory === "name pencils" || lowerCategory.includes("name-pencil") || 
      lowerName.includes("name pencil")) {
    return `/name-pencil/${productId}`;
  }

  // Corporate gifts - exact match
  if (lowerCategory === "corporate gifts" || lowerCategory.includes("corporate-gift") || 
      lowerName.includes("corporate gift")) {
    return `/corporate-gift/customize/${productId}`;
  }

  // Acrylic products - check last as it's more generic
  if (lowerCategory === "acrylic" || lowerCategory.includes("acrylic")) {
    if (lowerName.includes("frame") || lowerName.includes("clear") || lowerName.includes("framed")) {
      return `/framed-acrylic/${productId}`;
    }
    return `/customize/${productId}`;
  }

  // Default customize route
  return `/customize/${productId}`;
};

// Get the detail URL for non-customizable products
const getDetailUrl = (category: string | undefined, productId: string) => {
  const lowerCategory = category?.toLowerCase() || '';
  
  if (lowerCategory === "corporate-gifts" || lowerCategory === "corporate gifts") {
    return `/corporate-gift/${productId}`;
  }
  if (lowerCategory === "trophies") {
    return `/product/${productId}`;
  }
  
  // Default product detail route
  return `/product/${productId}`;
};

// Get the appropriate URL based on customizability
const getProductUrl = (item: { id: string; name: string; category?: string; isCustomizable?: boolean }) => {
  console.log('Getting product URL for item:', item);
  const isCustomizable = item.isCustomizable !== false;
  
  if (isCustomizable) {
    return getCustomizeUrl(item.category, item.id, item.name);
  } else {
    return getDetailUrl(item.category, item.id);
  }
};

const Wishlist = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRemove = (item: { id: string; name: string; image: string; price: number; category?: string; isCustomizable?: boolean }) => {
    toggleFavorite({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      category: item.category,
      isCustomizable: item.isCustomizable
    });
  };

  const handleAddToCart = (item: { id: string; name: string; image: string; price: number; category?: string }) => {
    addToCart({
      productId: item.id,
      productName: item.name,
      productImage: item.image,
      quantity: 1,
      unitPrice: item.price,
      category: item.category || ""
    });
    toast({
      title: "Added to Cart",
      description: `${item.name} added to your cart`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Wishlist</span>
          </nav>

          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 fill-red-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Wishlist</h1>
              {favorites.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {favorites.length === 0 ? (
            <Card className="text-center py-10 sm:py-16 border-dashed">
              <CardContent className="space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                  <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-red-300" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    Start adding products you love by clicking the heart icon on any product!
                  </p>
                </div>
                <Button onClick={() => navigate('/')} className="mt-4">
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {favorites.map((item) => {
                const productUrl = getProductUrl(item);
                const isCustomizable = item.isCustomizable !== false;
                
                return (
                  <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <Link to={productUrl} className="block">
                      <div className="aspect-square relative bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Category badge */}
                        {item.category && (
                          <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                        {/* Remove button overlay */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(item);
                          }}
                          className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-sm transition-colors group/btn z-10"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 group-hover/btn:text-red-500 transition-colors" />
                        </button>
                      </div>
                      <CardContent className="p-2.5 sm:p-4">
                        <h3 className="font-semibold text-foreground line-clamp-2 text-xs sm:text-sm min-h-[2rem] sm:min-h-[2.5rem]">
                          {item.name}
                        </h3>
                        <p className="text-primary font-bold mt-1 text-sm sm:text-lg">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </CardContent>
                    </Link>
                    <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
                      {isCustomizable ? (
                        <Button 
                          size="sm" 
                          className="w-full text-[10px] sm:text-sm h-8 sm:h-10"
                          onClick={() => navigate(productUrl)}
                        >
                          Customise
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full text-[10px] sm:text-sm h-8 sm:h-10"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;