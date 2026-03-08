import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string | number;
  name: string;
  image: string;
  price: number;
  category?: string;
  isCustomizable?: boolean;
}

interface FavoriteItem {
  id: string;
  name: string;
  image: string;
  price: number;
  category?: string;
  isCustomizable?: boolean;
}

const FAVORITES_STORAGE_KEY = 'printdukan_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = (items: FavoriteItem[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (product: Product) => {
    setLoading(true);
    const productId = String(product.id);
    const isCurrentlyFavorite = favorites.some(f => f.id === productId);

    try {
      if (isCurrentlyFavorite) {
        const updatedFavorites = favorites.filter(f => f.id !== productId);
        setFavorites(updatedFavorites);
        saveFavorites(updatedFavorites);
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} removed from your wishlist`
        });
      } else {
        const newFavorite: FavoriteItem = {
          id: productId,
          name: product.name,
          image: product.image,
          price: product.price,
          category: product.category,
          isCustomizable: product.isCustomizable
        };
        const updatedFavorites = [...favorites, newFavorite];
        setFavorites(updatedFavorites);
        saveFavorites(updatedFavorites);
        toast({
          title: "Added to Wishlist",
          description: `${product.name} added to your wishlist`
        });
      }
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: string | number) => {
    return favorites.some(f => f.id === String(productId));
  };

  const getFavorites = () => favorites;

  return { favorites, toggleFavorite, isFavorite, getFavorites, loading };
};
