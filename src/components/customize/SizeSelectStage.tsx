import { useState, useMemo } from "react";
import { ShoppingCart, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShapeFrame, ProductShape } from "./ShapeMask";
import { PincodeChecker } from "./PincodeChecker";
import { cn } from "@/lib/utils";
import wallMockup from "@/assets/wall-mockup-room.jpg";

export interface SizeOption {
  name: string;
  regular_price: number;
  sale_price: number;
}
export interface ThicknessOption {
  name: string;
  price_add: number;
}

interface SizeSelectStageProps {
  shape: ProductShape;
  productName: string;
  designImage: string;
  customText: string;
  transform: { scale: number; rotate: number; x: number; y: number };
  borderColor: string;
  dualBorder?: boolean;
  sizes: SizeOption[];
  thicknesses: ThicknessOption[];
  onEdit: () => void;
  onAddToCart: (params: { size: SizeOption; thickness: ThicknessOption; quantity: number; finalPrice: number }) => void;
  onBuyNow: (params: { size: SizeOption; thickness: ThicknessOption; quantity: number; finalPrice: number }) => void;
  loading?: boolean;
}

/** Parse "12x9" → { w: 12, h: 9 } */
const parseSize = (name: string) => {
  const m = name.toLowerCase().match(/(\d+)\s*x\s*(\d+)/);
  return m ? { w: parseInt(m[1]), h: parseInt(m[2]) } : { w: 12, h: 9 };
};

export const SizeSelectStage = ({
  shape,
  productName,
  designImage,
  customText,
  transform,
  borderColor,
  dualBorder = true,
  sizes,
  thicknesses,
  onEdit,
  onAddToCart,
  onBuyNow,
  loading,
}: SizeSelectStageProps) => {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [thickIdx, setThickIdx] = useState(0);

  const size = sizes[sizeIdx] || sizes[0];
  const thickness = thicknesses[thickIdx] || thicknesses[0];
  const dims = parseSize(size?.name || "12x9");

  const unitPrice = useMemo(
    () => (size?.sale_price || 0) + (thickness?.price_add || 0),
    [size, thickness]
  );
  const regularUnit = useMemo(
    () => (size?.regular_price || 0) + (thickness?.price_add || 0),
    [size, thickness]
  );

  // Frame size on the wall mockup grows with selected dimension.
  // Smallest size ≈ 14% of wall width, largest ≈ 36% (so it always feels like a frame on a real wall).
  const maxDim = Math.max(...sizes.map((s) => parseSize(s.name).w));
  const minDim = Math.min(...sizes.map((s) => parseSize(s.name).w));
  const range = Math.max(1, maxDim - minDim);
  const frameWidthPct = 14 + ((dims.w - minDim) / range) * 22;
  const frameAspect = dims.w / dims.h;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-lg md:text-xl font-semibold text-foreground mb-1">{productName}</h1>
      <nav className="text-xs text-muted-foreground mb-6">
        <span>Home</span> / <span>Acrylic Wall Photo</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Wall mockup preview with dimension labels */}
        <div>
          <div className="relative rounded-lg overflow-hidden aspect-[3/2] shadow-inner border border-border bg-[#f5f1e8]">
            {/* Room mockup background */}
            <img
              src={wallMockup}
              alt="Room preview"
              loading="lazy"
              width={1536}
              height={1024}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />

            {/* Edit pill */}
            <button
              onClick={onEdit}
              className="absolute top-3 right-3 z-20 bg-foreground text-background px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>

            {/* Top dimension label (width) */}
            <div
              className="absolute z-10 text-[11px] md:text-xs font-medium text-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm"
              style={{
                left: "50%",
                top: `calc(50% - ${frameWidthPct / 2 / frameAspect}% - 28px)`,
                transform: "translate(-50%, -100%)",
              }}
            >
              {dims.w} inches ({(dims.w * 2.54).toFixed(2)} cm)
            </div>

            {/* Left dimension label (height) — vertical, beside the frame */}
            <div
              className="absolute z-10 text-[11px] md:text-xs font-medium text-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded whitespace-nowrap shadow-sm"
              style={{
                left: `calc(50% - ${frameWidthPct / 2}% - 14px)`,
                top: "50%",
                transform: "translate(-100%, -50%) rotate(-90deg)",
                transformOrigin: "right center",
              }}
            >
              {dims.h} inches ({(dims.h * 2.54).toFixed(2)} cm)
            </div>

            {/* Frame on the wall — small, centered, scales with size */}
            <div
              className="absolute z-10"
              style={{
                left: "50%",
                top: "50%",
                width: `${frameWidthPct}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="relative w-full" style={{ aspectRatio: String(frameAspect) }}>
                {/* Show the saved composite design exactly as it was captured —
                    the template, photos, and frame are already baked in. */}
                <img
                  src={designImage}
                  alt="Your design"
                  className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
                  draggable={false}
                />
                {customText && (
                  <div
                    className="absolute bottom-2 left-0 right-0 text-center font-display text-white text-[10px] md:text-xs"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                  >
                    {customText}
                  </div>
                )}
              </div>
              {/* Thickness label */}
              <div className="text-center mt-1.5">
                <span className="text-[10px] md:text-[11px] text-foreground bg-background/80 backdrop-blur-sm border-b border-foreground/40 px-1.5 pb-0.5 rounded-sm shadow-sm">
                  Thickness: {thickness.name}
                </span>
              </div>
            </div>

            {/* Bottom hint */}
            <div className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-foreground bg-background/60 backdrop-blur-sm py-1">
              Quick mount: Adhesive hooks (Included)
            </div>
          </div>
        </div>

        {/* Right: pricing & options */}
        <div className="space-y-6">
          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-xl text-muted-foreground line-through">
              ₹{regularUnit.toLocaleString()}
            </span>
            <span className="text-3xl font-bold text-coral">
              ₹{unitPrice.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-coral -mt-4">Only 7 Acrylic's left!</p>

          {/* Size pills */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Acrylic Size (Inch):
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => setSizeIdx(i)}
                  className={cn(
                    "px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all",
                    sizeIdx === i
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-border text-foreground hover:border-foreground"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Thickness pills */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Acrylic Thickness:
            </label>
            <div className="flex gap-2">
              {thicknesses.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setThickIdx(i)}
                  className={cn(
                    "px-5 py-2 rounded-full border-2 text-sm font-semibold transition-all",
                    thickIdx === i
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-border text-foreground hover:border-foreground"
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* ADD TO CART — big red */}
          <button
            disabled={loading}
            onClick={() => onAddToCart({ size, thickness, quantity: 1, finalPrice: unitPrice })}
            className={cn(
              "w-full py-4 rounded-md font-display text-base font-bold text-white flex items-center justify-center gap-2 transition-all",
              loading
                ? "bg-muted cursor-not-allowed"
                : "bg-coral hover:bg-coral-dark shadow-lg hover:shadow-xl"
            )}
          >
            <ShoppingCart className="w-5 h-5" /> ADD TO CART
          </button>

          {/* Buy now secondary */}
          <Button
            variant="navy"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => onBuyNow({ size, thickness, quantity: 1, finalPrice: unitPrice })}
          >
            BUY NOW
          </Button>

          {/* Pincode */}
          <div className="border-t border-border pt-5">
            <p className="text-center text-sm font-medium text-foreground mb-3">
              Check Estimated Delivery Date
            </p>
            <PincodeChecker />
          </div>
        </div>
      </div>
    </div>
  );
};
