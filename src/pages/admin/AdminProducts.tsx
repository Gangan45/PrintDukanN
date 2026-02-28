import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Upload, X, Package, Image as ImageIcon, Palette, Ruler, Images } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductImageUpload from "@/components/admin/ProductImageUpload";
import ProductPreview from "@/components/admin/ProductPreview";
import VariantImageUpload from "@/components/admin/VariantImageUpload";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  base_price: number;
  images: string[] | null;
  sizes: any;
  frames: any;
  variant_images: any;
  is_customizable: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

const fallbackCategories = [
  "Acrylic Wall Photo",
  "Acrylic Wall Clock",
  "Name Plates",
  "QR Standee",
  "Wedding Card",
  "Trophies",
  "Corporate Gifts",
  "T-Shirts",
  "Name Pencils",
];

const defaultSizes = [
  { name: "8x6 inch", price: 0 },
  { name: "10x8 inch", price: 200 },
  { name: "12x9 inch", price: 400 },
  { name: "16x12 inch", price: 800 },
  { name: "20x16 inch", price: 1200 }
];

const defaultFrames = [
  { name: "No Frame", price: 0 },
  { name: "Black Frame", price: 300 },
  { name: "White Frame", price: 300 },
  { name: "Golden Frame", price: 500 },
  { name: "LED Frame", price: 800 }
];

// Acrylic Wall Photo color options
const defaultAcrylicColors = [
  { name: "Clear", price: 0 },
  { name: "Black", price: 100 },
  { name: "White", price: 100 },
  { name: "Gold", price: 200 },
  { name: "Silver", price: 150 }
];

// Wall Clock specific options - Fixed sizes with prices (not additive)
const defaultClockSizes = [
  { name: "11x11 Inch", price: 1099 },
  { name: "16x16 Inch", price: 1499 }
];

const defaultClockStyles = [
  { name: "Circle", price: 0 }
];

// Name Plate fixed sizes (matching customer-facing defaults)
const defaultNamePlateSizes = [
  { name: "12 x 5 inches", price: 0 },
  { name: "14 x 6 inches", price: 200 },
  { name: "16 x 6 inches", price: 400 },
  { name: "16 x 7 inches", price: 500 },
  { name: "18 x 6 inches", price: 600 },
  { name: "18 x 7 inches", price: 700 }
];

// Calculate QR Standee quantity prices based on base_price with bulk discounts
const getQRStandeeQuantityPrices = (basePrice: number) => {
  // Default is 1 piece at base_price, bulk discounts: 10 pcs = 0%, 20 pcs = 5%, 50 pcs = 10%, 100 pcs = 15%
  return [
    { name: "1 Piece", price: 0 },
    { name: "10 Pieces", price: Math.round(basePrice * 10) - basePrice },
    { name: "20 Pieces", price: Math.round(basePrice * 20 * 0.95) - basePrice },
    { name: "50 Pieces", price: Math.round(basePrice * 50 * 0.90) - basePrice },
    { name: "100 Pieces", price: Math.round(basePrice * 100 * 0.85) - basePrice }
  ];
};

// Calculate Trophy quantity prices based on base_price with bulk discounts
const getTrophyQuantityPrices = (basePrice: number) => {
  // Default is 1 piece at base_price, bulk discounts: 10 pcs = 0%, 20 pcs = 5%, 50 pcs = 10%, 100 pcs = 15%
  return [
    { name: "1 Piece", price: 0 },
    { name: "10 Pieces", price: Math.round(basePrice * 10) - basePrice },
    { name: "20 Pieces", price: Math.round(basePrice * 20 * 0.95) - basePrice },
    { name: "50 Pieces", price: Math.round(basePrice * 50 * 0.90) - basePrice },
    { name: "100 Pieces", price: Math.round(basePrice * 100 * 0.85) - basePrice }
  ];
};

const defaultTrophyTypes = [
  { name: "Crystal", price: 0 },
  { name: "Acrylic", price: -100 },
  { name: "Metal", price: 200 },
  { name: "Wood & Metal", price: 300 },
  { name: "Glass", price: 100 }
];

// Baby Frames specific options
const defaultBabyFrameSizes = [
  { name: "A4 (8x12 inch)", price: 0 },
  { name: "A3 (12x18 inch)", price: 400 }
];

