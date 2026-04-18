import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { uploadCustomImage } from "@/lib/uploadCustomImage";
import { UploadStage } from "@/components/customize/UploadStage";
import { TemplateCustomizer, PhotoSlot, SlotPhoto } from "@/components/customize/TemplateCustomizer";
import { SizeSelectStage, SizeOption, ThicknessOption } from "@/components/customize/SizeSelectStage";
import { ProductShape, shapeLabel } from "@/components/customize/ShapeMask";
import { ReviewsAndSuggestions } from "@/components/product/ReviewsAndSuggestions";
import TrustBadges from "@/components/product/TrustBadges";
import WhyPrintdukan from "@/components/product/WhyPrintdukan";
import { cn } from "@/lib/utils";

interface DbProduct {
  id: string;
  name: string;
  category: string;
  base_price: number;
  description: string | null;
  images: string[] | null;
  shape: string | null;
  sizes: any;
  thickness_options: any;
  photo_count: number | null;
  border_styles: any;
  frame_color_options: any;
  allowed_fonts: any;
  allow_custom_text: boolean | null;
  photo_slots: any;
  design_template_url: string | null;
  design_layers?: any;
}

interface DesignData {
  photos: { imageDataUrl: string; transform: { scale: number; rotate: number; x: number; y: number } }[];
  imageDataUrl: string;
  customText: string;
  fontFamily: string;
  transform: { scale: number; rotate: number; x: number; y: number };
  borderColor: string;
  borderStyleId: string;
}

