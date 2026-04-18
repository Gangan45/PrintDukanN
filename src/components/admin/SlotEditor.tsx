import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, RotateCw, Square, Circle as CircleIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PhotoSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle" | "rounded";
  rotation: number;
}

interface SlotEditorProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  productId: string;
  productName: string;
  imageUrl: string;
  initialSlots: PhotoSlot[];
  onSaved?: () => void;
}

type DragMode = null | "move" | "nw" | "ne" | "sw" | "se";

const SlotEditor = ({ open, onOpenChange, productId, productName, imageUrl, initialSlots, onSaved }: SlotEditorProps) => {
  const [slots, setSlots] = useState<PhotoSlot[]>(initialSlots);
  const [selectedId, setSelectedId] = useState<string | null>(initialSlots[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: DragMode; id: string; startX: number; startY: number; orig: PhotoSlot } | null>(null);

  useEffect(() => {
    if (open) {
      setSlots(initialSlots);
      setSelectedId(initialSlots[0]?.id ?? null);
    }
  }, [open, initialSlots]);

  const selected = slots.find((s) => s.id === selectedId) ?? null;

  const updateSlot = useCallback((id: string, patch: Partial<PhotoSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const onPointerDown = (e: React.PointerEvent, id: string, mode: DragMode) => {
    e.stopPropagation();
    e.preventDefault();
    const slot = slots.find((s) => s.id === id);
    if (!slot || !containerRef.current) return;
    setSelectedId(id);
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = {
      mode,
      id,
      startX: (e.clientX - rect.left) / rect.width,
      startY: (e.clientY - rect.top) / rect.height,
      orig: { ...slot },
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const dx = nx - drag.startX;
    const dy = ny - drag.startY;
    const o = drag.orig;
    let next: Partial<PhotoSlot> = {};
    const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
    if (drag.mode === "move") {
      next = {
        x: clamp(o.x + dx, 0, 1 - o.width),
        y: clamp(o.y + dy, 0, 1 - o.height),
      };
    } else if (drag.mode === "se") {
      next = { width: clamp(o.width + dx, 0.02, 1 - o.x), height: clamp(o.height + dy, 0.02, 1 - o.y) };
    } else if (drag.mode === "nw") {
      const newW = clamp(o.width - dx, 0.02, o.x + o.width);
      const newH = clamp(o.height - dy, 0.02, o.y + o.height);
      next = { x: o.x + (o.width - newW), y: o.y + (o.height - newH), width: newW, height: newH };
    } else if (drag.mode === "ne") {
      const newW = clamp(o.width + dx, 0.02, 1 - o.x);
      const newH = clamp(o.height - dy, 0.02, o.y + o.height);
      next = { y: o.y + (o.height - newH), width: newW, height: newH };
    } else if (drag.mode === "sw") {
      const newW = clamp(o.width - dx, 0.02, o.x + o.width);
      const newH = clamp(o.height + dy, 0.02, 1 - o.y);
      next = { x: o.x + (o.width - newW), width: newW, height: newH };
    }
    updateSlot(drag.id, next);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const addSlot = () => {
    const id = `slot-${slots.length + 1}-${Date.now()}`;
    const ns: PhotoSlot = { id, x: 0.35, y: 0.35, width: 0.3, height: 0.3, shape: "rect", rotation: 0 };
    setSlots((p) => [...p, ns]);
    setSelectedId(id);
  };

  const deleteSlot = (id: string) => {
    setSlots((p) => p.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    // Re-id sequentially for clean output
    const cleaned = slots.map((s, i) => ({ ...s, id: `slot-${i + 1}` }));
    const { error } = await supabase
      .from("products")
      .update({ photo_slots: cleaned, photo_count: Math.max(1, cleaned.length) })
      .eq("id", productId);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Slots saved", description: `${cleaned.length} slot${cleaned.length !== 1 ? "s" : ""} updated.` });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Photo Slots — {productName}</DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Canvas */}
          <div
            ref={containerRef}
            className="relative w-full bg-muted rounded-lg overflow-hidden select-none touch-none"
            style={{ aspectRatio: "1 / 1" }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <img src={imageUrl} alt={productName} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            {slots.map((s) => {
              const isSel = s.id === selectedId;
              const radius = s.shape === "circle" ? "50%" : s.shape === "rounded" ? "12px" : "0";
              return (
                <div
                  key={s.id}
                  onPointerDown={(e) => onPointerDown(e, s.id, "move")}
                  className={`absolute cursor-move ${isSel ? "ring-2 ring-coral" : "ring-1 ring-coral/60"}`}
                  style={{
                    left: `${s.x * 100}%`,
                    top: `${s.y * 100}%`,
                    width: `${s.width * 100}%`,
                    height: `${s.height * 100}%`,
                    transform: `rotate(${s.rotation}deg)`,
                    transformOrigin: "center",
                    background: isSel ? "hsl(var(--coral) / 0.18)" : "hsl(var(--coral) / 0.08)",
                    borderRadius: radius,
                  }}
                >
                  <span className="absolute -top-6 left-0 text-xs font-semibold bg-coral text-white px-2 py-0.5 rounded">
                    {s.id}
                  </span>
                  {isSel && s.shape !== "circle" && (
                    <>
                      {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                        <div
                          key={corner}
                          onPointerDown={(e) => onPointerDown(e, s.id, corner)}
                          className="absolute h-3 w-3 bg-coral border-2 border-white rounded-sm"
                          style={{
                            cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                            top: corner.startsWith("n") ? -6 : "auto",
                            bottom: corner.startsWith("s") ? -6 : "auto",
                            left: corner.endsWith("w") ? -6 : "auto",
                            right: corner.endsWith("e") ? -6 : "auto",
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={addSlot} variant="outline" className="flex-1 gap-1">
                <Plus className="h-4 w-4" /> Add slot
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 gap-1">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {slots.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground text-center">No slots. Click "Add slot".</div>
              )}
              {slots.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left p-2 flex items-center justify-between text-sm hover:bg-muted ${
                    selectedId === s.id ? "bg-coral/10 text-coral font-semibold" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {s.shape === "circle" ? <CircleIcon className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                    {s.id}
                  </span>
                  <Trash2
                    className="h-4 w-4 text-destructive opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlot(s.id);
                    }}
                  />
                </button>
              ))}
            </div>

            {selected && (
              <div className="space-y-3 border rounded-lg p-3 bg-card">
                <div className="text-sm font-semibold">Selected: {selected.id}</div>

                <div>
                  <label className="text-xs text-muted-foreground">Shape</label>
                  <Select
                    value={selected.shape}
                    onValueChange={(v) => updateSlot(selected.id, { shape: v as PhotoSlot["shape"] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rect">Rectangle</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <RotateCw className="h-3 w-3" /> Rotation: {selected.rotation}°
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={selected.rotation}
                    onChange={(e) => updateSlot(selected.id, { rotation: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-muted-foreground">X: {(selected.x * 100).toFixed(1)}%</label>
                    <input type="range" min={0} max={1} step={0.001} value={selected.x}
                      onChange={(e) => updateSlot(selected.id, { x: Math.min(Number(e.target.value), 1 - selected.width) })}
                      className="w-full" />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Y: {(selected.y * 100).toFixed(1)}%</label>
                    <input type="range" min={0} max={1} step={0.001} value={selected.y}
                      onChange={(e) => updateSlot(selected.id, { y: Math.min(Number(e.target.value), 1 - selected.height) })}
                      className="w-full" />
                  </div>
                  <div>
                    <label className="text-muted-foreground">W: {(selected.width * 100).toFixed(1)}%</label>
                    <input type="range" min={0.02} max={1} step={0.001} value={selected.width}
                      onChange={(e) => updateSlot(selected.id, { width: Math.min(Number(e.target.value), 1 - selected.x) })}
                      className="w-full" />
                  </div>
                  <div>
                    <label className="text-muted-foreground">H: {(selected.height * 100).toFixed(1)}%</label>
                    <input type="range" min={0.02} max={1} step={0.001} value={selected.height}
                      onChange={(e) => updateSlot(selected.id, { height: Math.min(Number(e.target.value), 1 - selected.y) })}
                      className="w-full" />
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Drag boxes to move, drag corner handles to resize. Use the rotation slider for tilted slots.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlotEditor;
