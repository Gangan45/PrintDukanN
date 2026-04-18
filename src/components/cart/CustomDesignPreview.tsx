import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDesignPreviewProps {
  /** Default product image (shown by default) */
  productImage?: string;
  /** User's saved customized design (composite) */
  customImageUrl?: string | null;
  /** Alt text */
  alt?: string;
  /** Thumbnail size class */
  className?: string;
}

/**
 * Shows a clickable thumbnail. If a custom (user-saved) design is present,
 * clicking opens a large modal so the user can recheck their design.
 */
export const CustomDesignPreview = ({
  productImage,
  customImageUrl,
  alt = "Product",
  className,
}: CustomDesignPreviewProps) => {
  const [open, setOpen] = useState(false);
  const hasCustom = !!customImageUrl;
  // Prefer the customized design as the thumbnail when available
  const thumb = customImageUrl || productImage || "/placeholder.svg";

  return (
    <>
      <button
        type="button"
        onClick={() => hasCustom && setOpen(true)}
        className={cn(
          "relative rounded-lg bg-muted overflow-hidden flex-shrink-0 group",
          hasCustom ? "cursor-zoom-in" : "cursor-default",
          className
        )}
        aria-label={hasCustom ? "View your custom design" : alt}
      >
        <img
          src={thumb}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {hasCustom && (
          <>
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-0.5 shadow">
              <ImageIcon className="w-2.5 h-2.5" />
              YOUR
            </span>
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
            </span>
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background">
          <DialogTitle className="sr-only">Your Custom Design Preview</DialogTitle>
          <div className="p-4 border-b">
            <h2 className="font-display text-lg font-bold text-foreground">
              Your Custom Design
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              This is exactly what we will print and ship to you.
            </p>
          </div>
          <div className="bg-muted/30 p-4 sm:p-6 flex items-center justify-center max-h-[75vh] overflow-auto">
            <img
              src={customImageUrl || ""}
              alt="Your custom design"
              className="max-w-full max-h-[65vh] object-contain rounded-md shadow-lg"
            />
          </div>
          {productImage && (
            <div className="p-3 border-t flex items-center gap-3 bg-muted/20">
              <img
                src={productImage}
                alt="Original product"
                className="w-12 h-12 rounded object-cover border"
              />
              <p className="text-xs text-muted-foreground">
                Original product reference
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