const defaultBabyFrameDesigns = [
  { name: "Classic", price: 0 },
  { name: "Floral", price: 100 },
  { name: "Stars", price: 100 },
  { name: "Animals", price: 150 },
  { name: "Balloons", price: 100 }
];

// Corporate Gifts specific options
const defaultCorporateGiftTypes = [
  { name: "Pen Set", price: 0 },
  { name: "Diary Set", price: 200 },
  { name: "Desk Organizer", price: 300 },
  { name: "Award Trophy", price: 500 },
  { name: "Custom Box", price: 400 }
];

const defaultCorporateGiftQuantity = [
  { name: "Single", price: 0 },
  { name: "Set of 5", price: -50 },
  { name: "Set of 10", price: -100 },
  { name: "Bulk (25+)", price: -150 }
];

const defaultTshirtSizes = [
  { name: "S", price: 0 },
  { name: "M", price: 0 },
  { name: "L", price: 0 },
  { name: "XL", price: 50 },
  { name: "XXL", price: 100 },
  { name: "3XL", price: 150 }
];

const defaultTshirtColors = [
  { name: "White", hex: "#FFFFFF", price: 0 },
  { name: "Black", hex: "#000000", price: 0 },
  { name: "Navy Blue", hex: "#1e3a5f", price: 0 },
  { name: "Red", hex: "#dc2626", price: 50 },
  { name: "Green", hex: "#16a34a", price: 50 },
  { name: "Yellow", hex: "#eab308", price: 50 },
  { name: "Grey", hex: "#6b7280", price: 0 },
  { name: "Maroon", hex: "#7f1d1d", price: 50 }
];



