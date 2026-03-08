import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  aspectRatio: number;
  previewImage?: string;
  overlayStyle: "minimal" | "elegant" | "modern" | "classic" | "premium" | "artistic";
  frameStyle?: "none" | "thin" | "thick" | "shadow" | "glow";
  backgroundColor?: string;
  borderColor?: string;
  effects?: {
    innerBorder?: boolean;
    cornerAccents?: boolean;
    gradient?: boolean;
    pattern?: string;
    shadow?: boolean;
  };
}

interface DesignPreviewProps {
  template: DesignTemplate;
  userImage: string | null;
  frameColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showDownloadButton?: boolean;
  onDownload?: (dataUrl: string) => void;
}

// Beautiful design templates for different product styles
export const productDesignTemplates: DesignTemplate[] = [
  {
    id: "elegant-portrait",
    name: "Elegant Portrait",
    description: "Classic portrait style with thin golden accent",
    aspectRatio: 3/4,
    overlayStyle: "elegant",
    frameStyle: "thin",
    effects: { innerBorder: true, shadow: true },
    borderColor: "rgba(212, 175, 55, 0.6)",
  },
  {
    id: "modern-landscape",
    name: "Modern Landscape",
    description: "Clean modern landscape with subtle border",
    aspectRatio: 4/3,
    overlayStyle: "modern",
    frameStyle: "shadow",
    effects: { shadow: true },
    backgroundColor: "#ffffff",
  },
  {
    id: "minimal-square",
    name: "Minimal Square",
    description: "Simple square format for clean aesthetics",
    aspectRatio: 1,
    overlayStyle: "minimal",
    frameStyle: "none",
    effects: { shadow: true },
  },
  {
    id: "premium-dual-frame",
    name: "Premium Dual Frame",
    description: "Double border effect for premium look",
    aspectRatio: 3/4,
    overlayStyle: "premium",
    frameStyle: "thick",
    effects: { innerBorder: true, cornerAccents: true },
    borderColor: "rgba(0, 0, 0, 0.8)",
  },
  {
    id: "artistic-cutout",
    name: "Artistic Cutout",
    description: "Circular cutout with artistic border",
    aspectRatio: 1,
    overlayStyle: "artistic",
    frameStyle: "glow",
    effects: { gradient: true, shadow: true },
  },
  {
    id: "classic-vintage",
    name: "Classic Vintage",
    description: "Timeless vintage style with ornate border",
    aspectRatio: 4/5,
    overlayStyle: "classic",
    frameStyle: "thick",
    effects: { cornerAccents: true, pattern: "vintage" },
    borderColor: "rgba(139, 90, 43, 0.8)",
  },
];

