import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, Plus, Minus, RotateCw, RefreshCw, Type, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShapeFrame, ProductShape } from "./ShapeMask";
import { cn } from "@/lib/utils";

export interface FrameColorOption {
  id: string;
  name: string;
  value: string;
}
export interface FontOption {
  id: string;
  name: string;
  family: string;
}
export interface BorderStyleOption {
  id: string;
  name: string;
}

export interface PhotoSlot {
  imageDataUrl: string;
  transform: { scale: number; rotate: number; x: number; y: number };
}

interface UploadStageProps {
  shape: ProductShape;
  productName: string;
  photoCount?: number;
  dualBorder?: boolean;
  frameColorOptions?: FrameColorOption[];
  allowedFonts?: FontOption[];
  borderStyles?: BorderStyleOption[];
  allowCustomText?: boolean;
  onSaveAndContinue: (designData: {
    photos: PhotoSlot[];
    /** primary photo data URL for backward compat */
    imageDataUrl: string;
    customText: string;
    fontFamily: string;
    transform: { scale: number; rotate: number; x: number; y: number };
    borderColor: string;
    borderStyleId: string;
  }) => void;
}

const DEFAULT_COLORS: FrameColorOption[] = [
  { id: "black", name: "Black", value: "#0a0a0a" },
  { id: "white", name: "White", value: "#ffffff" },
  { id: "wood", name: "Wood", value: "#8B5A2B" },
  { id: "gold", name: "Gold", value: "#c9a961" },
];
const DEFAULT_FONTS: FontOption[] = [
  { id: "inter", name: "Inter", family: "Inter, sans-serif" },
  { id: "playfair", name: "Playfair", family: "Playfair Display, serif" },
  { id: "pacifico", name: "Pacifico", family: "Pacifico, cursive" },
];

const emptySlot = (): PhotoSlot => ({
  imageDataUrl: "",
  transform: { scale: 1, rotate: 0, x: 0, y: 0 },
});

