import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Plus, Minus, RotateCw, RefreshCw, X, ImagePlus, Wand2, Loader2, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { captureDesignFromDOM } from "@/lib/captureDesign";

export interface PhotoSlot {
  id: string;
  x: number;       // 0-1 normalized
  y: number;       // 0-1
  width: number;   // 0-1
  height: number;  // 0-1
  shape: "rect" | "circle" | "rounded";
  rotation: number;
}

export interface SlotPhoto {
  imageDataUrl: string;
  transform: { scale: number; rotate: number; x: number; y: number };
}

// Mirrors admin DesignLayer so we can honor per-layer customer permissions
interface CustomerPermissions {
  replaceImage?: boolean;
  editText?: boolean;
  changeColor?: boolean;
  move?: boolean;
  resize?: boolean;
}
type EditableLayer =
  | {
      id: string;
      type: "image";
      src: string;
      x: number; y: number; w: number; h: number;
      rotation: number;
      opacity?: number;
      visible?: boolean;
      locked?: boolean;
      customerCan?: CustomerPermissions;
    }
  | {
      id: string;
      type: "text";
      text: string;
      font: string;
      color: string;
      fontSizePct: number;
      fontWeight: number;
      align: "left" | "center" | "right";
      x: number; y: number; w: number; h: number;
      rotation: number;
      visible?: boolean;
      locked?: boolean;
      customerCan?: CustomerPermissions;
    }
  | {
      id: string;
      type: "photo-slot";
      x: number; y: number; w: number; h: number;
      rotation: number;
      visible?: boolean;
      locked?: boolean;
      customerCan?: CustomerPermissions;
    };

interface TemplateCustomizerProps {
  templateImageUrl: string;
  slots: PhotoSlot[];
  productName: string;
  /** Optional: full design layer list — enables per-layer customer permissions (text edit, color, image swap) */
  layers?: EditableLayer[];
  /** Receives the COMPOSITE image (template + photos baked) plus per-slot photos */
  onSaveAndContinue: (compositeDataUrl: string, photos: SlotPhoto[]) => void;
}

const emptyPhoto = (): SlotPhoto => ({
  imageDataUrl: "",
  transform: { scale: 1, rotate: 0, x: 0, y: 0 },
});

const PALETTE = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#1d1d1f", "#6b7280", "#b91c1c", "#ca8a04", "#15803d",
];