const DEFAULT_SIZES: SizeOption[] = [
  { name: "8x6", regular_price: 799, sale_price: 499 },
  { name: "12x8", regular_price: 1199, sale_price: 799 },
  { name: "16x12", regular_price: 1799, sale_price: 1199 },
  { name: "20x16", regular_price: 2499, sale_price: 1699 },
  { name: "24x18", regular_price: 2999, sale_price: 2099 },
  { name: "30x20", regular_price: 3999, sale_price: 2799 },
  { name: "36x24", regular_price: 4999, sale_price: 3499 },
  { name: "48x32", regular_price: 7999, sale_price: 5599 },
  { name: "72x72", regular_price: 14999, sale_price: 10499 },
];
const DEFAULT_THICKNESS: ThicknessOption[] = [
  { name: "3mm", price_add: 0 },
  { name: "5mm", price_add: 300 },
  { name: "8mm", price_add: 700 },
];

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const OmgsAcrylicCustomize = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, loading: cartLoading } = useCart();
  const { buyNow, loading: buyLoading } = useBuyNow();

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<"upload" | "select">("upload");
  const [design, setDesign] = useState<DesignData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || !isUuid(id)) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,base_price,description,images,shape,sizes,thickness_options,photo_count,border_styles,frame_color_options,allowed_fonts,allow_custom_text,photo_slots,design_template_url,design_layers")
        .eq("id", id)
        .maybeSingle();
      if (error) console.error(error);
      setProduct(data as DbProduct | null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ProductDetailSkeleton />
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-navy">Product not found</h1>
          <button onClick={() => navigate("/category/acrylic")} className="mt-4 text-coral underline">
            Browse Acrylic Wall Photos
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const shape: ProductShape = (product.shape as ProductShape) || "portrait";
  // Auto-detect dual border from product name (OMGS convention)
  const dualBorder = /dual\s*border/i.test(product.name);
  const sizes: SizeOption[] = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : DEFAULT_SIZES;
  const thicknesses: ThicknessOption[] =
    Array.isArray(product.thickness_options) && product.thickness_options.length
      ? product.thickness_options
      : DEFAULT_THICKNESS;
  const photoCount = Math.max(1, product.photo_count || 1);
  const frameColorOptions = Array.isArray(product.frame_color_options) ? product.frame_color_options : [];
  const allowedFonts = Array.isArray(product.allowed_fonts) ? product.allowed_fonts : [];
  const borderStyles = Array.isArray(product.border_styles) ? product.border_styles : [];
  const allowCustomText = product.allow_custom_text !== false;
  const photoSlots: PhotoSlot[] = Array.isArray(product.photo_slots) ? product.photo_slots : [];
  const hasTemplateSlots = photoSlots.length > 0;
  const templateImage = product.design_template_url || product.images?.[0] || "";

  const handleSaveDesign = (data: DesignData) => {
    setDesign(data);
    setStage("select");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTemplateSave = (compositeDataUrl: string, slotPhotos: SlotPhoto[]) => {
    const primary = slotPhotos[0];
    setDesign({
      photos: slotPhotos.map((p) => ({ imageDataUrl: p.imageDataUrl, transform: p.transform })),
      // Use composite (template + photos baked) as the primary saved image
      imageDataUrl: compositeDataUrl || primary.imageDataUrl,
      customText: "",
      fontFamily: "Inter, sans-serif",
      transform: primary.transform,
      borderColor: "#0a0a0a",
      borderStyleId: "thin",
    });
    setStage("select");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildCartParams = async (
    size: SizeOption,
    thickness: ThicknessOption,
    quantity: number
  ) => {
    if (!design) return null;
    const uploadedUrl = await uploadCustomImage(design.imageDataUrl, product.category);
    return {
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0],
      quantity,
      selectedSize: `${size.name} · ${thickness.name}`,
      customImageUrl: uploadedUrl || design.imageDataUrl,
      customText: design.customText || undefined,
      category: product.category,
      unitPrice: size.sale_price + thickness.price_add,
    };
  };

  const handleAddToCart = async ({ size, thickness, quantity }: any) => {
    setSubmitting(true);
    try {
      const params = await buildCartParams(size, thickness, quantity);
      if (!params) return;
      const ok = await addToCart(params);
      if (ok) {
        toast({ title: "Added to cart!", description: `${product.name} (${size.name}, ${thickness.name})` });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuyNow = async ({ size, thickness, quantity }: any) => {
    setSubmitting(true);
    try {
      const params = await buildCartParams(size, thickness, quantity);
      if (!params) return;
      await buyNow({
        productId: params.productId,
        productName: params.productName,
        productImage: params.productImage || "",
        price: params.unitPrice,
        quantity: params.quantity,
        selectedSize: params.selectedSize,
        customImageUrl: params.customImageUrl,
        customText: params.customText,
        category: params.category,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`Customize ${product.name} | Acrylic Wall Photo`}</title>
        <meta
          name="description"
          content={`Design your custom ${shapeLabel[shape]} acrylic wall photo. Upload photo, pick size and thickness, get it delivered.`}
        />
      </Helmet>
      <Header />

      <div className="container py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-coral">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/category/acrylic" className="hover:text-coral">Acrylic</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        {/* Stage indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {(["upload", "select"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                  stage === s
                    ? "bg-coral text-primary-foreground shadow-md"
                    : (stage === "select" && s === "upload")
                    ? "bg-coral/20 text-coral"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                    stage === s ? "bg-white/20" : "bg-background"
                  )}
                >
                  {i + 1}
                </span>
                {s === "upload" ? "Design" : "Size & Order"}
              </div>
              {i === 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {stage === "upload" && (
          hasTemplateSlots ? (
            <TemplateCustomizer
              templateImageUrl={templateImage}
              slots={photoSlots}
              productName={product.name}
              layers={Array.isArray(product.design_layers) ? (product.design_layers as any) : undefined}
              onSaveAndContinue={handleTemplateSave}
            />
          ) : (
            <UploadStage
              shape={shape}
              productName={product.name}
              photoCount={photoCount}
              dualBorder={dualBorder}
              frameColorOptions={frameColorOptions}
              allowedFonts={allowedFonts}
              borderStyles={borderStyles}
              allowCustomText={allowCustomText}
              onSaveAndContinue={handleSaveDesign}
            />
          )
        )}

        {stage === "select" && design && (
          <SizeSelectStage
            shape={shape}
            productName={product.name}
            designImage={design.imageDataUrl}
            customText={design.customText}
            transform={design.transform}
            borderColor={design.borderColor}
            dualBorder={dualBorder}
            sizes={sizes}
            thicknesses={thicknesses}
            onEdit={() => setStage("upload")}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            loading={submitting || cartLoading || buyLoading}
          />
        )}
      </div>

      {/* Product details + reviews + suggestions (visible on both stages) */}
      <div className="container py-6 space-y-10">
        {/* About this product */}
        {product.description && (
          <section className="bg-card border rounded-2xl p-5 sm:p-7">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
              About this product
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </section>
        )}

        <TrustBadges />
        <WhyPrintdukan />

        {/* Reviews + suggested products */}
        <ReviewsAndSuggestions productId={product.id} category={product.category} />
      </div>

      <Footer />
    </div>
  );
};

export default OmgsAcrylicCustomize;