export const UploadStage = ({
  shape,
  productName,
  photoCount = 1,
  dualBorder = true,
  frameColorOptions,
  allowedFonts,
  borderStyles,
  allowCustomText = true,
  onSaveAndContinue,
}: UploadStageProps) => {
  const colors = frameColorOptions?.length ? frameColorOptions : DEFAULT_COLORS;
  const fonts = allowedFonts?.length ? allowedFonts : DEFAULT_FONTS;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState(0);
  const [slots, setSlots] = useState<PhotoSlot[]>(() =>
    Array.from({ length: Math.max(1, photoCount) }, emptySlot)
  );
  const [customText, setCustomText] = useState("");
  const [showText, setShowText] = useState(false);
  const [borderColor, setBorderColor] = useState(colors[0].value);
  const [borderStyleId, setBorderStyleId] = useState(borderStyles?.[0]?.id || "thin");
  const [fontFamily, setFontFamily] = useState(fonts[0].family);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Re-init slots when photoCount changes
  useEffect(() => {
    setSlots((prev) => {
      const arr = Array.from({ length: Math.max(1, photoCount) }, (_, i) => prev[i] || emptySlot());
      return arr;
    });
    setActiveSlot(0);
  }, [photoCount]);

  const updateActiveSlot = (patch: Partial<PhotoSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === activeSlot ? { ...s, ...patch } : s)));
  };
  const updateActiveTransform = (patch: Partial<PhotoSlot["transform"]>) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === activeSlot ? { ...s, transform: { ...s.transform, ...patch } } : s))
    );
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        updateActiveSlot({
          imageDataUrl: e.target?.result as string,
          transform: { scale: 1, rotate: 0, x: 0, y: 0 },
        });
      };
      reader.readAsDataURL(file);
    },
    [activeSlot]
  );

  const current = slots[activeSlot] || emptySlot();
  const hasAny = slots.every((s) => s.imageDataUrl);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!current.imageDataUrl) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - current.transform.x, y: e.clientY - current.transform.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    updateActiveTransform({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };
  const onMouseUp = () => setDragging(false);

  // Corner-drag resize for the active photo (single-photo preview only)
  const cornerResize = useRef<{ startX: number; startY: number; startScale: number } | null>(null);
  const onCornerResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!current.imageDataUrl) return;
    cornerResize.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScale: current.transform.scale,
    };
    const onMove = (ev: MouseEvent) => {
      if (!cornerResize.current) return;
      const dx = ev.clientX - cornerResize.current.startX;
      const dy = ev.clientY - cornerResize.current.startY;
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      const next = Math.max(0.3, Math.min(4, cornerResize.current.startScale + delta / 150));
      updateActiveTransform({ scale: next });
    };
    const onUp = () => {
      cornerResize.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleSave = () => {
    if (!hasAny) return;
    const primary = slots[0];
    onSaveAndContinue({
      photos: slots,
      imageDataUrl: primary.imageDataUrl,
      customText,
      fontFamily,
      transform: primary.transform,
      borderColor,
      borderStyleId,
    });
  };

  const isCollage = photoCount > 1;
  const gridCols = photoCount === 2 ? "grid-cols-2" : photoCount === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-lg md:text-xl font-semibold text-foreground mb-1">{productName}</h1>
      <nav className="text-xs text-muted-foreground mb-6">
        <span>Home</span> / <span>Acrylic Wall Photo</span>
      </nav>

      {/* Top toolbar — Border color + Border style + Text + Font (DB-driven) */}
      <div className="bg-muted/40 border border-border rounded-lg px-3 py-2 mb-6 flex flex-wrap items-center gap-2 shadow-sm">
        {/* Border color */}
        <div className="relative group">
          <button
            className="w-12 h-11 rounded border border-border bg-card hover:border-coral flex flex-col items-center justify-center"
            title="Border color"
          >
            <div
              className="w-5 h-5 rounded-sm border border-foreground/20"
              style={{ background: borderColor }}
            />
            <span className="text-[8px] text-muted-foreground mt-0.5">Color</span>
          </button>
          <div className="absolute top-full left-0 mt-1 hidden group-hover:flex bg-popover border border-border rounded-md p-2 gap-1 shadow-lg z-20">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setBorderColor(c.value)}
                className={cn(
                  "w-7 h-7 rounded border-2",
                  borderColor === c.value ? "border-coral" : "border-border"
                )}
                style={{ background: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Border style */}
        {borderStyles && borderStyles.length > 0 && (
          <select
            value={borderStyleId}
            onChange={(e) => setBorderStyleId(e.target.value)}
            className="h-11 px-3 rounded border border-border bg-card text-sm hover:border-coral cursor-pointer"
            title="Border style"
          >
            {borderStyles.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {/* Text toggle */}
        {allowCustomText && (
          <>
            <button
              onClick={() => setShowText((v) => !v)}
              className={cn(
                "w-11 h-11 rounded border bg-card hover:border-coral flex items-center justify-center relative",
                showText ? "border-coral text-coral" : "border-border text-foreground"
              )}
              title="Add text"
            >
              <Type className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-coral text-white text-[8px] flex items-center justify-center font-bold">
                +
              </span>
            </button>

            {showText && (
              <>
                <Input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Add text…"
                  maxLength={40}
                  className="h-11 w-44"
                />
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="h-11 px-3 rounded border border-border bg-card text-sm hover:border-coral cursor-pointer"
                  style={{ fontFamily }}
                  title="Font"
                >
                  {fonts.map((f) => (
                    <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </>
        )}
      </div>

      {/* Collage slot tabs */}
      {isCollage && (
        <div className="flex gap-2 mb-4 justify-center">
          {slots.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSlot(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all",
                activeSlot === i
                  ? "bg-coral text-white border-coral"
                  : s.imageDataUrl
                  ? "bg-card border-coral/40 text-coral"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              <ImagePlus className="w-3 h-3" />
              Photo {i + 1}
              {s.imageDataUrl && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            </button>
          ))}
        </div>
      )}

      {/* Frame preview */}
      <div className="flex justify-center mb-6">
        <div className={cn("w-full max-w-md relative", isCollage && "max-w-lg")}>
          {isCollage ? (
            <ShapeFrame shape={shape} borderColor={borderColor} dualBorder={dualBorder}>
              <div className={cn("w-full h-full grid gap-1 bg-[#e8e8e8]", gridCols)}>
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlot(i)}
                    className={cn(
                      "relative overflow-hidden bg-[#dcdcdc] hover:bg-[#cfcfcf]",
                      activeSlot === i && "ring-2 ring-coral ring-inset"
                    )}
                  >
                    {slot.imageDataUrl ? (
                      <img
                        src={slot.imageDataUrl}
                        alt={`slot-${i}`}
                        className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
                        style={{
                          transform: `translate(calc(-50% + ${slot.transform.x}px), calc(-50% + ${slot.transform.y}px)) scale(${slot.transform.scale}) rotate(${slot.transform.rotate}deg)`,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        + Photo {i + 1}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ShapeFrame>
          ) : (
            <ShapeFrame shape={shape} borderColor={borderColor} dualBorder={dualBorder}>
              {!current.imageDataUrl ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex items-center justify-center bg-[#e8e8e8] hover:bg-[#dcdcdc]"
                >
                  <div className="bg-coral hover:bg-coral-dark rounded-lg px-6 py-5 shadow-lg">
                    <div className="text-white font-display font-bold text-lg leading-tight text-center">
                      SELECT<br />PHOTO
                    </div>
                  </div>
                </button>
              ) : (
                <div
                  className="w-full h-full cursor-move select-none relative bg-[#e8e8e8]"
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                >
                  <img
                    src={current.imageDataUrl}
                    alt="custom"
                    draggable={false}
                    className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
                    style={{
                      transform: `translate(calc(-50% + ${current.transform.x}px), calc(-50% + ${current.transform.y}px)) scale(${current.transform.scale}) rotate(${current.transform.rotate}deg)`,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  {customText && (
                    <div
                      className="absolute bottom-6 left-0 right-0 text-center text-white text-2xl pointer-events-none"
                      style={{ textShadow: "0 2px 6px rgba(0,0,0,0.8)", fontFamily }}
                    >
                      {customText}
                    </div>
                  )}
                  {/* Corner-drag resize handles */}
                  {(["nw", "ne", "sw", "se"] as const).map((c) => (
                    <div
                      key={c}
                      onMouseDown={onCornerResizeMouseDown}
                      className={cn(
                        "absolute w-3.5 h-3.5 bg-coral border-2 border-white rounded-sm shadow-md z-10",
                        c === "nw" && "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
                        c === "ne" && "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
                        c === "sw" && "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
                        c === "se" && "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
                      )}
                    />
                  ))}
                </div>
              )}
            </ShapeFrame>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Edit toolbar — for active slot */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          {current.imageDataUrl ? `Change Photo ${isCollage ? activeSlot + 1 : ""}` : `Upload Photo ${isCollage ? activeSlot + 1 : ""}`}
        </Button>
        {current.imageDataUrl && (
          <>
            {/* Size spinner — adjust scale with +/- (matches admin canvas size UX) */}
            <div className="inline-flex items-center h-9 rounded-md border border-input bg-background overflow-hidden">
              <button
                type="button"
                aria-label="Decrease size"
                onClick={() => updateActiveTransform({ scale: Math.max(0.3, +(current.transform.scale - 0.1).toFixed(2)) })}
                className="h-full w-9 flex items-center justify-center hover:bg-muted text-foreground"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-center border-x border-input h-full px-1.5 gap-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={Math.round(current.transform.scale * 100)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    if (raw === "") return;
                    const v = Number(raw);
                    if (!Number.isFinite(v)) return;
                    updateActiveTransform({ scale: +(v / 100).toFixed(2) });
                  }}
                  onBlur={(e) => {
                    const v = Number(e.target.value) || 100;
                    const clamped = Math.max(30, Math.min(400, v));
                    updateActiveTransform({ scale: +(clamped / 100).toFixed(2) });
                  }}
                  className="w-12 h-full bg-transparent text-xs font-medium text-foreground text-center outline-none"
                  aria-label="Size percent"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <button
                type="button"
                aria-label="Increase size"
                onClick={() => updateActiveTransform({ scale: Math.min(4, +(current.transform.scale + 0.1).toFixed(2)) })}
                className="h-full w-9 flex items-center justify-center hover:bg-muted text-foreground"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Rotation spinner — adjust by 15° steps */}
            <div className="inline-flex items-center h-9 rounded-md border border-input bg-background overflow-hidden">
              <button
                type="button"
                aria-label="Rotate left"
                onClick={() => updateActiveTransform({ rotate: current.transform.rotate - 1 })}
                className="h-full w-9 flex items-center justify-center hover:bg-muted text-foreground"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-center border-x border-input h-full px-1.5 gap-1">
                <RotateCw className="w-3 h-3 text-muted-foreground" />
                <input
                  type="number"
                  min={-360}
                  max={360}
                  value={(((current.transform.rotate % 360) + 360) % 360)}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isFinite(v)) return;
                    updateActiveTransform({ rotate: v });
                  }}
                  className="w-12 h-full bg-transparent text-xs font-medium text-foreground text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Rotation degrees"
                />
                <span className="text-xs text-muted-foreground">°</span>
              </div>
              <button
                type="button"
                aria-label="Rotate right"
                onClick={() => updateActiveTransform({ rotate: current.transform.rotate + 1 })}
                className="h-full w-9 flex items-center justify-center hover:bg-muted text-foreground"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateActiveTransform({ scale: 1, rotate: 0, x: 0, y: 0 })}
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateActiveSlot({ imageDataUrl: "" })}
            >
              <X className="w-4 h-4" /> Clear
            </Button>
          </>
        )}
      </div>

      {/* Save & continue */}
      <button
        disabled={!hasAny}
        onClick={handleSave}
        className={cn(
          "w-full py-4 rounded-md font-display text-lg font-bold text-white transition-all",
          hasAny
            ? "bg-coral hover:bg-coral-dark shadow-lg hover:shadow-xl"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        Save &amp; select Size →
      </button>

      {!hasAny && (
        <p className="text-xs text-center text-muted-foreground mt-3">
          {isCollage ? `Upload all ${photoCount} photos to continue` : "Upload a photo to continue"}
        </p>
      )}
    </div>
  );
};