export const TemplateCustomizer = ({
  templateImageUrl,
  slots,
  productName,
  layers,
  onSaveAndContinue,
}: TemplateCustomizerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layerImageInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlot, setActiveSlot] = useState(0);
  const [photos, setPhotos] = useState<SlotPhoto[]>(() =>
    slots.map(() => emptyPhoto())
  );
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  // Editable layer overrides (text content, color, image src) keyed by layer id
  type LayerOverride = { text?: string; color?: string; src?: string };
  const [overrides, setOverrides] = useState<Record<string, LayerOverride>>({});
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const activeImageReplaceLayerRef = useRef<string | null>(null);

  // Filter to layers customers may interact with (text edit/color, image replace)
  const editableLayers = useMemo(() => {
    if (!layers) return [];
    return layers.filter((l) => {
      if (l.visible === false) return false;
      const can = l.customerCan;
      if (!can) return false;
      if (l.type === "text" && (can.editText || can.changeColor)) return true;
      if (l.type === "image" && can.replaceImage) return true;
      return false;
    });
  }, [layers]);

  // Layers (image/text) that sit ABOVE at least one photo-slot in the admin layer
  // stack — these must visually overlay the customer-uploaded photo to preserve
  // the admin's z-order (e.g. butterflies/flowers placed on top of the photo frame).
  const overlayLayers = useMemo(() => {
    if (!layers || layers.length === 0) return [];
    const firstSlotIdx = layers.findIndex((l) => l.type === "photo-slot");
    if (firstSlotIdx === -1) return [];
    const editableIds = new Set(editableLayers.map((l) => l.id));
    return layers
      .slice(firstSlotIdx + 1)
      .filter(
        (l) =>
          (l.type === "image" || l.type === "text") &&
          l.visible !== false &&
          !editableIds.has(l.id) // editable ones are rendered separately on top
      );
  }, [layers, editableLayers]);

  const activeLayer = editableLayers.find((l) => l.id === activeLayerId) ?? null;

  const setOverride = (id: string, patch: LayerOverride) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const resolvedText = (l: Extract<EditableLayer, { type: "text" }>) =>
    overrides[l.id]?.text ?? l.text;
  const resolvedColor = (l: Extract<EditableLayer, { type: "text" }>) =>
    overrides[l.id]?.color ?? l.color;
  const resolvedSrc = (l: Extract<EditableLayer, { type: "image" }>) =>
    overrides[l.id]?.src ?? l.src;

  const handleSave = async () => {
    if (!allFilled || saving) return;
    try {
      setSaving(true);
      setProgress(0);
      const node = containerRef.current;
      if (!node) throw new Error("Preview not ready");

      node.classList.add("capturing");
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const composite = await captureDesignFromDOM(node, (p) =>
        setProgress(Math.round(p * 100))
      );

      node.classList.remove("capturing");
      onSaveAndContinue(composite, photos);
    } catch (err) {
      console.error("Capture failed:", err);
      const node = containerRef.current;
      if (node) node.classList.remove("capturing");
      onSaveAndContinue(photos[0]?.imageDataUrl || "", photos);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setPhotos(slots.map(() => emptyPhoto()));
    setActiveSlot(0);
  }, [slots.length]);

  const updatePhoto = (i: number, patch: Partial<SlotPhoto>) =>
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const updateActiveTransform = (patch: Partial<SlotPhoto["transform"]>) =>
    setPhotos((prev) =>
      prev.map((p, idx) =>
        idx === activeSlot ? { ...p, transform: { ...p.transform, ...patch } } : p
      )
    );

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updatePhoto(activeSlot, {
        imageDataUrl: e.target?.result as string,
        transform: { scale: 1, rotate: 0, x: 0, y: 0 },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLayerImageReplace = (file: File) => {
    const id = activeImageReplaceLayerRef.current;
    if (!id) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => setOverride(id, { src: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const allFilled = photos.every((p) => p.imageDataUrl);
  const current = photos[activeSlot];

  const onSlotMouseDown = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    // Only start a drag here when the slot already has a photo. For empty
    // slots we open the file chooser from the click handler instead, because
    // some browsers (notably Safari/iOS) block file dialogs opened from
    // mousedown events without a true user-gesture click.
    if (!photos[idx].imageDataUrl) {
      setActiveSlot(idx);
      return;
    }
    setActiveSlot(idx);
    setDragging(true);
    dragStart.current = {
      x: e.clientX - photos[idx].transform.x,
      y: e.clientY - photos[idx].transform.y,
    };
  };
  const onSlotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (!photos[idx].imageDataUrl) {
      setActiveSlot(idx);
      // Reset the input so selecting the same file twice still fires onChange
      if (fileInputRef.current) fileInputRef.current.value = "";
      fileInputRef.current?.click();
    }
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    updateActiveTransform({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };
  const onMouseUp = () => setDragging(false);

  // Corner-drag resize: scale the active photo by dragging any corner handle
  const cornerResize = useRef<{ startX: number; startY: number; startScale: number } | null>(null);
  const onCornerResizeMouseDown = (e: React.MouseEvent, _corner: "nw" | "ne" | "sw" | "se") => {
    e.stopPropagation();
    e.preventDefault();
    if (!photos[activeSlot]?.imageDataUrl) return;
    cornerResize.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScale: photos[activeSlot].transform.scale,
    };
    const onMove = (ev: MouseEvent) => {
      if (!cornerResize.current) return;
      const dx = ev.clientX - cornerResize.current.startX;
      const dy = ev.clientY - cornerResize.current.startY;
      // Use the larger axis for intuitive proportional resize
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

  if (!slots || slots.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 bg-muted/40 rounded-lg border border-dashed border-border">
        <Wand2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          Photo slots not detected yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Admin needs to run "Auto-detect Photo Slots" on this product so customers can upload their photos in the right places.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-lg md:text-xl font-semibold text-foreground mb-1">{productName}</h1>
      <nav className="text-xs text-muted-foreground mb-4">
        <span>Home</span> / <span>Acrylic Wall Photo</span>
      </nav>

      {/* Slot tabs */}
      {slots.length > 1 && (
        <div className="flex gap-2 mb-4 justify-center flex-wrap">
          {slots.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSlot(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all",
                activeSlot === i
                  ? "bg-coral text-white border-coral"
                  : photos[i]?.imageDataUrl
                  ? "bg-card border-coral/40 text-coral"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              <ImagePlus className="w-3 h-3" />
              Photo {i + 1}
              {photos[i]?.imageDataUrl && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            </button>
          ))}
        </div>
      )}

      {/* Template + slot overlays */}
      <div className="flex justify-center mb-6">
        <div
          ref={containerRef}
          className="relative w-full max-w-md select-none rounded-lg overflow-hidden shadow-xl bg-muted"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Background template (decoration with placeholders) */}
          <img
            src={templateImageUrl}
            alt={productName}
            className="w-full h-auto block pointer-events-none"
            draggable={false}
          />

          {/* Editable layer overlays — only those the admin marked as customer-editable.
              Positioned identically to the baked-in layer so they cover it seamlessly. */}
          {editableLayers.map((l) => {
            const isActive = activeLayerId === l.id;
            return (
              <div
                key={`ov-${l.id}`}
                data-editor-chrome="true"
                onClick={(e) => { e.stopPropagation(); setActiveLayerId(l.id); }}
                className={cn(
                  "absolute cursor-pointer transition-all",
                  isActive ? "ring-2 ring-coral ring-offset-1" : "ring-1 ring-coral/40 hover:ring-coral",
                )}
                style={{
                  left: `${l.x * 100}%`,
                  top: `${l.y * 100}%`,
                  width: `${l.w * 100}%`,
                  height: `${l.h * 100}%`,
                  transform: l.rotation ? `rotate(${l.rotation}deg)` : undefined,
                  transformOrigin: "center",
                }}
              >
                {l.type === "text" && (
                  <div
                    className="w-full h-full flex items-center pointer-events-none"
                    style={{
                      justifyContent:
                        l.align === "left" ? "flex-start" : l.align === "right" ? "flex-end" : "center",
                      fontFamily: l.font,
                      color: resolvedColor(l),
                      fontWeight: l.fontWeight,
                      fontSize: `${l.fontSizePct}cqh`,
                      textAlign: l.align,
                      lineHeight: 1.1,
                      containerType: "size",
                    }}
                  >
                    <span>{resolvedText(l) || " "}</span>
                  </div>
                )}
                {l.type === "image" && (
                  <img
                    src={resolvedSrc(l)}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none"
                    style={{ opacity: l.opacity ?? 1 }}
                  />
                )}
              </div>
            );
          })}

          {/* Photo slot overlays */}
          {slots.map((slot, i) => {
            const photo = photos[i];
            const isActive = activeSlot === i;
            const radius =
              slot.shape === "circle"
                ? "50%"
                : slot.shape === "rounded"
                ? "12%"
                : "0";

            return (
              <div
                key={slot.id}
                data-editor-chrome="true"
                onMouseDown={(e) => onSlotMouseDown(e, i)}
                onClick={(e) => onSlotClick(e, i)}
                className={cn(
                  "absolute overflow-hidden cursor-pointer transition-all",
                  isActive
                    ? "ring-2 ring-coral ring-offset-1"
                    : photo?.imageDataUrl
                    ? "ring-1 ring-coral/30 hover:ring-coral"
                    : "ring-2 ring-dashed ring-coral/60 hover:ring-coral bg-coral/10"
                )}
                style={{
                  left: `${slot.x * 100}%`,
                  top: `${slot.y * 100}%`,
                  width: `${slot.width * 100}%`,
                  height: `${slot.height * 100}%`,
                  borderRadius: radius,
                  transform: slot.rotation ? `rotate(${slot.rotation}deg)` : undefined,
                  transformOrigin: "center",
                }}
              >
                {photo?.imageDataUrl ? (
                  <>
                    <img
                      src={photo.imageDataUrl}
                      alt={`slot-${i + 1}`}
                      draggable={false}
                      className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
                      style={{
                        transform: `translate(calc(-50% + ${photo.transform.x}px), calc(-50% + ${photo.transform.y}px)) scale(${photo.transform.scale}) rotate(${photo.transform.rotate}deg)`,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                    {isActive && (
                      <>
                        {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                          <div
                            key={corner}
                            data-editor-chrome="true"
                            onMouseDown={(e) => onCornerResizeMouseDown(e, corner)}
                            className={cn(
                              "absolute w-3.5 h-3.5 bg-coral border-2 border-white rounded-sm shadow-md z-10",
                              corner === "nw" && "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
                              corner === "ne" && "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
                              corner === "sw" && "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
                              corner === "se" && "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
                            )}
                          />
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <div className="editor-only absolute inset-0 flex flex-col items-center justify-center text-coral pointer-events-none">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      Upload {slots.length > 1 ? `#${i + 1}` : "Photo"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Decorative overlay layers — image/text layers that sit ABOVE photo
              slots in the admin layer stack. Re-rendered here (in addition to
              being baked in the template) so they correctly overlay the
              customer-uploaded photo, preserving the admin's z-order. */}
          {overlayLayers.map((l) => (
            <div
              key={`top-${l.id}`}
              className="absolute pointer-events-none"
              style={{
                left: `${l.x * 100}%`,
                top: `${l.y * 100}%`,
                width: `${l.w * 100}%`,
                height: `${l.h * 100}%`,
                transform: l.rotation ? `rotate(${l.rotation}deg)` : undefined,
                transformOrigin: "center",
                opacity: (l as any).opacity ?? 1,
              }}
            >
              {l.type === "image" && (
                <img
                  src={l.src}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-contain"
                />
              )}
              {l.type === "text" && (
                <div
                  className="w-full h-full flex items-center"
                  style={{
                    justifyContent:
                      l.align === "left" ? "flex-start" : l.align === "right" ? "flex-end" : "center",
                    fontFamily: l.font,
                    color: l.color,
                    fontWeight: l.fontWeight,
                    fontSize: `${l.fontSizePct}cqh`,
                    textAlign: l.align,
                    lineHeight: 1.1,
                    containerType: "size",
                  }}
                >
                  <span>{l.text || " "}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={layerImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleLayerImageReplace(e.target.files[0])}
      />

      {/* Editable layer panel — appears when a customer-editable layer is selected */}
      {activeLayer && (
        <div className="mb-4 rounded-lg border-2 border-coral/40 bg-coral/5 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              {activeLayer.type === "text" ? <Type className="w-4 h-4 text-coral" /> : <ImagePlus className="w-4 h-4 text-coral" />}
              Personalize this {activeLayer.type === "text" ? "text" : "image"}
            </div>
            <button onClick={() => setActiveLayerId(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeLayer.type === "text" && activeLayer.customerCan?.editText && (
            <div>
              <label className="text-xs text-muted-foreground">Your text</label>
              <Input
                value={resolvedText(activeLayer)}
                onChange={(e) => setOverride(activeLayer.id, { text: e.target.value })}
                placeholder="Enter your text"
                maxLength={120}
              />
            </div>
          )}

          {activeLayer.type === "text" && activeLayer.customerCan?.changeColor && (
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Palette className="w-3 h-3" /> Text color
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setOverride(activeLayer.id, { color: c })}
                    className={cn(
                      "w-6 h-6 rounded-md border transition-transform hover:scale-110",
                      resolvedColor(activeLayer).toLowerCase() === c.toLowerCase()
                        ? "ring-2 ring-coral ring-offset-1"
                        : "border-border"
                    )}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  value={resolvedColor(activeLayer)}
                  onChange={(e) => setOverride(activeLayer.id, { color: e.target.value })}
                  className="w-6 h-6 rounded-md border border-border cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>
          )}

          {activeLayer.type === "image" && activeLayer.customerCan?.replaceImage && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                activeImageReplaceLayerRef.current = activeLayer.id;
                layerImageInputRef.current?.click();
              }}
            >
              <Upload className="w-4 h-4 mr-1" /> Replace this image
            </Button>
          )}
        </div>
      )}

      {/* Edit toolbar for active slot */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <Button variant="outline" size="sm" onClick={() => {
          if (fileInputRef.current) fileInputRef.current.value = "";
          fileInputRef.current?.click();
        }}>
          <Upload className="w-4 h-4" />
          {current?.imageDataUrl
            ? `Change Photo ${slots.length > 1 ? activeSlot + 1 : ""}`
            : `Upload Photo ${slots.length > 1 ? activeSlot + 1 : ""}`}
        </Button>
        {current?.imageDataUrl && (
          <>
            {/* Size spinner — same UX as admin canvas size input (+/- with manual entry) */}
            <div className="inline-flex items-center h-9 rounded-md border border-input bg-background overflow-hidden">
              <button
                type="button"
                aria-label="Decrease size"
                onClick={() =>
                  updateActiveTransform({ scale: Math.max(0.3, +(current.transform.scale - 0.1).toFixed(2)) })
                }
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
                onClick={() =>
                  updateActiveTransform({ scale: Math.min(4, +(current.transform.scale + 0.1).toFixed(2)) })
                }
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
              onClick={() => updatePhoto(activeSlot, { imageDataUrl: "" })}
            >
              <X className="w-4 h-4" /> Clear
            </Button>
          </>
        )}
      </div>

      <button
        disabled={!allFilled || saving}
        onClick={handleSave}
        className={cn(
          "w-full py-4 rounded-md font-display text-lg font-bold text-white transition-all",
          allFilled && !saving
            ? "bg-coral hover:bg-coral-dark shadow-lg hover:shadow-xl"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {saving ? "Saving Design…" : "Save & select Size →"}
      </button>
      {!allFilled && !saving && (
        <p className="text-xs text-center text-muted-foreground mt-3">
          {slots.length > 1
            ? `Upload all ${slots.length} photos to continue`
            : "Upload a photo to continue"}
        </p>
      )}

      {/* Real progress modal */}
      {saving && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-foreground">Saving Design</h3>
              <span className="text-sm font-bold text-coral">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-coral transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Composing your design at high resolution…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