const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVariantImagesDialogOpen, setIsVariantImagesDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  
  // T-shirt specific state
  const [tshirtSizes, setTshirtSizes] = useState(defaultTshirtSizes);
  const [tshirtColors, setTshirtColors] = useState(defaultTshirtColors);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newColorPrice, setNewColorPrice] = useState("");
  
  // Category-specific state
  const [categorySizes, setCategorySizes] = useState<any[]>([]);
  const [categoryVariants, setCategoryVariants] = useState<any[]>([]);
  const [newCategorySizeName, setNewCategorySizeName] = useState("");
  const [newCategorySizePrice, setNewCategorySizePrice] = useState("");
  const [newCategoryVariantName, setNewCategoryVariantName] = useState("");
  const [newCategoryVariantHex, setNewCategoryVariantHex] = useState("#000000");
  const [newCategoryVariantPrice, setNewCategoryVariantPrice] = useState("");
  
  // Variant images state
  const [variantImagesProduct, setVariantImagesProduct] = useState<Product | null>(null);
  const [variantImages, setVariantImages] = useState<Record<string, string[]>>({});
  const [selectedColorForImages, setSelectedColorForImages] = useState("");
  const [newVariantImageUrl, setNewVariantImageUrl] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    base_price: "",
    is_customizable: true,
    is_active: true,
  });
  // Magnetic Badge shapes (prices are 0 as they don't affect pricing)
  const defaultMagneticBadgeShapes = [
    { name: "Logo Cutout", price: 0 },
    { name: "Circle", price: 0 },
    { name: "Square", price: 0 }
  ];

  // Calculate magnetic badge quantity prices based on base_price with bulk discounts
  const getMagneticBadgeQuantityPrices = (basePrice: number) => {
    // Default is 1 piece at base_price, discount tiers: 10 pcs = 0%, 20 pcs = 5%, 50 pcs = 10%, 100 pcs = 15%
    return [
      { name: "1 Piece", price: 0 },
      { name: "10 Pieces", price: Math.round(basePrice * 10) - basePrice },
      { name: "20 Pieces", price: Math.round(basePrice * 20 * 0.95) - basePrice },
      { name: "50 Pieces", price: Math.round(basePrice * 50 * 0.90) - basePrice },
      { name: "100 Pieces", price: Math.round(basePrice * 100 * 0.85) - basePrice }
    ];
  };

  // Get category-specific defaults - some editable, some fixed
  const getCategoryDefaults = (category: string, basePrice?: number) => {
    switch (category) {
      case "T-Shirts":
        // T-Shirts: fixed sizes, NO colors
        return { sizes: defaultTshirtSizes, variants: [], sizeLabel: "T-Shirt Sizes", variantLabel: "", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false };
      case "Acrylic Wall Clock":
        // Wall Clock: only default sizes, NO custom sizes, NO clock styles
        return { sizes: defaultClockSizes, variants: [], sizeLabel: "Clock Sizes", variantLabel: "", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false };
      case "Name Plates":
        // Name Plates: fixed size options (matching customer-facing sizes)
        return { sizes: defaultNamePlateSizes, variants: [], sizeLabel: "Size Options", variantLabel: "", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false };
      case "QR Standee":
        // QR Standee: Platform selection (no pricing options needed - single price)
        const qrPlatforms = [
          { name: "Google", icon: "google" },
          { name: "Instagram", icon: "instagram" },
          { name: "UPI", icon: "upi" },
          { name: "Facebook", icon: "facebook" },
          { name: "YouTube", icon: "youtube" },
          { name: "WhatsApp", icon: "whatsapp" },
          { name: "Website", icon: "website" },
          { name: "Other", icon: "other" }
        ];
        return { sizes: [], variants: qrPlatforms, sizeLabel: "", variantLabel: "Available Platforms", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false, isPlatformSelector: true };
      case "Trophies":
        // Trophies: fixed quantity options with dynamic pricing
        const trophyBase = basePrice || 599;
        return { sizes: [
          { name: "1 Piece", price: 0 },
          { name: "10 Pieces", price: Math.round(trophyBase * 9 * 0.9) },
          { name: "20 Pieces", price: Math.round(trophyBase * 19 * 0.85) },
          { name: "50 Pieces", price: Math.round(trophyBase * 49 * 0.8) },
          { name: "100 Pieces", price: Math.round(trophyBase * 99 * 0.75) }
        ], variants: [], sizeLabel: "Quantity Options", variantLabel: "", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false };
      case "Baby Frames":
        return { sizes: defaultBabyFrameSizes, variants: defaultBabyFrameDesigns, sizeLabel: "Frame Sizes", variantLabel: "Frame Designs", hasColorPicker: false, isEditable: true, sizeEditable: true, variantEditable: true };
      case "Corporate Gifts":
        // Corporate Gifts: fixed quantity options with dynamic pricing
        const corpBase = basePrice || 399;
        return { sizes: [
          { name: "1 Piece", price: 0 },
          { name: "10 Pieces", price: Math.round(corpBase * 9 * 0.9) },
          { name: "20 Pieces", price: Math.round(corpBase * 19 * 0.85) },
          { name: "50 Pieces", price: Math.round(corpBase * 49 * 0.8) },
          { name: "100 Pieces", price: Math.round(corpBase * 99 * 0.75) }
        ], variants: [], sizeLabel: "Quantity Options", variantLabel: "", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false };
      case "Magnetic Badges":
        // Magnetic Badges: fixed quantity options with dynamic pricing
        const badgeBase = basePrice || 149;
        return { sizes: [
          { name: "1 Piece", price: 0 },
          { name: "10 Pieces", price: Math.round(badgeBase * 9 * 0.9) },
          { name: "20 Pieces", price: Math.round(badgeBase * 19 * 0.85) },
          { name: "50 Pieces", price: Math.round(badgeBase * 49 * 0.8) },
          { name: "100 Pieces", price: Math.round(badgeBase * 99 * 0.75) }
        ], variants: [], sizeLabel: "Quantity Options", variantLabel: "", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false };
      case "Name Pencils":
        // Name Pencils: editable bulk pricing tiers
        return { sizes: [
          { name: "1 Pack (10 Pencils)", price: 299 },
          { name: "2+ Packs", price: 149 },
          { name: "5+ Packs", price: 129 },
          { name: "10+ Packs", price: 99 },
          { name: "20+ Packs", price: 89 },
          { name: "50+ Packs", price: 79 }
        ], variants: [], sizeLabel: "Bulk Pricing Tiers", variantLabel: "", hasColorPicker: false, isEditable: true, sizeEditable: true, variantEditable: false };
      case "Acrylic Wall Photo":
        // Acrylic Wall Photo: fixed sizes and frame colors, not editable
        const acrylicFrames = [
          { name: "No Frame", price: 0 },
          { name: "Purple", price: 249 },
          { name: "Red", price: 349 },
          { name: "Gold", price: 499 },
          {name:"Blue",price:299},
          {name:"Yellow",price:349},
          { name: "Silver", price: 449 }

        ];
        return { sizes: defaultSizes, variants: acrylicFrames, sizeLabel: "Sizes", variantLabel: "Frame Color", hasColorPicker: false, isEditable: false, sizeEditable: false, variantEditable: false };
      case "Premium Acrylic Wall Photo":
        const premiumAcrylicFrames = [
          { name: "No Frame", price: 0 },
          { name: "Purple", price: 249 },
          { name: "Red", price: 349 },
          { name: "Gold", price: 499 },
          {name:"Blue",price:299},
          {name:"Yellow",price:349},
          { name: "Silver", price: 449 }
        ];
        return { sizes: defaultSizes, variants: premiumAcrylicFrames, sizeLabel: "Sizes", variantLabel: "Frame Color", hasColorPicker: false, isEditable: true, sizeEditable: true, variantEditable: true };
      default:
        return { sizes: defaultSizes, variants: defaultFrames, sizeLabel: "Sizes", variantLabel: "Frames", hasColorPicker: false, isEditable: true, sizeEditable: true, variantEditable: true };
    }
  };

  // Update category-specific options when category or base_price changes
  useEffect(() => {
    if (formData.category) {
      const basePrice = parseFloat(formData.base_price) || 0;
      const defaults = getCategoryDefaults(formData.category, basePrice);
      
      // For categories with fixed quantity options, always recalculate based on base_price
      const quantityBasedCategories = ["QR Standee", "Trophies", "Corporate Gifts", "Magnetic Badges"];
      if (quantityBasedCategories.includes(formData.category)) {
        setCategorySizes(defaults.sizes);
        setCategoryVariants(defaults.variants);
      } else {
        // Only update on category change for other categories
        setCategorySizes(prev => prev.length > 0 ? prev : defaults.sizes);
        setCategoryVariants(prev => prev.length > 0 ? prev : defaults.variants);
      }
    }
  }, [formData.category, formData.base_price]);

  // No auto-calculation - admin can customize all prices manually

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (data && data.length > 0) {
      // Merge DB categories with fallback (unique names)
      const dbNames = data.map((c: any) => c.name);
      const merged = [...new Set([...dbNames, ...fallbackCategories])];
      setCategories(merged);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      base_price: "",
      is_customizable: true,
      is_active: true,
    });
    setImageUrls([]);
    setNewImageUrl("");
    setTshirtSizes(defaultTshirtSizes);
    setTshirtColors(defaultTshirtColors);
    setCategorySizes([]);
    setCategoryVariants([]);
    setNewSizeName("");
    setNewSizePrice("");
    setNewColorName("");
    setNewColorHex("#000000");
    setNewColorPrice("");
    setNewCategorySizeName("");
    setNewCategorySizePrice("");
    setNewCategoryVariantName("");
    setNewCategoryVariantHex("#000000");
    setNewCategoryVariantPrice("");
  };

  // Category-specific handlers
  const handleAddCategorySize = () => {
    if (newCategorySizeName && !categorySizes.find(s => s.name === newCategorySizeName)) {
      setCategorySizes([...categorySizes, { name: newCategorySizeName, price: parseFloat(newCategorySizePrice) || 0 }]);
      setNewCategorySizeName("");
      setNewCategorySizePrice("");
    }
  };

  const handleRemoveCategorySize = (name: string) => {
    setCategorySizes(categorySizes.filter(s => s.name !== name));
  };

  const handleAddCategoryVariant = () => {
    const defaults = getCategoryDefaults(formData.category);
    if (newCategoryVariantName && !categoryVariants.find(v => v.name === newCategoryVariantName)) {
      const newVariant = defaults.hasColorPicker 
        ? { name: newCategoryVariantName, hex: newCategoryVariantHex, price: parseFloat(newCategoryVariantPrice) || 0 }
        : { name: newCategoryVariantName, price: parseFloat(newCategoryVariantPrice) || 0 };
      setCategoryVariants([...categoryVariants, newVariant]);
      setNewCategoryVariantName("");
      setNewCategoryVariantHex("#000000");
      setNewCategoryVariantPrice("");
    }
  };

  const handleRemoveCategoryVariant = (name: string) => {
    setCategoryVariants(categoryVariants.filter(v => v.name !== name));
  };

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddTshirtSize = () => {
    if (newSizeName && !tshirtSizes.find(s => s.name === newSizeName)) {
      setTshirtSizes([...tshirtSizes, { name: newSizeName, price: parseFloat(newSizePrice) || 0 }]);
      setNewSizeName("");
      setNewSizePrice("");
    }
  };

  const handleRemoveTshirtSize = (name: string) => {
    setTshirtSizes(tshirtSizes.filter(s => s.name !== name));
  };

  const handleAddTshirtColor = () => {
    if (newColorName && !tshirtColors.find(c => c.name === newColorName)) {
      setTshirtColors([...tshirtColors, { name: newColorName, hex: newColorHex, price: parseFloat(newColorPrice) || 0 }]);
      setNewColorName("");
      setNewColorHex("#000000");
      setNewColorPrice("");
    }
  };

  const handleRemoveTshirtColor = (name: string) => {
    setTshirtColors(tshirtColors.filter(c => c.name !== name));
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.base_price) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // Use category-specific sizes and variants with proper base_price for quantity-based categories
    const basePrice = parseFloat(formData.base_price) || 0;
    const defaults = getCategoryDefaults(formData.category, basePrice);
    const sizesToSave = categorySizes.length > 0 ? categorySizes : defaults.sizes;
    const variantsToSave = categoryVariants.length > 0 ? categoryVariants : defaults.variants;
    
    const { error } = await supabase.from('products').insert({
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      base_price: parseFloat(formData.base_price),
      images: imageUrls.length > 0 ? imageUrls : null,
      sizes: sizesToSave,
      frames: variantsToSave,
      is_customizable: formData.is_customizable,
      is_active: formData.is_active,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product added successfully" });
      resetForm();
      setIsAddDialogOpen(false);
      fetchProducts();
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      base_price: product.base_price.toString(),
      is_customizable: product.is_customizable ?? true,
      is_active: product.is_active ?? true,
    });
    setImageUrls(product.images || []);
    
    // Load category-specific sizes and variants
    const defaults = getCategoryDefaults(product.category);
    const sizes = Array.isArray(product.sizes) ? product.sizes : defaults.sizes;
    const variants = Array.isArray(product.frames) ? product.frames : defaults.variants;
    setCategorySizes(sizes);
    setCategoryVariants(variants);
    
    // Also set T-shirt specific state for backwards compatibility
    if (product.category === "tshirts") {
      setTshirtSizes(sizes);
      setTshirtColors(variants);
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    // Use category-specific sizes and variants with proper base_price for quantity-based categories
    const basePrice = parseFloat(formData.base_price) || 0;
    const defaults = getCategoryDefaults(formData.category, basePrice);
    const sizesToSave = categorySizes.length > 0 ? categorySizes : defaults.sizes;
    const variantsToSave = categoryVariants.length > 0 ? categoryVariants : defaults.variants;

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        base_price: parseFloat(formData.base_price),
        images: imageUrls.length > 0 ? imageUrls : null,
        sizes: sizesToSave,
        frames: variantsToSave,
        is_customizable: formData.is_customizable,
        is_active: formData.is_active,
      })
      .eq('id', editingProduct.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product updated successfully" });
      resetForm();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Product removed successfully" });
      fetchProducts();
    }
  };

  const handleToggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchProducts();
    }
  };

  // Variant images management
  const openVariantImagesDialog = (product: Product) => {
    setVariantImagesProduct(product);
    // Parse existing variant images or use empty object
    const existing = product.variant_images || {};
    setVariantImages(existing);
    setSelectedColorForImages("");
    setNewVariantImageUrl("");
    setIsVariantImagesDialogOpen(true);
  };

  const getProductColors = (product: Product) => {
    if (product.category !== "tshirts") return [];
    const colors = Array.isArray(product.frames) ? product.frames : defaultTshirtColors;
    return colors.map((c: any) => c.name || c);
  };

  const handleAddVariantImage = () => {
    if (!selectedColorForImages || !newVariantImageUrl) return;
    
    const key = `color:${selectedColorForImages.toLowerCase()}`;
    const currentImages = variantImages[key] || [];
    
    if (!currentImages.includes(newVariantImageUrl)) {
      setVariantImages({
        ...variantImages,
        [key]: [...currentImages, newVariantImageUrl]
      });
    }
    setNewVariantImageUrl("");
  };

  const handleRemoveVariantImage = (colorKey: string, imageIndex: number) => {
    const currentImages = variantImages[colorKey] || [];
    setVariantImages({
      ...variantImages,
      [colorKey]: currentImages.filter((_, i) => i !== imageIndex)
    });
  };

  const handleSaveVariantImages = async () => {
    if (!variantImagesProduct) return;

    const { error } = await supabase
      .from('products')
      .update({ variant_images: variantImages })
      .eq('id', variantImagesProduct.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Variant images saved successfully" });
      setIsVariantImagesDialogOpen(false);
      fetchProducts();
    }
  };

  // Inline form fields JSX to prevent focus loss
  const productFormFieldsJSX = (
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., PrintDukan Acrylic Wall Photo"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Base Price (₹) *</Label>
        <Input
          id="price"
          type="number"
          value={formData.base_price}
          onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
          placeholder="e.g., 999"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Experience the brilliance and vibrancy of our acrylic prints..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Product Images</Label>
        <ProductImageUpload
          images={imageUrls}
          onImagesChange={setImageUrls}
          category={formData.category || "general"}
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label>Customizable</Label>
          <p className="text-xs text-muted-foreground">Allow customers to upload photos</p>
        </div>
        <Switch
          checked={formData.is_customizable}
          onCheckedChange={(checked) => setFormData({ ...formData, is_customizable: checked })}
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label>Active</Label>
          <p className="text-xs text-muted-foreground">Product visible to customers</p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      {/* Dynamic Category-Specific Options */}
      {formData.category && (
        <div className="space-y-4 border-t border-border pt-4">
          {(() => {
            const defaults = getCategoryDefaults(formData.category);
            return (
              <>
                {/* Sizes / Types Section */}
                <h4 className="font-medium flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  {defaults.sizeLabel}
                  {!defaults.sizeEditable && (
                    <span className="text-xs text-muted-foreground">(Fixed)</span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categorySizes.map((size) => (
                    <div key={size.name} className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md text-sm">
                      <span>{size.name}</span>
                      {size.price !== 0 && (
                        <span className="text-muted-foreground">
                          ({size.price > 0 ? '+' : ''}₹{size.price})
                        </span>
                      )}
                      {defaults.sizeEditable && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategorySize(size.name)}
                          className="ml-1 text-destructive hover:text-destructive/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {defaults.sizeEditable && (
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add ${defaults.sizeLabel.toLowerCase()}`}
                      value={newCategorySizeName}
                      onChange={(e) => setNewCategorySizeName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Price ±"
                      value={newCategorySizePrice}
                      onChange={(e) => setNewCategorySizePrice(e.target.value)}
                      className="w-24"
                    />
                    <Button type="button" variant="outline" onClick={handleAddCategorySize}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Variants Section - only show if there are variants or variantLabel is defined */}
                {defaults.variantLabel && (
                  <>
                    <h4 className="font-medium flex items-center gap-2 mt-4">
                      <Palette className="h-4 w-4" />
                      {defaults.variantLabel}
                      {!defaults.variantEditable && (
                        <span className="text-xs text-muted-foreground">(Fixed)</span>
                      )}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryVariants.map((variant) => (
                        <div key={variant.name} className="flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded-md text-sm">
                          {variant.hex && (
                            <div 
                              className="w-4 h-4 rounded-full border border-border" 
                              style={{ backgroundColor: variant.hex }}
                            />
                          )}
                          <span>{variant.name}</span>
                          {variant.price !== 0 && (
                            <span className="text-muted-foreground">
                              ({variant.price > 0 ? '+' : ''}₹{variant.price})
                            </span>
                          )}
                          {defaults.variantEditable && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCategoryVariant(variant.name)}
                              className="ml-1 text-destructive hover:text-destructive/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {defaults.variantEditable && (
                      <div className="flex gap-2">
                        {defaults.hasColorPicker && (
                          <Input
                            type="color"
                            value={newCategoryVariantHex}
                            onChange={(e) => setNewCategoryVariantHex(e.target.value)}
                            className="w-12 p-1 h-9"
                          />
                        )}
                        <Input
                          placeholder={`Add ${defaults.variantLabel.toLowerCase()}`}
                          value={newCategoryVariantName}
                          onChange={(e) => setNewCategoryVariantName(e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Price ±"
                          value={newCategoryVariantPrice}
                          onChange={(e) => setNewCategoryVariantPrice(e.target.value)}
                          className="w-24"
                        />
                        <Button type="button" variant="outline" onClick={handleAddCategoryVariant}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-8 w-8" />
            Products
          </h1>
          <p className="text-muted-foreground">Manage your product catalog like OMGS®</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            {productFormFieldsJSX}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsPreviewDialogOpen(true)}>
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleAddProduct} className="flex-1">Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
          </DialogHeader>
          <ProductPreview
            name={formData.name}
            description={formData.description}
            category={formData.category}
            basePrice={parseFloat(formData.base_price) || 0}
            images={imageUrls}
            sizes={categorySizes.length > 0 ? categorySizes : getCategoryDefaults(formData.category).sizes}
            variants={categoryVariants.length > 0 ? categoryVariants : getCategoryDefaults(formData.category).variants}
            isCustomizable={formData.is_customizable}
          />
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Eye className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.filter(p => p.is_active).length}</p>
                <p className="text-xs text-muted-foreground">Active Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ImageIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.filter(p => p.is_customizable).length}</p>
                <p className="text-xs text-muted-foreground">Customizable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(products.map(p => p.category)).size}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {product.images && product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.is_customizable && (
                            <Badge variant="outline" className="text-xs mt-1">Customizable</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{product.base_price.toLocaleString()}</TableCell>
                      <TableCell>
                        <button onClick={() => handleToggleActive(product)}>
                          <span className={`px-2 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                            product.is_active 
                              ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" 
                              : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                          }`}>
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {product.category === "tshirts" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => openVariantImagesDialog(product)}
                              title="Manage Color Images"
                            >
                              <Images className="h-4 w-4 text-purple-500" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {productFormFieldsJSX}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsPreviewDialogOpen(true)}>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleUpdateProduct} className="flex-1">Update Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant Images Management Dialog */}
      <Dialog open={isVariantImagesDialogOpen} onOpenChange={setIsVariantImagesDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Images className="h-5 w-5" />
              Color-Specific Images - {variantImagesProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Bulk upload for each color */}
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-1">Bulk Image Upload</p>
                <p className="text-xs text-muted-foreground">
                  Upload multiple images for each color variant. Images are stored in Supabase with 1 year cache.
                </p>
              </div>
              
              {variantImagesProduct && getProductColors(variantImagesProduct).map((color: string) => {
                const colorKey = `color:${color.toLowerCase()}`;
                const colorImages = variantImages[colorKey] || [];
                
                return (
                  <div key={color} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {variantImagesProduct.frames?.find((f: any) => f.name === color)?.hex && (
                        <div 
                          className="w-5 h-5 rounded-full border border-border" 
                          style={{ backgroundColor: variantImagesProduct.frames.find((f: any) => f.name === color)?.hex }}
                        />
                      )}
                      <Label className="font-medium">{color}</Label>
                      {colorImages.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {colorImages.length} image(s)
                        </Badge>
                      )}
                    </div>
                    <VariantImageUpload
                      colorName={color}
                      images={colorImages}
                      onImagesChange={(newImages) => {
                        setVariantImages({
                          ...variantImages,
                          [colorKey]: newImages
                        });
                      }}
                      productCategory={variantImagesProduct.category}
                    />
                  </div>
                );
              })}
            </div>

            {/* Display existing variant images by color */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="all" className="text-xs">All Colors</TabsTrigger>
                {variantImagesProduct && getProductColors(variantImagesProduct).map((color: string) => (
                  <TabsTrigger key={color} value={color} className="text-xs">
                    {color}
                    {variantImages[`color:${color.toLowerCase()}`]?.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                        {variantImages[`color:${color.toLowerCase()}`].length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {Object.entries(variantImages).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Images className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No color-specific images added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(variantImages).map(([key, images]) => (
                      <div key={key} className="border border-border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {key.replace('color:', '')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{images.length} image(s)</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {images.map((url, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleRemoveVariantImage(key, idx)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {variantImagesProduct && getProductColors(variantImagesProduct).map((color: string) => {
                const colorKey = `color:${color.toLowerCase()}`;
                const colorImages = variantImages[colorKey] || [];
                
                return (
                  <TabsContent key={color} value={color} className="mt-4">
                    {colorImages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No images for {color}</p>
                        <p className="text-xs">Add images using the form above</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {colorImages.map((url, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                            <img src={url} alt={`${color} variant ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleRemoveVariantImage(colorKey, idx)}
                                className="bg-destructive text-destructive-foreground rounded-full p-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <Badge className="absolute bottom-1 left-1 text-[10px]">
                              #{idx + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsVariantImagesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariantImages}>
              Save Variant Images
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