export const DesignPreview = ({
  template,
  userImage,
  frameColor = "black",
  size = "md",
  className,
  showDownloadButton = false,
  onDownload,
}: DesignPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Size mappings
  const sizeClasses = {
    sm: "max-w-[200px]",
    md: "max-w-[400px]",
    lg: "max-w-[600px]",
  };

  // Render design to canvas for download
  const renderToCanvas = async (): Promise<string | null> => {
    if (!canvasRef.current || !userImage) return null;
    
    setIsRendering(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas size based on template
    const baseWidth = 1200;
    const baseHeight = baseWidth / template.aspectRatio;
    canvas.width = baseWidth;
    canvas.height = baseHeight;

    // Clear canvas
    ctx.fillStyle = template.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw user image
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Calculate image positioning to cover canvas
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        // Draw user image
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Apply design overlays
        applyDesignOverlays(ctx, canvas.width, canvas.height, template, frameColor);

        setIsRendering(false);
        resolve(canvas.toDataURL("image/png", 1.0));
      };
      
      img.onerror = () => {
        setIsRendering(false);
        resolve(null);
      };
      
      img.src = userImage;
    });
  };

  // Apply design-specific overlays
  const applyDesignOverlays = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    template: DesignTemplate,
    frameColor: string
  ) => {
    const borderWidth = template.frameStyle === "thick" ? 40 : template.frameStyle === "thin" ? 15 : 0;
    
    // Frame border
    if (borderWidth > 0) {
      ctx.strokeStyle = template.borderColor || getFrameColor(frameColor);
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
    }

    // Inner border for dual frame effect
    if (template.effects?.innerBorder) {
      const innerOffset = borderWidth + 20;
      ctx.strokeStyle = template.borderColor || "rgba(212, 175, 55, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(innerOffset, innerOffset, width - innerOffset * 2, height - innerOffset * 2);
    }

    // Corner accents
    if (template.effects?.cornerAccents) {
      drawCornerAccents(ctx, width, height, template.borderColor || "#d4af37");
    }

    // Shadow effect (outer glow)
    if (template.effects?.shadow && template.frameStyle === "shadow") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
    }

    // Artistic cutout for circular designs
    if (template.overlayStyle === "artistic") {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.45;

      // Create circular mask effect
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Add circular border
      ctx.strokeStyle = template.borderColor || "rgba(212, 175, 55, 0.8)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  // Get frame color based on selection
  const getFrameColor = (color: string): string => {
    const colors: Record<string, string> = {
      black: "#1a1a1a",
      white: "#ffffff",
      gold: "#d4af37",
      silver: "#c0c0c0",
      wood: "#8b5a2b",
      none: "transparent",
    };
    return colors[color] || colors.black;
  };

  // Draw decorative corner accents
  const drawCornerAccents = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: string
  ) => {
    const size = 30;
    const offset = 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(offset, offset + size);
    ctx.lineTo(offset, offset);
    ctx.lineTo(offset + size, offset);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - offset - size, offset);
    ctx.lineTo(width - offset, offset);
    ctx.lineTo(width - offset, offset + size);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(offset, height - offset - size);
    ctx.lineTo(offset, height - offset);
    ctx.lineTo(offset + size, height - offset);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - offset - size, height - offset);
    ctx.lineTo(width - offset, height - offset);
    ctx.lineTo(width - offset, height - offset - size);
    ctx.stroke();
  };

  const handleDownload = async () => {
    const dataUrl = await renderToCanvas();
    if (dataUrl && onDownload) {
      onDownload(dataUrl);
    }
  };

  // Get overlay classes based on template style
  const getOverlayClasses = () => {
    switch (template.overlayStyle) {
      case "elegant":
        return "border-2 border-amber-400/60";
      case "modern":
        return "shadow-xl";
      case "minimal":
        return "border border-border/50";
      case "premium":
        return "border-4 border-gray-800 ring-2 ring-amber-400/40 ring-offset-2";
      case "artistic":
        return "rounded-full overflow-hidden border-4 border-amber-400/80";
      case "classic":
        return "border-[6px] border-amber-800/80";
      default:
        return "";
    }
  };

  // Get frame border classes
  const getFrameClasses = () => {
    const baseFrameColors: Record<string, string> = {
      black: "border-gray-900",
      white: "border-white shadow-md",
      gold: "border-amber-500",
      silver: "border-gray-400",
      wood: "border-amber-800",
      none: "border-transparent",
    };

    const frameWidths = {
      none: "",
      thin: "border-2",
      thick: "border-8",
      shadow: "border-4 shadow-2xl",
      glow: "border-4 shadow-[0_0_30px_rgba(212,175,55,0.5)]",
    };

    return `${baseFrameColors[frameColor] || ""} ${frameWidths[template.frameStyle || "none"]}`;
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Visual Preview */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden bg-muted",
          getOverlayClasses(),
          getFrameClasses()
        )}
        style={{ 
          aspectRatio: template.aspectRatio,
        }}
      >
        {userImage ? (
          <img
            src={userImage}
            alt="Your design preview"
            className={cn(
              "w-full h-full object-cover",
              template.overlayStyle === "artistic" && "rounded-full"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm">Your photo here</p>
            </div>
          </div>
        )}

        {/* Inner border effect */}
        {template.effects?.innerBorder && userImage && (
          <div 
            className="absolute inset-3 border border-amber-400/50 pointer-events-none"
            style={{ borderColor: template.borderColor || "rgba(212, 175, 55, 0.5)" }}
          />
        )}

        {/* Corner accents */}
        {template.effects?.cornerAccents && userImage && (
          <>
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500/70" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500/70" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500/70" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500/70" />
          </>
        )}
      </div>

      {/* Hidden canvas for high-res export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Download button */}
      {showDownloadButton && userImage && (
        <button
          onClick={handleDownload}
          disabled={isRendering}
          className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg hover:bg-background transition-colors"
        >
          {isRendering ? "Rendering..." : "Download HD"}
        </button>
      )}

      {/* Template name badge */}
      <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
        {template.name}
      </div>
    </div>
  );
};

// Template selector component
interface TemplateSelectorProps {
  templates: DesignTemplate[];
  selectedId: string;
  onSelect: (template: DesignTemplate) => void;
  previewImage?: string;
}

export const TemplateSelector = ({
  templates,
  selectedId,
  onSelect,
  previewImage,
}: TemplateSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={cn(
            "relative rounded-xl overflow-hidden border-2 transition-all duration-300 group",
            selectedId === template.id
              ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
              : "border-border hover:border-primary/50"
          )}
        >
          <DesignPreview
            template={template}
            userImage={previewImage || null}
            size="sm"
            className="w-full"
          />
          
          {/* Selection indicator */}
          {selectedId === template.id && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* Template info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-white text-sm font-medium">{template.name}</p>
            <p className="text-white/70 text-xs">{template.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default DesignPreview;
